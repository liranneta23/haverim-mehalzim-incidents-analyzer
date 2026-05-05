import re
import requests
from app.config import MONDAY_URL, MONDAY_HEADERS

STEP_DEFINITIONS = [
    {'step': 1, 'title': 'Request Received',             'subtitle': 'We are with you.',                                                              'sensitive': False},
    {'step': 2, 'title': 'Situation Assessment',          'subtitle': 'We are reviewing what happened and how urgent it is.',                          'sensitive': False},
    {'step': 3, 'title': 'Critical Information Verified', 'subtitle': 'Identity, location, status, and contact details are being confirmed.',          'sensitive': False},
    {'step': 4, 'title': 'Case Officer Assigned',         'subtitle': 'A dedicated person is managing the case.',                                      'sensitive': False},
    {'step': 5, 'title': 'Response Network Activated',    'subtitle': 'The right people are being connected.',                                         'sensitive': False},
    {'step': 6, 'title': 'Action Plan in Motion',         'subtitle': 'The required steps are underway.',                                              'sensitive': False},
    {'step': 7, 'title': "Person's Status Verified",      'subtitle': 'The family receives a clear and personal update.',                              'sensitive': False},
    {'step': 7, 'title': 'Family Notified with Care',     'subtitle': 'The family has been updated personally and with care.',                         'sensitive': True },
    {'step': 8, 'title': 'Support & Next Steps',          'subtitle': 'We continue supporting the family through the next steps.',                     'sensitive': False},
    {'step': 8, 'title': 'Family Support & Next Steps',   'subtitle': 'We continue supporting the family through the next steps.',                     'sensitive': True },
]

_LABEL_TO_STEP = {d['title'].lower(): d for d in STEP_DEFINITIONS}

_SENSITIVE_KEYWORDS = {'sensitive', 'family notified', 'family support', 'loss', 'bereavement'}


def _parse_step(label: str) -> dict:
    if not label:
        return STEP_DEFINITIONS[0]

    low = label.strip().lower()

    # Exact title match
    if low in _LABEL_TO_STEP:
        return _LABEL_TO_STEP[low]

    # Extract first digit(s) to get step number
    nums = re.findall(r'\d+', label)
    if nums:
        step_num = int(nums[0])
        if 1 <= step_num <= 8:
            is_sensitive = any(kw in low for kw in _SENSITIVE_KEYWORDS)
            # Find matching definition (sensitive flag match first)
            for d in STEP_DEFINITIONS:
                if d['step'] == step_num and d['sensitive'] == is_sensitive:
                    return d
            # Fallback to first definition for that step number
            for d in STEP_DEFINITIONS:
                if d['step'] == step_num:
                    return d

    return STEP_DEFINITIONS[0]


def fetch_case_status(item_id: str) -> dict | None:
    query = """
    {
      items (ids: [%s]) {
        id
        column_values (ids: ["color_mm32c8wh", "timeline_mkmbcabh"]) {
          id
          text
        }
      }
    }
    """ % item_id

    try:
        resp = requests.post(MONDAY_URL, json={'query': query}, headers=MONDAY_HEADERS, timeout=10)
        if resp.status_code != 200:
            return None

        data = resp.json()
        if 'errors' in data:
            return None

        items = data.get('data', {}).get('items', [])
        if not items:
            return None

        item = items[0]
        cols = {cv['id']: cv['text'] for cv in item['column_values']}

        stage_label = (cols.get('color_mm32c8wh') or '').strip()
        step_def    = _parse_step(stage_label)

        timeline    = cols.get('timeline_mkmbcabh') or ''
        opened_date = None
        if ' - ' in timeline:
            opened_date = timeline.split(' - ')[0].strip()

        return {
            'item_id':      item['id'],
            'step':         step_def['step'],
            'step_title':   step_def['title'],
            'step_subtitle': step_def['subtitle'],
            'is_sensitive': step_def['sensitive'],
            'stage_label':  stage_label,
            'opened_date':  opened_date,
            'total_steps':  8,
        }

    except Exception as e:
        print(f"[tracker_service] Error: {e}")
        return None
