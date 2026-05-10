"""
Donor Impact Service — queries the Monday.com "Donors" board to look up
a donor by their personal token and compute their cumulative impact.

Board setup (create once in Monday.com, then fill in .env):
  DONORS_BOARD_ID=<board id>
  DONOR_TOKEN_COL=<text column id>          — permanent random token (use secrets.token_hex(16))
  DONOR_AMOUNT_COL=<numeric column id>      — cumulative USD donated (update when donor gives again)
  DONOR_FIRST_DATE_COL=<date column id>     — date of very first donation
  DONOR_LAST_DATE_COL=<date column id>      — date of most recent donation
  DONOR_NOTE_COL=<long-text column id>      — optional personal note from admin

One row per donor. Token never changes — the donor's link is permanent.
When a donor gives again, update AMOUNT and LAST_DATE on the existing row.

To generate a token:
  python -c "import secrets; print(secrets.token_hex(16))"
"""

import re
import hmac
import os
import requests
from datetime import datetime

from app.config import MONDAY_URL, MONDAY_HEADERS, DONORS_BOARD_ID
from app.features.incidents.service import fetch_monday_data
from app.features.incidents.constants import SIGNIFICANT_INCIDENT, GROUP_OPENED, INCIDENT_HANDLED_BY_RON

# Column IDs — override via env if the board structure changes
_TOKEN_COL      = os.getenv('DONOR_TOKEN_COL',      'text_mm37g124')
_AMOUNT_COL     = os.getenv('DONOR_AMOUNT_COL',     'numeric_mm37pefa')
_FIRST_DATE_COL = os.getenv('DONOR_FIRST_DATE_COL', '')
_LAST_DATE_COL  = os.getenv('DONOR_LAST_DATE_COL',  '')
_NOTE_COL       = os.getenv('DONOR_NOTE_COL',       '')

AVG_MISSION_COST = 350  # USD — matches the constant used in the frontend

_HANDLED = {GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT}


def _parse_amount(raw: str) -> float:
    """Parse a number from a mirror column value which may include $, commas, spaces."""
    cleaned = re.sub(r'[^\d.]', '', raw.strip())
    try:
        return float(cleaned) if cleaned else 0.0
    except (ValueError, TypeError):
        return 0.0


def is_valid_token_format(token: str) -> bool:
    return bool(token) and bool(re.fullmatch(r'[0-9a-f]{8,64}', token))


def _post(query: str) -> dict | None:
    try:
        resp = requests.post(MONDAY_URL, json={'query': query}, headers=MONDAY_HEADERS, timeout=10)
        data = resp.json()
        if 'errors' in data:
            print(f'[donor_service] Monday error: {data["errors"]}')
            return None
        return data
    except Exception as e:
        print(f'[donor_service] Request failed: {e}')
        return None


def _safe_compare(a: str, b: str) -> bool:
    """Constant-time string comparison to prevent timing attacks."""
    return hmac.compare_digest(a.encode(), b.encode())


def _impact_since(first_date_str: str) -> dict:
    defaults = {'incidents_since': 0, 'handled_since': 0, 'lives_saved_since': 0}
    if not first_date_str:
        return defaults
    try:
        cutoff = datetime.strptime(first_date_str, '%Y-%m-%d')
    except ValueError:
        return defaults

    all_incidents = fetch_monday_data()
    if not all_incidents:
        return defaults

    incidents_since = handled = lives = 0
    for row in all_incidents:
        timeline = row.get('timeline_mkmbcabh', '')
        if not (timeline and '-' in timeline):
            continue
        try:
            start = datetime.strptime(timeline.split(' - ')[0].strip(), '%Y-%m-%d')
        except Exception:
            continue
        if start < cutoff:
            continue
        incidents_since += 1
        status = row.get('color_mkvvrm1r', '')
        if status in _HANDLED:
            handled += 1
        if status == SIGNIFICANT_INCIDENT:
            lives += 1

    return {
        'incidents_since':   incidents_since,
        'handled_since':     handled,
        'lives_saved_since': lives,
    }


def fetch_donor_by_token(token: str) -> dict | None:
    """
    Scans the Donors board for a row whose Token column matches `token`.
    Returns a dict with the donor's name, donation totals, and computed
    impact metrics, or None if not found / not configured.
    """
    if not DONORS_BOARD_ID or not _TOKEN_COL:
        print('[donor_service] DONORS_BOARD_ID or DONOR_TOKEN_COL not configured')
        return None
    if not is_valid_token_format(token):
        return None

    col_ids = [c for c in [_TOKEN_COL, _AMOUNT_COL, _FIRST_DATE_COL, _LAST_DATE_COL, _NOTE_COL] if c]
    col_ids_gql = ', '.join(f'"{c}"' for c in col_ids)

    data = _post(f'''
      {{
        boards(ids: [{DONORS_BOARD_ID}]) {{
          items_page(limit: 500) {{
            items {{
              id
              name
              column_values(ids: [{col_ids_gql}]) {{ id text }}
            }}
          }}
        }}
      }}
    ''')
    if not data:
        return None

    items = data['data']['boards'][0]['items_page']['items']

    for item in items:
        cols = {cv['id']: cv['text'] for cv in item['column_values']}
        stored = (cols.get(_TOKEN_COL) or '').strip()
        if not stored or not _safe_compare(stored, token):
            continue

        total_donated = _parse_amount(cols.get(_AMOUNT_COL) or '')

        first_date = (cols.get(_FIRST_DATE_COL) or '')[:10]
        last_date  = (cols.get(_LAST_DATE_COL)  or '')[:10]
        note       = (cols.get(_NOTE_COL)        or '').strip() if _NOTE_COL else ''

        return {
            'name':                item['name'],
            'total_donated':       total_donated,
            'missions_funded':     int(total_donated // AVG_MISSION_COST),
            'first_donation_date': first_date,
            'last_donation_date':  last_date,
            'note':                note,
            **_impact_since(first_date),
        }

    return None
