import sys
from pathlib import Path
import os
from datetime import datetime
import time

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from api.sentiment_service import predict_sentiment

SAMPLES = [
    ("I absolutely not recommend this course.", "negative"),
    ("meow", "Sorry, I cannot understand this"),
    ("!!!???", "Sorry, I cannot understand this"),
    ("You are an idiot", "Sorry, harsh words are not permitted"),
    ("ahhhh daddy", "Sorry, sexual words are not permitted"),
    ("lmao", "neutral"),
]

def main():
    # Debug info to diagnose duplicate outputs
    import api
    print("PID:", os.getpid() if 'os' in globals() else None)
    print("sys.path[0]:", sys.path[0])
    print("api module id:", id(api))
    print("predict_sentiment func id:", id(predict_sentiment))
    api_keys = [k for k in sys.modules.keys() if k.startswith('api')]
    print("sys.modules api keys:", api_keys)

    overall_start = datetime.utcnow()
    overall_start_ts = time.time()
    print("Test start (UTC):", overall_start.isoformat(), "| ts:", overall_start_ts)
    print("--- Running 3 time-based tests ---")

    # Test 1: single-call latency
    print("\nTest 1: single-call latency")
    sample_text, expected = SAMPLES[0]
    try:
        t0 = time.time()
        label = predict_sentiment(sample_text)
        t1 = time.time()
        dur = t1 - t0
        print(f"Text: {sample_text}")
        print(f"Predicted: {label} (expected: {expected})")
        print(f"Latency: {dur:.4f}s")
        print("Result:", "PASS" if label == expected else "WARN")
    except Exception as e:
        print("ERROR during Test 1:", e)

    # Test 2: full-sample run duration
    print("\nTest 2: full-sample run")
    results = []
    t0 = time.time()
    for text, expected in SAMPLES:
        try:
            label = predict_sentiment(text)
        except Exception as e:
            label = f"ERROR: {e}"
        results.append((text, label, expected))
    t1 = time.time()
    total_dur = t1 - t0
    print(f"Ran {len(SAMPLES)} samples in {total_dur:.4f}s (avg {total_dur/len(SAMPLES):.4f}s per call)")
    for text, label, expected in results:
        print("---")
        print("Text:", text)
        print("Predicted:", label, "(expected:", expected, ")")

    # Test 3: repeated-call throughput (N calls)
    print("\nTest 3: repeated-call throughput")
    N = 50
    sample = "lmao"
    ok = 0
    t0 = time.time()
    for _ in range(N):
        try:
            label = predict_sentiment(sample)
            if label == "neutral":
                ok += 1
        except Exception:
            pass
    t1 = time.time()
    dur = t1 - t0
    print(f"Performed {N} calls in {dur:.4f}s (avg {dur/N:.4f}s). Successes for expected 'neutral': {ok}/{N}")

    overall_end = datetime.utcnow()
    overall_end_ts = time.time()
    print("\nTest end (UTC):", overall_end.isoformat(), "| ts:", overall_end_ts)
    print("Total elapsed (wall-clock):", f"{overall_end_ts - overall_start_ts:.4f}s")

if __name__ == '__main__':
    main()

