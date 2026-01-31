# PostgreSQL tables (StudentFeedback, Reports)

from django.db import models

class StudentFeedback(models.Model):
    # Raw data
    text = models.TextField()
    professor_name = models.CharField(max_length=100)
    module_code = models.CharField(max_length=20)
    
    # AI Metadata (populated by our local model)
    sentiment = models.CharField(max_length=20, null=True, blank=True) # positive, neutral, negative
    theme = models.CharField(max_length=50, null=True, blank=True)     # workload, clarity, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.module_code} - {self.sentiment}"

class ModuleReport(models.Model):
    professor_name = models.CharField(max_length=100)
    module_code = models.CharField(max_length=20, unique=True)
    
    # The output from Gemini
    summary = models.TextField()
    suggestions = models.TextField()
    
    # Aggregated Stats (stored as JSON for the React frontend)
    stats_json = models.JSONField(default=dict)
    
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report for {self.module_code}"