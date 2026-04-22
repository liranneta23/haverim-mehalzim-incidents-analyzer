from flask import Blueprint, render_template

dashboard_bp = Blueprint(
    'dashboard',
    __name__,
    static_folder='static',
    static_url_path='/dashboard/static',
)


@dashboard_bp.route('/')
def serve_frontend():
    return render_template('dashboard.html')
