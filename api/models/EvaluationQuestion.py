from django.db import models

class EvaluationQuestion(models.Model):
    id = models.BigAutoField(primary_key=True)
    question_text = models.TextField()
    QUESTION_TYPES = [
        ('rating', 'Rating'),
        ('comment', 'Comment'),
    ]
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    position = models.IntegerField()

    class Meta:
        db_table = 'evaluation_questions_master'
        unique_together = ('position',)
