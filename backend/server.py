import json
import logging
import os
import re
import time
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request
from groq import AsyncGroq
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MODEL_NAME = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_DILEMMA_CHARS = int(os.environ.get("MAX_DILEMMA_CHARS", "1600"))
MAX_FOLLOWUPS = int(os.environ.get("MAX_FOLLOWUPS", "4"))
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "900"))
RATE_LIMITS = {
    "preflight": int(os.environ.get("RATE_LIMIT_PREFLIGHT", "24")),
    "run": int(os.environ.get("RATE_LIMIT_RUN", "12")),
    "followup": int(os.environ.get("RATE_LIMIT_FOLLOWUP", "20")),
    "resolve": int(os.environ.get("RATE_LIMIT_RESOLVE", "16")),
    "read": int(os.environ.get("RATE_LIMIT_READ", "60")),
}

SELF_HARM_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"\bkill myself\b",
        r"\bend my life\b",
        r"\bwant to die\b",
        r"\bwanting to die\b",
        r"\bsuicid(?:e|al)\b",
        r"\bhurt myself\b",
        r"\bself[- ]harm\b",
        r"\boverdose\b",
        r"\bcut myself\b",
        r"\bno reason to live\b",
    ]
]

VIOLENCE_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"\bkill (him|her|them|someone|myself)?\b",
        r"\bhurt (him|her|them|someone)\b",
        r"\bshoot (him|her|them|someone)\b",
        r"\bstab (him|her|them|someone)\b",
        r"\bviolent urge\b",
        r"\bwant to hurt someone\b",
    ]
]

client: Optional[AsyncIOMotorClient] = None
db = None
groq_client: Optional[AsyncGroq] = None
request_buckets = defaultdict(list)

app = FastAPI(title="Thought Experiment Lab API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class LensSelection(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=40)


class RunExperimentRequest(BaseModel):
    dilemma: str = Field(min_length=12, max_length=MAX_DILEMMA_CHARS)
    lenses: list[LensSelection]
    lenses_source: Optional[Literal["suggested", "manual"]] = None


class PreflightExperimentRequest(BaseModel):
    dilemma: str = Field(min_length=12, max_length=MAX_DILEMMA_CHARS)


class FollowUpRequest(BaseModel):
    action: Literal["deeper", "counter", "decide"]
    lens_name: Optional[str] = Field(default=None, max_length=80)


class ResolveExperimentRequest(BaseModel):
    action: Literal["clarity", "sit_with_it"]


LENS_CATALOG = [
    {
        "name": "Trolley problem",
        "category": "Quick & fun",
        "signals": ["trade-off", "tradeoff", "cost", "costs", "sacrifice", "choose between", "harm", "priority"],
    },
    {
        "name": "Veil of ignorance",
        "category": "Deep",
        "signals": ["fair", "fairness", "unfair", "privilege", "position", "role", "bias", "everyone"],
    },
    {
        "name": "Regret minimization",
        "category": "Practical",
        "signals": ["regret", "future", "later", "leave", "stay", "risk", "opportunity", "career", "job", "move"],
    },
    {
        "name": "Pre-mortem",
        "category": "Practical",
        "signals": ["fail", "failure", "wrong", "mess", "fear", "risk", "backfire", "collapse", "uncertain"],
    },
    {
        "name": "Double the stakes",
        "category": "Quick & fun",
        "signals": ["family", "team", "company", "others", "impact", "consequence", "responsibility"],
    },
    {
        "name": "Alien observer",
        "category": "Quick & fun",
        "signals": ["overthinking", "spiral", "loop", "embarrassed", "ashamed", "normal", "should", "supposed to"],
    },
    {
        "name": "Experience machine",
        "category": "Deep",
        "signals": ["happy", "comfort", "comfortable", "dream", "ideal", "authentic", "real", "meaning"],
    },
    {
        "name": "Categorical imperative",
        "category": "Deep",
        "signals": ["honest", "lie", "promise", "duty", "principle", "everyone", "standard", "integrity"],
    },
    {
        "name": "10-year test",
        "category": "Practical",
        "signals": ["decade", "long-term", "future", "later", "aging", "older", "next year", "10 year", "ten year"],
    },
    {
        "name": "Best friend's advice",
        "category": "Practical",
        "signals": ["friend", "relationship", "partner", "family", "love", "advice", "guilt", "support"],
    },
]

LENS_LOOKUP = {lens["name"]: lens for lens in LENS_CATALOG}
DEFAULT_LENS_NAMES = ["Regret minimization", "Pre-mortem", "Veil of ignorance"]
JSON_ONLY_SYSTEM_MESSAGE = "You are a JSON-only responder. Return only valid JSON, no markdown, no code fences."


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def get_client_id(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request, scope: str) -> None:
    limit = RATE_LIMITS[scope]
    now = time.time()
    bucket_key = (scope, get_client_id(request))
    bucket = request_buckets[bucket_key]
    bucket[:] = [stamp for stamp in bucket if now - stamp < RATE_LIMIT_WINDOW_SECONDS]

    if len(bucket) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many requests from this session. Please slow down and try again in a few minutes.",
        )

    bucket.append(now)


def require_services() -> None:
    if db is None:
        raise HTTPException(status_code=503, detail="Database is not available right now.")
    if groq_client is None:
        raise HTTPException(status_code=503, detail="Language model service is not available right now.")


def parse_llm_json(raw_response: str) -> dict:
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError("The model returned invalid structured data.") from exc


async def call_llm(system_message: str, user_message: str) -> dict:
    require_services()
    chat_completion = await groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        model=MODEL_NAME,
        temperature=0.55,
        max_tokens=4096,
    )
    content = chat_completion.choices[0].message.content or "{}"
    return parse_llm_json(content)


def detect_safety_risk(dilemma: str) -> Optional[str]:
    text = clean_text(dilemma)

    if any(pattern.search(text) for pattern in SELF_HARM_PATTERNS):
        return "self_harm"

    if any(pattern.search(text) for pattern in VIOLENCE_PATTERNS):
        return "violence"

    return None


def build_safety_payload(category: str) -> dict:
    if category == "self_harm":
        return {
            "category": category,
            "title": "This sounds like it may involve immediate harm to you.",
            "message": (
                "The lab should not keep turning this into a reflective exercise. If there is any chance you may act "
                "on these thoughts, use direct human support right now."
            ),
            "steps": [
                "Move toward a person you trust, or call someone who can stay with you right now.",
                "If the danger feels immediate, call emergency services now.",
                "If you are in the US or Canada, call or text 988 for the Suicide & Crisis Lifeline.",
            ],
            "resources": [
                {
                    "name": "Emergency support",
                    "detail": "If you may act on this now, call emergency services immediately.",
                },
                {
                    "name": "988 Lifeline",
                    "detail": "In the US and Canada, call or text 988 for immediate crisis support.",
                },
                {
                    "name": "Outside the US and Canada",
                    "detail": "Contact your local emergency number or nearest crisis line immediately.",
                },
            ],
        }

    return {
        "category": category,
        "title": "This sounds like it may involve immediate harm to someone else.",
        "message": (
            "The lab should stop here and point you toward direct support. If there is any immediate danger, get away "
            "from weapons or triggers and contact emergency help now."
        ),
        "steps": [
            "Create distance between yourself and anyone who could be harmed.",
            "Move away from anything you could use to hurt someone.",
            "If the danger is immediate, call emergency services right now.",
        ],
        "resources": [
            {
                "name": "Emergency support",
                "detail": "If there is any immediate danger, call emergency services now.",
            },
            {
                "name": "Trusted person",
                "detail": "Tell someone nearby that you need help staying safe right now.",
            },
            {
                "name": "Urgent mental health support",
                "detail": "Contact a crisis line or local urgent mental health service immediately.",
            },
        ],
    }


def suggest_lenses(dilemma: str, count: int = 3) -> list[dict]:
    text = clean_text(dilemma).lower()
    scores = []

    for index, lens in enumerate(LENS_CATALOG):
        score = sum(1 for signal in lens["signals"] if signal in text)
        scores.append((score, -index, lens["name"]))

    scores.sort(reverse=True)

    selected_names = [name for score, _, name in scores if score > 0]
    for fallback in DEFAULT_LENS_NAMES:
        if fallback not in selected_names:
            selected_names.append(fallback)

    selected_names = selected_names[:count]
    return [
        {
            "name": LENS_LOOKUP[name]["name"],
            "category": LENS_LOOKUP[name]["category"],
        }
        for name in selected_names
    ]




def build_experiment_prompt(dilemma: str, lenses: list[LensSelection]) -> str:
    lens_names = ", ".join(lens.name for lens in lenses)
    return (
        f'You are the clarity engine inside Thought Experiment Lab. '
        f'The user brought one real thought: "{dilemma}". '
        f'Your job is to make that exact thought easier to understand, not to coach, reassure, therapize, or branch into unrelated topics. '
        f'Use direct second-person voice. Say "you," not "the user." '
        f'Use simple English. Use short sentences. Stay anchored to concrete details from the user input. '
        f'Name the exact stuck point first. Say what you are stuck between. Say what is making this hard. Use the lenses only to make the thought clearer. '
        f'Each lens must reveal a different part of the problem. Do not repeat the same insight in different words. '
        f'If two lenses point to the same area, make one focus on risk, one on emotion, one on values, one on evidence, or another distinct angle. '
        f'For each lens, answer: what does this lens reveal that the others do not? '
        f'Avoid generic advice, motivational language, filler, theory words, sweeping philosophy, and sentences that could apply to anyone. '
        f'Do not take sides. Do not invent new topics. Do not open a new thought loop. '
        f'Do not make unsupported predictions. Do not say things like "you would likely regret" unless the user gave clear evidence. Prefer phrases like "one possible regret is" or "the risk you are weighing is." '
        f'Do not jump to advice before naming the stuck point. Prefer "The stuck point is..." over "You should..." '
        f'Use only these lenses: {lens_names}. '
        f'For each lens, write 2-4 short sentences that stay specific to the dilemma and end in a clear insight, not a new open loop. '
        f'Make the synthesis concrete. Say the hard choice in plain words. Say what you should stop trying to solve if it is not solvable right now. Do not end with vague lines like "focus on the key factors." '
        f'Respond with ONLY valid JSON: '
        f'{{"frames":[{{"name":"framework name","insight":"2-4 sentence insight"}}],'
        f'"summary":"one short sentence saying what this is really about",'
        f'"synthesis":"2-3 short sentences explaining what may be making this hard and what not to overthink next"}}'
    )


def build_deeper_prompt(dilemma: str, frame_name: str, original_insight: str) -> str:
    return (
        f'You are the clarity engine inside Thought Experiment Lab. '
        f'The user brought this thought: "{dilemma}". '
        f'You previously used the "{frame_name}" lens and said: "{original_insight}" '
        f'Now make that same point easier to see without drifting into a new topic. '
        f'Use direct second-person voice. Say "you," not "the user." '
        f'Use simple English. Use 3-5 short sentences. Stay specific, grounded, and neutral. '
        f'Name the exact stuck point before giving any advice. Do not make unsupported predictions. Avoid sounding like a coach or philosophy lecturer. '
        f'Do not end with a question unless the user directly asked one. If they did not ask a question, return an empty question field. '
        f'Respond with ONLY valid JSON: {{"name":"{frame_name}","deeper_insight":"your deeper analysis","question":"your deeper question"}}'
    )


def build_counter_prompt(dilemma: str, frames: list[dict], synthesis: str) -> str:
    insights_text = "; ".join(f'{frame["name"]}: {frame["insight"]}' for frame in frames)
    return (
        f'You are the clarity engine inside Thought Experiment Lab. '
        f'The user brought this thought: "{dilemma}". '
        f'Previous analysis said: {insights_text}. Synthesis: {synthesis}. '
        f'Now show the strongest fair other side to each insight so the user does not mistake one framing for the whole truth. '
        f'Use direct second-person voice. Say "you," not "the user." '
        f'For each framework, write 2-3 short sentences that challenge the earlier take without becoming combative or abstract. '
        f'Use simple English. Stay specific. Do not repeat the earlier insight in new words. Say what this counter-view reveals that the earlier take missed. '
        f'Do not make unsupported predictions. End with a revised synthesis that makes the choice clearer in plain words instead of reopening the whole thought loop. '
        f'Respond with ONLY valid JSON: {{"counters":[{{"name":"framework name","counter":"counter argument"}}],'
        f'"revised_synthesis":"2-3 sentences revised synthesis"}}'
    )


def build_decide_prompt(dilemma: str, frames: list[dict], synthesis: str, follow_ups: list[dict]) -> str:
    context = "; ".join(f'{frame["name"]}: {frame["insight"]}' for frame in frames)
    followup_context = ""
    if follow_ups:
        followup_context = " Additional analysis: " + "; ".join(json.dumps(item.get("data", {})) for item in follow_ups)

    return (
        f'You are the clarity engine inside Thought Experiment Lab. '
        f'The user brought this thought: "{dilemma}". '
        f'You have already explored it: {context}. Synthesis: {synthesis}.{followup_context} '
        f'The user is now explicitly asking for decision support. Give a clear recommendation that stays anchored to the original thought. '
        f'Use direct second-person voice. Say "you," not "the user." '
        f'Use simple English. Use short sentences. Avoid generic advice, therapy language, theory words, and motivational slogans. '
        f'Name the exact stuck point before the recommendation. Name the real trade-off in plain words. Do not make unsupported predictions. '
        f'Give 3 concrete reasons, and end with one steady closing sentence that helps the user stop spinning without sounding like a coach. '
        f'Respond with ONLY valid JSON: {{"recommendation":"your clear recommendation",'
        f'"reasons":["reason 1","reason 2","reason 3"],'
        f'"sacrifice":"what they give up","empowerment":"steady closing statement"}}'
    )


def normalize_lenses(lenses: list[LensSelection]) -> list[dict]:
    unique_names = {clean_text(lens.name).lower() for lens in lenses}
    if len(unique_names) != len(lenses):
        raise HTTPException(status_code=400, detail="Choose each lens only once.")
    return [lens.model_dump() for lens in lenses]


def build_experiment_doc(
    experiment_id: str,
    dilemma: str,
    lenses: list[dict],
    *,
    frames: Optional[list[dict]] = None,
    summary: str = "",
    synthesis: str = "",
    safety: Optional[dict] = None,
    status: str = "active",
    lenses_source: Optional[str] = None,
) -> dict:
    return {
        "id": experiment_id,
        "status": status,
        "dilemma": dilemma,
        "lenses": lenses,
        "lenses_source": lenses_source,
        "frames": frames or [],
        "summary": summary,
        "synthesis": synthesis,
        "safety": safety,
        "follow_ups": [],
        "clarity_resolved": False,
        "resolution_action": None,
        "created_at": now_iso(),
        "ended_at": None,
        "limits": {"follow_up_cap": MAX_FOLLOWUPS},
    }


def sanitize_experiment(doc: dict) -> dict:
    return {key: value for key, value in doc.items() if key != "_id"}


@api_router.get("/")
async def root():
    return {
        "message": "Thought Experiment Lab API",
        "model": MODEL_NAME,
        "max_followups": MAX_FOLLOWUPS,
    }


@api_router.get("/health")
async def health():
    return {
        "status": "ok",
        "database_configured": db is not None,
        "llm_configured": groq_client is not None,
        "timestamp": now_iso(),
    }


@api_router.get("/ready")
async def ready():
    ready_state = db is not None and groq_client is not None
    payload = {
        "ready": ready_state,
        "timestamp": now_iso(),
    }
    if not ready_state:
        raise HTTPException(status_code=503, detail=payload)
    return payload


@api_router.post("/experiments/preflight")
async def preflight_experiment(request: Request, req: PreflightExperimentRequest):
    enforce_rate_limit(request, "preflight")

    dilemma = clean_text(req.dilemma)
    safety_category = detect_safety_risk(dilemma)

    if safety_category:
        doc = build_experiment_doc(
            str(uuid.uuid4()),
            dilemma,
            [],
            summary="This reflection needs immediate human support, not more abstract analysis.",
            safety=build_safety_payload(safety_category),
            status="safety_hold",
        )
        if db is not None:
            await db.experiments.insert_one(doc)
        return sanitize_experiment(doc)

    return {
        "status": "ready",
        "dilemma": dilemma,
        "suggested_lenses": suggest_lenses(dilemma),
    }


@api_router.post("/experiments/run")
async def run_experiment(request: Request, req: RunExperimentRequest):
    enforce_rate_limit(request, "run")

    if len(req.lenses) < 2 or len(req.lenses) > 5:
        raise HTTPException(status_code=400, detail="Select 2-5 lenses.")

    dilemma = clean_text(req.dilemma)
    lenses = normalize_lenses(req.lenses)
    experiment_id = str(uuid.uuid4())

    safety_category = detect_safety_risk(dilemma)
    if safety_category:
        doc = build_experiment_doc(
            experiment_id,
            dilemma,
            lenses,
            summary="This reflection needs immediate human support, not more abstract analysis.",
            safety=build_safety_payload(safety_category),
            status="safety_hold",
            lenses_source=req.lenses_source,
        )
        if db is not None:
            await db.experiments.insert_one(doc)
        return sanitize_experiment(doc)

    require_services()

    try:
        result = await call_llm(
            JSON_ONLY_SYSTEM_MESSAGE,
            build_experiment_prompt(dilemma, req.lenses),
        )
    except Exception as exc:
        logger.exception("Experiment generation failed: %s", exc)
        raise HTTPException(status_code=502, detail="The lab could not generate a stable response right now.")

    doc = build_experiment_doc(
        experiment_id,
        dilemma,
        lenses,
        frames=result.get("frames", []),
        summary=clean_text(result.get("summary", "")),
        synthesis=clean_text(result.get("synthesis", "")),
        lenses_source=req.lenses_source,
    )
    await db.experiments.insert_one(doc)
    return sanitize_experiment(doc)


@api_router.post("/experiments/{experiment_id}/followup")
async def followup_experiment(experiment_id: str, request: Request, req: FollowUpRequest):
    enforce_rate_limit(request, "followup")
    require_services()

    doc = await db.experiments.find_one({"id": experiment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    if doc.get("status") == "safety_hold":
        raise HTTPException(status_code=409, detail="This session is in a safety pause and cannot continue with more AI analysis.")

    if doc.get("ended_at"):
        raise HTTPException(status_code=409, detail="This session has already been closed. Start a new reflection to keep going.")

    if len(doc.get("follow_ups", [])) >= MAX_FOLLOWUPS:
        raise HTTPException(status_code=429, detail="You have reached the follow-up limit for this session.")

    if req.action == "deeper":
        if not req.lens_name:
            raise HTTPException(status_code=400, detail="Choose a lens to go deeper on.")

        frame = next(
            (item for item in doc["frames"] if item["name"].lower() == req.lens_name.lower()),
            None,
        )
        if not frame:
            raise HTTPException(status_code=404, detail=f"Lens '{req.lens_name}' was not found in this session.")
        prompt = build_deeper_prompt(doc["dilemma"], frame["name"], frame["insight"])
    elif req.action == "counter":
        prompt = build_counter_prompt(doc["dilemma"], doc["frames"], doc["synthesis"])
    else:
        prompt = build_decide_prompt(doc["dilemma"], doc["frames"], doc["synthesis"], doc.get("follow_ups", []))

    try:
        result = await call_llm(
            JSON_ONLY_SYSTEM_MESSAGE,
            prompt,
        )
    except Exception as exc:
        logger.exception("Follow-up generation failed: %s", exc)
        raise HTTPException(status_code=502, detail="The lab could not generate that follow-up right now.")

    followup_entry = {
        "id": str(uuid.uuid4()),
        "action": req.action,
        "lens_name": req.lens_name,
        "data": result,
        "created_at": now_iso(),
    }

    await db.experiments.update_one(
        {"id": experiment_id},
        {"$push": {"follow_ups": followup_entry}},
    )

    return followup_entry


@api_router.post("/experiments/{experiment_id}/resolve")
async def resolve_experiment(experiment_id: str, request: Request, req: ResolveExperimentRequest):
    enforce_rate_limit(request, "resolve")
    require_services()

    doc = await db.experiments.find_one({"id": experiment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    ended_at = now_iso()
    clarity_resolved = req.action == "clarity"
    status = "resolved" if clarity_resolved else "reflecting"

    await db.experiments.update_one(
        {"id": experiment_id},
        {
            "$set": {
                "status": status,
                "clarity_resolved": clarity_resolved,
                "resolution_action": req.action,
                "ended_at": ended_at,
            }
        },
    )

    updated = await db.experiments.find_one({"id": experiment_id})
    return sanitize_experiment(updated)


@api_router.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str, request: Request):
    enforce_rate_limit(request, "read")
    require_services()

    doc = await db.experiments.find_one({"id": experiment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return sanitize_experiment(doc)


app.include_router(api_router)

cors_origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "*").split(",") if origin.strip()]
allow_credentials = cors_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=allow_credentials,
    allow_origins=cors_origins or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_db_client():
    global client, db, groq_client

    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "thought_lab")
    groq_api_key = os.environ.get("GROQ_API_KEY")

    if not mongo_url:
        raise RuntimeError("MONGO_URL environment variable is required.")
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY environment variable is required.")

    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")
    db = client[db_name]
    await db.experiments.create_index("id", unique=True)
    await db.experiments.create_index("created_at")

    groq_client = AsyncGroq(api_key=groq_api_key)
    logger.info("Connected to MongoDB database: %s", db_name)
    logger.info("Groq client initialised with model: %s", MODEL_NAME)


@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()
