"""
Crop Disease AI - Main Flask Application
Final Year B.Tech (AI & Data Science) Project
Features:
- Image Classification with MobileNetV2 AI Model (model.h5)
- Marathi Remedies & Cost Retrieval via MySQL (with SQLite Fallback)
- Weather Analysis & High-Humidity Fungal Alert via OpenWeatherMap API
- Cyberpunk Neon Glassmorphism Dark UI
"""

import os
import sys
import json
import random
import requests
import numpy as np
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename
from PIL import Image

# UTF-8 Encoding for Windows Console
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import tensorflow as tf
from tensorflow import keras

# Local Database Manager
from db_manager import db

# Initialize Flask App
app = Flask(__name__)
app.config["SECRET_KEY"] = "crop_disease_ai_cyberpunk_secret_2026"
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB Max Limit
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Model & Class Paths
MODEL_PATH = os.path.join(app.root_path, "model.h5")
CLASSES_PATH = os.path.join(app.root_path, "classes.json")
IMG_SIZE = (224, 224)

# Global model and classes cache
ai_model = None
class_names = []

# Optional OpenWeatherMap API Key (User can replace with their own free key)
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")


def load_ai_model():
    """
    AI मॉडेल आणि क्लास यादी लोड करणे
    """
    global ai_model, class_names

    # 1. Load Classes
    if os.path.exists(CLASSES_PATH):
        try:
            with open(CLASSES_PATH, "r", encoding="utf-8") as f:
                class_names = json.load(f)
            print(f"[Model] Loaded {len(class_names)} classes from classes.json.")
        except Exception as e:
            print(f"[Model Warning] Could not read classes.json: {e}")
            class_names = []

    # 2. Load Model
    model_candidates = [
        os.path.join(app.root_path, "model.keras"),
        os.path.join(app.root_path, "model.h5")
    ]
    for path in model_candidates:
        if os.path.exists(path):
            try:
                ai_model = keras.models.load_model(path, compile=False)
                print(f"[Model] {os.path.basename(path)} loaded successfully into memory.")
                break
            except Exception as e:
                print(f"[Model Warning] Could not load {path}: {e}")


# Load immediately on startup
load_ai_model()


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_live_weather(city="Pune"):
    """
    हवामान तपासणे (OpenWeatherMap API द्वारे किंवा रिअलिस्टिक वेदर सिम्युलेटर)
    """
    if OPENWEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={OPENWEATHER_API_KEY}&units=metric"
            resp = requests.get(url, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                temp = round(data["main"]["temp"], 1)
                humidity = data["main"]["humidity"]
                description = data["weather"][0]["description"].title()
                return {
                    "city": city,
                    "temp": temp,
                    "humidity": humidity,
                    "condition": description,
                    "is_live": True
                }
        except Exception as e:
            print(f"[Weather API Warning] Failed to fetch live weather: {e}")

    # Realistic Weather Profiles for Maharashtra Districts (with Satara Priority)
    district_profiles = {
        "Satara": {"temp": 26.8, "humidity": 82, "cond_mr": "दमट व थंड वारे", "cond_en": "Humid & Breezy"},
        "Pune": {"temp": 28.5, "humidity": 76, "cond_mr": "अंशतः ढगाळ", "cond_en": "Partly Cloudy"},
        "Kolhapur": {"temp": 27.5, "humidity": 84, "cond_mr": "दमट व ढगाळ", "cond_en": "Humid & Overcast"},
        "Sangli": {"temp": 29.0, "humidity": 74, "cond_mr": "उबदार व कोरडे", "cond_en": "Warm & Clear"},
        "Nashik": {"temp": 27.0, "humidity": 78, "cond_mr": "थंड वारे व आर्द्रता", "cond_en": "Breezy & Humid"},
        "Solapur": {"temp": 32.0, "humidity": 65, "cond_mr": "उष्ण व कोरडे", "cond_en": "Dry & Sunny"},
        "Aurangabad": {"temp": 30.5, "humidity": 71, "cond_mr": "कोरडे व स्वच्छ", "cond_en": "Clear & Warm"},
        "Nagpur": {"temp": 33.0, "humidity": 68, "cond_mr": "उष्ण व निरभ्र", "cond_en": "Sunny & Warm"}
    }
    prof = district_profiles.get(city, district_profiles["Satara"])
    temp = round(prof["temp"] + random.uniform(-0.8, 0.8), 1)
    humidity = prof["humidity"]
    return {
        "city": city,
        "temp": temp,
        "humidity": humidity,
        "condition": prof["cond_mr"],
        "condition_en": prof["cond_en"],
        "is_live": False
    }


def generate_weather_alert(humidity, risk_humidity=75, lang="mr"):
    """
    हवेतील आर्द्रता आणि रोगाचा धोका याबाबत मराठी/English ॲलर्ट तयार करणे
    """
    is_mr = (lang == "mr")
    if humidity >= risk_humidity:
        return {
            "level": "HIGH",
            "badge_class": "badge-danger",
            "title": "⚠️ उच्च आर्द्रता ॲलर्ट (High Fungal Infection Risk)" if is_mr else "⚠️ High Humidity Fungal Infection Risk Alert",
            "message": f"सध्या हवेतील आर्द्रता {humidity}% आहे. दमट वातावरणामुळे बुरशीजन्य रोगांचा संसर्ग वेगाने पसरू शकतो. त्वरित प्रतिबंधात्मक बुरशीनाशक फवारा." if is_mr else f"Atmospheric humidity is high at {humidity}%. Damp environmental conditions drastically favor fungal sporulation. Apply preventative fungicides."
        }
    elif humidity >= 60:
        return {
            "level": "MODERATE",
            "badge_class": "badge-warning",
            "title": "⚡ मध्यम हवामान जोखीम (Moderate Risk)" if is_mr else "⚡ Moderate Climatic Risk",
            "message": f"सध्या हवेतील आर्द्रता {humidity}% आहे. पिकाची नियमित पाहणी करा." if is_mr else f"Current humidity is {humidity}%. Inspect crops regularly for early symptoms."
        }
    else:
        return {
            "level": "LOW",
            "badge_class": "badge-success",
            "title": "✅ अनुकूल हवामान (Safe Weather Condition)" if is_mr else "✅ Safe Weather Condition",
            "message": f"सध्या हवेतील आर्द्रता {humidity}% असून हवामान कोरडे व नियंत्रणात आहे." if is_mr else f"Humidity is {humidity}%. Low fungal threat level."
        }


def preprocess_image(image_path):
    """
    अपलोड केलेली प्रतिमा MobileNetV2 साठी प्रीप्रोसेस करणे
    """
    img = Image.open(image_path).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img, dtype=np.float32)
    img_array = keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


@app.route("/")
def index():
    weather = get_live_weather("Satara")
    return render_template("index.html", weather=weather, db_mode=db.mode)


@app.route("/api/weather", methods=["GET"])
def weather_api():
    city = request.args.get("city", "Satara")
    weather = get_live_weather(city)
    return jsonify(weather)


@app.route("/predict", methods=["POST"])
def predict():
    """
    प्रतिमा स्वीकारणे -> AI प्रेडिक्शन -> मराठी/English उपाय -> हवामान ॲलर्ट JSON पाठवणे
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "कृपया पिकाच्या पानाचा फोटो अपलोड करा."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "कोणतीही फाईल निवडलेली नाही."}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "error": "अवैध फाईल प्रकार! केवळ JPG, PNG किंवा WEBP फोटो चालेल."}), 400

    try:
        # 1. Save uploaded image safely
        filename = secure_filename(file.filename)
        save_name = f"scan_{random.randint(1000, 9999)}_{filename}"
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], save_name)
        file.save(file_path)

        # 2. Get Selected Language and City
        lang = request.form.get("lang", "mr")
        city = request.form.get("city", "Satara")

        # 3. Run High-Accuracy AI Inference Engine (Sanket Kirdat)
        from inference_engine import predict_leaf_disease
        diag = predict_leaf_disease(file_path, filename=filename, lang=lang)

        # 4. Weather and Humidity Risk Analysis
        weather = get_live_weather(city)
        weather_alert = generate_weather_alert(weather["humidity"], diag.get("risk_humidity", 75), lang=lang)

        # 5. Return complete structured response for Glassmorphism UI
        return jsonify({
            "success": True,
            "image_url": url_for("static", filename=f"uploads/{save_name}"),
            "disease_code": diag["disease_code"],
            "crop_name": diag["crop_name"],
            "marathi_name": diag["marathi_name"],
            "confidence": diag["confidence"],
            "symptoms": diag["symptoms"],
            "organic_remedy": diag["organic_remedy"],
            "chemical_remedy": diag["chemical_remedy"],
            "cost_per_acre": diag["cost_per_acre"],
            "organic_cost": diag.get("organic_cost", 650),
            "chemical_cost": diag.get("chemical_cost", 1250),
            "weather": weather,
            "weather_alert": weather_alert,
            "db_mode": db.mode,
            "developer": "Sanket Kirdat"
        })

    except Exception as e:
        print(f"[Prediction Error] {e}")
        return jsonify({"success": False, "error": f"प्रेडिक्शन करताना त्रुटी आली: {str(e)}"}), 500


if __name__ == "__main__":
    print("=" * 65)
    print("🌾 CROP DISEASE AI - CYBERPUNK SERVER ACTIVE 🌾")
    print(f"📡 Database Mode: {db.mode}")
    print("⚡ Developer: Sanket Kirdat")
    print("🌐 Laptop Local URL:  http://localhost:5000")
    print("📱 Mobile Network URL: http://10.254.215.116:5000")
    print("=" * 65)
    app.run(debug=False, host="0.0.0.0", port=5000)
