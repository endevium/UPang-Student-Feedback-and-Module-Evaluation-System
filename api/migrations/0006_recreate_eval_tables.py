from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_split_evaluation_forms'),
    ]

    operations = [
        # Drop existing type-specific tables if they exist, then recreate with the requested schema
        migrations.RunSQL(
            sql="""
            DROP TABLE IF EXISTS module_evaluation_forms;
            DROP TABLE IF EXISTS instructor_evaluation_forms;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        migrations.CreateModel(
            name='ModuleEvaluationForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subject_code', models.CharField(max_length=200)),
                ('subject_description', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Draft', 'Draft')], default='Draft', max_length=20)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'module_evaluation_forms',
            },
        ),

        migrations.CreateModel(
            name='InstructorEvaluationForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instructor_name', models.CharField(max_length=200)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Draft', 'Draft')], default='Draft', max_length=20)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'instructor_evaluation_forms',
            },
        ),
    ]
