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

        const response = await fetch(
            "https://connect-us-br0m.onrender.com/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Save login information
        localStorage.setItem("token", data.token);
        localStorage.setItem("connectUsUser", JSON.stringify(data.user));

        alert("Account created successfully!");

        // Redirect according to role
        if (data.user.role === "customer") {
            window.location.href = "customer.html";
        } else {
            window.location.href = "worker.html";
        }

    } catch (error) {

        console.error(error);

        alert(
            "Cannot connect to the server. Make sure the backend is running."
        );
    }
});


// ===============================
// LOGIN
// ===============================

document.getElementById("loginForm").addEventListener("submit", async function (event) {

    event.preventDefault();

    const loginData = {
        loginUser: document.getElementById("loginUser").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    try {

        const response = await fetch(
            "https://connect-us-br0m.onrender.com/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Save token and user information
        localStorage.setItem("token", data.token);
        localStorage.setItem("connectUsUser", JSON.stringify(data.user));

        alert("Login successful!");

        // Redirect according to role
        if (data.user.role === "customer") {
            window.location.href = "customer.html";
        } else {
            window.location.href = "worker.html";
        }

    } catch (error) {

        console.error(error);

        alert(
            "Cannot connect to the server. Make sure the backend is running."
        );
    }
});