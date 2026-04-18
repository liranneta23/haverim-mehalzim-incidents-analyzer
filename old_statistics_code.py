import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

from constants import GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT, ACTIVE_VOLUNTEERS_COUNT

load_dotenv()

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


def main():
    # --- EXECUTION & FILTERING ---
    all_incidents = fetch_monday_data()

    if all_incidents:
        # This is where we filter for the incidents we actually handled
        filtered_incidents = [
            row for row in all_incidents
            if row.get('color_mkvvrm1r') in [GROUP_OPENED, INCIDENT_HANDLED_BY_RON, SIGNIFICANT_INCIDENT]
        ]

        print(f"Found {len(filtered_incidents)} incidents that were handled !")

        incidents_type = count_incidents_per_type(all_incidents)
        print(f"**** ALL INCIDENTS {len(all_incidents)} ( +32 in multiple casualty incident) ****")
        print("Total counts: ", incidents_type)
        counts_per_incident_type = incidents_type
        incidents_current_month = get_incidents_current_month(all_incidents)
        countries_of_incidents_current_month = get_countries_of_incidents(incidents_current_month)
        counts_per_incident_type_current_month = count_incidents_per_type(incidents_current_month)
        print("Last month: ", count_incidents_per_type(incidents_current_month))
        print("Countries operated in (last month): ", countries_of_incidents_current_month)

        incidents_type = count_incidents_per_type(filtered_incidents)
        print(f"**** INCIDENTS WE HANDLED {len(filtered_incidents)} ( +32 in multiple casualty incidents) ****")
        print("Total counts: ", incidents_type)
        countries_of_incidents = get_countries_of_incidents(filtered_incidents)
        filtered_incidents_current_month = get_incidents_current_month(filtered_incidents)
        countries_of_filtered_incidents_current_month = get_countries_of_incidents(filtered_incidents_current_month)
        counts_per_type_filtered_incident_current_month = count_incidents_per_type(filtered_incidents_current_month)

        print("Last month: ", counts_per_type_filtered_incident_current_month)
        print("Countries operated in (all time): ", countries_of_incidents)
        print("Countries operated in (last month): ", countries_of_filtered_incidents_current_month)

        our_impact = get_our_impact(all_incidents)

        print("\n\n\n")
        print("*** SUMMARY ***")
        print(f"**** מענה בחירום {len(all_incidents)} ( +32 בארן) ****")
        print(f"**** פתיחת תיקים מורכבים {len(filtered_incidents)} ( +32 בארן) ****")
        print(f"מתנדבים פעילים {ACTIVE_VOLUNTEERS_COUNT}")
        print(f"פעלנו ב- {len(countries_of_incidents.keys())} מדינות על פני 6 יבשות")

        print("""
        רב נפגעים 3
        *7/10*
        *אמסטרדם*
        *עם כלביא*
        """)

        print(f"""
        סך הכל
        סוגי תיקים
        רפואי {counts_per_incident_type.get('רפואי', 0)}
        נפשי {counts_per_incident_type.get('נפשי', 0)}
        איתור {counts_per_incident_type.get('איתור', 0)}
        חילוץ {counts_per_incident_type.get('חילוץ', 0)}
        אנטישמיות {counts_per_incident_type.get('אנטישמיות', 0)}
        חברות מחלצות {counts_per_incident_type.get('חברות מחלצות', 0)}
        אחר {counts_per_incident_type.get('אחר', 0)}

        """)

        print(""" 
        סך הכל
        זמני תגובה
        כונן ראשון 03 דק
        סופרווייזר 00 דק
        פתיחת תיק 00 דק
        משך ניהול 00 שעות/ימים
        """)

        print(f"""
        החודש
        מענה בחירום {len(incidents_current_month)}
        פתיחת תיקים מורכבים {len(filtered_incidents_current_month)}
        """)

        print("""
        החודש
        זמני תגובה
        כונן 02 דק
        סופרווייזר 00 דק
        פתיחת תיק 00 דק
        משך ניהול 00 שעות/ימים

        מבוטחים 00 מתוך 00
        """)

        print(f"""
        החודש
        סוגי תיקים
        רפואי {counts_per_incident_type_current_month.get('רפואי', 0)}
        נפשי {counts_per_incident_type_current_month.get('נפשי', 0)}
        איתור {counts_per_incident_type_current_month.get('איתור', 0)}
        חילוץ {counts_per_incident_type_current_month.get('חילוץ', 0)}
        אנטישמיות {counts_per_incident_type_current_month.get('אנטישמיות', 0)}
        חברות מחלצות {counts_per_incident_type_current_month.get('חברות מחלצות', 0)}
        אחר {counts_per_incident_type_current_month.get('אחר', 0)}
        """)

        print(f"""
        פריסה מבצעית החודש (באירועים שפתחנו תיק עבורם)
        {countries_of_filtered_incidents_current_month}
        """)

        print(f"""
        אימפקט אמיתי
        מקרים מסכני חיים {our_impact["count_life_threatening_incidents"]}
        חיים שניצלו {our_impact["count_life_saved"]}
        זמן ממוצע לייצוב אירוע X שעות
        """)

        # for inc in filtered_incidents:
        #     print(f"- {inc['name']} (ID: {inc['id']})")


if __name__ == "__main__":
    main()
