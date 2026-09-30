/* =========================================
   CONNECT US - MAIN SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       MOBILE MENU
    =============================== */

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const mobileNav =
        document.getElementById("mobileNav");

    if (menuButton && mobileNav) {

        menuButton.addEventListener("click", () => {

            mobileNav.classList.toggle("show");

        });

    }


    /* ===============================
       CLOSE MOBILE MENU
    =============================== */

    document.querySelectorAll(".mobile-nav a")
        .forEach(link => {

            link.addEventListener("click", () => {

                mobileNav?.classList.remove("show");

            });

        });


    /* ===============================
       ENTER KEY SEARCH
    =============================== */

    const searchInput =
        document.getElementById("serviceSearch");

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    startSearch();

                }

            }
        );

    }

});


/* =========================================
   SET SEARCH
========================================= */

function setSearch(service) {

    const input =
        document.getElementById("serviceSearch");

    if (!input) return;

    input.value = service;

    input.focus();

}


/* =========================================
   SEARCH
========================================= */

function startSearch() {

    const input =
        document.getElementById("serviceSearch");

    const service =
        input?.value.trim();


    if (!service) {

        alert(
            "Please enter the service you are looking for."
        );

        input?.focus();

        return;
    }


    /*
       Authentication will be required before
       accessing actual service results.
    */

    const encodedService =
        encodeURIComponent(service);

    window.location.href =
        `auth.html?mode=login&service=${encodedService}`;

}


/* =========================================
   LOCATION
========================================= */

function setLocation(location) {

    const locationText =
        document.getElementById("locationText");

    if (locationText) {

        locationText.textContent =
            location;

    }

}


/* =========================================
   AUTH CHECK
========================================= */

function isLoggedIn() {

    return Boolean(
        localStorage.getItem("connectUsToken")
    );

}


/* =========================================
   LOGOUT
========================================= */

function logoutUser() {

    localStorage.removeItem(
        "connectUsToken"
    );

    localStorage.removeItem(
        "connectUsUser"
    );

    window.location.href = "index.html";

}