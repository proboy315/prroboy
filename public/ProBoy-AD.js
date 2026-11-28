// ===================================================
// ProBoy Ads Integration 
// Apni site me add karein:
//   <script src="https://proboy.vercel.app/ProBoy-AD.js"></script>
// ===================================================

// proboy-ads.js - All-in-one ad loader by ProBoy
(function() {
    // Helper function to add script tag
    function addScript(src, async = false, defer = false, onload = null) {
        var script = document.createElement('script');
        script.src = src;
        if (async) script.async = true;
        if (defer) script.defer = true;
        if (onload) script.onload = onload;
        document.body.appendChild(script);
    }

    // 1. HighPerformanceFormat ad (requires atOptions)
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

    // 4. EffectiveCPMNetwork ad 3 (async with container) - we'll also create container div
    var container = document.createElement('div');
    container.id = 'container-5e5e3d1ed4a14a5cee3f81159a362567';
    document.body.appendChild(container);
    var asyncScript = document.createElement('script');
    asyncScript.src = 'https://pl29588706.effectivecpmnetwork.com/5e5e3d1ed4a14a5cee3f81159a362567/invoke.js';
    asyncScript.async = true;
    asyncScript.setAttribute('data-cfasync', 'false');
    document.body.appendChild(asyncScript);

    // 5. New ad script provided by user (unit)
    addScript('https://pl29596801.effectivecpmnetwork.com/50/ee/e2/50eee2f5ebf1a56b7975c61838060265.js');
})();
