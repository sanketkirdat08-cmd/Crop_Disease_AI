-- ==========================================================
-- FieldVision AI - MySQL Database Schema & Dual Remedies
-- Project: FieldVision AI (Next-Gen Plantix)
-- Developer: Sanket Kirdat (Department of AI & Data Science)
-- Database: agri_ai
-- Table: crop_diseases
-- ==========================================================

CREATE DATABASE IF NOT EXISTS agri_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agri_ai;

DROP TABLE IF EXISTS crop_diseases;

CREATE TABLE crop_diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(150) NOT NULL UNIQUE,
    crop_name VARCHAR(100) NOT NULL,
    marathi_name VARCHAR(150) NOT NULL,
    symptoms_marathi TEXT NOT NULL,
    symptoms_english TEXT,
    organic_remedy_marathi TEXT NOT NULL,
    organic_remedy_english TEXT,
    chemical_remedy_marathi TEXT NOT NULL,
    chemical_remedy_english TEXT,
    organic_cost_per_acre INT NOT NULL DEFAULT 500,
    chemical_cost_per_acre INT NOT NULL DEFAULT 1200,
    cost_per_acre INT NOT NULL DEFAULT 1200,
    risk_humidity INT DEFAULT 75,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserting comprehensive Marathi & English Agricultural remedies with Dual Costs
INSERT INTO crop_diseases (
    disease_name, 
    crop_name, 
    marathi_name, 
    symptoms_marathi, 
    symptoms_english,
    organic_remedy_marathi, 
    organic_remedy_english,
    chemical_remedy_marathi, 
    chemical_remedy_english,
    organic_cost_per_acre,
    chemical_cost_per_acre,
    cost_per_acre, 
    risk_humidity
) VALUES 
(
    'Tomato___Early_blight',
    'टोमॅटो (Tomato)',
    'टोमॅटो - लवकर येणारा करपा (Early Blight)',
    'खालील जुन्या पानांवर गोलाकार तपकिरी ते काळे वलयाकार ठिपके पडतात. पाने पिवळी पडून गळतात.',
    'Circular dark brown spots with concentric rings appearing on older lower leaves. Foliage turns yellow and defoliates prematurely.',
    '१. ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.\n२. ५% निंबोळी अर्क (Neem Oil) किंवा गोमूत्र व हिंगाचे द्रावण पानांवर फवारा.\n३. बाधित पाने तोडून नष्ट करा.',
    '1. Spray Trichoderma viride @ 5g/L.\n2. Apply 5% Neem Seed Kernel Extract foliar spray.\n3. Prune and destroy diseased foliage.',
    '१. मॅन्कोझेब ७५% WP (Mancozeb) २.५ ग्रॅम प्रति लिटर किंवा\n२. रिडोमिल गोल्ड (Ridomil Gold) २ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.',
    '1. Spray Mancozeb 75% WP @ 2.5g/L or Ridomil Gold @ 2g/L.\n2. In severe pressure, apply Azoxystrobin 23% SC @ 1ml/L.',
    650,
    1250,
    1250,
    75
),
(
    'Tomato___Late_blight',
    'टोमॅटो (Tomato)',
    'टोमॅटो - उशिरा येणारा करपा / तांबोरा (Late Blight)',
    'पानांवर आणि फळांवर काळपट-तपकिरी रंगाचे ओले चट्टे दिसतात. थंड आणि दमट हवामानात हा रोग वेगाने पसरतो.',
    'Large dark water-soaked lesions on leaves and fruit. White mold forms on leaf undersides in high humidity.',
    '१. ताक आणि तांब्याची पट्टी एकत्र केलेले द्रावण (ताक फवारणी).\n२. सुडोमोनास फ्लोरोसन्स (Pseudomonas fluorescens) १० मिली प्रति लिटर पाण्यात मिसळून फवारा.',
    '1. Spray fermented butter milk solution with copper bio-extract.\n2. Foliar application of Pseudomonas fluorescens @ 10g/L.',
    '१. सिमोक्सॅनिल + मॅन्कोझेब (कर्झेट) ३ ग्रॅम प्रति लिटर किंवा\n२. ॲमेक्टोक्ट्राडिन + डायमेथोमॉर्फ (झॅमप्रो) २ मिली प्रति लिटर पाण्यात फवारा.',
    '1. Spray Cymoxanil + Mancozeb (Curzate) @ 3g/L.\n2. Apply Dimethomorph + Ametoctradin (Zampro) @ 2ml/L.',
    750,
    1850,
    1850,
    85
),
(
    'Tomato___healthy',
    'टोमॅटो (Tomato)',
    'टोमॅटो - निरोगी पीक (Healthy)',
    'झाडाची पाने टवटवीत, हिरवीगार आणि कोणत्याही रोगाशिवाय निरोगी आहेत.',
    'Foliage is lush green, sturdy, and showing active vegetative and reproductive growth.',
    '१. नियमित जीवामृत आणि पंचगव्य द्या.\n२. दर १५ दिवसांनी निंबोळी अर्काची प्रतिबंधात्मक फवारणी करा.',
    '1. Drench root zone with Jeevamrut & Panchagavya bio-enhancers.\n2. Preventive Neem oil spray every 15 days.',
    'कोणत्याही रासायनिक औषधांची गरज नाही. झाडाच्या पोषणासाठी १९:१९:१९ विद्राव्य खत देऊ शकता.',
    'No chemical fungicides required. Maintain balanced 19:19:19 fertigation.',
    350,
    0,
    350,
    60
),
(
    'Potato___Early_blight',
    'बटाटा (Potato)',
    'बटाटा - करपा रोग (Early Blight)',
    'पानांवर गोलाकार गडद तपकिरी चट्टे पडतात. कालांतराने बटाट्याच्या आकारावर परिणाम होतो.',
    'Target-like necrotic concentric rings on leaves reducing tuber bulking efficiency.',
    '१. कॉपर बेस्ड सेंद्रिय फवारणी (बोर्डो मिश्रण १%).\n२. ट्रायकोडर्मा हरझियानम कल्चर जमिनीत मिसळा.',
    '1. Apply 1% Bordeaux mixture protective organic spray.\n2. Inoculate root zone with Trichoderma harzianum.',
    '१. अझोक्सीस्ट्रोबिन २३% SC (Amistar) १ मिली प्रति लिटर किंवा\n२. प्रोपिनेब ७०% WP (Antracol) ३ ग्रॅम प्रति लिटर पाण्यात फवारा.',
    '1. Spray Azoxystrobin 23% SC @ 1ml/L or Propineb 70% WP @ 3g/L.',
    600,
    1400,
    1400,
    70
),
(
    'Potato___Late_blight',
    'बटाटा (Potato)',
    'बटाटा - उशिरा येणारा करपा (Late Blight)',
    'पानांच्या टोकावर काळे डाग पडून पाने जळाल्यासारखी दिसतात. संपूर्ण पीक ३-४ दिवसांत कोमेजू शकते.',
    'Water-soaked purplish-black blight lesions on leaves rapidly causing canopy collapse.',
    '१. ट्रायकोडर्मा + सेंद्रिय ह्युमिक ॲसिड फवारणी.\n२. शेतात पाण्याचा निचरा योग्य ठेवा.',
    '1. Spray Trichoderma fortified with organic humic bio-stimulants.\n2. Ensure effective furrow drainage.',
    '१. मेटलॅक्सिल ८% + मॅन्कोझेब ६४% WP २.५ ग्रॅम प्रति लिटर फवारा.',
    '1. Apply Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L immediately.',
    800,
    2100,
    2100,
    85
),
(
    'Potato___healthy',
    'बटाटा (Potato)',
    'बटाटा - निरोगी पीक (Healthy)',
    'बटाट्याची पाने निरोगी व गर्द हिरवी आहेत. पीक उत्तम स्थितीत आहे.',
    'Canopy is robust, dark green with uniform vegetative development.',
    'सेंद्रिय खते आणि जिवाणू संवर्धकांचा वापर चालू ठेवा.',
    'Continue organic compost and bio-fertilizer schedule.',
    'फक्त संतुलित एनपीके (NPK) खतांची मात्रा द्या. रासायनिक फवारणीची गरज नाही.',
    'No chemical pesticides required. Provide balanced potassium.',
    400,
    0,
    400,
    65
),
(
    'Corn___Common_rust',
    'मका (Corn / Maize)',
    'मका - तांबेरा रोग (Common Rust)',
    'पानांच्या दोन्ही बाजूंना तांबूस-तपकिरी रंगाचे लहान पुरळ (Pustules) उठतात. पाने वाळतात.',
    'Elongate golden to dark reddish rust pustules across leaf blades leading to leaf firing.',
    '१. गोमूत्र (१०%) + हिंगाचे द्रावण प्रतिबंधात्मक फवारा.\n२. रोगास प्रतिकारक्षम वाणांची निवड करा.',
    '1. Foliar spray of fermented cow urine with asafoetida extract.\n2. Select certified rust-resistant hybrids.',
    '१. हेक्झाकोनॅझोल ५% EC (Hexaconazole) २ मिली प्रति लिटर किंवा\n२. प्रोपिकोनाझोल २५% EC (Tilt) १ मिली प्रति लिटर पाण्यात फवारा.',
    '1. Spray Hexaconazole 5% EC @ 2ml/L or Propiconazole 25% EC (Tilt) @ 1ml/L.',
    500,
    950,
    950,
    80
),
(
    'Grape___Black_rot',
    'द्राक्षे (Grape)',
    'द्राक्षे - काळा कुजवा / ब्लॅक रॉट (Black Rot)',
    'पानांवर लालसर तपकिरी ठिपके पडतात आणि द्राक्षांचे मणी काळे पडून सुकून सुकतात (Mummified).',
    'Reddish-brown necrotic foliar spots. Berries shrivel into hard black mummies.',
    '१. वेलींची योग्य छाटणी करून हवा खेळती ठेवा.\n२. जीवामृत आणि ट्रायकोडर्मा ड्रेंचिंग करा.',
    '1. Open canopy pruning for sunlight penetration.\n2. Soil drenching with Jeevamrut and Trichoderma.',
    '१. मायक्लोब्युटॅनिल १०% WP (Systhane) ०.५ ग्रॅम प्रति लिटर किंवा\n२. टेब्युकोनाझोल २५.९% EC १.५ मिली प्रति लिटर फवारा.',
    '1. Spray Myclobutanil 10% WP (Systhane) @ 0.5g/L or Tebuconazole 25.9% EC @ 1.5ml/L.',
    1100,
    2800,
    2800,
    80
);
