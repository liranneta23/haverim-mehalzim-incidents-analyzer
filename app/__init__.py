from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__, template_folder='../templates')
    CORS(app)

    from app.features.incidents.routes import incidents_bp
    from app.dashboard.routes import dashboard_bp

    app.register_blueprint(incidents_bp)
    app.register_blueprint(dashboard_bp)

    return app
