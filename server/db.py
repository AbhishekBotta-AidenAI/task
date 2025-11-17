import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# Read DB connection from env
DB_HOST = os.getenv("PGHOST", "localhost")
DB_PORT = os.getenv("PGPORT", "5432")
DB_NAME = os.getenv("PGDATABASE", "DemandPlanning")
DB_USER = os.getenv("PGUSER", "postgres")
DB_PASS = os.getenv("PGPASSWORD", "")


def get_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
        )
        return conn
    except Exception as e:
        # Provide a clearer error message to help debugging env/config issues
        msg = (
            f"Error connecting to Postgres at {DB_HOST}:{DB_PORT} using database '{DB_NAME}' and user '{DB_USER}': {e}"
        )
        raise RuntimeError(msg) from e


def execute_read_query(query: str, params=None):
    """
    Execute a read-only SQL query and return rows as list of dicts.
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params or ())
        rows = cur.fetchall()
        cur.close()
        # convert to normal Python types (e.g., json fields)
        results = []
        for r in rows:
            row = dict(r)
            # attempt to decode JSON-like columns if strings
            for k, v in row.items():
                if isinstance(v, str):
                    try:
                        parsed = json.loads(v)
                        row[k] = parsed
                    except Exception:
                        pass
            results.append(row)
        return results
    finally:
        if conn:
            conn.close()
