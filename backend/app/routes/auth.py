from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService
from app.utils.jwt_handler import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_service = AuthService()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user_id = await auth_service.create_user(user_data)

        # Generate token
        token = create_access_token(data={"sub": user_data.email, "user_id": user_id})

        return {
            "message": "User registered successfully",
            "user_id": user_id,
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login(credentials: UserLogin):
    """Login user"""
    try:
        user = await auth_service.authenticate_user(
            credentials.email, credentials.password
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = create_access_token(
            data={"sub": user["email"], "user_id": str(user["_id"])}
        )

        return {
    "message": "Login successful",
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "id": str(user["_id"]),
        "full_name": user["full_name"],
        "email": user["email"],
        "preferred_language": user.get("preferred_language", "english"),
        "village": user.get("village", ""),
        "district": user.get("district", ""),
        "role": user.get("role", "patient")
    }
}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current logged-in user info"""
    return {
        "user": current_user
    }