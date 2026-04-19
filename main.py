import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from constants import GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT, ACTIVE_VOLUNTEERS_COUNT

# Load environment variables
load_dotenv()

# --- FLASK APP SETUP ---
app = Flask(__name__)
CORS(app)  # Enable CORS

# --- CONFIGURATION ---
API_KEY = os.getenv("MONDAY_API_KEY")
BOARD_ID = 1783313577
MONDAY_URL = "https://api.monday.com/v2"

monday_headers = {
    "Authorization": API_KEY,
    "Content-Type": "application/json"
}

# GraphQL Query
query = """
{
  boards (ids: [%s]) {
    items_page (limit: 500) {
      items {
        id
        name
        column_values {
          id
          text
          value
        }
      }
    }
  }
}
""" % BOARD_ID


def fetch_monday_data():
    """Fetch incident data from Monday.com API"""
    try:
        response = requests.post(MONDAY_URL, json={'query': query}, headers=monday_headers)

        if response.status_code == 200:
            data = response.json()

            if 'errors' in data:
                print("GraphQL Error:", data['errors'])
                return None

            items = data['data']['boards'][0]['items_page']['items']

            processed_rows = []
            for item in items:
                row = {
                    "name": item['name'],
                    "id": item['id']
                }
                for cv in item['column_values']:
                    row[cv['id']] = cv['text']

                processed_rows.append(row)

            return processed_rows
        else:
            print(f"HTTP Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching Monday data: {str(e)}")
        return None


def count_incidents_per_type(incidents_list):
    """Count incidents by type"""
    event_counts = {}

    for row in incidents_list:
        event_type = row.get('status_mkmb1zc6')

        if not event_type:
            event_type = "Unknown/Empty"

        if event_type in event_counts:
            event_counts[event_type] += 1
        else:
            event_counts[event_type] = 1

    return event_counts


def get_incidents_current_month(incidents_list):
    """Get incidents from the current month"""
    now = datetime.now()
    current_year = now.year
    current_month = now.month

    current_month_incidents = []

    for row in incidents_list:
        incident_timeline = row.get('timeline_mkmbcabh')

        if incident_timeline and '-' in incident_timeline:
            try:
                start_date_str = incident_timeline.split(' - ')[0].strip()
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')

                if start_date.year == current_year and start_date.month == current_month:
                    current_month_incidents.append(row)

            except Exception as e:
                print(f"Skipping row due to date error: {e}")
                continue

    return current_month_incidents


def get_countries_of_incidents(incidents_list):
    """Get countries where incidents occurred"""
    countries_of_incidents = {}

    for row in incidents_list:
        country = row.get('country_mkmb91h3')

        if country:
            if country in countries_of_incidents:
                countries_of_incidents[country] += 1
            else:
                countries_of_incidents[country] = 1

    return countries_of_incidents


def get_our_impact(incidents_list):
    """Calculate impact metrics"""
    count_life_threatening_incidents = 0
    count_life_saved = 0

    for row in incidents_list:
        is_life_threatening = row.get('check_mkn3c7v8')
        if is_life_threatening:
            count_life_threatening_incidents += 1

        incident_type = row.get('color_mkvvrm1r')
        if incident_type and incident_type == SIGNIFICANT_INCIDENT:
            count_life_saved += 1

    return {
        'count_life_saved': count_life_saved,
        'count_life_threatening_incidents': count_life_threatening_incidents
    }


# --- API ENDPOINTS ---

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get comprehensive dashboard data"""
    try:
        all_incidents = fetch_monday_data()

        if all_incidents is None:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch incidents',
                'data': {}
            }), 500

        # Filter handled incidents
        filtered_incidents = [
            row for row in all_incidents
            if row.get('color_mkvvrm1r') in [GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT]
        ]

        # Get current month data
        incidents_current_month = get_incidents_current_month(all_incidents)
        filtered_incidents_current_month = get_incidents_current_month(filtered_incidents)

        # Get statistics
        all_counts = count_incidents_per_type(all_incidents)
        filtered_counts = count_incidents_per_type(filtered_incidents)
        current_month_counts = count_incidents_per_type(incidents_current_month)
        filtered_current_month_counts = count_incidents_per_type(filtered_incidents_current_month)

        # Get countries
        all_countries = get_countries_of_incidents(all_incidents)
        filtered_countries = get_countries_of_incidents(filtered_incidents)
        current_month_countries = get_countries_of_incidents(incidents_current_month)
        filtered_current_month_countries = get_countries_of_incidents(filtered_incidents_current_month)

        # Get impact
        impact = get_our_impact(all_incidents)

        return jsonify({
            'success': True,
            'data': {
                'summary': {
                    'total_all_incidents': len(all_incidents),
                    'total_handled_incidents': len(filtered_incidents),
                    'active_volunteers': ACTIVE_VOLUNTEERS_COUNT,
                    'countries_operated': len(filtered_countries),
                    'regions': 6
                },
                'all_time': {
                    'total_incidents': len(all_incidents),
                    'handled_incidents': len(filtered_incidents),
                    'incident_types': all_counts,
                    'handled_incident_types': filtered_counts,
                    'countries': all_countries,
                    'handled_countries': filtered_countries
                },
                'current_month': {
                    'total_incidents': len(incidents_current_month),
                    'handled_incidents': len(filtered_incidents_current_month),
                    'incident_types': current_month_counts,
                    'handled_incident_types': filtered_current_month_counts,
                    'countries': current_month_countries,
                    'handled_countries': filtered_current_month_countries
                },
                'impact': impact
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': {}
        }), 500


@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    """Get all incidents"""
    incidents = fetch_monday_data()

    if incidents is None:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch incidents',
            'data': []
        }), 500

    return jsonify({
        'success': True,
        'data': incidents,
        'count': len(incidents)
    }), 200


@app.route('/api/incidents/summary', methods=['GET'])
def get_incidents_summary():
    """Get incident summary statistics"""
    incidents = fetch_monday_data()

    if incidents is None:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch incidents',
            'summary': {}
        }), 500

    counts_by_type = count_incidents_per_type(incidents)

    return jsonify({
        'success': True,
        'summary': counts_by_type,
        'total_incidents': len(incidents),
        'active_volunteers': ACTIVE_VOLUNTEERS_COUNT
    }), 200


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/', methods=['GET'])
def serve_frontend():
    """Serve the main dashboard page"""
    return '''
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>מנתח אירועים — Incident Command</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Hebrew:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-void: #080b0f;
                --bg-surface: #0e1319;
                --bg-card: #131a23;
                --bg-card-hover: #172030;
                --bg-elevated: #1a2535;
                --border-dim: rgba(255,255,255,0.06);
                --border-mid: rgba(255,255,255,0.1);
                --border-accent: rgba(0,230,160,0.3);
                --text-primary: #f0f4f8;
                --text-secondary: #7a9ab5;
                --text-muted: #3d5a72;
                --accent-teal: #00e6a0;
                --accent-teal-dim: rgba(0,230,160,0.12);
                --accent-teal-glow: rgba(0,230,160,0.06);
                --accent-red: #ff4d6a;
                --accent-red-dim: rgba(255,77,106,0.12);
                --accent-amber: #ffb930;
                --accent-amber-dim: rgba(255,185,48,0.12);
                --accent-blue: #4da6ff;
                --accent-blue-dim: rgba(77,166,255,0.12);
                --font-display: 'Syne', sans-serif;
                --font-mono: 'JetBrains Mono', monospace;
                --font-hebrew: 'Noto Sans Hebrew', sans-serif;
            }

            *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

            html { scroll-behavior: smooth; }

            body {
                background: var(--bg-void);
                color: var(--text-primary);
                font-family: var(--font-hebrew);
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Subtle grid texture */
            body::before {
                content: '';
                position: fixed;
                inset: 0;
                background-image:
                    linear-gradient(rgba(0,230,160,0.015) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,230,160,0.015) 1px, transparent 1px);
                background-size: 40px 40px;
                pointer-events: none;
                z-index: 0;
            }

            .page-wrapper {
                position: relative;
                z-index: 1;
                max-width: 1440px;
                margin: 0 auto;
                padding: 0 32px 60px;
            }

            /* ─── HEADER ─── */
            header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 28px 0 36px;
                border-bottom: 1px solid var(--border-dim);
                margin-bottom: 40px;
            }

            .header-brand {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .brand-icon {
                width: 44px;
                height: 44px;
                border: 1px solid var(--border-accent);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--accent-teal-dim);
                flex-shrink: 0;
            }

            .brand-icon svg { width: 22px; height: 22px; }

            .brand-title {
                font-family: var(--font-display);
                font-size: 22px;
                font-weight: 800;
                letter-spacing: -0.5px;
                color: var(--text-primary);
                line-height: 1;
            }

            .brand-sub {
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--accent-teal);
                letter-spacing: 0.08em;
                margin-top: 4px;
                text-transform: uppercase;
            }

            .header-meta {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .status-pill {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                border: 1px solid var(--border-accent);
                border-radius: 100px;
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--accent-teal);
                background: var(--accent-teal-dim);
            }

            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--accent-teal);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.8); }
            }

            .last-update {
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--text-muted);
            }

            /* ─── SECTION LABELS ─── */
            .section-label {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }

            .section-label-line {
                flex: 1;
                height: 1px;
                background: var(--border-dim);
            }

            .section-label-text {
                font-family: var(--font-mono);
                font-size: 10px;
                letter-spacing: 0.15em;
                color: var(--text-muted);
                text-transform: uppercase;
                white-space: nowrap;
            }

            /* ─── KPI GRID ─── */
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 40px;
            }

            .kpi-card {
                background: var(--bg-card);
                border: 1px solid var(--border-dim);
                border-radius: 14px;
                padding: 22px 24px;
                position: relative;
                overflow: hidden;
                transition: border-color 0.2s, background 0.2s;
                cursor: default;
            }

            .kpi-card:hover {
                border-color: var(--border-mid);
                background: var(--bg-card-hover);
            }

            .kpi-card::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                border-radius: 14px 14px 0 0;
                background: var(--kpi-accent, var(--accent-teal));
                opacity: 0.7;
            }

            .kpi-card.red  { --kpi-accent: var(--accent-red); }
            .kpi-card.amber { --kpi-accent: var(--accent-amber); }
            .kpi-card.blue  { --kpi-accent: var(--accent-blue); }

            .kpi-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 14px;
                background: var(--kpi-icon-bg, var(--accent-teal-dim));
            }

            .kpi-card.red  .kpi-icon { background: var(--accent-red-dim); }
            .kpi-card.amber .kpi-icon { background: var(--accent-amber-dim); }
            .kpi-card.blue  .kpi-icon { background: var(--accent-blue-dim); }

            .kpi-icon svg { width: 16px; height: 16px; }

            .kpi-number {
                font-family: var(--font-display);
                font-size: 42px;
                font-weight: 800;
                line-height: 1;
                color: var(--text-primary);
                letter-spacing: -1px;
                margin-bottom: 6px;
            }

            .kpi-label {
                font-size: 12px;
                color: var(--text-secondary);
                font-weight: 400;
            }

            /* ─── IMPACT STRIP ─── */
            .impact-strip {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-bottom: 40px;
            }

            .impact-card {
                border-radius: 14px;
                padding: 28px 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--border-dim);
            }

            .impact-card.danger {
                background: linear-gradient(135deg, #1a0a0d 0%, #130810 100%);
                border-color: rgba(255,77,106,0.2);
            }

            .impact-card.success {
                background: linear-gradient(135deg, #041710 0%, #030d10 100%);
                border-color: rgba(0,230,160,0.2);
            }

            .impact-card::before {
                content: '';
                position: absolute;
                top: -40px;
                right: -40px;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: var(--impact-glow, rgba(255,77,106,0.05));
                filter: blur(30px);
            }

            .impact-card.success::before { --impact-glow: rgba(0,230,160,0.08); }

            .impact-info {}
            .impact-label {
                font-size: 12px;
                color: var(--text-secondary);
                margin-bottom: 8px;
            }

            .impact-number {
                font-family: var(--font-display);
                font-size: 56px;
                font-weight: 800;
                line-height: 1;
                letter-spacing: -2px;
            }

            .impact-card.danger .impact-number { color: var(--accent-red); }
            .impact-card.success .impact-number { color: var(--accent-teal); }

            .impact-badge {
                padding: 6px 12px;
                border-radius: 6px;
                font-family: var(--font-mono);
                font-size: 10px;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            .impact-card.danger .impact-badge {
                background: var(--accent-red-dim);
                color: var(--accent-red);
                border: 1px solid rgba(255,77,106,0.25);
            }

            .impact-card.success .impact-badge {
                background: var(--accent-teal-dim);
                color: var(--accent-teal);
                border: 1px solid var(--border-accent);
            }

            /* ─── TWO-COL LAYOUT ─── */
            .two-col {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 40px;
            }

            .three-col {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 24px;
                margin-bottom: 40px;
            }

            /* ─── PANEL ─── */
            .panel {
                background: var(--bg-card);
                border: 1px solid var(--border-dim);
                border-radius: 16px;
                overflow: hidden;
            }

            .panel-header {
                padding: 18px 22px 16px;
                border-bottom: 1px solid var(--border-dim);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .panel-title {
                font-family: var(--font-display);
                font-size: 14px;
                font-weight: 700;
                color: var(--text-primary);
                letter-spacing: -0.2px;
            }

            .panel-count {
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--text-muted);
                background: var(--bg-elevated);
                padding: 3px 8px;
                border-radius: 4px;
            }

            .panel-body { padding: 8px 0; }

            /* ─── INCIDENT TYPE ROWS ─── */
            .type-row {
                display: flex;
                align-items: center;
                padding: 11px 22px;
                gap: 14px;
                border-bottom: 1px solid var(--border-dim);
                transition: background 0.15s;
            }

            .type-row:last-child { border-bottom: none; }
            .type-row:hover { background: rgba(255,255,255,0.02); }

            .type-bar-container {
                flex: 1;
                height: 3px;
                background: rgba(255,255,255,0.05);
                border-radius: 2px;
                overflow: hidden;
            }

            .type-bar {
                height: 100%;
                border-radius: 2px;
                background: var(--accent-teal);
                transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .type-name {
                font-size: 12px;
                color: var(--text-secondary);
                min-width: 120px;
                text-align: right;
            }

            .type-count {
                font-family: var(--font-mono);
                font-size: 13px;
                font-weight: 500;
                color: var(--text-primary);
                min-width: 32px;
                text-align: left;
            }

            /* ─── COUNTRY ROWS ─── */
            .country-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 22px;
                border-bottom: 1px solid var(--border-dim);
                transition: background 0.15s;
            }

            .country-row:last-child { border-bottom: none; }
            .country-row:hover { background: rgba(255,255,255,0.02); }

            .country-rank {
                font-family: var(--font-mono);
                font-size: 10px;
                color: var(--text-muted);
                width: 20px;
            }

            .country-name {
                flex: 1;
                font-size: 12px;
                color: var(--text-secondary);
                margin-right: 12px;
            }

            .country-badge {
                font-family: var(--font-mono);
                font-size: 11px;
                font-weight: 500;
                color: var(--accent-teal);
                background: var(--accent-teal-dim);
                border: 1px solid rgba(0,230,160,0.15);
                padding: 2px 8px;
                border-radius: 4px;
                min-width: 32px;
                text-align: center;
            }

            /* ─── MONTH SECTION ─── */
            .month-hero {
                background: var(--bg-card);
                border: 1px solid var(--border-dim);
                border-radius: 16px;
                padding: 30px 32px;
                margin-bottom: 40px;
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 40px;
                align-items: center;
            }

            .month-stats {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .month-stat {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .month-stat-value {
                font-family: var(--font-display);
                font-size: 48px;
                font-weight: 800;
                letter-spacing: -2px;
                line-height: 1;
                color: var(--text-primary);
            }

            .month-stat-label {
                font-size: 12px;
                color: var(--text-muted);
            }

            .month-divider {
                width: 1px;
                background: var(--border-dim);
                align-self: stretch;
            }

            .month-breakdown {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            /* ─── LOADING ─── */
            #loading-screen {
                position: fixed;
                inset: 0;
                background: var(--bg-void);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
                z-index: 999;
            }

            .loader-ring {
                width: 48px;
                height: 48px;
                border: 2px solid var(--border-dim);
                border-top-color: var(--accent-teal);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin { to { transform: rotate(360deg); } }

            .loader-text {
                font-family: var(--font-mono);
                font-size: 12px;
                color: var(--text-muted);
                letter-spacing: 0.1em;
            }

            /* ─── ERROR ─── */
            .error-box {
                background: rgba(255,77,106,0.08);
                border: 1px solid rgba(255,77,106,0.3);
                border-radius: 12px;
                padding: 24px 28px;
                color: var(--accent-red);
                font-family: var(--font-mono);
                font-size: 13px;
            }

            /* ─── EMPTY STATE ─── */
            .empty {
                padding: 24px;
                text-align: center;
                font-size: 12px;
                color: var(--text-muted);
                font-family: var(--font-mono);
            }

            /* ─── RESPONSIVE ─── */
            @media (max-width: 1024px) {
                .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                .three-col { grid-template-columns: 1fr 1fr; }
            }

            @media (max-width: 700px) {
                .page-wrapper { padding: 0 16px 40px; }
                .kpi-grid { grid-template-columns: 1fr 1fr; }
                .two-col, .impact-strip, .three-col { grid-template-columns: 1fr; }
                .month-hero { grid-template-columns: 1fr; }
            }

            /* ─── FADE IN ─── */
            .fade-in {
                animation: fadeIn 0.5s ease both;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(12px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .stagger-1 { animation-delay: 0.05s; }
            .stagger-2 { animation-delay: 0.1s; }
            .stagger-3 { animation-delay: 0.15s; }
            .stagger-4 { animation-delay: 0.2s; }
            .stagger-5 { animation-delay: 0.25s; }
        </style>
    </head>
    <body>

    <div id="loading-screen">
        <div class="loader-ring"></div>
        <div class="loader-text">FETCHING INCIDENTS...</div>
    </div>

    <div class="page-wrapper" id="app" style="display:none;">
        <header>
            <div class="header-brand">
                <div class="brand-icon">
                    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="#00e6a0" stroke-width="1.5"/>
                        <circle cx="11" cy="11" r="3" fill="#00e6a0"/>
                        <line x1="11" y1="3" x2="11" y2="1" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round"/>
                        <line x1="11" y1="21" x2="11" y2="19" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round"/>
                        <line x1="3" y1="11" x2="1" y2="11" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round"/>
                        <line x1="21" y1="11" x2="19" y2="11" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div>
                    <div class="brand-title">מנתח אירועים</div>
                    <div class="brand-sub">Incident Command Dashboard</div>
                </div>
            </div>
            <div class="header-meta">
                <div class="status-pill">
                    <div class="status-dot"></div>
                    LIVE
                </div>
                <div class="last-update">עודכן: <span id="lastUpdate">—</span></div>
            </div>
        </header>

        <div id="dashboard-content"></div>
    </div>

    <script>
    const API_BASE = window.location.origin;

    async function loadDashboard() {
        try {
            const res = await fetch(`${API_BASE}/api/dashboard`);
            const result = await res.json();
            if (result.success) {
                renderDashboard(result.data);
                document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('he-IL');
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('app').style.display = 'block';
            } else {
                showError('Failed to load dashboard data');
            }
        } catch (err) {
            showError(`Connection error: ${err.message}`);
        }
    }

    function showError(msg) {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('dashboard-content').innerHTML =
            `<div class="error-box">⚠ ${msg}</div>`;
    }

    function renderDashboard(data) {
        const { summary, all_time, current_month, impact } = data;

        const html = `
            <!-- KPI SUMMARY -->
            <div class="section-label fade-in">
                <div class="section-label-text">סיכום כללי</div>
                <div class="section-label-line"></div>
            </div>

            <div class="kpi-grid">
                ${kpiCard('', summary.total_all_incidents, 'סך הכל אירועים', '', iconSignal())}
                ${kpiCard('', summary.total_handled_incidents, 'אירועים שטופלו', '', iconShield())}
                ${kpiCard('blue', summary.active_volunteers, 'מתנדבים פעילים', '', iconUsers())}
                ${kpiCard('amber', summary.countries_operated, 'מדינות פעולה', '', iconGlobe())}
            </div>

            <!-- IMPACT -->
            <div class="section-label fade-in stagger-1">
                <div class="section-label-text">אימפקט</div>
                <div class="section-label-line"></div>
            </div>

            <div class="impact-strip fade-in stagger-2">
                <div class="impact-card danger">
                    <div class="impact-info">
                        <div class="impact-label">מקרים מסכני חיים</div>
                        <div class="impact-number">${impact.count_life_threatening_incidents}</div>
                    </div>
                    <div class="impact-badge">CRITICAL</div>
                </div>
                <div class="impact-card success">
                    <div class="impact-info">
                        <div class="impact-label">חיים שניצלו</div>
                        <div class="impact-number">${impact.count_life_saved}</div>
                    </div>
                    <div class="impact-badge">SAVED</div>
                </div>
            </div>

            <!-- ALL-TIME INCIDENT TYPES -->
            <div class="section-label fade-in stagger-2">
                <div class="section-label-text">סוגי אירועים — סך הכל</div>
                <div class="section-label-line"></div>
            </div>

            <div class="two-col fade-in stagger-3">
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">כל האירועים</div>
                        <div class="panel-count">${Object.keys(all_time.incident_types).length} סוגים</div>
                    </div>
                    <div class="panel-body">
                        ${renderTypeRows(all_time.incident_types)}
                    </div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">אירועים שטופלו</div>
                        <div class="panel-count">${Object.keys(all_time.handled_incident_types).length} סוגים</div>
                    </div>
                    <div class="panel-body">
                        ${renderTypeRows(all_time.handled_incident_types)}
                    </div>
                </div>
            </div>

            <!-- GEOGRAPHY -->
            <div class="section-label fade-in stagger-3">
                <div class="section-label-text">פריסה גיאוגרפית</div>
                <div class="section-label-line"></div>
            </div>

            <div class="two-col fade-in stagger-4">
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">כל המדינות</div>
                        <div class="panel-count">${Object.keys(all_time.countries).length} מדינות</div>
                    </div>
                    <div class="panel-body">
                        ${renderCountryRows(all_time.countries)}
                    </div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">מדינות שטיפלנו</div>
                        <div class="panel-count">${Object.keys(all_time.handled_countries).length} מדינות</div>
                    </div>
                    <div class="panel-body">
                        ${renderCountryRows(all_time.handled_countries)}
                    </div>
                </div>
            </div>

            <!-- CURRENT MONTH -->
            <div class="section-label fade-in stagger-4">
                <div class="section-label-text">החודש הנוכחי — ${getHebrewMonth()}</div>
                <div class="section-label-line"></div>
            </div>

            <div class="month-hero fade-in stagger-5">
                <div class="month-stats">
                    <div class="month-stat">
                        <div class="month-stat-value">${current_month.total_incidents}</div>
                        <div class="month-stat-label">סך אירועים בחודש</div>
                    </div>
                    <div class="month-stat">
                        <div class="month-stat-value" style="color: var(--accent-teal);">${current_month.handled_incidents}</div>
                        <div class="month-stat-label">אירועים שטופלו</div>
                    </div>
                </div>
                <div class="month-divider"></div>
                <div class="month-breakdown">
                    ${renderTypeRows(current_month.incident_types)}
                </div>
            </div>

            <div class="two-col fade-in stagger-5">
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">מדינות בחודש — כל האירועים</div>
                    </div>
                    <div class="panel-body">
                        ${renderCountryRows(current_month.countries)}
                    </div>
                </div>
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">מדינות בחודש — אירועים שטופלו</div>
                    </div>
                    <div class="panel-body">
                        ${renderCountryRows(current_month.handled_countries)}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dashboard-content').innerHTML = html;
    }

    function kpiCard(colorClass, value, label, extra, iconSvg) {
        return `
            <div class="kpi-card ${colorClass} fade-in">
                <div class="kpi-icon">${iconSvg}</div>
                <div class="kpi-number">${value}</div>
                <div class="kpi-label">${label}</div>
            </div>
        `;
    }

    function renderTypeRows(types) {
        if (!types || !Object.keys(types).length)
            return '<div class="empty">אין נתונים</div>';
        const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
        const max = entries[0][1];
        return entries.map(([type, count]) => `
            <div class="type-row">
                <div class="type-name">${type || 'לא ידוע'}</div>
                <div class="type-bar-container">
                    <div class="type-bar" style="width: ${Math.round((count / max) * 100)}%"></div>
                </div>
                <div class="type-count">${count}</div>
            </div>
        `).join('');
    }

    function renderCountryRows(countries) {
        if (!countries || !Object.keys(countries).length)
            return '<div class="empty">אין נתונים</div>';
        return Object.entries(countries)
            .sort((a, b) => b[1] - a[1])
            .map(([country, count], i) => `
                <div class="country-row">
                    <div class="country-rank">${String(i + 1).padStart(2, '0')}</div>
                    <div class="country-name">${country || 'לא ידוע'}</div>
                    <div class="country-badge">${count}</div>
                </div>
            `).join('');
    }

    function getHebrewMonth() {
        return new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' });
    }

    /* ── SVG Icons ── */
    function iconSignal() {
        return `<svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round">
            <circle cx="8" cy="8" r="2"/>
            <path d="M3 13a7 7 0 0 1 0-10M13 3a7 7 0 0 1 0 10"/>
        </svg>`;
    }
    function iconShield() {
        return `<svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 2L3 4.5v4c0 3 2 5 5 5.5 3-.5 5-2.5 5-5.5v-4L8 2z"/>
        </svg>`;
    }
    function iconUsers() {
        return `<svg viewBox="0 0 16 16" fill="none" stroke="#4da6ff" stroke-width="1.5" stroke-linecap="round">
            <circle cx="6" cy="5" r="2.5"/>
            <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/>
            <path d="M11 3.5a2.5 2.5 0 0 1 0 5M14.5 13.5c0-2-1.5-3.5-3.5-3.5"/>
        </svg>`;
    }
    function iconGlobe() {
        return `<svg viewBox="0 0 16 16" fill="none" stroke="#ffb930" stroke-width="1.5" stroke-linecap="round">
            <circle cx="8" cy="8" r="6"/>
            <path d="M2 8h12M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12"/>
        </svg>`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadDashboard();
        setInterval(loadDashboard, 5 * 60 * 1000);
    });
    </script>
    </body>
    </html>
    '''


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
