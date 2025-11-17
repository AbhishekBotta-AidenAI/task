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


def generate_sql_from_task(task_description: str, table_name: str = 'demands') -> str | None:
    """
    Use Gemini to generate a safe SELECT SQL query for the given task description and table.
    Returns the SQL string or None on failure.
    The generated SQL MUST be a single SELECT statement (no semicolons, no DDL/DML).
    """
    if not API_KEY:
        return None

    # Define allowed columns for demands table
    allowed_columns = [
        'id', 'sno', 'project_id', 'account_id', 'role', 'roleCode', 'location', 'revised',
        'originalStartDate', 'allocationEndDate', 'allocationPercentage', 'probability', 'status',
        'resourceMapped', 'comment', 'lastUpdatedBy', 'updatedOn', 'addedBy', 'addedOn',
        'startMonth', 'billingRate', 'fulfillmentDate', 'created_at'
    ]

    # Try to fetch distinct roles from the demands table so Gemini knows which roles exist
    roles_list = []
    try:
        rows = execute_read_query(f"SELECT DISTINCT role FROM {table_name} WHERE role IS NOT NULL;")
        roles_list = [r.get('role') for r in rows if r.get('role')]
    except Exception:
        roles_list = []

    prompt = f"""
You are an assistant that translates natural language requests into a single, safe PostgreSQL SELECT query.

Generate one SELECT statement (no semicolons, no additional text) against the table `{table_name}` to find project demands that match the requirement below.

Constraints:
- Output only the SQL SELECT statement and nothing else.
- The statement must be a single SELECT (no INSERT/UPDATE/DELETE/DROP/etc.).
- Do not include any backticks, code fences, or surrounding explanation.
- Only select from these columns: {', '.join(allowed_columns)}.
- If filters are required, use WHERE conditions only and do not chain multiple statements.

Available roles in the table: {', '.join(roles_list) if roles_list else 'None'}

When the user describes a need (for example: "I need a frontend UI design"), map that description to the most appropriate role(s) from the available roles above. If no exact match exists, pick the closest role using keywords (e.g., 'frontend' -> 'Frontend Developer').

TASK DESCRIPTION:
{task_description}

Example output:
SELECT id, project_id, role, location, status, allocationPercentage, allocationEndDate FROM demands WHERE status ILIKE '%Open%' AND location ILIKE '%Bangalore%'
"""

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        # Debug: print raw Gemini response for troubleshooting
        try:
            print("DEBUG: Gemini raw response:\n", response.text)
        except Exception:
            print("DEBUG: Gemini raw response unavailable")

        sql = response.text.strip()

        # Debug: print cleaned SQL candidate before safety checks
        try:
            cleaned_preview = sql
            # remove possible surrounding code fences for preview
            if cleaned_preview.startswith("``"):
                parts = cleaned_preview.split('```')
                if len(parts) >= 2:
                    cleaned_preview = parts[1].strip()
            print("DEBUG: Cleaned SQL candidate:\n", cleaned_preview)
        except Exception:
            pass

        # strip common formatting wrappers
        if sql.startswith("``"):
            # remove code fences
            parts = sql.split('```')
            if len(parts) >= 2:
                sql = parts[1].strip()

        # Basic safety checks
        lowered = sql.lower()
        if not lowered.startswith('select'):
            return None
        if ';' in sql:
            # disallow multiple statements
            return None
        forbidden = ['insert ', 'update ', 'delete ', 'drop ', 'alter ', 'create ', 'truncate ']
        if any(f in lowered for f in forbidden):
            return None

        # Ensure only allowed columns are selected
        select_clause = sql.split('from')[0].replace('SELECT', '').strip()
        selected_cols = [c.strip().split(' ')[0] for c in select_clause.split(',')]
        for col in selected_cols:
            if col not in allowed_columns:
                return None

        return sql
    except Exception as e:
        print(f"Error generating SQL with Gemini: {e}")
        return None
