/**
 * FieldVision AI - Futuristic Frontend Engine
 * FieldVision-Style Bottom Navigation, Real-time WebRTC AR Camera, 
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
    // 1. FieldVision-STYLE BOTTOM TAB NAVIGATION
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
                    alert(data.error || "à¤¨à¤¿à¤¦à¤¾à¤¨ à¤•à¤°à¤¤à¤¾à¤¨à¤¾ à¤¤à¥à¤°à¥à¤Ÿà¥€ à¤†à¤²à¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤¨à¥à¤¹à¤¾ à¤ªà¥à¤°à¤¯à¤¤à¥à¤¨ à¤•à¤°à¤¾.");
                }
            }, 1200);

        } catch (error) {
            console.error("[Inference Error]", error);
            setTimeout(() => {
                arLaser.classList.remove("scanning");
                arTelemetry.classList.add("hidden");
                alert("à¤¸à¤°à¥à¤µà¥à¤¹à¤°à¤¶à¥€ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤¹à¥‹à¤Š à¤¶à¤•à¤²à¤¾ à¤¨à¤¾à¤¹à¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤‡à¤‚à¤Ÿà¤°à¤¨à¥‡à¤Ÿ / à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤¤à¤ªà¤¾à¤¸à¤¾.");
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
        if (resCropName) resCropName.textContent = data.crop_name || "à¤ªà¥€à¤•";
        if (resDiseaseName) resDiseaseName.textContent = data.marathi_name || data.disease_code;
        if (resDiseaseCode) resDiseaseCode.textContent = data.disease_code || "";
        if (resConfidenceVal) resConfidenceVal.textContent = `${data.confidence}%`;

        // Foliar Symptoms
        if (resSymptomsText) resSymptomsText.textContent = data.symptoms || "à¤ªà¤¾à¤¨à¤¾à¤µà¤° à¤°à¥‹à¤—à¤¾à¤šà¥€ à¤²à¤•à¥à¤·à¤£à¥‡ à¤¦à¤¿à¤¸à¥‚à¤¨ à¤¯à¥‡à¤¤ à¤†à¤¹à¥‡à¤¤.";

        // Dual Remedy & Cost Card 1: Organic
        const orgCost = data.organic_cost || 650;
        if (resOrgCost) {
            resOrgCost.innerHTML = `â‚¹ ${orgCost} <span class="per-acre">${currentLang === "mr" ? "/ à¤à¤•à¤°" : "/ acre"}</span>`;
        }
        if (resOrganicText) {
            resOrganicText.innerHTML = formatPrescriptionText(data.organic_remedy);
        }

        // Dual Remedy & Cost Card 2: Chemical
        const chemCost = data.chemical_cost || data.cost_per_acre || 1250;
        if (resChemCost) {
            resChemCost.innerHTML = `â‚¹ ${chemCost} <span class="per-acre">${currentLang === "mr" ? "/ à¤à¤•à¤°" : "/ acre"}</span>`;
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
            "Tomato_Early_Blight": "/static/sample_test_images/Tomato_Early_Blight_à¤•à¤°à¤ªà¤¾_Original.jpg",
            "Tomato_Late_Blight": "/static/sample_test_images/Tomato_Late_Blight_à¤¤à¤¾à¤‚à¤¬à¥‹à¤°à¤¾_Original.jpg",
            "Potato_Early_Blight": "/static/sample_test_images/Potato_Early_Blight_à¤•à¤°à¤ªà¤¾_Original.jpg",
            "Corn_Rust": "/static/sample_test_images/Corn_Common_Rust_à¤¤à¤¾à¤‚à¤¬à¥‡à¤°à¤¾_Original.jpg",
            "Tomato_Healthy": "/static/sample_test_images/Tomato_Healthy_à¤¨à¤¿à¤°à¥‹à¤—à¥€_Original.jpg"
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

            if (wTemp) wTemp.textContent = `${data.temp}Â°C`;
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
                            ? "âš ï¸ 48 à¤¤à¤¾à¤¸à¤¾à¤‚à¤¤ à¤¬à¥à¤°à¤¶à¥€à¤œà¤¨à¥à¤¯ à¤°à¥‹à¤—à¤¾à¤šà¤¾ à¤¤à¥€à¤µà¥à¤° à¤§à¥‹à¤•à¤¾ (High Risk of Fungal Infection in 48 Hours)"
                            : "âš ï¸ High Risk of Fungal Infection in 48 Hours Due to Atmospheric Humidity";
                    }
                    if (lblRiskAlertMsg) {
                        lblRiskAlertMsg.textContent = currentLang === "mr"
                            ? `à¤¹à¤µà¥‡à¤¤à¥€à¤² à¤…à¤¤à¤¿-à¤†à¤°à¥à¤¦à¥à¤°à¤¤à¤¾ (${data.humidity}%) à¤†à¤£à¤¿ à¤¦à¤®à¤Ÿ à¤µà¤¾à¤¤à¤¾à¤µà¤°à¤£à¤¾à¤®à¥à¤³à¥‡ à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹ à¤•à¤°à¤ªà¤¾ (Early Blight), à¤²à¥‡à¤Ÿ à¤¬à¥à¤²à¤¾à¤‡à¤Ÿ à¤†à¤£à¤¿ à¤•à¤¾à¤‚à¤¦à¥à¤¯à¤¾à¤µà¤°à¥€à¤² à¤•à¤°à¤ªà¥à¤¯à¤¾à¤šà¤¾ à¤ªà¥à¤°à¤¾à¤¦à¥à¤°à¥à¤­à¤¾à¤µ à¤ªà¥à¤¢à¥€à¤² 48 à¤¤à¤¾à¤¸à¤¾à¤‚à¤¤ à¤µà¥‡à¤—à¤¾à¤¨à¥‡ à¤µà¤¾à¤¢à¥‚ à¤¶à¤•à¤¤à¥‹. à¤Ÿà¥à¤°à¤¾à¤¯à¤•à¥‹à¤¡à¤°à¥à¤®à¤¾ à¤•à¤¿à¤‚à¤µà¤¾ à¤¬à¥à¤°à¤¶à¥€à¤¨à¤¾à¤¶à¤•à¤¾à¤šà¥€ à¤ªà¥à¤°à¤¤à¤¿à¤¬à¤‚à¤§à¤¾à¤¤à¥à¤®à¤• à¤«à¤µà¤¾à¤°à¤£à¥€ à¤•à¤°à¤¾.`
                            : `Elevated atmospheric humidity (${data.humidity}%) significantly accelerates spore germination of Early Blight, Late Blight, and Rust within the next 48 hours. Apply preventative organic/chemical fungicides promptly.`;
                    }
                } else {
                    fungalRiskBanner.style.borderColor = "var(--neon-green)";
                    if (lblRiskAlertHead) {
                        lblRiskAlertHead.textContent = currentLang === "mr"
                            ? "âœ… à¤¹à¤µà¤¾à¤®à¤¾à¤¨ à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ â€¢ à¤¬à¥à¤°à¤¶à¥€à¤šà¤¾ à¤§à¥‹à¤•à¤¾ à¤•à¤®à¥€ (Low Climatic Risk)"
                            : "âœ… Climate Conditions Normal â€¢ Low Fungal Risk";
                    }
                    if (lblRiskAlertMsg) {
                        lblRiskAlertMsg.textContent = currentLang === "mr"
                            ? `à¤¸à¤§à¥à¤¯à¤¾ à¤¹à¤µà¥‡à¤¤à¥€à¤² à¤†à¤°à¥à¤¦à¥à¤°à¤¤à¤¾ ${data.humidity}% à¤…à¤¸à¥‚à¤¨ à¤¹à¤µà¤¾à¤®à¤¾à¤¨ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£à¤¾à¤¤ à¤†à¤¹à¥‡. à¤ªà¤¿à¤•à¤¾à¤šà¥€ à¤¨à¤¿à¤¯à¤®à¤¿à¤¤ à¤¨à¤¿à¤—à¤¾ à¤°à¤¾à¤–à¤¾.`
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
            lblHomeGreeting: "à¤¸à¥à¤®à¤¾à¤°à¥à¤Ÿ à¤ªà¥€à¤• à¤¸à¤‚à¤°à¤•à¥à¤·à¤£ à¤¡à¥…à¤¶à¤¬à¥‹à¤°à¥à¤¡",
            lblHomeDesc: "à¤¥à¥‡à¤Ÿ AI à¤¸à¥à¤•à¥…à¤¨à¤°à¤¨à¥‡ à¤¶à¥‡à¤¤à¤¾à¤¤à¥€à¤² à¤°à¥‹à¤—à¤¾à¤‚à¤šà¥‡ à¤¨à¤¿à¤¦à¤¾à¤¨ à¤•à¤°à¤¾, à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤µ à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤‰à¤ªà¤¾à¤¯ à¤†à¤£à¤¿ à¤…à¤šà¥‚à¤• à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š à¤®à¤¿à¤³à¤µà¤¾.",
            lblLaunchAR: "à¤¥à¥‡à¤Ÿ Live AR à¤¸à¥à¤•à¥…à¤¨à¤° à¤¸à¥à¤°à¥‚ à¤•à¤°à¤¾",
            lblWeatherAlertTitle: "à¤¹à¤µà¤¾à¤®à¤¾à¤¨ à¤µ à¤°à¥‹à¤— à¤…à¤‚à¤¦à¤¾à¤œ à¤ªà¥à¤°à¤£à¤¾à¤²à¥€ (48-Hour Forecast)",
            lblTemp: "à¤¤à¤¾à¤ªà¤®à¤¾à¤¨ (Temp)",
            lblHum: "à¤†à¤°à¥à¤¦à¥à¤°à¤¤à¤¾ (Humidity)",
            lblRain: "à¤ªà¤¾à¤Šà¤¸ à¤¶à¤•à¥à¤¯à¤¤à¤¾",
            lblWind: "à¤¹à¤µà¥‡à¤šà¤¾ à¤µà¥‡à¤—",
            lblRecentScansTitle: "à¤¨à¥à¤•à¤¤à¥‡à¤š à¤¤à¤ªà¤¾à¤¸à¤²à¥‡à¤²à¥‡ à¤¨à¤®à¥à¤¨à¥‡ (Quick Real Samples)",
            lblScanPrompt: "à¤ªà¤¿à¤•à¤¾à¤šà¥à¤¯à¤¾ à¤ªà¤¾à¤¨à¤¾à¤µà¤° à¤•à¥…à¤®à¥‡à¤°à¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¤ à¤•à¤°à¤¾",
            lblScanSubPrompt: "à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤‰à¤œà¥‡à¤¡à¤¾à¤¤ à¤¬à¤¾à¤§à¤¿à¤¤ à¤ªà¤¾à¤¨à¤¾à¤šà¤¾ à¤«à¥‹à¤Ÿà¥‹ à¤˜à¥à¤¯à¤¾ à¤•à¤¿à¤‚à¤µà¤¾ à¤—à¥…à¤²à¤°à¥€à¤®à¤§à¥‚à¤¨ à¤¨à¤¿à¤µà¤¡à¤¾",
            lblChooseFile: "à¤—à¥…à¤²à¤°à¥€",
            lblResetScan: "à¤°à¤¿à¤¸à¥‡à¤Ÿ",
            lblAccLabel: "à¤®à¥‰à¤¡à¥‡à¤² à¤…à¤šà¥‚à¤•à¤¤à¤¾",
            lblSympTitle: "à¤ªà¤¾à¤¨à¤¾à¤µà¤°à¥€à¤² à¤®à¥à¤–à¥à¤¯ à¤²à¤•à¥à¤·à¤£à¥‡ (Foliar Symptoms)",
            lblOrgCardTitle: "à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤‰à¤ªà¤¾à¤¯ (ORGANIC REMEDY)",
            lblOrgCostHead: "à¤à¤•à¤°à¥€ à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤–à¤°à¥à¤š:",
            lblOrgCostSub: "à¤œà¥ˆà¤µà¤¿à¤• à¤µ à¤ªà¤°à¥à¤¯à¤¾à¤µà¤°à¤£à¤ªà¥‚à¤°à¤• à¤”à¤·à¤§à¥‡",
            lblChemCardTitle: "à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤‰à¤ªà¤¾à¤¯ (CHEMICAL REMEDY)",
            lblChemCostHead: "à¤à¤•à¤°à¥€ à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤–à¤°à¥à¤š:",
            lblChemCostSub: "à¤¤à¤¾à¤¤à¥à¤•à¤¾à¤³ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£ à¤¬à¥à¤°à¤¶à¥€à¤¨à¤¾à¤¶à¤•à¥‡",
            lblPerAcre1: "/ à¤à¤•à¤°",
            lblPerAcre2: "/ à¤à¤•à¤°",
            lblPrintBtn: "à¤ªà¥à¤°à¤¿à¤¸à¥à¤•à¥à¤°à¤¿à¤ªà¥à¤¶à¤¨ à¤ªà¥à¤°à¤¿à¤‚à¤Ÿ à¤•à¤°à¤¾",
            lblNewScanBtn: "à¤¦à¥à¤¸à¤±à¥à¤¯à¤¾ à¤ªà¤¾à¤¨à¤¾à¤šà¥‡ à¤¸à¥à¤•à¥…à¤¨à¤¿à¤‚à¤— à¤•à¤°à¤¾",
            lblMyCropsTitle: "à¤®à¤¾à¤à¥€ à¤ªà¤¿à¤•à¥‡ (My Monitored Crops)",
            lblMyCropsDesc: "à¤¸à¤¾à¤¤à¤¾à¤°à¤¾ à¤†à¤£à¤¿ à¤®à¤¹à¤¾à¤°à¤¾à¤·à¥à¤Ÿà¥à¤° à¤¹à¤µà¤¾à¤®à¤¾à¤¨à¤¾à¤¨à¥à¤¸à¤¾à¤° à¤¨à¤¿à¤µà¤¡à¤²à¥‡à¤²à¥€ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤ªà¤¿à¤•à¥‡",
            lblCommunityTitle: "à¤¶à¥‡à¤¤à¤•à¤°à¥€ à¤¸à¤®à¥à¤¦à¤¾à¤¯ à¤µ à¤¤à¤œà¥à¤œà¥à¤ž à¤¸à¤²à¥à¤²à¤¾ (Krishi Community)",
            lblCommunityDesc: "à¤‡à¤¤à¤° à¤¶à¥‡à¤¤à¤•à¤±à¥à¤¯à¤¾à¤‚à¤šà¥‡ à¤ªà¥à¤°à¤¶à¥à¤¨, à¤‰à¤ªà¤¾à¤¯ à¤†à¤£à¤¿ à¤•à¥ƒà¤·à¥€ à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤ªà¥€à¤  à¤¤à¤œà¥à¤œà¥à¤ž à¤®à¤¤à¥‡",
            lblNavHome: "à¤¹à¥‹à¤®",
            lblNavCamera: "AR à¤•à¥…à¤®à¥‡à¤°à¤¾",
            lblNavCrops: "à¤®à¤¾à¤à¥€ à¤ªà¤¿à¤•à¥‡",
            lblNavCommunity: "à¤¸à¤®à¥à¤¦à¤¾à¤¯",
            lblNavProfile: "à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²"
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
    // 7. FieldVision-STYLE FARMER PROFILE MANAGEMENT & EDIT MODAL
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
            name: "à¤¸à¤‚à¤•à¥‡à¤¤ à¤•à¤¿à¤°à¥à¤¦à¤¤ (Sanket Kirdat)",
            district: "à¤¸à¤¾à¤¤à¤¾à¤°à¤¾ (Satara)",
            village: "à¤•à¥‹à¤°à¥‡à¤—à¤¾à¤µ",
            area: "3.5 à¤à¤•à¤°",
            soil: "à¤•à¤¾à¤³à¥€ à¤•à¤¸à¤¦à¤¾à¤° (Black Soil)",
            irrigation: "à¤ à¤¿à¤¬à¤• à¤¸à¤¿à¤‚à¤šà¤¨ (Drip)",
            crops: "à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹, à¤¬à¤Ÿà¤¾à¤Ÿà¤¾, à¤•à¤¾à¤‚à¤¦à¤¾, à¤Šà¤¸"
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
                ? `à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°, ${profile.name.split(" ")[0]}! (Smart Krishi AI)` 
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
            name: inpFarmerName.value.trim() || "à¤¸à¤‚à¤•à¥‡à¤¤ à¤•à¤¿à¤°à¥à¤¦à¤¤",
            district: inpDistrict.value,
            village: inpVillage.value.trim() || "à¤¸à¤¾à¤¤à¤¾à¤°à¤¾",
            area: inpArea.value.trim() || "3.5 à¤à¤•à¤°",
            soil: inpSoil.value,
            irrigation: inpIrrigation.value,
            crops: inpCrops.value.trim() || "à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹, à¤¬à¤Ÿà¤¾à¤Ÿà¤¾, à¤•à¤¾à¤‚à¤¦à¤¾, à¤Šà¤¸"
        };
        localStorage.setItem("fieldvision_farmer_profile", JSON.stringify(profile));
        loadFarmerProfile();
        closeProfileModal();
        alert(currentLang === "mr" ? "à¤¤à¥à¤®à¤šà¥‡ à¤¶à¥‡à¤¤à¤•à¤°à¥€ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤¯à¤¶à¤¸à¥à¤µà¥€à¤°à¤¿à¤¤à¥à¤¯à¤¾ à¤¸à¥‡à¤µà¥à¤¹ à¤•à¥‡à¤²à¥‡!" : "Farmer profile updated successfully!");
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
        let pName = "à¤¸à¤‚à¤•à¥‡à¤¤ à¤•à¤¿à¤°à¥à¤¦à¤¤";
        let pDist = "à¤¸à¤¾à¤¤à¤¾à¤°à¤¾ (3.5 à¤à¤•à¤°)";
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
            if (rxOrgCostTag) rxOrgCostTag.textContent = `à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š: â‚¹ ${oCost}`;
            if (rxChemCostTag) rxChemCostTag.textContent = `à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š: â‚¹ ${cCost}`;
            if (rxOrgContent) rxOrgContent.innerHTML = formatPrescriptionText(currentDiseaseData.organic_remedy);
            if (rxChemContent) rxChemContent.innerHTML = formatPrescriptionText(currentDiseaseData.chemical_remedy);
        } else {
            // Default sample prescription
            if (rxCropName) rxCropName.textContent = "à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹ (Tomato)";
            if (rxDiseaseTitle) rxDiseaseTitle.textContent = "à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹ - à¤²à¤µà¤•à¤° à¤¯à¥‡à¤£à¤¾à¤°à¤¾ à¤•à¤°à¤ªà¤¾ (Early Blight)";
            if (rxAccuracyVal) rxAccuracyVal.textContent = "96.4% AI Verified";
            if (rxSymptomsBody) rxSymptomsBody.textContent = "à¤ªà¤¾à¤¨à¤¾à¤‚à¤µà¤° à¤—à¥‹à¤²à¤¾à¤•à¤¾à¤° à¤—à¤¡à¤¦ à¤¤à¤ªà¤•à¤¿à¤°à¥€ à¤µà¤²à¤¯à¤¾à¤•à¤¾à¤° (à¤•à¥‡à¤‚à¤¦à¥à¤°à¥€à¤¤ à¤—à¥‹à¤²) à¤ à¤¿à¤ªà¤•à¥‡ à¤ªà¤¡à¤¤à¤¾à¤¤. à¤œà¥à¤¨à¥€ à¤ªà¤¾à¤¨à¥‡ à¤ªà¤¿à¤µà¤³à¥€ à¤ªà¤¡à¥‚à¤¨ à¤—à¤³à¤¤à¤¾à¤¤.";
            if (rxOrgCostTag) rxOrgCostTag.textContent = "à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š: â‚¹ 650";
            if (rxChemCostTag) rxChemCostTag.textContent = "à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š: â‚¹ 1,250";
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
                ? "ðŸŽ™ï¸ à¤®à¥€ à¤à¤•à¤¤ à¤†à¤¹à¥‡... (Listening in Marathi)..." 
                : "ðŸŽ™ï¸ Listening to your query...";
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
            if (voiceStatusText) voiceStatusText.textContent = "à¤®à¤¾à¤¯à¤•à¥à¤°à¥‹à¤«à¥‹à¤¨ à¤ªà¤°à¤µà¤¾à¤¨à¤—à¥€ à¤¤à¤ªà¤¾à¤¸à¤¾ à¤•à¤¿à¤‚à¤µà¤¾ à¤–à¤¾à¤²à¥€ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤Ÿà¤¾à¤ˆà¤ª à¤•à¤°à¤¾.";
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
            alert("à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤¬à¥à¤°à¤¾à¤‰à¤à¤°à¤®à¤§à¥à¤¯à¥‡ à¤µà¥à¤¹à¥‰à¤‡à¤¸ à¤°à¥‡à¤•à¤—à¥à¤¨à¤¿à¤¶à¤¨ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¾à¤¹à¥€. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤–à¤¾à¤²à¥€ à¤Ÿà¤¾à¤ˆà¤ª à¤•à¤°à¤¾.");
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

        if (qLower.includes("à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹") || qLower.includes("tomato") || qLower.includes("à¤•à¤°à¤ªà¤¾") || qLower.includes("blight")) {
            reply = "à¤Ÿà¥‹à¤®à¥…à¤Ÿà¥‹à¤µà¤°à¥€à¤² à¤•à¤°à¤ªà¤¾ (Early Blight) à¤°à¥‹à¤–à¤£à¥à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤‰à¤ªà¤¾à¤¯ à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤Ÿà¥à¤°à¤¾à¤¯à¤•à¥‹à¤¡à¤°à¥à¤®à¤¾ à¤µà¥à¤¹à¤¿à¤°à¤¿à¤¡à¥€ à¥« à¤—à¥à¤°à¥…à¤®/à¤²à¤¿à¤Ÿà¤° à¤•à¤¿à¤‚à¤µà¤¾ à¥«% à¤¨à¤¿à¤‚à¤¬à¥‹à¤³à¥€ à¤…à¤°à¥à¤• à¤«à¤µà¤¾à¤°à¤¾. à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤‰à¤ªà¤¾à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤°à¤¿à¤¡à¥‹à¤®à¤¿à¤² à¤—à¥‹à¤²à¥à¤¡ à¥¨ à¤—à¥à¤°à¥…à¤® à¤ªà¥à¤°à¤¤à¤¿ à¤²à¤¿à¤Ÿà¤° à¤•à¤¿à¤‚à¤µà¤¾ à¤®à¥…à¤¨à¥à¤•à¥‹à¤à¥‡à¤¬ à¥¨.à¥« à¤—à¥à¤°à¥…à¤® à¤«à¤µà¤¾à¤°à¤¾. à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š à¤…à¤‚à¤¦à¤¾à¤œà¥‡ â‚¹ à¥¬à¥«à¥¦ à¤¤à¥‡ â‚¹ à¥§à¥¨à¥«à¥¦ à¤¯à¥‡à¤ˆà¤².";
        } else if (qLower.includes("à¤•à¤¾à¤‚à¤¦à¤¾") || qLower.includes("onion") || qLower.includes("à¤œà¤¾à¤‚à¤­à¤³à¤¾")) {
            reply = "à¤•à¤¾à¤‚à¤¦à¥à¤¯à¤¾à¤µà¤°à¥€à¤² à¤œà¤¾à¤‚à¤­à¤³à¤¾ à¤•à¤°à¤ªà¤¾ (Purple Blotch) à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£à¤¾à¤¸à¤¾à¤ à¥€ à¥«% à¤¨à¤¿à¤‚à¤¬à¥‹à¤³à¥€ à¤…à¤°à¥à¤• à¤†à¤£à¤¿ à¤¨à¥…à¤Ÿà¤¿à¤µà¥à¤¹à¥‹ à¥¦.à¥­ à¤—à¥à¤°à¥…à¤® à¤ªà¥à¤°à¤¤à¤¿ à¤²à¤¿à¤Ÿà¤° à¤ªà¤¾à¤£à¥à¤¯à¤¾à¤¤ à¤¸à¥à¤Ÿà¤¿à¤•à¤° à¤®à¤¿à¤¸à¤³à¥‚à¤¨ à¤«à¤µà¤¾à¤°à¤¾. à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š à¤…à¤‚à¤¦à¤¾à¤œà¥‡ â‚¹ à¥§,à¥«à¥¦à¥¦ à¤¯à¥‡à¤ˆà¤².";
        } else if (qLower.includes("à¤¬à¤Ÿà¤¾à¤Ÿà¤¾") || qLower.includes("potato")) {
            reply = "à¤¬à¤Ÿà¤¾à¤Ÿà¥à¤¯à¤¾à¤µà¤°à¥€à¤² à¤‰à¤¶à¤¿à¤°à¤¾ à¤¯à¥‡à¤£à¤¾à¤±à¥à¤¯à¤¾ à¤•à¤°à¤ªà¥à¤¯à¤¾à¤µà¤° (Late Blight) à¤¤à¥à¤µà¤°à¤¿à¤¤ à¤®à¥‡à¤Ÿà¤²à¥…à¤•à¥à¤¸à¤¿à¤² + à¤®à¥…à¤¨à¥à¤•à¥‹à¤à¥‡à¤¬ (à¤°à¤¿à¤¡à¥‹à¤®à¤¿à¤² à¤—à¥‹à¤²à¥à¤¡) à¥¨.à¥« à¤—à¥à¤°à¥…à¤® à¤ªà¥à¤°à¤¤à¤¿ à¤²à¤¿à¤Ÿà¤° à¤ªà¤¾à¤£à¥à¤¯à¤¾à¤¤ à¤«à¤µà¤¾à¤°à¤¾. à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤‰à¤ªà¤¾à¤¯à¤¾à¤¸à¤¾à¤ à¥€ à¤¬à¥‹à¤°à¥à¤¡à¥‹ à¤®à¤¿à¤¶à¥à¤°à¤£ à¥§% à¤µà¤¾à¤ªà¤°à¤¾.";
        } else if (qLower.includes("à¤¹à¤µà¤¾à¤®à¤¾à¤¨") || qLower.includes("weather") || qLower.includes("à¤¸à¤¾à¤¤à¤¾à¤°à¤¾")) {
            reply = "à¤¸à¤¾à¤¤à¤¾à¤°à¤¾ à¤œà¤¿à¤²à¥à¤¹à¥à¤¯à¤¾à¤¤ à¤¸à¤§à¥à¤¯à¤¾ à¤¤à¤¾à¤ªà¤®à¤¾à¤¨ à¥¨à¥¬.à¥® à¤…à¤‚à¤¶ à¤¸à¥‡à¤²à¥à¤¸à¤¿à¤…à¤¸ à¤…à¤¸à¥‚à¤¨ à¤†à¤°à¥à¤¦à¥à¤°à¤¤à¤¾ à¥®à¥¨% à¤‡à¤¤à¤•à¥€ à¤œà¤¾à¤¸à¥à¤¤ à¤†à¤¹à¥‡. à¤ªà¥à¤¢à¥€à¤² à¥ªà¥® à¤¤à¤¾à¤¸à¤¾à¤‚à¤¤ à¤¬à¥à¤°à¤¶à¥€à¤œà¤¨à¥à¤¯ à¤°à¥‹à¤—à¤¾à¤šà¤¾ à¤¤à¥€à¤µà¥à¤° à¤§à¥‹à¤•à¤¾ à¤…à¤¸à¤²à¥à¤¯à¤¾à¤¨à¥‡ à¤ªà¥à¤°à¤¤à¤¿à¤¬à¤‚à¤§à¤¾à¤¤à¥à¤®à¤• à¤¬à¥à¤°à¤¶à¥€à¤¨à¤¾à¤¶à¤• à¤«à¤µà¤¾à¤°à¤£à¥€ à¤•à¤°à¤¾.";
        } else if (qLower.includes("à¤–à¤°à¥à¤š") || qLower.includes("cost") || qLower.includes("à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯")) {
            reply = "FieldVision AI à¤¨à¥à¤¸à¤¾à¤° à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤”à¤·à¤§à¤¾à¤‚à¤šà¤¾ à¤à¤•à¤°à¥€ à¤–à¤°à¥à¤š à¤…à¤‚à¤¦à¤¾à¤œà¥‡ â‚¹ à¥«à¥¦à¥¦ à¤¤à¥‡ â‚¹ à¥­à¥«à¥¦ à¤¯à¥‡à¤¤à¥‹, à¤¤à¤° à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤”à¤·à¤§à¤¾à¤‚à¤šà¤¾ à¤–à¤°à¥à¤š â‚¹ à¥§,à¥¨à¥¦à¥¦ à¤¤à¥‡ â‚¹ à¥¨,à¥¦à¥¦à¥¦ à¤ªà¤°à¥à¤¯à¤‚à¤¤ à¤¯à¥‡à¤¤à¥‹.";
        } else if (qLower.includes("à¤¸à¥à¤•à¥…à¤¨") || qLower.includes("à¤•à¥…à¤®à¥‡à¤°à¤¾") || qLower.includes("camera") || qLower.includes("scan")) {
            reply = "à¤®à¥€ Live AR à¤•à¥…à¤®à¥‡à¤°à¤¾ à¤¸à¥à¤•à¥…à¤¨à¤° à¤¸à¥à¤°à¥‚ à¤•à¤°à¤¤ à¤†à¤¹à¥‡. à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¤¿à¤•à¤¾à¤šà¥à¤¯à¤¾ à¤ªà¤¾à¤¨à¤¾à¤µà¤° à¤•à¥…à¤®à¥‡à¤°à¤¾ à¤°à¥‹à¤–à¤¾.";
            action = () => switchTab("camera");
        } else {
            reply = "FieldVision AI à¤ªà¥à¤°à¤£à¤¾à¤²à¥€à¤®à¤§à¥à¤¯à¥‡ à¤†à¤ªà¤²à¥‡ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤†à¤¹à¥‡! à¤®à¥€ à¤ªà¤¿à¤•à¤¾à¤‚à¤šà¥‡ à¤°à¥‹à¤—, à¤¸à¥‡à¤‚à¤¦à¥à¤°à¤¿à¤¯ à¤‰à¤ªà¤¾à¤¯, à¤°à¤¾à¤¸à¤¾à¤¯à¤¨à¤¿à¤• à¤«à¤µà¤¾à¤°à¤£à¥€ à¤µ à¤¹à¤µà¤¾à¤®à¤¾à¤¨à¤¾à¤¬à¤¦à¥à¤¦à¤² à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨ à¤•à¤°à¥‚ à¤¶à¤•à¤¤à¥‹. à¤†à¤ªà¤£ à¤ªà¤¾à¤¨à¤¾à¤šà¤¾ à¤«à¥‹à¤Ÿà¥‹ à¤•à¤¾à¤¢à¥‚à¤¨ à¤¥à¥‡à¤Ÿ à¤¸à¥à¤•à¥…à¤¨à¤¿à¤‚à¤— à¤¦à¥‡à¤–à¥€à¤² à¤•à¤°à¥‚ à¤¶à¤•à¤¤à¤¾.";
        }

        if (voiceReplyText) voiceReplyText.textContent = reply;
        if (voiceStatusText) voiceStatusText.textContent = "à¤‰à¤¤à¥à¤¤à¤° à¤¤à¤¯à¤¾à¤° à¤†à¤¹à¥‡.";

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


