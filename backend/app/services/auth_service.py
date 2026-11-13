from app.services.database import get_database
from app.models.user import UserCreate
import hashlib
import secrets
from datetime import datetime
from bson import ObjectId


class AuthService:

    def hash_password(self, password: str) -> str:
        """Hash password using SHA256 + salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((salt + password).encode()).hexdigest()
        return f"{salt}${password_hash}"

    def verify_password(self, plain_password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, password_hash = stored_hash.split("$")
            check_hash = hashlib.sha256((salt + plain_password).encode()).hexdigest()
            return check_hash == password_hash
        except Exception:
            return False

    async def create_user(self, user_data: UserCreate) -> str:
        db = get_database()

        user_dict = {
            "full_name": user_data.full_name,
            "email": user_data.email,
            "password_hash": self.hash_password(user_data.password),
            "phone": user_data.phone or "",
            "age": user_data.age or 0,
            "gender": user_data.gender or "other",
            "village": user_data.village or "",
            "district": user_data.district or "",
            "state": user_data.state or "",
            "preferred_language": user_data.preferred_language,
            "known_diseases": user_data.known_diseases or [],
            "allergies": user_data.allergies or [],
            "current_medicines": user_data.current_medicines or [],
            "emergency_contact": user_data.emergency_contact or "",
            "pregnancy_status": user_data.pregnancy_status or False,
            "role": user_data.role or "patient",
            "is_active": True,
            "followup_status":"pending",
            "last_visit": None,
            "latitude": None,
            "longitude": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = await db.users.insert_one(user_dict)
        return str(result.inserted_id)

    async def get_user_by_email(self, email: str):
        db = get_database()
        return await db.users.find_one({"email": email})

    async def authenticate_user(self, email: str, password: str):
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user["password_hash"]):
            return None
        return user