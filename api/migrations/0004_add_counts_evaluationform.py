from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_auditlog_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='evaluationform',
            name='questions_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='evaluationform',
            name='usage_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
