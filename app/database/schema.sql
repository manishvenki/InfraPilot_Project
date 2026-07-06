-- Schema for InfraPilot DevOps Automation Suite

-- Table: deployment_history
CREATE TABLE IF NOT EXISTS deployment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_number TEXT NOT NULL,
    version TEXT NOT NULL,
    commit_id TEXT NOT NULL,
    branch TEXT NOT NULL,
    status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'IN_PROGRESS', 'PENDING'
    deployment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration TEXT NOT NULL, -- e.g., '2m 15s'
    triggered_by TEXT NOT NULL -- e.g., 'GitHub Actions', 'John Doe'
);
