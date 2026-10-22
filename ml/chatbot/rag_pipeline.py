import os
import json
import ssl
import urllib.request
from typing import List, Dict, Any
from ml.chatbot.vector_store import store

def get_gemini_api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key or key == "your_gemini_api_key_here":
        try:
            root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
            if os.path.exists(root_env):
                for line in open(root_env, encoding="utf-8"):
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val and val != "your_gemini_api_key_here":
                            return val
        except Exception:
            pass
    return key

def call_gemini_generate(prompt: str, temperature: float = 0.4) -> str:
    """
    Calls Gemini generateContent using a resilient model cascade.
    Uses the same proven model names as the central gemini_client.
    """
    api_key = get_gemini_api_key()
    if not api_key or api_key == "your_gemini_api_key_here":
        return ""

    candidate_models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
    ]

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "topP": 0.92,
            "maxOutputTokens": 1024
        }
    }).encode("utf-8")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for model_name in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "CareerCraft-AI/2.0"}
        )
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
                result = json.loads(response.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        text = parts[0]["text"].strip()
                        if text:
                            return text
        except Exception:
            continue

    return ""


def generate_chat_response(message: str, conversation_history: List[Dict] = None) -> str:
    """
    Conversational RAG pipeline for CareerCraft AI.
    1. Retrieves relevant knowledge from the semantic vector store.
    2. Constructs a focused, context-aware prompt — only using retrieved knowledge
       when it is genuinely relevant to the user's question.
    3. Maintains conversational tone without forcing templates into every reply.
    """
    if not message or not message.strip():
        return "How can I help you today? Ask me about interview prep, resume tips, salary negotiation, or career transitions."

    # 1. Retrieval Phase — find what's actually relevant
    retrieved_chunks = store.search(message, top_k=3)

    # Only include chunks with a meaningful relevance score
    relevant_chunks = [c for c in retrieved_chunks if c.get("score", 0.0) >= 0.08]

    context_section = ""
    if relevant_chunks:
        context_section = "\n### RELEVANT KNOWLEDGE BASE CONTEXT:\n"
        for idx, item in enumerate(relevant_chunks):
            topic = item.get("metadata", {}).get("topic", "Career Insight")
            doc = item.get("document", "")
            context_section += f"**[{topic}]:** {doc}\n\n"

    # 2. Build a conversation-aware, non-prescriptive prompt
    history_section = ""
    if conversation_history:
        history_section = "\n### RECENT CONVERSATION CONTEXT:\n"
        for turn in conversation_history[-4:]:  # last 2 exchanges
            role = "Candidate" if turn.get("role") == "user" else "CareerCraft AI"
            history_section += f"**{role}:** {turn.get('text', '')}\n"

    prompt = f"""You are CareerCraft AI, a friendly and highly knowledgeable career coach specialising in tech careers in India.

Your personality:
- Conversational, warm, and encouraging — not robotic or over-formal
- Direct and specific — you answer exactly what was asked, not a generic template
- You only mention frameworks like STAR or X-Y-Z when the user explicitly asks about resumes or interview answers
- You use markdown formatting (bold, bullets, headers) to make responses readable
- All salaries you mention are in Indian Rupees (₹) and LPA unless the user specifies otherwise
{history_section}{context_section}
### CANDIDATE'S MESSAGE:
{message}

### YOUR RESPONSE:
Answer the candidate's specific question concisely and helpfully. 
- If the question is a greeting or casual message, respond warmly and briefly.
- If the question is about a specific topic, give targeted advice — do NOT pad the response with unrelated frameworks.
- Use the knowledge base context ONLY if it is directly relevant to the question.
- Keep responses focused and avoid unnecessary preamble like "Hello! I am CareerCraft AI...".
"""

    # 3. Generation Phase
    ai_response = call_gemini_generate(prompt, temperature=0.4)
    if ai_response:
        return ai_response

    # 4. Smart Fallback — topic-aware responses
    return _smart_fallback(message, relevant_chunks)


def _smart_fallback(message: str, relevant_chunks: List[Dict]) -> str:
    """
    Returns a focused, topic-aware fallback when the Gemini API is unavailable.
    """
    msg_lower = message.lower()

    # Greeting detection
    greetings = ["hi", "hello", "hey", "good morning", "good evening", "what can you do", "help"]
    if any(g in msg_lower for g in greetings):
        return (
            "Hey! I'm CareerCraft AI, your career coach. Here's what I can help you with:\n\n"
            "- 📝 **Resume Review** — rewrite bullets, ATS optimisation, keyword alignment\n"
            "- 🎯 **Interview Prep** — STAR answers, system design, technical rounds\n"
            "- 💰 **Salary Negotiation** — market benchmarks in INR, counter-offer tactics\n"
            "- 🚀 **Career Transitions** — roadmaps for switching roles or domains\n\n"
            "What would you like help with today?"
        )

    # Salary / compensation
    if any(kw in msg_lower for kw in ["salary", "ctc", "lpa", "compensation", "pay", "hike", "raise", "negotiate"]):
        return (
            "**Salary Negotiation Playbook:**\n\n"
            "1. **Never anchor first** — Ask for the role's budget range before giving any number.\n"
            "2. **Research market rates** — Use our Salary Estimator to find the ₹ median for your role and YoE.\n"
            "3. **Target 10–15% above offer** — Present quantifiable impact (cost saved, latency reduced, users onboarded) as justification.\n"
            "4. **Evaluate total CTC** — Base salary + bonus + ESOPs/RSUs + joining bonus + insurance all count.\n"
            "5. **Multiple offers = leverage** — Having a competing offer is the strongest negotiation tool.\n\n"
            "Would you like help calculating your market value or practising a negotiation script?"
        )

    # Resume
    if any(kw in msg_lower for kw in ["resume", "cv", "ats", "bullet", "experience"]):
        return (
            "**Resume Optimisation Tips:**\n\n"
            "- **Use the X-Y-Z formula:** *'Accomplished [X], as measured by [Y], by doing [Z]'* — every bullet needs a metric.\n"
            "- **ATS keywords:** Match exact terms from the job description (e.g., Python, Docker, REST API, CI/CD).\n"
            "- **Standard headers:** Summary → Skills → Experience → Projects → Education.\n"
            "- **Avoid:** multi-column layouts, tables, images — they break ATS parsers.\n\n"
            "Share a bullet point and I'll help you rewrite it!"
        )

    # Interview
    if any(kw in msg_lower for kw in ["interview", "star", "behavioral", "technical", "coding", "system design"]):
        return (
            "**Interview Preparation Framework:**\n\n"
            "**For Behavioural Rounds — STAR Method:**\n"
            "- **S**ituation: Set the context (project scope, team size, business problem)\n"
            "- **T**ask: Your specific responsibility and objective\n"
            "- **A**ction: Exact technical decisions, tools, trade-offs you made\n"
            "- **R**esult: Measurable impact (e.g., '40% latency reduction', '₹20L cost saving')\n\n"
            "**For System Design Rounds:**\n"
            "1. Clarify requirements and constraints (scale, latency, consistency)\n"
            "2. Sketch high-level architecture before diving into components\n"
            "3. Discuss trade-offs: SQL vs NoSQL, REST vs event-driven, caching strategies\n\n"
            "Want to do a mock interview for a specific role?"
        )

    # Career switch / roadmap
    if any(kw in msg_lower for kw in ["transition", "switch", "roadmap", "career change", "ml engineer", "ai engineer", "full stack"]):
        return (
            "**Career Transition Roadmap:**\n\n"
            "The fastest path to a new role:\n"
            "1. **Identify the skill gap** — Compare your current profile to 10 job descriptions for your target role.\n"
            "2. **Build 2–3 portfolio projects** — End-to-end, deployed, GitHub-linked. Quality beats quantity.\n"
            "3. **Upskill strategically** — Courses tab has curated learning paths for your target domain.\n"
            "4. **Update your resume** — Reframe existing experience using target role keywords.\n"
            "5. **Network actively** — LinkedIn outreach to engineers at target companies is highly effective.\n\n"
            "Which domain are you transitioning to? I can give you a specific roadmap."
        )

    # Use best retrieved chunk if score is reasonable
    if relevant_chunks and relevant_chunks[0].get("score", 0.0) >= 0.12:
        best = relevant_chunks[0].get("document", "")
        topic = relevant_chunks[0].get("metadata", {}).get("topic", "Career Insight")
        return f"**{topic}**\n\n{best}\n\nFeel free to ask a follow-up question or start a mock interview!"

    # Generic fallback
    return (
        "Great question! I can help you with:\n\n"
        "- Interview preparation and mock practice\n"
        "- Resume and ATS optimisation\n"
        "- Salary benchmarking (₹ INR)\n"
        "- Career roadmaps and role transitions\n\n"
        "Could you give me a bit more context about what you're working on? That way I can give you the most targeted advice."
    )
