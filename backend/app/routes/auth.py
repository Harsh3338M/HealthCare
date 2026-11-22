"""MediVault Authentication Routes and Security Dependencies.

Provides user registration (POST /api/auth/register), login (POST /api/auth/login),
current user profile (GET /api/auth/me), and JWT verification dependencies.
"""

from datetime import datetime, timedelta
from typing import Optional
import uuid
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models import PatientProfile, User
from backend.app.schemas.auth import (
    TokenData,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Authenticate request using Bearer JWT token and return active User instance."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("email") or payload.get("sub")
    user_id = payload.get("user_id")

    query = db.query(User)
    if email:
        user = query.filter(User.email == email).first()
    elif user_id:
        user = query.filter(User.id == user_id).first()
    else:
        user = None

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account, create initial profile, and return JWT token."""
    cleaned_email = payload.email.strip().lower()

    # Check for existing user
    existing_user = db.query(User).filter(User.email == cleaned_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Validate and assign role
    allowed_roles = {"patient", "staff_basic", "staff_clinical", "admin_dpo"}
    role = payload.role if payload.role in allowed_roles else "patient"

    # Generate patient/staff ID if not provided
    patient_id = payload.patient_id
    if not patient_id:
        prefix = "PAT" if role == "patient" else ("ADM" if role == "admin_dpo" else "STF")
        patient_id = f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

    # Hash password and create User
    hashed_pwd = hash_password(payload.password)
    user = User(
        email=cleaned_email,
        password_hash=hashed_pwd,
        full_name=payload.full_name.strip(),
        role=role,
        patient_id=patient_id,
        is_active=True,
    )
    db.add(user)
    db.flush()

    # If role is patient, automatically create initial PatientProfile
    if role == "patient":
        profile = PatientProfile(
            patient_id=patient_id,
            user_id=user.id,
            full_name=payload.full_name.strip(),
            date_of_birth=payload.date_of_birth,
            gender=payload.gender,
            phone=payload.phone,
            email=cleaned_email,
            address=payload.address,
            emergency_contact=payload.emergency_contact,
            is_active=True,
        )
        db.add(profile)

    db.commit()
    db.refresh(user)

    # Create access token
    token_claims = {
        "sub": user.email,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "patient_id": user.patient_id,
    }
    access_token = create_access_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email/username and password; returns access token and user payload."""
    identifier = (payload.email or payload.username or "").strip().lower()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username is required",
        )

    # Search by email or patient_id
    user = db.query(User).filter(
        (User.email == identifier) | (User.patient_id == identifier.upper())
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    token_claims = {
        "sub": user.email,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "patient_id": user.patient_id,
    }
    access_token = create_access_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
