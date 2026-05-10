import json as _json
import time as _time
import requests
from app.config import MONDAY_URL, MONDAY_HEADERS, FEEDBACK_BOARD_ID

APPROVED_LABEL = 'Approved'
PENDING_LABEL  = 'Pending'

_COLS = ['color_mm355cem', 'text_mm348vqa', 'date_mm34ma4f', 'text_mm354dp8', 'text_mm35j3m0', 'numeric_mm3624w7']
_COL_IDS = ', '.join(f'"{c}"' for c in _COLS)

# ── Simple in-memory cache (5 min TTL) ───────────────────────────────────────
_cache: dict = {'data': None, 'expires': 0.0}
_CACHE_TTL = 300


def _invalidate_cache() -> None:
    _cache['data'] = None
    _cache['expires'] = 0.0


def _post(query: str) -> dict | None:
    try:
        resp = requests.post(MONDAY_URL, json={'query': query}, headers=MONDAY_HEADERS, timeout=10)
        data = resp.json()
        if 'errors' in data:
            print(f"[feedback_service] Monday error: {data['errors']}")
            return None
        return data
    except Exception as e:
        print(f"[feedback_service] Request failed: {e}")
        return None


def _escape(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def _parse_item(item: dict) -> dict:
    cols = {cv['id']: cv['text'] for cv in item['column_values']}
    raw_rating = cols.get('numeric_mm3624w7', '')
    try:
        rating = int(float(raw_rating)) if raw_rating else None
    except (ValueError, TypeError):
        rating = None
    return {
        'id':        item['id'],
        'name':      item['name'],
        'approved':  cols.get('color_mm355cem', '') == APPROVED_LABEL,
        'client':    cols.get('text_mm348vqa', ''),
        'date':      cols.get('date_mm34ma4f', ''),
        'case_id':   cols.get('text_mm354dp8', ''),
        'message':   cols.get('text_mm35j3m0', ''),
        'rating':    rating,
    }


# ── Write ─────────────────────────────────────────────────────────────────────

def post_feedback_to_monday(name: str, message: str, case_id: str, timestamp: str, rating: int | None = None) -> str | None:
    """
    Creates an item in the feedback board with all columns populated.
    Returns the new Monday item ID, or None on failure.
    """
    if not FEEDBACK_BOARD_ID:
        print("[feedback_service] FEEDBACK_BOARD_ID not set")
        return None

    date      = timestamp[:10]
    last4     = case_id[-4:] if case_id else '????'
    item_name = _escape(f"{name} — Case ···{last4}")

    values: dict = {
        'text_mm348vqa': name,
        'date_mm34ma4f': {'date': date},
        'text_mm354dp8': case_id,
        'text_mm35j3m0': message,
        'color_mm355cem': {'label': PENDING_LABEL},
    }
    if rating is not None:
        values['numeric_mm3624w7'] = rating

    col_values = _escape(_json.dumps(values))

    data = _post(f'''
      mutation {{
        create_item(
          board_id: {FEEDBACK_BOARD_ID},
          item_name: "{item_name}",
          column_values: "{col_values}"
        ) {{ id }}
      }}
    ''')

    if not data:
        return None

    item_id = data['data']['create_item']['id']
    print(f"[feedback_service] Created feedback item {item_id}")
    _invalidate_cache()
    return item_id


# ── Read ──────────────────────────────────────────────────────────────────────

def _fetch_all_from_monday() -> list[dict]:
    if not FEEDBACK_BOARD_ID:
        return []
    data = _post(f'''
      {{
        boards(ids: [{FEEDBACK_BOARD_ID}]) {{
          items_page(limit: 200) {{
            items {{
              id
              name
              column_values(ids: [{_COL_IDS}]) {{ id text }}
            }}
          }}
        }}
      }}
    ''')
    if not data:
        return []
    items = data['data']['boards'][0]['items_page']['items']
    return [_parse_item(i) for i in items]


def fetch_all_feedback() -> list[dict]:
    """For admin — all items, newest first (Monday returns oldest first by default)."""
    return list(reversed(_fetch_all_from_monday()))


def fetch_approved_testimonials() -> list[dict]:
    """For public — only approved, cached, public-safe fields only."""
    now = _time.time()
    if _cache['data'] is not None and now < _cache['expires']:
        return _cache['data']

    all_items = _fetch_all_from_monday()
    approved  = [i for i in reversed(all_items) if i['approved']][:20]
    public    = [{
        'name':      i['client'] or i['name'],
        'message':   i['message'],
        'case_ref':  i['case_id'][-4:] if i['case_id'] else '',
        'timestamp': i['date'][:10] if i['date'] else '',
        'rating':    i.get('rating'),
    } for i in approved]

    _cache['data']    = public
    _cache['expires'] = now + _CACHE_TTL
    return public


# ── Mutate ────────────────────────────────────────────────────────────────────

def set_approval(item_id: str, approved: bool) -> bool:
    label  = APPROVED_LABEL if approved else PENDING_LABEL
    value  = _escape(_json.dumps({'label': label}))
    result = _post(f'''
      mutation {{
        change_column_value(
          board_id: {FEEDBACK_BOARD_ID},
          item_id: {item_id},
          column_id: "color_mm355cem",
          value: "{value}"
        ) {{ id }}
      }}
    ''')
    _invalidate_cache()
    return result is not None


def delete_item(item_id: str) -> bool:
    result = _post(f'''
      mutation {{
        delete_item(item_id: {item_id}) {{ id }}
      }}
    ''')
    _invalidate_cache()
    return result is not None
