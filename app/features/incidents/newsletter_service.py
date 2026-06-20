import os
import json as _json
import requests
from app.config import MONDAY_URL, MONDAY_HEADERS, NEWSLETTER_BOARD_ID

# ── Column IDs on the newsletter Monday board ────────────────────────────────
# The subscriber's name is stored as the Monday item name. Email, interests and
# the sign-up date go into their own columns. Monday column IDs are board-specific,
# so override these via env vars to match the columns on your newsletter board.
EMAIL_COL     = os.getenv("NEWSLETTER_EMAIL_COL",     "email")
INTERESTS_COL = os.getenv("NEWSLETTER_INTERESTS_COL", "text")
DATE_COL      = os.getenv("NEWSLETTER_DATE_COL",      "date")


def _post(query: str) -> dict | None:
    try:
        resp = requests.post(MONDAY_URL, json={'query': query}, headers=MONDAY_HEADERS, timeout=10)
        data = resp.json()
        if 'errors' in data:
            print(f"[newsletter_service] Monday error: {data['errors']}")
            return None
        return data
    except Exception as e:
        print(f"[newsletter_service] Request failed: {e}")
        return None


def _escape(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def post_subscriber_to_monday(name: str, email: str, interests: list[str], timestamp: str) -> str | None:
    """
    Creates an item on the newsletter board for a new mailing-list sign-up.
    Returns the new Monday item ID, or None on failure.
    """
    if not NEWSLETTER_BOARD_ID:
        print("[newsletter_service] NEWSLETTER_BOARD_ID not set")
        return None

    date      = timestamp[:10]
    item_name = _escape(name)

    values: dict = {
        EMAIL_COL:     {'email': email, 'text': email},
        INTERESTS_COL: ', '.join(interests),
        DATE_COL:      {'date': date},
    }
    col_values = _escape(_json.dumps(values))

    data = _post(f'''
      mutation {{
        create_item(
          board_id: {NEWSLETTER_BOARD_ID},
          item_name: "{item_name}",
          column_values: "{col_values}"
        ) {{ id }}
      }}
    ''')

    if not data:
        return None

    item_id = data['data']['create_item']['id']
    print(f"[newsletter_service] Created subscriber item {item_id}")
    return item_id
