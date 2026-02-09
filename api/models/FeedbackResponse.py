from django.db import models
from .EvaluationForm import EvaluationForm
from .EvaluationQuestion import EvaluationQuestion

class FeedbackResponse(models.Model):
    id = models.BigAutoField(primary_key=True)
    form = models.ForeignKey(EvaluationForm, on_delete=models.CASCADE)
    pseudonym = models.CharField(max_length=36)
    question = models.ForeignKey(EvaluationQuestion, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'feedback_responses'
        unique_together = ('form', 'pseudonym', 'question')
