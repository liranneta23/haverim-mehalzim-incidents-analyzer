import os
from dotenv import load_dotenv

load_dotenv()

BOARD_ID          = 1783313577
MONDAY_URL        = "https://api.monday.com/v2"
API_KEY           = os.getenv("MONDAY_API_KEY")
FEEDBACK_BOARD_ID = os.getenv("FEEDBACK_BOARD_ID")
ADMIN_TOKEN       = os.getenv("ADMIN_TOKEN")

MONDAY_HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}
