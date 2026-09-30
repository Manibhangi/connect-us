/* =========================================
   CONNECT US - CUSTOMER
========================================= */

const API_URL = "http://localhost:5000/api";

let allServices = [];
let allJobs = [];


/* =========================================
   AUTH
========================================= */

function getToken() {
    return localStorage.getItem("connectUsToken");
}


function getUser() {
    try {
        return JSON.parse(
            localStorage.getItem("connectUsUser")
        );
    } catch (error) {
        console.error("GET USER ERROR:", error);
        return null;
    }
}


function getCustomerId() {

    const user = getUser();

    if (!user) {
        return null;
    }

    return (
        user.id ||
        user._id ||
        user.userId ||
        null
    );
}


function authHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token || ""}`
    };
}


/* =========================================
   CHECK LOGIN
========================================= */

function checkAuthentication() {

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        window.location.href = "auth.html";
        return false;
    }

    if (user.role === "worker") {
        window.location.href = "worker.html";
        return false;
    }

    return true;
}


/* =========================================
   USER INFO
========================================= */

function loadUserInfo() {

    const user = getUser();

    if (!user) {
        return;
    }

    const name =
        user.name || "User";

    const email =
        user.email || "user@example.com";

    const phone =
        user.phone || "Phone not available";


    const welcomeName =
        document.getElementById("welcomeName");

    const topUserName =
        document.getElementById("topUserName");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileNameInput =
        document.getElementById("profileNameInput");

    const profileEmailInput =
        document.getElementById("profileEmailInput");

    const profilePhoneInput =
        document.getElementById("profilePhoneInput");

    const topAvatar =
        document.getElementById("topAvatar");

    const profileAvatar =
        document.getElementById("profileAvatar");


    if (welcomeName) {
        welcomeName.textContent =
            name.split(" ")[0];
    }

    if (topUserName) {
        topUserName.textContent =
            name;
    }

    if (profileName) {
        profileName.textContent =
            name;
    }

    if (profileEmail) {
        profileEmail.textContent =
            email;
    }

    if (profilePhone) {
        profilePhone.textContent =
            phone;
    }

    if (profileNameInput) {
        profileNameInput.value =
            name;
    }

    if (profileEmailInput) {
        profileEmailInput.value =
            email;
    }

    if (profilePhoneInput) {
        profilePhoneInput.value =
            user.phone || "";
    }


    const initial =
        name.charAt(0).toUpperCase();


    if (topAvatar) {
        topAvatar.textContent =
            initial;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            initial;
    }
}


/* =========================================
   NAVIGATION
========================================= */

function showSection(sectionId, button) {

    document
        .querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active");
        });


    const section =
        document.getElementById(sectionId);


    if (section) {
        section.classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });


    if (button) {
        button.classList.add("active");
    }


    document
        .getElementById("sidebar")
        ?.classList.remove("open");


    if (sectionId === "findServices") {
        loadServices();
    }

    if (sectionId === "myJobs") {
        loadMyJobs();
    }

    if (sectionId === "requests") {
        loadMyJobs();
    }
}


function showSectionByName(sectionId) {

    const button =
        document.querySelector(
            `.nav-item[onclick*="${sectionId}"]`
        );


    showSection(
        sectionId,
        button
    );
}


/* =========================================
   SIDEBAR
========================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    sidebar?.classList.toggle("open");
}


/* =========================================
   SERVICES
========================================= */

async function loadServices() {

    const grid =
        document.getElementById("servicesGrid");

    if (!grid) {
        return;
    }


    grid.innerHTML = `
        <div class="loading">
            Loading services...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/services`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load services."
            );
        }


        allServices =
            data.services || [];


        renderServices(
            allServices
        );


    } catch (error) {

        console.error(
            "LOAD SERVICES ERROR:",
            error
        );


        grid.innerHTML = `
            <div class="empty-state">

                <div>⚠️</div>

                <h3>
                    Unable to load services
                </h3>

                <p>
                    Make sure your backend is running.
                </p>

            </div>
        `;
    }
}


/* =========================================
   RENDER SERVICES
========================================= */

function renderServices(services) {

    const grid =
        document.getElementById(
            "servicesGrid"
        );


    if (!grid) {
        return;
    }


    if (!services.length) {

        grid.innerHTML = `
            <div class="empty-state">

                <div>🔎</div>

                <h3>
                    No services found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>
        `;

        return;
    }


    grid.innerHTML =
        services
            .map(service => {

                const icon =
                    getServiceIcon(
                        service.category
                    );


                const price =
                    Number(
                        service.price || 0
                    );


                const description =
                    service.description ||
                    "Professional local service.";


                return `

                    <div class="service-card">

                        <div class="service-top">

                            <div class="service-icon">
                                ${icon}
                            </div>

                            <span class="available">
                                Available
                            </span>

                        </div>


                        <h3>
                            ${escapeHtml(
                                service.name
                            )}
                        </h3>


                        <div class="service-category">
                            ${escapeHtml(
                                service.category
                            )}
                        </div>


                        <p class="service-description">
                            ${escapeHtml(
                                description
                            )}
                        </p>


                        <div class="service-bottom">

                            <div class="service-price">

                                ${
                                    price > 0
                                        ? `₹${price}`
                                        : "Contact for price"
                                }

                            </div>


                            <button
                                type="button"
                                class="service-contact"
                                onclick="requestService('${service._id}')"
                            >
                                Request
                            </button>

                        </div>

                    </div>

                `;
            })
            .join("");
}


/* =========================================
   SERVICE ICON
========================================= */

function getServiceIcon(category) {

    const icons = {

        "Home Services": "🏠",
        "Electrician": "⚡",
        "Plumber": "🔧",
        "Mechanic": "🔩",
        "Carpenter": "🪚",
        "Cleaner": "🧹",
        "Painter": "🎨",
        "Other": "🛠️"

    };


    return (
        icons[category] ||
        "🛠️"
    );
}


/* =========================================
   SEARCH
========================================= */

function searchServices() {

    const searchInput =
        document.getElementById(
            "serviceSearch"
        );


    const globalInput =
        document.getElementById(
            "globalSearch"
        );


    const search =
        (
            searchInput?.value ||
            globalInput?.value ||
            ""
        )
        .toLowerCase()
        .trim();


    const category =
        document.getElementById(
            "categoryFilter"
        )?.value || "";


    const filtered =
        allServices.filter(
            service => {

                const name =
                    String(
                        service.name || ""
                    )
                    .toLowerCase();


                const serviceCategory =
                    String(
                        service.category || ""
                    )
                    .toLowerCase();


                const description =
                    String(
                        service.description || ""
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    serviceCategory.includes(search) ||
                    description.includes(search);


                const matchesCategory =
                    !category ||
                    service.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );


    renderServices(
        filtered
    );
}


function filterServices() {
    searchServices();
}


function filterCategory(category) {

    showSectionByName(
        "findServices"
    );


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    if (filter) {
        filter.value =
            category;
    }


    searchServices();
}


/* =========================================
   REQUEST SERVICE
========================================= */

function requestService(serviceId) {

    const service =
        allServices.find(
            item =>
                item._id === serviceId
        );


    if (!service) {
        return;
    }


    const jobTitle =
        document.getElementById(
            "jobTitle"
        );


    const jobCategory =
        document.getElementById(
            "jobCategory"
        );


    const jobDescription =
        document.getElementById(
            "jobDescription"
        );


    if (jobTitle) {

        jobTitle.value =
            service.name ||
            "";
    }


    if (jobCategory) {

        jobCategory.value =
            service.category ||
            "";
    }


    if (jobDescription) {

        jobDescription.value =
            `I would like to request the "${service.name}" service.`;
    }


    openJobModal();
}


/* =========================================
   JOB MODAL
========================================= */

function openJobModal() {

    document
        .getElementById("jobModal")
        ?.classList.add("show");
}


function closeJobModal() {

    document
        .getElementById("jobModal")
        ?.classList.remove("show");
}


/* =========================================
   POST JOB
========================================= */

async function postJob(event) {

    event.preventDefault();


    const user =
        getUser();


    if (!user) {

        alert(
            "Please login again."
        );

        logoutUser();

        return;
    }


    const customerId =
        user.id ||
        user._id ||
        user.userId;


    if (!customerId) {

        console.error(
            "USER OBJECT:",
            user
        );


        alert(
            "Customer account information is missing. Please login again."
        );

        return;
    }


    const titleElement =
        document.getElementById(
            "jobTitle"
        );


    const categoryElement =
        document.getElementById(
            "jobCategory"
        );


    const descriptionElement =
        document.getElementById(
            "jobDescription"
        );


    const locationElement =
        document.getElementById(
            "jobLocation"
        );


    const budgetElement =
        document.getElementById(
            "jobBudget"
        );


    const title =
        titleElement?.value
            ?.trim() || "";


    const category =
        categoryElement?.value
            ?.trim() || "";


    const description =
        descriptionElement?.value
            ?.trim() || "";


    const location =
        locationElement?.value
            ?.trim() || "";


    const budget =
        budgetElement?.value
            ?.trim() || "0";


    /* =========================================
       VALIDATION
    ========================================= */

    if (!title) {

        alert(
            "Please enter the job title."
        );

        return;
    }


    if (!category) {

        alert(
            "Please select a category."
        );

        return;
    }


    if (!description) {

        alert(
            "Please enter the job description."
        );

        return;
    }


    if (!location) {

        alert(
            "Please enter your location."
        );

        return;
    }


    /* =========================================
       BACKEND DATA
    ========================================= */

    const jobData = {

        customer:
            customerId,

        service:
            title,

        description:
            description,

        location:
            location,

        budget:
            Number(budget) || 0

    };


    console.log(
        "SENDING JOB:",
        jobData
    );


    try {

        const response =
            await fetch(
                `${API_URL}/jobs`,
                {
                    method: "POST",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify(
                            jobData
                        )
                }
            );


        const data =
            await response.json();


        console.log(
            "JOB RESPONSE:",
            data
        );


        /* =========================================
           SESSION EXPIRED
        ========================================= */

        if (
            response.status === 401
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            logoutUser();

            return;
        }


        /* =========================================
           BACKEND ERROR
        ========================================= */

        if (!response.ok) {

            alert(
                data.message ||
                "Unable to post job."
            );

            return;
        }


        /* =========================================
           SUCCESS
        ========================================= */

        alert(
            "Job posted successfully! ✅"
        );


        closeJobModal();


        document
            .querySelector(
                "#jobModal form"
            )
            ?.reset();


        await loadMyJobs();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "POST JOB ERROR:",
            error
        );


        alert(
            "Unable to connect to the server."
        );
    }
}


/* =========================================
   LOAD MY JOBS
========================================= */

async function loadMyJobs() {

    const customerId =
        getCustomerId();


    if (!customerId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/jobs/my?customer=${encodeURIComponent(customerId)}`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (
            response.status === 401
        ) {

            logoutUser();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load jobs."
            );
        }


        allJobs =
            data.jobs || [];


        renderJobs();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "LOAD MY JOBS ERROR:",
            error
        );


        const container =
            document.getElementById(
                "myJobsContainer"
            );


        const legacyContainer =
            document.getElementById(
                "myJobs"
            );


        const errorHtml = `

            <div class="empty-state">

                <div>⚠️</div>

                <h3>
                    Unable to load jobs
                </h3>

                <p>
                    Check that your backend and job routes are running.
                </p>

            </div>

        `;


        if (container) {
            container.innerHTML =
                errorHtml;
        }


        if (legacyContainer) {
            legacyContainer.innerHTML =
                errorHtml;
        }
    }
}


/* =========================================
   RENDER JOBS
========================================= */

function renderJobs() {

    const container =
        document.getElementById(
            "myJobsContainer"
        );


    const legacyContainer =
        document.getElementById(
            "myJobs"
        );


    const recent =
        document.getElementById(
            "recentJobs"
        );


    /* =========================================
       NO JOBS
    ========================================= */

    if (!allJobs.length) {

        const emptyHtml = `

            <div class="empty-state">

                <div>📋</div>

                <h3>
                    No jobs yet
                </h3>

                <p>
                    Post your first job and connect with a professional.
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="openJobModal()"
                >
                    Post a Job
                </button>

            </div>

        `;


        if (container) {
            container.innerHTML =
                emptyHtml;
        }


        if (legacyContainer) {
            legacyContainer.innerHTML =
                emptyHtml;
        }


        if (recent) {
            recent.innerHTML =
                emptyHtml;
        }


        return;
    }


    /* =========================================
       MAIN JOBS
    ========================================= */

    const html =
        allJobs
            .map(job => {

                const serviceName =
                    job.service ||
                    job.title ||
                    "Service";


                const status =
                    job.status ||
                    "pending";


                const location =
                    job.location ||
                    "Not specified";


                const description =
                    job.description ||
                    "No description provided.";


                const budget =
                    Number(
                        job.budget || 0
                    );


                return `

                    <div class="job-card">

                        <div>

                            <h3>
                                ${escapeHtml(
                                    serviceName
                                )}
                            </h3>


                            <p>
                                <strong>
                                    Service:
                                </strong>

                                ${escapeHtml(
                                    serviceName
                                )}
                            </p>


                            <p>
                                <strong>
                                    Location:
                                </strong>

                                ${escapeHtml(
                                    location
                                )}
                            </p>


                            <p>
                                ${escapeHtml(
                                    description
                                )}
                            </p>


                            <p>
                                <strong>
                                    Budget:
                                </strong>

                                ₹${budget}
                            </p>


                            ${
                                job.worker
                                    ? `

                                        <p>
                                            <strong>
                                                Worker:
                                            </strong>

                                            ${escapeHtml(
                                                job.worker.name ||
                                                "Worker"
                                            )}
                                        </p>

                                    `
                                    : ""
                            }

                        </div>


                        <span class="job-status">
                            ${escapeHtml(
                                status
                            )}
                        </span>

                    </div>

                `;

            })
            .join("");


    if (container) {

        container.innerHTML =
            html;
    }


    if (legacyContainer) {

        legacyContainer.innerHTML =
            html;
    }


    /* =========================================
       RECENT JOBS
    ========================================= */

    if (recent) {

        recent.innerHTML =
            allJobs
                .slice(0, 3)
                .map(job => {

                    const serviceName =
                        job.service ||
                        job.title ||
                        "Service";


                    return `

                        <div class="job-card">

                            <div>

                                <h3>
                                    ${escapeHtml(
                                        serviceName
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        job.location ||
                                        ""
                                    )}
                                </p>

                            </div>


                            <span class="job-status">
                                ${escapeHtml(
                                    job.status ||
                                    "pending"
                                )}
                            </span>

                        </div>

                    `;
                })
                .join("");
    }
}


/* =========================================
   DASHBOARD STATS
========================================= */

function updateDashboardStats() {

    const total =
        allJobs.length;


    const pending =
        allJobs.filter(
            job => {

                const status =
                    String(
                        job.status ||
                        "pending"
                    )
                    .toLowerCase();


                return (
                    status === "pending" ||
                    status === "requested"
                );
            }
        )
        .length;


    const completed =
        allJobs.filter(
            job => {

                return (
                    String(
                        job.status ||
                        ""
                    )
                    .toLowerCase() ===
                    "completed"
                );
            }
        )
        .length;


    const totalJobs =
        document.getElementById(
            "totalJobs"
        );


    const pendingJobs =
        document.getElementById(
            "pendingJobs"
        );


    const completedJobs =
        document.getElementById(
            "completedJobs"
        );


    const servicesUsed =
        document.getElementById(
            "servicesUsed"
        );


    if (totalJobs) {
        totalJobs.textContent =
            total;
    }


    if (pendingJobs) {
        pendingJobs.textContent =
            pending;
    }


    if (completedJobs) {
        completedJobs.textContent =
            completed;
    }


    if (servicesUsed) {
        servicesUsed.textContent =
            total;
    }
}


/* =========================================
   PROFILE
========================================= */

async function updateProfile(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "profileNameInput"
            )
            ?.value
            ?.trim() || "";


    const email =
        document
            .getElementById(
                "profileEmailInput"
            )
            ?.value
            ?.trim() || "";


    const phone =
        document
            .getElementById(
                "profilePhoneInput"
            )
            ?.value
            ?.trim() || "";


    if (!name || !email) {

        alert(
            "Name and email are required."
        );

        return;
    }


    const user =
        getUser() || {};


    const updatedUser = {

        ...user,

        name:
            name,

        email:
            email,

        phone:
            phone

    };


    localStorage.setItem(
        "connectUsUser",
        JSON.stringify(
            updatedUser
        )
    );


    loadUserInfo();


    alert(
        "Profile updated successfully."
    );
}


/* =========================================
   SETTINGS
========================================= */

function openSettings() {

    document
        .getElementById(
            "settingsOverlay"
        )
        ?.classList.add("show");
}


function closeSettings() {

    document
        .getElementById(
            "settingsOverlay"
        )
        ?.classList.remove("show");
}


function toggleDarkMode() {

    const toggle =
        document.getElementById(
            "darkModeToggle"
        );


    const enabled =
        toggle?.checked || false;


    document.body.classList.toggle(
        "dark",
        enabled
    );


    localStorage.setItem(
        "connectUsDarkMode",
        String(enabled)
    );
}


function loadDarkMode() {

    const enabled =
        localStorage.getItem(
            "connectUsDarkMode"
        ) === "true";


    document.body.classList.toggle(
        "dark",
        enabled
    );


    const toggle =
        document.getElementById(
            "darkModeToggle"
        );


    if (toggle) {
        toggle.checked =
            enabled;
    }
}


/* =========================================
   NOTIFICATIONS
========================================= */

function showNotifications() {

    alert(
        "No new notifications."
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


    window.location.href =
        "auth.html";
}


/* =========================================
   HTML SECURITY
========================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );
}


/* =========================================
   SAFE JOB TEXT
========================================= */

function escapeJobText(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );
}


/* =========================================
   GLOBAL SEARCH
========================================= */

function setupGlobalSearch() {

    const searchInputs = [

        document.getElementById(
            "globalSearch"
        ),

        document.getElementById(
            "serviceSearch"
        )

    ]
    .filter(Boolean);


    searchInputs.forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    const value =
                        input.value
                            .trim()
                            .toLowerCase();


                    searchInputs
                        .forEach(
                            otherInput => {

                                if (
                                    otherInput !==
                                    input
                                ) {

                                    otherInput.value =
                                        input.value;
                                }
                            }
                        );


                    if (value) {

                        showSectionByName(
                            "findServices"
                        );
                    }


                    const filtered =
                        allServices.filter(
                            service => {

                                const name =
                                    String(
                                        service.name ||
                                        ""
                                    )
                                    .toLowerCase();


                                const category =
                                    String(
                                        service.category ||
                                        ""
                                    )
                                    .toLowerCase();


                                const description =
                                    String(
                                        service.description ||
                                        ""
                                    )
                                    .toLowerCase();


                                return (
                                    name.includes(value) ||
                                    category.includes(value) ||
                                    description.includes(value)
                                );
                            }
                        );


                    renderServices(
                        filtered
                    );
                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        showSectionByName(
                            "findServices"
                        );

                        searchServices();
                    }
                }
            );
        }
    );
}


/* =========================================
   START APPLICATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (
            !checkAuthentication()
        ) {
            return;
        }


        loadUserInfo();

        loadDarkMode();

        setupGlobalSearch();


        await loadServices();

        await loadMyJobs();

    }
);