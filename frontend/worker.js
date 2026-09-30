/* =========================================================
   CONNECT US - WORKER DASHBOARD
   Stable single-start version
   No reload loops
   No timers
   No MutationObserver
   ========================================================= */

(function () {
    "use strict";

    /* Prevent duplicate worker.js initialization */
    if (window.__connectUsWorkerRuntimeLoaded) {
        return;
    }

    window.__connectUsWorkerRuntimeLoaded = true;

    const API_URL = "http://localhost:5000/api";

    const TOKEN_KEY = "connectUsToken";
    const USER_KEY = "connectUsUser";

    const ACCEPTED_KEY = "connectUsWorkerAcceptedJobs";
    const COMPLETED_KEY = "connectUsWorkerCompletedJobs";

    let allRequests = [];
    let allServices = [];


    /* =========================================================
       AUTH HELPERS
       ========================================================= */

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }


    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);

            return raw ? JSON.parse(raw) : null;

        } catch (error) {

            console.error(
                "Invalid stored user:",
                error
            );

            return null;
        }
    }


    function authHeaders() {

        const token = getToken();

        const headers = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers.Authorization =
                `Bearer ${token}`;
        }

        return headers;
    }


    function saveUser(user) {

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );
    }


    function goToLogin() {

        const current =
            window.location.pathname;

        if (
            current.endsWith("/auth.html") ||
            current.endsWith("auth.html")
        ) {
            return;
        }

        window.location.replace(
            "auth.html?mode=login"
        );
    }


    function checkAuthentication() {

        const token = getToken();
        const user = getUser();

        if (!token || !user) {

            goToLogin();

            return false;
        }

        if (user.role !== "worker") {

            window.location.replace(
                "customer.html"
            );

            return false;
        }

        return true;
    }


    /* =========================================================
       SAFE TEXT
       ========================================================= */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getServiceIcon(category) {

        const key =
            String(category || "")
                .toLowerCase()
                .trim();


        if (key.includes("electric")) {
            return "⚡";
        }

        if (key.includes("plumb")) {
            return "🔧";
        }

        if (key.includes("clean")) {
            return "🧹";
        }

        if (
            key.includes("shift") ||
            key.includes("mov")
        ) {
            return "📦";
        }

        if (key.includes("carpent")) {
            return "🪚";
        }

        if (key.includes("paint")) {
            return "🎨";
        }

        if (key.includes("mechan")) {
            return "🔩";
        }

        if (
            key.includes("computer") ||
            key.includes("laptop")
        ) {
            return "💻";
        }

        if (key.includes("ac")) {
            return "❄️";
        }

        if (key.includes("garden")) {
            return "🌱";
        }

        return "🛠️";
    }


    function getInitial(name) {

        const value =
            String(
                name || "Professional"
            ).trim();

        return value
            ? value.charAt(0).toUpperCase()
            : "P";
    }


    /* =========================================================
       USER INFO
       ========================================================= */

    function loadUserInfo() {

        const user = getUser();

        if (!user) {
            return;
        }

        const name =
            user.name || "Professional";

        const phone =
            user.phone || "";

        const workerName =
            document.getElementById(
                "workerName"
            );

        const workerNameTop =
            document.getElementById(
                "workerNameTop"
            );

        const workerAvatar =
            document.getElementById(
                "workerAvatar"
            );

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileRole =
            document.getElementById(
                "profileRole"
            );

        const editAvatar =
            document.getElementById(
                "editAvatar"
            );

        const editName =
            document.getElementById(
                "editName"
            );

        const profileNameInput =
            document.getElementById(
                "profileNameInput"
            );

        const profilePhoneInput =
            document.getElementById(
                "profilePhoneInput"
            );

        const profileAboutInput =
            document.getElementById(
                "profileAboutInput"
            );

        const initial =
            getInitial(name);


        if (
            workerName &&
            workerName.textContent !==
                name.split(" ")[0]
        ) {

            workerName.textContent =
                name.split(" ")[0];
        }


        if (
            workerNameTop &&
            workerNameTop.textContent !== name
        ) {

            workerNameTop.textContent =
                name;
        }


        if (
            workerAvatar &&
            workerAvatar.textContent !== initial
        ) {

            workerAvatar.textContent =
                initial;
        }


        if (
            profileAvatar &&
            profileAvatar.textContent !== initial
        ) {

            profileAvatar.textContent =
                initial;
        }


        if (
            profileName &&
            profileName.textContent !== name
        ) {

            profileName.textContent =
                name;
        }


        if (
            profileRole &&
            profileRole.textContent !==
                "Local Service Professional"
        ) {

            profileRole.textContent =
                "Local Service Professional";
        }


        if (
            editAvatar &&
            editAvatar.textContent !== initial
        ) {

            editAvatar.textContent =
                initial;
        }


        if (
            editName &&
            editName.textContent !== name
        ) {

            editName.textContent =
                name;
        }


        if (
            profileNameInput &&
            profileNameInput.value !== name
        ) {

            profileNameInput.value =
                name;
        }


        if (
            profilePhoneInput &&
            profilePhoneInput.value !== phone
        ) {

            profilePhoneInput.value =
                phone;
        }


        if (
            profileAboutInput &&
            profileAboutInput.value !==
                (user.about || "")
        ) {

            profileAboutInput.value =
                user.about || "";
        }
    }


    /* =========================================================
       NAVIGATION
       ========================================================= */

    function showSection(
        sectionId,
        button
    ) {

        document
            .querySelectorAll(
                ".dashboard-section"
            )
            .forEach(function (section) {

                section.classList.add(
                    "hidden"
                );
            });


        const target =
            document.getElementById(
                sectionId
            );


        if (target) {

            target.classList.remove(
                "hidden"
            );
        }


        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(function (item) {

                item.classList.remove(
                    "active"
                );
            });


        if (button) {

            button.classList.add(
                "active"
            );

        } else {

            const matchingButton =
                Array.from(
                    document.querySelectorAll(
                        ".nav-item"
                    )
                ).find(function (item) {

                    const onclick =
                        item.getAttribute(
                            "onclick"
                        ) || "";

                    return onclick.includes(
                        `showSection('${sectionId}')`
                    );
                });


            if (matchingButton) {

                matchingButton.classList.add(
                    "active"
                );
            }
        }


        const sidebar =
            document.getElementById(
                "sidebar"
            );

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );
        }


        if (
            sectionId === "services"
        ) {

            loadWorkerServices();
        }


        if (
            sectionId === "requests"
        ) {

            loadRequests();
        }


        if (
            sectionId === "profile"
        ) {

            loadUserInfo();
        }
    }


    function showSectionByName(
        sectionId
    ) {

        const button =
            Array.from(
                document.querySelectorAll(
                    ".nav-item"
                )
            ).find(function (item) {

                const onclick =
                    item.getAttribute(
                        "onclick"
                    ) || "";

                return onclick.includes(
                    `showSection('${sectionId}')`
                );
            });


        showSection(
            sectionId,
            button
        );
    }


    function toggleSidebar() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        if (sidebar) {

            sidebar.classList.toggle(
                "open"
            );
        }
    }


    /* =========================================================
       SETTINGS COMPATIBILITY
       settings.js is the real settings runtime.
       ========================================================= */

    function openSettingsPanel() {

        if (
            typeof window.openSettings ===
            "function"
        ) {

            window.openSettings();
        }
    }


    function closeSettingsPanel() {

        if (
            typeof window.closeSettings ===
            "function"
        ) {

            window.closeSettings();
        }
    }


    /* =========================================================
       WORKER SERVICES
       ========================================================= */

    async function loadWorkerServices() {

        const container =
            document.getElementById(
                "serviceList"
            );


        if (!container) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/services`,
                    {
                        method: "GET"
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load services."
                );
            }


            const user =
                getUser();


            const workerId =
                String(
                    user?.id ||
                    user?._id ||
                    ""
                );


            allServices =
                Array.isArray(
                    data.services
                )
                    ? data.services.filter(
                        function (service) {

                            const serviceWorker =
                                service.worker?._id ||
                                service.worker?.id ||
                                service.worker;


                            return (
                                workerId &&
                                String(
                                    serviceWorker
                                ) === workerId
                            );
                        }
                    )
                    : [];


            renderWorkerServices(
                allServices
            );


        } catch (error) {

            console.error(
                "Load worker services error:",
                error
            );


            container.innerHTML = `
                <div class="empty-state">
                    <div>⚠️</div>

                    <strong>
                        Unable to load services
                    </strong>

                    <p>
                        Make sure your backend is running.
                    </p>
                </div>
            `;
        }
    }


    function renderWorkerServices(
        services
    ) {

        const container =
            document.getElementById(
                "serviceList"
            );


        if (!container) {
            return;
        }


        if (!services.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <div>
                        ▦
                    </div>

                    <strong>
                        No services added
                    </strong>

                    <p>
                        Add your first service so
                        customers can find you.
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="openServiceForm()">

                        + Add service

                    </button>

                </div>
            `;

            return;
        }


        container.innerHTML =
            services
                .map(function (service) {

                    const name =
                        escapeHtml(
                            service.name ||
                            "Service"
                        );


                    const category =
                        escapeHtml(
                            service.category ||
                            "Other"
                        );


                    const description =
                        escapeHtml(
                            service.description ||
                            "Professional local service."
                        );


                    const price =
                        Number(
                            service.price ||
                            0
                        );


                    return `
                        <div class="service-card">

                            <div class="service-top">

                                <div class="service-icon">
                                    ${getServiceIcon(
                                        service.category
                                    )}
                                </div>

                                <span class="available">
                                    Available
                                </span>

                            </div>


                            <h3>
                                ${name}
                            </h3>


                            <div class="service-category">
                                ${category}
                            </div>


                            <p class="service-description">
                                ${description}
                            </p>


                            <div class="service-bottom">

                                <div class="service-price">
                                    ${
                                        price > 0
                                            ? `₹${price}`
                                            : "Contact for price"
                                    }
                                </div>

                            </div>

                        </div>
                    `;

                })
                .join("");
    }


    /* =========================================================
       SERVICE MODAL
       ========================================================= */

    function openServiceForm() {

        const modal =
            document.getElementById(
                "serviceModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

            modal.classList.add(
                "show"
            );
        }


        const input =
            document.getElementById(
                "serviceName"
            );


        if (input) {

            input.focus();
        }
    }


    function closeServiceForm() {

        const modal =
            document.getElementById(
                "serviceModal"
            );


        if (modal) {

            modal.classList.remove(
                "show"
            );

            modal.classList.add(
                "hidden"
            );
        }
    }


    /* =========================================================
       ADD SERVICE
       ========================================================= */

    async function addService() {

        const user =
            getUser();


        if (
            !user?.id &&
            !user?._id
        ) {

            alert(
                "Please login again."
            );

            goToLogin();

            return;
        }


        const name =
            document
                .getElementById(
                    "serviceName"
                )
                ?.value
                .trim() || "";


        const category =
            document
                .getElementById(
                    "serviceCategory"
                )
                ?.value
                .trim() || "";


        const priceValue =
            document
                .getElementById(
                    "servicePrice"
                )
                ?.value || "";


        const description =
            document
                .getElementById(
                    "serviceDescription"
                )
                ?.value
                .trim() || "";


        if (!name) {

            alert(
                "Please enter the service name."
            );

            return;
        }


        if (!category) {

            alert(
                "Please select a category."
            );

            return;
        }


        const price =
            Number(priceValue) || 0;


        const workerId =
            user.id || user._id;


        try {

            const response =
                await fetch(
                    `${API_URL}/services`,
                    {
                        method: "POST",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify({
                                worker:
                                    workerId,

                                name:
                                    name,

                                category:
                                    category,

                                price:
                                    price,

                                description:
                                    description,

                                isAvailable:
                                    true
                            })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (
                response.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                logoutUser();

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to save service."
                );

                return;
            }


            alert(
                data.message ||
                "Service added successfully."
            );


            const serviceName =
                document.getElementById(
                    "serviceName"
                );

            const serviceCategory =
                document.getElementById(
                    "serviceCategory"
                );

            const servicePrice =
                document.getElementById(
                    "servicePrice"
                );

            const serviceDescription =
                document.getElementById(
                    "serviceDescription"
                );


            if (serviceName) {
                serviceName.value = "";
            }

            if (serviceCategory) {
                serviceCategory.value = "";
            }

            if (servicePrice) {
                servicePrice.value = "";
            }

            if (serviceDescription) {
                serviceDescription.value = "";
            }


            closeServiceForm();

            await loadWorkerServices();


        } catch (error) {

            console.error(
                "Add service error:",
                error
            );


            alert(
                "Unable to connect to the server. " +
                "Make sure the backend is running."
            );
        }
    }


    /* =========================================================
       JOB REQUESTS
       ========================================================= */

    async function loadRequests() {

        const container =
            document.getElementById(
                "allRequests"
            );


        const recentContainer =
            document.getElementById(
                "recentRequests"
            );


        try {

            const response =
                await fetch(
                    `${API_URL}/jobs/available`,
                    {
                        method: "GET",
                        headers: authHeaders()
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (
                response.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                logoutUser();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to load requests."
                );
            }


            allRequests =
                Array.isArray(
                    data.jobs
                )
                    ? data.jobs
                    : [];


            renderRequests(
                container,
                allRequests
            );


            renderRequests(
                recentContainer,
                allRequests.slice(0, 3)
            );


            updateDashboardStats();


        } catch (error) {

            console.error(
                "Load requests error:",
                error
            );


            const errorHtml = `
                <div class="empty-state">

                    <div>
                        ⚠️
                    </div>

                    <strong>
                        Unable to load requests
                    </strong>

                    <p>
                        Make sure your backend is running.
                    </p>

                </div>
            `;


            if (container) {

                container.innerHTML =
                    errorHtml;
            }


            if (recentContainer) {

                recentContainer.innerHTML =
                    errorHtml;
            }
        }
    }


    function renderRequests(
        container,
        jobs
    ) {

        if (!container) {
            return;
        }


        if (!jobs.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <div>
                        ◉
                    </div>

                    <strong>
                        No job requests yet
                    </strong>

                    <p>
                        New customer requests
                        will appear here.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML =
            jobs
                .map(function (job) {

                    const customerName =
                        job.customer?.name ||
                        "Customer";


                    const customerPhone =
                        job.customer?.phone ||
                        "Not available";


                    const service =
                        job.service ||
                        "Service";


                    const description =
                        job.description ||
                        "No description provided.";


                    const location =
                        job.location ||
                        "Not specified";


                    const budget =
                        Number(
                            job.budget || 0
                        );


                    const status =
                        String(
                            job.status ||
                            "pending"
                        );


                    const id =
                        String(
                            job._id || ""
                        );


                    return `
                        <div class="request-card job-card">

                            <div class="service-top">

                                <div class="service-icon">
                                    ${getServiceIcon(
                                        service
                                    )}
                                </div>


                                <span class="job-status">
                                    ${escapeHtml(
                                        status
                                    )}
                                </span>

                            </div>


                            <h3>
                                ${escapeHtml(
                                    service
                                )}
                            </h3>


                            <p>
                                <strong>
                                    Customer:
                                </strong>

                                ${escapeHtml(
                                    customerName
                                )}
                            </p>


                            <p>
                                <strong>
                                    Phone:
                                </strong>

                                ${escapeHtml(
                                    customerPhone
                                )}
                            </p>


                            <p>
                                <strong>
                                    Description:
                                </strong>

                                ${escapeHtml(
                                    description
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
                                <strong>
                                    Budget:
                                </strong>

                                ₹${budget}
                            </p>


                            <div class="request-actions">

                                ${
                                    status === "pending"
                                        ? `
                                            <button
                                                type="button"
                                                class="primary-btn"
                                                onclick="acceptJob('${id}')">

                                                Accept

                                            </button>


                                            <button
                                                type="button"
                                                class="outline-btn"
                                                onclick="rejectJob('${id}')">

                                                Reject

                                            </button>
                                        `
                                        : ""
                                }


                                ${
                                    status === "accepted"
                                        ? `
                                            <button
                                                type="button"
                                                class="primary-btn"
                                                onclick="completeJob('${id}')">

                                                Complete

                                            </button>
                                        `
                                        : ""
                                }

                            </div>

                        </div>
                    `;

                })
                .join("");
    }


    /* =========================================================
       ACCEPTED JOB CACHE
       ========================================================= */

    function getAcceptedJobs() {

        try {

            const raw =
                localStorage.getItem(
                    ACCEPTED_KEY
                );


            const jobs =
                raw
                    ? JSON.parse(raw)
                    : [];


            return Array.isArray(jobs)
                ? jobs
                : [];

        } catch {

            return [];
        }
    }


    function saveAcceptedJobs(
        jobs
    ) {

        localStorage.setItem(
            ACCEPTED_KEY,
            JSON.stringify(jobs)
        );
    }


    function getCompletedCount() {

        return Number(
            localStorage.getItem(
                COMPLETED_KEY
            ) || "0"
        );
    }


    function setCompletedCount(
        value
    ) {

        localStorage.setItem(
            COMPLETED_KEY,
            String(
                Math.max(
                    0,
                    Number(value) || 0
                )
            )
        );
    }


    /* =========================================================
       ACCEPT JOB
       ========================================================= */

    async function acceptJob(
        jobId
    ) {

        const user =
            getUser();


        if (
            !user?.id &&
            !user?._id
        ) {

            alert(
                "Worker ID not found. Please login again."
            );

            goToLogin();

            return;
        }


        if (!jobId) {
            return;
        }


        if (
            !confirm(
                "Do you want to accept this job?"
            )
        ) {

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/jobs/${encodeURIComponent(
                        jobId
                    )}/accept`,
                    {
                        method: "PUT",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify({
                                worker:
                                    user.id ||
                                    user._id
                            })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (
                response.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                logoutUser();

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to accept job."
                );

                return;
            }


            const acceptedJob =
                data.job ||
                allRequests.find(
                    function (job) {

                        return (
                            String(job._id) ===
                            String(jobId)
                        );
                    }
                );


            if (acceptedJob) {

                const current =
                    getAcceptedJobs();


                const exists =
                    current.some(
                        function (job) {

                            return (
                                String(job._id) ===
                                String(jobId)
                            );
                        }
                    );


                if (!exists) {

                    current.push({

                        ...acceptedJob,

                        status:
                            "accepted",

                        worker: {

                            _id:
                                user.id ||
                                user._id,

                            name:
                                user.name ||
                                "Worker"
                        }
                    });


                    saveAcceptedJobs(
                        current
                    );
                }
            }


            alert(
                data.message ||
                "Job accepted successfully! ✅"
            );


            await loadRequests();

            updateDashboardStats();


        } catch (error) {

            console.error(
                "Accept job error:",
                error
            );


            alert(
                "Cannot connect to backend. " +
                "Make sure the server is running."
            );
        }
    }


    /* =========================================================
       REJECT JOB
       ========================================================= */

    async function rejectJob(
        jobId
    ) {

        if (!jobId) {
            return;
        }


        if (
            !confirm(
                "Do you want to reject this job?"
            )
        ) {

            return;
        }


        try {

            const user =
                getUser();


            const response =
                await fetch(
                    `${API_URL}/jobs/${encodeURIComponent(
                        jobId
                    )}/reject`,
                    {
                        method: "PUT",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify({
                                worker:
                                    user?.id ||
                                    user?._id
                            })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (
                response.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                logoutUser();

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to reject job."
                );

                return;
            }


            alert(
                data.message ||
                "Job rejected successfully. ❌"
            );


            await loadRequests();

            updateDashboardStats();


        } catch (error) {

            console.error(
                "Reject job error:",
                error
            );


            alert(
                "Cannot connect to backend. " +
                "Make sure the server is running."
            );
        }
    }


    /* =========================================================
       COMPLETE JOB
       ========================================================= */

    async function completeJob(
        jobId
    ) {

        if (!jobId) {
            return;
        }


        if (
            !confirm(
                "Mark this job as completed?"
            )
        ) {

            return;
        }


        try {

            const user =
                getUser();


            const response =
                await fetch(
                    `${API_URL}/jobs/${encodeURIComponent(
                        jobId
                    )}/complete`,
                    {
                        method: "PUT",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify({
                                worker:
                                    user?.id ||
                                    user?._id
                            })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(function () {
                        return {};
                    });


            if (
                response.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

                logoutUser();

                return;
            }


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to complete job."
                );

                return;
            }


            const accepted =
                getAcceptedJobs().filter(
                    function (job) {

                        return (
                            String(job._id) !==
                            String(jobId)
                        );
                    }
                );


            saveAcceptedJobs(
                accepted
            );


            setCompletedCount(
                getCompletedCount() + 1
            );


            alert(
                data.message ||
                "Job completed successfully."
            );


            await loadRequests();

            updateDashboardStats();


        } catch (error) {

            console.error(
                "Complete job error:",
                error
            );


            alert(
                "Cannot connect to backend. " +
                "Make sure the server is running."
            );
        }
    }


    /* =========================================================
       DASHBOARD STATS
       ========================================================= */

    function updateDashboardStats() {

        const pending =
            allRequests.filter(
                function (job) {

                    return (
                        String(
                            job.status ||
                            "pending"
                        ) === "pending"
                    );
                }
            ).length;


        const accepted =
            getAcceptedJobs();


        const completed =
            getCompletedCount();


        const totalEarnings =
            accepted.reduce(
                function (sum, job) {

                    return (
                        sum +
                        Number(
                            job.budget || 0
                        )
                    );
                },
                0
            );


        const totalEarningsEl =
            document.getElementById(
                "totalEarnings"
            );


        const completedJobsEl =
            document.getElementById(
                "completedJobs"
            );


        const pendingRequestsEl =
            document.getElementById(
                "pendingRequests"
            );


        const ratingEl =
            document.getElementById(
                "workerRating"
            );


        if (totalEarningsEl) {

            totalEarningsEl.textContent =
                `₹${totalEarnings}`;
        }


        if (completedJobsEl) {

            completedJobsEl.textContent =
                String(completed);
        }


        if (pendingRequestsEl) {

            pendingRequestsEl.textContent =
                String(pending);
        }


        if (
            ratingEl &&
            !ratingEl.textContent.trim()
        ) {

            ratingEl.textContent =
                "5.0";
        }
    }


    /* =========================================================
       PROFILE
       ========================================================= */

    function saveProfile() {

        const user =
            getUser();


        if (!user) {

            alert(
                "Please login again."
            );

            goToLogin();

            return;
        }


        const name =
            document
                .getElementById(
                    "profileNameInput"
                )
                ?.value
                .trim() || "";


        const phone =
            document
                .getElementById(
                    "profilePhoneInput"
                )
                ?.value
                .trim() || "";


        const about =
            document
                .getElementById(
                    "profileAboutInput"
                )
                ?.value
                .trim() || "";


        if (!name) {

            alert(
                "Name is required."
            );

            return;
        }


        const updatedUser = {

            ...user,

            name:
                name,

            phone:
                phone,

            about:
                about
        };


        saveUser(
            updatedUser
        );


        loadUserInfo();


        alert(
            "Profile updated successfully."
        );
    }


    function updateProfile(
        event
    ) {

        if (event) {
            event.preventDefault();
        }

        saveProfile();
    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    function logoutUser() {

        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );


        window.location.replace(
            "auth.html?mode=login"
        );
    }


    /* =========================================================
       ESCAPE KEY
       ========================================================= */

    function handleEscape(
        event
    ) {

        if (
            event.key === "Escape"
        ) {

            closeServiceForm();
            closeSettingsPanel();
        }
    }


    /* =========================================================
       START WORKER DASHBOARD
       ONLY ONCE
       ========================================================= */

    async function startWorkerDashboard() {

        if (
            !checkAuthentication()
        ) {

            return;
        }


        loadUserInfo();


        /*
         * settings.js owns:
         *
         * - Dark mode
         * - Eye comfort
         * - Language
         * - Settings panel
         */


        if (
            typeof window.applyTheme ===
            "function"
        ) {

            window.applyTheme();
        }


        await Promise.allSettled([

            loadWorkerServices(),

            loadRequests()

        ]);


        updateDashboardStats();
    }


    /* =========================================================
       MAKE FUNCTIONS AVAILABLE TO worker.html
       ========================================================= */

    window.getToken =
        getToken;


    window.getUser =
        getUser;


    window.authHeaders =
        authHeaders;


    window.loadUserInfo =
        loadUserInfo;


    window.showSection =
        showSection;


    window.showSectionByName =
        showSectionByName;


    window.toggleSidebar =
        toggleSidebar;


    window.openSettings =
        openSettingsPanel;


    window.closeSettings =
        closeSettingsPanel;


    window.loadWorkerServices =
        loadWorkerServices;


    window.openServiceForm =
        openServiceForm;


    window.closeServiceForm =
        closeServiceForm;


    window.addService =
        addService;


    window.loadRequests =
        loadRequests;


    window.acceptJob =
        acceptJob;


    window.rejectJob =
        rejectJob;


    window.completeJob =
        completeJob;


    window.updateDashboardStats =
        updateDashboardStats;


    window.saveProfile =
        saveProfile;


    window.updateProfile =
        updateProfile;


    window.logoutUser =
        logoutUser;


    /* =========================================================
       ONE DOM READY LISTENER
       ========================================================= */

    document.addEventListener(
        "keydown",
        handleEscape
    );


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startWorkerDashboard,
            {
                once: true
            }
        );

    } else {

        startWorkerDashboard();
    }

})();