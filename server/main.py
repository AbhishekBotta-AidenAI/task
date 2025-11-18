from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from io import BytesIO
import json
import numpy as np
import pandas as pd
from models import Employee
from data import mock_employees
from dotenv import load_dotenv
from ai_agent import get_ai_agent_recommendation, generate_sql_from_task
from db import execute_read_query, get_connection
import psycopg2
from psycopg2 import sql

load_dotenv()

app = FastAPI(title="Dynamic Demand Dashboard")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store employees in memory
employees_db = mock_employees.copy()


# ============================================
# Health Check
# ============================================
@app.get("/")
def root():
    return {"message": "Dynamic Demand Dashboard API Running"}


# ============================================
# Employee Endpoints
# ============================================
@app.get("/employees", response_model=List[Employee])
def get_employees():
    """Get all employees"""
    return employees_db



@app.get("/employees/{employee_id}", response_model=Employee)
def get_employee(employee_id: int):
    """Get employee by ID"""
    for emp in employees_db:
        if emp.id == employee_id:
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")


@app.get("/employees/filter", response_model=List[Employee])
def filter_employees(
    skill: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
):
    """Filter employees by skill, availability, and/or team"""
    results = employees_db.copy()

    if skill:
        results = [
            emp for emp in results
            if any(skill.lower() in s.lower() for s in emp.skills)
        ]

    if availability:
        results = [emp for emp in results if emp.availability.lower() == availability.lower()]

    if team:
        results = [emp for emp in results if emp.team.lower() == team.lower()]

    return results


# ============================================
# AI-Powered Search Endpoint
# ============================================
@app.post("/employees/ai-search", response_model=List[Employee])
def ai_search_employees(task_description: str = Query(..., description="Description of the task or requirement")):
    """
    Use AI to intelligently search for employees capable of handling a task.
    Requires GEMINI_API_KEY environment variable to be set.
    
    Example: "I need someone to build a React frontend application with TypeScript"
    """
    if not task_description or task_description.strip() == "":
        raise HTTPException(status_code=400, detail="Task description cannot be empty")
    
    try:
        suitable_employees = get_ai_agent_recommendation(task_description, employees_db)
        return suitable_employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing AI search: {str(e)}")


@app.post("/employees/ai-sql-search", response_model=List[Employee])
def ai_sql_search_employees(task_description: str = Query(..., description="Natural language query that will be translated to SQL")):
    """
    Use Gemini to generate a safe SQL SELECT for the employees table, execute it against PostgreSQL, and return matching employees.
    The Gemini model will be asked to return a single SELECT statement. The server will perform safety checks before execution.
    """
    if not task_description or task_description.strip() == "":
        raise HTTPException(status_code=400, detail="Task description cannot be empty")

    # Generate SQL using AI
    sql = generate_sql_from_task(task_description, table_name='employees')
    if not sql:
        raise HTTPException(status_code=500, detail="Failed to generate a safe SQL query for the request")

    # Additional server-side safety: allow only SELECT, disallow semicolons and dangerous keywords
    lowered = sql.lower()
    if not lowered.startswith('select') or ';' in sql:
        raise HTTPException(status_code=400, detail="Generated SQL did not pass safety checks")

    try:
        rows = execute_read_query(sql)
        # Convert rows to Employee models (best-effort mapping)
        employees_res = []
        for r in rows:
            try:
                emp = Employee(
                    id=int(r.get('id')),
                    name=r.get('name') or r.get('full_name') or 'Unknown',
                    skills=r.get('skills') if isinstance(r.get('skills'), list) else (json.loads(r.get('skills')) if r.get('skills') else []),
                    qualifications=r.get('qualifications') if isinstance(r.get('qualifications'), list) else (json.loads(r.get('qualifications')) if r.get('qualifications') else []),
                    strength=int(r.get('strength') or 0),
                    availability=r.get('availability') or 'Unknown',
                    team=r.get('team') or 'Unknown'
                )
            except Exception:
                # Skip invalid rows
                continue
            employees_res.append(emp)

        return employees_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing generated SQL: {str(e)}")


@app.post("/demands/ai-sql-search")
def demands_ai_sql_search(task_description: str = Query(..., description="Natural language query that will be translated to SQL")):
    """
    Use Gemini to generate a safe SQL SELECT for the `demands` table, execute it against PostgreSQL, and return matching demand rows.
    Returns a JSON object containing the `generated_sql` and the `rows` returned from the DB for debugging and verification.
    """
    if not task_description or task_description.strip() == "":
        raise HTTPException(status_code=400, detail="Task description cannot be empty")

    # Generate SQL using AI for the demands table
    sql = generate_sql_from_task(task_description, table_name='demands')
    if not sql:
        raise HTTPException(status_code=500, detail="Failed to generate a safe SQL query for the request")

    # Additional server-side safety: allow only SELECT, disallow semicolons and dangerous keywords
    lowered = sql.lower()
    if not lowered.startswith('select') or ';' in sql:
        raise HTTPException(status_code=400, detail="Generated SQL did not pass safety checks")

    try:
        rows = execute_read_query(sql)
        return {"generated_sql": sql, "rows": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing generated SQL: {str(e)}")

@app.post("/upload-excel")
async def upload_excel(
    file: UploadFile = File(...),
    tableName: str = Form(...)
):
    try:
        debug_log = {}

        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

        if df.empty:
            raise HTTPException(status_code=400, detail="Excel file is empty")

        # Normalize column names
        df.columns = [c.replace(" ", "_").lower() for c in df.columns]

        # Convert NaN / NaT
        df = df.replace({np.nan: None, pd.NaT: None})
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].where(df[col].notnull(), None)

        debug_log["upload_columns"] = df.columns.tolist()

        conn = get_connection()
        cur = conn.cursor()

        # Check table existence
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = %s
            );
        """, (tableName.lower(),))
        table_exists = cur.fetchone()[0]

        debug_log["table_exists"] = table_exists

        # Auto-detect unique key for UPSERT
        preferred_keys = ["id", "rolecode", "project_id"]

        upsert_key = None
        for key in preferred_keys:
            if key in df.columns:
                upsert_key = key
                break

        debug_log["upsert_key"] = upsert_key

        # If table does not exist → create table with SERIAL id if missing
        if not table_exists:
            debug_log["action"] = "creating_new_table"

            column_defs = []
            for col in df.columns:
                series = df[col]
                if pd.api.types.is_integer_dtype(series):
                    dtype = "INTEGER"
                elif pd.api.types.is_float_dtype(series):
                    dtype = "FLOAT"
                elif pd.api.types.is_bool_dtype(series):
                    dtype = "BOOLEAN"
                elif pd.api.types.is_datetime64_any_dtype(series):
                    dtype = "TIMESTAMP"
                else:
                    dtype = "TEXT"
                column_defs.append(f'"{col}" {dtype}')

            # If Excel doesn't include id, add SERIAL id
            if "id" not in df.columns:
                create_table_sql = f"""
                    CREATE TABLE "{tableName}" (
                        internal_id SERIAL PRIMARY KEY,
                        {", ".join(column_defs)}
                    );
                """
            else:
                # Use Excel id as primary key
                create_table_sql = f"""
                    CREATE TABLE "{tableName}" (
                        {", ".join(column_defs)},
                        PRIMARY KEY (id)
                    );
                """

            debug_log["create_table_sql"] = create_table_sql
            cur.execute(create_table_sql)
            conn.commit()

        else:
            debug_log["action"] = "upsert_into_existing_table"

        cols = df.columns.tolist()

        if upsert_key:
            # UPSERT query
            insert_sql = sql.SQL("""
                INSERT INTO {table} ({fields})
                VALUES ({values})
                ON CONFLICT ({key})
                DO UPDATE SET
                {updates}
            """).format(
                table=sql.Identifier(tableName),
                fields=sql.SQL(", ").join(map(sql.Identifier, cols)),
                values=sql.SQL(", ").join(sql.Placeholder() * len(cols)),
                key=sql.Identifier(upsert_key),
                updates=sql.SQL(", ").join(
                    sql.SQL(f"{col} = EXCLUDED.{col}") for col in cols if col != upsert_key
                ),
            )
        else:
            # Insert only
            insert_sql = sql.SQL("""
                INSERT INTO {table} ({fields})
                VALUES ({values})
            """).format(
                table=sql.Identifier(tableName),
                fields=sql.SQL(", ").join(map(sql.Identifier, cols)),
                values=sql.SQL(", ").join(sql.Placeholder() * len(cols)),
            )

        inserted = 0
        updated = 0

        for _, row in df.iterrows():
            try:
                cur.execute(insert_sql, list(row.values))
                inserted += 1
            except Exception:
                updated += 1

        conn.commit()
        cur.close()
        conn.close()

        debug_log["inserted"] = inserted
        debug_log["updated"] = updated

        return {
            "message": f"Upload completed for table '{tableName}'",
            "debug": debug_log
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tables")
def list_tables():
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)

        tables = [row[0] for row in cur.fetchall()]

        cur.close()
        conn.close()

        return {"tables": tables}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/demands/analytics")
def analyze_demands():
    """
    Analyze the demands table and return insights suitable for charts.
    Includes:
    - Role frequency
    - Location frequency
    - Status distribution
    - Demand probability distribution
    - Monthly demand trend
    - Avg billing rate per role
    """
    try:
        # Fetch all demand rows
        rows = execute_read_query("SELECT * FROM demands")

        if not rows:
            return {"message": "No demand data available", "data": {}}

        df = pd.DataFrame(rows)

        # Normalize column names
        df.columns = [c.lower() for c in df.columns]

        insights = {}

        # -----------------------------
        # 1️⃣ Role Demand Count
        # -----------------------------
        if "role" in df.columns:
            role_counts = df["role"].value_counts().reset_index().rename(
                columns={"index": "role", "role": "count"}
            )
            insights["role_demand"] = role_counts.to_dict(orient="records")

        # -----------------------------
        # 2️⃣ Location Demand Count
        # -----------------------------
        if "location" in df.columns:
            loc_counts = df["location"].value_counts().reset_index().rename(
                columns={"index": "location", "location": "count"}
            )
            insights["location_demand"] = loc_counts.to_dict(orient="records")

        # -----------------------------
        # 3️⃣ Status Distribution
        # -----------------------------
        if "status" in df.columns:
            status_counts = df["status"].value_counts().reset_index().rename(
                columns={"index": "status", "status": "count"}
            )
            insights["status_distribution"] = status_counts.to_dict(orient="records")

        # -----------------------------
        # 4️⃣ Probability Distribution
        # -----------------------------
        if "probability" in df.columns:
            prob_counts = df["probability"].value_counts().reset_index().rename(
                columns={"index": "probability", "probability": "count"}
            )
            insights["probability_distribution"] = prob_counts.to_dict(orient="records")

        # -----------------------------
        # 5️⃣ Monthly Demand Trend (from startMonth or originalStartDate)
        # -----------------------------
        if "startmonth" in df.columns:
            df["startmonth"] = df["startmonth"].astype(str)
            trend = df["startmonth"].value_counts().sort_index().reset_index()
            trend.columns = ["month", "count"]
            insights["monthly_trend"] = trend.to_dict(orient="records")

        elif "originalstartdate" in df.columns:
            df["month"] = pd.to_datetime(df["originalstartdate"]).dt.to_period("M").astype(str)
            trend = df["month"].value_counts().sort_index().reset_index()
            trend.columns = ["month", "count"]
            insights["monthly_trend"] = trend.to_dict(orient="records")

        # -----------------------------
        # 6️⃣ Billing Rate per Role
        # -----------------------------
        if "billingrate" in df.columns and "role" in df.columns:
            billing = (
                df.groupby("role")["billingrate"]
                .mean()
                .reset_index()
                .rename(columns={"billingrate": "avg_billing_rate"})
                .sort_values("avg_billing_rate", ascending=False)
            )
            insights["billing_rate_by_role"] = billing.to_dict(orient="records")

        # -----------------------------
        # 7️⃣ Allocation Percentage Analysis
        # -----------------------------
        if "allocationpercentage" in df.columns:
            alloc_data = (
                df["allocationpercentage"]
                .dropna()
                .value_counts()
                .reset_index()
                .rename(columns={"index": "allocation", "allocationpercentage": "count"})
            )
            insights["allocation_distribution"] = alloc_data.to_dict(orient="records")

        return {"message": "Demand analytics processed", "analytics": insights}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/demands")
def analytics_demands():
    """
    Full analytics for the demands table.
    Ensures ALL values are converted to native Python types
    so FastAPI JSON encoder doesn't break.
    """

    try:
        rows = execute_read_query("SELECT * FROM demands;")
        if not rows:
            return {"error": "No demand data found"}

        df = pd.DataFrame(rows)
        df = df.replace({np.nan: None, pd.NaT: None})

        # Convert date columns
        date_cols = ["originalstartdate", "allocationenddate", "fulfillmentdate", "addedon", "updatedon"]
        for col in date_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors="coerce")

        # ---------- SAFE CONVERTER ----------
        def safe_int_dict(series):
            return {str(k): int(v) for k, v in series.items()}

        def safe_str_dict(series):
            return {str(k): str(v) for k, v in series.items()}

        def safe_float(val):
            return float(val) if val is not None else 0.0

        # ---------- ANALYTICS ----------

        # Role distribution
        role_dist = (
            df["role"]
            .fillna("Unknown")
            .apply(lambda x: " ".join(str(x).split()))
            .value_counts()
        )
        role_dist = safe_int_dict(role_dist)

        # Location distribution
        location_dist = safe_int_dict(df["location"].fillna("Unknown").value_counts())

        # Status
        status_dist = safe_int_dict(df["status"].fillna("Unknown").value_counts())

        # Probability
        probability_dist = safe_int_dict(df["probability"].fillna("Unknown").astype(str).value_counts())

        # Months
        if "startmonth" in df.columns:
            month_dist = safe_int_dict(df["startmonth"].fillna("Unknown").value_counts().sort_index())
        else:
            month_dist = {}

        # Accounts
        account_dist = safe_int_dict(df["account_id"].fillna("Unknown").value_counts())

        # Averages
        avg_billing = safe_float(df["billingrate"].dropna().mean() if "billingrate" in df else 0)
        avg_allocation = safe_float(df["allocationpercentage"].dropna().mean() if "allocationpercentage" in df else 0)

        # Top roles
        top_roles = safe_int_dict(
            df["role"].fillna("Unknown").value_counts().head(10)
        )

        return {
            "roles": role_dist,
            "locations": location_dist,
            "status": status_dist,
            "probability": probability_dist,
            "months": month_dist,
            "accounts": account_dist,
            "avg_billing_rate": avg_billing,
            "avg_allocation": avg_allocation,
            "top_roles": top_roles
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/demands")
def get_all_demands():
    try:
        rows = execute_read_query("SELECT * FROM demands ORDER BY id DESC;")
        return rows   # already Python-native because read_query returns dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
