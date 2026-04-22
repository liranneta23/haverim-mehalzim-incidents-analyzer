import requests
from app.config import BOARD_ID, MONDAY_URL, MONDAY_HEADERS

_QUERY = """
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
    try:
        response = requests.post(MONDAY_URL, json={'query': _QUERY}, headers=MONDAY_HEADERS)

        if response.status_code == 200:
            data = response.json()

            if 'errors' in data:
                print("GraphQL Error:", data['errors'])
                return None

            items = data['data']['boards'][0]['items_page']['items']

            processed_rows = []
            for item in items:
                row = {"name": item['name'], "id": item['id']}
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
