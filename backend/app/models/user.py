#user.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    village: Optional[str] = ""
    district: Optional[str] = ""
    state: Optional[str] = ""
    preferred_language: str = Field(default="english")
    known_diseases: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    current_medicines: Optional[List[str]] = []
    emergency_contact: Optional[str] = ""
    pregnancy_status: Optional[bool] = False
    role: str = Field(default="patient",pattern="^(patient|asha_worker|admin)$")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Ramesh Kumar",
                "email": "ramesh@example.com",
                "password": "password123",
                "phone": "9876543210",
                "age": 35,
                "gender": "male",
                "village": "Chandpur",
                "district": "Varanasi",
                "state": "Uttar Pradesh",
                "preferred_language": "hindi",
                "known_diseases": ["diabetes"],
                "allergies": ["penicillin"],
                "current_medicines": ["metformin"],
                "emergency_contact": "9876543211",
                "pregnancy_status": False,
                "role":"patient"
            }
        }


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    preferred_language: Optional[str] = None
    known_diseases: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    current_medicines: Optional[List[str]] = None
    emergency_contact: Optional[str] = None
    pregnancy_status: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str = ""
    age: int = 0
    gender: str = ""
    village: str = ""
    district: str = ""
    state: str = ""
    preferred_language: str = "english"
    known_diseases: List[str] = []
    allergies: List[str] = []
    current_medicines: List[str] = []
    emergency_contact: str = ""
    pregnancy_status: bool = False
    created_at: Optional[str] = None


class UserModel(BaseModel):
    full_name: str
    email: str
    password_hash: str
    phone: str
    age: int
    gender: str
    village: str = ""
    district: str = ""
    state: str = ""
    preferred_language: str = "english"
    known_diseases: List[str] = []
    allergies: List[str] = []
    current_medicines: List[str] = []
    emergency_contact: str = ""
    pregnancy_status: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    role: str = "patient"
    is_active: bool = True
    followup_status: str = "pending"
    last_visit: Optional[datetime]= None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)   