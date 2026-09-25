import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "AroNexa")

client = None
database = None


async def connect_to_database():
    global client, database
    try:
        client = AsyncIOMotorClient(
            MONGODB_URL,
            tls=True,
            tlsAllowInvalidCertificates=False,
            serverSelectionTimeoutMS=30000
        )

        database = client[DATABASE_NAME]

        await client.admin.command("ping")
        print(f"Connected to MongoDB: {DATABASE_NAME}")

        await create_indexes()

    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise e

async def create_indexes():
    """Create database indexes for performance"""
    global database
    try:
        # Users collection
        await database.users.create_index("email", unique=True)

        # Hospitals collection
        await database.hospitals.create_index([
            ("latitude", 1), ("longitude", 1)
        ])
        await database.hospitals.create_index("hospital_type")

        # Triage records
        await database.triage_records.create_index("user_id")
        await database.triage_records.create_index("created_at")

        # Reports
        await database.reports.create_index("user_id")

        print("Database indexes created")
    except Exception as e:
        print(f"Index creation warning: {e}")


async def close_database_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_database():
    """Get database instance"""
    global database
    return database