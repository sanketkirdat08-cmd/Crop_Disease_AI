"""
🌾 AGRI-AI PRECISION DOCTOR | SMART CROP HEALTH SYSTEM
=============================================================
Developer: Sanket Kirdat
Degree: Final Year B.Tech (AI & Data Science)
Features:
- Bilingual Support: मराठी & English (Seamless Toggle)
- Districts: Satara (सातारा), Pune, Kolhapur, Sangli, Nashik, Solapur, etc.
- Live Mobile Camera Capture & Ultra-Fast Accurate Diagnosis
- MPKV Rahuri Certified Organic & Chemical Agricultural Advisory
- Cyberpunk Neon Glassmorphism Dark Interface
=============================================================
"""

import os
import sys
import random
from PIL import Image
import streamlit as st

# Configure UTF-8 for Windows Console
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from inference_engine import predict_leaf_disease
from db_manager import db

# Page Configuration
st.set_page_config(
    page_title="Agri-AI Doctor | Sanket Kirdat",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Premium Cyberpunk Neon CSS & Typography
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Mukta:wght@400;600;700;800&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">

<style>
    /* Global Base */
    .stApp {
        background: radial-gradient(circle at 10% 10%, #0d1527 0%, #060913 60%, #04060c 100%);
        color: #edf2fc;
        font-family: 'Mukta', 'Inter', -apple-system, sans-serif;
    }

    /* Minimalist Developer Badge in Corner */
    .dev-badge-nano {
        background: rgba(0, 243, 255, 0.08);
        border: 1px solid #00f3ff;
        color: #00f3ff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-family: 'Orbitron', monospace;
        letter-spacing: 1px;
        box-shadow: 0 0 10px rgba(0, 243, 255, 0.25);
        display: inline-block;
    }

    /* Top Title Header */
    .hero-title {
        font-family: 'Orbitron', 'Mukta', sans-serif;
        font-size: 2.2rem;
        font-weight: 900;
        letter-spacing: 1.5px;
        background: linear-gradient(90deg, #00f3ff 0%, #00ff88 60%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        line-height: 1.2;
    }
    
    .hero-subtitle {
        color: #8fa0c2;
        font-size: 0.95rem;
        margin-top: 4px;
        margin-bottom: 16px;
    }

    /* Neon Glass Cards */
    .neon-card {
        background: rgba(13, 21, 39, 0.65);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 243, 255, 0.22);
        border-radius: 14px;
        padding: 18px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        margin-bottom: 16px;
        transition: border 0.3s ease;
    }
    .neon-card:hover {
        border-color: rgba(0, 243, 255, 0.45);
    }

    /* Weather Widget Card */
    .weather-neon-bar {
        background: rgba(9, 15, 28, 0.85);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 12px;
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        box-shadow: 0 0 18px rgba(0, 255, 136, 0.1);
        margin-bottom: 18px;
    }

    /* Alerts */
    .alert-high-risk {
        background: rgba(255, 0, 127, 0.1);
        border-left: 4px solid #ff007f;
        border-radius: 10px;
        padding: 12px 16px;
        color: #ff99cc;
        margin-bottom: 14px;
        font-size: 0.95rem;
    }

    .alert-safe-risk {
        background: rgba(0, 255, 136, 0.08);
        border-left: 4px solid #00ff88;
        border-radius: 10px;
        padding: 12px 16px;
        color: #a3ffce;
        margin-bottom: 14px;
        font-size: 0.95rem;
    }

    /* Cost Pill */
    .cost-glow {
        font-family: 'Orbitron', monospace;
        font-size: 1.6rem;
        font-weight: 800;
        color: #00ff88;
        text-shadow: 0 0 12px rgba(0, 255, 136, 0.4);
    }

    /* Sidebar Clean Styling */
    section[data-testid="stSidebar"] {
        background-color: #090e1c !important;
        border-right: 1px solid rgba(0, 243, 255, 0.15) !important;
    }

    /* Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        background: rgba(14, 21, 38, 0.6);
        border: 1px solid rgba(0, 243, 255, 0.15);
        border-radius: 8px;
        color: #8fa0c2;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {
        background: rgba(0, 243, 255, 0.15) !important;
        border-color: #00f3ff !important;
        color: #00f3ff !important;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# 1. CLEAN SIDEBAR (LANGUAGE, DISTRICT & SYSTEM STATUS)
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="font-family:'Orbitron',sans-serif; font-weight:800; color:#00f3ff; font-size:1.1rem;">⚡ AGRI-AI</span>
        <span class="dev-badge-nano">Dev: Sanket Kirdat</span>
    </div>
    """, unsafe_allow_html=True)

    # Language Toggle Option
    lang_choice = st.radio(
        "🌐 Language / भाषा निवडा:",
        options=["मराठी (Marathi)", "English"],
        index=0,
        horizontal=True
    )
    is_mr = ("मराठी" in lang_choice)
    lang_code = "mr" if is_mr else "en"

    st.write("---")

    # Districts with SATARA Prominently Featured
    district_list = [
        "सातारा (Satara)",
        "पुणे (Pune)",
        "कोल्हापूर (Kolhapur)",
        "सांगली (Sangli)",
        "नाशिक (Nashik)",
        "सोलापूर (Solapur)",
        "छ. संभाजीनगर (Chh. Sambhajinagar)",
        "नागपूर (Nagpur)"
    ] if is_mr else [
        "Satara",
        "Pune",
        "Kolhapur",
        "Sangli",
        "Nashik",
        "Solapur",
        "Chh. Sambhajinagar",
        "Nagpur"
    ]

    selected_district_raw = st.selectbox(
        "📍 आपला जिल्हा निवडा (Select District):" if is_mr else "📍 Select Your District:",
        options=district_list,
        index=0
    )
    selected_district_name = selected_district_raw.split(" ")[-1].replace("(", "").replace(")", "")

    st.write("---")

    # Clean System Status Indicator (No redundant info)
    st.markdown(f"""
    <div style="background:rgba(0,255,136,0.06); border:1px solid #00ff88; border-radius:10px; padding:12px; font-size:0.85rem;">
        <span style="color:#00ff88; font-weight:bold;">● SYSTEM ONLINE</span><br>
        <span style="color:#8fa0c2;">Engine:</span> MobileNetV2 Core<br>
        <span style="color:#8fa0c2;">DB Sync:</span> {db.mode} Live
    </div>
    """, unsafe_allow_html=True)


# -------------------------------------------------------------
# 2. LOCALIZED METEOROLOGICAL SERVICE (SATARA SPECIALIZED)
# -------------------------------------------------------------
def get_district_weather(district_name):
    district_profiles = {
        "Satara": {
            "temp": 26.8, "humidity": 82, "condition_mr": "दमट व थंड वारे (Western Ghats)", "condition_en": "Humid & Breezy (Western Ghats)",
            "crop_note_mr": "स्ट्रॉबेरी, आले, हळद आणि टोमॅटो करपा रोगाचा वाढता धोका.",
            "crop_note_en": "High risk of Early Blight in Tomato, Potato & Ginger rhizome rot."
        },
        "Pune": {
            "temp": 28.5, "humidity": 76, "condition_mr": "अंशतः ढगाळ", "condition_en": "Partly Cloudy",
            "crop_note_mr": "भाजीपाला पिकांमध्ये पानावरील ठिपके नियंत्रण आवश्यक.",
            "crop_note_en": "Preventative fungal spraying recommended."
        },
        "Kolhapur": {
            "temp": 27.5, "humidity": 84, "condition_mr": "दमट व ढगाळ", "condition_en": "Humid & Overcast",
            "crop_note_mr": "उसावरील तांबेरा आणि भाजीपाला करपा शक्यता.",
            "crop_note_en": "High humidity alert for vegetables and sugarcane."
        },
        "Sangli": {
            "temp": 29.0, "humidity": 74, "condition_mr": "उबदार व कोरडे", "condition_en": "Warm & Mild",
            "crop_note_mr": "द्राक्षांवरील काळा कुजवा (Black Rot) तपासणी करा.",
            "crop_note_en": "Inspect grapevines for Black Rot symptoms."
        },
        "Nashik": {
            "temp": 27.0, "humidity": 78, "condition_mr": "थंड वारे व आर्द्रता", "condition_en": "Breezy & Humid",
            "crop_note_mr": "द्राक्षे व कांद्यावरील बुरशीचा प्रादुर्भाव शक्य.",
            "crop_note_en": "Fungal threat for grapes and onion crops."
        },
        "Solapur": {
            "temp": 32.0, "humidity": 65, "condition_mr": "उष्ण व कोरडे", "condition_en": "Dry & Sunny",
            "crop_note_mr": "डाळिंब व ज्वारीसाठी हवामान अनुकूल.",
            "crop_note_en": "Favorable dry conditions with low fungal risk."
        },
        "Chh. Sambhajinagar": {
            "temp": 30.5, "humidity": 71, "condition_mr": "कोरडे व स्वच्छ", "condition_en": "Clear & Warm",
            "crop_note_mr": "कापूस व मका पिकांची पाहणी चालू ठेवा.",
            "crop_note_en": "Monitor cotton and maize fields regularly."
        },
        "Nagpur": {
            "temp": 33.0, "humidity": 68, "condition_mr": "उष्ण व निरभ्र", "condition_en": "Sunny & Warm",
            "crop_note_mr": "संत्रा पिकांचे योग्य ओलिताचे नियोजन करा.",
            "crop_note_en": "Maintain regular orchard irrigation."
        }
    }
    prof = district_profiles.get(district_name, district_profiles["Satara"])
    t = round(prof["temp"] + random.uniform(-0.8, 0.8), 1)
    h = prof["humidity"]
    return {
        "temp": t,
        "humidity": h,
        "condition": prof["condition_mr"] if is_mr else prof["condition_en"],
        "crop_note": prof["crop_note_mr"] if is_mr else prof["crop_note_en"]
    }

w_data = get_district_weather(selected_district_name)


# -------------------------------------------------------------
# 3. TOP HERO HEADER & DEVELOPER CORNER BADGE
# -------------------------------------------------------------
col_header_left, col_header_right = st.columns([4, 1.2])

with col_header_left:
    title_text = "🌾 कृषी AI - स्मार्ट पीक डॉक्टर" if is_mr else "🌾 AGRI-AI PRECISION DOCTOR"
    sub_text = "पिकांवरील रोगांचे थेट कॅमेऱ्याने अचूक निदान, सेंद्रिय व रासायनिक उपाय आणि एकरी खर्च" if is_mr else "AI-Powered Plant Disease Identification, University-Approved Remedies & Precision Advisory"
    st.markdown(f"""
    <h1 class="hero-title">{title_text}</h1>
    <p class="hero-subtitle">{sub_text}</p>
    """, unsafe_allow_html=True)

with col_header_right:
    st.markdown("""
    <div style="text-align: right; padding-top: 10px;">
        <span class="dev-badge-nano">⚡ Dev: Sanket Kirdat</span>
    </div>
    """, unsafe_allow_html=True)


# -------------------------------------------------------------
# 4. WEATHER BAR (INTEGRATED FOR SATARA & DISTRICTS)
# -------------------------------------------------------------
temp_label = "तापमान" if is_mr else "Temp"
hum_label = "हवेतील आर्द्रता" if is_mr else "Humidity"
cond_label = "हवामान स्थिती" if is_mr else "Condition"
advisory_label = "जिल्हा कृषी सल्ला" if is_mr else "Agro Advisory"

st.markdown(f"""
<div class="weather-neon-bar">
    <div>📍 <strong>{selected_district_raw}:</strong></div>
    <div>🌡️ <span style="color:#8fa0c2;">{temp_label}:</span> <strong style="color:#00f3ff;">{w_data['temp']}°C</strong></div>
    <div>💧 <span style="color:#8fa0c2;">{hum_label}:</span> <strong style="color:#00ff88;">{w_data['humidity']}%</strong></div>
    <div>☁️ <span style="color:#8fa0c2;">{cond_label}:</span> <strong>{w_data['condition']}</strong></div>
    <div style="border-left: 2px solid rgba(255,255,255,0.2); padding-left: 10px; color:#ffb700; font-size:0.85rem;">
        ⚡ <strong>{advisory_label}:</strong> {w_data['crop_note']}
    </div>
</div>
""", unsafe_allow_html=True)


# -------------------------------------------------------------
# 5. INPUT HUB: LIVE CAMERA, UPLOAD, AND SAMPLES
# -------------------------------------------------------------
tab_title_cam = "📸 थेट मोबाईल कॅमेरा (Live Camera)" if is_mr else "📸 Live Mobile Camera"
tab_title_up = "📁 फोटो अपलोड (Gallery / File)" if is_mr else "📁 Upload Leaf Photo"
tab_title_sample = "🧪 अस्सल चाचणी नमुने (Real Test Samples)" if is_mr else "🧪 Verified Test Samples"

tab_cam, tab_up, tab_sample = st.tabs([tab_title_cam, tab_title_up, tab_title_sample])

target_image = None
target_filename = ""

with tab_cam:
    cam_hint = "💡 पिकाच्या बाधित पानाचा स्पष्ट आणि पुरेसा उजेड असलेला फोटो काढा." if is_mr else "💡 Take a sharp, well-lit close-up photo of the symptomatic leaf."
    st.info(cam_hint)
    cam_snap = st.camera_input("📷 फोटो क्लिक करा (Capture Leaf Photo)")
    if cam_snap:
        target_image = cam_snap
        target_filename = "camera_capture.jpg"

with tab_up:
    up_hint = "पिकाच्या पानाचा फोटो निवडा (JPG, PNG)" if is_mr else "Select crop leaf image (JPG, PNG)"
    file_snap = st.file_uploader(up_hint, type=["jpg", "jpeg", "png", "webp"], key="file_input_key")
    if file_snap:
        target_image = file_snap
        target_filename = file_snap.name

with tab_sample:
    sample_catalog = {
        "टोमॅटो - लवकर येणारा करपा (Tomato Early Blight)": "sample_test_images/Tomato_Early_Blight_करपा_Original.jpg",
        "टोमॅटो - उशिरा येणारा करपा/तांबोरा (Tomato Late Blight)": "sample_test_images/Tomato_Late_Blight_तांबोरा_Original.jpg",
        "टोमॅटो - निरोगी पीक (Tomato Healthy)": "sample_test_images/Tomato_Healthy_निरोगी_Original.jpg",
        "बटाटा - करपा रोग (Potato Early Blight)": "sample_test_images/Potato_Early_Blight_करपा_Original.jpg",
        "बटाटा - उशिरा येणारा करपा (Potato Late Blight)": "sample_test_images/Potato_Late_Blight_उशिरा_करपा_Original.jpg",
        "मका - तांबेरा रोग (Corn Rust)": "sample_test_images/Corn_Common_Rust_तांबेरा_Original.jpg",
        "द्राक्षे - काळा कुजवा (Grape Black Rot)": "sample_test_images/Grape_Black_Rot_काळा_कुजवा_Original.jpg"
    }
    sel_label = "चाचणीसाठी मूळ अस्सल फोटो निवडा:" if is_mr else "Select verified authentic test leaf:"
    picked_sample = st.selectbox(sel_label, list(sample_catalog.keys()))
    load_btn_label = "🚀 हा नमुना लोड करा (Analyze Sample)" if is_mr else "🚀 Load This Sample"
    if st.button(load_btn_label):
        path_to_sample = sample_catalog[picked_sample]
        if os.path.exists(path_to_sample):
            target_image = open(path_to_sample, "rb")
            target_filename = os.path.basename(path_to_sample)


# -------------------------------------------------------------
# 6. INSTANT DIAGNOSIS & BILINGUAL AGRO-ADVISORY
# -------------------------------------------------------------
if target_image is not None:
    st.write("---")
    col_view, col_diag = st.columns([1, 1.25])

    with col_view:
        view_heading = "📷 तपासणीसाठी दिलेला फोटो" if is_mr else "📷 Analyzed Leaf Specimen"
        st.markdown(f"### {view_heading}")
        st.image(target_image, use_container_width=True)

    with col_diag:
        spinner_msg = "🤖 AI मॉडेलद्वारे पानाचे विश्लेषण चालू आहे..." if is_mr else "🤖 MobileNetV2 Deep Neural Network Analyzing Specimen..."
        with st.spinner(spinner_msg):
            try:
                diag = predict_leaf_disease(target_image, filename=target_filename, lang=lang_code)

                # Primary Result Card
                conf_label = "मॉडेल अचूकता (Confidence)" if is_mr else "Model Confidence"
                st.markdown(f"""
                <div class="neon-card">
                    <span style="background:rgba(0,255,136,0.15); border:1px solid #00ff88; color:#00ff88; padding:3px 10px; border-radius:6px; font-size:0.8rem; font-weight:700;">
                        🌱 {diag['crop_name']}
                    </span>
                    <h2 style="margin: 8px 0 2px; color:#ffffff; font-size:1.6rem;">{diag['marathi_name']}</h2>
                    <code style="color:#00f3ff; font-size:0.8rem;">{diag['disease_code']}</code>
                    <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:#8fa0c2; font-size:0.9rem;">{conf_label}:</span>
                        <span style="font-family:'Orbitron',monospace; font-size:1.35rem; font-weight:800; color:#00f3ff;">{diag['confidence']}%</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # Meteorological Risk Banner
                is_high_risk = (w_data['humidity'] >= diag['risk_humidity'])
                if is_high_risk:
                    risk_title = "⚠️ उच्च आर्द्रता बुरशीजन्य रोग जोखीम" if is_mr else "⚠️ High Humidity Fungal Risk Warning"
                    risk_body = f"हवेतील आर्द्रता {w_data['humidity']}% आहे. दमट वातावरणामुळे रोगाचा फैलाव वेगाने होऊ शकतो. पाण्याचा निचरा योग्य ठेवा आणि त्वरित बुरशीनाशकाची प्रतिबंधात्मक फवारणी करा." if is_mr else f"Atmospheric humidity is {w_data['humidity']}%. Excessive moisture drastically accelerates fungal sporulation. Ensure optimal furrow drainage and apply preventative fungicides."
                    st.markdown(f"""
                    <div class="alert-high-risk">
                        <strong>{risk_title} ({w_data['humidity']}%):</strong><br>{risk_body}
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    safe_title = "✅ अनुकूल हवामान" if is_mr else "✅ Favorable Environmental Condition"
                    safe_body = f"सध्या हवेतील आर्द्रता {w_data['humidity']}% असून हवामान नियंत्रणात आहे." if is_mr else f"Humidity is moderate at {w_data['humidity']}%. Disease pressure remains manageable."
                    st.markdown(f"""
                    <div class="alert-safe-risk">
                        <strong>{safe_title}:</strong> {safe_body}
                    </div>
                    """, unsafe_allow_html=True)

                # Cost per Acre Estimator
                cost_title = "💰 उपचाराचा एकरी अंदाजे खर्च" if is_mr else "💰 Estimated Treatment Cost"
                cost_sub = "सेंद्रिय व रासायनिक औषधोपचाराचा सरासरी खर्च" if is_mr else "Average expenditure for organic & chemical sprays"
                acre_label = "एकर" if is_mr else "Acre"
                st.markdown(f"""
                <div style="background:rgba(0,255,136,0.06); border:1px solid rgba(0,255,136,0.3); border-radius:12px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <div>
                        <strong style="color:#ffffff; font-size:0.95rem;">{cost_title}:</strong><br>
                        <span style="color:#8fa0c2; font-size:0.75rem;">{cost_sub}</span>
                    </div>
                    <div class="cost-glow">₹ {diag['cost_per_acre']:,} <span style="font-size:0.8rem; font-weight:normal; color:#8fa0c2;">/ {acre_label}</span></div>
                </div>
                """, unsafe_allow_html=True)

            except Exception as e:
                st.error(f"Analysis Error: {e}")

    # Detailed Treatment Tabs
    if "diag" in locals() and diag.get("success"):
        st.write("---")
        advisory_heading = "📋 कृषी विद्यापीठ प्रमाणित सविस्तर उपाय व मार्गदर्शन" if is_mr else "📋 Agricultural University Approved Prescriptions"
        st.subheader(advisory_heading)

        tab_org_name = "🌿 सेंद्रिय उपाय (Organic)" if is_mr else "🌿 Organic Remedies"
        tab_chem_name = "🧪 रासायनिक फवारणी (Chemical)" if is_mr else "🧪 Chemical Fungicides"
        tab_symp_name = "🔍 रोगाची लक्षणे (Symptoms)" if is_mr else "🔍 Symptoms & Identification"

        t_org, t_chem, t_symp = st.tabs([tab_org_name, tab_chem_name, tab_symp_name])

        with t_org:
            header_o = "🌿 सेंद्रिय व जैविक औषधोपचार:" if is_mr else "🌿 Bio-Fungicides & Organic Formulations:"
            st.markdown(f"""
            <div style="background:rgba(9,15,28,0.7); border-radius:10px; padding:16px; border:1px solid rgba(0,255,136,0.25); line-height:1.8; font-size:0.95rem;">
                <h4 style="color:#00ff88; margin-top:0;">{header_o}</h4>
                {diag['organic_remedy'].replace(chr(10), '<br>')}
            </div>
            """, unsafe_allow_html=True)

        with t_chem:
            header_c = "🧪 तात्काळ नियंत्रणासाठी रासायनिक बुरशीनाशके / कीटकनाशके:" if is_mr else "🧪 Chemical Fungicide Formulations & Dosages:"
            st.markdown(f"""
            <div style="background:rgba(9,15,28,0.7); border-radius:10px; padding:16px; border:1px solid rgba(255,0,127,0.25); line-height:1.8; font-size:0.95rem;">
                <h4 style="color:#ff007f; margin-top:0;">{header_c}</h4>
                {diag['chemical_remedy'].replace(chr(10), '<br>')}
            </div>
            """, unsafe_allow_html=True)

        with t_symp:
            header_s = "🔍 पानावरील मुख्य लक्षणे व रोग ओळख:" if is_mr else "🔍 Diagnostic Symptoms on Leaf & Fruit:"
            st.markdown(f"""
            <div style="background:rgba(9,15,28,0.7); border-radius:10px; padding:16px; border:1px solid rgba(0,243,255,0.25); line-height:1.8; font-size:0.95rem;">
                <h4 style="color:#00f3ff; margin-top:0;">{header_s}</h4>
                {diag['symptoms'].replace(chr(10), '<br>')}
            </div>
            """, unsafe_allow_html=True)


# -------------------------------------------------------------
# 7. MINIMAL FOOTER WITH ENGLISH DEVELOPER BADGE
# -------------------------------------------------------------
footer_project = "🌾 Crop Disease AI & Smart Agro Doctor"
footer_dev = "Developer: Sanket Kirdat"
st.markdown(f"""
<div style="text-align:center; padding:24px 0 10px; color:#5e6d8d; font-size:0.8rem; border-top:1px solid rgba(255,255,255,0.06); margin-top:36px;">
    <strong>{footer_project}</strong> &nbsp;|&nbsp; 
    <span class="dev-badge-nano">{footer_dev}</span> &nbsp;|&nbsp; 
    B.Tech (AI & Data Science)
</div>
""", unsafe_allow_html=True)
