import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'infrapilot-dev-secret-key-13579')
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Path configurations for SQLite
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'infrapilot.db')
    SCHEMA_PATH = os.path.join(BASE_DIR, 'database', 'schema.sql')
    INIT_PATH = os.path.join(BASE_DIR, 'database', 'init.sql')
    
    # Flask settings
    DEBUG = True
    PORT = 5000
