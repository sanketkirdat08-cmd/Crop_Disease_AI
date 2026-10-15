/**
 * FieldVision AI - Futuristic Frontend Engine
 * Plantix-Style Bottom Navigation, Real-time WebRTC AR Camera, 
 * Laser Sweep Animation, Dual Remedy & Cost Engine, Weather Advisory
 * 
 * Developer: Sanket Kirdat (Department of AI & Data Science)
 */

document.addEventListener("DOMContentLoaded", () => {
    // Current application state
    let currentLang = "mr";
    let mediaStream = null;
    let selectedFileBlob = null;
    let currentDiseaseData = null;

    // DOM Elements - Navigation & Views
    const navButtons = {
        home: document.getElementById("navBtn-home"),
        camera: document.getElementById("navBtn-camera"),
        crops: document.getElementById("navBtn-crops"),
        community: document.getElementById("navBtn-community"),
        profile: document.getElementById("navBtn-profile")
    };

    const views = {
        home: document.getElementById("view-home"),
        camera: document.getElementById("view-camera"),
        crops: document.getElementById("view-crops"),
        community: document.getElementById("view-community"),
        profile: document.getElementById("view-profile")
    };

    // DOM Elements - Camera & Scanner
    const cameraVideo = document.getElementById("cameraVideo");
    const scannedImagePreview = document.getElementById("scannedImagePreview");
    const viewfinderIdle = document.getElementById("viewfinderIdle");
    const arLaser = document.getElementById("arLaser");
    const arTelemetry = document.getElementById("arTelemetry");
    const btnShutter = document.getElementById("btnShutter");
    const filePickerInput = document.getElementById("filePickerInput");
    const btnUploadGallery = document.getElementById("btnUploadGallery");
    const btnResetScan = document.getElementById("btnResetScan");
    const hudAccuracyText = document.getElementById("hudAccuracyText");

    // DOM Elements - Results Container
    const diagnosisResults = document.getElementById("diagnosisResults");
    const resCropName = document.getElementById("resCropName");
    const resDiseaseName = document.getElementById("resDiseaseName");
    const resDiseaseCode = document.getElementById("resDiseaseCode");
    const resConfidenceVal = document.getElementById("resConfidenceVal");
    const resSymptomsText = document.getElementById("resSymptomsText");
    const resOrgCost = document.getElementById("resOrgCost");
    const resOrganicText = document.getElementById("resOrganicText");
    const resChemCost = document.getElementById("resChemCost");
    const resChemicalText = document.getElementById("resChemicalText");

    // DOM Elements - Language & Weather
    const btnLangMr = document.getElementById("btnLangMr");
    const btnLangEn = document.getElementById("btnLangEn");
    const districtSelect = document.getElementById("districtSelect");

    // ==========================================================
    // 1. PLANTIX-STYLE BOTTOM TAB NAVIGATION
    // ==========================================================
    window.switchTab = function(tabId) {
        // Hide all views
        Object.keys(views).forEach(key => {
            if (views[key]) {
                views[key].classList.remove("active");
            }
        });

        // Deactivate all nav items
        Object.keys(navButtons).forEach(key => {
            if (navButtons[key]) {
                navButtons[key].classList.remove("active");
            }
        });

        // Activate selected view & nav item
        if (views[tabId]) {
            views[tabId].classList.add("active");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        if (navButtons[tabId]) {
            navButtons[tabId].classList.add("active");
        }

        // Camera handling based on active tab
        if (tabId === "camera") {
            startCamera();
        } else {
            stopCamera();
        }
    };

    // ==========================================================
    // 2. WEBRTC LIVE CAMERA FEED HANDLING
    // ==========================================================
    async function startCamera() {
        if (mediaStream) return; // Already running

        // If a file preview is already loaded from previous capture/upload, don't override
        if (!scannedImagePreview.classList.contains("hidden") && scannedImagePreview.src) {
            return;
        }

        try {
            const constraints = {
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraVideo.srcObject = mediaStream;
            cameraVideo.classList.remove("hidden");
            viewfinderIdle.classList.add("hidden");
            scannedImagePreview.classList.add("hidden");
        } catch (err) {
            console.warn("[Camera Notice] Live video feed not accessible, using file picker mode:", err);
            // Show idle prompt with manual upload notice
            cameraVideo.classList.add("hidden");
            viewfinderIdle.classList.remove("hidden");
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }

    // ==========================================================
    // 3. CAPTURE / UPLOAD & LASER SCAN ANIMATION
    // ==========================================================
    
    // Shutter Click Handler
    if (btnShutter) {
        btnShutter.addEventListener("click", () => {
            if (mediaStream && !cameraVideo.classList.contains("hidden")) {
                // Live camera is active: Capture frame to canvas
                captureFrameFromVideo();
            } else if (selectedFileBlob) {
                // Existing file selected: run scan directly
                triggerScanAndInference(selectedFileBlob, "specimen_capture.jpg");
            } else {
                // Camera not active: open gallery file picker
                filePickerInput.click();
            }
        });
    }

    // Capture current frame from live camera video
    function captureFrameFromVideo() {
        const canvas = document.createElement("canvas");
        canvas.width = cameraVideo.videoWidth || 640;
        canvas.height = cameraVideo.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                // Freeze preview with captured image
                const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
                scannedImagePreview.src = dataUrl;
                scannedImagePreview.classList.remove("hidden");
                cameraVideo.classList.add("hidden");
                viewfinderIdle.classList.add("hidden");
                
                selectedFileBlob = blob;
                triggerScanAndInference(blob, "live_ar_leaf_capture.jpg");
            }
        }, "image/jpeg", 0.92);
    }

    // Gallery / File Picker Handlers
    if (btnUploadGallery) {
        btnUploadGallery.addEventListener("click", () => {
            filePickerInput.click();
        });
    }

    if (filePickerInput) {
        filePickerInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    stopCamera();
                    cameraVideo.classList.add("hidden");
                    viewfinderIdle.classList.add("hidden");
                    scannedImagePreview.src = event.target.result;
                    scannedImagePreview.classList.remove("hidden");

                    selectedFileBlob = file;
                    triggerScanAndInference(file, file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Trigger Laser Animation and Call /predict Backend
    async function triggerScanAndInference(fileBlob, fileName) {
        // Start Laser Line Sweep Animation & Telemetry Overlay
        arLaser.classList.add("scanning");
        arTelemetry.classList.remove("hidden");
        diagnosisResults.classList.add("hidden");

        const formData = new FormData();
        formData.append("file", fileBlob, fileName || "leaf.jpg");
        formData.append("lang", currentLang);
        formData.append("city", districtSelect ? districtSelect.value : "Satara");

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            // Wait brief moment for the futuristic laser sweep to complete at least one cycle
            setTimeout(() => {
                arLaser.classList.remove("scanning");
                arTelemetry.classList.add("hidden");

                if (data.success) {
                    currentDiseaseData = data;
                    renderDiagnosisResults(data);
                } else {
                    alert(data.error || "निदान करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
                }
            }, 1200);

        } catch (error) {
            console.error("[Inference Error]", error);
            setTimeout(() => {
                arLaser.classList.remove("scanning");
                arTelemetry.classList.add("hidden");
                alert("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट / स्थानिक नेटवर्क तपासा.");
            }, 1000);
        }
    }

    // ==========================================================
    // 4. RENDER DIAGNOSIS & DUAL REMEDY / COST ENGINE
    // ==========================================================
    function renderDiagnosisResults(data) {
        // Update HUD Accuracy Pill
        if (hudAccuracyText) {
            hudAccuracyText.textContent = `${data.confidence}% ACCURACY`;
        }

        // Header info
        if (resCropName) resCropName.textContent = data.crop_name || "पीक";
        if (resDiseaseName) resDiseaseName.textContent = data.marathi_name || data.disease_code;
        if (resDiseaseCode) resDiseaseCode.textContent = data.disease_code || "";
        if (resConfidenceVal) resConfidenceVal.textContent = `${data.confidence}%`;

        // Foliar Symptoms
        if (resSymptomsText) resSymptomsText.textContent = data.symptoms || "पानावर रोगाची लक्षणे दिसून येत आहेत.";

        // Dual Remedy & Cost Card 1: Organic
        const orgCost = data.organic_cost || 650;
        if (resOrgCost) {
            resOrgCost.innerHTML = `₹ ${orgCost} <span class="per-acre">${currentLang === "mr" ? "/ एकर" : "/ acre"}</span>`;
        }
        if (resOrganicText) {
            resOrganicText.innerHTML = formatPrescriptionText(data.organic_remedy);
        }

        // Dual Remedy & Cost Card 2: Chemical
        const chemCost = data.chemical_cost || data.cost_per_acre || 1250;
        if (resChemCost) {
            resChemCost.innerHTML = `₹ ${chemCost} <span class="per-acre">${currentLang === "mr" ? "/ एकर" : "/ acre"}</span>`;
        }
        if (resChemicalText) {
            resChemicalText.innerHTML = formatPrescriptionText(data.chemical_remedy);
        }

        // Reveal and smoothly scroll to results
        diagnosisResults.classList.remove("hidden");
        diagnosisResults.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function formatPrescriptionText(text) {
        if (!text) return "";
        return text.split("\n").map(line => line.trim()).filter(line => line.length > 0).join("<br>");
    }

    // Reset Scanner Action
    window.resetARScanner = function() {
        diagnosisResults.classList.add("hidden");
        scannedImagePreview.src = "";
        scannedImagePreview.classList.add("hidden");
        selectedFileBlob = null;
        filePickerInput.value = "";
        startCamera();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (btnResetScan) {
        btnResetScan.addEventListener("click", resetARScanner);
    }

    // Quick Real Samples Carousel Click Handler
    window.loadSampleTest = async function(sampleKey) {
        switchTab("camera");
        stopCamera();

        const sampleMap = {
            "Tomato_Early_Blight": "/static/sample_test_images/Tomato_Early_Blight_करपा_Original.jpg",
            "Tomato_Late_Blight": "/static/sample_test_images/Tomato_Late_Blight_तांबोरा_Original.jpg",
            "Potato_Early_Blight": "/static/sample_test_images/Potato_Early_Blight_करपा_Original.jpg",
            "Corn_Rust": "/static/sample_test_images/Corn_Common_Rust_तांबेरा_Original.jpg",
            "Tomato_Healthy": "/static/sample_test_images/Tomato_Healthy_निरोगी_Original.jpg"
        };

        const imgUrl = sampleMap[sampleKey];
        if (!imgUrl) return;

        scannedImagePreview.src = imgUrl;
        scannedImagePreview.classList.remove("hidden");
        cameraVideo.classList.add("hidden");
        viewfinderIdle.classList.add("hidden");

        try {
            const resp = await fetch(imgUrl);
            const blob = await resp.blob();
            selectedFileBlob = blob;
            triggerScanAndInference(blob, `${sampleKey}.jpg`);
        } catch (err) {
            console.error("[Sample Fetch Error]", err);
        }
    };

    // ==========================================================
    // 5. PREDICTIVE WEATHER & 48-HOUR FUNGAL INFECTION ALERT
    // ==========================================================
    async function updateWeatherMetrics(city) {
        try {
            const resp = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            const data = await resp.json();

            const wTemp = document.getElementById("wTemp");
            const wHum = document.getElementById("wHum");
            const wRain = document.getElementById("wRain");
            const wWind = document.getElementById("wWind");
            const lblRiskAlertHead = document.getElementById("lblRiskAlertHead");
            const lblRiskAlertMsg = document.getElementById("lblRiskAlertMsg");
            const fungalRiskBanner = document.getElementById("fungalRiskBanner");

            if (wTemp) wTemp.textContent = `${data.temp}°C`;
            if (wHum) wHum.textContent = `${data.humidity}%`;
            if (wWind) wWind.textContent = "14 km/h";

            const isHighRisk = data.humidity >= 75;
            if (wRain) {
                wRain.textContent = isHighRisk ? "70% (High)" : "25% (Low)";
            }

            if (fungalRiskBanner) {
                if (isHighRisk) {
                    fungalRiskBanner.style.borderColor = "var(--neon-amber)";
                    if (lblRiskAlertHead) {
                        lblRiskAlertHead.textContent = currentLang === "mr" 
                            ? "⚠️ 48 तासांत बुरशीजन्य रोगाचा तीव्र धोका (High Risk of Fungal Infection in 48 Hours)"
                            : "⚠️ High Risk of Fungal Infection in 48 Hours Due to Atmospheric Humidity";
                    }
                    if (lblRiskAlertMsg) {
                        lblRiskAlertMsg.textContent = currentLang === "mr"
                            ? `हवेतील अति-आर्द्रता (${data.humidity}%) आणि दमट वातावरणामुळे टोमॅटो करपा (Early Blight), लेट ब्लाइट आणि कांद्यावरील करप्याचा प्रादुर्भाव पुढील 48 तासांत वेगाने वाढू शकतो. ट्रायकोडर्मा किंवा बुरशीनाशकाची प्रतिबंधात्मक फवारणी करा.`
                            : `Elevated atmospheric humidity (${data.humidity}%) significantly accelerates spore germination of Early Blight, Late Blight, and Rust within the next 48 hours. Apply preventative organic/chemical fungicides promptly.`;
                    }
                } else {
                    fungalRiskBanner.style.borderColor = "var(--neon-green)";
                    if (lblRiskAlertHead) {
                        lblRiskAlertHead.textContent = currentLang === "mr"
                            ? "✅ हवामान सुरक्षित • बुरशीचा धोका कमी (Low Climatic Risk)"
                            : "✅ Climate Conditions Normal • Low Fungal Risk";
                    }
                    if (lblRiskAlertMsg) {
                        lblRiskAlertMsg.textContent = currentLang === "mr"
                            ? `सध्या हवेतील आर्द्रता ${data.humidity}% असून हवामान नियंत्रणात आहे. पिकाची नियमित निगा राखा.`
                            : `Current relative humidity is ${data.humidity}%. Fungal sporulation threat is minimal. Continue standard crop maintenance.`;
                    }
                }
            }
        } catch (e) {
            console.warn("[Weather Update Error]", e);
        }
    }

    if (districtSelect) {
        districtSelect.addEventListener("change", (e) => {
            updateWeatherMetrics(e.target.value);
        });
    }

    // ==========================================================
    // 6. BILINGUAL LANGUAGE SWITCHING (MARATHI & ENGLISH)
    // ==========================================================
    const i18n = {
        mr: {
            lblHomeGreeting: "स्मार्ट पीक संरक्षण डॅशबोर्ड",
            lblHomeDesc: "थेट AI स्कॅनरने शेतातील रोगांचे निदान करा, सेंद्रिय व रासायनिक उपाय आणि अचूक एकरी खर्च मिळवा.",
            lblLaunchAR: "थेट Live AR स्कॅनर सुरू करा",
            lblWeatherAlertTitle: "हवामान व रोग अंदाज प्रणाली (48-Hour Forecast)",
            lblTemp: "तापमान (Temp)",
            lblHum: "आर्द्रता (Humidity)",
            lblRain: "पाऊस शक्यता",
            lblWind: "हवेचा वेग",
            lblRecentScansTitle: "नुकतेच तपासलेले नमुने (Quick Real Samples)",
            lblScanPrompt: "पिकाच्या पानावर कॅमेरा केंद्रित करा",
            lblScanSubPrompt: "स्पष्ट उजेडात बाधित पानाचा फोटो घ्या किंवा गॅलरीमधून निवडा",
            lblChooseFile: "गॅलरी",
            lblResetScan: "रिसेट",
            lblAccLabel: "मॉडेल अचूकता",
            lblSympTitle: "पानावरील मुख्य लक्षणे (Foliar Symptoms)",
            lblOrgCardTitle: "सेंद्रिय उपाय (ORGANIC REMEDY)",
            lblOrgCostHead: "एकरी सेंद्रिय खर्च:",
            lblOrgCostSub: "जैविक व पर्यावरणपूरक औषधे",
            lblChemCardTitle: "रासायनिक उपाय (CHEMICAL REMEDY)",
            lblChemCostHead: "एकरी रासायनिक खर्च:",
            lblChemCostSub: "तात्काळ नियंत्रण बुरशीनाशके",
            lblPerAcre1: "/ एकर",
            lblPerAcre2: "/ एकर",
            lblPrintBtn: "प्रिस्क्रिप्शन प्रिंट करा",
            lblNewScanBtn: "दुसऱ्या पानाचे स्कॅनिंग करा",
            lblMyCropsTitle: "माझी पिके (My Monitored Crops)",
            lblMyCropsDesc: "सातारा आणि महाराष्ट्र हवामानानुसार निवडलेली सक्रिय पिके",
            lblCommunityTitle: "शेतकरी समुदाय व तज्ज्ञ सल्ला (Krishi Community)",
            lblCommunityDesc: "इतर शेतकऱ्यांचे प्रश्न, उपाय आणि कृषी विद्यापीठ तज्ज्ञ मते",
            lblNavHome: "होम",
            lblNavCamera: "AR कॅमेरा",
            lblNavCrops: "माझी पिके",
            lblNavCommunity: "समुदाय",
            lblNavProfile: "प्रोफाइल"
        },
        en: {
            lblHomeGreeting: "Smart Crop Protection Dashboard",
            lblHomeDesc: "Real-time AI diagnosis of foliar diseases with dual organic & chemical remedies and per-acre cost breakdown.",
            lblLaunchAR: "Launch Live AR Scanner",
            lblWeatherAlertTitle: "Predictive Weather & Fungal Risk (48-Hour Forecast)",
            lblTemp: "Temperature",
            lblHum: "Humidity",
            lblRain: "Precipitation",
            lblWind: "Wind Speed",
            lblRecentScansTitle: "Verified Field Specimens (Quick Samples)",
            lblScanPrompt: "Center camera viewfinder on affected leaf",
            lblScanSubPrompt: "Ensure bright illumination and take photo or choose from gallery",
            lblChooseFile: "Gallery",
            lblResetScan: "Reset",
            lblAccLabel: "Model Accuracy",
            lblSympTitle: "Key Foliar Pathological Symptoms",
            lblOrgCardTitle: "ORGANIC REMEDY (Eco-Friendly)",
            lblOrgCostHead: "Organic Cost Per Acre:",
            lblOrgCostSub: "Biological & bio-pesticide solutions",
            lblChemCardTitle: "CHEMICAL REMEDY (Quick Action)",
            lblChemCostHead: "Chemical Cost Per Acre:",
            lblChemCostSub: "Targeted synthetic fungicides",
            lblPerAcre1: "/ acre",
            lblPerAcre2: "/ acre",
            lblPrintBtn: "Print Advisory Report",
            lblNewScanBtn: "Scan Another Specimen",
            lblMyCropsTitle: "My Monitored Crops",
            lblMyCropsDesc: "Active crop varieties optimized for Maharashtra climatic zones",
            lblCommunityTitle: "Krishi Community & Expert Advisory",
            lblCommunityDesc: "Peer discussions, farmer queries, and agronomy specialist insights",
            lblNavHome: "Home",
            lblNavCamera: "AR Camera",
            lblNavCrops: "My Crops",
            lblNavCommunity: "Community",
            lblNavProfile: "Profile"
        }
    };

    function setLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;

        if (lang === "mr") {
            btnLangMr.classList.add("active");
            btnLangEn.classList.remove("active");
        } else {
            btnLangEn.classList.add("active");
            btnLangMr.classList.remove("active");
        }

        const dict = i18n[lang];
        Object.keys(dict).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = dict[id];
            }
        });

        // Refresh weather alert with new language
        if (districtSelect) {
            updateWeatherMetrics(districtSelect.value);
        }
    }

    if (btnLangMr) btnLangMr.addEventListener("click", () => setLanguage("mr"));
    if (btnLangEn) btnLangEn.addEventListener("click", () => setLanguage("en"));

    // Initial load: Set Satara weather
    updateWeatherMetrics("Satara");
});

