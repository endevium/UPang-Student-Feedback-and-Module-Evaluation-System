# logic for sentiment analysis (Hugging Face)

import os
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer

# Path provided in your previous message
MODEL_PATH = r"C:\Users\Gabriel Esperanza\Documents\Projects\UPang-Student-Feedback-and-Module-Evaluation-System\sentiment_model_final"

class FeedbackProcessor:
    def __init__(self):
        # Load your fine-tuned DistilBERT
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        self.sentiment_pipe = pipeline("sentiment-analysis", model=self.model, tokenizer=self.tokenizer)
        
        # Load Zero-Shot for Themes (as seen in your notebook)
        self.theme_pipe = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        self.candidate_themes = ["teaching clarity", "course workload", "module materials", "instructor engagement"]
        
        # Mapping labels from your notebook (LABEL_0, LABEL_1, etc.)
        self.label_map = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}

    def analyze_single(self, text):
        sentiment_res = self.sentiment_pipe(text)[0]
        theme_res = self.theme_pipe(text, self.candidate_themes)
        
        return {
            "sentiment": self.label_map.get(sentiment_res['label'], "neutral"),
            "theme": theme_res['labels'][0]
        }