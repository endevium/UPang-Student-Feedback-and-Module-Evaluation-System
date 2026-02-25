import sys
from pathlib import Path
import os
import time
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from api.sentiment_service import predict_sentiment, analyze_theme

SAMPLES = [
    ("none", "neutral"),
    ("nothing", "neutral"),
    ("!!!???", "Sorry, I cannot understand this"),
    ("You are an idiot", "Sorry, harsh words are not permitted"),
    ("ahhhh daddy", "Sorry, sexual words are not permitted"),
    ("lmao", "neutral"),
]

THEME_SAMPLES = [
    "The instructor explained every topic clearly and made class engaging.",
    "Your teaching is confusing and a total waste of time.",
    "This module was okay overall, but the workload felt heavy.",
    "Great effort by the faculty, very helpful materials.",
    "You are an idiot."
]

def main():
    overall_start = datetime.utcnow()
    overall_start_ts = time.time()
    print("=" * 60)
    print("MODEL TIMING TESTS")
    print("=" * 60)
    print("Test start (UTC):", overall_start.isoformat(), "| ts:", overall_start_ts)
    print("--- Running 3 time-based tests (each includes a theme check) ---")

    # Test 1: single-call latency (sentiment + theme)
    print("\nTest 1: single-call latency")
    sent_text, sent_expected = SAMPLES[0]
    theme_text = THEME_SAMPLES[0]
    try:
        t0 = time.time()
        sent_label = predict_sentiment(sent_text)
        t1 = time.time()
        sent_dur = t1 - t0
    except Exception as e:
        sent_label = f"ERROR: {e}"
        sent_dur = None

    try:
        t0 = time.time()
        theme_label = analyze_theme(theme_text)
        t1 = time.time()
        theme_dur = t1 - t0
    except Exception as e:
        theme_label = f"ERROR: {e}"
        theme_dur = None

    print("Sentiment Text:", sent_text)
    print("Predicted:", sent_label, "(expected:", sent_expected, ")")
    print("Latency (sentiment):", f"{sent_dur:.6f}s" if sent_dur is not None else "ERROR")
    print("---")
    print("Theme Text:", theme_text)
    print("Predicted Theme:", theme_label)
    print("Latency (theme):", f"{theme_dur:.6f}s" if theme_dur is not None else "ERROR")
    print("Result (sentiment):", "PASS" if sent_label == sent_expected else "WARN")

    # Test 2: full-sample run duration (sentiment set + theme set)
    print("\nTest 2: full-sample run")
    sent_results = []
    t0 = time.time()
    for text, expected in SAMPLES:
        try:
            label = predict_sentiment(text)
        except Exception as e:
            label = f"ERROR: {e}"
        sent_results.append((text, label, expected))
    t1 = time.time()
    sent_total = t1 - t0
    sent_avg = sent_total / max(1, len(SAMPLES))
    print(f"Sentiment: ran {len(SAMPLES)} samples in {sent_total:.6f}s (avg {sent_avg:.6f}s)")

    theme_results = []
    t0 = time.time()
    for text in THEME_SAMPLES:
        try:
            theme = analyze_theme(text)
        except Exception as e:
            theme = f"ERROR: {e}"
        theme_results.append((text, theme))
    t1 = time.time()
    theme_total = t1 - t0
    theme_avg = theme_total / max(1, len(THEME_SAMPLES))
    print(f"Theme: ran {len(THEME_SAMPLES)} samples in {theme_total:.6f}s (avg {theme_avg:.6f}s)")

    for text, label, expected in sent_results:
        print("---")
        print("Text:", text)
        print("Predicted:", label, "(expected:", expected, ")")
    for text, theme in theme_results:
        print("---")
        print("Text:", text)
        print("Predicted Theme:", theme)

    # Test 3: repeated-call throughput (sentiment + theme)
    print("\nTest 3: repeated-call throughput")
    N = 50
    sent_sample = SAMPLES[-1][0]  # use last sentiment sample ("lmao")
    sent_expected = SAMPLES[-1][1]
    sent_success = 0
    t0 = time.time()
    for _ in range(N):
        try:
            label = predict_sentiment(sent_sample)
            if label == sent_expected:
                sent_success += 1
        except Exception:
            pass
    t1 = time.time()
    sent_dur = t1 - t0
    sent_avg = sent_dur / N if N else 0
    print(f"Sentiment: performed {N} calls in {sent_dur:.6f}s (avg {sent_avg:.6f}s). Successes: {sent_success}/{N} for expected '{sent_expected}'")

    theme_sample = THEME_SAMPLES[-1]  # last theme sample
    theme_responses = 0
    t0 = time.time()
    for _ in range(N):
        try:
            theme_out = analyze_theme(theme_sample)
            if not (isinstance(theme_out, str) and theme_out.startswith("ERROR")):
                theme_responses += 1
        except Exception:
            pass
    t1 = time.time()
    theme_dur = t1 - t0
    theme_avg = theme_dur / N if N else 0
    print(f"Theme: performed {N} calls in {theme_dur:.6f}s (avg {theme_avg:.6f}s). Non-error responses: {theme_responses}/{N}")

    overall_end = datetime.utcnow()
    overall_end_ts = time.time()
    print("\nTest end (UTC):", overall_end.isoformat(), "| ts:", overall_end_ts)
    print("Total elapsed (wall-clock):", f"{overall_end_ts - overall_start_ts:.6f}s")

if __name__ == '__main__':
    main()
