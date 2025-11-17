from pydantic import BaseModel
from typing import List


class Employee(BaseModel):
    id: int
    name: str
    skills: List[str]
    qualifications: List[str]
    strength: int
    availability: str
    team: str
