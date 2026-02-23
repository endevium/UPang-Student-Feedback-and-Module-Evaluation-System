# Maintenance Notes — UPang SFME

Purpose: concise, actionable maintenance checklist and runbooks for the project.

## 👥 Owners & Contacts
| Role | Name | Responsibility |
| :--- | :--- | :--- |
| **Project Lead** | **John Rasheed C. Paner** | Overall system architecture and delivery. |
| **Backend Owners** | **John Rasheed C. Paner / Gabriel Jose S. Esperanza** | Django APIs, Authentication, and Database. |
| **Frontend Owner** | **John Cristopher B. Raguindin** | React (Vite) interface and UI/UX. |
| **QA/Docs** | **April Joy M. Bravo** | Testing, Documentation, and Model validation. |

**Where to look**
- **Backend settings:** `sfme/settings.py` and `config/settings.py`.
- **Django manage scripts:** `manage.py` (root) and `backend/manage.py`.
- **Frontend app:** `frontend_vite/upang-sfme`.
- **Logs:** `log/` and `logs/` directories.
- **Sentiment model:** `sentiment_model_final/` (model.safetensors, tokenizer files).

Daily
- **Backups:** Verify automated backups completed; check backup logs/size.
- **Alerts:** Review critical alerts (CPU, disk, replication lag, error spikes).
- **Disk:** Check free disk on DB and log volumes.
- **Auth failures:** Review unusual login/auth failures.

Weekly
- **Slow queries:** Review slow-query/general logs and top offenders.
- **Log shipping:** Verify logs forwarded to central logging/SIEM.
- **Replication health:** Check replication lag and replication errors.
- **Dependency updates:** Scan for critical security updates (`pip`/`npm audit`).

Monthly
- **Patching:** Apply tested patches to non-production, then schedule production window.
- **DB maintenance:** Run ANALYZE/VACUUM/OPTIMIZE as appropriate for DB engine.
- **Credentials:** Rotate service credentials or verify rotation automation works.
- **Restore test:** Perform a restore from backup to a test instance.

Quarterly
- **Security review:** Audit user roles/permissions and revoke unused accounts.
- **DR test:** Execute a disaster recovery drill with stakeholders.
- **Performance tuning:** Index review, schema drift checks, query plan analysis.

Annually
- **Full DR rehearsal:** Validate RTO/RPO and update runbooks.
- **Capacity planning:** Review growth trends and plan scaling.

Security & Hardening (high priority)
- **Secrets:** Move all credentials into a vault (HashiCorp Vault / AWS Secrets Manager / Azure Key Vault). Do NOT keep secrets in `myenv` in the repo.
- **Least privilege:** Ensure DB users have minimal privileges (no app superusers).
- **TLS:** Enforce TLS for all DB and API traffic.
- **Rotate keys/certs:** Monitor expiry and rotate TLS/KMS keys before expiration.
- **Audit logging:** Enable DB/audit logs and ship them to a central collector.
- **reCAPTCHA & keys:** Verify `RECAPTCHA_SITE_KEY` and server secret are configured and rotated periodically (referenced in `src/components/LoginModal.jsx`).

Backups & Restore (runbook)
- Backup verification:
  - Ensure backups are created (DB snapshots/pg_dump or managed snapshots) and checksums match.
  - Verify off-site and encrypted storage.
- Quick DB backup commands (example for Django + Postgres):
```bash
# Postgres full dump (example)
pg_dump -U <db_user> -h <db_host> -Fc <db_name> -f /path/to/backup-$(date +%F).dump

# Django fixture (partial, not a full binary dump)
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > backup.json
```
- Restore (example):
```bash
# restore postgres custom dump
pg_restore -U <db_user> -h <db_host> -d <db_name> /path/to/backup.dump --clean

# load django fixture
python manage.py loaddata backup.json
```

Frontend build & release
- Dev: `npm run dev` inside `frontend_vite/upang-sfme` for local development.
- Build: `npm run build` and then copy the produced static files into the Django static pipeline or serve via CDN.
- Commands:
```bash
cd frontend_vite/upang-sfme
npm ci
npm run build
```

Backend deploy & migrations
- Before deploy: run tests and migrations in staging.
- Migrations:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
```
- Keep migrations reviewed in PRs and do zero-downtime migration planning for large schema changes.

Testing & QA
- Run unit tests: `python manage.py test` (backend) and configured frontend tests if present.
- Add lightweight integration smoke tests that run after deploy.

CI/CD recommendations
- Run lint, unit tests, build, and a security scan on each PR.
- Block merges on failing tests or high-severity vulnerabilities.

Monitoring & Logging
- Forward application logs and DB logs to a central collector.
- Monitor: backup success, replication lag, slow queries, error rate, auth failures.

Model (sentiment) maintenance
- Track model version and training dataset in version control or metadata store.
- Retrain and validate periodically; store new artifacts in `sentiment_model_final/` and update config.
- Run inference performance tests after model changes.

Secrets & environment
- Keep runtime environment variables out of the repo. Store per-environment env files encrypted or use a secret store.
- Document required environment variables in `DOCUMENTATION/README.md` or the new maintenance notes.

Runbook snippets to add later (expand as separate files)
- `DOCUMENTATION/RUNBOOK_BACKUP_RESTORE.md` — step-by-step restore playbook.
- `DOCUMENTATION/RUNBOOK_DEPLOY.md` — deploy, rollback, and health-check commands.
- `DOCUMENTATION/RUNBOOK_SECURITY.md` — incident steps for key compromise, unauthorized access.

Next steps
- Customize owners/contact details and add runbook details for backup/restore and deploy.
- Automate backups verification and add monitoring alerts for failed backups.
- Implement secrets vault and rotate critical keys.

---
