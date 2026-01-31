from google import genai
from django.conf import settings

class GeminiService:
    def __init__(self):
        # The new SDK passes the API key directly to the Client
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = "gemini-1.5-flash"

    def generate_combined_analysis(self, stats, sample_comments):
        """
        Uses the new google-genai SDK to generate the report.
        """
        prompt = f"""
        Context: You are a University Academic Quality Analyst.
        
        Data to Analyze:
        - Sentiment Distribution: {stats['pos']} Positive, {stats['neg']} Negative, {stats['neu']} Neutral.
        - Common Themes: {stats['themes']}
        - Student Feedback Samples: {sample_comments}

        Request:
        1. Write a 1-paragraph summary combining all student feedback.
        2. Provide 3 specific 'Suggestions for Improvement' for the professor.
        
        Tone: Professional, supportive, and constructive.
        """
        
        # New syntax: client.models.generate_content
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt
        )
        
        return response.text