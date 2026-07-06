import random
import re
from utils.db import query_db, execute_db

class DuplicateBuildNumberError(ValueError):
    """Raised when a generated build number already exists in the database."""
    pass

class DeploymentNotFoundError(ValueError):
    """Raised when a target deployment for rollback or redeploy is not found."""
    pass

class DeploymentService:
    def get_history(self) -> list:
        """Retrieve all deployment history entries from SQLite, sorted by newest first."""
        deployments = query_db("SELECT * FROM deployment_history ORDER BY id DESC")
        return deployments if deployments is not None else []

    def _generate_build_number(self) -> int:
        """
        Automatically generate the next build number.
        Parses all digits from the latest build number string and increments it.
        If no deployments exist, defaults to 100.
        """
        last_build = query_db("SELECT build_number FROM deployment_history ORDER BY id DESC LIMIT 1", one=True)
        if last_build and last_build['build_number']:
            # Extract only digits from the build number (handling format like #1024 or plain 1024)
            digits = ''.join(filter(str.isdigit, last_build['build_number']))
            if digits:
                return int(digits) + 1
        return 100

    def _generate_version(self) -> str:
        """
        Automatically generate and increment version (e.g. v1.0.0, v1.0.1, v1.0.2).
        Increments the patch version from the latest deployment version.
        Defaults to v1.0.0 if no history exists.
        """
        last_dep = query_db("SELECT version FROM deployment_history ORDER BY id DESC LIMIT 1", one=True)
        if last_dep and last_dep['version']:
            version_str = last_dep['version']
            # Regular expression to match standard semver pattern vX.Y.Z
            match = re.search(r'v?(\d+)\.(\d+)\.(\d+)', version_str)
            if match:
                major, minor, patch = map(int, match.groups())
                return f"v{major}.{minor}.{patch + 1}"
        return "v1.0.0"

    def deploy(self, branch: str = 'main', triggered_by: str = 'Admin') -> dict:
        """
        Create a new deployment record.
        Generates build number, version, commit, duration, status, and inserts into DB.
        """
        build_number = self._generate_build_number()
        version = self._generate_version()
        
        # Validation for Duplicate Build Number
        existing = query_db("SELECT id FROM deployment_history WHERE build_number = ?", (str(build_number),), one=True)
        if existing:
            raise DuplicateBuildNumberError(f"Duplicate build number error: Build {build_number} already exists.")

        # Generate realistic mockup data
        commit_id = ''.join(random.choices('0123456789abcdef', k=8))
        duration = f"{random.randint(2, 5)} seconds"
        status = "Success"  # Simulation default status

        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        new_id = execute_db(query, (str(build_number), version, commit_id, branch, status, duration, triggered_by))
        
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)
        if not new_deployment:
            raise Exception("Database error: Failed to save the deployment record.")

        return {
            "success": True,
            "message": "Deployment completed successfully.",
            "build_number": build_number,
            "version": version,
            "status": status,
            "deployment": dict(new_deployment)
        }

    def rollback(self, deployment_id: int, triggered_by: str = 'Operator (Rollback)') -> dict:
        """
        Trigger rollback to a previous deployment.
        Creates a new history record pointing to the target deployment's version, commit, and branch.
        """
        target = query_db("SELECT * FROM deployment_history WHERE id = ?", (deployment_id,), one=True)
        if not target:
            raise DeploymentNotFoundError(f"Target deployment with ID {deployment_id} not found.")

        build_number = self._generate_build_number()
        
        # Validation for Duplicate Build Number
        existing = query_db("SELECT id FROM deployment_history WHERE build_number = ?", (str(build_number),), one=True)
        if existing:
            raise DuplicateBuildNumberError(f"Duplicate build number error: Build {build_number} already exists.")

        version = f"{target['version']}-rb"
        commit_id = target['commit_id']
        branch = target['branch']
        status = "Success"
        duration = "2 seconds"

        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        new_id = execute_db(query, (str(build_number), version, commit_id, branch, status, duration, triggered_by))
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)
        
        return {
            "success": True,
            "message": f"Successfully rolled back to Build {target['build_number']} (Version {target['version']})",
            "build_number": build_number,
            "version": version,
            "status": status,
            "deployment": dict(new_deployment)
        }

    def redeploy(self, deployment_id: int, triggered_by: str = 'Operator (Redeploy)') -> dict:
        """
        Trigger redeployment of an existing deployment build.
        Creates a new history record using the same configuration.
        """
        target = query_db("SELECT * FROM deployment_history WHERE id = ?", (deployment_id,), one=True)
        if not target:
            raise DeploymentNotFoundError(f"Target deployment with ID {deployment_id} not found.")

        build_number = self._generate_build_number()

        # Validation for Duplicate Build Number
        existing = query_db("SELECT id FROM deployment_history WHERE build_number = ?", (str(build_number),), one=True)
        if existing:
            raise DuplicateBuildNumberError(f"Duplicate build number error: Build {build_number} already exists.")

        version = target['version']
        commit_id = target['commit_id']
        branch = target['branch']
        status = "Success"
        duration = "2 seconds"

        query = """
            INSERT INTO deployment_history (build_number, version, commit_id, branch, status, duration, triggered_by, deployment_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        """
        new_id = execute_db(query, (str(build_number), version, commit_id, branch, status, duration, triggered_by))
        new_deployment = query_db("SELECT * FROM deployment_history WHERE id = ?", (new_id,), one=True)

        return {
            "success": True,
            "message": f"Successfully redeployed Build {target['build_number']}",
            "build_number": build_number,
            "version": version,
            "status": status,
            "deployment": dict(new_deployment)
        }
