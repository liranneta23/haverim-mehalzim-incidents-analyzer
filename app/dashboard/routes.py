import os
from flask import Blueprint, render_template, send_from_directory

dashboard_bp = Blueprint(
    'dashboard',
    __name__,
    static_folder='static',
    static_url_path='/dashboard/static',
)

_GLOBE_DIR = os.path.join(os.path.dirname(__file__), 'static', 'globe')


@dashboard_bp.route('/')
def serve_frontend():
    return render_template('dashboard.html')


@dashboard_bp.route('/map')
@dashboard_bp.route('/map/<path:path>')
def serve_map(path=''):
    """
    Serves the built React globe app from app/dashboard/static/globe/.
    Run `cd frontend && npm run build` whenever globe source code changes.
    """
    target = os.path.join(_GLOBE_DIR, path)
    if path and os.path.isfile(target):
        return send_from_directory(_GLOBE_DIR, path)
    return send_from_directory(_GLOBE_DIR, 'index.html')
