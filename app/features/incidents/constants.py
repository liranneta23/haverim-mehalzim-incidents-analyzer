GROUP_OPENED = "נפתח אירוע"
INCIDENT_HANDLED_BY_RON = "טופל על ידי רון"
SIGNIFICANT_INCIDENT = "אירוע משמעותי"

# status_mkmbjwef values — used by the map layer
MAP_LIVE_STATUSES     = {'Live', 'Active', 'Working on it'}
MAP_HANDLED_STATUSES  = {'Done', 'Completed'}

# status_mkmb1zc6 Hebrew → English translations
INCIDENT_TYPE_TRANSLATIONS = {
    'רפואי':            'Medical',
    'נפשי':             'Mental Health',
    'חילוץ':            'Rescue',
    'איתור':            'Search & Locate',
    'אנטישמיות':        'Antisemitism',
    'חברות מחלצות':     'Sexual Assault',
    'אחר':              'Other',
}

ACTIVE_VOLUNTEERS_COUNT = 30

# ── Donations / payments ─────────────────────────────────────────────────────
# These are plain, hardcoded business constants (NOT read from the environment)
# so a missing/mistyped env var can never break a donation. Edit them here.

# Fixed USD→ILS conversion rate. Used to (a) convert preset package prices for
# display and (b) value a non-USD gift against the impact-link threshold below,
# and to normalise amounts stored on the Donors board to USD. Update when it
# drifts. Shared with the frontend via /api/payment-config so the price a donor
# sees and the server-side threshold check never diverge.
USD_TO_ILS = 3.7

# The personal donor impact page (/my-impact/<token>) is a perk reserved for
# top-tier gifts: only a donation worth this many USD or more generates a token
# and includes the impact link in the thank-you email. 14000 = the "Scoop & Run"
# top package. Donors may pay in any supported currency; the gift is converted to
# USD (via USD_TO_ILS) before it is compared against this bar.
IMPACT_LINK_MIN_USD = 14000