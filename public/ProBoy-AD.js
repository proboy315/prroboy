// ===================================================
// ProBoy Ads Integration - Popup Modal Version
// Apni site me add karein:
//   <script src="https://proboy.vercel.app/ProBoy-AD.js"></script>
// ===================================================

(function() {
    // ---------- Popup Modal Create Karna ----------
    var overlay = document.createElement('div');
    overlay.id = 'proboy-ad-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
        'background:rgba(0,0,0,0.7);z-index:99998;display:flex;align-items:center;justify-content:center;' +
        'opacity:0;transition:opacity 0.4s;pointer-events:none;';

    var modal = document.createElement('div');
    modal.id = 'proboy-ad-modal';
    modal.style.cssText = 'background:#fff;border-radius:12px;padding:20px;max-width:600px;width:90%;' +
        'box-shadow:0 10px 30px rgba(0,0,0,0.5);position:relative;';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:15px;background:transparent;border:none;' +
        'font-size:28px;cursor:pointer;color:#666;line-height:1;';
    closeBtn.onclick = function() {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    };

    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Ad elements ko modal mein redirect karne ka function
    var adContainer = document.createElement('div');
    adContainer.id = 'proboy-ad-content';
    modal.appendChild(adContainer);

    // ---------- document.body.appendChild override (taki ad scripts modal mein inject karein) ----------
    var originalAppendChild = document.body.appendChild.bind(document.body);
    var isOverriding = true;

    document.body.appendChild = function(element) {
        // Agar element ad-related ho (iframe, ins, script, div with ad classes) toh modal mein daalo
        if (element.nodeType === 1) { // element node
            var tag = element.tagName.toLowerCase();
            if (tag === 'iframe' || tag === 'ins' || 
                (tag === 'div' && (element.id && element.id.indexOf('container-') === 0)) ||
                element.className && (element.className.indexOf('ad') !== -1 || element.className.indexOf('banner') !== -1)) {
                adContainer.appendChild(element);
                return element; // return as per spec
            }
            // Agar script tag hai toh usse body mein hi daalna better hai, lekin ad scripts ke liye ho sakta hai
            if (tag === 'script') {
                // Script ko body mein hi daalna safe hai, lekin agar kisi ad script ko container chahiye toh...
                // yahan hum original body mein daal dete hain
                return originalAppendChild(element);
            }
        }
        // Baaki sab kuch original body mein
        return originalAppendChild(element);
    };

    // ---------- Script loader helper ----------
    function addScript(src, async, defer, onload) {
        var script = document.createElement('script');
        script.src = src;
        if (async) script.async = true;
        if (defer) script.defer = true;
        if (onload) script.onload = onload;
        // Script ko body mein inject karte hain, lekin override active hai toh script body mein hi jaayegi
        document.body.appendChild(script);
    }

    // ---------- Ad Loading (ab modal ke andar) ----------
    // 1. HighPerformanceFormat
    window.atOptions = {
        'key' : 'f5f96524f1d727a4af1abc9352c44df5',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
    };
    addScript('https://www.highperformanceformat.com/f5f96524f1d727a4af1abc9352c44df5/invoke.js');

    // 2. EffectiveCPMNetwork ad 1
    addScript('https://pl29588704.effectivecpmnetwork.com/19/c8/73/19c8736edfa0b38cb1b3581f5687f321.js');

    // 3. EffectiveCPMNetwork ad 2 (key based)
    addScript('https://www.effectivecpmnetwork.com/qh0tdzrqqs?key=68481c323c3954a976890daaff7d7e7f');

    // 4. EffectiveCPMNetwork ad 3 – container modal mein daal rahe hain
    var container = document.createElement('div');
    container.id = 'container-5e5e3d1ed4a14a5cee3f81159a362567';
    adContainer.appendChild(container);   // modal ke andar
    var asyncScript = document.createElement('script');
    asyncScript.src = 'https://pl29588706.effectivecpmnetwork.com/5e5e3d1ed4a14a5cee3f81159a362567/invoke.js';
    asyncScript.async = true;
    asyncScript.setAttribute('data-cfasync', 'false');
    document.body.appendChild(asyncScript);   // script body mein hi jaayegi (override active, but script body mein allowed)

    // 5. New ad script (unit)
    addScript('https://pl29596801.effectivecpmnetwork.com/50/ee/e2/50eee2f5ebf1a56b7975c61838060265.js');

    // ---------- Override restore aur popup show karna ----------
    // Kuch seconds baad ads load ho jaane par modal show karte hain
    setTimeout(function() {
        document.body.appendChild = originalAppendChild; // override hatao
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
    }, 4000); // 4 seconds mein zyada tar ads load ho jaayenge
})();
