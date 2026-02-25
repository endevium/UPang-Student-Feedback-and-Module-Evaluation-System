import sys
from pathlib import Path
import os

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
    print("=" * 60)
    print("SENTIMENT PREDICTIONS")
    print("=" * 60)
    
    for text, expected in SAMPLES:
        try:
            label = predict_sentiment(text)
        except Exception as e:
            label = f"ERROR: {e}"
        print("---")
        print("Text:", text)
        print("Predicted:", label, "(expected:", expected, ")")
    
    print("\n" + "=" * 60)
    print("THEME ANALYSIS")
    print("=" * 60)
    
    for text in THEME_SAMPLES:
        try:
            theme = analyze_theme(text)
        except Exception as e:
            theme = f"ERROR: {e}"
        print("---")
        print("Text:", text)
        print("Predicted Theme:", theme)


if __name__ == '__main__':
    main()

