from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_add_counts_evaluationform'),
    ]

    operations = [
        # Drop the old table if it still exists
        migrations.RunSQL(
            sql="""
            DROP TABLE IF EXISTS evaluation_forms;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        # Create ModuleEvaluationForm table
        migrations.CreateModel(
            name='ModuleEvaluationForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Draft', 'Draft')], default='Draft', max_length=20)),
                ('questions', models.JSONField(default=list)),
                ('questions_count', models.PositiveIntegerField(default=0)),
                ('usage_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'module_evaluation_forms',
            },
        ),

        # Create InstructorEvaluationForm table
        migrations.CreateModel(
            name='InstructorEvaluationForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Draft', 'Draft')], default='Draft', max_length=20)),
                ('questions', models.JSONField(default=list)),
                ('questions_count', models.PositiveIntegerField(default=0)),
                ('usage_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'instructor_evaluation_forms',
            },
        ),
    ]
