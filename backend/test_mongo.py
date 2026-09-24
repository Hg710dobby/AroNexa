import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("MONGODB_URL")

async def test():
    client = AsyncIOMotorClient(
        url,
        tls=True,
        tlsInsecure=True,
        serverSelectionTimeoutMS=10000
    )
    try:
        await client.admin.command("ping")
        print("✅ MONGODB CONNECTION SUCCESS")
    except Exception as e:
        print("❌", e)
    finally:
        client.close()

asyncio.run(test())