
/**
 * ============================================================
 *  PROBOY DEV PROTECTION v1.0
 *  Author: Shahan Ali | PROBOY
 *  Type: Universal Browser-Side Protection
 *  Dependencies: None
 * ============================================================
 */

(function (window, document) {
    "use strict";

    // Prevent duplicate initialization
    if (window.__PROBOY_DEV_PROTECTION__) return;
    window.__PROBOY_DEV_PROTECTION__ = true;

    const CONFIG = {
        mode: "strict",

        blockRightClick: true,
        blockShortcuts: true,
        blockTextSelection: true,
        blockCopy: true,
        blockCut: true,
        blockImageDragging: true,

        detectDevTools: true,
        consoleWarning: true,

        // Detection threshold in pixels
        devToolsThreshold: 160,

        // Editable fields must continue working
        protectEditableFields: true,

        // Debugging detection interval
        detectionInterval: 1200,

        // Display a warning only; never redirect
        devToolsResponse: "warn"
    };

    const PREFIX = "[PROBOY PROTECTION]";

    // --------------------------------------------------------
    // 1. Console Warning
    // --------------------------------------------------------

    function showConsoleWarning() {
        if (!CONFIG.consoleWarning) return;

        console.warn(
            "%cSTOP! PROTECTED WEBSITE",
            "color:#ff3333;font-size:25px;font-weight:bold;"
        );

        console.warn(
            "%cThis website is protected by PROBOY DEV PROTECTION.",
            "color:#d97706;font-size:14px;font-weight:bold;"
        );

        console.warn(
            "%cUnauthorized inspection or copying is discouraged.",
            "color:#888;font-size:12px;"
        );
    }

    // --------------------------------------------------------
    // 2. Editable Field Detection
    // --------------------------------------------------------

    function isEditable(element) {
        if (!element || !CONFIG.protectEditableFields) {
            return false;
        }

        const tag = element.tagName?.toLowerCase();

        return (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            element.isContentEditable === true ||
            element.closest?.('[contenteditable="true"]') !== null
        );
    }

    // --------------------------------------------------------
    // 3. Right Click Protection
    // --------------------------------------------------------

    if (CONFIG.blockRightClick) {
        document.addEventListener("contextmenu", function (event) {
            event.preventDefault();
        }, true);
    }

    // --------------------------------------------------------
    // 4. Keyboard Shortcut Protection
    // --------------------------------------------------------

    function handleKeyboard(event) {
        if (!CONFIG.blockShortcuts) return;

        const key = (event.key || "").toLowerCase();

        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;
        const alt = event.altKey;
        const meta = event.metaKey;

        const blocked =
            // F12
            key === "f12" ||

            // Ctrl + U / Cmd + U
            ((ctrl || meta) && key === "u") ||

            // Ctrl + Shift + I / J / C
            ((ctrl || meta) && shift &&
                ["i", "j", "c", "k", "e"].includes(key)) ||

            // Ctrl + Shift + K (Firefox)
            (ctrl && shift && key === "k") ||

            // Mac DevTools shortcuts
            (meta && alt && ["i", "j", "c"].includes(key));

        if (blocked) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            console.warn(PREFIX, "Blocked keyboard shortcut:", key);
        }
    }

    if (CONFIG.blockShortcuts) {
        window.addEventListener("keydown", handleKeyboard, true);
        document.addEventListener("keydown", handleKeyboard, true);
    }

    // --------------------------------------------------------
    // 5. Text Selection Protection
    // --------------------------------------------------------

    if (CONFIG.blockTextSelection) {
        const style = document.createElement("style");

        style.id = "proboy-protection-style";

        style.textContent = `
            html {
                -webkit-user-select: none !important;
                user-select: none !important;
            }

            img, svg {
                -webkit-user-drag: none !important;
                user-drag: none !important;
            }

            input, textarea, select,
            [contenteditable="true"],
            [contenteditable="true"] * {
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        `;

        (document.head || document.documentElement).appendChild(style);

        document.addEventListener("selectstart", function (event) {
            if (!isEditable(event.target)) {
                event.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------------
    // 6. Copy Protection
    // --------------------------------------------------------

    if (CONFIG.blockCopy) {
        document.addEventListener("copy", function (event) {
            if (!isEditable(event.target)) {
                event.preventDefault();
                console.warn(PREFIX, "Copy blocked.");
            }
        }, true);
    }

    // --------------------------------------------------------
    // 7. Cut Protection
    // --------------------------------------------------------

    if (CONFIG.blockCut) {
        document.addEventListener("cut", function (event) {
            if (!isEditable(event.target)) {
                event.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------------
    // 8. Image Drag Protection
    // --------------------------------------------------------

    if (CONFIG.blockImageDragging) {
        document.addEventListener("dragstart", function (event) {
            const target = event.target;

            if (
                target &&
                (target.tagName === "IMG" ||
                 target.closest?.("img"))
            ) {
                event.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------------
    // 9. Best-Effort DevTools Detection
    // --------------------------------------------------------

    let devToolsWarningShown = false;

    function detectDevTools() {
        if (!CONFIG.detectDevTools) return;

        const widthDifference =
            window.outerWidth - window.innerWidth;

        const heightDifference =
            window.outerHeight - window.innerHeight;

        const detected =
            widthDifference > CONFIG.devToolsThreshold ||
            heightDifference > CONFIG.devToolsThreshold;

        if (detected && !devToolsWarningShown) {
            devToolsWarningShown = true;

            console.warn(
                "%c[PROBOY] Developer Tools may be open!",
                "color:red;font-size:16px;font-weight:bold;"
            );
        }

        if (!detected) {
            devToolsWarningShown = false;
        }
    }

    // --------------------------------------------------------
    // 10. Initialization
    // --------------------------------------------------------

    function initialize() {
        showConsoleWarning();

        if (CONFIG.detectDevTools) {
            detectDevTools();

            window.setInterval(
                detectDevTools,
                CONFIG.detectionInterval
            );

            window.addEventListener(
                "resize",
                detectDevTools,
                { passive: true }
            );
        }

        console.info(
            "%cPROBOY DEV PROTECTION ACTIVE",
            "color:#16a34a;font-size:16px;font-weight:bold;"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }

    // --------------------------------------------------------
    // 11. Public Status API
    // --------------------------------------------------------

    Object.defineProperty(window, "ProBoyProtection", {
        configurable: false,
        writable: false,
        value: Object.freeze({
            version: "1.0.0",
            status: "active",
            author: "Shahan Ali",
            name: "PROBOY DEV PROTECTION"
        })
    });

})(window, document);
