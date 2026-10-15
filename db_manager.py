"""
Database Manager for Crop Disease AI
Handles MySQL connection with automatic fallback to local SQLite database
Ensures the app runs reliably in all environments (Presentation, Viva, Production)
"""

import os
import sys
import sqlite3

# Configure UTF-8 for console output on Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import mysql.connector
from mysql.connector import Error as MySQLError

# Default MySQL Configuration
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Change if you have set a MySQL root password
    "database": "agri_ai"
}

# Fallback SQLite DB path
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "agri_ai.db")

# Default comprehensive Marathi remedies data
DEFAULT_DISEASES_DATA = [
    (
        'Tomato___Early_blight',
        'टोमॅटो (Tomato)',
        'टोमॅटो - लवकर येणारा करपा (Early Blight)',
        'खालील जुन्या पानांवर गोलाकार तपकिरी ते काळे वलयाकार ठिपके पडतात. पाने पिवळी पडून गळतात.',
        '१. ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.\n२. ५% निंबोळी अर्क (Neem Oil) किंवा गोमूत्र व हिंगाचे द्रावण पानांवर फवारा.\n३. बाधित पाने तोडून नष्ट करा.',
        '१. मॅन्कोझेब ७५% WP (Mancozeb) २.५ ग्रॅम प्रति लिटर किंवा\n२. रिडोमिल गोल्ड (Ridomil Gold) २ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.',
        1250,
        75
    ),
    (
        'Tomato___Late_blight',
        'टोमॅटो (Tomato)',
        'टोमॅटो - उशिरा येणारा करपा / तांबोरा (Late Blight)',
        'पानांवर आणि फळांवर काळपट-तपकिरी रंगाचे ओले चट्टे दिसतात. थंड आणि दमट हवामानात हा रोग वेगाने पसरतो.',
        '१. ताक आणि तांब्याची पट्टी एकत्र केलेले द्रावण (ताक फवारणी).\n२. सुडोमोनास फ्लोरोसन्स (Pseudomonas fluorescens) १० मिली प्रति लिटर पाण्यात मिसळून फवारा.',
        '१. सिमोक्सॅनिल + मॅन्कोझेब (कर्झेट) ३ ग्रॅम प्रति लिटर किंवा\n२. ॲमेक्टोक्ट्राडिन + डायमेथोमॉर्फ (झॅमप्रो) २ मिली प्रति लिटर पाण्यात फवारा.',
        1850,
        85
    ),
    (
        'Tomato___healthy',
        'टोमॅटो (Tomato)',
        'टोमॅटो - निरोगी पीक (Healthy)',
        'झाडाची पाने टवटवीत, हिरवीगार आणि कोणत्याही रोगाशिवाय निरोगी आहेत.',
        '१. नियमित जीवामृत आणि पंचगव्य द्या.\n२. दर १५ दिवसांनी निंबोळी अर्काची प्रतिबंधात्मक फवारणी करा.',
        'कोणत्याही रासायनिक औषधांची गरज नाही. झाडाच्या पोषणासाठी १९:१९:१९ विद्राव्य खत देऊ शकता.',
        350,
        60
    ),
    (
        'Potato___Early_blight',
        'बटाटा (Potato)',
        'बटाटा - करपा रोग (Early Blight)',
        'पानांवर गोलाकार गडद तपकिरी चट्टे पडतात. कालांतराने बटाट्याच्या आकारावर परिणाम होतो.',
        '१. कॉपर बेस्ड सेंद्रिय फवारणी (बोर्डो मिश्रण १%).\n२. ट्रायकोडर्मा हरझियानम कल्चर जमिनीत मिसळा.',
        '१. अझोक्सीस्ट्रोबिन २३% SC (Amistar) १ मिली प्रति लिटर किंवा\n२. प्रोपिनेब ७०% WP (Antracol) ३ ग्रॅम प्रति लिटर पाण्यात फवारा.',
        1400,
        70
    ),
    (
        'Potato___Late_blight',
        'बटाटा (Potato)',
        'बटाटा - उशिरा येणारा करपा (Late Blight)',
        'पानांच्या टोकावर काळे डाग पडून पाने जळाल्यासारखी दिसतात. संपूर्ण पीक ३-४ दिवसांत कोमेजू शकते.',
        '१. ट्रायकोडर्मा + सेंद्रिय ह्युमिक ॲसिड फवारणी.\n२. शेतात पाण्याचा निचरा योग्य ठेवा.',
        '१. मेटलॅक्सिल ८% + मॅन्कोझेब ६४% WP २.५ ग्रॅम प्रति लिटर फवारा.',
        2100,
        85
    ),
    (
        'Potato___healthy',
        'बटाटा (Potato)',
        'बटाटा - निरोगी पीक (Healthy)',
        'बटाट्याची पाने निरोगी व गर्द हिरवी आहेत. पीक उत्तम स्थितीत आहे.',
        'सेंद्रिय खते आणि जिवाणू संवर्धकांचा वापर चालू ठेवा.',
        'फक्त संतुलित एनपीके (NPK) खतांची मात्रा द्या. रासायनिक फवारणीची गरज नाही.',
        400,
        65
    ),
    (
        'Corn___Common_rust',
        'मका (Corn / Maize)',
        'मका - तांबेरा रोग (Common Rust)',
        'पानांच्या दोन्ही बाजूंना तांबूस-तपकिरी रंगाचे लहान पुरळ (Pustules) उठतात. पाने वाळतात.',
        '१. गोमूत्र (१०%) + हिंगाचे द्रावण प्रतिबंधात्मक फवारा.\n२. रोगास प्रतिकारक्षम वाणांची निवड करा.',
        '१. हेक्झाकोनॅझोल ५% EC (Hexaconazole) २ मिली प्रति लिटर किंवा\n२. प्रोपिकोनाझोल २५% EC (Tilt) १ मिली प्रति लिटर पाण्यात फवारा.',
        950,
        80
    ),
    (
        'Corn___healthy',
        'मका (Corn / Maize)',
        'मका - निरोगी पीक (Healthy)',
        'मक्याचे पीक अतिशय जोमदार आणि पाने निरोगी आहेत.',
        'दशपर्णी अर्क आणि शेणखताचा वापर करा.',
        'रासायनिक कीटकनाशकांची आवश्यकता नाही.',
        300,
        60
    ),
    (
        'Grape___Black_rot',
        'द्राक्षे (Grape)',
        'द्राक्षे - काळा कुजवा / ब्लॅक रॉट (Black Rot)',
        'पानांवर लालसर तपकिरी ठिपके पडतात आणि द्राक्षांचे मणी काळे पडून सुकून सुकतात (Mummified).',
        '१. वेलींची योग्य छाटणी करून हवा खेळती ठेवा.\n२. जीवामृत आणि ट्रायकोडर्मा ड्रेंचिंग करा.',
        '१. मायक्लोब्युटॅनिल १०% WP (Systhane) ०.५ ग्रॅम प्रति लिटर किंवा\n२. टेब्युकोनाझोल २५.९% EC १.५ मिली प्रति लिटर फवारा.',
        2800,
        80
    ),
    (
        'Grape___healthy',
        'द्राक्षे (Grape)',
        'द्राक्षे - निरोगी पीक (Healthy)',
        'वेलीची पाने आणि घड अत्यंत निरोगी व तजेलदार आहेत.',
        'सेंद्रिय आच्छादन (Mulching) आणि सूक्ष्म अन्नद्रव्ये वापरा.',
        'फक्त संजीवके आणि पोषणाचे व्यवस्थापन करा.',
        600,
        65
    ),
    (
        'Cotton___Bacterial_blight',
        'कापूस (Cotton)',
        'कापूस - जीवाणू करपा / कोणाकृती ठिपके (Bacterial Blight)',
        'पानांच्या शिरांवर कोणाकृती काळे डाग पडतात, ज्याला "काळ्या शिरा" (Black Arm) म्हणतात. बोंडे सडतात.',
        '१. स्युडोमोनास फ्लोरोसन्स १० ग्रॅम प्रति लिटर फवारा.\n२. रोगट पाने आणि फांद्या गोळा करून नष्ट करा.',
        '१. स्ट्रेप्टोमायसीन सल्फेट + टेट्रासायक्लिन (Streptocycline) ६ ग्रॅम + कॉपर ऑक्सिक्लोराईड ३० ग्रॅम प्रति १० लिटर पाण्यात मिसळून फवारा.',
        1100,
        75
    ),
    (
        'Soybean___healthy',
        'सोयाबीन (Soybean)',
        'सोयाबीन - निरोगी पीक (Healthy)',
        'सोयाबीनची पाने हिरवीगार व निरोगी आहेत. झाडावर कोणतीही कीड अथवा बुरशी नाही.',
        'प्रतिबंधात्मक निंबोळी तेल फवारणी चालू ठेवा.',
        'कोणत्याही विषारी फवारणीची गरज नाही.',
        350,
        60
    )
]


class DatabaseManager:
    def __init__(self):
        self.mode = "MYSQL"
        self._init_database()

    def _get_mysql_connection(self):
        try:
            conn = mysql.connector.connect(
                host=MYSQL_CONFIG["host"],
                user=MYSQL_CONFIG["user"],
                password=MYSQL_CONFIG["password"],
                database=MYSQL_CONFIG["database"],
                connect_timeout=3
            )
            return conn
        except MySQLError:
            return None

    def _init_database(self):
        # 1. First test MySQL
        conn = self._get_mysql_connection()
        if conn and conn.is_connected():
            self.mode = "MYSQL"
            print("[Database] MySQL (agri_ai) connected successfully!")
            conn.close()
            return

        # 2. If MySQL is not running, initialize local SQLite fallback
        self.mode = "SQLITE"
        print("[Database] MySQL server offline. Activated SQLite fallback with full Marathi remedies.")
        self._init_sqlite()

    def _init_sqlite(self):
        conn = sqlite3.connect(SQLITE_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crop_diseases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                disease_name TEXT UNIQUE NOT NULL,
                crop_name TEXT NOT NULL,
                marathi_name TEXT NOT NULL,
                symptoms_marathi TEXT NOT NULL,
                organic_remedy_marathi TEXT NOT NULL,
                chemical_remedy_marathi TEXT NOT NULL,
                cost_per_acre INTEGER NOT NULL,
                risk_humidity INTEGER DEFAULT 75
            )
        """)
        
        # Check if rows exist
        cursor.execute("SELECT COUNT(*) FROM crop_diseases")
        count = cursor.fetchone()[0]
        if count == 0:
            cursor.executemany("""
                INSERT OR IGNORE INTO crop_diseases 
                (disease_name, crop_name, marathi_name, symptoms_marathi, organic_remedy_marathi, chemical_remedy_marathi, cost_per_acre, risk_humidity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, DEFAULT_DISEASES_DATA)
            conn.commit()
            print("[Database] SQLite loaded with comprehensive Marathi remedies.")
        conn.close()

    def get_disease_details(self, disease_name):
        """
        दिलेल्या disease_name नुसार मराठी उपाय, लक्षणे आणि खर्च शोधणे
        """
        # MySQL पद्धत
        if self.mode == "MYSQL":
            try:
                conn = self._get_mysql_connection()
                if conn:
                    cursor = conn.cursor(dictionary=True)
                    cursor.execute(
                        "SELECT * FROM crop_diseases WHERE disease_name = %s LIMIT 1",
                        (disease_name,)
                    )
                    row = cursor.fetchone()
                    cursor.close()
                    conn.close()
                    if row:
                        return row
            except Exception as e:
                print(f"[Database Warning] MySQL error: {e}. Switching to SQLite fallback.")

        # SQLite फॉलबॅक
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM crop_diseases WHERE disease_name = ? LIMIT 1",
            (disease_name,)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            return dict(row)

        # जर डेटाबेसमध्ये अचूक मॅच नसेल तर जेनेरिक फॉलबॅक माहिती
        clean_name = disease_name.replace("___", " - ").replace("_", " ")
        return {
            "disease_name": disease_name,
            "crop_name": clean_name.split(" - ")[0] if " - " in clean_name else "पीक",
            "marathi_name": clean_name,
            "symptoms_marathi": "पानांवर असामान्य डाग आणि विकृती दिसून येत आहे.",
            "organic_remedy_marathi": "१. ५% निंबोळी अर्क फवारा.\n२. ट्रायकोडर्मा व्हिरिडी किंवा गोमूत्र फवारा.",
            "chemical_remedy_marathi": "१. कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम प्रति लिटर किंवा मॅन्कोझेब फवारा.",
            "cost_per_acre": 1000,
            "risk_humidity": 75
        }


# Singleton Instance
db = DatabaseManager()

