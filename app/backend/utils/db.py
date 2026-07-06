import sqlite3
import os
from config import Config

def get_db_connection():
    """Establish a connection to the SQLite database with dict/Row row factory."""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database schema and seeds if the database is uninitialized."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(Config.DATABASE_PATH), exist_ok=True)
    
    # Check if the tables exist
    conn = get_db_connection()
    try:
        tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='deployment_history';").fetchall()
        table_exists = len(tables) > 0
    except sqlite3.Error:
        table_exists = False
    finally:
        conn.close()

    if not table_exists:
        print("Database not initialized. Creating schema and seeding...")
        conn = get_db_connection()
        try:
            if os.path.exists(Config.SCHEMA_PATH):
                with open(Config.SCHEMA_PATH, 'r') as f:
                    conn.executescript(f.read())
            else:
                print(f"Warning: Schema file not found at {Config.SCHEMA_PATH}")

            if os.path.exists(Config.INIT_PATH):
                with open(Config.INIT_PATH, 'r') as f:
                    conn.executescript(f.read())
            else:
                print(f"Warning: Seed file not found at {Config.INIT_PATH}")
                
            conn.commit()
            print("Database initialization completed successfully.")
        except Exception as e:
            print(f"Error during database initialization: {e}")
            conn.rollback()
        finally:
            conn.close()
    else:
        print("Database already initialized.")

def query_db(query, args=(), one=False):
    """Query the database and return a list of dictionaries, or one dictionary if one=True."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(query, args)
        rv = cur.fetchall()
        # Convert sqlite3.Row to list of dicts for JSON serialization compatibility
        result = [dict(ix) for ix in rv]
        return (result[0] if result else None) if one else result
    except sqlite3.Error as e:
        print(f"Database query error: {e}")
        return None
    finally:
        conn.close()

def execute_db(query, args=()):
    """Execute a database query (INSERT, UPDATE, DELETE) and commit."""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(query, args)
        conn.commit()
        lastrowid = cur.lastrowid
        return lastrowid
    except sqlite3.Error as e:
        print(f"Database execution error: {e}")
        conn.rollback()
        raise e
    finally:
        conn.close()
