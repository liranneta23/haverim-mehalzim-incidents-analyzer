import os
from flask import Flask, request, send_from_directory
from flask_cors import CORS

_DIST = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')

# Path prefixes that must never be indexed by search engines. Kept out of
# robots.txt on purpose — that file is public, so listing sensitive paths
# there would advertise them. A noindex header protects without disclosing.
_NOINDEX_PREFIXES = ('/admin/', '/my-impact/', '/track/', '/api/')


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
        if request.path.startswith(_NOINDEX_PREFIXES):
            response.headers['X-Robots-Tag'] = 'noindex, nofollow'
        response.headers['X-Content-Type-Options']  = 'nosniff'
        response.headers['X-XSS-Protection']        = '1; mode=block'
        response.headers['Referrer-Policy']         = 'strict-origin-when-cross-origin'
        response.headers['X-Frame-Options']         = 'SAMEORIGIN'
        response.headers['Permissions-Policy']      = 'geolocation=(), microphone=(), camera=()'
        return response

    return app
