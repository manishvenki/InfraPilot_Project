-- Seed data for InfraPilot DevOps Automation Suite

INSERT INTO deployment_history (build_number, version, commit_id, branch, status, deployment_time, duration, triggered_by)
VALUES 
('#1024', 'v1.2.0', 'a8f9c0e', 'main', 'SUCCESS', '2026-07-04 12:00:00', '2m 14s', 'John Doe'),
('#1023', 'v1.1.9', 'b7d8a1c', 'main', 'SUCCESS', '2026-07-04 10:30:00', '1m 58s', 'GitHub Actions'),
('#1022', 'v1.1.9-rc1', 'c6b5e4d', 'develop', 'SUCCESS', '2026-07-04 09:15:00', '2m 05s', 'GitHub Actions'),
('#1021', 'v1.1.8', 'd5a4f3e', 'develop', 'FAILED', '2026-07-04 08:00:00', '0m 45s', 'Jane Smith'),
('#1020', 'v1.1.7', 'e4c3d2b', 'main', 'SUCCESS', '2026-07-03 16:45:00', '2m 10s', 'GitHub Actions');
