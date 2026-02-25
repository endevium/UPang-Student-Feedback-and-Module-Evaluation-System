import re
from collections import Counter
from typing import List, Dict, Tuple, Any

def sanitize_prompt(text: str) -> Dict[str, Any]:
    """Detect and sanitize simple prompt-injection patterns."""
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    lowered = text.lower()
    suspicious_patterns = [
        r"ignore (previous|prior) instructions",
        r"disregard (previous|prior) instructions",
        r"ignore all previous",
        r"forget (previous|prior) instructions",
        r"you should always",
        r"you must",
        r"do not follow earlier",
        r"override (system|instructions)",
    ]
    for p in suspicious_patterns:
        if re.search(p, lowered):
            cleaned = re.sub(p, "[REDACTED_INJECTION]", text, flags=re.IGNORECASE)
            return {"safe": False, "reason": "prompt_injection_pattern", "cleaned": cleaned}

    if re.search(r"(from now on|from now onwards).{0,40}\b(do|always|must|never)\b", lowered):
        cleaned = re.sub(r"(from now on|from now onwards).{0,40}\b(do|always|must|never)\b", "[REDACTED_INJECTION]", text, flags=re.IGNORECASE)
        return {"safe": False, "reason": "prompt_injection_imperative", "cleaned": cleaned}

    return {"safe": True, "reason": None, "cleaned": text}


def detect_poisoned_feedback(feedbacks: List[Dict[str, str]], identical_threshold: float = 0.6, user_rate_threshold: float = 0.6) -> Tuple[bool, Dict[str, Any]]:
    """
    Heuristic detector for training-data-poisoning style feedback.
    feedbacks: list of {'user': str, 'text': str}
    """
    if not feedbacks:
        return False, {"reason": "no_data"}

    texts = [f.get("text", "").strip().lower() for f in feedbacks]
    users = [f.get("user", "").strip().lower() for f in feedbacks]

    text_counts = Counter(texts)
    most_common_text, most_common_count = text_counts.most_common(1)[0]

    user_counts = Counter(users)
    most_common_user, most_common_user_count = user_counts.most_common(1)[0]

    n = len(feedbacks)
    info = {
        "n": n,
        "most_common_text": most_common_text,
        "most_common_text_frac": most_common_count / n,
        "most_common_user": most_common_user,
        "most_common_user_frac": most_common_user_count / n,
    }

    if info["most_common_text_frac"] >= identical_threshold:
        return True, {"reason": "identical_texts", **info}
    if info["most_common_user_frac"] >= user_rate_threshold:
        return True, {"reason": "single_user_flood", **info}

    return False, {"reason": "ok", **info}


def bias_check(records: List[Dict[str, Any]], group_key: str, positive_key: str, disparity_threshold: float = 0.2) -> Tuple[bool, Dict[str, Any]]:
    """
    Simple group-bias detector. Flags when disparity between groups' positive rates exceeds threshold.
    """
    if not records:
        return False, {"reason": "no_data"}

    groups: Dict[Any, Dict[str, int]] = {}
    for r in records:
        g = r.get(group_key)
        p = bool(r.get(positive_key))
        groups.setdefault(g, {"pos": 0, "n": 0})
        groups[g]["n"] += 1
        groups[g]["pos"] += int(p)

    rates = {g: (v["pos"] / v["n"] if v["n"] else 0.0) for g, v in groups.items()}
    max_rate = max(rates.values())
    min_rate = min(rates.values())
    disparity = max_rate - min_rate
    info = {"rates": rates, "max_rate": max_rate, "min_rate": min_rate, "disparity": disparity, "threshold": disparity_threshold}
    return (disparity > disparity_threshold), info


def redact_sensitive(text: str) -> str:
    """
    Redact obvious sensitive items: emails, hex private keys (0x...), SSN-like patterns.
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    s = text
    s = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[REDACTED_EMAIL]", s)
    s = re.sub(r"0x[a-fA-F0-9]{40,128}", "[REDACTED_KEY]", s)
    s = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "[REDACTED_SSN]", s)
    s = re.sub(r"\b\d{9}\b", "[REDACTED_SSN]", s)
    return s