/* =====================================================
   CONNECT US - MAIN SCRIPT
   ===================================================== */


/* ================= SETTINGS ================= */

function openSettings() {
    const overlay = document.getElementById("settingsOverlay");

    if (overlay) {
        overlay.classList.add("show");
    }
}


function closeSettings() {
    const overlay = document.getElementById("settingsOverlay");

    if (overlay) {
        overlay.classList.remove("show");
    }
}


/* ================= DARK MODE ================= */

function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");

    const toggle =
        document.getElementById("darkModeToggle");

    const enabled =
        document.body.classList.contains("dark-mode");

    if (toggle) {
        toggle.checked = enabled;
    }

    localStorage.setItem(
        "connectUsDarkMode",
        enabled ? "true" : "false"
    );
}


/* ================= LIGHT MODE ================= */

function setLightMode() {

    document.body.classList.remove("dark-mode");

    const toggle =
        document.getElementById("darkModeToggle");

    if (toggle) {
        toggle.checked = false;
    }

    localStorage.setItem(
        "connectUsDarkMode",
        "false"
    );
}


/* ================= EYE PROTECTOR ================= */

function toggleEyeProtector() {

    document.body.classList.toggle(
        "eye-protector"
    );

    const toggle =
        document.getElementById(
            "eyeProtectorToggle"
        );

    const enabled =
        document.body.classList.contains(
            "eye-protector"
        );

    if (toggle) {
        toggle.checked = enabled;
    }

    localStorage.setItem(
        "connectUsEye",
        enabled ? "true" : "false"
    );
}


/* ================= LANGUAGE ================= */

function changeLanguage() {

    const languageSelect =
        document.getElementById(
            "languageSelect"
        );

    if (!languageSelect) {
        return;
    }

    const language =
        languageSelect.value;

    localStorage.setItem(
        "connectUsLanguage",
        language
    );

    if (language === "english") {
        location.reload();
        return;
    }


    const translations = {

        kannada: {

            "Home": "ಮುಖಪುಟ",
            "Services": "ಸೇವೆಗಳು",
            "About": "ನಮ್ಮ ಬಗ್ಗೆ",

            "Find Help.": "ಸಹಾಯ ಹುಡುಕಿ.",
            "Find Work.": "ಕೆಲಸ ಹುಡುಕಿ.",

            "Find a Service":
                "ಸೇವೆಯನ್ನು ಹುಡುಕಿ",

            "Find Jobs":
                "ಕೆಲಸ ಹುಡುಕಿ",

            "Services You Can Trust":
                "ನಂಬಬಹುದಾದ ಸೇವೆಗಳು"

        },


        hindi: {

            "Home": "होम",
            "Services": "सेवाएं",
            "About": "हमारे बारे में",

            "Find Help.": "मदद खोजें.",
            "Find Work.": "काम खोजें.",

            "Find a Service":
                "सेवा खोजें",

            "Find Jobs":
                "नौकरी खोजें",

            "Services You Can Trust":
                "विश्वसनीय सेवाएं"

        },


        telugu: {

            "Home": "హోమ్",
            "Services": "సేవలు",
            "About": "మా గురించి",

            "Find Help.":
                "సహాయం కనుగొనండి.",

            "Find Work.":
                "పని కనుగొనండి.",

            "Find a Service":
                "సేవను కనుగొనండి",

            "Find Jobs":
                "ఉద్యోగాలు కనుగొనండి",

            "Services You Can Trust":
                "నమ్మదగిన సేవలు"

        },


        tamil: {

            "Home": "முகப்பு",
            "Services": "சேவைகள்",
            "About": "எங்களை பற்றி",

            "Find Help.":
                "உதவியைத் தேடுங்கள்.",

            "Find Work.":
                "வேலையைத் தேடுங்கள்.",

            "Find a Service":
                "சேவையைத் தேடுங்கள்",

            "Find Jobs":
                "வேலைகளைத் தேடுங்கள்",

            "Services You Can Trust":
                "நம்பகமான சேவைகள்"

        },


        marathi: {

            "Home": "मुख्यपृष्ठ",
            "Services": "सेवा",
            "About": "आमच्याबद्दल",

            "Find Help.":
                "मदत शोधा.",

            "Find Work.":
                "काम शोधा.",

            "Find a Service":
                "सेवा शोधा",

            "Find Jobs":
                "नोकऱ्या शोधा",

            "Services You Can Trust":
                "विश्वासार्ह सेवा"

        }

    };


    const selected =
        translations[language];

    if (!selected) {
        return;
    }


    const elements =
        document.querySelectorAll(
            "a, h1, h2, h3, p, span, button"
        );


    elements.forEach(element => {

        const text =
            element.textContent.trim();

        if (selected[text]) {

            element.textContent =
                selected[text];

        }

    });
}


/* ================= SERVICE SELECTION ================= */

function selectService(service) {

    console.log(
        "Selected service:",
        service
    );

    localStorage.setItem(
        "selectedService",
        service
    );

    localStorage.setItem(
        "userType",
        "customer"
    );

    /*
       Open the existing customer dashboard.
    */

    window.location.href =
        "customer.html";
}


/* ================= HOME SEARCH ================= */

function searchFromHome() {

    const input =
        document.getElementById(
            "homeSearch"
        );

    if (!input) {
        return;
    }

    const service =
        input.value.trim();

    if (service === "") {

        alert(
            "Please enter a service."
        );

        return;
    }


    localStorage.setItem(
        "selectedService",
        service
    );

    localStorage.setItem(
        "userType",
        "customer"
    );


    window.location.href =
        "customer.html";
}


/* ================= CUSTOMER BUTTON ================= */

function openCustomer() {

    localStorage.setItem(
        "userType",
        "customer"
    );

    window.location.href =
        "auth.html";
}


/* ================= WORKER BUTTON ================= */

function openWorker() {

    localStorage.setItem(
        "userType",
        "worker"
    );

    window.location.href =
        "auth.html";
}


/* ================= CLOSE SETTINGS OUTSIDE ================= */

document.addEventListener(
    "click",
    function (event) {

        const overlay =
            document.getElementById(
                "settingsOverlay"
            );

        const box =
            document.querySelector(
                ".settings-box"
            );

        const button =
            document.querySelector(
                ".menu-btn"
            );

        if (!overlay || !box) {
            return;
        }

        if (
            overlay.classList.contains("show") &&
            !box.contains(event.target) &&
            !button?.contains(event.target)
        ) {

            closeSettings();

        }

    }
);


/* ================= LOAD SETTINGS ================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* DARK MODE */

        const darkMode =
            localStorage.getItem(
                "connectUsDarkMode"
            );

        const darkToggle =
            document.getElementById(
                "darkModeToggle"
            );

        if (darkMode === "true") {

            document.body.classList.add(
                "dark-mode"
            );

            if (darkToggle) {
                darkToggle.checked = true;
            }

        }


        /* EYE PROTECTOR */

        const eyeMode =
            localStorage.getItem(
                "connectUsEye"
            );

        const eyeToggle =
            document.getElementById(
                "eyeProtectorToggle"
            );

        if (eyeMode === "true") {

            document.body.classList.add(
                "eye-protector"
            );

            if (eyeToggle) {
                eyeToggle.checked = true;
            }

        }


        /* LANGUAGE */

        const savedLanguage =
            localStorage.getItem(
                "connectUsLanguage"
            );

        const languageSelect =
            document.getElementById(
                "languageSelect"
            );

        if (
            savedLanguage &&
            languageSelect
        ) {

            languageSelect.value =
                savedLanguage;

        }

    }
);