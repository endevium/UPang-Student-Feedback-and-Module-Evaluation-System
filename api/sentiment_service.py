from pathlib import Path
from typing import Optional
import re
from functools import lru_cache

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline


# Model directory (repo_root/sentiment_model_final)
MODEL_DIR = Path(__file__).resolve().parent.parent / "sentiment_model_final"

_tokenizer: Optional[AutoTokenizer] = None
_model: Optional[AutoModelForSequenceClassification] = None
_theme_classifier = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BLOCKED_THEME_LABELS = {"harsh language", "insult", "sexual content"}
THEME_LABELS = [
    "teaching clarity",
    "course workload",
    "module materials",
    "instructor engagement",
    "harsh language",
    "insult",
    "sexual content",
    "general feedback",
    "constructive feedback",
    "praise"
]

def _load_theme_classifier_once():
    """Load zero-shot classifier once and reuse it. Prefer GPU when available and warm up."""
    global _theme_classifier
    if _theme_classifier is not None:
        return

    # pipeline accepts device: 0 for first CUDA device, -1 for CPU
    device_arg = 0 if _device.type == "cuda" else -1
    _theme_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=device_arg)

    # Warm-up to avoid first-call latency spike
    try:
        # small warm-up call; candidate labels passed explicitly
        _theme_classifier("warmup", candidate_labels=THEME_LABELS)
    except Exception:
        # Best-effort warm-up - ignore failures
        pass


@lru_cache(maxsize=2048)
def analyze_theme(text: str) -> str:
    """Classify text into a theme label using zero-shot classification with caching."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    _load_theme_classifier_once()

    # Fast rule-based short-circuit for obviously insulting/sexual inputs (cheap)
    low_cost_insult_re = re.compile(r"\b(idiot|stupid|dumb|fuck|shit|daddy|mommy)\b", flags=re.IGNORECASE)
    if low_cost_insult_re.search(text):
        # keep the same labels used elsewhere for consistency
        if re.search(r"\b(daddy|mommy|porn|sex|sexy|nude|nsfw|fuck|cum|orgasm|xxx)\b", text, flags=re.IGNORECASE):
            return "sexual content"
        if re.search(r"\b(idiot|stupid|dumb|trash|worthless)\b", text, flags=re.IGNORECASE):
            return "insult"

    # Use pipeline — explicit candidate_labels keyword is slightly faster in some HF versions
    result = _theme_classifier(text, candidate_labels=THEME_LABELS)
    # pipeline returns ordered labels by score
    return result['labels'][0]


def analyze_theme_batch(texts: list) -> list:
    """Batched theme classification using the same zero-shot pipeline (more efficient than repeated single calls)."""
    if not isinstance(texts, (list, tuple)):
        raise TypeError("texts must be a list or tuple of strings")

    _load_theme_classifier_once()

    # The HF zero-shot pipeline supports a list of sequences and returns a list of dicts
    try:
        results = _theme_classifier(list(texts), candidate_labels=THEME_LABELS)
        labels = [r['labels'][0] for r in results]
        return labels
    except Exception:
        # Fallback to cheap rule-based mapping if pipeline fails
        def _rule(t):
            t = t.lower()
            if any(w in t for w in ["idiot", "stupid", "dumb", "trash", "worthless"]):
                return "insult"
            if any(w in t for w in ["great", "excellent", "thank", "helpful", "awesome", "amazing"]):
                return "praise"
            if "instructor" in t or "teacher" in t or "professor" in t:
                if any(k in t for k in ["engag", "clear", "explained", "helpful"]):
                    return "instructor engagement"
                return "general feedback"
            if any(word in t for word in ["teaching", "class", "module", "workload", "confusing", "waste of time", "okay"]):
                return "general feedback"
            return "general feedback"
        return [_rule(t) for t in texts]
    
def _load_model_once():
    global _tokenizer, _model
    if _model is not None and _tokenizer is not None:
        return

    # Load tokenizer and model from local folder (expects Hugging Face format)
    _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
    _model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
    _model.to(_device)
    _model.eval()


def predict_sentiment(text: str) -> str:
    """Return a simple sentiment label for `text`.

    Loads model/tokenizer once and reuses them on subsequent calls.
    Returns one of: 'negative', 'neutral', 'positive' when possible, otherwise the raw label.
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    # Basic input filtering to catch non-textual or disallowed inputs early.
    # 1) Emojis or punctuation-only input -> not understandable
    # 2) Sexual content -> reject
    # 3) Harsh / profane words -> reject

    # Unicode emoji ranges (covers most emoji codepoints)
    EMOJI_RE = re.compile("[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\u2600-\u26FF\u2700-\u27BF]+", flags=re.UNICODE)

    # Normalize whitespace
    txt = text.strip()

    # If input is empty after trimming
    if not txt:
        return "Sorry, I cannot understand this"

    # If text contains sexual terms, reject with a specific message
    sexual_words = [
        'daddy', 'mommy', 'porn', 'sex', 'sexy', 'nude', 'nsfw', 'fuck', 'cum', 'orgasm', 'xxx'
    ]
    SEXUAL_RE = re.compile(r"\b(" + r"|".join(re.escape(w) for w in sexual_words) + r")\b", flags=re.IGNORECASE)
    if SEXUAL_RE.search(txt):
        return "Sorry, sexual words are not permitted"

    # Check profanity/harsh words
    PROFANE_WORDS = [
        'fuck', 'shit', 'bitch', 'asshole', 'idiot', 'stupid', 'moron', 'bastard', 'dumb', 'crap'
    ]
    PROFANE_RE = re.compile(r"\b(" + r"|".join(re.escape(w) for w in PROFANE_WORDS) + r")\b", flags=re.IGNORECASE)
    if PROFANE_RE.search(txt):
        return "Sorry, harsh words are not permitted"

    # Remove emojis and punctuation to see if there's any readable text left
    without_emojis = EMOJI_RE.sub('', txt)
    # Remove punctuation (keep word characters and whitespace)
    cleaned = re.sub(r"[^\w\s]", '', without_emojis).strip()
    if not cleaned:
        # Input was only emojis/punctuation/symbols
        return "Sorry, I cannot understand this"

    _load_model_once()

    # Tokenize and move tensors to device
    inputs = _tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    inputs = {k: v.to(_device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = _model(**inputs)
        logits = outputs.logits
        pred_idx = int(torch.argmax(logits, dim=-1).cpu().item())

    # Try to read a human-readable label from model config
    label_name = None
    try:
        id2label = getattr(_model.config, "id2label", None)
        if id2label is not None:
            # id2label keys may be ints or strings
            label_name = id2label.get(pred_idx) or id2label.get(str(pred_idx))
    except Exception:
        label_name = None

    # Friendly mapping used in training: 0=negative,1=neutral,2=positive
    if label_name in ("LABEL_0", "0") or pred_idx == 0:
        return "negative"
    if label_name in ("LABEL_1", "1") or pred_idx == 1:
        return "neutral"
    if label_name in ("LABEL_2", "2") or pred_idx == 2:
        return "positive"

    # Fallback to whatever label_name is or numeric index
    return (label_name or str(pred_idx)).lower()


def _load_theme_classifier_once():
    """Load zero-shot classifier once and reuse it."""
    global _theme_classifier
    if _theme_classifier is not None:
        return
    
    _theme_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


def analyze_theme(text: str) -> str:
    """Classify text into a theme category using zero-shot classification.
    
    Returns the top theme label based on confidence.
    """
    THEME_LABELS = [
        "teaching clarity",
        "course workload",
        "module materials",
        "instructor engagement",
        "harsh language",
        "insult",
        "sexual content",
        "general feedback",
        "constructive feedback",
        "praise"
    ]
    
    _load_theme_classifier_once()
    
    result = _theme_classifier(text, THEME_LABELS)
    return result['labels'][0]  # Top-scoring label