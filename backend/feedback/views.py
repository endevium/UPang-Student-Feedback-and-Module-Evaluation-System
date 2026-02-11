# API endpoints for React

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import StudentFeedback, ModuleReport
from ai_engine.processors import FeedbackProcessor
from ai_engine.services import GeminiService
from django.db.models import Count

class ModuleAnalysisView(APIView):
    def get(self, request, module_code):
        # 1. Initialize Engines
        processor = FeedbackProcessor()
        gemini = GeminiService()
        
        # 2. Process any unanalyzed feedback with local BERT
        unanalyzed = StudentFeedback.objects.filter(module_code=module_code, sentiment__isnull=True)
        for feedback in unanalyzed:
            results = processor.analyze_single(feedback.text)
            feedback.sentiment = results['sentiment']
            feedback.theme = results['theme']
            feedback.save()

        # 3. Aggregate Data for Gemini
        feedbacks = StudentFeedback.objects.filter(module_code=module_code)
        stats = {
            "total": feedbacks.count(),
            "pos": feedbacks.filter(sentiment='positive').count(),
            "neg": feedbacks.filter(sentiment='negative').count(),
            "neu": feedbacks.filter(sentiment='neutral').count(),
            "themes": list(feedbacks.values('theme').annotate(count=Count('theme')))
        }
        
        # Get 5 representative comments for context
        samples = [f.text for f in feedbacks.order_by('?')[:5]]

        # 4. Generate/Update Report with Gemini
        ai_output = gemini.generate_combined_analysis(stats, samples)
        
        # Simple splitting logic for Gemini's output (or store full text)
        report, _ = ModuleReport.objects.update_or_create(
            module_code=module_code,
            defaults={
                'summary': ai_output, 
                'stats_json': stats,
                'professor_name': feedbacks.first().professor_name if feedbacks.exists() else "Unknown"
            }
        )

        return Response({
            "module": module_code,
            "stats": stats,
            "ai_analysis": ai_output
        })