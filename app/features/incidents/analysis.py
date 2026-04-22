from datetime import datetime
from app.features.incidents.constants import SIGNIFICANT_INCIDENT


def count_incidents_per_type(incidents_list):
    event_counts = {}
    for row in incidents_list:
        event_type = row.get('status_mkmb1zc6') or "Unknown/Empty"
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
    return event_counts


def get_incidents_current_month(incidents_list):
    now = datetime.now()
    result = []
    for row in incidents_list:
        timeline = row.get('timeline_mkmbcabh')
        if timeline and '-' in timeline:
            try:
                start = datetime.strptime(timeline.split(' - ')[0].strip(), '%Y-%m-%d')
                if start.year == now.year and start.month == now.month:
                    result.append(row)
            except Exception as e:
                print(f"Skipping row due to date error: {e}")
    return result


def get_countries_of_incidents(incidents_list):
    countries = {}
    for row in incidents_list:
        country = row.get('country_mkmb91h3')
        if country:
            countries[country] = countries.get(country, 0) + 1
    return countries


def get_our_impact(incidents_list):
    life_threatening = 0
    lives_saved = 0
    for row in incidents_list:
        if row.get('check_mkn3c7v8'):
            life_threatening += 1
        if row.get('color_mkvvrm1r') == SIGNIFICANT_INCIDENT:
            lives_saved += 1
    return {
        'count_life_saved': lives_saved,
        'count_life_threatening_incidents': life_threatening
    }
