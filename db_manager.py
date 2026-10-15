"""
Database Manager for Crop Disease AI
Handles localized Marathi and English agro advisories with MySQL & SQLite support
Developer: Sanket Kirdat
"""

import os
import sys
import sqlite3

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import mysql.connector
    from mysql.connector import Error as MySQLError
    HAS_MYSQL = True
except ImportError:
    HAS_MYSQL = False
    MySQLError = Exception

MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "agri_ai"
}

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "agri_ai.db")

# Comprehensive Bilingual Agro Data (Marathi + English)
BILINGUAL_DISEASES_DATA = {
    "Tomato___Early_blight": {
        "crop_mr": "टोमॅटो",
        "crop_en": "Tomato",
        "name_mr": "टोमॅटो - लवकर येणारा करपा (Early Blight)",
        "name_en": "Tomato - Early Blight (Alternaria solani)",
        "symptoms_mr": "खालील जुन्या पानांवर गोलाकार गडद तपकिरी ते काळे वलयाकार (केंद्रीत गोल) ठिपके पडतात. पाने पिवळी पडून गळतात.",
        "symptoms_en": "Circular dark brown spots with concentric target-like rings appearing first on older lower leaves. Leaves turn yellow and drop prematurely.",
        "organic_mr": "१. ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.\n२. ५% निंबोळी अर्क (Neem Oil) किंवा गोमूत्र व हिंगाचे द्रावण पानांवर फवारा.\n३. बाधित पाने तोडून नष्ट करा.",
        "organic_en": "1. Spray Trichoderma viride @ 5g/liter of water.\n2. Apply 5% Neem Seed Kernel Extract (Neem Oil) or fermented cow urine spray.\n3. Prune and destroy infected lower foliage.",
        "chemical_mr": "१. मॅन्कोझेब ७५% WP (Mancozeb) २.५ ग्रॅम प्रति लिटर किंवा\n२. रिडोमिल गोल्ड (Ridomil Gold) २ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.",
        "chemical_en": "1. Spray Mancozeb 75% WP @ 2.5g/liter or Chlorothalonil @ 2g/liter.\n2. In severe cases, apply Azoxystrobin 23% SC @ 1ml/liter.",
        "cost_per_acre": 1250,
        "organic_cost_per_acre": 650,
        "chemical_cost_per_acre": 1250,
        "risk_humidity": 75
    },
    "Tomato___Late_blight": {
        "crop_mr": "टोमॅटो",
        "crop_en": "Tomato",
        "name_mr": "टोमॅटो - उशिरा येणारा करपा / तांबोरा (Late Blight)",
        "name_en": "Tomato - Late Blight (Phytophthora infestans)",
        "symptoms_mr": "पानांवर आणि फळांवर काळपट-तपकिरी रंगाचे ओले चट्टे दिसतात. थंड आणि दमट हवामानात पानाच्या खाली पांढरी बुरशी वाढते.",
        "symptoms_en": "Large, irregular water-soaked dark lesions on leaves and fruit. White fuzzy fungal growth appears on leaf undersides during cool, humid weather.",
        "organic_mr": "१. ताक आणि तांब्याची पट्टी एकत्र केलेले द्रावण (ताक फवारणी).\n२. सुडोमोनास फ्लोरोसन्स (Pseudomonas fluorescens) १० मिली प्रति लिटर पाण्यात मिसळून फवारा.",
        "organic_en": "1. Spray fermented butter milk solution with copper bio-extract.\n2. Foliar application of Pseudomonas fluorescens @ 10g/liter.",
        "chemical_mr": "१. सिमोक्सॅनिल + मॅन्कोझेब (कर्झेट) ३ ग्रॅम प्रति लिटर किंवा\n२. ॲमेक्टोक्ट्राडिन + डायमेथोमॉर्फ (झॅमप्रो) २ मिली प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 3g/liter.\n2. Or Dimethomorph + Ametoctradin (Zampro) @ 2ml/liter.",
        "cost_per_acre": 1850,
        "organic_cost_per_acre": 750,
        "chemical_cost_per_acre": 1850,
        "risk_humidity": 85
    },
    "Tomato___healthy": {
        "crop_mr": "टोमॅटो",
        "crop_en": "Tomato",
        "name_mr": "टोमॅटो - निरोगी पीक (Healthy)",
        "name_en": "Tomato - Healthy Vigorous Crop",
        "symptoms_mr": "झाडाची पाने टवटवीत, गर्द हिरवीगार आणि कोणत्याही रोगाशिवाय निरोगी आहेत.",
        "symptoms_en": "Leaves are vibrant, lush green, well-expanded, and completely free from lesions or discoloration.",
        "organic_mr": "१. नियमित जीवामृत आणि पंचगव्य ड्रेंचिंग करा.\n२. दर १५ दिवसांनी निंबोळी अर्काची प्रतिबंधात्मक फवारणी करा.",
        "organic_en": "1. Apply regular Jeevamrut or Panchagavya root drenches.\n2. Preventative foliar spray of 10,000 ppm Neem oil every 15 days.",
        "chemical_mr": "कोणत्याही रासायनिक औषधांची गरज नाही. झाडाच्या संतुलित पोषणासाठी १९:१९:१९ विद्राव्य खत देऊ शकता.",
        "chemical_en": "No chemical fungicides required. Apply balanced water-soluble 19:19:19 NPK for optimal vegetative and fruiting growth.",
        "cost_per_acre": 350,
        "organic_cost_per_acre": 350,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 60
    },
    "Potato___Early_blight": {
        "crop_mr": "बटाटा",
        "crop_en": "Potato",
        "name_mr": "बटाटा - करपा रोग (Early Blight)",
        "name_en": "Potato - Early Blight (Alternaria solani)",
        "symptoms_mr": "पानांवर गोलाकार गडद तपकिरी चट्टे पडतात. कालांतराने बटाट्याच्या आकारावर आणि उत्पादनावर गंभीर परिणाम होतो.",
        "symptoms_en": "Dark brown necrotic spots with concentric ring patterns on older foliage, reducing photosynthetic efficiency and tuber yield.",
        "organic_mr": "१. कॉपर बेस्ड सेंद्रिय फवारणी (बोर्डो मिश्रण १%).\n२. ट्रायकोडर्मा हरझियानम कल्चर जमिनीत मिसळा.",
        "organic_en": "1. Spray 1% Bordeaux mixture as preventative organic copper shield.\n2. Enrich soil with Trichoderma harzianum bio-culture.",
        "chemical_mr": "१. अझोक्सीस्ट्रोबिन २३% SC (Amistar) १ मिली प्रति लिटर किंवा\n२. प्रोपिनेब ७०% WP (Antracol) ३ ग्रॅम प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Azoxystrobin 23% SC (Amistar) @ 1ml/liter.\n2. Or Propineb 70% WP (Antracol) @ 3g/liter.",
        "cost_per_acre": 1400,
        "organic_cost_per_acre": 600,
        "chemical_cost_per_acre": 1400,
        "risk_humidity": 70
    },
    "Potato___Late_blight": {
        "crop_mr": "बटाटा",
        "crop_en": "Potato",
        "name_mr": "बटाटा - उशिरा येणारा करपा (Late Blight)",
        "name_en": "Potato - Late Blight (Phytophthora infestans)",
        "symptoms_mr": "पानांच्या टोकावर काळे डाग पडून पाने जळाल्यासारखी दिसतात. संपूर्ण पीक ३-४ दिवसांत कोमेजू शकते.",
        "symptoms_en": "Water-soaked dark lesions spreading rapidly across leaves and stems, turning brown-black as if scorched by frost.",
        "organic_mr": "१. ट्रायकोडर्मा + सेंद्रिय ह्युमिक ॲसिड फवारणी.\n२. शेतात पाण्याचा निचरा योग्य ठेवा.",
        "organic_en": "1. Apply Trichoderma foliar spray enriched with humic bio-stimulants.\n2. Ensure proper field furrow drainage.",
        "chemical_mr": "१. मेटलॅक्सिल ८% + मॅन्कोझेब ६४% WP २.५ ग्रॅम प्रति लिटर फवारा.",
        "chemical_en": "1. Spray Metalaxyl-M 4% + Mancozeb 64% (Ridomil Gold) @ 2.5g/liter immediately upon detection.",
        "cost_per_acre": 2100,
        "organic_cost_per_acre": 800,
        "chemical_cost_per_acre": 2100,
        "risk_humidity": 85
    },
    "Potato___healthy": {
        "crop_mr": "बटाटा",
        "crop_en": "Potato",
        "name_mr": "बटाटा - निरोगी पीक (Healthy)",
        "name_en": "Potato - Healthy Crop",
        "symptoms_mr": "बटाट्याची पाने निरोगी व गर्द हिरवी आहेत. पीक उत्तम स्थितीत आहे.",
        "symptoms_en": "Leaves are crisp, lush green with uniform canopy development and vigorous tuberization.",
        "organic_mr": "सेंद्रिय खते आणि जिवाणू संवर्धकांचा वापर चालू ठेवा.",
        "organic_en": "Maintain organic mulch and bio-fertilizer applications.",
        "chemical_mr": "फक्त संतुलित एनपीके (NPK) खतांची मात्रा द्या. रासायनिक फवारणीची गरज नाही.",
        "chemical_en": "No chemical sprays needed. Maintain regular potassium and micronutrient feeding.",
        "cost_per_acre": 400,
        "organic_cost_per_acre": 400,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
    },
    "Corn___Common_rust": {
        "crop_mr": "मका",
        "crop_en": "Corn (Maize)",
        "name_mr": "मका - तांबेरा रोग (Common Rust)",
        "name_en": "Corn - Common Rust (Puccinia sorghi)",
        "symptoms_mr": "पानांच्या दोन्ही बाजूंना तांबूस-तपकिरी रंगाचे लहान पुरळ (Pustules) उठतात. पाने लवकर वाळतात.",
        "symptoms_en": "Small, elongate golden-brown to reddish pustules on both upper and lower leaf surfaces, leading to early leaf death.",
        "organic_mr": "१. गोमूत्र (१०%) + हिंगाचे द्रावण प्रतिबंधात्मक फवारा.\n२. रोगास प्रतिकारक्षम वाणांची निवड करा.",
        "organic_en": "1. Spray 10% cow urine solution with asafoetida extract.\n2. Plant certified rust-resistant hybrid seeds.",
        "chemical_mr": "१. हेक्झाकोनॅझोल ५% EC (Hexaconazole) २ मिली प्रति लिटर किंवा\n२. प्रोपिकोनाझोल २५% EC (Tilt) १ मिली प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Hexaconazole 5% EC @ 2ml/liter.\n2. Or Propiconazole 25% EC (Tilt) @ 1ml/liter.",
        "cost_per_acre": 950,
        "organic_cost_per_acre": 500,
        "chemical_cost_per_acre": 950,
        "risk_humidity": 80
    },
    "Grape___Black_rot": {
        "crop_mr": "द्राक्षे",
        "crop_en": "Grape",
        "name_mr": "द्राक्षे - काळा कुजवा / ब्लॅक रॉट (Black Rot)",
        "name_en": "Grape - Black Rot (Guignardia bidwellii)",
        "symptoms_mr": "पानांवर लालसर तपकिरी ठिपके पडतात आणि द्राक्षांचे मणी काळे पडून सुकून सुकतात (Mummified).",
        "symptoms_en": "Reddish-brown circular leaf lesions. Berries turn dark, shrivel into hard black mummies that stay on the vine.",
        "organic_mr": "१. वेलींची योग्य छाटणी करून हवा खेळती ठेवा.\n२. जीवामृत आणि ट्रायकोडर्मा ड्रेंचिंग करा.",
        "organic_en": "1. Canopy pruning for maximum sun penetration and air circulation.\n2. Drench soil with Jeevamrut and Trichoderma.",
        "chemical_mr": "१. मायक्लोब्युटॅनिल १०% WP (Systhane) ०.५ ग्रॅम प्रति लिटर किंवा\n२. टेब्युकोनाझोल २५.९% EC १.५ मिली प्रति लिटर फवारा.",
        "chemical_en": "1. Spray Myclobutanil 10% WP (Systhane) @ 0.5g/liter.\n2. Or Tebuconazole 25.9% EC @ 1.5ml/liter.",
        "cost_per_acre": 2800,
        "organic_cost_per_acre": 1100,
        "chemical_cost_per_acre": 2800,
        "risk_humidity": 80
    }
}


class DatabaseManager:
    def __init__(self):
        self.mode = "SQLITE"
        self._init_database()

    def _get_mysql_connection(self):
        if not HAS_MYSQL:
            return None
        try:
            conn = mysql.connector.connect(
                host=MYSQL_CONFIG["host"],
                user=MYSQL_CONFIG["user"],
                password=MYSQL_CONFIG["password"],
                database=MYSQL_CONFIG["database"],
                connect_timeout=2
            )
            return conn
        except MySQLError:
            return None

    def _init_database(self):
        conn = self._get_mysql_connection()
        if conn and conn.is_connected():
            self.mode = "MYSQL"
            conn.close()
            return

        self.mode = "SQLITE"
        self._init_sqlite()

    def _init_sqlite(self):
        try:
            conn = sqlite3.connect(SQLITE_DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS crop_diseases_v2 (
                    disease_name TEXT PRIMARY KEY,
                    crop_mr TEXT,
                    crop_en TEXT,
                    name_mr TEXT,
                    name_en TEXT,
                    symptoms_mr TEXT,
                    symptoms_en TEXT,
                    organic_mr TEXT,
                    organic_en TEXT,
                    chemical_mr TEXT,
                    chemical_en TEXT,
                    cost_per_acre INTEGER,
                    risk_humidity INTEGER
                )
            """)
            for d_name, info in BILINGUAL_DISEASES_DATA.items():
                cursor.execute("""
                    INSERT OR REPLACE INTO crop_diseases_v2 VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    d_name, info["crop_mr"], info["crop_en"], info["name_mr"], info["name_en"],
                    info["symptoms_mr"], info["symptoms_en"], info["organic_mr"], info["organic_en"],
                    info["chemical_mr"], info["chemical_en"], info["cost_per_acre"], info["risk_humidity"]
                ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[DB Warning] SQLite init note: {e}")

    def get_disease_details(self, disease_name, lang="mr"):
        """
        Fetch details in specified language ('mr' or 'en')
        """
        # 1. First check in-memory dictionary (Fastest, zero-fail)
        if disease_name in BILINGUAL_DISEASES_DATA:
            info = BILINGUAL_DISEASES_DATA[disease_name]
            is_mr = (lang == "mr")
            return {
                "disease_name": disease_name,
                "crop_name": info["crop_mr"] if is_mr else info["crop_en"],
                "marathi_name": info["name_mr"] if is_mr else info["name_en"],
                "symptoms_marathi": info["symptoms_mr"] if is_mr else info["symptoms_en"],
                "organic_remedy_marathi": info["organic_mr"] if is_mr else info["organic_en"],
                "chemical_remedy_marathi": info["chemical_mr"] if is_mr else info["chemical_en"],
                "cost_per_acre": info.get("chemical_cost_per_acre", info["cost_per_acre"]),
                "organic_cost": info.get("organic_cost_per_acre", 650),
                "chemical_cost": info.get("chemical_cost_per_acre", info["cost_per_acre"]),
                "risk_humidity": info["risk_humidity"],
                "crop_mr": info["crop_mr"],
                "crop_en": info["crop_en"],
                "name_mr": info["name_mr"],
                "name_en": info["name_en"]
            }

        # Generic fallback
        clean = disease_name.replace("___", " - ").replace("_", " ")
        if lang == "mr":
            return {
                "disease_name": disease_name,
                "crop_name": "पीक",
                "marathi_name": clean,
                "symptoms_marathi": "पानांवर असामान्य डाग आणि विकृती दिसून येत आहे.",
                "organic_remedy_marathi": "१. ५% निंबोळी अर्क फवारा.\n२. ट्रायकोडर्मा व्हिरिडी किंवा गोमूत्र फवारा.",
                "chemical_remedy_marathi": "१. कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम प्रति लिटर किंवा मॅन्कोझेब फवारा.",
                "cost_per_acre": 1000,
                "organic_cost": 500,
                "chemical_cost": 1200,
                "risk_humidity": 75
            }
        else:
            return {
                "disease_name": disease_name,
                "crop_name": "Crop",
                "marathi_name": clean,
                "symptoms_marathi": "Abnormal spots and discoloration observed on leaf tissue.",
                "organic_remedy_marathi": "1. Spray 5% Neem seed kernel extract.\n2. Apply Trichoderma viride bio-culture.",
                "chemical_remedy_marathi": "1. Spray Copper Oxychloride @ 2.5g/L or Mancozeb 75 WP.",
                "cost_per_acre": 1000,
                "organic_cost": 500,
                "chemical_cost": 1200,
                "risk_humidity": 75
            }


db = DatabaseManager()
