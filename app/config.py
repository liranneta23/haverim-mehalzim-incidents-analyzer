import os
from dotenv import load_dotenv

load_dotenv()

BOARD_ID          = os.getenv("BOARD_ID")
MONDAY_URL        = "https://api.monday.com/v2"
API_KEY           = os.getenv("MONDAY_API_KEY")
FEEDBACK_BOARD_ID = os.getenv("FEEDBACK_BOARD_ID")
DONORS_BOARD_ID   = os.getenv("DONORS_BOARD_ID")
DONATIONS_BOARD_ID = os.getenv("DONATIONS_BOARD_ID")
NEWSLETTER_BOARD_ID = os.getenv("NEWSLETTER_BOARD_ID")
ADMIN_TOKEN       = os.getenv("ADMIN_TOKEN")

MONDAY_HEADERS = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# ── Tranzila payment gateway ─────────────────────────────────────────────────
# Regular (non-token) terminal — we only take one-time charges, so no need for
# the tokens terminal. Credentials live in .env (never hardcode).
TRANZILLA_TERMINAL          = os.getenv("TRANZILLA_TERMINAL")
TRANZILLA_TERMINAL_PASSWORD = os.getenv("TRANZILLA_TERMINAL_PASSWORD")
TRANZILLA_API_USERNAME      = os.getenv("TRANZILLA_API_USERNAME")
TRANZILLA_API_PUBLIC_KEY    = os.getenv("TRANZILLA_API_PUBLIC_KEY")
TRANZILLA_API_PRIVATE_KEY   = os.getenv("TRANZILLA_API_PRIVATE_KEY")
# 1 = ILS (shekel), 2 = USD. Israeli terminals default to shekel.
TRANZILLA_CURRENCY          = os.getenv("TRANZILLA_CURRENCY", "1")
# Hosted-page host. "directng.tranzila.com" is Tranzila's current standard
# (the older "direct.tranzila.com" is deprecated). Override via env if needed.
TRANZILLA_HOST              = os.getenv("TRANZILLA_HOST", "directng.tranzila.com")
# Optional shared secret configured in the Tranzila terminal's "notify" settings.
# When set, incoming server notifications are rejected unless they carry it.
TRANZILLA_NOTIFY_SECRET     = os.getenv("TRANZILLA_NOTIFY_SECRET")

# Absolute base URL of THIS app, e.g. https://your-app.onrender.com — Tranzila
# needs fully-qualified success / fail / notify URLs to redirect and call back.
PUBLIC_BASE_URL = (os.getenv("PUBLIC_BASE_URL") or "").rstrip("/")
