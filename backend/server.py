from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from groq import AsyncGroq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq client (FREE - Llama 3.3 70B)
groq_client = AsyncGroq(api_key=os.environ.get('GROQ_API_KEY'))

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Models ---
class LensSelection(BaseModel):
    name: str
    category: str

class RunExperimentRequest(BaseModel):
    dilemma: str
    lenses: List[LensSelection]

class FollowUpRequest(BaseModel):
    action: str  # "deeper", "counter", "decide"
    lens_name: Optional[str] = None
    user_message: Optional[str] = None

class ExperimentResponse(BaseModel):
    id: str
    dilemma: str
    lenses: List[dict]
    frames: List[dict]
    synthesis: str
    follow_ups: List[dict] = []
    created_at: str

# --- LLM Helper ---
async def call_llm(system_message: str, user_message: str):
    chat_completion = await groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.8,
        max_tokens=4096,
    )
    return chat_completion.choices[0].message.content

def build_experiment_prompt(dilemma: str, lenses: List[LensSelection]) -> str:
    lens_names = ", ".join([lens.name for lens in lenses])
    return (
        f'You are a brilliant philosophy tutor and warm practical life coach. '
        f'The user has a real dilemma: "{dilemma}". '
        f'Apply each thought experiment framework below specifically to this dilemma. '
        f'For each one write 3-5 sentences. Be concrete: reference their actual situation, not generic philosophy. '
        f'Start with a vivid scenario or provocative angle. Add philosophical depth. '
        f'End with one pointed question the user should sit with. '
        f'Be direct, warm, and insightful - never academic or preachy. '
        f'Frameworks: {lens_names}. '
        f'Respond with ONLY valid JSON: '
        f'{{"frames":[{{"name":"framework name","insight":"3-5 sentence insight"}}],'
        f'"synthesis":"2-3 sentences synthesizing what these lenses collectively reveal"}}'
    )

def build_deeper_prompt(dilemma: str, frame_name: str, original_insight: str) -> str:
    return (
        f'You are a brilliant philosophy tutor and warm practical life coach. '
        f'The user has a dilemma: "{dilemma}". '
        f'You previously analyzed it through the "{frame_name}" lens and said: "{original_insight}" '
        f'Now go MUCH deeper on this specific framework. Explore the nuances, tensions, and hidden layers. '
        f'Write 5-8 sentences. Be concrete, reference their actual situation. Push the analysis further. '
        f'End with a deeper, more challenging question. '
        f'Respond with ONLY valid JSON: {{"name":"{frame_name}","deeper_insight":"your deeper analysis","question":"your deeper question"}}'
    )

def build_counter_prompt(dilemma: str, frames: list, synthesis: str) -> str:
    insights_text = "; ".join([f'{f["name"]}: {f["insight"]}' for f in frames])
    return (
        f'You are a brilliant devil\'s advocate and critical thinker. '
        f'The user has a dilemma: "{dilemma}". '
        f'Previous analysis said: {insights_text}. Synthesis: {synthesis}. '
        f'Now CHALLENGE every single insight. Play devil\'s advocate. '
        f'For each framework, present the strongest counter-argument in 2-3 sentences. '
        f'Be provocative but fair. Show what the original analysis missed or got wrong. '
        f'End with a revised synthesis that accounts for these counter-arguments. '
        f'Respond with ONLY valid JSON: {{"counters":[{{"name":"framework name","counter":"counter argument"}}],'
        f'"revised_synthesis":"2-3 sentences revised synthesis"}}'
    )

def build_decide_prompt(dilemma: str, frames: list, synthesis: str, follow_ups: list) -> str:
    context_parts = [f'{f["name"]}: {f["insight"]}' for f in frames]
    context = "; ".join(context_parts)
    followup_context = ""
    if follow_ups:
        followup_context = " Additional analysis: " + "; ".join([json.dumps(f.get("data", {})) for f in follow_ups])
    return (
        f'You are a warm, decisive life coach who helps people make clear decisions. '
        f'The user has a dilemma: "{dilemma}". '
        f'You\'ve already explored it: {context}. Synthesis: {synthesis}.{followup_context} '
        f'Now help them DECIDE. Be direct and personal. '
        f'Give a clear recommendation with 3 concrete reasons. '
        f'Acknowledge what they\'ll sacrifice with this choice. '
        f'End with an empowering statement about their ability to handle this. '
        f'Respond with ONLY valid JSON: {{"recommendation":"your clear recommendation",'
        f'"reasons":["reason 1","reason 2","reason 3"],'
        f'"sacrifice":"what they give up","empowerment":"empowering closing statement"}}'
    )

# --- Endpoints ---
@api_router.get("/")
async def root():
    return {"message": "Thought Experiment Lab API"}

@api_router.post("/experiments/run")
async def run_experiment(req: RunExperimentRequest):
    if len(req.lenses) < 2 or len(req.lenses) > 5:
        raise HTTPException(status_code=400, detail="Select 2-5 lenses")

    experiment_id = str(uuid.uuid4())
    prompt = build_experiment_prompt(req.dilemma, req.lenses)

    try:
        raw_response = await call_llm(
            "You are a JSON-only responder. Return only valid JSON, no markdown, no code fences.",
            prompt
        )
        # Parse response - strip markdown fences if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        
        result = json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"LLM response parse error: {e}, raw: {raw_response if 'raw_response' in dir() else 'N/A'}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")

    doc = {
        "id": experiment_id,
        "dilemma": req.dilemma,
        "lenses": [lens.model_dump() for lens in req.lenses],
        "frames": result.get("frames", []),
        "synthesis": result.get("synthesis", ""),
        "follow_ups": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.experiments.insert_one(doc)

    return {
        "id": experiment_id,
        "dilemma": req.dilemma,
        "lenses": doc["lenses"],
        "frames": doc["frames"],
        "synthesis": doc["synthesis"],
        "follow_ups": [],
        "created_at": doc["created_at"]
    }

@api_router.post("/experiments/{experiment_id}/followup")
async def followup_experiment(experiment_id: str, req: FollowUpRequest):
    doc = await db.experiments.find_one({"id": experiment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if req.action == "deeper":
        if not req.lens_name:
            raise HTTPException(status_code=400, detail="Specify lens_name for deeper analysis")
        frame = next((f for f in doc["frames"] if f["name"].lower() == req.lens_name.lower()), None)
        if not frame:
            raise HTTPException(status_code=404, detail=f"Lens '{req.lens_name}' not found in results")
        prompt = build_deeper_prompt(doc["dilemma"], frame["name"], frame["insight"])
    elif req.action == "counter":
        prompt = build_counter_prompt(doc["dilemma"], doc["frames"], doc["synthesis"])
    elif req.action == "decide":
        prompt = build_decide_prompt(doc["dilemma"], doc["frames"], doc["synthesis"], doc.get("follow_ups", []))
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use: deeper, counter, decide")

    try:
        raw_response = await call_llm(
            "You are a JSON-only responder. Return only valid JSON, no markdown, no code fences.",
            prompt
        )
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        result = json.loads(cleaned)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"Followup LLM parse error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")

    followup_entry = {
        "id": str(uuid.uuid4()),
        "action": req.action,
        "lens_name": req.lens_name,
        "data": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.experiments.update_one(
        {"id": experiment_id},
        {"$push": {"follow_ups": followup_entry}}
    )

    return followup_entry

@api_router.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    doc = await db.experiments.find_one({"id": experiment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return doc

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
