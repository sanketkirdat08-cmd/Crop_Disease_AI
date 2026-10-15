"""
Database Manager for FieldVision AI
Handles localized Marathi and English agro advisories with MySQL & SQLite support
Supports All Major Agricultural Crops in Maharashtra, India, and Worldwide.
Developer: Sanket Kirdat (Lead AI & Data Science)
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

# Comprehensive Bilingual Agro Data for Global & Maharashtra Crops
BILINGUAL_DISEASES_DATA = {
    # 1. TOMATO (टोमॅटो)
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

    # 2. POTATO (बटाटा)
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

    # 3. CORN / MAIZE (मका)
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
    "Corn___healthy": {
        "crop_mr": "मका",
        "crop_en": "Corn (Maize)",
        "name_mr": "मका - निरोगी पीक (Healthy)",
        "name_en": "Corn - Healthy Crop",
        "symptoms_mr": "मक्याचे पीक जोमदार असून पाने रुंद व गर्द हिरवी आहेत.",
        "symptoms_en": "Canopy is tall, leaves are broad, deep green, and free of leaf lesions.",
        "organic_mr": "दशपर्णी अर्क आणि शेणखत वापरून मातीची सुपीकता टिकवा.",
        "organic_en": "Apply farmyard manure and bio-fertilizer drenches.",
        "chemical_mr": "रासायनिक औषधांची आवश्यकता नाही. संतुलित युरिया व पोटॅश द्या.",
        "chemical_en": "No chemical sprays required. Provide balanced nitrogen and potash.",
        "cost_per_acre": 300,
        "organic_cost_per_acre": 300,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 60
    },

    # 4. GRAPE (द्राक्षे)
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
    },
    "Grape___healthy": {
        "crop_mr": "द्राक्षे",
        "crop_en": "Grape",
        "name_mr": "द्राक्षे - निरोगी पीक (Healthy)",
        "name_en": "Grape - Healthy Vineyard",
        "symptoms_mr": "वेलीची पाने आणि घड तजेलदार व कोणत्याही बुरशीविना निरोगी आहेत.",
        "symptoms_en": "Canopy foliage and berry clusters are vigorous, glossy green, and free from mildew.",
        "organic_mr": "सेंद्रिय आच्छादन आणि सूक्ष्म अन्नद्रव्ये फवारा.",
        "organic_en": "Maintain organic mulching and foliar bio-nutrition.",
        "chemical_mr": "रासायनिक बुरशीनाशकांची गरज नाही. योग्य सूक्ष्म अन्नद्रव्ये द्या.",
        "chemical_en": "No chemical fungicides needed. Maintain micronutrient balance.",
        "cost_per_acre": 600,
        "organic_cost_per_acre": 600,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
    },

    # 5. ONION (कांदा - महाराष्ट्र प्रमुख पीक)
    "Onion___Purple_blotch": {
        "crop_mr": "कांदा",
        "crop_en": "Onion",
        "name_mr": "कांदा - जांभळा करपा (Purple Blotch)",
        "name_en": "Onion - Purple Blotch (Alternaria porri)",
        "symptoms_mr": "पानांवर सुरुवातीला पांढुरके आणि नंतर मध्यभागी जांभळट रंगाचे लांबट चट्टे पडतात. पात वाळते.",
        "symptoms_en": "Small water-soaked lesions that turn purple to dark brown with yellowish borders, causing foliage to collapse.",
        "organic_mr": "१. ५% निंबोळी अर्क आणि ट्रायकोडर्मा ५ ग्रॅम/लिटर फवारा.\n२. गोमूत्र आणि हिंग द्रावणाची प्रतिबंधात्मक फवारणी करा.",
        "organic_en": "1. Spray 5% Neem extract and Trichoderma viride @ 5g/liter.\n2. Apply fermented cow urine foliar spray.",
        "chemical_mr": "१. डायफेनोकोनॅझोल २५% EC (Score) १ मिली प्रति लिटर किंवा\n२. टेब्युकोनाझोल + ट्रायफ्लॉक्सीस्ट्रॉबिन (Nativo) ०.७ ग्रॅम प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Difenoconazole 25% EC (Score) @ 1ml/liter.\n2. Or Tebuconazole + Trifloxystrobin (Nativo) @ 0.7g/liter.",
        "cost_per_acre": 1500,
        "organic_cost_per_acre": 550,
        "chemical_cost_per_acre": 1500,
        "risk_humidity": 80
    },
    "Onion___healthy": {
        "crop_mr": "कांदा",
        "crop_en": "Onion",
        "name_mr": "कांदा - निरोगी पात (Healthy)",
        "name_en": "Onion - Healthy Crop",
        "symptoms_mr": "कांद्याची पात ताठ, हिरवीगार व कोणत्याही डागाशिवाय निरोगी आहे.",
        "symptoms_en": "Foliage is erect, vibrant green, and actively photosynthesizing.",
        "organic_mr": "जीवामृत आणि सेंद्रिय खतांचा वापर चालू ठेवा.",
        "organic_en": "Apply regular bio-stimulants and organic compost.",
        "chemical_mr": "कोणत्याही औषधांची गरज नाही. ००:५२:३४ खत कांदा पोसण्यासाठी द्या.",
        "chemical_en": "No chemical sprays needed. Apply 00:52:34 for bulb development.",
        "cost_per_acre": 400,
        "organic_cost_per_acre": 400,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
    },

    # 6. SUGARCANE (ऊस - पश्चिम महाराष्ट्र / सातारा पीक)
    "Sugarcane___Red_rot": {
        "crop_mr": "ऊस",
        "crop_en": "Sugarcane",
        "name_mr": "ऊस - तांबडी कुज (Red Rot)",
        "name_en": "Sugarcane - Red Rot (Colletotrichum falcatum)",
        "symptoms_mr": "पानाच्या मधल्या शिरेवर लाल चट्टे पडतात. कांड्या कापल्यास आतून लाल रंग व पांढरे पट्टे दिसतात, उसाला अल्कोहोलचा वास येतो.",
        "symptoms_en": "Midrib reddening and internal vascular red discoloration with white transverse bands, emitting an alcoholic odor.",
        "organic_mr": "१. निरोगी बियाण्यांची निवड व बेणे प्रक्रिया ट्रायकोडर्माने करा.\n२. शेतातील पाण्याचा निचरा त्वरित करा.",
        "organic_en": "1. Certified seed setts treatment with Trichoderma viride @ 10g/liter.\n2. Improve field drainage.",
        "chemical_mr": "१. कार्बेन्डाझिम ५०% WP २ ग्रॅम प्रति लिटर किंवा\n२. थायोफिनेट मिथाईल ७०% WP १.५ ग्रॅम प्रति लिटर पाण्यात बेणे प्रक्रिया करा.",
        "chemical_en": "1. Sett dip in Carbendazim 50% WP @ 2g/liter before planting.\n2. Foliar Thiophanate-methyl 70% WP @ 1.5g/liter.",
        "cost_per_acre": 1600,
        "organic_cost_per_acre": 600,
        "chemical_cost_per_acre": 1600,
        "risk_humidity": 85
    },
    "Sugarcane___healthy": {
        "crop_mr": "ऊस",
        "crop_en": "Sugarcane",
        "name_mr": "ऊस - निरोगी पीक (Healthy)",
        "name_en": "Sugarcane - Healthy Cane",
        "symptoms_mr": "उसाची वाढ जोमदार असून कांड्या जाड आणि पाने गर्द हिरवी आहेत.",
        "symptoms_en": "Sturdy thick stalks, broad dark green canopy, high sugar vigor.",
        "organic_mr": "शेणखत व सेंद्रिय जिवाणू संवर्धक वापरा.",
        "organic_en": "Apply press mud compost and Azotobacter cultures.",
        "chemical_mr": "रासायनिक कीटकनाशकांची गरज नाही. योग्य प्रमाणात नत्र व पोटॅश द्या.",
        "chemical_en": "No chemical sprays needed. Balance nitrogen and potassium.",
        "cost_per_acre": 500,
        "organic_cost_per_acre": 500,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 70
    },

    # 7. SOYBEAN (सोयाबीन)
    "Soybean___Rust": {
        "crop_mr": "सोयाबीन",
        "crop_en": "Soybean",
        "name_mr": "सोयाबीन - तांबेरा रोग (Soybean Rust)",
        "name_en": "Soybean - Asian Soybean Rust (Phakopsora pachyrhizi)",
        "symptoms_mr": "पानांच्या खालच्या भागावर तपकिरी-तांबूस पुरळ उठतात, पाने पिवळी पडून लवकर गळतात.",
        "symptoms_en": "Small tan to reddish-brown lesions with active pustules primarily on lower leaf surfaces, causing premature defoliation.",
        "organic_mr": "१. गोमूत्र आणि हिंगाची फवारणी करा.\n२. निंबोळी तेल १५०० पीपीएम ५ मिली प्रति लिटर फवारा.",
        "organic_en": "1. Apply fermented organic cow urine extract.\n2. Spray Neem oil 1500 ppm @ 5ml/liter.",
        "chemical_mr": "१. हेक्झाकोनॅझोल ५% EC १.५ मिली प्रति लिटर किंवा\n२. प्रोपिकोनाझोल २५% EC १ मिली प्रति लिटर फवारा.",
        "chemical_en": "1. Spray Hexaconazole 5% EC @ 1.5ml/liter.\n2. Or Propiconazole 25% EC @ 1ml/liter immediately.",
        "cost_per_acre": 1100,
        "organic_cost_per_acre": 450,
        "chemical_cost_per_acre": 1100,
        "risk_humidity": 80
    },
    "Soybean___healthy": {
        "crop_mr": "सोयाबीन",
        "crop_en": "Soybean",
        "name_mr": "सोयाबीन - निरोगी पीक (Healthy)",
        "name_en": "Soybean - Healthy Crop",
        "symptoms_mr": "पाने हिरवीगार, निरोगी असून झाडावर उत्तम फुले व शेंगा लागल्या आहेत.",
        "symptoms_en": "Vigorous green foliage with healthy pod development.",
        "organic_mr": "प्रतिबंधात्मक निंबोळी अर्क वापरा.",
        "organic_en": "Maintain regular organic biological protection.",
        "chemical_mr": "फवारणीची गरज नाही. विद्राव्य सूक्ष्म अन्नद्रव्ये द्या.",
        "chemical_en": "No chemical pesticides required. Provide micronutrients.",
        "cost_per_acre": 350,
        "organic_cost_per_acre": 350,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
    },

    # 8. COTTON (कापूस)
    "Cotton___Bacterial_blight": {
        "crop_mr": "कापूस",
        "crop_en": "Cotton",
        "name_mr": "कापूस - काळ्या शिरा / जीवाणू करपा (Bacterial Blight)",
        "name_en": "Cotton - Bacterial Blight (Xanthomonas citri pv. malvacearum)",
        "symptoms_mr": "पानांच्या शिरांवर कोणाकृती काळे डाग पडतात (Black Arm), बोंडांवर खोलगट काळे चट्टे येतात.",
        "symptoms_en": "Angular water-soaked leaf spots turning dark brown to black along veins (black arm symptom).",
        "organic_mr": "१. स्युडोमोनास फ्लोरोसन्स १० ग्रॅम प्रति लिटर पाण्यात फवारा.\n२. शेतातील तण काढून हवा खेळती ठेवा.",
        "organic_en": "1. Spray Pseudomonas fluorescens @ 10g/liter.\n2. Maintain weed-free ventilated canopy.",
        "chemical_mr": "१. स्ट्रेप्टोमायसीन सल्फेट (Streptocycline) १ ग्रॅम + कॉपर ऑक्सिक्लोराईड २५ ग्रॅम प्रति १० लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Streptocycline 1g + Copper Oxychloride 25g per 10 liters of water.",
        "cost_per_acre": 1100,
        "organic_cost_per_acre": 500,
        "chemical_cost_per_acre": 1100,
        "risk_humidity": 75
    },
    "Cotton___healthy": {
        "crop_mr": "कापूस",
        "crop_en": "Cotton",
        "name_mr": "कापूस - निरोगी पीक (Healthy)",
        "name_en": "Cotton - Healthy Crop",
        "symptoms_mr": "कापसाची झाडे सशक्त, पाने टवटवीत असून बोंडांची वाढ निरोगी आहे.",
        "symptoms_en": "Lush green broad leaves, active squaring, and healthy boll setting.",
        "organic_mr": "दशपर्णी अर्क प्रतिबंधात्मक वापरा.",
        "organic_en": "Spray botanical repellent formulations.",
        "chemical_mr": "रासायनिक औषधांची गरज नाही. १३:००:४५ खत द्या.",
        "chemical_en": "No chemicals needed. Apply potassium nitrate for boll weight.",
        "cost_per_acre": 400,
        "organic_cost_per_acre": 400,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 60
    },

    # 9. CHILLI / PEPPER (मिरची)
    "Chilli___Leaf_curl": {
        "crop_mr": "मिरची",
        "crop_en": "Chilli / Pepper",
        "name_mr": "मिरची - चुरडा-मुरडा / बोकड्या (Chilli Leaf Curl Virus)",
        "name_en": "Chilli - Leaf Curl Virus & Thrips Infestation",
        "symptoms_mr": "पाने आकसतात, होडीच्या आकारासारखी वर किंवा खाली वळतात, झाडाची वाढ खुंटते.",
        "symptoms_en": "Upward or downward curling of leaf margins, severe puckering, stunting, and reduced fruit set.",
        "organic_mr": "१. पिवळे व निळे चिकट सापळे एकरी ३० लावा.\n२. निंबोळी तेल १०,००० पीपीएम ३ मिली प्रति लिटर फवारा.",
        "organic_en": "1. Install 30 yellow and blue sticky traps per acre.\n2. Foliar Neem oil 10,000 ppm @ 3ml/liter against vector thrips.",
        "chemical_mr": "१. डायफेनथियुरॉन ५०% WP (Pegasus) १.५ ग्रॅम/लिटर किंवा\n२. फिप्रोनिल ५% SC २ मिली प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Diafenthiuron 50% WP (Pegasus) @ 1.5g/liter.\n2. Or Fipronil 5% SC @ 2ml/liter against whitefly/thrips vectors.",
        "cost_per_acre": 1650,
        "organic_cost_per_acre": 550,
        "chemical_cost_per_acre": 1650,
        "risk_humidity": 70
    },
    "Chilli___healthy": {
        "crop_mr": "मिरची",
        "crop_en": "Chilli / Pepper",
        "name_mr": "मिरची - निरोगी पीक (Healthy)",
        "name_en": "Chilli - Healthy Crop",
        "symptoms_mr": "मिरचीची पाने सरळ, गर्द हिरवी व भरपूर फुलोऱ्यात आहेत.",
        "symptoms_en": "Leaves are flat, glossy green, with dense blossoming and fruit development.",
        "organic_mr": "जीवामृत आणि सेंद्रिय खतांचा वापर करा.",
        "organic_en": "Continue regular bio-organic nourishment.",
        "chemical_mr": "रासायनिक औषधांची गरज नाही.",
        "chemical_en": "No chemical sprays required.",
        "cost_per_acre": 350,
        "organic_cost_per_acre": 350,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 60
    },

    # 10. POMEGRANATE (डाळिंब - सोलापूर / सांगली / सातारा पीक)
    "Pomegranate___Bacterial_blight": {
        "crop_mr": "डाळिंब",
        "crop_en": "Pomegranate",
        "name_mr": "डाळिंब - तेल्या रोग (Bacterial Blight / Telya)",
        "name_en": "Pomegranate - Bacterial Blight (Xanthomonas axonopodis pv. punicae)",
        "symptoms_mr": "पानांवर आणि फळांवर तेलकट, काळे ठिपके पडतात. फळांवर 'L' किंवा 'Y' आकाराचे चीर पडतात.",
        "symptoms_en": "Dark brown water-soaked oily spots on leaves and fruit surface forming characteristic 'L' or 'Y' shaped cracks.",
        "organic_mr": "१. बोर्डो मिश्रण ०.५% नियमित प्रतिबंधात्मक फवारा.\n२. रोगट फांद्या १ इंच मागे छाटून बोर्डो पेस्ट लावा.",
        "organic_en": "1. Regular preventative 0.5% Bordeaux mixture application.\n2. Prune infected twigs and sanitize with Bordeaux paste.",
        "chemical_mr": "१. स्ट्रेप्टोसायक्लिन ५ ग्रॅम + कॉपर ऑक्सिक्लोराईड २५ ग्रॅम प्रति १० लिटर किंवा\n२. बॅक्टोमायसीन २ ग्रॅम/लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Streptocycline 0.5g/L + Copper Oxychloride 2.5g/L.\n2. Or Bronopol 0.5g/L during cloudy weather.",
        "cost_per_acre": 2600,
        "organic_cost_per_acre": 900,
        "chemical_cost_per_acre": 2600,
        "risk_humidity": 85
    },
    "Pomegranate___healthy": {
        "crop_mr": "डाळिंब",
        "crop_en": "Pomegranate",
        "name_mr": "डाळिंब - निरोगी बाग (Healthy)",
        "name_en": "Pomegranate - Healthy Orchard",
        "symptoms_mr": "डाळिंबाची पाने तजेलदार, फळे निरोगी व डागविरहित आहेत.",
        "symptoms_en": "Lush glossy green foliage with blemish-free expanding fruit.",
        "organic_mr": "सेंद्रिय आच्छादन आणि ट्रायकोडर्मा ड्रेंचिंग चालू ठेवा.",
        "organic_en": "Maintain organic mulching and Trichoderma root zone drenching.",
        "chemical_mr": "फवारणीची गरज नाही.",
        "chemical_en": "No chemical sprays needed.",
        "cost_per_acre": 700,
        "organic_cost_per_acre": 700,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
    },

    # 11. RICE / PADDY (भात / धान)
    "Rice___Bacterial_leaf_blight": {
        "crop_mr": "भात (Paddy)",
        "crop_en": "Rice / Paddy",
        "name_mr": "भात - जीवाणू करपा (Bacterial Leaf Blight)",
        "name_en": "Rice - Bacterial Leaf Blight (Xanthomonas oryzae)",
        "symptoms_mr": "पानांच्या कडा पिवळ्या पडून वाळतात, पानांवर लाटांसारखे पांढरे-पिवळे पट्टे दिसतात.",
        "symptoms_en": "Water-soaked stripes along leaf margins turning yellow to bleached white with wavy margins.",
        "organic_mr": "१. ५% निंबोळी अर्क आणि गोमूत्र फवारा.\n२. नत्रयुक्त खतांचा अतिवापर टाळा.",
        "organic_en": "1. Foliar spray of 5% Neem extract and fermented cow urine.\n2. Avoid excessive nitrogen application.",
        "chemical_mr": "१. स्ट्रेप्टोमायसीन सल्फेट + कॉपर हायड्रॉक्साईड २ ग्रॅम प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Streptocycline 1g + Copper Hydroxide 2g per liter of water.",
        "cost_per_acre": 1200,
        "organic_cost_per_acre": 500,
        "chemical_cost_per_acre": 1200,
        "risk_humidity": 85
    },
    "Rice___healthy": {
        "crop_mr": "भात (Paddy)",
        "crop_en": "Rice / Paddy",
        "name_mr": "भात - निरोगी पीक (Healthy)",
        "name_en": "Rice / Paddy - Healthy Crop",
        "symptoms_mr": "भाताची पाने निरोगी, ताठ व गर्द हिरवी आहेत.",
        "symptoms_en": "Vigorous tillering with clean, erect green foliage.",
        "organic_mr": "अझोला आणि जीवामृत शेतात वापरा.",
        "organic_en": "Incorporate Azolla bio-fertilizer into paddy water.",
        "chemical_mr": "औषधांची गरज नाही.",
        "chemical_en": "No chemical pesticides required.",
        "cost_per_acre": 350,
        "organic_cost_per_acre": 350,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 70
    },

    # 12. WHEAT (गहू)
    "Wheat___Leaf_rust": {
        "crop_mr": "गहू",
        "crop_en": "Wheat",
        "name_mr": "गहू - तांबेरा रोग (Wheat Leaf Rust)",
        "name_en": "Wheat - Brown / Leaf Rust (Puccinia triticina)",
        "symptoms_mr": "पानांवर नारंगी-तपकिरी रंगाचे गोल ठिपके व भुकटी (Pustules) दिसते.",
        "symptoms_en": "Small round orange-brown pustules scattered across the upper surface of wheat leaves.",
        "organic_mr": "१. दशपर्णी अर्क व गोमूत्र फवारा.\n२. रोगास प्रतिकारक्षम वाणांची पेरणी करा.",
        "organic_en": "1. Spray organic botanical concoction.\n2. Plant rust-tolerant certified seeds.",
        "chemical_mr": "१. प्रोपिकोनाझोल २५% EC (Tilt) १ मिली प्रति लिटर पाण्यात फवारा.",
        "chemical_en": "1. Spray Propiconazole 25% EC (Tilt) @ 1ml/liter upon first appearance.",
        "cost_per_acre": 900,
        "organic_cost_per_acre": 400,
        "chemical_cost_per_acre": 900,
        "risk_humidity": 80
    },
    "Wheat___healthy": {
        "crop_mr": "गहू",
        "crop_en": "Wheat",
        "name_mr": "गहू - निरोगी पीक (Healthy)",
        "name_en": "Wheat - Healthy Crop",
        "symptoms_mr": "गव्हाचे पीक उत्तम असून ओंब्या सशक्त आणि पाने निरोगी आहेत.",
        "symptoms_en": "Uniform green canopy with robust earhead emergence.",
        "organic_mr": "शेणखत व सेंद्रिय पोषण चालू ठेवा.",
        "organic_en": "Maintain organic nitrogen balance.",
        "chemical_mr": "फवारणीची आवश्यकता नाही.",
        "chemical_en": "No chemical intervention needed.",
        "cost_per_acre": 300,
        "organic_cost_per_acre": 300,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 60
    },

    # 13. APPLE (सफरचंद)
    "Apple___Apple_scab": {
        "crop_mr": "सफरचंद",
        "crop_en": "Apple",
        "name_mr": "सफरचंद - खरुज रोग (Apple Scab)",
        "name_en": "Apple - Apple Scab (Venturia inaequalis)",
        "symptoms_mr": "पानांवर आणि फळांवर ऑलिव्ह-हिरवे ते काळपट खरुजासारखे चट्टे पडतात. फळे वेडीवाकडी होतात.",
        "symptoms_en": "Olive-green velvety spots on leaves that turn brown and corky on mature fruit, causing cracking.",
        "organic_mr": "१. कॉपर बेस्ड बोर्डो मिश्रण १% फवारा.\n२. पडलेली रोगट पाने गोळा करून जाळून नष्ट करा.",
        "organic_en": "1. Apply 1% Bordeaux mixture before bud break.\n2. Collect and destroy leaf litter.",
        "chemical_mr": "१. मॅन्कोझेब ७५% WP २.५ ग्रॅम किंवा डायफेनोकोनॅझोल ०.५ मिली/लिटर फवारा.",
        "chemical_en": "1. Spray Mancozeb 75% WP @ 2.5g/L or Difenoconazole 25% EC @ 0.5ml/L.",
        "cost_per_acre": 2200,
        "organic_cost_per_acre": 800,
        "chemical_cost_per_acre": 2200,
        "risk_humidity": 85
    },
    "Apple___healthy": {
        "crop_mr": "सफरचंद",
        "crop_en": "Apple",
        "name_mr": "सफरचंद - निरोगी बाग (Healthy)",
        "name_en": "Apple - Healthy Orchard",
        "symptoms_mr": "झाडाची पाने हिरवीगार व फळे चमकदार आणि डागविरहित आहेत.",
        "symptoms_en": "Canopy is dense, vibrant green, and fruit skin is clean and unblemished.",
        "organic_mr": "सेंद्रिय पोषण आणि योग्य छाटणी करा.",
        "organic_en": "Maintain organic mulch and seasonal pruning.",
        "chemical_mr": "रासायनिक औषधांची गरज नाही.",
        "chemical_en": "No chemical sprays required.",
        "cost_per_acre": 600,
        "organic_cost_per_acre": 600,
        "chemical_cost_per_acre": 0,
        "risk_humidity": 65
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
                CREATE TABLE IF NOT EXISTS crop_diseases_v3 (
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
                    organic_cost INTEGER,
                    chemical_cost INTEGER,
                    risk_humidity INTEGER
                )
            """)
            for d_name, info in BILINGUAL_DISEASES_DATA.items():
                cursor.execute("""
                    INSERT OR REPLACE INTO crop_diseases_v3 VALUES 
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    d_name, info["crop_mr"], info["crop_en"], info["name_mr"], info["name_en"],
                    info["symptoms_mr"], info["symptoms_en"], info["organic_mr"], info["organic_en"],
                    info["chemical_mr"], info["chemical_en"], info["cost_per_acre"],
                    info["organic_cost_per_acre"], info["chemical_cost_per_acre"], info["risk_humidity"]
                ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[DB Note] SQLite init: {e}")

    def get_disease_details(self, disease_name, lang="mr"):
        """
        Fetch details in specified language ('mr' or 'en')
        Supports all global crop keys with intelligent heuristic generation for unlisted crops.
        """
        is_mr = (lang == "mr")

        # 1. Direct match in dictionary
        if disease_name in BILINGUAL_DISEASES_DATA:
            info = BILINGUAL_DISEASES_DATA[disease_name]
            return {
                "disease_name": disease_name,
                "crop_name": info["crop_mr"] if is_mr else info["crop_en"],
                "marathi_name": info["name_mr"] if is_mr else info["name_en"],
                "symptoms_marathi": info["symptoms_mr"] if is_mr else info["symptoms_en"],
                "organic_remedy_marathi": info["organic_mr"] if is_mr else info["organic_en"],
                "chemical_remedy_marathi": info["chemical_mr"] if is_mr else info["chemical_en"],
                "cost_per_acre": info["chemical_cost_per_acre"],
                "organic_cost": info["organic_cost_per_acre"],
                "chemical_cost": info["chemical_cost_per_acre"],
                "risk_humidity": info["risk_humidity"],
                "crop_mr": info["crop_mr"],
                "crop_en": info["crop_en"],
                "name_mr": info["name_mr"],
                "name_en": info["name_en"]
            }

        # 2. Heuristic extraction for ANY world crop
        clean_name = disease_name.replace("___", " - ").replace("_", " ")
        crop_part = disease_name.split("___")[0].replace("_", " ") if "___" in disease_name else "Crop"
        disease_part = disease_name.split("___")[1].replace("_", " ") if "___" in disease_name else disease_name

        crop_mr_map = {
            "Tomato": "टोमॅटो", "Potato": "बटाटा", "Corn": "मका", "Grape": "द्राक्षे",
            "Apple": "सफरचंद", "Rice": "भात", "Wheat": "गहू", "Sugarcane": "ऊस",
            "Cotton": "कापूस", "Soybean": "सोयाबीन", "Onion": "कांदा", "Chilli": "मिरची",
            "Pepper": "शिमला मिरची / मिरची", "Mango": "आंबा", "Banana": "केळी",
            "Pomegranate": "डाळिंब", "Citrus": "लिंबूवर्गीय फळे", "Lemon": "लिंबू",
            "Strawberry": "स्ट्रॉबेरी", "Cherry": "चेरी", "Peach": "पीच"
        }
        crop_mr = crop_mr_map.get(crop_part, crop_part)

        is_healthy = "healthy" in disease_part.lower()

        if is_healthy:
            if is_mr:
                return {
                    "disease_name": disease_name,
                    "crop_name": crop_mr,
                    "marathi_name": f"{crop_mr} - निरोगी पीक (Healthy)",
                    "symptoms_marathi": f"{crop_mr} पिकाची पाने हिरवीगार, टवटवीत आणि रोगाशिवाय निरोगी आहेत.",
                    "organic_remedy_marathi": "१. जीवामृत व सेंद्रिय खतांचा नियमित वापर चालू ठेवा.\n२. प्रतिबंधात्मक ५% निंबोळी अर्क फवारा.",
                    "chemical_remedy_marathi": "रासायनिक औषधांची गरज नाही. १९:१९:१९ विद्राव्य खत देऊ शकता.",
                    "cost_per_acre": 350,
                    "organic_cost": 350,
                    "chemical_cost": 0,
                    "risk_humidity": 65
                }
            else:
                return {
                    "disease_name": disease_name,
                    "crop_name": crop_part,
                    "marathi_name": f"{crop_part} - Healthy Crop",
                    "symptoms_marathi": f"{crop_part} leaves are vibrant green, sturdy, and disease-free.",
                    "organic_remedy_marathi": "1. Apply regular bio-organic foliar nourishment.\n2. Preventive Neem oil spray every 15 days.",
                    "chemical_remedy_marathi": "No chemical fungicides required. Maintain balanced fertigation.",
                    "cost_per_acre": 350,
                    "organic_cost": 350,
                    "chemical_cost": 0,
                    "risk_humidity": 65
                }
        else:
            if is_mr:
                return {
                    "disease_name": disease_name,
                    "crop_name": crop_mr,
                    "marathi_name": f"{crop_mr} - {disease_part} (रोग संसर्ग)",
                    "symptoms_marathi": f"{crop_mr} च्या पानावरील पेशींवर डाग आणि विकृती दिसून येत असून बुरशीजन्य प्रादुर्भाव आहे.",
                    "organic_remedy_marathi": "१. ट्रायकोडर्मा व्हिरिडी ५ ग्रॅम प्रति लिटर पाण्यात फवारा.\n२. ५% निंबोळी अर्क किंवा गोमूत्र व हिंगाचे द्रावण फवारा.\n३. रोगट पाने नष्ट करा.",
                    "chemical_remedy_marathi": "१. मॅन्कोझेब ७५% WP २.५ ग्रॅम किंवा कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम/लिटर फवारा.\n२. प्रादुर्भाव जास्त असल्यास अझोक्सीस्ट्रोबिन १ मिली/लिटर फवारा.",
                    "cost_per_acre": 1350,
                    "organic_cost": 600,
                    "chemical_cost": 1350,
                    "risk_humidity": 80
                }
            else:
                return {
                    "disease_name": disease_name,
                    "crop_name": crop_part,
                    "marathi_name": f"{crop_part} - {disease_part}",
                    "symptoms_marathi": f"Pathological foliar lesions, chlorosis, and necrotic spots observed on {crop_part} leaf tissue.",
                    "organic_remedy_marathi": "1. Spray Trichoderma viride @ 5g/liter.\n2. Apply 5% cold-pressed Neem seed kernel extract.\n3. Prune diseased foliage.",
                    "chemical_remedy_marathi": "1. Spray Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 2.5g/L.\n2. Under severe pressure, apply Azoxystrobin 23% SC @ 1ml/L.",
                    "cost_per_acre": 1350,
                    "organic_cost": 600,
                    "chemical_cost": 1350,
                    "risk_humidity": 80
                }


db = DatabaseManager()
