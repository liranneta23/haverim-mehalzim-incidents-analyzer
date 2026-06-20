import os
import json as _json
import requests
from app.config import MONDAY_URL, MONDAY_HEADERS, NEWSLETTER_BOARD_ID

# ── Column IDs on the "Newsletter Users Management" Monday board ──────────────
# The subscriber's name is stored as the Monday item name. The defaults below
# match the live board (id 5098907924); override via env vars if the board changes.
#   Email Address  -> text column     (plain string value)
#   Interest Matters -> dropdown column ({"labels": [...]})
#   Date           -> date column     ({"date": "YYYY-MM-DD"})
#   Subscribed     -> checkbox column ({"checked": "true"})
EMAIL_COL      = os.getenv("NEWSLETTER_EMAIL_COL",      "text_mm4g9zz")
INTERESTS_COL  = os.getenv("NEWSLETTER_INTERESTS_COL",  "dropdown_mm4g86bn")
DATE_COL       = os.getenv("NEWSLETTER_DATE_COL",       "date_mm4gzky2")
SUBSCRIBED_COL = os.getenv("NEWSLETTER_SUBSCRIBED_COL", "boolean_mm4g24k")


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
        EMAIL_COL:      email,                    # text column → plain string
        INTERESTS_COL:  {'labels': interests},    # dropdown column
        DATE_COL:       {'date': date},           # date column
        SUBSCRIBED_COL: {'checked': 'true'},      # checkbox column
    }
    col_values = _escape(_json.dumps(values))

    data = _post(f'''
      mutation {{
        create_item(
          board_id: {NEWSLETTER_BOARD_ID},
          item_name: "{item_name}",
          column_values: "{col_values}",
          create_labels_if_missing: true
        ) {{ id }}
      }}
    ''')

    if not data:
        return None

    item_id = data['data']['create_item']['id']
    print(f"[newsletter_service] Created subscriber item {item_id}")
    return item_id
