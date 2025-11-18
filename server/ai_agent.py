import os
import json
import google.generativeai as genai
from typing import List
from models import Employee
from dotenv import load_dotenv
from db import execute_read_query

load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def get_ai_agent_recommendation(task_description: str, employees: List[Employee]) -> List[Employee]:
    """
    Use Gemini AI to analyze task description and recommend suitable employees.
    
    Args:
        task_description: Description of the task/requirement
        employees: List of all available employees
    
    Returns:
        List of employees suitable for the task
    """
    
    if not API_KEY:
        # Fallback to basic keyword matching if API key not configured
        return basic_keyword_matching(task_description, employees)
    
    try:
        # Prepare employee data for the AI model
        employees_data = []
        for emp in employees:
            employees_data.append({
                "id": emp.id,
                "name": emp.name,
                "skills": emp.skills,
                "qualifications": emp.qualifications,
                "strength": emp.strength,
                "availability": emp.availability,
                "team": emp.team
            })
        
        # Create the prompt for Gemini
        prompt = f"""
        You are an expert at matching employees to tasks based on their skills and qualifications.

        Given the following task description and list of employees with their details, 
        determine which employees are most suitable to complete this task.

        TASK DESCRIPTION:
        {task_description}

        AVAILABLE EMPLOYEES:
        {json.dumps(employees_data, indent=2)}

        Please analyze the task and employee profiles, then respond with:
        1. A brief analysis of the task requirements
        2. A JSON list of employee IDs who are suitable for this task, ranked by suitability (most suitable first)

        Format your response as JSON with this structure:
        {{
            "task_analysis": "Brief analysis of what skills/experience the task requires",
            "suitable_employee_ids": [id1, id2, id3, ...],
            "reasoning": "Brief explanation of why these employees match the task"
        }}

        Important: Return ONLY valid JSON, no additional text.
        """
        
        # Call Gemini API
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        # Parse the response
        response_text = response.text.strip()
        
        # Try to extract JSON if there's extra text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]
        
        result = json.loads(response_text)
        suitable_ids = result.get("suitable_employee_ids", [])
        
        # Return employees in the order recommended by AI
        recommended_employees = []
        for emp_id in suitable_ids:
            for emp in employees:
                if emp.id == emp_id:
                    recommended_employees.append(emp)
                    break
        
        return recommended_employees
    
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback to basic matching
        return basic_keyword_matching(task_description, employees)


def basic_keyword_matching(task_description: str, employees: List[Employee]) -> List[Employee]:
    """
    Fallback basic keyword matching when AI is not available.
    Matches employees based on skill keywords in the task description.
    """
    task_lower = task_description.lower()
    scored_employees = []
    
    for emp in employees:
        score = 0
        
        # Score based on skill matches
        for skill in emp.skills:
            if skill.lower() in task_lower:
                score += 2
        
        # Score based on qualifications
        for qual in emp.qualifications:
            if qual.lower() in task_lower:
                score += 1
        
        # Bonus for availability
        if emp.availability == "Available":
            score += 1
        elif emp.availability == "Partially Available":
            score += 0.5
        
        if score > 0:
            scored_employees.append((emp, score))
    
    # Sort by score descending
    scored_employees.sort(key=lambda x: x[1], reverse=True)
    
    return [emp for emp, score in scored_employees]




# Ensure your API key is set
# API_KEY = os.getenv("GEMINI_API_KEY")
# genai.configure(api_key=API_KEY)

import re
import os

def generate_sql_from_task(task_description: str, table_name: str = 'demands') -> str | None:
    """
    Generates safe SQL. 
    Fixes 'tuple index out of range' by escaping % to %%.
    Fixes 400 Bad Request by removing trailing semicolons.
    """
    # 1. CONFIGURATION
    # if not API_KEY: return None 

    allowed_columns = [
        'id', 'sno', 'project_id', 'account_id', 'role', 'roleCode', 'location', 'revised',
        'originalStartDate', 'allocationEndDate', 'allocationPercentage', 'probability', 'status',
        'resourceMapped', 'comment', 'lastUpdatedBy', 'updatedOn', 'addedBy', 'addedOn',
        'startMonth', 'billingRate', 'fulfillmentDate'
    ]

    # 2. FETCH EXISTING ROLES (Context)
    try:
        rows = execute_read_query(f"SELECT DISTINCT role FROM {table_name} WHERE role IS NOT NULL;")
        roles_list = [str(r.get('role')).strip() for r in rows if r.get('role')]
    except Exception:
        # Fallback roles for testing/safety
        roles_list = ["Sr. Frontend Developer", "Backend Engineer", "DevOps Specialist", "React Developer"]

    roles_context = "\n".join([f"- {r}" for r in roles_list])

    # 3. PROMPT
    prompt = f"""
You are a PostgreSQL expert. Convert the user's requirement into ONE SAFE SELECT query.

### CONTEXT (Existing Roles):
{roles_context}

### INSTRUCTIONS:
1. **Semantic Matching:** Map skills to roles (e.g., "React" -> "Sr. Frontend Developer").
2. **Filtering:** Use `ILIKE` with wildcards for flexibility.
   - Example: `WHERE role ILIKE '%Frontend%'`
3. **Constraints:**
   - Table: {table_name}
   - Columns: {', '.join(allowed_columns)} OR `*`.
   - NO semicolon at the end.
   - NO `INSERT`, `UPDATE`, `DELETE`.

### USER REQUEST:
"{task_description}"
"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # 4. CLEANUP RESPONSE
        # Remove Markdown fences
        if "```" in raw:
            parts = raw.split("```")
            for part in parts:
                if "select" in part.lower():
                    raw = part
                    break
        
        if raw.lower().startswith("sql"):
            raw = raw[3:].strip()

        sql = raw.strip()
        sql = " ".join(sql.split()) # Flatten to one line
        sql = re.sub(r"from\s+\w+", f"FROM {table_name}", sql, flags=re.IGNORECASE)

        # --- CRITICAL FIX 1: REMOVE TRAILING SEMICOLON ---
        if sql.endswith(";"):
            sql = sql[:-1]

        # 5. VALIDATION
        lowered = sql.lower()

        # Must start with SELECT
        if not lowered.startswith("select"):
            print("❌ SQL does not start with SELECT")
            return None

        # Forbidden commands
        forbidden = ['insert ', 'update ', 'delete ', 'drop ', 'alter ', 'create ', 'truncate ']
        if any(f in lowered for f in forbidden):
            print("❌ Forbidden SQL command found")
            return None

        # Column Validation (Allows *)
        try:
            match = re.search(r"select\s+(.*?)\s+from", lowered, re.DOTALL)
            if match:
                select_clause = match.group(1).strip()
                if select_clause != "*":
                    selected_cols = [c.strip().split(" ")[0] for c in select_clause.split(",")]
                    for col in selected_cols:
                        clean_col = col.split(".")[-1]
                        if clean_col not in allowed_columns:
                            print(f"❌ Column not allowed: {clean_col}")
                            return None
            else:
                print("❌ Could not parse SELECT clause")
                return None
        except Exception:
            return None

        # --- CRITICAL FIX 2: ESCAPE % SIGNS ---
        # This prevents "tuple index out of range" errors in Python DB drivers
        final_sql = sql.replace("%", "%%")

        print(f"\nDEBUG FINAL SQL (SENT TO DB):\n{final_sql}\n")
        
        return final_sql

    except Exception as e:
        print(f"❌ Gemini SQL generation error: {e}")
        return None