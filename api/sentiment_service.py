from pathlib import Path
from typing import Optional
import re

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer


# Model directory (repo_root/sentiment_model_final)
MODEL_DIR = Path(__file__).resolve().parent.parent / "sentiment_model_final"

_tokenizer: Optional[AutoTokenizer] = None
_model: Optional[AutoModelForSequenceClassification] = None
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


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
    SEXUAL_RE = re.compile(r"\\b(" + r"|".join(re.escape(w) for w in sexual_words) + r")\\b", flags=re.IGNORECASE)
    if SEXUAL_RE.search(txt):
        return "Sorry, sexual words are not permitted"

    # Harsh / profane words
    profane_words = [
        'fuck', 'shit', 'bitch', 'asshole', 'idiot', 'stupid', 'moron', 'bastard', 'dumb', 'crap'
    ]
    PROFANE_RE = re.compile(r"\\b(" + r"|".join(re.escape(w) for w in profane_words) + r")\\b", flags=re.IGNORECASE)
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
