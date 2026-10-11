/* =========================================
   CONNECT US - CUSTOMER DASHBOARD
========================================= */

const API_URL = "https://connect-us-1-dq8a.onrender.com/api";

let allServices = [];
let allJobs = [];

/* AUTHENTICATION */

function getToken() {
    return localStorage.getItem("connectUsToken");
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("connectUsUser"));
    } catch (error) {
        console.error("GET USER ERROR:", error);
        return null;
    }
}

function getCustomerId() {
    const user = getUser();
    return user ? user.id || user._id || user.userId || null : null;
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken() || ""}`
    };
}

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

/* USER INFORMATION */

function loadUserInfo() {
    const user = getUser();
    if (!user) return;

    const name = user.name || "User";
    const email = user.email || "";
    const phone = user.phone || "";

    const fields = {
        welcomeName: name.split(" ")[0],
        topUserName: name,
        profileName: name,
        profileEmail: email,
        profilePhone: phone,
        profileNameInput: name,
        profileEmailInput: email,
        profilePhoneInput: phone,
        topAvatar: name.charAt(0).toUpperCase(),
        profileAvatar: name.charAt(0).toUpperCase()
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if ("value" in element) {
            element.value = value;
        } else {
            element.textContent = value;
        }
    });
}

/* NAVIGATION */

function showSection(sectionId, button) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId)?.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    button?.classList.add("active");
    document.getElementById("sidebar")?.classList.remove("open");

    if (sectionId === "findServices") loadServices();
    if (sectionId === "myJobs" || sectionId === "requests") loadMyJobs();
}

function showSectionByName(sectionId) {
    const button = document.querySelector(
        `.nav-item[onclick*="${sectionId}"]`
    );
    showSection(sectionId, button);
}

function toggleSidebar() {
    document.getElementById("sidebar")?.classList.toggle("open");
}

/* SERVICE CATEGORIES */

function normalizeCategory(category) {
    const value = String(category || "Other").trim().toLowerCase();

    const categories = {
        "home": "Home Services",
        "home service": "Home Services",
        "home services": "Home Services",
        "electrician": "Electrician",
        "electrical": "Electrician",
        "plumber": "Plumber",
        "plumbing": "Plumber",
        "mechanic": "Mechanic",
        "carpenter": "Carpenter",
        "cleaner": "Cleaner",
        "cleaning": "Cleaner",
        "house cleaning": "Cleaner",
        "painter": "Painter",
        "painting": "Painter",
        "other": "Other"
    };

    return categories[value] || category || "Other";
}

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

    return icons[normalizeCategory(category)] || "🛠️";
}

/* FALLBACK CATALOGUE
   These are display examples, not verified worker listings.
*/

function getDefaultServices() {
    return [
        {
            _id: "default-home",
            name: "Home Services",
            category: "Home Services",
            description: "General household assistance.",
            price: 0
        },
        {
            _id: "default-electrician",
            name: "Electrician",
            category: "Electrician",
            description: "Electrical repair and installation requests.",
            price: 0
        },
        {
            _id: "default-plumber",
            name: "Plumber",
            category: "Plumber",
            description: "Plumbing repairs and maintenance.",
            price: 0
        },
        {
            _id: "default-mechanic",
            name: "Mechanic",
            category: "Mechanic",
            description: "Vehicle repair and maintenance requests.",
            price: 0
        },
        {
            _id: "default-carpenter",
            name: "Carpenter",
            category: "Carpenter",
            description: "Furniture and woodwork services.",
            price: 0
        },
        {
            _id: "default-cleaner",
            name: "House Cleaning",
            category: "Cleaner",
            description: "House cleaning and shifting assistance.",
            price: 0
        },
        {
            _id: "default-painter",
            name: "Painter",
            category: "Painter",
            description: "Home painting and related work.",
            price: 0
        }
    ];
}

/* LOAD SERVICES */

async function loadServices() {
    const grid = document.getElementById("servicesGrid");
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading services...</div>';

    try {
        const response = await fetch(`${API_URL}/services`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load services.");
        }

        const services = Array.isArray(data)
            ? data
            : data.services ||
              data.data?.services ||
              data.data ||
              data.results ||
              [];

        allServices = Array.isArray(services)
            ? services
                .filter(service => service && typeof service === "object")
                .map((service, index) => ({
                    ...service,
                    _id: String(service._id || service.id || `service-${index}`),
                    name: String(
                        service.name || service.title || service.service || ""
                    ).trim(),
                    category: normalizeCategory(
                        service.category || service.type || "Other"
                    ),
                    description: String(
                        service.description || "Professional local service."
                    ),
                    price: service.price ?? service.startingPrice ?? 0
                }))
                .filter(service => service.name)
            : [];

        if (!allServices.length) {
            allServices = getDefaultServices();
        }

        renderServices(allServices);
    } catch (error) {
        console.error("LOAD SERVICES ERROR:", error);

        allServices = getDefaultServices();
        renderServices(allServices);

        const notice = document.createElement("p");
        notice.className = "service-load-notice";
        notice.textContent =
            "Showing example services. Live service data is unavailable.";
        grid.prepend(notice);
    }
}

/* DISPLAY SERVICES */

function renderServices(services) {
    const grid = document.getElementById("servicesGrid");
    if (!grid) return;

    if (!services.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div>🔎</div>
                <h3>No services found</h3>
                <p>Try another search or category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map(service => {
        const icon = getServiceIcon(service.category);
        const price = Number(service.price) || 0;

        return `
            <div class="service-card">
                <div class="service-top">
                    <div class="service-icon">${icon}</div>
                    <span class="available">Service category</span>
                </div>

                <h3>${escapeHtml(service.name)}</h3>

                <div class="service-category">
                    ${escapeHtml(service.category)}
                </div>

                <p class="service-description">
                    ${escapeHtml(service.description)}
                </p>

                <div class="service-bottom">
                    <div class="service-price">
                        ${price > 0 ? `₹${price}` : "Contact for price"}
                    </div>

                    <button
                        type="button"
                        class="service-contact"
                        data-service-id="${escapeHtml(service._id)}"
                        onclick="requestService(this.dataset.serviceId)">
                        Request
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

/* SEARCH AND FILTER */

function searchServices() {
    const search = (
        document.getElementById("serviceSearch")?.value ||
        document.getElementById("globalSearch")?.value ||
        ""
    ).trim().toLowerCase();

    const category = document.getElementById("categoryFilter")?.value || "";

    const filtered = allServices.filter(service => {
        const matchesSearch = [
            service.name,
            service.category,
            service.description
        ].some(value => String(value || "").toLowerCase().includes(search));

        const matchesCategory =
            !category || service.category === normalizeCategory(category);

        return matchesSearch && matchesCategory;
    });

    renderServices(filtered);
}

function filterServices() {
    searchServices();
}

function filterCategory(category) {
    showSectionByName("findServices");

    const filter = document.getElementById("categoryFilter");
    if (filter) filter.value = category;

    searchServices();
}

/* REQUEST A SERVICE */

function requestService(serviceId) {
    const service = allServices.find(item => item._id === serviceId);
    if (!service) {
        alert("Service not found. Please refresh and try again.");
        return;
    }

    const title = document.getElementById("jobTitle");
    const category = document.getElementById("jobCategory");
    const description = document.getElementById("jobDescription");

    if (title) title.value = service.name;
    if (category) category.value = service.category;
    if (description) {
        description.value = `I would like to request the "${service.name}" service.`;
    }

    openJobModal();
}

/* JOB MODAL */

function openJobModal() {
    document.getElementById("jobModal")?.classList.add("show");
}

function closeJobModal() {
    document.getElementById("jobModal")?.classList.remove("show");
}

/* POST A JOB */

async function postJob(event) {
    event.preventDefault();

    const user = getUser();

    if (!user || !getToken()) {
        alert("Please log in again.");
        logoutUser();
        return;
    }

    const customerId = getCustomerId();

    if (!customerId) {
        alert("Customer account information is missing. Please log in again.");
        return;
    }

    const title = document.getElementById("jobTitle")?.value.trim() || "";
    const category = document.getElementById("jobCategory")?.value.trim() || "";
    const description =
        document.getElementById("jobDescription")?.value.trim() || "";
    const location = document.getElementById("jobLocation")?.value.trim() || "";
    const budgetValue = document.getElementById("jobBudget")?.value.trim() || "0";
    const budget = Number(budgetValue);

    if (!title || !category || !description || !location) {
        alert("Please complete all required job fields.");
        return;
    }

    if (!Number.isFinite(budget) || budget < 0) {
        alert("Please enter a valid budget.");
        return;
    }

    const jobData = {
        customer: customerId,
        service: title,
        description,
        location,
        budget
    };

    try {
        const response = await fetch(`${API_URL}/jobs`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(jobData)
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            logoutUser();
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || "Unable to post job.");
        }

        alert("Job posted successfully!");

        closeJobModal();
        document.querySelector("#jobModal form")?.reset();

        await loadMyJobs();
        updateDashboardStats();
    } catch (error) {
        console.error("POST JOB ERROR:", error);
        alert(error.message || "Unable to connect to the server.");
    }
}

/* LOAD CUSTOMER JOBS */

async function loadMyJobs() {
    const customerId = getCustomerId();

    if (!customerId || !getToken()) return;

    try {
        const response = await fetch(
            `${API_URL}/jobs/my?customer=${encodeURIComponent(customerId)}`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );

        if (response.status === 401) {
            logoutUser();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load jobs.");
        }

        allJobs = Array.isArray(data.jobs)
            ? data.jobs
            : Array.isArray(data.data)
                ? data.data
                : [];

        renderJobs();
        updateDashboardStats();
    } catch (error) {
        console.error("LOAD MY JOBS ERROR:", error);

        const message = `
            <div class="empty-state">
                <div>⚠️</div>
                <h3>Unable to load jobs</h3>
                <p>Check your internet connection and backend job routes.</p>
            </div>
        `;

        const container = document.getElementById("myJobsContainer");
        const legacyContainer = document.getElementById("myJobs");

        if (container) container.innerHTML = message;
        if (legacyContainer) legacyContainer.innerHTML = message;
    }
}

/* DISPLAY JOBS */

function renderJobs() {
    const container = document.getElementById("myJobsContainer");
    const legacyContainer = document.getElementById("myJobs");
    const recent = document.getElementById("recentJobs");

    if (!allJobs.length) {
        const emptyHtml = `
            <div class="empty-state">
                <div>📋</div>
                <h3>No jobs yet</h3>
                <p>Post your first job to connect with a professional.</p>
                <button type="button" class="primary-btn" onclick="openJobModal()">
                    Post a Job
                </button>
            </div>
        `;

        if (container) container.innerHTML = emptyHtml;
        if (legacyContainer) legacyContainer.innerHTML = emptyHtml;
        if (recent) recent.innerHTML = emptyHtml;

        return;
    }

    const jobHtml = job => {
        const service = job.service || job.title || "Service";
        const status = job.status || "pending";
        const location = job.location || "Not specified";
        const description = job.description || "No description provided.";
        const budget = Number(job.budget) || 0;

        return `
            <div class="job-card">
                <div>
                    <h3>${escapeHtml(service)}</h3>
                    <p><strong>Service:</strong> ${escapeHtml(service)}</p>
                    <p><strong>Location:</strong> ${escapeHtml(location)}</p>
                    <p>${escapeHtml(description)}</p>
                    <p><strong>Budget:</strong> ₹${budget}</p>
                    ${job.worker ? `
                        <p><strong>Worker:</strong>
                            ${escapeHtml(job.worker.name || "Worker")}
                        </p>
                    ` : ""}
                </div>
                <span class="job-status">${escapeHtml(status)}</span>
            </div>
        `;
    };

    const html = allJobs.map(jobHtml).join("");

    if (container) container.innerHTML = html;
    if (legacyContainer) legacyContainer.innerHTML = html;

    if (recent) {
        recent.innerHTML = allJobs.slice(0, 3).map(job => `
            <div class="job-card">
                <div>
                    <h3>${escapeHtml(job.service || job.title || "Service")}</h3>
                    <p>${escapeHtml(job.location || "")}</p>
                </div>
                <span class="job-status">
                    ${escapeHtml(job.status || "pending")}
                </span>
            </div>
        `).join("");
    }
}

/* DASHBOARD STATISTICS */

function updateDashboardStats() {
    const total = allJobs.length;

    const pending = allJobs.filter(job => {
        const status = String(job.status || "pending").toLowerCase();
        return status === "pending" || status === "requested";
    }).length;

    const completed = allJobs.filter(job =>
        String(job.status || "").toLowerCase() === "completed"
    ).length;

    const stats = {
        totalJobs: total,
        pendingJobs: pending,
        completedJobs: completed,
        servicesUsed: total
    };

    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

/* PROFILE */

async function updateProfile(event) {
    event.preventDefault();

    const name = document.getElementById("profileNameInput")?.value.trim() || "";
    const email = document.getElementById("profileEmailInput")?.value.trim() || "";
    const phone = document.getElementById("profilePhoneInput")?.value.trim() || "";

    if (!name || !email) {
        alert("Name and email are required.");
        return;
    }

    const user = getUser() || {};

    const updatedUser = {
        ...user,
        name,
        email,
        phone
    };

    localStorage.setItem("connectUsUser", JSON.stringify(updatedUser));

    loadUserInfo();
    alert("Profile updated locally.");

    // This function updates local storage only.
    // Add a backend profile API call if your server supports it.
}

/* SETTINGS */

function openSettings() {
    document.getElementById("settingsOverlay")?.classList.add("show");
}

function closeSettings() {
    document.getElementById("settingsOverlay")?.classList.remove("show");
}

function toggleDarkMode() {
    const enabled = document.getElementById("darkModeToggle")?.checked || false;

    document.body.classList.toggle("dark", enabled);
    localStorage.setItem("connectUsDarkMode", String(enabled));
}

function loadDarkMode() {
    const enabled = localStorage.getItem("connectUsDarkMode") === "true";

    document.body.classList.toggle("dark", enabled);

    const toggle = document.getElementById("darkModeToggle");
    if (toggle) toggle.checked = enabled;
}

/* NOTIFICATIONS */

function showNotifications() {
    alert("No new notifications.");
}

/* LOGOUT */

function logoutUser() {
    localStorage.removeItem("connectUsToken");
    localStorage.removeItem("connectUsUser");
    window.location.href = "auth.html";
}

/* HTML ESCAPING */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJobText(value) {
    return escapeHtml(value);
}

/* GLOBAL SEARCH */

function setupGlobalSearch() {
    const searchInputs = [
        document.getElementById("globalSearch"),
        document.getElementById("serviceSearch")
    ].filter(Boolean);

    searchInputs.forEach(input => {
        input.addEventListener("input", () => {
            searchInputs.forEach(otherInput => {
                if (otherInput !== input) {
                    otherInput.value = input.value;
                }
            });

            if (input.value.trim()) {
                showSectionByName("findServices");
            }

            searchServices();
        });

        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                showSectionByName("findServices");
                searchServices();
            }
        });
    });
}

/* START APPLICATION */

document.addEventListener("DOMContentLoaded", async () => {
    if (!checkAuthentication()) return;

    loadUserInfo();
    loadDarkMode();
    setupGlobalSearch();

    await loadServices();
    await loadMyJobs();
});

/* =========================================
   CONNECT US - SETTINGS BUTTON FIX
========================================= */

function openSettings() {
    const panel = document.getElementById("globalSettingsPanel");
    const overlay = document.getElementById("globalSettingsOverlay");

    if (!panel || !overlay) {
        console.error("Settings panel or overlay not found.");
        return;
    }

    panel.classList.add("open");
    overlay.classList.add("open");

    panel.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function closeSettings() {
    const panel = document.getElementById("globalSettingsPanel");
    const overlay = document.getElementById("globalSettingsOverlay");

    panel?.classList.remove("open");
    overlay?.classList.remove("open");

    panel?.setAttribute("aria-hidden", "true");
    overlay?.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("globalSettingsClose");
    const overlay = document.getElementById("globalSettingsOverlay");

    closeButton?.addEventListener("click", closeSettings);
    overlay?.addEventListener("click", closeSettings);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSettings();
        }
    });
});
