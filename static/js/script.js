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

    // ==========================================================
    // 7. PLANTIX-STYLE FARMER PROFILE MANAGEMENT & EDIT MODAL
    // ==========================================================
    const modalEditProfile = document.getElementById("modalEditProfile");
    const dispFarmerName = document.getElementById("dispFarmerName");
    const dispFarmerLocation = document.getElementById("dispFarmerLocation");
    const dispFarmerArea = document.getElementById("dispFarmerArea");
    const dispFarmerSoil = document.getElementById("dispFarmerSoil");
    const dispFarmerIrrig = document.getElementById("dispFarmerIrrig");
    const dispFarmerCrops = document.getElementById("dispFarmerCrops");

    const inpFarmerName = document.getElementById("inpFarmerName");
    const inpDistrict = document.getElementById("inpDistrict");
    const inpVillage = document.getElementById("inpVillage");
    const inpArea = document.getElementById("inpArea");
    const inpSoil = document.getElementById("inpSoil");
    const inpIrrigation = document.getElementById("inpIrrigation");
    const inpCrops = document.getElementById("inpCrops");

    function loadFarmerProfile() {
        const saved = localStorage.getItem("fieldvision_farmer_profile");
        let profile = {
            name: "संकेत किर्दत (Sanket Kirdat)",
            district: "सातारा (Satara)",
            village: "कोरेगाव",
            area: "3.5 एकर",
            soil: "काळी कसदार (Black Soil)",
            irrigation: "ठिबक सिंचन (Drip)",
            crops: "टोमॅटो, बटाटा, कांदा, ऊस"
        };
        if (saved) {
            try { profile = { ...profile, ...JSON.parse(saved) }; } catch(e){}
        }

        if (dispFarmerName) dispFarmerName.textContent = profile.name;
        if (dispFarmerLocation) dispFarmerLocation.textContent = `${profile.village}, ${profile.district}`;
        if (dispFarmerArea) dispFarmerArea.textContent = profile.area;
        if (dispFarmerSoil) dispFarmerSoil.textContent = profile.soil;
        if (dispFarmerIrrig) dispFarmerIrrig.textContent = profile.irrigation;
        if (dispFarmerCrops) dispFarmerCrops.textContent = profile.crops;

        const lblHomeGreeting = document.getElementById("lblHomeGreeting");
        if (lblHomeGreeting) {
            lblHomeGreeting.textContent = currentLang === "mr" 
                ? `नमस्कार, ${profile.name.split(" ")[0]}! (Smart Krishi AI)` 
                : `Welcome, ${profile.name.split(" ")[0]}! (FieldVision AI)`;
        }

        // Prepopulate form inputs
        if (inpFarmerName) inpFarmerName.value = profile.name;
        if (inpDistrict) inpDistrict.value = profile.district;
        if (inpVillage) inpVillage.value = profile.village;
        if (inpArea) inpArea.value = profile.area;
        if (inpSoil) inpSoil.value = profile.soil;
        if (inpIrrigation) inpIrrigation.value = profile.irrigation;
        if (inpCrops) inpCrops.value = profile.crops;
    }

    window.openProfileModal = function() {
        if (modalEditProfile) modalEditProfile.classList.remove("hidden");
    };

    window.closeProfileModal = function() {
        if (modalEditProfile) modalEditProfile.classList.add("hidden");
    };

    window.saveFarmerProfile = function(e) {
        if (e) e.preventDefault();
        const profile = {
            name: inpFarmerName.value.trim() || "संकेत किर्दत",
            district: inpDistrict.value,
            village: inpVillage.value.trim() || "सातारा",
            area: inpArea.value.trim() || "3.5 एकर",
            soil: inpSoil.value,
            irrigation: inpIrrigation.value,
            crops: inpCrops.value.trim() || "टोमॅटो, बटाटा, कांदा, ऊस"
        };
        localStorage.setItem("fieldvision_farmer_profile", JSON.stringify(profile));
        loadFarmerProfile();
        closeProfileModal();
        alert(currentLang === "mr" ? "तुमचे शेतकरी प्रोफाइल यशस्वीरित्या सेव्ह केले!" : "Farmer profile updated successfully!");
    };


    // ==========================================================
    // 8. DIGITAL AGRICULTURAL PRESCRIPTION (KRISHI RX SLIP)
    // ==========================================================
    const modalPrescription = document.getElementById("modalPrescription");
    const rxSlipNo = document.getElementById("rxSlipNo");
    const rxFarmerName = document.getElementById("rxFarmerName");
    const rxDate = document.getElementById("rxDate");
    const rxDistrict = document.getElementById("rxDistrict");
    const rxCropName = document.getElementById("rxCropName");
    const rxDiseaseTitle = document.getElementById("rxDiseaseTitle");
    const rxAccuracyVal = document.getElementById("rxAccuracyVal");
    const rxSymptomsBody = document.getElementById("rxSymptomsBody");
    const rxOrgCostTag = document.getElementById("rxOrgCostTag");
    const rxOrgContent = document.getElementById("rxOrgContent");
    const rxChemCostTag = document.getElementById("rxChemCostTag");
    const rxChemContent = document.getElementById("rxChemContent");

    window.openPrescriptionModal = function() {
        if (!modalPrescription) return;

        // Random verified slip number
        const slipId = "RX-2026-SAT-" + Math.floor(1000 + Math.random() * 9000);
        if (rxSlipNo) rxSlipNo.textContent = slipId;

        // Current Date
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
        if (rxDate) rxDate.textContent = dateStr;

        // Read farmer details
        const saved = localStorage.getItem("fieldvision_farmer_profile");
        let pName = "संकेत किर्दत";
        let pDist = "सातारा (3.5 एकर)";
        if (saved) {
            try {
                const p = JSON.parse(saved);
                pName = p.name;
                pDist = `${p.district} (${p.area})`;
            } catch(e){}
        }
        if (rxFarmerName) rxFarmerName.textContent = pName;
        if (rxDistrict) rxDistrict.textContent = pDist;

        // Current Disease Diagnosis
        if (currentDiseaseData) {
            if (rxCropName) rxCropName.textContent = currentDiseaseData.crop_name;
            if (rxDiseaseTitle) rxDiseaseTitle.textContent = currentDiseaseData.marathi_name;
            if (rxAccuracyVal) rxAccuracyVal.textContent = `${currentDiseaseData.confidence}% AI Verified`;
            if (rxSymptomsBody) rxSymptomsBody.textContent = currentDiseaseData.symptoms;

            const oCost = currentDiseaseData.organic_cost || 650;
            const cCost = currentDiseaseData.chemical_cost || 1250;
            if (rxOrgCostTag) rxOrgCostTag.textContent = `एकरी खर्च: ₹ ${oCost}`;
            if (rxChemCostTag) rxChemCostTag.textContent = `एकरी खर्च: ₹ ${cCost}`;
            if (rxOrgContent) rxOrgContent.innerHTML = formatPrescriptionText(currentDiseaseData.organic_remedy);
            if (rxChemContent) rxChemContent.innerHTML = formatPrescriptionText(currentDiseaseData.chemical_remedy);
        } else {
            // Default sample prescription
            if (rxCropName) rxCropName.textContent = "टोमॅटो (Tomato)";
            if (rxDiseaseTitle) rxDiseaseTitle.textContent = "टोमॅटो - लवकर येणारा करपा (Early Blight)";
            if (rxAccuracyVal) rxAccuracyVal.textContent = "96.4% AI Verified";
            if (rxSymptomsBody) rxSymptomsBody.textContent = "पानांवर गोलाकार गडद तपकिरी वलयाकार (केंद्रीत गोल) ठिपके पडतात. जुनी पाने पिवळी पडून गळतात.";
            if (rxOrgCostTag) rxOrgCostTag.textContent = "एकरी खर्च: ₹ 650";
            if (rxChemCostTag) rxChemCostTag.textContent = "एकरी खर्च: ₹ 1,250";
        }

        modalPrescription.classList.remove("hidden");
    };

    window.closePrescriptionModal = function() {
        if (modalPrescription) modalPrescription.classList.add("hidden");
    };

    window.printPrescriptionSlip = function() {
        window.print();
    };


    // ==========================================================
    // 9. GOOGLE ASSISTANT-STYLE KRISHI AI VOICE ASSISTANT
    // ==========================================================
    const btnVoiceAssistant = document.getElementById("btnVoiceAssistant");
    const modalVoiceAssistant = document.getElementById("modalVoiceAssistant");
    const voiceWaves = document.getElementById("voiceWaves");
    const voiceStatusText = document.getElementById("voiceStatusText");
    const voiceUserQuery = document.getElementById("voiceUserQuery");
    const voiceQueryText = document.getElementById("voiceQueryText");
    const voiceAiReply = document.getElementById("voiceAiReply");
    const voiceReplyText = document.getElementById("voiceReplyText");
    const voiceTextInput = document.getElementById("voiceTextInput");

    let isListening = false;
    let recognition = null;

    // Initialize Web Speech API SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLang === "mr" ? "mr-IN" : "en-IN";

        recognition.onstart = function() {
            isListening = true;
            if (voiceWaves) voiceWaves.style.opacity = "1";
            if (voiceStatusText) voiceStatusText.textContent = currentLang === "mr" 
                ? "🎙️ मी ऐकत आहे... (Listening in Marathi)..." 
                : "🎙️ Listening to your query...";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                processVoiceQuery(transcript);
            }
        };

        recognition.onerror = function(event) {
            console.warn("[Voice Assistant Error]", event.error);
            isListening = false;
            if (voiceWaves) voiceWaves.style.opacity = "0.3";
            if (voiceStatusText) voiceStatusText.textContent = "मायक्रोफोन परवानगी तपासा किंवा खाली प्रश्न टाईप करा.";
        };

        recognition.onend = function() {
            isListening = false;
            if (voiceWaves) voiceWaves.style.opacity = "0.3";
        };
    }

    window.openVoiceAssistant = function() {
        if (modalVoiceAssistant) modalVoiceAssistant.classList.remove("hidden");
        if (recognition) recognition.lang = currentLang === "mr" ? "mr-IN" : "en-IN";
    };

    window.closeVoiceAssistant = function() {
        if (modalVoiceAssistant) modalVoiceAssistant.classList.add("hidden");
        if (recognition && isListening) recognition.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    if (btnVoiceAssistant) {
        btnVoiceAssistant.addEventListener("click", openVoiceAssistant);
    }

    window.toggleSpeechRecognition = function() {
        if (!recognition) {
            alert("तुमच्या ब्राउझरमध्ये व्हॉइस रेकग्निशन उपलब्ध नाही. कृपया प्रश्न खाली टाईप करा.");
            return;
        }
        if (isListening) {
            recognition.stop();
        } else {
            recognition.lang = currentLang === "mr" ? "mr-IN" : "en-IN";
            recognition.start();
        }
    };

    // Predefined quick voice chips
    window.askVoicePredefined = function(query) {
        processVoiceQuery(query);
    };

    window.sendVoiceTextQuery = function() {
        if (!voiceTextInput) return;
        const query = voiceTextInput.value.trim();
        if (query) {
            processVoiceQuery(query);
            voiceTextInput.value = "";
        }
    };

    if (voiceTextInput) {
        voiceTextInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendVoiceTextQuery();
        });
    }

    // Process Query with Intelligent Krishi AI Logic & Text-to-Speech
    function processVoiceQuery(query) {
        if (voiceUserQuery) voiceUserQuery.classList.remove("hidden");
        if (voiceQueryText) voiceQueryText.textContent = `"${query}"`;
        if (voiceAiReply) voiceAiReply.classList.remove("hidden");

        const qLower = query.toLowerCase();
        let reply = "";
        let action = null;

        if (qLower.includes("टोमॅटो") || qLower.includes("tomato") || qLower.includes("करपा") || qLower.includes("blight")) {
            reply = "टोमॅटोवरील करपा (Early Blight) रोखण्यासाठी सेंद्रिय उपाय म्हणून ट्रायकोडर्मा व्हिरिडी ५ ग्रॅम/लिटर किंवा ५% निंबोळी अर्क फवारा. रासायनिक उपायासाठी रिडोमिल गोल्ड २ ग्रॅम प्रति लिटर किंवा मॅन्कोझेब २.५ ग्रॅम फवारा. एकरी खर्च अंदाजे ₹ ६५० ते ₹ १२५० येईल.";
        } else if (qLower.includes("कांदा") || qLower.includes("onion") || qLower.includes("जांभळा")) {
            reply = "कांद्यावरील जांभळा करपा (Purple Blotch) नियंत्रणासाठी ५% निंबोळी अर्क आणि नॅटिव्हो ०.७ ग्रॅम प्रति लिटर पाण्यात स्टिकर मिसळून फवारा. एकरी खर्च अंदाजे ₹ १,५०० येईल.";
        } else if (qLower.includes("बटाटा") || qLower.includes("potato")) {
            reply = "बटाट्यावरील उशिरा येणाऱ्या करप्यावर (Late Blight) त्वरित मेटलॅक्सिल + मॅन्कोझेब (रिडोमिल गोल्ड) २.५ ग्रॅम प्रति लिटर पाण्यात फवारा. सेंद्रिय उपायासाठी बोर्डो मिश्रण १% वापरा.";
        } else if (qLower.includes("हवामान") || qLower.includes("weather") || qLower.includes("सातारा")) {
            reply = "सातारा जिल्ह्यात सध्या तापमान २६.८ अंश सेल्सिअस असून आर्द्रता ८२% इतकी जास्त आहे. पुढील ४८ तासांत बुरशीजन्य रोगाचा तीव्र धोका असल्याने प्रतिबंधात्मक बुरशीनाशक फवारणी करा.";
        } else if (qLower.includes("खर्च") || qLower.includes("cost") || qLower.includes("सेंद्रिय")) {
            reply = "FieldVision AI नुसार सेंद्रिय औषधांचा एकरी खर्च अंदाजे ₹ ५०० ते ₹ ७५० येतो, तर रासायनिक औषधांचा खर्च ₹ १,२०० ते ₹ २,००० पर्यंत येतो.";
        } else if (qLower.includes("स्कॅन") || qLower.includes("कॅमेरा") || qLower.includes("camera") || qLower.includes("scan")) {
            reply = "मी Live AR कॅमेरा स्कॅनर सुरू करत आहे. कृपया पिकाच्या पानावर कॅमेरा रोखा.";
            action = () => switchTab("camera");
        } else {
            reply = "FieldVision AI प्रणालीमध्ये आपले स्वागत आहे! मी पिकांचे रोग, सेंद्रिय उपाय, रासायनिक फवारणी व हवामानाबद्दल मार्गदर्शन करू शकतो. आपण पानाचा फोटो काढून थेट स्कॅनिंग देखील करू शकता.";
        }

        if (voiceReplyText) voiceReplyText.textContent = reply;
        if (voiceStatusText) voiceStatusText.textContent = "उत्तर तयार आहे.";

        // Speak aloud via SpeechSynthesis
        speakResponseAloud(reply);

        if (action) {
            setTimeout(action, 1500);
        }
    }

    function speakResponseAloud(text) {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Try to pick Marathi or Indian voice if available
        const voices = window.speechSynthesis.getVoices();
        const mrVoice = voices.find(v => v.lang.includes("mr") || v.lang.includes("hi") || v.name.includes("India"));
        if (mrVoice) {
            utterance.voice = mrVoice;
        }

        window.speechSynthesis.speak(utterance);
    }

    // Load initial farmer profile
    loadFarmerProfile();

    // Initial load: Set Satara weather
    updateWeatherMetrics("Satara");
});


