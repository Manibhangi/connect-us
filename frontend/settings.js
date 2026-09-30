/* =========================================================
   CONNECT US - SETTINGS + I18N RUNTIME
   English / Kannada / Hindi ONLY

   IMPORTANT:
   - Requires translations.js before this file.
   - Uses one shared localStorage key: connectUsLanguage
   - Does NOT translate user-generated values when marked
     with data-user-content.
   - No old broad text replacement engine.
========================================================= */
(function () {
    "use strict";

    // Prevent this runtime from being initialized more than once.
    if (window.__connectUsSettingsRuntimeLoaded) {
        return;
    }

    window.__connectUsSettingsRuntimeLoaded = true;

    const LANGUAGE_KEY = "connectUsLanguage";
    const DARK_KEY = "connectUsDarkMode";
    const EYE_KEY = "connectUsEyeComfort";
    const DEFAULT_LANGUAGE = "en";

    const LANGUAGES = ["en", "kn", "hi"];
    const DICT = window.ConnectUsTranslations || {};

    if (!DICT.en || !DICT.kn || !DICT.hi) {
        console.error(
            "Connect Us i18n: translations.js was not loaded before settings.js."
        );
        return;
    }

    /* ---------------------------------------------------------
       Build exact English -> key lookup for safe legacy fallback
    --------------------------------------------------------- */
    const EN_TO_KEY = new Map();

    Object.keys(DICT.en).forEach(function (key) {
        const english = String(DICT.en[key] ?? "").trim();

        if (english && !EN_TO_KEY.has(english)) {
            EN_TO_KEY.set(english, key);
        }
    });

    /* ---------------------------------------------------------
       Legacy UI label prefixes.
       These translate only labels, never the value after them.
    --------------------------------------------------------- */
    const PREFIX_KEYS = [
        ["Customer:", "ui.customer_label"],
        ["Phone:", "ui.phone_label"],
        ["Description:", "ui.description_label"],
        ["Location:", "ui.location_label"],
        ["Budget:", "ui.budget_label"],
        ["Status:", "ui.status_label"],
        ["Worker:", "ui.worker_label"],
        ["Service:", "ui.service"],
        ["Category:", "ui.category_label"]
    ];

    function validLanguage(value) {
        return LANGUAGES.includes(value)
            ? value
            : DEFAULT_LANGUAGE;
    }

    function getLanguage() {
        return validLanguage(
            localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE
        );
    }

    function t(key, params) {
        const language = getLanguage();
        const dict = DICT[language] || DICT.en;

        let value = dict[key];

        if (value == null) {
            value = DICT.en[key];
        }

        if (value == null) {
            return key;
        }

        value = String(value);

        if (params && typeof params === "object") {
            Object.keys(params).forEach(function (name) {

                const escapedName = name.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

                const token = new RegExp(
                    "\\{" + escapedName + "\\}",
                    "g"
                );

                value = value.replace(
                    token,
                    String(params[name])
                );
            });
        }

        return value;
    }

    function setLanguage(language) {
        const next = validLanguage(language);

        localStorage.setItem(
            LANGUAGE_KEY,
            next
        );

        applyLanguage();

        return next;
    }

    function rememberOriginal(node, property, value) {
        if (
            !Object.prototype.hasOwnProperty.call(
                node,
                property
            )
        ) {
            node[property] = value;
        }

        return node[property];
    }

    function normalize(text) {
        return String(text ?? "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function isUserContent(element) {
        if (!element) {
            return false;
        }

        if (
            element.closest(
                "[data-user-content], [data-user-generated], .user-content, .user-generated"
            )
        ) {
            return true;
        }

        const protectedIds = [
            "welcomeName",
            "topUserName",
            "profileName",
            "profileEmail",
            "profilePhone",
            "profileLocation",
            "workerName",
            "workerNameTop",
            "editName",
            "workerAvatar",
            "topAvatar",
            "profileAvatar",
            "editAvatar",
            "profileNameInput",
            "profileEmailInput",
            "profilePhoneInput",
            "profileAboutInput",
            "serviceName",
            "serviceDescription",
            "jobDescription",
            "jobLocation"
        ];

        if (protectedIds.includes(element.id)) {
            return true;
        }

        return false;
    }

    /* ---------------------------------------------------------
       Translate elements only when their value actually changes.
       This is important because changing textContent creates DOM
       mutations. Rewriting the same value causes flickering loops.
    --------------------------------------------------------- */
    function applyElementTranslation(element) {

        if (
            !element ||
            element.nodeType !== Node.ELEMENT_NODE
        ) {
            return;
        }

        /* TEXT */
        if (element.hasAttribute("data-i18n")) {

            const key =
                element.getAttribute("data-i18n");

            const translated = t(key);

            if (
                translated !== key &&
                element.textContent !== translated
            ) {
                element.textContent = translated;
            }
        }

        /* PLACEHOLDER */
        if (element.hasAttribute("data-i18n-placeholder")) {

            const key =
                element.getAttribute(
                    "data-i18n-placeholder"
                );

            const translated = t(key);

            if (
                element.getAttribute("placeholder") !==
                translated
            ) {
                element.setAttribute(
                    "placeholder",
                    translated
                );
            }
        }

        /* TITLE */
        if (element.hasAttribute("data-i18n-title")) {

            const key =
                element.getAttribute("data-i18n-title");

            const translated = t(key);

            if (
                element.getAttribute("title") !==
                translated
            ) {
                element.setAttribute(
                    "title",
                    translated
                );
            }
        }

        /* ARIA LABEL */
        if (
            element.hasAttribute(
                "data-i18n-aria-label"
            )
        ) {

            const key =
                element.getAttribute(
                    "data-i18n-aria-label"
                );

            const translated = t(key);

            if (
                element.getAttribute("aria-label") !==
                translated
            ) {
                element.setAttribute(
                    "aria-label",
                    translated
                );
            }
        }

        /* ALT */
        if (element.hasAttribute("data-i18n-alt")) {

            const key =
                element.getAttribute("data-i18n-alt");

            const translated = t(key);

            if (
                element.getAttribute("alt") !==
                translated
            ) {
                element.setAttribute(
                    "alt",
                    translated
                );
            }
        }

        /* VALUE */
        if (element.hasAttribute("data-i18n-value")) {

            const key =
                element.getAttribute(
                    "data-i18n-value"
                );

            const translated = t(key);

            if (
                element.getAttribute("value") !==
                translated
            ) {
                element.setAttribute(
                    "value",
                    translated
                );
            }
        }
    }

    function applyAllDataI18n(root) {

        const scope = root || document;

        if (
            scope.nodeType ===
            Node.ELEMENT_NODE
        ) {
            applyElementTranslation(scope);
        }

        if (!scope.querySelectorAll) {
            return;
        }

        scope
            .querySelectorAll(
                "[data-i18n]," +
                "[data-i18n-placeholder]," +
                "[data-i18n-title]," +
                "[data-i18n-aria-label]," +
                "[data-i18n-alt]," +
                "[data-i18n-value]"
            )
            .forEach(
                applyElementTranslation
            );
    }

    /* ---------------------------------------------------------
       Legacy fallback ONLY for exact known UI strings.
    --------------------------------------------------------- */
    function applyLegacyFallback(root) {

        const container =
            root || document.body;

        if (!container) {
            return;
        }

        const walker =
            document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {

                        const parent =
                            node.parentElement;

                        if (!parent) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        if (
                            !node.nodeValue.trim()
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        if (
                            parent.closest(
                                "script,style,noscript"
                            )
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        if (
                            parent.closest(
                                "[data-i18n]"
                            )
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        if (
                            parent.closest(
                                "[data-user-content], [data-user-generated], .notranslate"
                            )
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

        const nodes = [];
        let current;

        while (
            (current = walker.nextNode())
        ) {
            nodes.push(current);
        }

        nodes.forEach(function (node) {

            const original =
                rememberOriginal(
                    node,
                    "__connectUsOriginalText",
                    node.nodeValue
                );

            let text = original;

            const normalized =
                normalize(original);

            if (!normalized) {
                return;
            }

            const exactKey =
                EN_TO_KEY.get(normalized);

            if (exactKey) {

                const translated =
                    t(exactKey);

                const lead =
                    original.match(
                        /^\s*/
                    )?.[0] || "";

                const trail =
                    original.match(
                        /\s*$/
                    )?.[0] || "";

                const nextText =
                    lead +
                    translated +
                    trail;

                if (
                    node.nodeValue !==
                    nextText
                ) {
                    node.nodeValue =
                        nextText;
                }

                return;
            }

            /* Translate only known labels */
            PREFIX_KEYS.forEach(
                function (item) {

                    const englishLabel =
                        item[0];

                    const key =
                        item[1];

                    text =
                        text
                            .split(
                                englishLabel
                            )
                            .join(
                                t(key)
                            );
                }
            );

            if (
                text !== original &&
                node.nodeValue !== text
            ) {
                node.nodeValue = text;
            }
        });
    }

    function restoreLegacyText(root) {

        const container =
            root || document.body;

        if (!container) {
            return;
        }

        const walker =
            document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null
            );

        const nodes = [];
        let current;

        while (
            (current = walker.nextNode())
        ) {

            if (
                current.__connectUsOriginalText != null
            ) {
                nodes.push(current);
            }
        }

        nodes.forEach(function (node) {

            if (
                node.nodeValue !==
                node.__connectUsOriginalText
            ) {
                node.nodeValue =
                    node.__connectUsOriginalText;
            }
        });
    }

    function updateLanguageControls() {

        const language =
            getLanguage();

        document
            .querySelectorAll(
                "#globalLanguageSelect, #languageSelect"
            )
            .forEach(function (select) {

                if (
                    select.value !==
                    language
                ) {
                    select.value =
                        language;
                }
            });
    }

    function applyLanguage() {

        if (!document.documentElement) {
            return;
        }

        const language =
            getLanguage();

        document.documentElement.lang =
            language;

        restoreLegacyText(
            document.body
        );

        applyAllDataI18n(
            document
        );

        applyLegacyFallback(
            document.body
        );

        updateLanguageControls();

        const titleElement =
            document.querySelector(
                "title[data-i18n]"
            );

        if (titleElement) {

            const key =
                titleElement.getAttribute(
                    "data-i18n"
                );

            const translatedTitle =
                t(key);

            if (
                titleElement.textContent !==
                translatedTitle
            ) {
                titleElement.textContent =
                    translatedTitle;
            }
        }

        window.dispatchEvent(
            new CustomEvent(
                "connectUsLanguageChanged",
                {
                    detail: {
                        language: language
                    }
                }
            )
        );
    }

    /* ---------------------------------------------------------
       Alert / Confirm translation
    --------------------------------------------------------- */
    function translateMessage(message) {

        const raw =
            String(message ?? "");

        const key =
            EN_TO_KEY.get(
                normalize(raw)
            );

        if (key) {
            return t(key);
        }

        let translated = raw;

        PREFIX_KEYS.forEach(
            function (item) {

                translated =
                    translated
                        .split(item[0])
                        .join(
                            t(item[1])
                        );
            }
        );

        return translated;
    }

    if (
        !window.__connectUsAlertWrapped
    ) {

        window.__connectUsAlertWrapped =
            true;

        const originalAlert =
            window.alert.bind(
                window
            );

        const originalConfirm =
            window.confirm
                ? window.confirm.bind(
                    window
                )
                : null;

        window.alert =
            function (message) {

                originalAlert(
                    translateMessage(
                        message
                    )
                );
            };

        if (originalConfirm) {

            window.confirm =
                function (message) {

                    return originalConfirm(
                        translateMessage(
                            message
                        )
                    );
                };
        }
    }

    /* ---------------------------------------------------------
       Theme persistence
    --------------------------------------------------------- */
    function darkModeEnabled() {

        return (
            localStorage.getItem(
                DARK_KEY
            ) === "true"
        );
    }

    function eyeComfortEnabled() {

        return (
            localStorage.getItem(
                EYE_KEY
            ) === "true"
        );
    }

    function applyTheme() {

        const dark =
            darkModeEnabled();

        const eye =
            eyeComfortEnabled();

        const html =
            document.documentElement;

        const body =
            document.body;

        [
            "connectus-dark",
            "connect-us-dark"
        ].forEach(function (cls) {

            html.classList.toggle(
                cls,
                dark
            );
        });

        [
            "connectus-eye",
            "connect-us-eye-comfort"
        ].forEach(function (cls) {

            html.classList.toggle(
                cls,
                eye
            );
        });

        if (body) {

            body.classList.toggle(
                "dark-mode",
                dark
            );

            body.classList.toggle(
                "connect-us-dark",
                dark
            );

            body.classList.toggle(
                "eye-comfort",
                eye
            );
        }

        html.dataset.theme =
            dark
                ? "dark"
                : "light";

        document
            .querySelectorAll(
                "#globalDarkModeToggle, #darkModeToggle"
            )
            .forEach(
                function (toggle) {

                    if (
                        toggle.checked !==
                        dark
                    ) {
                        toggle.checked =
                            dark;
                    }
                }
            );

        document
            .querySelectorAll(
                "#globalEyeComfortToggle, #eyeProtectorToggle"
            )
            .forEach(
                function (toggle) {

                    if (
                        toggle.checked !==
                        eye
                    ) {
                        toggle.checked =
                            eye;
                    }
                }
            );
    }

    function setDarkMode(enabled) {

        const value =
            Boolean(enabled);

        localStorage.setItem(
            DARK_KEY,
            String(value)
        );

        if (value) {

            localStorage.setItem(
                EYE_KEY,
                "false"
            );
        }

        applyTheme();
    }

    function setEyeComfort(enabled) {

        const value =
            Boolean(enabled);

        localStorage.setItem(
            EYE_KEY,
            String(value)
        );

        if (value) {

            localStorage.setItem(
                DARK_KEY,
                "false"
            );
        }

        applyTheme();
    }

    /* ---------------------------------------------------------
       Settings panel
    --------------------------------------------------------- */
    function openSettings() {

        const panel =
            document.getElementById(
                "globalSettingsPanel"
            );

        const overlay =
            document.getElementById(
                "globalSettingsOverlay"
            );

        if (panel) {
            panel.classList.add(
                "show"
            );
        }

        if (overlay) {
            overlay.classList.add(
                "show"
            );
        }

        updateLanguageControls();
        applyTheme();
    }

    function closeSettings() {

        const panel =
            document.getElementById(
                "globalSettingsPanel"
            );

        const overlay =
            document.getElementById(
                "globalSettingsOverlay"
            );

        if (panel) {
            panel.classList.remove(
                "show"
            );
        }

        if (overlay) {
            overlay.classList.remove(
                "show"
            );
        }
    }

    function setupSettingsControls() {

        /* LANGUAGE */
        document
            .querySelectorAll(
                "#globalLanguageSelect, #languageSelect"
            )
            .forEach(function (select) {

                if (
                    select.dataset
                        .connectUsBound === "1"
                ) {
                    return;
                }

                select.dataset
                    .connectUsBound =
                    "1";

                select.addEventListener(
                    "change",
                    function () {

                        setLanguage(
                            this.value
                        );
                    }
                );
            });

        /* DARK MODE */
        document
            .querySelectorAll(
                "#globalDarkModeToggle, #darkModeToggle"
            )
            .forEach(function (toggle) {

                if (
                    toggle.dataset
                        .connectUsBound === "1"
                ) {
                    return;
                }

                toggle.dataset
                    .connectUsBound =
                    "1";

                toggle.addEventListener(
                    "change",
                    function () {

                        setDarkMode(
                            this.checked
                        );
                    }
                );
            });

        /* EYE COMFORT */
        document
            .querySelectorAll(
                "#globalEyeComfortToggle, #eyeProtectorToggle"
            )
            .forEach(function (toggle) {

                if (
                    toggle.dataset
                        .connectUsBound === "1"
                ) {
                    return;
                }

                toggle.dataset
                    .connectUsBound =
                    "1";

                toggle.addEventListener(
                    "change",
                    function () {

                        setEyeComfort(
                            this.checked
                        );
                    }
                );
            });

        /* CLOSE BUTTON */
        const close =
            document.getElementById(
                "globalSettingsClose"
            );

        if (
            close &&
            close.dataset
                .connectUsBound !== "1"
        ) {

            close.dataset
                .connectUsBound =
                "1";

            close.addEventListener(
                "click",
                closeSettings
            );
        }

        /* OVERLAY */
        const overlay =
            document.getElementById(
                "globalSettingsOverlay"
            );

        if (
            overlay &&
            overlay.dataset
                .connectUsBound !== "1"
        ) {

            overlay.dataset
                .connectUsBound =
                "1";

            overlay.addEventListener(
                "click",
                closeSettings
            );
        }
    }

    /* ---------------------------------------------------------
       SAFE Dynamic UI observer

       IMPORTANT:
       - Watches only childList changes.
       - Ignores text-node changes.
       - Reacts only when NEW HTML ELEMENTS are added.
       - Does not repeatedly rewrite already translated text.
    --------------------------------------------------------- */
    function installObserver() {

        if (
            !document.body ||
            window.__connectUsI18nObserverInstalled
        ) {
            return;
        }

        window.__connectUsI18nObserverInstalled =
            true;

        let scheduled = false;

        const observer =
            new MutationObserver(
                function (mutations) {

                    const addedElements = [];

                    mutations.forEach(
                        function (mutation) {

                            if (
                                !mutation.addedNodes ||
                                mutation.addedNodes.length === 0
                            ) {
                                return;
                            }

                            mutation.addedNodes.forEach(
                                function (node) {

                                    /* ONLY HTML ELEMENTS */
                                    if (
                                        node.nodeType ===
                                        Node.ELEMENT_NODE
                                    ) {
                                        addedElements.push(
                                            node
                                        );
                                    }
                                }
                            );
                        }
                    );

                    if (
                        addedElements.length === 0 ||
                        scheduled
                    ) {
                        return;
                    }

                    scheduled = true;

                    requestAnimationFrame(
                        function () {

                            scheduled = false;

                            addedElements.forEach(
                                function (node) {

                                    /*
                                      The element might already have
                                      been removed before this frame.
                                    */
                                    if (
                                        !node.isConnected
                                    ) {
                                        return;
                                    }

                                    applyAllDataI18n(
                                        node
                                    );

                                    applyLegacyFallback(
                                        node
                                    );

                                    setupSettingsControls();
                                }
                            );
                        }
                    );
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    /* ---------------------------------------------------------
       Public API
    --------------------------------------------------------- */
    window.t =
        t;

    window.getLanguage =
        getLanguage;

    window.setLanguage =
        setLanguage;

    window.applyLanguage =
        applyLanguage;

    window.openSettings =
        openSettings;

    window.closeSettings =
        closeSettings;

    window.setDarkMode =
        function () {
            setDarkMode(true);
        };

    window.setLightMode =
        function () {
            setDarkMode(false);
        };

    window.setEyeProtection =
        function () {
            setEyeComfort(true);
        };

    window.toggleDarkMode =
        function () {
            setDarkMode(
                !darkModeEnabled()
            );
        };

    window.toggleEyeProtector =
        function () {
            setEyeComfort(
                !eyeComfortEnabled()
            );
        };

    /* ---------------------------------------------------------
       ONE-TIME INITIALIZATION
    --------------------------------------------------------- */
    function init() {

        if (
            window.__connectUsSettingsRuntimeInitialized
        ) {
            return;
        }

        window.__connectUsSettingsRuntimeInitialized =
            true;

        applyTheme();

        setupSettingsControls();

        applyLanguage();

        installObserver();
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

    /* ---------------------------------------------------------
       Cross-tab settings sync
    --------------------------------------------------------- */
    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                LANGUAGE_KEY
            ) {
                applyLanguage();
            }

            if (
                event.key === DARK_KEY ||
                event.key === EYE_KEY
            ) {
                applyTheme();
            }
        }
    );

})();