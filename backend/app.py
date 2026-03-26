from flask import Flask, request, jsonify
from flask_cors import CORS        # <-- YOU MISSED THIS IMPORT
from gee_ndvi import get_ndvi


app = Flask(__name__)
CORS(app)
@app.route("/ndvi", methods=["POST"])
def ndvi_api():
    data = request.json

    aoi = data["aoi"]
    start = data["start"]
    end = data["end"]

    thumb = get_ndvi(aoi, start, end)

    return jsonify({"thumb_url": thumb})



if __name__ == "__main__":
    app.run(debug=True)
