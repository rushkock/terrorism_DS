import sys, os
from flask import Flask, render_template

import json
import ast

app = Flask(__name__)

# read json file
with open("static/data/tweet_dump.json", "r") as f:
  tweet_dump_unicode = json.loads(f.read())
# transform unicode into python dict
tweet_dump_dict = ast.literal_eval(tweet_dump_unicode)

@app.route("/visualizations")
def index():
    return render_template("index.html", visualizations=True)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/scraper")
def scraper():
    return render_template("scraper.html", data=tweet_dump_dict)
