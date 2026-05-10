import os
from dotenv import load_dotenv

load_dotenv()

BOARD_ID          = 1783313577
MONDAY_URL        = "https://api.monday.com/v2"
API_KEY           = os.getenv("MONDAY_API_KEY")
FEEDBACK_BOARD_ID = os.getenv("FEEDBACK_BOARD_ID")
DONORS_BOARD_ID   = os.getenv("DONORS_BOARD_ID") or "2027127204"
ADMIN_TOKEN       = os.getenv("ADMIN_TOKEN")

MONDAY_HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}
