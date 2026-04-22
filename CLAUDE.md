# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goals

**Haverim Mehalzim Incidents Analyzer** is an internal ops dashboard for a volunteer emergency-response organization. It pulls live incident data from a Monday.com board via GraphQL and presents it as a real-time Hebrew (RTL) command dashboard. Key metrics include: total vs. handled incidents, breakdown by type, geographic distribution by country, life-threatening incidents, and lives saved — all split between all-time and current month.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask 2.3.3, Flask-CORS 4.0.0 |
| Data source | Monday.com GraphQL API |
| HTTP client | `requests` 2.31.0 |
| Config | `python-dotenv` 1.0.0 |
| Frontend | Vanilla HTML/CSS/JS (inlined in `main.py`) |
| Fonts | Syne (display), JetBrains Mono, Noto Sans Hebrew |
| Production server | gunicorn 20.1.0 (Linux/Render); use `waitress` locally on Windows |

No build tools, bundlers, Tailwind, or Shadcn — the entire frontend is plain CSS with CSS custom properties.

## Build & Run Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Development
python main.py                        # http://localhost:5000

# Production (Render / Linux)
gunicorn main:app

# Production (Windows local)
pip install waitress
waitress-serve --host=0.0.0.0 --port=5000 main:app
```

No test suite exists in the project currently.

### Environment

Create a `.env` file at the project root:
```
MONDAY_API_KEY=your_monday_api_key_here
```

## Code Style

- **Python**: no type hints, functional style — each data concern is its own standalone function that accepts a list of incident dicts and returns a count dict or list.
- **Constants**: all Hebrew status strings and magic numbers live in `constants.py`, never inline.
- **Monday column IDs** are long opaque strings (e.g. `status_mkmb1zc6`). Always reference them by name through `row.get(COLUMN_ID)`, never hardcode them in multiple places.
- **Frontend**: dark military aesthetic using CSS custom properties (`--accent-teal`, `--bg-void`, etc.). All UI color decisions go through these variables — do not use raw hex values in component styles.
- **Language**: UI labels are Hebrew (RTL). Code, variable names, and comments are English.
- **No separate template files** — the entire HTML page is returned as a string from `serve_frontend()` in `main.py`.

## Architecture

**Data flow:**
1. `fetch_monday_data()` — GraphQL POST to Monday.com (`BOARD_ID = 1783313577`), flattens column values into a list of dicts keyed by column ID.
2. Processing functions filter/aggregate that list: `count_incidents_per_type`, `get_incidents_current_month`, `get_countries_of_incidents`, `get_our_impact`.
3. `/api/dashboard` calls all of the above and returns one unified JSON payload.
4. The inlined JS fetches `/api/dashboard` on load and auto-refreshes every 5 minutes, rendering everything client-side via template literals.

**Monday.com column IDs:**
- `status_mkmb1zc6` — incident type
- `country_mkmb91h3` — country
- `timeline_mkmbcabh` — date range (`YYYY-MM-DD - YYYY-MM-DD`)
- `color_mkvvrm1r` — incident status (matched against constants in `constants.py`)
- `check_mkn3c7v8` — life-threatening flag

**"Handled" filtering:** incidents where `color_mkvvrm1r` matches one of the three Hebrew constants (`GROUP_OPENED`, `INCIDENT_HANDLED_BY_RON`, `SIGNIFICANT_INCIDENT`).

**`SIGNIFICANT_INCIDENT` dual role:** counts as a handled incident AND as a "life saved" in `get_our_impact`.
