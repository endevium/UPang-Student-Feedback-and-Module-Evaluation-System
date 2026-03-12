from django.db import migrations, models


STATUS_MIGRATION_SQL = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'faculty'
          AND column_name = 'status'
          AND data_type = 'boolean'
    ) THEN
        ALTER TABLE faculty
        ALTER COLUMN status DROP DEFAULT;

        ALTER TABLE faculty
        ALTER COLUMN status TYPE varchar(20)
        USING CASE
            WHEN status IS TRUE THEN 'active'
            ELSE 'archived'
        END;

        ALTER TABLE faculty
        ALTER COLUMN status SET DEFAULT 'active';

        UPDATE faculty
        SET status = 'active'
        WHERE status IS NULL OR status = '';

        ALTER TABLE faculty
        ALTER COLUMN status SET NOT NULL;
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'faculty'
          AND column_name = 'status'
    ) THEN
        UPDATE faculty
        SET status = 'active'
        WHERE status IS NULL OR status = '';

        ALTER TABLE faculty
        ALTER COLUMN status TYPE varchar(20)
        USING status::varchar;

        ALTER TABLE faculty
        ALTER COLUMN status SET DEFAULT 'active';
    ELSE
        ALTER TABLE faculty
        ADD COLUMN status varchar(20) NOT NULL DEFAULT 'active';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'students' AND column_name = 'status'
    ) THEN
        ALTER TABLE students
        ADD COLUMN status varchar(20) NOT NULL DEFAULT 'active';
    ELSE
        UPDATE students
        SET status = 'active'
        WHERE status IS NULL OR status = '';

        ALTER TABLE students
        ALTER COLUMN status TYPE varchar(20)
        USING status::varchar;

        ALTER TABLE students
        ALTER COLUMN status SET DEFAULT 'active';
    END IF;
END $$;
"""


STATUS_REVERSE_SQL = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'faculty' AND column_name = 'status'
    ) THEN
        ALTER TABLE faculty
        ALTER COLUMN status DROP DEFAULT;

        ALTER TABLE faculty
        ALTER COLUMN status TYPE boolean
        USING CASE
            WHEN lower(status) = 'active' THEN TRUE
            ELSE FALSE
        END;

        ALTER TABLE faculty
        ALTER COLUMN status SET DEFAULT TRUE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'students' AND column_name = 'status'
    ) THEN
        ALTER TABLE students
        DROP COLUMN status;
    END IF;
END $$;
"""


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_module_year_level'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(STATUS_MIGRATION_SQL, reverse_sql=STATUS_REVERSE_SQL),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name='faculty',
                    name='status',
                    field=models.CharField(
                        choices=[('active', 'Active'), ('archived', 'Archived')],
                        default='active',
                        max_length=20,
                    ),
                ),
                migrations.AddField(
                    model_name='student',
                    name='status',
                    field=models.CharField(
                        choices=[('active', 'Active'), ('archived', 'Archived')],
                        default='active',
                        max_length=20,
                    ),
                ),
            ],
        ),
    ]
