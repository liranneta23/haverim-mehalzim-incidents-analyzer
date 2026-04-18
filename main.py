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
        <title>מנתח אירועים - Incidents Analyzer</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }

            .container {
                max-width: 1400px;
                margin: 0 auto;
            }

            header {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            h1 {
                color: #667eea;
                font-size: 2.5em;
                margin-bottom: 10px;
            }

            h2 {
                color: #667eea;
                font-size: 1.5em;
                margin-top: 30px;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #667eea;
            }

            .subtitle {
                color: #666;
                font-size: 1.1em;
            }

            .section {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                transition: transform 0.3s ease;
                color: white;
            }

            .stat-card:hover {
                transform: translateY(-5px);
            }

            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                margin: 10px 0;
            }

            .stat-label {
                font-size: 0.9em;
                opacity: 0.9;
            }

            .data-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }

            .data-item {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                border-radius: 5px;
            }

            .data-item-label {
                color: #666;
                font-size: 0.9em;
            }

            .data-item-value {
                font-size: 1.5em;
                font-weight: bold;
                color: #667eea;
                margin-top: 5px;
            }

            .countries-list {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
            }

            .country-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
            }

            .country-item:last-child {
                border-bottom: none;
            }

            .country-name {
                font-weight: 500;
            }

            .country-count {
                background: #667eea;
                color: white;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 0.9em;
            }

            .loading {
                text-align: center;
                padding: 40px;
                color: #666;
            }

            .spinner {
                display: inline-block;
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .error {
                background: #fee;
                color: #c33;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #c33;
            }

            footer {
                text-align: center;
                color: white;
                margin-top: 30px;
                opacity: 0.8;
                font-size: 0.9em;
            }

            .two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            @media (max-width: 900px) {
                .two-column {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>📊 מנתח אירועים</h1>
                <p class="subtitle">Incidents Analyzer Dashboard</p>
            </header>

            <div id="content" class="loading">
                <div class="spinner"></div>
                <p style="margin-top: 20px;">טוען נתונים...</p>
            </div>

            <footer>
                <p>Last Updated: <span id="lastUpdate">-</span></p>
            </footer>
        </div>

        <script>
            const API_BASE = window.location.origin;

            async function loadDashboard() {
                try {
                    const response = await fetch(`${API_BASE}/api/dashboard`);
                    const result = await response.json();

                    if (result.success) {
                        renderDashboard(result.data);
                        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('he-IL');
                    } else {
                        showError('Failed to load dashboard data');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showError(`Error loading data: ${error.message}`);
                }
            }

            function renderDashboard(data) {
                const {summary, all_time, current_month, impact} = data;

                let html = `
                    <div class="section">
                        <h2>סיכום כללי</h2>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-label">סך הכל אירועים</div>
                                <div class="stat-number">${summary.total_all_incidents}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">אירועים שטופלו</div>
                                <div class="stat-number">${summary.total_handled_incidents}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">מתנדבים פעילים</div>
                                <div class="stat-number">${summary.active_volunteers}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">מדינות פעולה</div>
                                <div class="stat-number">${summary.countries_operated}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>אימפקט אמיתי</h2>
                        <div class="stats-grid">
                            <div class="stat-card" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
                                <div class="stat-label">מקרים מסכני חיים</div>
                                <div class="stat-number">${impact.count_life_threatening_incidents}</div>
                            </div>
                            <div class="stat-card" style="background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);">
                                <div class="stat-label">חיים שניצלו</div>
                                <div class="stat-number">${impact.count_life_saved}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>סוגי אירועים - סך הכל</h2>
                        <div class="data-grid">
                            ${renderIncidentTypes(all_time.incident_types)}
                        </div>
                    </div>

                    <div class="section">
                        <h2>סוגי אירועים - אירועים שטופלו</h2>
                        <div class="data-grid">
                            ${renderIncidentTypes(all_time.handled_incident_types)}
                        </div>
                    </div>

                    <div class="section">
                        <h2>פריסה גיאוגרפית - סך הכל</h2>
                        <div class="two-column">
                            <div>
                                <h3 style="color: #667eea; margin-bottom: 15px;">כל האירועים</h3>
                                <div class="countries-list">
                                    ${renderCountries(all_time.countries)}
                                </div>
                            </div>
                            <div>
                                <h3 style="color: #667eea; margin-bottom: 15px;">אירועים שטיפלנו</h3>
                                <div class="countries-list">
                                    ${renderCountries(all_time.handled_countries)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>נתונים עבור החודש הנוכחי</h2>
                        <div class="data-grid">
                            <div class="data-item">
                                <div class="data-item-label">סך אירועים בחודש</div>
                                <div class="data-item-value">${current_month.total_incidents}</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label">אירועים שטופלו בחודש</div>
                                <div class="data-item-value">${current_month.handled_incidents}</div>
                            </div>
                        </div>

                        <h3 style="color: #667eea; margin: 20px 0 15px 0;">סוגי אירועים בחודש</h3>
                        <div class="data-grid">
                            ${renderIncidentTypes(current_month.incident_types)}
                        </div>

                        <h3 style="color: #667eea; margin: 20px 0 15px 0;">פריסה גיאוגרפית בחודש</h3>
                        <div class="two-column">
                            <div>
                                <p style="color: #667eea; font-weight: bold; margin-bottom: 10px;">כל האירועים</p>
                                <div class="countries-list">
                                    ${renderCountries(current_month.countries)}
                                </div>
                            </div>
                            <div>
                                <p style="color: #667eea; font-weight: bold; margin-bottom: 10px;">אירועים שטיפלנו</p>
                                <div class="countries-list">
                                    ${renderCountries(current_month.handled_countries)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('content').innerHTML = html;
            }

            function renderIncidentTypes(types) {
                if (!types || Object.keys(types).length === 0) {
                    return '<p style="grid-column: 1/-1; text-align: center; color: #999;">No data available</p>';
                }

                return Object.entries(types)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => `
                        <div class="data-item">
                            <div class="data-item-label">${type || 'לא ידוע'}</div>
                            <div class="data-item-value">${count}</div>
                        </div>
                    `).join('');
            }

            function renderCountries(countries) {
                if (!countries || Object.keys(countries).length === 0) {
                    return '<p style="text-align: center; color: #999;">No countries data</p>';
                }

                return Object.entries(countries)
                    .sort((a, b) => b[1] - a[1])
                    .map(([country, count]) => `
                        <div class="country-item">
                            <span class="country-name">${country || 'לא ידוע'}</span>
                            <span class="country-count">${count}</span>
                        </div>
                    `).join('');
            }

            function showError(message) {
                document.getElementById('content').innerHTML = `<div class="error">${message}</div>`;
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
