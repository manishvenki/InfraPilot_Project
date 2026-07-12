import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'infrapilot-dev-secret-key-13579')
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
    if os.path.exists(os.path.join(os.path.dirname(CURRENT_DIR), 'database')):
        BASE_DIR = os.path.dirname(CURRENT_DIR)
    else:
        BASE_DIR = CURRENT_DIR

    
    # Path configurations for SQLite
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'infrapilot.db')
    SCHEMA_PATH = os.path.join(BASE_DIR, 'database', 'schema.sql')
    INIT_PATH = os.path.join(BASE_DIR, 'database', 'init.sql')
    
    # Flask settings
    DEBUG = True
    PORT = 5000
