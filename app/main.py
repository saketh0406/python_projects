from fastapi.middleware.cors import CORSMiddleware
import time
from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal, engine
from app import models, schemas, auth
import pymysql
from fastapi.openapi.utils import get_openapi
from typing import Optional

# --- wait for DB to be ready ---
while True:
    try:
        conn = pymysql.connect(
            host="db",
            user="course",
            password="course",
            database="course"
        )
        conn.close()
        break
    except pymysql.err.OperationalError:
        print("Waiting for database...")
        time.sleep(2)

# --- create tables ---
models.Base.metadata.create_all(bind=engine)

# --- FastAPI app ---
app = FastAPI(
    title="Course Management API",
    openapi_tags=[],  # optional, keeps it clean
    swagger_ui_init_oauth=None,  # disables the Swagger “Authorize” popup
    docs_url="/docs",
    redoc_url="/redoc"
)


# Force no security schemes
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Course Management API",
        version="1.0.0",
        description="API without Authorize button",
        routes=app.routes,
    )
    # Remove all security schemes to remove Authorize button
    openapi_schema["components"]["securitySchemes"] = {}
    openapi_schema["security"] = []
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# --- Add CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Users ---
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    password_bytes = user.password.encode("utf-8")
    if len(password_bytes) > 72:
        raise HTTPException(status_code=400, detail="Password too long (max 72 bytes)")

    hashed_pw = auth.hash_password(user.password)
    db_user = models.User(
        name=user.name, email=user.email, hashed_password=hashed_pw, role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- Login without tokens ---
@app.post("/auth/login")
def login(user: dict = Body(...), db: Session = Depends(get_db)):
    """
    user: JSON body with { "email": "...", "password": "..." }
    """
    email = user.get("email")
    password = user.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user or not auth.verify_password(password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Just return user info (no JWT yet)
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role
    }

# --- /me endpoint ---
@app.get("/me")
def read_me(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


# --- Courses ---
@app.post("/courses", response_model=schemas.CourseResponse)
def create_course(
    course: schemas.CourseCreate,
    instructor_email: str = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == instructor_email).first()
    if not user or user.role != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")

    db_course = models.Course(
        title=course.title,
        description=course.description,
        instructor_id=user.id,
        instructor_email=instructor_email
    )

    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@app.get("/courses", response_model=list[schemas.CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()


# --- Enrollments ---
@app.post("/enroll", response_model=schemas.EnrollmentResponse)
def enroll(
    enrollment: schemas.EnrollmentCreate,
    student_email: str = Body(...),
    db: Session = Depends(get_db)
):
    student = db.query(models.User).filter(models.User.email == student_email).first()
    if not student or student.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    course = db.query(models.Course).filter(models.Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(models.Enrollment).filter(
        models.Enrollment.student_id == student.id,
        models.Enrollment.course_id == course.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    db_enroll = models.Enrollment(
        student_id=student.id,
        course_id=course.id
    )

    db.add(db_enroll)
    db.commit()
    db.refresh(db_enroll)
    return db_enroll


@app.get("/enrollments", response_model=list[schemas.EnrollmentResponse])
def list_enrollments(student_email: Optional[str] = None, db: Session = Depends(get_db)):
    if student_email:
        student = db.query(models.User).filter(models.User.email == student_email).first()
        if not student or student.role != "student":
            raise HTTPException(status_code=403, detail="Student access required")
        return db.query(models.Enrollment).filter(
            models.Enrollment.student_id == student.id
        ).all()
    else:
        return db.query(models.Enrollment).all()


# --- Assignments ---
@app.post("/courses/{course_id}/assignments", response_model=schemas.AssignmentResponse)
def create_assignment(
    course_id: int,
    assignment: schemas.AssignmentCreate,
    instructor_email: str = Body(...),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == instructor_email).first()
    if not user or user.role != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")

    course = db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.instructor_id == user.id
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found or unauthorized")

    last_number = db.query(func.max(models.Assignment.number)).filter(
        models.Assignment.course_id == course.id
    ).scalar() or 0

    db_assignment = models.Assignment(
        title=assignment.title,
        description=assignment.description,
        course_id=course.id,
        number=last_number + 1
    )

    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@app.get("/courses/{course_id}/assignments", response_model=list[schemas.AssignmentResponse])
def list_assignments(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Assignment).filter(
        models.Assignment.course_id == course_id
    ).all()
