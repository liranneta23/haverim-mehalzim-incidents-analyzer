"""
Donation service — persists a CONFIRMED Tranzila payment to Monday.com.

Two writes happen per confirmed donation:
  1. Find-or-create the donor on the Donors board (matched by email), so the
     donation ties into the existing my-impact / leaderboard token system.
  2. Create a row on the Donations board with amount, date, package, incident,
     and a board-relation link to that donor.

Every column id is read from the environment so the board layout can change
without touching code. Fill these in .env:

  DONATIONS_BOARD_ID          — (already used) the donations board
  DONATION_AMOUNT_COL=numbers            — numeric column
  DONATION_DATE_COL=date4                — date column
  DONATION_DONOR_COL=board_relation_mksevkdt   — connect-boards → Donors board
  DONATION_INCIDENT_COL=<id>             — connect-boards → incidents board (main)
  DONATION_INCIDENT_COL_TYPE=board_relation  — board_relation (default) | text
  DONATION_ORDER_COL=<id>                — (optional) text col: order + confirmation
  DONATION_STATUS_COL=<id>               — (optional) status col to mark "Paid"
  DONATION_PAID_LABEL=שולם               — (optional) label to set on DONATION_STATUS_COL

  DONORS_BOARD_ID             — (already used) the donors board
  DONOR_EMAIL_COL=<id>        — text col used to match an existing donor by email
  DONOR_TOKEN_COL=text_mm37g124          — permanent personal token (my-impact link)
  DONOR_AMOUNT_COL=numeric_mm37pefa      — cumulative amount (kept in sync)
"""

import os
import json as _json
import secrets
import requests

from app.config import (
    MONDAY_URL, MONDAY_HEADERS,
    DONATIONS_BOARD_ID, DONORS_BOARD_ID,
)

# ── Donations board columns ──────────────────────────────────────────────────
_AMOUNT_COL   = os.getenv("DONATION_AMOUNT_COL",   "numbers")
_DATE_COL     = os.getenv("DONATION_DATE_COL",     "date4")
_DONOR_COL    = os.getenv("DONATION_DONOR_COL",    "board_relation_mksevkdt")
_INCIDENT_COL = os.getenv("DONATION_INCIDENT_COL", "board_relation_mm5ck4nc")
_INCIDENT_TYPE = os.getenv("DONATION_INCIDENT_COL_TYPE", "board_relation")
_ORDER_COL    = os.getenv("DONATION_ORDER_COL",    "")
_STATUS_COL   = os.getenv("DONATION_STATUS_COL",   "")
_PAID_LABEL   = os.getenv("DONATION_PAID_LABEL",   "שולם")

# ── Donors board columns ─────────────────────────────────────────────────────
_DONOR_EMAIL_COL  = os.getenv("DONOR_EMAIL_COL",  "email_mm5cnfxk")
_DONOR_TOKEN_COL  = os.getenv("DONOR_TOKEN_COL",  "text_mm37g124")
_DONOR_AMOUNT_COL = os.getenv("DONOR_AMOUNT_COL", "numeric_mm37pefa")


def _escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def _post(query: str) -> dict | None:
    try:
        resp = requests.post(MONDAY_URL, json={"query": query}, headers=MONDAY_HEADERS, timeout=15)
        data = resp.json()
        if "errors" in data:
            print(f"[donation_service] Monday error: {data['errors']}")
            return None
        return data
    except Exception as e:
        print(f"[donation_service] Request failed: {e}")
        return None


def _parse_amount(raw: str) -> float:
    import re
    cleaned = re.sub(r"[^\d.]", "", (raw or "").strip())
    try:
        return float(cleaned) if cleaned else 0.0
    except (ValueError, TypeError):
        return 0.0


# ── Donor find-or-create ─────────────────────────────────────────────────────

def find_or_create_donor(name: str, email: str, phone: str, amount: float) -> str | None:
    """
    Return the Monday item id of the donor, creating the row if this email is new.
    On an existing donor, bumps their cumulative amount so my-impact stays correct.
    Returns None if the Donors board is not configured (donation is still recorded,
    just without a donor link).
    """
    if not DONORS_BOARD_ID:
        return None

    existing_id, existing_amount = _lookup_donor(email, name)
    if existing_id:
        _bump_donor_amount(existing_id, existing_amount + amount)
        return existing_id

    return _create_donor(name, email, amount)


def _lookup_donor(email: str, name: str) -> tuple[str | None, float]:
    ids = [c for c in [_DONOR_EMAIL_COL, _DONOR_AMOUNT_COL] if c]
    ids_gql = ", ".join(f'"{c}"' for c in ids) if ids else '""'

    data = _post(f"""
      {{
        boards(ids: [{DONORS_BOARD_ID}]) {{
          items_page(limit: 500) {{
            items {{
              id
              name
              column_values(ids: [{ids_gql}]) {{ id text }}
            }}
          }}
        }}
      }}
    """)
    if not data:
        return None, 0.0

    items = data["data"]["boards"][0]["items_page"]["items"]
    email_norm = (email or "").strip().lower()
    name_norm  = (name or "").strip().lower()

    for item in items:
        cols = {cv["id"]: cv["text"] for cv in item["column_values"]}
        row_amount = _parse_amount(cols.get(_DONOR_AMOUNT_COL) or "")
        # Prefer matching on email; fall back to exact name when no email column.
        if _DONOR_EMAIL_COL and email_norm:
            if (cols.get(_DONOR_EMAIL_COL) or "").strip().lower() == email_norm:
                return item["id"], row_amount
        elif name_norm and (item["name"] or "").strip().lower() == name_norm:
            return item["id"], row_amount

    return None, 0.0


def _create_donor(name: str, email: str, amount: float) -> str | None:
    values: dict = {_DONOR_AMOUNT_COL: str(amount)}
    if _DONOR_EMAIL_COL and email:
        # Monday email columns expect a structured {"email","text"} value.
        values[_DONOR_EMAIL_COL] = {"email": email, "text": email}
    if _DONOR_TOKEN_COL:
        values[_DONOR_TOKEN_COL] = secrets.token_hex(16)  # permanent my-impact link

    col_values = _escape(_json.dumps(values))
    item_name = _escape(name or email or "תורם/ת")

    data = _post(f"""
      mutation {{
        create_item(
          board_id: {DONORS_BOARD_ID},
          item_name: "{item_name}",
          column_values: "{col_values}",
          create_labels_if_missing: true
        ) {{ id }}
      }}
    """)
    if not data:
        return None
    return data["data"]["create_item"]["id"]


def _bump_donor_amount(item_id: str, new_total: float) -> None:
    if not _DONOR_AMOUNT_COL:
        return
    values = _escape(_json.dumps({_DONOR_AMOUNT_COL: str(new_total)}))
    _post(f"""
      mutation {{
        change_multiple_column_values(
          board_id: {DONORS_BOARD_ID},
          item_id: {item_id},
          column_values: "{values}"
        ) {{ id }}
      }}
    """)


# ── Donation row ─────────────────────────────────────────────────────────────

def _column_value(col_type: str, raw: str):
    """Format a scalar into Monday's expected column-value shape by column type."""
    if col_type == "board_relation":
        if raw and str(raw).isdigit():
            return {"item_ids": [int(raw)]}
        return None
    if col_type == "status":
        return {"label": raw} if raw else None
    # text / default
    return raw or None


def record_donation(payment: dict, date_iso: str, donor_item_id: str | None) -> str | None:
    """
    Create the donation row on the Donations board from a confirmed `payment`
    (as returned by payment_service.parse_notify). Returns the new item id.
    """
    if not DONATIONS_BOARD_ID:
        print("[donation_service] DONATIONS_BOARD_ID not set")
        return None

    values: dict = {
        _AMOUNT_COL: f"{payment['amount']:.2f}",
        _DATE_COL:   {"date": date_iso[:10]},
    }

    if donor_item_id and _DONOR_COL:
        values[_DONOR_COL] = {"item_ids": [int(donor_item_id)]}

    if _INCIDENT_COL:
        # Link the donation to the incident on the main board. `incident_id` is
        # the incident's Monday item id, so board_relation links it directly.
        v = _column_value(_INCIDENT_TYPE, payment.get("incident_id", ""))
        if v is not None:
            values[_INCIDENT_COL] = v

    if _ORDER_COL:
        # Human-reconcilable audit trail: our order id + Tranzila's confirmation.
        values[_ORDER_COL] = (
            f"{payment['order_id']} · conf {payment.get('confirmation_code', '')}"
            f" · tx {payment.get('transaction_id', '')}"
        )

    if _STATUS_COL and _PAID_LABEL:
        values[_STATUS_COL] = {"label": _PAID_LABEL}

    col_values = _escape(_json.dumps(values))
    item_name = _escape(payment.get("donor_name") or payment.get("donor_email") or "תרומה")

    data = _post(f"""
      mutation {{
        create_item(
          board_id: {DONATIONS_BOARD_ID},
          item_name: "{item_name}",
          column_values: "{col_values}",
          create_labels_if_missing: true
        ) {{ id }}
      }}
    """)
    if not data:
        return None

    item_id = data["data"]["create_item"]["id"]
    print(f"[donation_service] Recorded donation item {item_id} (order {payment['order_id']})")
    return item_id


def record_confirmed_payment(payment: dict, date_iso: str) -> str | None:
    """High-level entry point: link/create donor, then write the donation row."""
    donor_id = find_or_create_donor(
        payment.get("donor_name", ""),
        payment.get("donor_email", ""),
        payment.get("donor_phone", ""),
        payment["amount"],
    )
    return record_donation(payment, date_iso, donor_id)
