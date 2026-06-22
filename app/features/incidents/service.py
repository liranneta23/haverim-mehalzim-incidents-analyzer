import os
import json
import requests
from app.config import BOARD_ID, MONDAY_URL, MONDAY_HEADERS

# Only the columns the app actually uses — avoids fetching stale / irrelevant data.
_NEEDED_COLUMNS = [
    "status_mkmbjwef",   # map live/handled status
    "color_mkvvrm1r",    # dashboard handled filter (Hebrew statuses)
    "status_mkmb1zc6",   # incident type
    "location_mkmbv7be", # primary map coordinate
    "country_mkmb91h3",  # fallback map coordinate / country breakdown
    "check_mkn3c7v8",    # life-threatening flag
    "timeline_mkmbcabh", # date range for current-month filter
    "text_mm42945p",     # incident description (what happened)
    "text_mm2rbp1q",     # incident assistance (how we helped)
]

_COL_IDS = ', '.join(f'"{c}"' for c in _NEEDED_COLUMNS)

_QUERY = """
{
  boards (ids: [%s]) {
    items_page (limit: 500) {
      items {
        id
        name
        column_values (ids: [%s]) {
          id
          text
          value
        }
      }
    }
  }
}
""" % (BOARD_ID, _COL_IDS)


def fetch_monday_data():
    try:
        response = requests.post(MONDAY_URL, json={'query': _QUERY}, headers=MONDAY_HEADERS)

        if response.status_code != 200:
            print(f"HTTP Error {response.status_code}: {response.text}")
            return None

        data = response.json()

        if 'errors' in data:
            print("GraphQL Error:", data['errors'])
            return None

        items = data['data']['boards'][0]['items_page']['items']

        processed_rows = []
        missing_count = 0

        for item in items:
            row = {'name': item['name'], 'id': item['id']}
            for cv in item['column_values']:
                row[cv['id']] = cv['text']
                # Monday's Country column carries a language-independent ISO-2 code
                # in its `value` JSON. Surface it so the map can resolve any country
                # (incl. ones never seen before) without a hand-maintained name list.
                if cv['id'] == 'country_mkmb91h3' and cv.get('value'):
                    try:
                        row['country_code'] = (json.loads(cv['value']) or {}).get('countryCode')
                    except (ValueError, TypeError):
                        pass

            location = row.get('location_mkmbv7be', '').strip()
            country  = row.get('country_mkmb91h3',  '').strip()

            if not location and not country:
                missing_count += 1
            else:
                processed_rows.append(row)

        print(
            f"[fetch_monday_data] total={len(items)} "
            f"with_location={len(processed_rows)} "
            f"missing_location={missing_count}"
        )

        return processed_rows

    except Exception as e:
        print(f"Error fetching Monday data: {str(e)}")
        return None
