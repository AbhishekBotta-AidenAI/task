from models import Employee

mock_employees = [
    Employee(
        id=1,
        name="Alice Johnson",
        skills=["React", "JavaScript", "CSS", "HTML"],
        qualifications=["B.Tech CS", "Full Stack Developer"],
        strength=95,
        availability="Available",
        team="Frontend"
    ),
    Employee(
        id=2,
        name="Bob Smith",
        skills=["Python", "FastAPI", "PostgreSQL", "Docker"],
        qualifications=["M.Tech", "Backend Developer"],
        strength=88,
        availability="Partially Available",
        team="Backend"
    ),
    Employee(
        id=3,
        name="Carol Davis",
        skills=["React", "Node.js", "MongoDB", "GraphQL"],
        qualifications=["B.Tech IT", "Full Stack Developer"],
        strength=92,
        availability="Available",
        team="Full Stack"
    ),
    Employee(
        id=4,
        name="David Wilson",
        skills=["DevOps", "Kubernetes", "AWS", "Terraform"],
        qualifications=["Cloud Architect Certification", "DevOps Engineer"],
        strength=85,
        availability="Not Available",
        team="Infrastructure"
    ),
    Employee(
        id=5,
        name="Emma Taylor",
     skills=["Machine Learning", "Python", "TensorFlow", "Data Analysis"],
        qualifications=["M.S. Data Science", "ML Engineer"],
        strength=90,
        availability="Available",
        team="AI/ML"
    ),
    Employee(
        id=6,
        name="Carol Davis Test",
        skills=["React", "Node.js", "MongoDB", "GraphQL"],
        qualifications=["B.Tech IT", "Full Stack Developer"],
        strength=92,
        availability="not Available",
        team="Full Stack"
    ),
]
