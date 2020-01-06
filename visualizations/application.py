import sys, os
from flask import Flask, render_template
from flask_flatpages import FlatPages
from flask_frozen import Freezer # Added

app = Flask(__name__)
pages = FlatPages(app)
freezer = Freezer(app) # Added

# URL Routing - Home Page
@app.route("/visualizations")
def index():
    return render_template("index.html")

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/scraper")
def scraper():
    return render_template("scraper.html")

@app.route("/extrapolation")
def extrapolation():
    return render_template("extrapolation.html")
# Main Function, Runs at http://0.0.0.0:8000
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "build":
        freezer.freeze()
    else:
        app.run(port=8000)
