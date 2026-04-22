from datetime import datetime
from flask import Blueprint, jsonify
from app.features.incidents.service import fetch_monday_data
from app.features.incidents.analysis import (
    count_incidents_per_type,
    get_incidents_current_month,
    get_countries_of_incidents,
    get_our_impact,
)
from app.features.incidents.constants import (
    GROUP_OPENED,
    INCIDENT_HANDLED_BY_RON,
    SIGNIFICANT_INCIDENT,
    ACTIVE_VOLUNTEERS_COUNT,
)

incidents_bp = Blueprint('incidents', __name__)

HANDLED_STATUSES = {GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT}


@incidents_bp.route('/api/dashboard')
def get_dashboard_data():
    try:
        all_incidents = fetch_monday_data()

        if all_incidents is None:
            return jsonify({'success': False, 'message': 'Failed to fetch incidents', 'data': {}}), 500

        filtered = [r for r in all_incidents if r.get('color_mkvvrm1r') in HANDLED_STATUSES]

        month_all = get_incidents_current_month(all_incidents)
        month_filtered = get_incidents_current_month(filtered)

        return jsonify({
            'success': True,
            'data': {
                'summary': {
                    'total_all_incidents': len(all_incidents),
                    'total_handled_incidents': len(filtered),
                    'active_volunteers': ACTIVE_VOLUNTEERS_COUNT,
                    'countries_operated': len(get_countries_of_incidents(filtered)),
                    'regions': 6,
                },
                'all_time': {
                    'total_incidents': len(all_incidents),
                    'handled_incidents': len(filtered),
                    'incident_types': count_incidents_per_type(all_incidents),
                    'handled_incident_types': count_incidents_per_type(filtered),
                    'countries': get_countries_of_incidents(all_incidents),
                    'handled_countries': get_countries_of_incidents(filtered),
                },
                'current_month': {
                    'total_incidents': len(month_all),
                    'handled_incidents': len(month_filtered),
                    'incident_types': count_incidents_per_type(month_all),
                    'handled_incident_types': count_incidents_per_type(month_filtered),
                    'countries': get_countries_of_incidents(month_all),
                    'handled_countries': get_countries_of_incidents(month_filtered),
                },
                'impact': get_our_impact(all_incidents),
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'data': {}}), 500


@incidents_bp.route('/api/incidents')
def get_incidents():
    incidents = fetch_monday_data()
    if incidents is None:
        return jsonify({'success': False, 'message': 'Failed to fetch incidents', 'data': []}), 500
    return jsonify({'success': True, 'data': incidents, 'count': len(incidents)}), 200


@incidents_bp.route('/api/incidents/summary')
def get_incidents_summary():
    incidents = fetch_monday_data()
    if incidents is None:
        return jsonify({'success': False, 'message': 'Failed to fetch incidents', 'summary': {}}), 500
    return jsonify({
        'success': True,
        'summary': count_incidents_per_type(incidents),
        'total_incidents': len(incidents),
        'active_volunteers': ACTIVE_VOLUNTEERS_COUNT,
    }), 200


@incidents_bp.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200
