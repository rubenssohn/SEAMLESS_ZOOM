# "webapp" adapted from source: https://realpython.com/flask-project/

from flask import Flask
from webapp import pages

def create_app():
    app = Flask(__name__, static_folder="static")
    app.register_blueprint(pages.bp)
    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(rule)
    return app