"use strict";

const API_URL = "http://localhost:5000/api";

let resetEmail = "";
let resetOtp = "";
let registrationEmail = "";

/* =====================================================
   TRANSLATION
===================================================== */

function authText(key, fallback) {
    try {
        if (typeof window.t === "function") {
            const translated = window.t(key);

            if (translated && translated !== key) {
                return translated;
            }
        }
    } catch (error) {
        console.warn("Translation error:", error);
    }

    return fallback;
}

/* =====================================================
   MESSAGE HELPERS
===================================================== */

function showMessage(elementId, message, type = "error") {
    let element = document.getElementById(elementId);

    if (!element) {
        const activeSection = document.querySelector(
            ".auth-section:not(.hidden)"
        );

        if (!activeSection) return;

        element = document.createElement("div");
        element.id = elementId;
        element.className = "message";

        activeSection.appendChild(element);
    }

    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = "block";
}

function hideMessage(elementId) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = "";
    element.style.display = "none";
}

/* =====================================================
   FIELD ERROR HELPERS
===================================================== */

function createFieldError(inputId, errorId) {
    let error = document.getElementById(errorId);

    if (error) return error;

    const input = document.getElementById(inputId);

    if (!input) return null;

    error = document.createElement("div");
    error.id = errorId;
    error.className = "field-error";

    error.style.cssText = `
        margin-top: 7px;
        color: #d93025;
        font-size: 13px;
        line-height: 1.4;
    `;

    input.insertAdjacentElement("afterend", error);

    return error;
}

function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = createFieldError(inputId, errorId);

    if (input) {
        input.setAttribute("aria-invalid", "true");
        input.style.borderColor = "#d93025";
    }

    if (error) {
        error.textContent = message;
        error.style.display = "block";
    }
}

function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input) {
        input.removeAttribute("aria-invalid");
        input.style.borderColor = "";
    }

    if (error) {
        error.textContent = "";
        error.style.display = "none";
    }
}

/* =====================================================
   VALIDATION
===================================================== */

function normalizeEmail(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function isValidEmail(value) {
    const email = normalizeEmail(value);

    if (!email) return false;

    /*
      Normal practical email validation.
      Allows:
      name@gmail.com
      name123@gmail.com
      first.last@company.co.in
    */
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    if (email.includes("..")) {
        return false;
    }

    const [localPart, domainPart] = email.split("@");

    if (!localPart || !domainPart) {
        return false;
    }

    if (
        localPart.startsWith(".") ||
        localPart.endsWith(".")
    ) {
        return false;
    }

    return true;
}

function isValidIndianPhone(value) {
    const phone = String(value || "").trim();

    /*
      Exactly 10 digits
      Starts with 6, 7, 8 or 9
    */
    return /^[6-9][0-9]{9}$/.test(phone);
}

/* =====================================================
   RESPONSE HELPER
===================================================== */

async function readResponse(response) {
    const text = await response.text();

    if (!text) {
        return {
            success: false,
            message: "Server returned an empty response."
        };
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Invalid JSON response:", text);

        return {
            success: false,
            message: "Server returned an invalid response."
        };
    }
}

/* =====================================================
   HIDE ALL AUTH SECTIONS
===================================================== */

function hideAllAuthSections() {
    const sectionIds = [
        "loginForm",
        "signupForm",
        "forgotForm",
        "otpForm",
        "resetForm"
    ];

    sectionIds.forEach((id) => {
        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }
    });

    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    if (loginTab) {
        loginTab.classList.remove("active");
    }

    if (signupTab) {
        signupTab.classList.remove("active");
    }
}

/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {
    hideAllAuthSections();

    const loginForm = document.getElementById("loginForm");
    const loginTab = document.getElementById("loginTab");

    if (loginForm) {
        loginForm.classList.remove("hidden");
    }

    if (loginTab) {
        loginTab.classList.add("active");
    }

    hideMessage("loginMessage");

    clearFieldError(
        "loginEmail",
        "loginEmailError"
    );

    clearFieldError(
        "loginPassword",
        "loginPasswordError"
    );
}

/* =====================================================
   SHOW SIGNUP
===================================================== */

function showSignup() {
    hideAllAuthSections();

    const signupForm = document.getElementById("signupForm");
    const signupTab = document.getElementById("signupTab");

    if (signupForm) {
        signupForm.classList.remove("hidden");
    }

    if (signupTab) {
        signupTab.classList.add("active");
    }

    hideMessage("signupMessage");

    clearFieldError(
        "signupName",
        "signupNameError"
    );

    clearFieldError(
        "signupEmail",
        "signupEmailError"
    );

    clearFieldError(
        "signupPhone",
        "signupPhoneError"
    );

    clearFieldError(
        "signupRole",
        "signupRoleError"
    );

    clearFieldError(
        "signupPassword",
        "signupPasswordError"
    );

    clearFieldError(
        "termsCheckbox",
        "termsCheckboxError"
    );
}

/* =====================================================
   SHOW FORGOT PASSWORD
===================================================== */

function showForgotPassword() {
    hideAllAuthSections();

    const forgotForm = document.getElementById("forgotForm");

    if (forgotForm) {
        forgotForm.classList.remove("hidden");
    }

    hideMessage("forgotMessage");
}

/* =====================================================
   PASSWORD TOGGLE
===================================================== */

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";

        if (button) {
            button.textContent = authText(
                "ui.hide",
                "Hide"
            );
        }
    } else {
        input.type = "password";

        if (button) {
            button.textContent = authText(
                "ui.show",
                "Show"
            );
        }
    }
}

/* =====================================================
   REGISTRATION ERRORS
===================================================== */

function registrationFieldError(
    inputId,
    errorId,
    message
) {
    showFieldError(
        inputId,
        errorId,
        message
    );
}

function clearRegistrationFieldError(
    inputId,
    errorId
) {
    clearFieldError(
        inputId,
        errorId
    );
}

function clearAllRegistrationErrors() {
    clearRegistrationFieldError(
        "signupName",
        "signupNameError"
    );

    clearRegistrationFieldError(
        "signupEmail",
        "signupEmailError"
    );

    clearRegistrationFieldError(
        "signupPhone",
        "signupPhoneError"
    );

    clearRegistrationFieldError(
        "signupRole",
        "signupRoleError"
    );

    clearRegistrationFieldError(
        "signupPassword",
        "signupPasswordError"
    );

    clearRegistrationFieldError(
        "termsCheckbox",
        "termsCheckboxError"
    );
}

/* =====================================================
   REGISTRATION OTP BOX
===================================================== */

function ensureRegistrationOtpBox() {
    const signupSection =
        document.getElementById("signupForm");

    if (!signupSection) {
        return null;
    }

    let box =
        document.getElementById(
            "registrationOtpBox"
        );

    if (box) {
        return box;
    }

    box = document.createElement("div");

    box.id = "registrationOtpBox";

    box.style.cssText = `
        display: none;
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid rgba(0,0,0,.10);
    `;

    box.innerHTML = `
        <label
            for="registrationOtpInput"
            style="
                display:block;
                margin-bottom:6px;
            "
        >
            Email verification OTP
        </label>

        <p
            style="
                margin:6px 0 10px;
                font-size:13px;
                line-height:1.5;
            "
        >
            Enter the 6-digit OTP sent to
            <strong id="registrationOtpEmail"></strong>.
        </p>

        <input
            id="registrationOtpInput"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="Enter 6-digit OTP"
        >

        <div
            id="registrationOtpError"
            style="
                display:none;
                margin-top:7px;
                color:#d93025;
                font-size:13px;
                line-height:1.4;
            "
        ></div>

        <div
            style="
                display:flex;
                gap:10px;
                margin-top:12px;
                flex-wrap:wrap;
            "
        >
            <button
                type="button"
                class="main-btn"
                id="verifyRegistrationOtpButton"
                onclick="verifyRegistrationOtp(event)"
            >
                Verify OTP
                <span>→</span>
            </button>

            <button
                type="button"
                id="resendRegistrationOtpButton"
                onclick="resendRegistrationOtp(event)"
                style="
                    border:none;
                    background:transparent;
                    cursor:pointer;
                    padding:10px;
                "
            >
                Resend OTP
            </button>
        </div>

        <div
            id="registrationOtpStatus"
            style="
                display:none;
                margin-top:8px;
                font-size:13px;
            "
        ></div>
    `;

    const form =
        signupSection.querySelector("form");

    if (form) {
        form.appendChild(box);
    } else {
        signupSection.appendChild(box);
    }

    const otpInput =
        document.getElementById(
            "registrationOtpInput"
        );

    if (otpInput) {
        otpInput.addEventListener(
            "input",
            function () {
                this.value = this.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                const error =
                    document.getElementById(
                        "registrationOtpError"
                    );

                if (error) {
                    error.textContent = "";
                    error.style.display = "none";
                }
            }
        );
    }

    return box;
}

function showRegistrationOtpBox() {
    const box = ensureRegistrationOtpBox();

    if (!box) return;

    const emailElement =
        document.getElementById(
            "registrationOtpEmail"
        );

    if (emailElement) {
        emailElement.textContent =
            registrationEmail;
    }

    box.style.display = "block";

    const status =
        document.getElementById(
            "registrationOtpStatus"
        );

    if (status) {
        status.textContent =
            "OTP sent successfully. Please check your email. The OTP is valid for 10 minutes.";

        status.style.color = "#168044";
        status.style.display = "block";
    }

    const otpInput =
        document.getElementById(
            "registrationOtpInput"
        );

    if (otpInput) {
        otpInput.value = "";
        otpInput.focus();
    }
}

function hideRegistrationOtpBox() {
    const box =
        document.getElementById(
            "registrationOtpBox"
        );

    if (box) {
        box.style.display = "none";
    }
}

/* =====================================================
   SIGNUP / CREATE ACCOUNT
===================================================== */

async function signupUser(event) {
    if (event) {
        event.preventDefault();
    }

    clearAllRegistrationErrors();
    hideMessage("signupMessage");

    const nameInput =
        document.getElementById("signupName");

    const emailInput =
        document.getElementById("signupEmail");

    const phoneInput =
        document.getElementById("signupPhone");

    const roleInput =
        document.getElementById("signupRole");

    const passwordInput =
        document.getElementById("signupPassword");

    const termsInput =
        document.getElementById("termsCheckbox");

    const name =
        nameInput?.value?.trim() || "";

    const email =
        normalizeEmail(
            emailInput?.value || ""
        );

    const phone =
        String(
            phoneInput?.value || ""
        ).trim();

    const role =
        roleInput?.value || "";

    const password =
        passwordInput?.value || "";

    const terms =
        termsInput
            ? termsInput.checked
            : false;

    let valid = true;

    /* NAME */

    if (!name) {
        registrationFieldError(
            "signupName",
            "signupNameError",
            "Please enter your full name."
        );

        valid = false;
    }

    /* EMAIL */

    if (!email) {
        registrationFieldError(
            "signupEmail",
            "signupEmailError",
            "Please enter your email address."
        );

        valid = false;

    } else if (!isValidEmail(email)) {
        registrationFieldError(
            "signupEmail",
            "signupEmailError",
            "Please enter a valid email address."
        );

        valid = false;
    }

    /* PHONE */

    if (!phone) {
        registrationFieldError(
            "signupPhone",
            "signupPhoneError",
            "Please enter your phone number."
        );

        valid = false;

    } else if (!isValidIndianPhone(phone)) {
        registrationFieldError(
            "signupPhone",
            "signupPhoneError",
            "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
        );

        valid = false;
    }

    /* ROLE */

    if (!role) {
        registrationFieldError(
            "signupRole",
            "signupRoleError",
            "Please select an account type."
        );

        valid = false;

    } else if (
        !["customer", "worker"].includes(role)
    ) {
        registrationFieldError(
            "signupRole",
            "signupRoleError",
            "Please select a valid account type."
        );

        valid = false;
    }

    /* PASSWORD */

    if (!password) {
        registrationFieldError(
            "signupPassword",
            "signupPasswordError",
            "Please enter a password."
        );

        valid = false;

    } else if (password.length < 6) {
        registrationFieldError(
            "signupPassword",
            "signupPasswordError",
            "Password must contain at least 6 characters."
        );

        valid = false;
    }

    /* TERMS */

    if (!terms) {
        registrationFieldError(
            "termsCheckbox",
            "termsCheckboxError",
            "Please accept the Terms and Privacy Policy."
        );

        valid = false;
    }

    if (!valid) {
        return false;
    }

    const signupButton =
        document.querySelector(
            '#signupForm button[type="submit"]'
        );

    if (signupButton) {
        signupButton.disabled = true;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password,
                        role
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            const message =
                data.message ||
                "Unable to start registration.";

            const lower =
                String(message).toLowerCase();

            /* DUPLICATE EMAIL */

            if (
                lower.includes("email") &&
                (
                    lower.includes("already") ||
                    lower.includes("exists") ||
                    lower.includes("registered")
                )
            ) {
                registrationFieldError(
                    "signupEmail",
                    "signupEmailError",
                    "This email is already registered. Please use another email or log in."
                );

                return false;
            }

            /* DUPLICATE PHONE */

            if (
                lower.includes("phone") &&
                (
                    lower.includes("already") ||
                    lower.includes("exists") ||
                    lower.includes("registered")
                )
            ) {
                registrationFieldError(
                    "signupPhone",
                    "signupPhoneError",
                    "This phone number is already registered. Please use another number or log in."
                );

                return false;
            }

            /* EMAIL ERROR */

            if (lower.includes("email")) {
                registrationFieldError(
                    "signupEmail",
                    "signupEmailError",
                    message
                );

                return false;
            }

            /* PHONE ERROR */

            if (lower.includes("phone")) {
                registrationFieldError(
                    "signupPhone",
                    "signupPhoneError",
                    message
                );

                return false;
            }

            showMessage(
                "signupMessage",
                message,
                "error"
            );

            return false;
        }

        /*
          IMPORTANT:
          Backend should NOT create the User here.

          Backend should:
          1. Validate details
          2. Check duplicate email
          3. Check duplicate phone
          4. Save pending registration
          5. Generate secure 6-digit OTP
          6. Hash OTP
          7. Expire OTP after 10 minutes
          8. Send OTP to real email
        */

        registrationEmail = email;

        localStorage.setItem(
            "connectUsPendingRegistration",
            JSON.stringify({
                email: email
            })
        );

        showMessage(
            "signupMessage",
            data.message ||
                "OTP sent successfully. Please verify your email.",
            "success"
        );

        showRegistrationOtpBox();

        return false;

    } catch (error) {
        console.error(
            "SIGNUP ERROR:",
            error
        );

        showMessage(
            "signupMessage",
            "Unable to connect to the server. Please try again.",
            "error"
        );

        return false;

    } finally {
        if (signupButton) {
            signupButton.disabled = false;
        }
    }
}

/* =====================================================
   VERIFY REGISTRATION OTP
===================================================== */

async function verifyRegistrationOtp(event) {
    if (event) {
        event.preventDefault();
    }

    const otpInput =
        document.getElementById(
            "registrationOtpInput"
        );

    const otp =
        otpInput?.value?.trim() || "";

    const error =
        document.getElementById(
            "registrationOtpError"
        );

    if (error) {
        error.textContent = "";
        error.style.display = "none";
    }

    if (!/^[0-9]{6}$/.test(otp)) {
        if (error) {
            error.textContent =
                "Please enter the 6-digit OTP.";

            error.style.display = "block";
        }

        return false;
    }

    if (!registrationEmail) {
        try {
            const saved =
                localStorage.getItem(
                    "connectUsPendingRegistration"
                );

            registrationEmail =
                saved
                    ? JSON.parse(saved).email
                    : "";
        } catch (error) {
            registrationEmail = "";
        }
    }

    if (!registrationEmail) {
        showMessage(
            "signupMessage",
            "Registration session expired. Please start again.",
            "error"
        );

        return false;
    }

    const verifyButton =
        document.getElementById(
            "verifyRegistrationOtpButton"
        );

    if (verifyButton) {
        verifyButton.disabled = true;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/verify-registration-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email:
                            registrationEmail,

                        otp
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            if (error) {
                error.textContent =
                    data.message ||
                    "Invalid OTP.";

                error.style.display =
                    "block";
            }

            return false;
        }

        if (
            !data.token ||
            !data.user
        ) {
            showMessage(
                "signupMessage",
                "Registration response is incomplete. Please try again.",
                "error"
            );

            return false;
        }

        localStorage.removeItem(
            "connectUsPendingRegistration"
        );

        localStorage.removeItem(
            "connectUsToken"
        );

        localStorage.removeItem(
            "connectUsUser"
        );

        localStorage.setItem(
            "connectUsToken",
            data.token
        );

        localStorage.setItem(
            "connectUsUser",
            JSON.stringify(data.user)
        );

        hideRegistrationOtpBox();

        redirectUser(data.user);

        return false;

    } catch (error) {
        console.error(
            "REGISTRATION OTP ERROR:",
            error
        );

        showMessage(
            "signupMessage",
            "Unable to connect to the server. Please try again.",
            "error"
        );

        return false;

    } finally {
        if (verifyButton) {
            verifyButton.disabled = false;
        }
    }
}

/* =====================================================
   RESEND REGISTRATION OTP
===================================================== */

async function resendRegistrationOtp(event) {
    if (event) {
        event.preventDefault();
    }

    if (!registrationEmail) {
        try {
            const saved =
                localStorage.getItem(
                    "connectUsPendingRegistration"
                );

            registrationEmail =
                saved
                    ? JSON.parse(saved).email
                    : "";
        } catch (error) {
            registrationEmail = "";
        }
    }

    if (!registrationEmail) {
        showMessage(
            "signupMessage",
            "Registration session expired. Please start again.",
            "error"
        );

        return false;
    }

    const button =
        document.getElementById(
            "resendRegistrationOtpButton"
        );

    const status =
        document.getElementById(
            "registrationOtpStatus"
        );

    if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/resend-registration-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email:
                            registrationEmail
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            if (status) {
                status.textContent =
                    data.message ||
                    "Unable to resend OTP.";

                status.style.color =
                    "#d93025";

                status.style.display =
                    "block";
            }

            return false;
        }

        if (status) {
            status.textContent =
                "A new OTP has been sent to your email.";

            status.style.color =
                "#168044";

            status.style.display =
                "block";
        }

        const otpInput =
            document.getElementById(
                "registrationOtpInput"
            );

        if (otpInput) {
            otpInput.value = "";
            otpInput.focus();
        }

        return false;

    } catch (error) {
        console.error(
            "RESEND REGISTRATION OTP ERROR:",
            error
        );

        if (status) {
            status.textContent =
                "Unable to connect to the server. Please try again.";

            status.style.color =
                "#d93025";

            status.style.display =
                "block";
        }

        return false;

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Resend OTP";
        }
    }
}

/* =====================================================
   REGISTRATION INPUT HANDLERS
===================================================== */

function setupRegistrationValidation() {
    ensureRegistrationOtpBox();

    const phoneInput =
        document.getElementById(
            "signupPhone"
        );

    if (phoneInput) {
        phoneInput.addEventListener(
            "input",
            function () {
                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                clearRegistrationFieldError(
                    "signupPhone",
                    "signupPhoneError"
                );
            }
        );
    }

    const emailInput =
        document.getElementById(
            "signupEmail"
        );

    if (emailInput) {
        emailInput.addEventListener(
            "input",
            function () {
                clearRegistrationFieldError(
                    "signupEmail",
                    "signupEmailError"
                );
            }
        );

        emailInput.addEventListener(
            "blur",
            function () {
                const email =
                    normalizeEmail(
                        this.value
                    );

                if (
                    email &&
                    !isValidEmail(email)
                ) {
                    registrationFieldError(
                        "signupEmail",
                        "signupEmailError",
                        "Please enter a valid email address."
                    );
                }
            }
        );
    }

    const nameInput =
        document.getElementById(
            "signupName"
        );

    if (nameInput) {
        nameInput.addEventListener(
            "input",
            function () {
                clearRegistrationFieldError(
                    "signupName",
                    "signupNameError"
                );
            }
        );
    }

    const roleInput =
        document.getElementById(
            "signupRole"
        );

    if (roleInput) {
        roleInput.addEventListener(
            "change",
            function () {
                clearRegistrationFieldError(
                    "signupRole",
                    "signupRoleError"
                );
            }
        );
    }

    const passwordInput =
        document.getElementById(
            "signupPassword"
        );

    if (passwordInput) {
        passwordInput.addEventListener(
            "input",
            function () {
                clearRegistrationFieldError(
                    "signupPassword",
                    "signupPasswordError"
                );
            }
        );
    }

    const termsInput =
        document.getElementById(
            "termsCheckbox"
        );

    if (termsInput) {
        termsInput.addEventListener(
            "change",
            function () {
                clearRegistrationFieldError(
                    "termsCheckbox",
                    "termsCheckboxError"
                );
            }
        );
    }
}

/* =====================================================
   LOGIN
===================================================== */

async function loginUser(event) {
    if (event) {
        event.preventDefault();
    }

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    const email =
        normalizeEmail(
            emailInput?.value || ""
        );

    const password =
        passwordInput?.value || "";

    clearFieldError(
        "loginEmail",
        "loginEmailError"
    );

    clearFieldError(
        "loginPassword",
        "loginPasswordError"
    );

    hideMessage("loginMessage");

    /* EMPTY */

    if (!email && !password) {
        showMessage(
            "loginMessage",
            "Please enter your email and password.",
            "error"
        );

        return false;
    }

    if (!email) {
        showFieldError(
            "loginEmail",
            "loginEmailError",
            "Please enter your email."
        );

        emailInput?.focus();

        return false;
    }

    if (!password) {
        showFieldError(
            "loginPassword",
            "loginPasswordError",
            "Please enter your password."
        );

        passwordInput?.focus();

        return false;
    }

    /* EMAIL */

    if (!isValidEmail(email)) {
        showFieldError(
            "loginEmail",
            "loginEmailError",
            "Please enter a valid email address."
        );

        emailInput?.focus();

        return false;
    }

    try {
        showMessage(
            "loginMessage",
            "Logging in...",
            "success"
        );

        const response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            const message =
                data.message ||
                "Unable to login. Please try again.";

            if (
                message ===
                "Email address is not registered."
            ) {
                showFieldError(
                    "loginEmail",
                    "loginEmailError",
                    "Email address is not registered."
                );

                emailInput?.focus();

                return false;
            }

            if (
                message ===
                "Incorrect password."
            ) {
                showFieldError(
                    "loginPassword",
                    "loginPasswordError",
                    "Incorrect password."
                );

                passwordInput?.focus();
                passwordInput?.select();

                return false;
            }

            if (
                message.toLowerCase().includes("email")
            ) {
                showFieldError(
                    "loginEmail",
                    "loginEmailError",
                    message
                );

                return false;
            }

            showMessage(
                "loginMessage",
                message,
                "error"
            );

            return false;
        }

        if (
            !data.token ||
            !data.user
        ) {
            showMessage(
                "loginMessage",
                "Login response is incomplete. Please try again.",
                "error"
            );

            return false;
        }

        localStorage.removeItem(
            "connectUsToken"
        );

        localStorage.removeItem(
            "connectUsUser"
        );

        localStorage.setItem(
            "connectUsToken",
            data.token
        );

        localStorage.setItem(
            "connectUsUser",
            JSON.stringify(data.user)
        );

        redirectUser(data.user);

        return false;

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        showMessage(
            "loginMessage",
            "Unable to connect to the server. Please try again.",
            "error"
        );

        return false;
    }
}

/* =====================================================
   FORGOT PASSWORD - SEND OTP
===================================================== */

async function sendOtp(event) {
    if (event) {
        event.preventDefault();
    }

    const email =
        normalizeEmail(
            document.getElementById(
                "forgotEmail"
            )?.value || ""
        );

    hideMessage("forgotMessage");

    if (!email) {
        showMessage(
            "forgotMessage",
            "Enter your registered email.",
            "error"
        );

        return false;
    }

    if (!isValidEmail(email)) {
        showMessage(
            "forgotMessage",
            "Please enter a valid email address.",
            "error"
        );

        return false;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            showMessage(
                "forgotMessage",
                data.message ||
                    "Unable to generate OTP.",
                "error"
            );

            return false;
        }

        resetEmail = email;

        showMessage(
            "forgotMessage",
            data.message ||
                "OTP sent successfully to your email.",
            "success"
        );

        hideAllAuthSections();

        document
            .getElementById("otpForm")
            ?.classList.remove("hidden");

        return false;

    } catch (error) {
        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        showMessage(
            "forgotMessage",
            "Unable to connect to the server.",
            "error"
        );

        return false;
    }
}

/* =====================================================
   FORGOT PASSWORD - VERIFY OTP
===================================================== */

async function verifyOtpUser(event) {
    if (event) {
        event.preventDefault();
    }

    const otp =
        document
            .getElementById("otpInput")
            ?.value
            .trim() || "";

    if (!/^[0-9]{6}$/.test(otp)) {
        showMessage(
            "otpMessage",
            "Enter a valid 6-digit OTP.",
            "error"
        );

        return false;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/verify-otp`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: resetEmail,
                        otp
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            showMessage(
                "otpMessage",
                data.message ||
                    "Invalid OTP.",
                "error"
            );

            return false;
        }

        resetOtp = otp;

        showMessage(
            "otpMessage",
            data.message ||
                "OTP verified successfully.",
            "success"
        );

        hideAllAuthSections();

        document
            .getElementById("resetForm")
            ?.classList.remove("hidden");

        return false;

    } catch (error) {
        console.error(
            "OTP VERIFICATION ERROR:",
            error
        );

        showMessage(
            "otpMessage",
            "Unable to verify OTP.",
            "error"
        );

        return false;
    }
}

/* =====================================================
   RESET PASSWORD
===================================================== */

async function resetPasswordUser(event) {
    if (event) {
        event.preventDefault();
    }

    const newPassword =
        document
            .getElementById(
                "newPassword"
            )
            ?.value || "";

    const confirmPassword =
        document
            .getElementById(
                "confirmPassword"
            )
            ?.value || "";

    if (newPassword.length < 6) {
        showMessage(
            "resetMessage",
            "Password must contain at least 6 characters.",
            "error"
        );

        return false;
    }

    if (
        newPassword !==
        confirmPassword
    ) {
        showMessage(
            "resetMessage",
            "Passwords do not match.",
            "error"
        );

        return false;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: resetEmail,
                        otp: resetOtp,
                        newPassword
                    })
                }
            );

        const data =
            await readResponse(response);

        if (
            !response.ok ||
            !data.success
        ) {
            showMessage(
                "resetMessage",
                data.message ||
                    "Unable to reset password.",
                "error"
            );

            return false;
        }

        showMessage(
            "resetMessage",
            data.message ||
                "Password reset successfully. Please login.",
            "success"
        );

        resetEmail = "";
        resetOtp = "";

        const otpInput =
            document.getElementById(
                "otpInput"
            );

        const newPasswordInput =
            document.getElementById(
                "newPassword"
            );

        const confirmPasswordInput =
            document.getElementById(
                "confirmPassword"
            );

        if (otpInput) {
            otpInput.value = "";
        }

        if (newPasswordInput) {
            newPasswordInput.value = "";
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.value = "";
        }

        setTimeout(
            showLogin,
            1000
        );

        return false;

    } catch (error) {
        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        showMessage(
            "resetMessage",
            "Unable to connect to the server.",
            "error"
        );

        return false;
    }
}

/* =====================================================
   REDIRECT
===================================================== */

function redirectUser(user) {
    if (!user) {
        showMessage(
            "loginMessage",
            "User information is missing.",
            "error"
        );

        return;
    }

    if (user.role === "worker") {
        window.location.href =
            "worker.html";

        return;
    }

    if (user.role === "customer") {
        window.location.href =
            "customer.html";

        return;
    }

    showMessage(
        "loginMessage",
        "User role is missing.",
        "error"
    );
}

/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {
    localStorage.removeItem(
        "connectUsToken"
    );

    localStorage.removeItem(
        "connectUsUser"
    );

    localStorage.removeItem(
        "connectUsPendingRegistration"
    );

    window.location.href =
        "auth.html";
}

/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const params =
            new URLSearchParams(
                window.location.search
            );

        if (
            params.get("mode") ===
            "signup"
        ) {
            showSignup();
        } else {
            showLogin();
        }

        const loginForm =
            document.querySelector(
                "#loginForm form"
            );

        if (loginForm) {
            loginForm.noValidate = true;
            loginForm.addEventListener(
                "submit",
                loginUser
            );
        }

        const signupForm =
            document.querySelector(
                "#signupForm form"
            );

        if (signupForm) {
            signupForm.noValidate = true;
            signupForm.addEventListener(
                "submit",
                signupUser
            );
        }

        const forgotForm =
            document.querySelector(
                "#forgotForm form"
            );

        if (forgotForm) {
            forgotForm.noValidate = true;
            forgotForm.addEventListener(
                "submit",
                sendOtp
            );
        }

        const otpForm =
            document.querySelector(
                "#otpForm form"
            );

        if (otpForm) {
            otpForm.noValidate = true;
            otpForm.addEventListener(
                "submit",
                verifyOtpUser
            );
        }

        const resetForm =
            document.querySelector(
                "#resetForm form"
            );

        if (resetForm) {
            resetForm.noValidate = true;
            resetForm.addEventListener(
                "submit",
                resetPasswordUser
            );
        }

        setupRegistrationValidation();
    },
    {
        once: true
    }
);