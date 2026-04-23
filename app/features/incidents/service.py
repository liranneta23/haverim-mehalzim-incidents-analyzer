import os
import requests
from datetime import datetime
from app.config import BOARD_ID, MONDAY_URL, MONDAY_HEADERS

_AUDIT_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'missing_locations_audit.txt')

# Only the columns the app actually uses — avoids fetching stale / irrelevant data.
_NEEDED_COLUMNS = [
    "status_mkmbjwef",   # map live/handled status
    "color_mkvvrm1r",    # dashboard handled filter (Hebrew statuses)
    "status_mkmb1zc6",   # incident type
    "location_mkmbv7be", # primary map coordinate
    "country_mkmb91h3",  # fallback map coordinate / country breakdown
    "check_mkn3c7v8",    # life-threatening flag
    "timeline_mkmbcabh", # date range for current-month filter
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
        }
      }
    }
  }
}
""" % (BOARD_ID, _COL_IDS)


def _write_audit(missing: list[dict]) -> None:
    """Overwrite the audit file with the current set of location-less incidents."""
    lines = [
        f"# Missing-location audit — generated {datetime.now().isoformat()}",
        f"# Total incidents with no location/country: {len(missing)}",
        "",
    ]
    for inc in missing:
        lines.append(f"{inc['id']}\t{inc['name']}")

    with open(_AUDIT_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')


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
        missing_location = []

        for item in items:
            row = {'name': item['name'], 'id': item['id']}
            for cv in item['column_values']:
                row[cv['id']] = cv['text']

            location = row.get('location_mkmbv7be', '').strip()
            country  = row.get('country_mkmb91h3',  '').strip()

            if not location and not country:
                missing_location.append({'id': row['id'], 'name': row['name']})
            else:
                processed_rows.append(row)

        _write_audit(missing_location)
        print(
            f"[fetch_monday_data] total={len(items)} "
            f"with_location={len(processed_rows)} "
            f"missing_location={len(missing_location)}"
        )

        return processed_rows

    except Exception as e:
        print(f"Error fetching Monday data: {str(e)}")
        return None
