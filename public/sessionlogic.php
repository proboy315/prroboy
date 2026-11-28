<?php
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                  🔄  ProBoy Session Converter  🔄                     ║
 * ║          creds.json ↔ Session ID  (GZIP + Base64 + Prefix)           ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  📌 Slide the toggle or click labels to switch mode.                 ║
 * ║  ✅ Works exactly like the Node.js implementation.                   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ⚙️ CONFIGURATION
define('PREFIX', 'ProBoy-MD!');      // Fixed prefix used in Node.js
define('GZIP_LEVEL', 9);             // Maximum compression

// DEFAULT MODE: decode (Session ID → creds.json)
$mode = isset($_POST['mode']) ? $_POST['mode'] : 'decode';
$error = '';
$success = false;
$output = '';

// ───────────────────────────────────────────────────────────────────────
//  🧠 PROCESS FORM SUBMISSION
// ───────────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 🔓 DECODE: Session ID → creds.json
    if ($mode === 'decode') {
        $sessionInput = trim($_POST['session'] ?? '');

        if (empty($sessionInput)) {
            $error = '❌ Please paste a session ID.';
        } elseif (strpos($sessionInput, PREFIX) !== 0) {
            $error = '❌ Session ID must start with "' . PREFIX . '".';
        } else {
            $base64Part = substr($sessionInput, strlen(PREFIX));
            $compressed = @base64_decode($base64Part, true);
            if ($compressed === false) {
                $error = '❌ Invalid Base64 data.';
            } elseif (!function_exists('gzdecode')) {
                $error = '❌ gzdecode() missing. Enable zlib extension.';
            } else {
                $jsonData = @gzdecode($compressed);
                if ($jsonData === false) {
                    $error = '❌ GZIP decompression failed.';
                } else {
                    json_decode($jsonData, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $error = '❌ Decompressed data is not valid JSON.';
                    } else {
                        // Force download and exit
                        header('Content-Description: File Transfer');
                        header('Content-Type: application/json');
                        header('Content-Disposition: attachment; filename="creds.json"');
                        header('Content-Length: ' . strlen($jsonData));
                        echo $jsonData;
                        exit;
                    }
                }
            }
        }
    }

    // 🔒 ENCODE: creds.json → Session ID
    elseif ($mode === 'encode') {
        if (!isset($_FILES['creds']) || $_FILES['creds']['error'] !== UPLOAD_ERR_OK) {
            $error = '❌ Please select a creds.json file.';
        } else {
            $tmpPath = $_FILES['creds']['tmp_name'];
            $jsonContent = file_get_contents($tmpPath);
            if ($jsonContent === false) {
                $error = '❌ Could not read uploaded file.';
            } else {
                json_decode($jsonContent, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $error = '❌ File is not valid JSON.';
                } else {
                    $compressed = gzencode($jsonContent, GZIP_LEVEL);
                    if ($compressed === false) {
                        $error = '❌ GZIP compression failed.';
                    } else {
                        $base64 = base64_encode($compressed);
                        $sessionId = PREFIX . $base64;
                        $success = true;
                        $output = $sessionId;
                    }
                }
            }
        }
    }
}

// For UI: $isDecode true = decode mode (Session ID → creds.json)
$isDecode = ($mode === 'decode');
// Checkbox state: we want LEFT position for decode mode (unchecked), RIGHT for encode (checked)
$checkboxChecked = !$isDecode; // if decode -> unchecked (slider left), encode -> checked (slider right)
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProBoy · Session Tool</title>
    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* ----- BLACK & WHITE MINIMALIST (pairing style) ----- */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #f8f9fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #111;
        }

        .card {
            max-width: 620px;
            width: 100%;
            background: #ffffff;
            border-radius: 32px;
            box-shadow: 0 20px 35px -8px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
            padding: 30px 28px 32px;
            border: 1px solid #e0e0e0;
            transition: all 0.2s;
        }

        /* Header */
        .header-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .title h1 {
            font-size: 1.9rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #000;
            line-height: 1.2;
        }

        .title p {
            color: #555;
            font-size: 0.9rem;
            margin-top: 4px;
        }

        .info-icon {
            background: #f0f0f0;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 1px solid #ccc;
            color: #222;
            font-size: 1.3rem;
            transition: 0.15s;
        }

        .info-icon:hover {
            background: #e0e0e0;
            border-color: #999;
        }

        /* Small guide text near toggle */
        .toggle-guide {
            text-align: center;
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }

        /* ----- TOGGLE SWITCH (ON/OFF style with animation) ----- */
        .toggle-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px 0 25px;
            gap: 20px;
        }

        .toggle-label {
            font-weight: 600;
            font-size: 1rem;
            color: #222;
            text-align: center;
            line-height: 1.4;
            min-width: 120px;
            cursor: pointer;
            transition: opacity 0.2s, color 0.2s;
            padding: 5px 0;
        }

        .toggle-label.active-label {
            color: #000;
            opacity: 1;
            font-weight: 700;
            text-decoration: underline;
            text-underline-offset: 6px;
            text-decoration-thickness: 2px;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 70px;
            height: 34px;
            flex-shrink: 0;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #aaa;
            transition: 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
            border-radius: 34px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 28px;
            width: 28px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s cubic-bezier(0.2, 0.9, 0.4, 1);
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }

        input:checked + .slider {
            background-color: #111;
        }

        input:checked + .slider:before {
            transform: translateX(36px);
        }

        input:focus + .slider {
            box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
        }

        /* Form panels */
        .panel {
            display: none;
            margin-top: 5px;
        }

        .panel.active {
            display: block;
        }

        .form-group {
            margin-bottom: 28px;
        }

        label {
            display: block;
            font-weight: 600;
            color: #222;
            margin-bottom: 10px;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        textarea, .file-area {
            width: 100%;
            background: #fafafa;
            border: 1.5px solid #ddd;
            border-radius: 20px;
            padding: 18px 20px;
            font-size: 1rem;
            color: #111;
            resize: vertical;
            min-height: 150px;
            font-family: 'SF Mono', 'Cascadia Code', monospace;
            transition: border 0.2s;
        }

        textarea:focus {
            border-color: #222;
            outline: none;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(0,0,0,0.03);
        }

        .file-area {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            cursor: pointer;
            border-style: dashed;
            min-height: 140px;
            background: #fcfcfc;
        }

        .file-area input {
            display: none;
        }

        .file-placeholder {
            color: #666;
            font-weight: 500;
        }

        .btn {
            width: 100%;
            background: #000;
            border: none;
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
            padding: 16px 20px;
            border-radius: 60px;
            cursor: pointer;
            box-shadow: 0 4px 0 #333;
            border: 1px solid #222;
            transition: all 0.1s;
            margin-top: 5px;
        }

        .btn:hover {
            background: #1a1a1a;
            transform: translateY(-2px);
            box-shadow: 0 6px 0 #222;
        }

        .btn:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #222;
        }

        /* Result area */
        .result-box {
            margin-top: 28px;
            padding: 20px;
            border-radius: 20px;
            background: #f9f9f9;
            border-left: 6px solid #2ecc71;
            border: 1px solid #e0e0e0;
        }

        .result-box.error {
            border-left-color: #e74c3c;
            background: #fef5f5;
        }

        .result-title {
            font-weight: 700;
            margin-bottom: 10px;
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .result-content {
            font-family: monospace;
            background: #fff;
            padding: 16px;
            border-radius: 16px;
            border: 1px solid #ddd;
            word-break: break-all;
            max-height: 200px;
            overflow: auto;
        }

        .copy-btn {
            background: #f0f0f0;
            border: 1px solid #bbb;
            color: #111;
            padding: 8px 18px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 12px;
            transition: 0.15s;
        }

        .copy-btn:hover {
            background: #e0e0e0;
        }

        .footnote {
            margin-top: 24px;
            text-align: right;
            font-size: 0.8rem;
            color: #777;
            border-top: 1px solid #e2e2e2;
            padding-top: 18px;
        }

        a {
            color: #000;
            text-decoration: underline;
            font-weight: 500;
        }

        /* ----- MODAL (guide) ----- */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-card {
            background: white;
            border-radius: 28px;
            max-width: 450px;
            width: 90%;
            padding: 28px;
            box-shadow: 0 25px 40px rgba(0,0,0,0.15);
            border: 1px solid #ccc;
            color: #111;
        }

        .modal-card h2 {
            font-weight: 600;
            margin-bottom: 18px;
        }

        .modal-card p {
            margin: 16px 0;
            line-height: 1.5;
            color: #333;
        }

        .modal-card .code-block {
            background: #f5f5f5;
            padding: 14px;
            border-radius: 16px;
            font-family: monospace;
            border-left: 4px solid #000;
            margin: 18px 0;
        }

        .close-modal {
            background: #000;
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 40px;
            margin-top: 10px;
            cursor: pointer;
            font-weight: 600;
            width: 100%;
        }
    </style>
</head>
<body>

<!-- GUIDE MODAL -->
<div class="modal-overlay" id="guideModal">
    <div class="modal-card">
        <h2><i class="fas fa-info-circle" style="margin-right: 8px;"></i> How to use</h2>
        <p><strong>🔐 This tool works exactly like ProBoy‑MD.</strong><br>
        It uses GZIP + Base64 + prefix <code>ProBoy-MD!</code>.</p>
        <p><i class="fas fa-arrow-right"></i> <strong>ENCODE</strong> – Upload <code>creds.json</code> → get session ID.<br>
        <i class="fas fa-arrow-left"></i> <strong>DECODE</strong> – Paste session ID → download <code>creds.json</code>.</p>
        <div class="code-block">
            <i class="fas fa-globe"></i> <strong>Need a session?</strong><br>
            Visit <a href="https://ProBoy-MD.ct.ws" target="_blank">https://ProBoy-MD.ct.ws</a>
        </div>
        <p style="font-size:0.9rem;">✨ Click labels or slide the toggle to switch modes.</p>
        <button class="close-modal" onclick="closeModal()">Got it</button>
    </div>
</div>

<div class="card">
    <div class="header-row">
        <div class="title">
            <h1>ProBoy Session</h1>
            <p>Convert between creds.json & Session ID</p>
        </div>
        <div class="info-icon" onclick="openModal()">
            <i class="fas fa-question"></i>
        </div>
    </div>

    <!-- Short guide line -->
    <div class="toggle-guide">
        <i class="fas fa-arrows-alt-h"></i> Click labels or slide · Default: Decode
    </div>

    <!-- TOGGLE with clickable labels -->
    <div class="toggle-wrapper">
        <span class="toggle-label" id="leftLabel" onclick="setModeFromLabel('decode')">
            Session ID<br>↓<br>creds.json
        </span>
        <label class="switch">
            <input type="checkbox" id="modeToggle" <?= $checkboxChecked ? 'checked' : '' ?> onchange="toggleMode()">
            <span class="slider"></span>
        </label>
        <span class="toggle-label" id="rightLabel" onclick="setModeFromLabel('encode')">
            creds.json<br>↓<br>Session ID
        </span>
    </div>

    <form method="post" enctype="multipart/form-data" id="mainForm">
        <input type="hidden" name="mode" id="modeInput" value="<?= htmlspecialchars($mode) ?>">

        <!-- DECODE PANEL (Session ID → creds.json) -->
        <div class="panel <?= $isDecode ? 'active' : '' ?>" id="panelDecode">
            <div class="form-group">
                <label><i class="fas fa-key"></i> Paste Session ID</label>
                <textarea name="session" placeholder="ProBoy-MD!H4sIAAAAAAAAA5VU266iSBT9l3rVNCBXSU4y..."><?= isset($_POST['session']) ? htmlspecialchars($_POST['session']) : '' ?></textarea>
            </div>
            <button type="submit" class="btn"><i class="fas fa-download"></i> Decode & Download</button>
            <p style="margin-top: 15px; color: #666; font-size:0.9rem;">📌 Download starts automatically on success.</p>
        </div>

        <!-- ENCODE PANEL (creds.json → Session ID) -->
        <div class="panel <?= !$isDecode ? 'active' : '' ?>" id="panelEncode">
            <div class="form-group">
                <label><i class="far fa-file"></i> Choose creds.json</label>
                <div class="file-area" onclick="document.getElementById('credsFile').click();">
                    <span class="file-placeholder" id="fileLabel">Click to select file</span>
                    <input type="file" name="creds" id="credsFile" accept=".json,application/json" onchange="updateFileLabel(this)">
                </div>
            </div>
            <button type="submit" class="btn"><i class="fas fa-lock"></i> Generate Session ID</button>
            <p style="margin-top: 15px; color: #666; font-size:0.9rem;">📌 Session string appears below — copy and use it.</p>
        </div>
    </form>

    <!-- RESULT / ERROR -->
    <?php if ($error): ?>
        <div class="result-box error">
            <div class="result-title"><i class="fas fa-exclamation-triangle"></i> Error</div>
            <div class="result-content"><?= htmlspecialchars($error) ?></div>
        </div>
    <?php elseif ($success && $output): ?>
        <div class="result-box">
            <div class="result-title"><i class="fas fa-check-circle"></i> Session ID generated</div>
            <div class="result-content" id="sessionOutput"><?= htmlspecialchars($output) ?></div>
            <div style="margin-top: 16px; display: flex; align-items: center;">
                <button class="copy-btn" onclick="copySession()"><i class="far fa-copy"></i> Copy</button>
                <span style="color:#555;">Length: <?= strlen($output) ?> chars</span>
            </div>
        </div>
    <?php endif; ?>

    <div class="footnote">
        ⚡ GZIP + Base64 · ProBoy-MD! prefix · <a href="https://ProBoy-MD.ct.ws" target="_blank">Get session</a>
    </div>
</div>

<script>
    // UI elements
    const modeToggle = document.getElementById('modeToggle');
    const leftLabel = document.getElementById('leftLabel');
    const rightLabel = document.getElementById('rightLabel');
    const panelDecode = document.getElementById('panelDecode');
    const panelEncode = document.getElementById('panelEncode');
    const modeInput = document.getElementById('modeInput');

    // Update UI based on checkbox state (checked = encode, unchecked = decode)
    function updateUIFromCheckbox() {
        const isEncode = modeToggle.checked;   // true = encode mode
        const isDecode = !isEncode;

        modeInput.value = isDecode ? 'decode' : 'encode';

        // Show appropriate panel
        panelDecode.classList.toggle('active', isDecode);
        panelEncode.classList.toggle('active', isEncode);

        // Highlight active label (the one corresponding to current mode)
        // leftLabel = decode, rightLabel = encode
        leftLabel.classList.toggle('active-label', isDecode);
        rightLabel.classList.toggle('active-label', isEncode);

        // Also adjust opacity for clarity
        leftLabel.style.opacity = isDecode ? '1' : '0.5';
        rightLabel.style.opacity = isEncode ? '1' : '0.5';
    }

    // Called when toggle is changed by user sliding
    window.toggleMode = function() {
        updateUIFromCheckbox();
    };

    // Called when a label is clicked
    window.setModeFromLabel = function(mode) {
        // mode = 'decode' or 'encode'
        const shouldBeDecode = (mode === 'decode');
        // Set checkbox: decode -> unchecked, encode -> checked
        modeToggle.checked = !shouldBeDecode;
        updateUIFromCheckbox();
    };

    // Initial sync (after page load)
    (function init() {
        updateUIFromCheckbox();
    })();

    // File label update
    window.updateFileLabel = function(input) {
        const label = document.getElementById('fileLabel');
        label.textContent = input.files && input.files.length ? input.files[0].name : 'Click to select file';
    };

    // Copy session
    window.copySession = function() {
        const output = document.getElementById('sessionOutput');
        if (!output) return;
        const text = output.innerText;
        navigator.clipboard?.writeText(text).then(() => {
            alert('✅ Session ID copied!');
        }).catch(() => prompt('Copy manually:', text));
    };

    // Modal controls
    const modal = document.getElementById('guideModal');
    window.openModal = () => modal.style.display = 'flex';
    window.closeModal = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Smooth fade-in
    document.body.style.opacity = '0';
    setTimeout(() => { document.body.style.transition = 'opacity 0.3s'; document.body.style.opacity = '1'; }, 20);
</script>
</body>
</html>