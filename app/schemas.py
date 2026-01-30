from pydantic import BaseModel, EmailStr
from typing import Optional

# User
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        model_config = {
            "from_attributes": True
        }

# Course
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    instructor_id: int

    class Config:
        model_config = {
            "from_attributes": True
        }


# Enrollment
class EnrollmentCreate(BaseModel):
    course_id: int

class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int

    class Config:
        model_config = {
            "from_attributes": True
        }


class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    number: int  # new field
    title: str
    description: Optional[str]
    course_id: int

    class Config:
        model_config = {
            "from_attributes": True
        }
