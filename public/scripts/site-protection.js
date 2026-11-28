
/**
 * ==========================================================
 * PROBOY DEV PROTECTION v2.0
 * Author: Shahan Ali
 * Website: proboy.vercel.app
 * ==========================================================
 */

(function (window, document) {
    "use strict";

    if (window.__PROBOY_PROTECTION_V2__) return;
    window.__PROBOY_PROTECTION_V2__ = true;

    const CONFIG = {
        mode: "strict",

        blockRightClick: true,
        blockShortcuts: true,
        blockSelection: true,
        blockCopy: true,
        blockCut: true,
        blockImageDrag: true,

        detectDevTools: true,
        warningOverlay: true,

        threshold: 160,
        checkInterval: 1000,

        // Consecutive detections before locking
        detectionCount: 2,

        // Consecutive clear checks before restoring
        restoreCount: 3
    };

    let detectedCount = 0;
    let clearCount = 0;
    let locked = false;
    let overlay = null;

    // --------------------------------------------------
    // CONSOLE WARNING
    // --------------------------------------------------

    function consoleWarning() {
        console.warn(
            "%cPROBOY DEV PROTECTION",
            "color:red;font-size:24px;font-weight:bold;"
        );

        console.warn(
            "%cThis website is protected. Unauthorized inspection is discouraged.",
            "color:orange;font-size:13px;"
        );
    }

    // --------------------------------------------------
    // EDITABLE ELEMENTS
    // --------------------------------------------------

    function isEditable(element) {
        if (!element) return false;

        return !!(
            element.closest &&
            element.closest(
                'input, textarea, select, ' +
                '[contenteditable="true"], ' +
                '[role="textbox"]'
            )
        );
    }

    // --------------------------------------------------
    // RIGHT CLICK
    // --------------------------------------------------

    if (CONFIG.blockRightClick) {
        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, true);
    }

    // --------------------------------------------------
    // KEYBOARD SHORTCUTS
    // --------------------------------------------------

    if (CONFIG.blockShortcuts) {
        document.addEventListener("keydown", function (e) {
            const key = e.key.toLowerCase();

            const blocked =
                key === "f12" ||

                ((e.ctrlKey || e.metaKey) &&
                    ["u", "s"].includes(key)) ||

                ((e.ctrlKey || e.metaKey) &&
                    e.shiftKey &&
                    ["i", "j", "c", "k"].includes(key)) ||

                (e.metaKey && e.altKey &&
                    ["i", "j", "c"].includes(key));

            if (blocked) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, true);
    }

    // --------------------------------------------------
    // SELECTION
    // --------------------------------------------------

    if (CONFIG.blockSelection) {
        const style = document.createElement("style");

        style.textContent = `
            html {
                -webkit-user-select: none !important;
                user-select: none !important;
            }

            input, textarea, select,
            [contenteditable="true"],
            [contenteditable="true"] * {
                -webkit-user-select: text !important;
                user-select: text !important;
            }

            img {
                -webkit-user-drag: none !important;
            }
        `;

        (document.head || document.documentElement)
            .appendChild(style);

        document.addEventListener("selectstart", function (e) {
            if (!isEditable(e.target)) {
                e.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------
    // COPY / CUT
    // --------------------------------------------------

    if (CONFIG.blockCopy) {
        document.addEventListener("copy", function (e) {
            if (!isEditable(e.target)) {
                e.preventDefault();
            }
        }, true);
    }

    if (CONFIG.blockCut) {
        document.addEventListener("cut", function (e) {
            if (!isEditable(e.target)) {
                e.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------
    // IMAGE DRAG
    // --------------------------------------------------

    if (CONFIG.blockImageDrag) {
        document.addEventListener("dragstart", function (e) {
            if (
                e.target &&
                (e.target.tagName === "IMG" ||
                 e.target.closest("img"))
            ) {
                e.preventDefault();
            }
        }, true);
    }

    // --------------------------------------------------
    // WARNING OVERLAY
    // --------------------------------------------------

    function createOverlay() {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.id = "proboy-security-screen";

        overlay.innerHTML = `
            <div class="proboy-warning-card">

                <div class="proboy-icon">🛡️</div>

                <h1>ACCESS RESTRICTED</h1>

                <h2>PROBOY DEV PROTECTION</h2>

                <p>
                    Developer Tools activity has been detected.
                </p>

                <p>
                    Please close Developer Tools to continue
                    using this website.
                </p>

                <div class="proboy-status">
                    SECURITY MONITOR ACTIVE
                </div>

                <small>Protected by Shahan Ali | PROBOY</small>

            </div>
        `;

        const css = document.createElement("style");

        css.textContent = `
            #proboy-security-screen {
                position: fixed !important;
                inset: 0 !important;
                z-index: 2147483647 !important;

                display: none;
                align-items: center;
                justify-content: center;

                background: #080808 !important;
                color: white !important;

                font-family: Arial, sans-serif !important;
                text-align: center !important;
                padding: 20px !important;
                box-sizing: border-box !important;
            }

            #proboy-security-screen.active {
                display: flex !important;
            }

            .proboy-warning-card {
                width: 100%;
                max-width: 480px;
                padding: 40px 25px;
                box-sizing: border-box;
                background: #151515;
                border: 1px solid #393939;
                border-radius: 18px;
                box-shadow: 0 20px 80px #000;
            }

            .proboy-icon {
                font-size: 55px;
                margin-bottom: 15px;
            }

            .proboy-warning-card h1 {
                color: #ff4242;
                font-size: 27px;
                margin: 10px 0;
            }

            .proboy-warning-card h2 {
                font-size: 15px;
                letter-spacing: 3px;
                color: #aaa;
            }

            .proboy-warning-card p {
                color: #ccc;
                line-height: 1.7;
                font-size: 14px;
            }

            .proboy-status {
                display: inline-block;
                margin: 20px 0;
                padding: 12px 18px;
                border: 1px solid #ff4242;
                border-radius: 8px;
                color: #ff4242;
                font-size: 12px;
                letter-spacing: 2px;
            }

            .proboy-warning-card small {
                display: block;
                color: #777;
            }
        `;

        document.documentElement.appendChild(css);
        document.documentElement.appendChild(overlay);
    }

    // --------------------------------------------------
    // LOCK WEBSITE
    // --------------------------------------------------

    function lockWebsite() {
        if (locked) return;

        locked = true;

        createOverlay();

        overlay.classList.add("active");

        console.warn(
            "[PROBOY] Developer Tools activity detected."
        );
    }

    // --------------------------------------------------
    // RESTORE WEBSITE
    // --------------------------------------------------

    function restoreWebsite() {
        if (!locked) return;

        locked = false;

        if (overlay) {
            overlay.classList.remove("active");
        }

        console.info(
            "[PROBOY] Website restored."
        );
    }

    // --------------------------------------------------
    // DEVTOOLS DETECTION
    // --------------------------------------------------

    function detectDevTools() {
        if (!CONFIG.detectDevTools) return;

        const widthDifference =
            window.outerWidth - window.innerWidth;

        const heightDifference =
            window.outerHeight - window.innerHeight;

        const detected =
            widthDifference > CONFIG.threshold ||
            heightDifference > CONFIG.threshold;

        if (detected) {
            detectedCount++;
            clearCount = 0;

            if (detectedCount >= CONFIG.detectionCount) {
                if (CONFIG.warningOverlay) {
                    lockWebsite();
                }
            }
        } else {
            clearCount++;
            detectedCount = 0;

            if (clearCount >= CONFIG.restoreCount) {
                restoreWebsite();
            }
        }
    }

    // --------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------

    function initialize() {
        consoleWarning();
        createOverlay();

        detectDevTools();

        window.setInterval(
            detectDevTools,
            CONFIG.checkInterval
        );

        window.addEventListener(
            "resize",
            detectDevTools
        );

        console.info(
            "%cPROBOY DEV PROTECTION v2.0 ACTIVE",
            "color:#22c55e;font-size:18px;font-weight:bold;"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

    // --------------------------------------------------
    // PUBLIC STATUS
    // --------------------------------------------------

    Object.defineProperty(window, "ProBoyProtection", {
        configurable: false,
        writable: false,

        value: Object.freeze({
            name: "PROBOY DEV PROTECTION",
            version: "2.0.0",
            status: "active",
            author: "Shahan Ali"
        })
    });

})(window, document);
