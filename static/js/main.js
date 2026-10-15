/**
 * Crop Disease AI - Frontend Interactivity & Bilingual Logic
 * Developer: Sanket Kirdat
 */

document.addEventListener("DOMContentLoaded", () => {
    // Current Active Language
    let currentLang = "mr";

    // Bilingual Dictionary for Interface Strings
    const translations = {
        mr: {
            hdrSub: "पिकांवरील रोग निदान आणि अचूक कृषी सल्ला प्रणाली",
            lblLiveWeather: "हवामान व रोग जोखीम",
            lblTemp: "तापमान",
            lblHum: "हवेतील आर्द्रता",
            lblCond: "हवामान स्थिती",
            lblUploadHeading: "पानाचा फोटो अपलोड / कॅमेरा",
            lblStep1: "पायरी १",
            lblStep2: "पायरी २",
            lblDropPrompt: "येथे फोटो ड्रॅग करा किंवा कॅमेऱ्याने काढा",
            lblDropTip: "टोमॅटो, बटाटा, मका, द्राक्षे पिकांच्या पानाचा फोटो निवडा",
            lblBrowse: "गॅलरीमधून निवडा",
            lblCam: "📸 थेट कॅमेरा सुरू करा",
            lblScanBtn: "AI रोग स्कॅनिंग सुरू करा",
            lblScanningMsg: "MobileNetV2 द्वारे पानाचे सखोल विश्लेषण चालू आहे...",
            lblQuickTest: "अस्सल चाचणी नमुने (Quick Test):",
            lblResultHeading: "रोग निदान व कृषी सल्ला",
            lblIdleHeading: "कोणताही निकाल उपलब्ध नाही",
            lblIdleText: "कृपया डाव्या बाजूला पिकाच्या पानाचा फोटो अपलोड करा किंवा थेट कॅमेऱ्याने फोटो काढा.",
            lblConf: "अचूकता (Confidence)",
            lblCostTitle: "उपचाराचा एकरी अंदाजे खर्च",
            lblCostSub: "सेंद्रिय व रासायनिक औषधांचा सरासरी खर्च",
            lblPerAcre: "/ एकर",
            tabOrgTitle: "सेंद्रिय उपाय (Organic)",
            tabChemTitle: "रासायनिक फवारणी (Chemical)",
            tabSympTitle: "रोगाची लक्षणे (Symptoms)",
            lblOrgHeader: "पर्यावरणपूरक सेंद्रिय औषधोपचार:",
            lblChemHeader: "तात्काळ नियंत्रणासाठी रासायनिक फवारणी:",
            lblSympHeader: "पानावरील मुख्य लक्षणे व ओळख:",
            lblPrint: "प्रिंट रिपोर्ट",
            lblReset: "नवीन स्कॅन"
        },
        en: {
            hdrSub: "AI-Powered Plant Disease Identification & Precision Agro Advisory",
            lblLiveWeather: "Live Agro-Weather & Risk",
            lblTemp: "Temperature",
            lblHum: "Humidity",
            lblCond: "Condition",
            lblUploadHeading: "Upload Leaf / Mobile Camera",
            lblStep1: "Step 1",
            lblStep2: "Step 2",
            lblDropPrompt: "Drag & drop leaf photo or capture via camera",
            lblDropTip: "Supports Tomato, Potato, Corn, Grape & other crop leaves",
            lblBrowse: "Choose from Files",
            lblCam: "📸 Capture Live Camera",
            lblScanBtn: "Start AI Crop Diagnosis",
            lblScanningMsg: "MobileNetV2 Deep Neural Network Analyzing Specimen...",
            lblQuickTest: "Verified Real Test Samples (Quick Test):",
            lblResultHeading: "Disease Diagnosis & Advisory",
            lblIdleHeading: "No Diagnosis Available Yet",
            lblIdleText: "Please upload or capture a crop leaf image on the left to begin diagnosis.",
            lblConf: "Model Confidence",
            lblCostTitle: "Estimated Treatment Cost",
            lblCostSub: "Average organic and chemical treatment expenditure",
            lblPerAcre: "/ Acre",
            tabOrgTitle: "Organic Remedies",
            tabChemTitle: "Chemical Sprays",
            tabSympTitle: "Diagnostic Symptoms",
            lblOrgHeader: "Certified Bio-Fungicides & Organic Formulations:",
            lblChemHeader: "Chemical Fungicide Dosages for Immediate Control:",
            lblSympHeader: "Key Foliar Symptoms & Field Identification:",
            lblPrint: "Print Summary",
            lblReset: "New Scan"
        }
    };

    // DOM References
    const btnLangMr = document.getElementById("btnLangMr");
    const btnLangEn = document.getElementById("btnLangEn");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const cameraInput = document.getElementById("cameraInput");
    const browseBtn = document.getElementById("browseBtn");
    const cameraBtn = document.getElementById("cameraBtn");
    const dropPlaceholder = document.getElementById("dropPlaceholder");
    const dropPreview = document.getElementById("dropPreview");
    const previewImg = document.getElementById("previewImg");
    const removeImgBtn = document.getElementById("removeImgBtn");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const scanningStatus = document.getElementById("scanningStatus");

    // Weather Elements
    const citySelect = document.getElementById("citySelect");
    const tempDisplay = document.getElementById("tempDisplay");
    const humidityDisplay = document.getElementById("humidityDisplay");
    const condDisplay = document.getElementById("condDisplay");
    const quickAdviceText = document.getElementById("quickAdviceText");

    // Results Elements
    const idleState = document.getElementById("idleState");
    const activeResults = document.getElementById("activeResults");
    const resCropName = document.getElementById("resCropName");
    const resMarathiName = document.getElementById("resMarathiName");
    const resDiseaseCode = document.getElementById("resDiseaseCode");
    const resConfidence = document.getElementById("resConfidence");
    const resCost = document.getElementById("resCost");
    const resOrganic = document.getElementById("resOrganic");
    const resChemical = document.getElementById("resChemical");
    const resSymptoms = document.getElementById("resSymptoms");
    const riskTitle = document.getElementById("riskTitle");
    const riskMessage = document.getElementById("riskMessage");
    const resetBtn = document.getElementById("resetBtn");

    let selectedFile = null;
    let selectedFilename = "";
    let lastResultData = null;

    // 1. Language Toggle Logic
    function applyLanguage(lang) {
        currentLang = lang;
        const dict = translations[lang];

        for (const [id, text] of Object.entries(dict)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = text;
            }
        }

        if (lang === "mr") {
            btnLangMr.classList.add("active");
            btnLangEn.classList.remove("active");
            document.documentElement.lang = "mr";
        } else {
            btnLangEn.classList.add("active");
            btnLangMr.classList.remove("active");
            document.documentElement.lang = "en";
        }

        // Re-render result if already active
        if (lastResultData && selectedFile) {
            triggerAnalysis(true);
        }
    }

    btnLangMr.addEventListener("click", () => applyLanguage("mr"));
    btnLangEn.addEventListener("click", () => applyLanguage("en"));

    // 2. File Selection & Camera
    browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    if (cameraBtn && cameraInput) {
        cameraBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cameraInput.click();
        });

        cameraInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    dropZone.addEventListener("click", () => {
        if (!selectedFile) fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            alert(currentLang === "mr" ? "कृपया फक्त फोटो निवडा." : "Please select an image file.");
            return;
        }

        selectedFile = file;
        selectedFilename = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            dropPlaceholder.classList.add("hidden");
            dropPreview.classList.remove("hidden");
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // 3. Quick Sample Chips
    document.querySelectorAll(".chip-btn").forEach(chip => {
        chip.addEventListener("click", async () => {
            const imgPath = chip.getAttribute("data-img");
            const sampleName = chip.getAttribute("data-name") + ".jpg";
            try {
                const resp = await fetch(imgPath);
                const blob = await resp.blob();
                const file = new File([blob], sampleName, { type: "image/jpeg" });
                handleFile(file);
            } catch (err) {
                console.error("Failed to load sample image:", err);
            }
        });
    });

    removeImgBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function resetUpload() {
        selectedFile = null;
        selectedFilename = "";
        lastResultData = null;
        fileInput.value = "";
        if (cameraInput) cameraInput.value = "";
        previewImg.src = "";
        dropPreview.classList.add("hidden");
        dropPlaceholder.classList.remove("hidden");
        analyzeBtn.disabled = true;
        dropZone.classList.remove("scanning");
        scanningStatus.classList.add("hidden");
    }

    // 4. District Weather Change (Satara Priority)
    citySelect.addEventListener("change", async () => {
        const city = citySelect.value;
        try {
            const resp = await fetch(`/api/weather?city=${city}`);
            if (resp.ok) {
                const data = await resp.json();
                tempDisplay.textContent = `${data.temp}°C`;
                humidityDisplay.textContent = `${data.humidity}%`;
                condDisplay.textContent = (currentLang === "mr") ? data.condition : (data.condition_en || data.condition);

                if (city === "Satara") {
                    quickAdviceText.textContent = (currentLang === "mr") ? 
                        "सातारा / पश्चिम घाट परिसरातील अति-आर्द्रतेमुळे करपा व बुरशीचा प्रादुर्भाव वाढू शकतो." :
                        "Satara / Western Ghats: High moisture levels elevate risk of blight & rhizome rot.";
                } else if (data.humidity >= 75) {
                    quickAdviceText.textContent = (currentLang === "mr") ? 
                        `दमट हवामानामुळे (${data.humidity}%) बुरशीचा प्रादुर्भाव वाढू शकतो. पिकाची पाहणी करा.` :
                        `High humidity (${data.humidity}%). Fungal sporulation risk elevated.`;
                } else {
                    quickAdviceText.textContent = (currentLang === "mr") ? 
                        "हवामान कोरडे असून रोगाचा धोका मर्यादित आहे." :
                        "Favorable dry conditions with low fungal infection pressure.";
                }
            }
        } catch (err) {
            console.error("Weather update error:", err);
        }
    });

    // 5. Tab Switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const target = btn.getAttribute("data-tab");
            const activePane = document.getElementById(`pane-${target}`);
            if (activePane) activePane.classList.add("active");
        });
    });

    // 6. Submit Prediction
    analyzeBtn.addEventListener("click", () => triggerAnalysis(false));

    async function triggerAnalysis(isSilent) {
        if (!selectedFile) return;

        if (!isSilent) {
            dropZone.classList.add("scanning");
            scanningStatus.classList.remove("hidden");
            analyzeBtn.disabled = true;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("city", citySelect.value);
        formData.append("lang", currentLang);

        try {
            const resp = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const result = await resp.json();

            setTimeout(() => {
                dropZone.classList.remove("scanning");
                scanningStatus.classList.add("hidden");
                analyzeBtn.disabled = false;

                if (result.success) {
                    lastResultData = result;
                    displayResults(result);
                } else {
                    alert(result.error || "Analysis error");
                }
            }, isSilent ? 0 : 800);

        } catch (err) {
            dropZone.classList.remove("scanning");
            scanningStatus.classList.add("hidden");
            analyzeBtn.disabled = false;
            console.error("Prediction error:", err);
        }
    }

    function displayResults(data) {
        idleState.classList.add("hidden");
        activeResults.classList.remove("hidden");

        resCropName.textContent = data.crop_name;
        resMarathiName.textContent = data.marathi_name;
        resDiseaseCode.textContent = data.disease_code;
        resConfidence.textContent = `${data.confidence}%`;
        const unitLabel = (currentLang === "mr") ? "/ एकर" : "/ Acre";
        resCost.innerHTML = `₹ ${data.cost_per_acre.toLocaleString("en-IN")} <span id="lblPerAcre">${unitLabel}</span>`;

        resOrganic.textContent = data.organic_remedy;
        resChemical.textContent = data.chemical_remedy;
        resSymptoms.textContent = data.symptoms;

        if (data.weather_alert) {
            riskTitle.textContent = data.weather_alert.title;
            riskMessage.textContent = data.weather_alert.message;
        }

        if (window.innerWidth < 980) {
            activeResults.scrollIntoView({ behavior: "smooth" });
        }
    }

    resetBtn.addEventListener("click", () => {
        resetUpload();
        activeResults.classList.add("hidden");
        idleState.classList.remove("hidden");
    });
});
