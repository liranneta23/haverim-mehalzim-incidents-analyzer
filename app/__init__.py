import os
from flask import Flask, send_from_directory
from flask_cors import CORS

_DIST = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')


def create_app():
    app = Flask(__name__)
    CORS(app)

    # API routes
    from app.features.incidents.routes import incidents_bp
    app.register_blueprint(incidents_bp)

    # Serve React build for every non-API route
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path: str):
        target = os.path.join(_DIST, path)
        if path and os.path.isfile(target):
            return send_from_directory(_DIST, path)
        return send_from_directory(_DIST, 'index.html')

    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options']  = 'nosniff'
        response.headers['X-XSS-Protection']        = '1; mode=block'
        response.headers['Referrer-Policy']         = 'strict-origin-when-cross-origin'
        response.headers['X-Frame-Options']         = 'SAMEORIGIN'
        response.headers['Permissions-Policy']      = 'geolocation=(), microphone=(), camera=()'
        return response

    return app
