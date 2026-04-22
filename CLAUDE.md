# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the development server (http://localhost:5000)
python main.py

# Production (gunicorn must be installed separately)
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

## Environment

Requires a `.env` file with:
```
MONDAY_API_KEY=your_monday_api_key_here
```

## Architecture

This is a single-file Flask app (`main.py`) that serves both the API and a fully inlined HTML/CSS/JS dashboard from the root route `/`.

**Data flow:**
1. `fetch_monday_data()` — GraphQL POST to Monday.com (`BOARD_ID = 1783313577`), returns a flat list of dicts where keys are Monday column IDs.
2. Processing functions filter/aggregate that list: `count_incidents_per_type`, `get_incidents_current_month`, `get_countries_of_incidents`, `get_our_impact`.
3. `/api/dashboard` calls all of these and returns one unified JSON response.
4. The frontend fetches `/api/dashboard` on load and every 5 minutes, then renders everything client-side via template strings.

**Monday.com column IDs used:**
- `status_mkmb1zc6` — incident type
- `country_mkmb91h3` — country
- `timeline_mkmbcabh` — date range (format: `YYYY-MM-DD - YYYY-MM-DD`)
- `color_mkvvrm1r` — incident status (maps to constants in `constants.py`)
- `check_mkn3c7v8` — life-threatening flag

**"Handled" filtering:** incidents where `color_mkvvrm1r` is one of the three Hebrew status constants defined in `constants.py` (`GROUP_OPENED`, `INCIDENT_HANDLED_BY_RON`, `SIGNIFICANT_INCIDENT`).

**`SIGNIFICANT_INCIDENT` serves double duty:** it is both a handled-incident status and the signal used to count "lives saved" in `get_our_impact`.

The frontend is Hebrew (RTL), rendered inline inside `serve_frontend()`. There are no separate template files or static asset folders.
