import os
from dotenv import load_dotenv

load_dotenv()

BOARD_ID = 1783313577
MONDAY_URL = "https://api.monday.com/v2"
API_KEY = os.getenv("MONDAY_API_KEY")

MONDAY_HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}
