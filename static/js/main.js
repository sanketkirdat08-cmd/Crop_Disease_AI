/**
 * Crop Disease AI - Frontend Interactivity & API Integration
 * Handles:
 * - Drag and Drop File Upload
 * - Real-time Image Preview
 * - Laser Scanning Animation
 * - Asynchronous Disease Prediction (/predict)
 * - Dynamic Weather Updates (/api/weather)
 * - Tab Navigation (Organic / Chemical / Symptoms)
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
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
    const dbStatus = document.getElementById("dbStatus");

    let selectedFile = null;

    // 1. File & Camera Selection Triggers
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
        if (!selectedFile) {
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 2. Drag & Drop Handlers
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "var(--neon-cyan)";
    });

    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "rgba(0, 243, 255, 0.35)";
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "rgba(0, 243, 255, 0.35)";
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith("image/")) {
            alert("कृपया फक्त फोटो (Image file) निवडा.");
            return;
        }

        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            dropPlaceholder.classList.add("hidden");
            dropPreview.classList.remove("hidden");
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    removeImgBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function resetUpload() {
        selectedFile = null;
        fileInput.value = "";
        previewImg.src = "";
        dropPreview.classList.add("hidden");
        dropPlaceholder.classList.remove("hidden");
        analyzeBtn.disabled = true;
        dropZone.classList.remove("scanning");
        scanningStatus.classList.add("hidden");
    }

    // 3. Tab Switching
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

    // 4. City Weather Change
    citySelect.addEventListener("change", async () => {
        const selectedCity = citySelect.value;
        try {
            const resp = await fetch(`/api/weather?city=${selectedCity}`);
            if (resp.ok) {
                const data = await resp.json();
                tempDisplay.textContent = `${data.temp}°C`;
                humidityDisplay.textContent = `${data.humidity}%`;
                condDisplay.textContent = data.condition;

                if (data.humidity >= 75) {
                    quickAdviceText.textContent = `दमट हवामानामुळे (${data.humidity}%) बुरशीजन्य रोगांचा प्रादुर्भाव वाढू शकतो. झाडांची वेळोवेळी पाहणी करा.`;
                } else {
                    quickAdviceText.textContent = `हवामान कोरडे असून रोगाचा धोका मर्यादित आहे.`;
                }
            }
        } catch (err) {
            console.error("हवामान अपडेट करताना अडचण आली:", err);
        }
    });

    // 5. Submit Image for Prediction
    analyzeBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

        // Trigger Futuristic Scanning Laser
        dropZone.classList.add("scanning");
        scanningStatus.classList.remove("hidden");
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("city", citySelect.value);

        try {
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            // Simulate realistic scanner sweep delay
            setTimeout(() => {
                dropZone.classList.remove("scanning");
                scanningStatus.classList.add("hidden");
                analyzeBtn.disabled = false;

                if (result.success) {
                    displayResults(result);
                } else {
                    alert(`त्रुटी: ${result.error || "काहीतरी चूक झाली."}`);
                }
            }, 1200);

        } catch (error) {
            dropZone.classList.remove("scanning");
            scanningStatus.classList.add("hidden");
            analyzeBtn.disabled = false;
            console.error("Prediction Error:", error);
            alert("सर्व्हरशी संपर्क होऊ शकला नाही. कृपया Flask सर्व्हर चालू असल्याची खात्री करा.");
        }
    });

    function displayResults(data) {
        idleState.classList.add("hidden");
        activeResults.classList.remove("hidden");

        resCropName.textContent = data.crop_name;
        resMarathiName.textContent = data.marathi_name;
        resDiseaseCode.textContent = data.disease_code;
        resConfidence.textContent = `${data.confidence}%`;
        resCost.innerHTML = `₹ ${data.cost_per_acre.toLocaleString("en-IN")} <span>/ एकर</span>`;

        resOrganic.textContent = data.organic_remedy;
        resChemical.textContent = data.chemical_remedy;
        resSymptoms.textContent = data.symptoms;

        if (data.weather_alert) {
            riskTitle.textContent = data.weather_alert.title;
            riskMessage.textContent = data.weather_alert.message;
        }

        if (data.db_mode && dbStatus) {
            dbStatus.textContent = data.db_mode;
        }

        // Smooth scroll to results on mobile devices
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

