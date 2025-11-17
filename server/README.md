# Backend - Dynamic Demand Dashboard API

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Gemini API (Optional but Recommended)

To enable AI-powered employee search:

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey
2. Create a `.env` file in the backend directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### 5. Run the Server
```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Available Endpoints

### Get All Employees
```
GET /employees
Response: List[Employee]
```

### Get Single Employee
```
GET /employees/{employee_id}
Response: Employee
```

### Filter Employees (Traditional)
```
GET /employees/filter?skill=React&availability=Available&team=Frontend
Query Parameters:
  - skill (optional): Filter by skill name
  - availability (optional): Filter by availability status
  - team (optional): Filter by team name
Response: List[Employee]
```

### AI-Powered Employee Search (NEW)
```
POST /employees/ai-search?task_description=<description>
Query Parameter:
  - task_description (required): Description of the task/project

Example:
POST /employees/ai-search?task_description=I need someone to build a React frontend application with TypeScript

Response: List[Employee] (sorted by suitability)
```

## How AI Search Works

1. **Input**: You provide a task description in natural language
   - Example: "I need a Python developer to create a FastAPI backend with PostgreSQL integration"

2. **Processing**: Gemini AI analyzes task requirements and matches with employee skills

3. **Output**: Returns a ranked list of employees most suitable for the task

## Example Usage

### Using cURL

```bash
# AI Search
curl -X POST "http://localhost:8000/employees/ai-search?task_description=I%20need%20a%20React%20developer%20with%20Tailwind%20CSS%20experience"

# Traditional Search
curl "http://localhost:8000/employees/filter?skill=React&availability=Available"
```

## Troubleshooting

### "Error loading ASGI app"
- Make sure you're in the backend directory
- Verify `main.py`, `models.py`, and `data.py` exist
- Try: `python -c "from main import app; print('OK')"`

### AI Search not working
- Check if GEMINI_API_KEY is set in .env file
- Without API key, system falls back to keyword matching
- Try a different task description

