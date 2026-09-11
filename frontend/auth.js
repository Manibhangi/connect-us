function showLogin() {
    document.getElementById("loginBox").classList.remove("hidden");
    document.getElementById("signupBox").classList.add("hidden");

    document.getElementById("loginTab").classList.add("active");
    document.getElementById("signupTab").classList.remove("active");
}

function showSignup() {
    document.getElementById("signupBox").classList.remove("hidden");
    document.getElementById("loginBox").classList.add("hidden");

    document.getElementById("signupTab").classList.add("active");
    document.getElementById("loginTab").classList.remove("active");
}


// ===============================
// CREATE ACCOUNT
// ===============================

document.getElementById("signupForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const user = {
        name: document.getElementById("signupName").value.trim(),
        phone: document.getElementById("signupPhone").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        location: document.getElementById("signupLocation").value.trim(),
        role: document.getElementById("userRole").value,
        password: document.getElementById("signupPassword").value
    };

    try {

        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed");
            return;
        }

        // SAVE USER INCLUDING MONGODB ID
        localStorage.setItem(
            "connectUsUser",
            JSON.stringify(data.user)
        );

        // SAVE JWT TOKEN
        localStorage.setItem(
            "connectUsToken",
            data.token
        );

        alert("Account created successfully!");

        if (data.user.role === "customer") {
            window.location.href = "customer.html";
        } else {
            window.location.href = "worker.html";
        }

    } catch (error) {

        console.error(error);

        alert("Cannot connect to backend. Make sure server.js is running.");
    }

});


// ===============================
// LOGIN
// ===============================

document.getElementById("loginForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const loginUser =
        document.getElementById("loginUser").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    loginUser,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Invalid email/phone or password"
            );

            return;
        }

        // SAVE USER INCLUDING MONGODB ID
        localStorage.setItem(
            "connectUsUser",
            JSON.stringify(data.user)
        );

        // SAVE TOKEN
        localStorage.setItem(
            "connectUsToken",
            data.token
        );

        alert("Login successful!");

        if (data.user.role === "customer") {

            window.location.href = "customer.html";

        } else {

            window.location.href = "worker.html";

        }

    } catch (error) {

        console.error(error);

        alert(
            "Cannot connect to backend. Make sure server.js is running."
        );
    }

});