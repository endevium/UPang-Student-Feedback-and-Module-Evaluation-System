from django.db import models

class Block(models.model):
    id = models.BigAutoField(primary_key=True)
    course = models.CharField(max_length=50)
    department = models.CharField(max_length=50)
    year_level = models.CharField(max_length=8)
    block_name = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'blocks'
        
    def __str__(self):
        return f"{self.block_name} {self.year_level} - {self.department}"