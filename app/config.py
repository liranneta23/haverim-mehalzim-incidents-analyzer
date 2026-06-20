import os
from dotenv import load_dotenv

load_dotenv()

BOARD_ID          = os.getenv("BOARD_ID")
MONDAY_URL        = "https://api.monday.com/v2"
API_KEY           = os.getenv("MONDAY_API_KEY")
FEEDBACK_BOARD_ID = os.getenv("FEEDBACK_BOARD_ID")
DONORS_BOARD_ID   = os.getenv("DONORS_BOARD_ID")
NEWSLETTER_BOARD_ID = os.getenv("NEWSLETTER_BOARD_ID")
ADMIN_TOKEN       = os.getenv("ADMIN_TOKEN")

MONDAY_HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}
