/**
 * ProBoy Web Editor - Complete Standalone JavaScript
 * Version: 3.0.0
 * Single file, no dependencies, auto-initializing visual website editor.
 * Host at: https://proboy.vercel.app/web-editor.js
 * Inject: <script src="https://proboy.vercel.app/web-editor.js"></script>
 */
(function() {
    'use strict';

    const STATE = {
        isActive: !0,
        selectedElement: null,
        hoveredElement: null,
        isDragging: !1,
        isResizing: !1,
        resizeHandle: null,
        dragStart: { x: 0, y: 0 },
        elementStart: { left: 0, top: 0, width: 0, height: 0 },
        elementOriginalStyles: {},
        history: [],
        historyIndex: -1,
        maxHistory: 200,
        clipboard: null,
        copiedElement: null,
        responsiveMode: 'desktop',
        darkMode: !0,
        accentColor: '#6c5ce7',
        autoSave: !0,
        panels: {},
        toolbarPosition: { x: 16, y: 80 },
        snapThreshold: 5,
        showRulers: !0,
        showGrid: !1,
        gridSize: 20,
        zoom: 1,
        customWidth: 375,
        savedColors: ['#6c5ce7','#00cec9','#e74c3c','#2ecc71','#f39c12','#3498db','#9b59b6','#1abc9c','#e67e22','#34495e','#1abc9c','#2ecc71','#f1c40f','#e74c3c','#ecf0f1'],
        fontFavorites: [],
        assets: [],
        classes: [],
        activeTool: 'select',
        collapsed: !1
    };

    const U = {
        debounce(fn, d) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; },
        throttle(fn, l) { let w = !1; return (...a) => { if (!w) { fn(...a); w = !0; setTimeout(() => w = !1, l); } }; },
        clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
        uid() { return 'pb-' + Math.random().toString(36).substr(2, 9); },
        getPath(el) {
            if (!el || el === document.body) return 'body';
            if (el === document.documentElement) return 'html';
            const p = [];
            let c = el;
            while (c && c !== document.body && c !== document.documentElement && c.parentElement) {
                let s = c.tagName.toLowerCase();
                if (c.id) { s += '#' + c.id; }
                else if (c.classList && c.classList.length) {
                    const cls = Array.from(c.classList).slice(0, 2).map(x => '.' + CSS.escape(x)).join('');
                    if (cls) s += cls;
                }
                const siblings = Array.from(c.parentElement.children).filter(e => e.tagName === c.tagName);
                if (siblings.length > 1) {
                    const idx = siblings.indexOf(c) + 1;
                    s += ':nth-child(' + idx + ')';
                }
                p.unshift(s);
                c = c.parentElement;
            }
            return p.join(' > ') || 'body';
        },
        copyText(txt) {
            if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
            const ta = document.createElement('textarea');
            ta.value = txt;
            ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch(e) {}
            document.body.removeChild(ta);
            return Promise.resolve();
        },
        downloadBlob(blob, name) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
        },
        downloadFile(content, name, type = 'text/html') {
            const blob = new Blob([content], { type });
            this.downloadBlob(blob, name);
        },
        getStyles(el) {
            const s = {};
            const comp = window.getComputedStyle(el);
            const props = ['width','height','min-width','max-width','min-height','max-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','display','position','top','right','bottom','left','overflow','visibility','opacity','z-index','flex-direction','flex-wrap','justify-content','align-items','align-content','gap','order','flex-grow','flex-shrink','aspect-ratio','font-family','font-size','font-weight','font-style','letter-spacing','word-spacing','line-height','text-transform','text-decoration','text-align','white-space','text-shadow','color','background-color','background-image','background-size','background-position','background-repeat','mix-blend-mode','border-top-width','border-right-width','border-bottom-width','border-left-width','border-style','border-color','border-radius','outline-width','outline-style','outline-color','box-shadow','filter','backdrop-filter','transform','transition','animation','cursor','pointer-events','user-select'];
            props.forEach(p => { s[p] = comp.getPropertyValue(p); });
            return s;
        },
        hslToHex(h, s, l) {
            l /= 100;
            const a = s * Math.min(l, 1 - l) / 100;
            const f = n => {
                const k = (n + h / 30) % 12;
                const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return '#' + f(0) + f(8) + f(4);
        }
    };

    class Command {
        constructor(exec, undo, label = '') {
            this.execute = exec;
            this.undoFn = undo;
            this.label = label;
            this.timestamp = Date.now();
        }
    }

    function execCmd(cmd) {
        cmd.execute();
        STATE.history = STATE.history.slice(0, STATE.historyIndex + 1);
        STATE.history.push(cmd);
        if (STATE.history.length > STATE.maxHistory) STATE.history.shift();
        STATE.historyIndex = STATE.history.length - 1;
        refreshHistoryUI();
    }

    function undo() {
        if (STATE.historyIndex >= 0) {
            const cmd = STATE.history[STATE.historyIndex];
            if (cmd.undoFn) cmd.undoFn();
            STATE.historyIndex--;
            refreshHistoryUI();
            refreshOverlay();
            updateStylePanel();
        }
    }

    function redo() {
        if (STATE.historyIndex < STATE.history.length - 1) {
            STATE.historyIndex++;
            const cmd = STATE.history[STATE.historyIndex];
            if (cmd.execute) cmd.execute();
            refreshHistoryUI();
            refreshOverlay();
            updateStylePanel();
        }
    }

    const host = document.createElement('div');
    host.id = 'proboy-editor-host';
    host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483646;pointer-events:none;';
    (document.body || document.documentElement).appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const root = document.createElement('div');
    root.id = 'pb-root';
    root.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483646;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;';
    shadow.appendChild(root);

    const cssVars = document.createElement('style');
    cssVars.textContent = `
        :host {
            --pb-bg:#1a1a2e;--pb-surface:#16213e;--pb-primary:#6c5ce7;--pb-accent:#00cec9;
            --pb-text:#e0e0e0;--pb-text2:#a0a0b8;--pb-border:#2a2a45;--pb-danger:#e74c3c;
            --pb-success:#2ecc71;--pb-warning:#f39c12;--pb-radius:8px;
            --pb-shadow:0 8px 40px rgba(0,0,0,0.55);--pb-transition:0.18s ease;
            --pb-font:'Segoe UI',system-ui,-apple-system,sans-serif;
            --pb-mono:'JetBrains Mono','Fira Code','Consolas',monospace;
        }
        .pb-hidden{display:none!important}.pb-pointer-auto{pointer-events:auto}
        .pb-scrollbar::-webkit-scrollbar{width:5px}.pb-scrollbar::-webkit-scrollbar-track{background:transparent}
        .pb-scrollbar::-webkit-scrollbar-thumb{background:var(--pb-border);border-radius:3px}
    `;
    shadow.appendChild(cssVars);

    const styles = document.createElement('style');
    styles.textContent = `
        .pb-toolbar{position:fixed;z-index:2147483647;pointer-events:auto;display:flex;flex-direction:column;gap:3px;
            background:var(--pb-surface);border:1px solid var(--pb-border);border-radius:12px;padding:7px;
            box-shadow:var(--pb-shadow);user-select:none;-webkit-user-select:none;transition:transform 0.15s ease;min-width:44px}
        .pb-toolbar.collapsed{gap:2px;padding:5px}.pb-toolbar.collapsed .pb-tbtn span{display:none}
        .pb-toolbar.collapsed .pb-tbtn{padding:7px;justify-content:center}
        .pb-tbtn{display:flex;align-items:center;gap:7px;padding:7px 10px;border:none;background:transparent;
            color:var(--pb-text2);border-radius:7px;cursor:pointer;font-size:12px;font-family:var(--pb-font);
            white-space:nowrap;transition:var(--pb-transition);text-align:left;width:100%}
        .pb-tbtn:hover{background:rgba(108,92,231,0.18);color:#fff}
        .pb-tbtn.active{background:var(--pb-primary);color:#fff}
        .pb-tbtn .pb-ico{font-size:16px;width:20px;text-align:center;flex-shrink:0}
        .pb-drag{cursor:grab;padding:4px 8px;text-align:center;color:var(--pb-text2);font-size:13px;border-radius:5px;letter-spacing:2px}
        .pb-drag:hover{background:rgba(255,255,255,0.06)}.pb-drag:active{cursor:grabbing}
        .pb-panel{position:fixed;z-index:2147483647;pointer-events:auto;background:var(--pb-surface);
            border:1px solid var(--pb-border);border-radius:12px;box-shadow:var(--pb-shadow);
            width:290px;max-height:75vh;overflow-y:auto;font-family:var(--pb-font);color:var(--pb-text);font-size:12px}
        .pb-phead{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
            border-bottom:1px solid var(--pb-border);font-weight:600;font-size:13px;position:sticky;top:0;
            background:var(--pb-surface);border-radius:12px 12px 0 0;z-index:1}
        .pb-pbody{padding:10px 14px}
        .pb-pclose{background:none;border:none;color:var(--pb-text2);cursor:pointer;font-size:16px;padding:3px 7px;border-radius:4px}
        .pb-pclose:hover{background:rgba(255,255,255,0.1);color:#fff}
        .pb-inp{width:100%;padding:7px 9px;background:var(--pb-bg);border:1px solid var(--pb-border);border-radius:5px;
            color:var(--pb-text);font-family:var(--pb-font);font-size:11px;transition:var(--pb-transition);box-sizing:border-box}
        .pb-inp:focus{outline:none;border-color:var(--pb-primary);box-shadow:0 0 0 3px rgba(108,92,231,0.12)}
        .pb-lbl{display:block;font-size:10px;color:var(--pb-text2);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.04em;font-weight:600}
        .pb-row{display:flex;gap:6px;align-items:center;margin-bottom:6px}
        .pb-row>*{flex:1}
        .pb-swatch{width:26px;height:26px;border-radius:5px;border:2px solid var(--pb-border);cursor:pointer;flex-shrink:0;transition:var(--pb-transition)}
        .pb-swatch:hover{border-color:#fff}
        .pb-btn{padding:7px 14px;border:none;border-radius:5px;cursor:pointer;font-size:11px;font-weight:600;font-family:var(--pb-font);transition:var(--pb-transition);display:inline-flex;align-items:center;gap:4px;justify-content:center}
        .pb-btn-primary{background:var(--pb-primary);color:#fff}.pb-btn-primary:hover{filter:brightness(1.12)}
        .pb-btn-outline{background:transparent;border:1px solid var(--pb-border);color:var(--pb-text)}
        .pb-btn-outline:hover{border-color:var(--pb-primary)}
        .pb-btn-danger{background:var(--pb-danger);color:#fff}.pb-btn-sm{padding:4px 8px;font-size:10px}
        .pb-overlay{position:fixed;pointer-events:none;z-index:2147483645;border:2px solid var(--pb-primary);border-radius:1px;transition:all 0.08s ease}
        .pb-overlay.sel{border-color:var(--pb-accent);border-width:2px}
        .pb-handle{position:absolute;width:9px;height:9px;background:#fff;border:2px solid var(--pb-accent);border-radius:50%;pointer-events:auto;z-index:2}
        .pb-handle-nw{top:-5px;left:-5px;cursor:nw-resize}.pb-handle-ne{top:-5px;right:-5px;cursor:ne-resize}
        .pb-handle-sw{bottom:-5px;left:-5px;cursor:sw-resize}.pb-handle-se{bottom:-5px;right:-5px;cursor:se-resize}
        .pb-handle-n{top:-5px;left:50%;margin-left:-4px;cursor:n-resize}.pb-handle-s{bottom:-5px;left:50%;margin-left:-4px;cursor:s-resize}
        .pb-handle-e{right:-5px;top:50%;margin-top:-4px;cursor:e-resize}.pb-handle-w{left:-5px;top:50%;margin-top:-4px;cursor:w-resize}
        .pb-dlabel{position:absolute;background:var(--pb-accent);color:#000;font-size:9px;padding:1px 5px;border-radius:3px;
            font-family:var(--pb-mono);pointer-events:none;white-space:nowrap;font-weight:700}
        .pb-hover{position:fixed;pointer-events:none;z-index:2147483644;border:1px dashed rgba(108,92,231,0.55);border-radius:1px;transition:all 0.06s ease}
        .pb-crumb{position:fixed;z-index:2147483647;pointer-events:auto;background:var(--pb-surface);color:var(--pb-text);
            padding:5px 10px;border-radius:16px;font-size:10px;font-family:var(--pb-mono);box-shadow:var(--pb-shadow);
            border:1px solid var(--pb-border);white-space:nowrap;max-width:500px;overflow:hidden;text-overflow:ellipsis}
        .pb-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:2147483648;background:var(--pb-surface);
            color:var(--pb-text);padding:10px 20px;border-radius:20px;font-family:var(--pb-font);font-size:12px;
            box-shadow:var(--pb-shadow);border:1px solid var(--pb-border);pointer-events:auto;animation:pb-up 0.3s ease}
        @keyframes pb-up{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .pb-resp-frame{position:fixed;z-index:2147483646;pointer-events:auto;border:3px solid var(--pb-primary);
            border-radius:8px;box-shadow:0 0 0 9999px rgba(0,0,0,0.75);overflow:hidden;background:#fff}
        .pb-resp-frame iframe{width:100%;height:100%;border:none}
        .pb-colorpop{position:fixed;z-index:2147483648;background:var(--pb-surface);border:1px solid var(--pb-border);
            border-radius:12px;padding:14px;box-shadow:var(--pb-shadow);pointer-events:auto;width:230px}
        .pb-cp-canvas{width:100%;height:140px;border-radius:7px;cursor:crosshair;margin-bottom:7px;display:block}
        .pb-cp-hue{width:100%;height:14px;border-radius:7px;cursor:pointer;margin-bottom:7px;
            background:linear-gradient(to right,red,yellow,lime,cyan,blue,magenta,red)}
        .pb-cp-inputs{display:flex;gap:5px}.pb-cp-inputs input{flex:1;padding:5px;background:var(--pb-bg);
            border:1px solid var(--pb-border);border-radius:4px;color:var(--pb-text);font-size:10px;font-family:var(--pb-mono);text-align:center}
        .pb-sgrid{display:flex;flex-wrap:wrap;gap:3px;margin-top:7px}
        .pb-sdot{width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:var(--pb-transition)}
        .pb-sdot:hover{border-color:#fff;transform:scale(1.15)}
        .pb-hist-item{padding:6px 8px;cursor:pointer;border-radius:4px;font-size:10px;margin-bottom:1px;color:var(--pb-text2);font-family:var(--pb-mono)}
        .pb-hist-item:hover{background:rgba(255,255,255,0.04)}.pb-hist-item.cur{background:rgba(108,92,231,0.25);color:#fff}
        .pb-layer-item{padding:5px 7px;cursor:pointer;font-size:10px;font-family:var(--pb-mono);border-radius:3px;display:flex;align-items:center;gap:5px;transition:var(--pb-transition)}
        .pb-layer-item:hover{background:rgba(255,255,255,0.04)}.pb-layer-item.sel{background:rgba(108,92,231,0.2)}
        .pb-section-title{font-weight:600;font-size:11px;margin:10px 0 6px;color:var(--pb-accent);text-transform:uppercase;letter-spacing:0.05em}
        .pb-divider{height:1px;background:var(--pb-border);margin:8px 0}
    `;
    shadow.appendChild(styles);

    let overlayEl = null, hoverEl = null, crumbEl = null, dlabels = [];
    const openPanels = {};
    let respFrame = null, isDraggingToolbar = !1, tbDragOff = { x: 0, y: 0 };

    function showToast(msg, dur = 2200) {
        const ex = shadow.querySelector('.pb-toast');
        if (ex) ex.remove();
        const t = document.createElement('div');
        t.className = 'pb-toast';
        t.textContent = msg;
        root.appendChild(t);
        setTimeout(() => { if (t.parentNode) t.remove(); }, dur);
    }

    function createOverlays() {
        if (!overlayEl) {
            overlayEl = document.createElement('div');
            overlayEl.className = 'pb-overlay';
            overlayEl.style.display = 'none';
            ['nw','ne','sw','se','n','s','e','w'].forEach(p => {
                const h = document.createElement('div');
                h.className = 'pb-handle pb-handle-' + p;
                h.dataset.handle = p;
                h.addEventListener('pointerdown', e => startResize(e, p));
                overlayEl.appendChild(h);
            });
            root.appendChild(overlayEl);
        }
        if (!hoverEl) {
            hoverEl = document.createElement('div');
            hoverEl.className = 'pb-hover';
            hoverEl.style.display = 'none';
            root.appendChild(hoverEl);
        }
        if (!crumbEl) {
            crumbEl = document.createElement('div');
            crumbEl.className = 'pb-crumb';
            crumbEl.style.display = 'none';
            root.appendChild(crumbEl);
        }
    }

    function selectElement(el) {
        if (!el || el === document.body || el === document.documentElement || el === host || host.contains(el) || (shadow && shadow.contains(el))) return;
        STATE.selectedElement = el;
        refreshOverlay();
        updateCrumb();
        updateStylePanel();
        updateLayersPanel();
        const path = U.getPath(el);
        showToast('Selected: ' + (path.length > 45 ? path.substring(0, 42) + '...' : path), 1600);
    }

    function refreshOverlay() {
        if (!STATE.selectedElement || !overlayEl) return;
        const el = STATE.selectedElement;
        const r = el.getBoundingClientRect();
        overlayEl.style.display = 'block';
        overlayEl.style.left = r.left + 'px';
        overlayEl.style.top = r.top + 'px';
        overlayEl.style.width = r.width + 'px';
        overlayEl.style.height = r.height + 'px';
        overlayEl.classList.add('sel');
        dlabels.forEach(l => l.remove());
        dlabels = [];
        const wl = document.createElement('div');
        wl.className = 'pb-dlabel';
        wl.textContent = Math.round(r.width) + '×' + Math.round(r.height);
        wl.style.cssText += 'top:-20px;left:50%;transform:translateX(-50%);';
        overlayEl.appendChild(wl);
        dlabels.push(wl);
    }

    function updateCrumb() {
        if (!STATE.selectedElement || !crumbEl) { if (crumbEl) crumbEl.style.display = 'none'; return; }
        crumbEl.style.display = 'block';
        crumbEl.textContent = U.getPath(STATE.selectedElement);
        const r = STATE.selectedElement.getBoundingClientRect();
        crumbEl.style.left = Math.max(8, r.left) + 'px';
        crumbEl.style.top = Math.max(8, r.top - 30) + 'px';
    }

    function clearOverlays() {
        if (overlayEl) overlayEl.style.display = 'none';
        if (hoverEl) hoverEl.style.display = 'none';
        if (crumbEl) crumbEl.style.display = 'none';
        dlabels.forEach(l => l.remove());
        dlabels = [];
    }

    function startResize(e, handle) {
        if (!STATE.selectedElement) return;
        e.preventDefault();
        e.stopPropagation();
        STATE.isResizing = !0;
        STATE.resizeHandle = handle;
        STATE.dragStart = { x: e.clientX, y: e.clientY };
        const el = STATE.selectedElement;
        const r = el.getBoundingClientRect();
        STATE.elementStart = { left: r.left, top: r.top, width: r.width, height: r.height };
        STATE.elementOriginalStyles = {
            width: el.style.width, height: el.style.height,
            position: el.style.position, left: el.style.left, top: el.style.top
        };
        if (!el.style.position || el.style.position === 'static') el.style.position = 'relative';
        document.addEventListener('pointermove', onResizeMove, { passive: !1 });
        document.addEventListener('pointerup', onResizeEnd);
    }

    function onResizeMove(e) {
        if (!STATE.isResizing || !STATE.selectedElement) return;
        const el = STATE.selectedElement;
        const dx = e.clientX - STATE.dragStart.x;
        const dy = e.clientY - STATE.dragStart.y;
        const h = STATE.resizeHandle;
        let nw = STATE.elementStart.width, nh = STATE.elementStart.height;
        if (h.includes('e')) nw = Math.max(8, STATE.elementStart.width + dx);
        if (h.includes('w')) { nw = Math.max(8, STATE.elementStart.width - dx); el.style.left = (STATE.elementStart.left + dx) + 'px'; }
        if (h.includes('s')) nh = Math.max(8, STATE.elementStart.height + dy);
        if (h.includes('n')) { nh = Math.max(8, STATE.elementStart.height - dy); el.style.top = (STATE.elementStart.top + dy) + 'px'; }
        el.style.width = nw + 'px';
        el.style.height = nh + 'px';
        refreshOverlay();
    }

    function onResizeEnd() {
        if (STATE.isResizing && STATE.selectedElement) {
            const el = STATE.selectedElement;
            const finalW = el.style.width, finalH = el.style.height;
            const finalL = el.style.left, finalT = el.style.top;
            const origW = STATE.elementOriginalStyles.width || '', origH = STATE.elementOriginalStyles.height || '';
            const origL = STATE.elementOriginalStyles.left || '', origT = STATE.elementOriginalStyles.top || '';
            const origPos = STATE.elementOriginalStyles.position || '';
            const cmd = new Command(
                () => { el.style.width = finalW; el.style.height = finalH; el.style.left = finalL; el.style.top = finalT; },
                () => { el.style.width = origW; el.style.height = origH; el.style.left = origL; el.style.top = origT; el.style.position = origPos; },
                'Resize'
            );
            execCmd(cmd);
        }
        STATE.isResizing = !1;
        STATE.resizeHandle = null;
        document.removeEventListener('pointermove', onResizeMove);
        document.removeEventListener('pointerup', onResizeEnd);
    }

    const toolbar = document.createElement('div');
    toolbar.className = 'pb-toolbar pb-pointer-auto';
    toolbar.id = 'pb-toolbar';
    toolbar.style.left = STATE.toolbarPosition.x + 'px';
    toolbar.style.top = STATE.toolbarPosition.y + 'px';

    const dragHandle = document.createElement('div');
    dragHandle.className = 'pb-drag';
    dragHandle.textContent = '⋮⋮ ProBoy ⋮⋮';
    dragHandle.title = 'Drag toolbar';
    dragHandle.addEventListener('pointerdown', e => {
        isDraggingToolbar = !0;
        const r = toolbar.getBoundingClientRect();
        tbDragOff.x = e.clientX - r.left;
        tbDragOff.y = e.clientY - r.top;
        toolbar.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    toolbar.appendChild(dragHandle);

    document.addEventListener('pointermove', e => {
        if (!isDraggingToolbar) return;
        const x = e.clientX - tbDragOff.x;
        const y = e.clientY - tbDragOff.y;
        toolbar.style.left = U.clamp(x, 0, window.innerWidth - 50) + 'px';
        toolbar.style.top = U.clamp(y, 0, window.innerHeight - 40) + 'px';
        STATE.toolbarPosition = { x: parseFloat(toolbar.style.left), y: parseFloat(toolbar.style.top) };
    });
    document.addEventListener('pointerup', () => { isDraggingToolbar = !1; });

    const toolDefs = [
        { id: 'select', ico: '🖱️', label: 'Select', action: 'select' },
        { id: 'move', ico: '↕️', label: 'Move', action: 'move' },
        { id: 'text', ico: '📝', label: 'Text', action: 'text' },
        { id: 'styles', ico: '🎨', label: 'Styles', action: 'panel:styles' },
        { id: 'layers', ico: '📑', label: 'Layers', action: 'panel:layers' },
        { id: 'dom', ico: '🌳', label: 'DOM', action: 'panel:dom' },
        { id: 'assets', ico: '📁', label: 'Assets', action: 'panel:assets' },
        { id: 'history', ico: '⏳', label: 'History', action: 'panel:history' },
        { id: 'responsive', ico: '📱', label: 'Resp.', action: 'responsive' },
        { id: 'screenshot', ico: '📸', label: 'Shot', action: 'screenshot' },
        { id: 'export', ico: '📥', label: 'Export', action: 'export' },
        { id: 'settings', ico: '⚙️', label: 'Settings', action: 'panel:settings' },
    ];

    toolDefs.forEach(td => {
        const btn = document.createElement('button');
        btn.className = 'pb-tbtn';
        btn.id = 'pb-tool-' + td.id;
        btn.innerHTML = '<span class="pb-ico">' + td.ico + '</span><span>' + td.label + '</span>';
        btn.title = td.label;
        btn.addEventListener('click', () => handleTool(td));
        if (td.id === 'select') btn.classList.add('active');
        toolbar.appendChild(btn);
    });

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'pb-tbtn';
    collapseBtn.innerHTML = '<span class="pb-ico">◀</span><span>Collapse</span>';
    collapseBtn.title = 'Toggle collapse';
    collapseBtn.addEventListener('click', () => {
        STATE.collapsed = !STATE.collapsed;
        toolbar.classList.toggle('collapsed', STATE.collapsed);
        collapseBtn.querySelector('.pb-ico').textContent = STATE.collapsed ? '▶' : '◀';
    });
    toolbar.appendChild(collapseBtn);
    root.appendChild(toolbar);

    function handleTool(td) {
        const allBtns = toolbar.querySelectorAll('.pb-tbtn');
        allBtns.forEach(b => b.classList.remove('active'));
        const btn = toolbar.querySelector('#pb-tool-' + td.id);
        if (btn) btn.classList.add('active');

        switch (td.action) {
            case 'select': STATE.activeTool = 'select'; showToast('🖱️ Select mode'); break;
            case 'move': STATE.activeTool = 'move'; showToast('↕️ Move mode - drag elements'); break;
            case 'text': STATE.activeTool = 'text'; showToast('📝 Text mode - double-click to edit'); break;
            case 'responsive': toggleResponsive(); break;
            case 'screenshot': takeScreenshot(); break;
            case 'export': exportProject(); break;
            default:
                if (td.action.startsWith('panel:')) {
                    const pname = td.action.split(':')[1];
                    togglePanel(pname);
                }
        }
    }

    function togglePanel(name) {
        if (openPanels[name]) {
            openPanels[name].remove();
            delete openPanels[name];
            return;
        }
        const panel = buildPanel(name);
        if (panel) {
            openPanels[name] = panel;
            root.appendChild(panel);
            positionPanel(panel);
        }
    }

    function positionPanel(panel) {
        const tr = toolbar.getBoundingClientRect();
        const pw = 290;
        let left = tr.right + 10;
        if (left + pw > window.innerWidth - 15) left = tr.left - pw - 10;
        if (left < 8) left = 8;
        panel.style.left = left + 'px';
        panel.style.top = Math.max(8, tr.top) + 'px';
    }

    function buildPanel(name) {
        const panel = document.createElement('div');
        panel.className = 'pb-panel pb-pointer-auto pb-scrollbar';
        panel.dataset.panel = name;
        const head = document.createElement('div');
        head.className = 'pb-phead';
        const titles = { styles:'🎨 Style Editor', layers:'📑 Layers', dom:'🌳 DOM Tree', assets:'📁 Assets', history:'⏳ History', settings:'⚙️ Settings' };
        head.innerHTML = '<span>' + (titles[name] || name) + '</span>';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pb-pclose';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', () => { panel.remove(); delete openPanels[name]; });
        head.appendChild(closeBtn);
        panel.appendChild(head);
        const body = document.createElement('div');
        body.className = 'pb-pbody';
        switch (name) {
            case 'styles': fillStylePanel(body); break;
            case 'layers': fillLayersPanel(body); break;
            case 'dom': fillDOMPanel(body); break;
            case 'assets': fillAssetsPanel(body); break;
            case 'history': fillHistoryPanel(body); break;
            case 'settings': fillSettingsPanel(body); break;
        }
        panel.appendChild(body);
        return panel;
    }

    function updateStylePanel() {
        const panel = openPanels['styles'];
        if (!panel) return;
        const body = panel.querySelector('.pb-pbody');
        if (body) { body.innerHTML = ''; fillStylePanel(body); }
    }

    function updateLayersPanel() {
        const panel = openPanels['layers'];
        if (!panel) return;
        const body = panel.querySelector('.pb-pbody');
        if (body) { body.innerHTML = ''; fillLayersPanel(body); }
    }

    function refreshHistoryUI() {
        const panel = openPanels['history'];
        if (!panel) return;
        const body = panel.querySelector('.pb-pbody');
        if (body) { body.innerHTML = ''; fillHistoryPanel(body); }
    }

    function fillStylePanel(body) {
        if (!STATE.selectedElement) {
            body.innerHTML = '<p style="color:var(--pb-text2);text-align:center;padding:16px;">Select an element</p>';
            return;
        }
        const el = STATE.selectedElement;
        const comp = window.getComputedStyle(el);
        const sections = [
            { t:'📐 Layout', p:['width','height','min-width','max-width','min-height','max-height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','display','position','top','right','bottom','left','overflow','z-index','opacity'] },
            { t:'🔤 Type', p:['font-family','font-size','font-weight','font-style','letter-spacing','line-height','text-transform','text-align','color'] },
            { t:'🎨 BG & Border', p:['background-color','background-image','background-size','border-radius','box-shadow'] },
            { t:'✨ Effects', p:['filter','transform','transition','cursor'] }
        ];
        sections.forEach(sec => {
            const st = document.createElement('div');
            st.className = 'pb-section-title';
            st.textContent = sec.t;
            body.appendChild(st);
            sec.p.forEach(prop => {
                const row = document.createElement('div');
                row.className = 'pb-row';
                const lbl = document.createElement('label');
                lbl.className = 'pb-lbl';
                lbl.textContent = prop.replace(/-/g,' ');
                lbl.style.flex = '0 0 85px';
                lbl.style.fontSize = '9px';
                const inp = document.createElement('input');
                inp.className = 'pb-inp';
                inp.value = comp.getPropertyValue(prop) || '';
                inp.style.fontSize = '10px';
                const origVal = comp.getPropertyValue(prop) || '';
                inp.addEventListener('change', () => {
                    const newVal = inp.value;
                    const cmd = new Command(
                        () => { el.style.setProperty(prop, newVal); },
                        () => { el.style.setProperty(prop, origVal); },
                        'Set ' + prop
                    );
                    execCmd(cmd);
                    refreshOverlay();
                });
                row.appendChild(lbl);
                row.appendChild(inp);
                body.appendChild(row);
            });
        });
        const cr = document.createElement('div');
        cr.className = 'pb-row';
        cr.style.marginTop = '8px';
        const sw = document.createElement('div');
        sw.className = 'pb-swatch';
        sw.style.backgroundColor = comp.getPropertyValue('background-color') || '#fff';
        sw.addEventListener('click', () => openColorPicker(sw, el, 'background-color'));
        cr.appendChild(sw);
        const sw2 = document.createElement('div');
        sw2.className = 'pb-swatch';
        sw2.style.backgroundColor = comp.getPropertyValue('color') || '#000';
        sw2.addEventListener('click', () => openColorPicker(sw2, el, 'color'));
        cr.appendChild(sw2);
        body.appendChild(cr);
    }

    function openColorPicker(swatchEl, targetEl, property) {
        const existing = root.querySelector('.pb-colorpop');
        if (existing) { existing.remove(); return; }
        const pop = document.createElement('div');
        pop.className = 'pb-colorpop pb-pointer-auto';
        const sr = swatchEl.getBoundingClientRect();
        pop.style.left = U.clamp(sr.left, 10, window.innerWidth - 250) + 'px';
        pop.style.top = U.clamp(sr.bottom + 8, 10, window.innerHeight - 360) + 'px';
        const canvas = document.createElement('canvas');
        canvas.className = 'pb-cp-canvas';
        canvas.width = 200;
        canvas.height = 130;
        const ctx = canvas.getContext('2d');
        let hue = 270, satX = 0.7, briY = 0.5;
        function draw() {
            const gH = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gH.addColorStop(0, '#fff');
            gH.addColorStop(1, `hsl(${hue},100%,50%)`);
            ctx.fillStyle = gH;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const gV = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gV.addColorStop(0, 'transparent');
            gV.addColorStop(1, '#000');
            ctx.fillStyle = gV;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const mx = satX * canvas.width, my = briY * canvas.height;
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI*2); ctx.stroke();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI*2); ctx.stroke();
        }
        draw();
        canvas.addEventListener('pointerdown', e => {
            const r = canvas.getBoundingClientRect();
            satX = U.clamp((e.clientX - r.left) / r.width, 0, 1);
            briY = U.clamp((e.clientY - r.top) / r.height, 0, 1);
            draw(); update();
        });
        canvas.addEventListener('pointermove', e => {
            if (e.buttons !== 1) return;
            const r = canvas.getBoundingClientRect();
            satX = U.clamp((e.clientX - r.left) / r.width, 0, 1);
            briY = U.clamp((e.clientY - r.top) / r.height, 0, 1);
            draw(); update();
        });
        const hueBar = document.createElement('div');
        hueBar.className = 'pb-cp-hue';
        hueBar.addEventListener('pointerdown', e => {
            const r = hueBar.getBoundingClientRect();
            hue = U.clamp(((e.clientX - r.left) / r.width) * 360, 0, 360);
            draw(); update();
        });
        const inps = document.createElement('div');
        inps.className = 'pb-cp-inputs';
        const hexInp = document.createElement('input');
        hexInp.value = '#6c5ce7';
        hexInp.addEventListener('change', () => {
            targetEl.style.setProperty(property, hexInp.value);
            swatchEl.style.backgroundColor = hexInp.value;
        });
        inps.appendChild(hexInp);
        function update() {
            const hex = U.hslToHex(hue, satX*100, briY*100);
            hexInp.value = hex;
            targetEl.style.setProperty(property, hex);
            swatchEl.style.backgroundColor = hex;
        }
        pop.appendChild(canvas);
        pop.appendChild(hueBar);
        pop.appendChild(inps);
        const sgrid = document.createElement('div');
        sgrid.className = 'pb-sgrid';
        STATE.savedColors.forEach(c => {
            const dot = document.createElement('div');
            dot.className = 'pb-sdot';
            dot.style.backgroundColor = c;
            dot.addEventListener('click', () => {
                targetEl.style.setProperty(property, c);
                swatchEl.style.backgroundColor = c;
                pop.remove();
            });
            sgrid.appendChild(dot);
        });
        pop.appendChild(sgrid);
        root.appendChild(pop);
    }

    function fillLayersPanel(body) {
        const allEls = Array.from(document.querySelectorAll('body *')).filter(e => e !== host && !host.contains(e) && e !== root && !shadow.contains(e));
        const search = document.createElement('input');
        search.className = 'pb-inp';
        search.placeholder = '🔍 Filter layers...';
        search.style.marginBottom = '6px';
        search.addEventListener('input', () => renderLayers(body, allEls, search.value.toLowerCase()));
        body.appendChild(search);
        renderLayers(body, allEls, '');
    }

    function renderLayers(body, allEls, filter) {
        let list = body.querySelector('.pb-layer-list');
        if (list) list.remove();
        list = document.createElement('div');
        list.className = 'pb-layer-list';
        list.style.cssText = 'max-height:380px;overflow-y:auto;';
        let cnt = 0;
        allEls.forEach(el => {
            if (cnt > 150) return;
            const tag = el.tagName.toLowerCase();
            const id = el.id ? '#' + el.id : '';
            const cls = el.classList && el.classList.length ? '.' + Array.from(el.classList).slice(0,2).join('.') : '';
            const label = tag + id + cls;
            if (filter && !label.toLowerCase().includes(filter)) return;
            cnt++;
            const item = document.createElement('div');
            item.className = 'pb-layer-item' + (STATE.selectedElement === el ? ' sel' : '');
            item.innerHTML = '<span style="color:var(--pb-accent);">' + tag + '</span><span style="color:var(--pb-text2);font-size:9px;">' + (id||cls||'') + '</span>';
            item.title = U.getPath(el);
            item.addEventListener('click', () => selectElement(el));
            item.addEventListener('mouseenter', () => { el.style.outline = '2px solid var(--pb-primary)'; });
            item.addEventListener('mouseleave', () => { el.style.outline = ''; });
            list.appendChild(item);
        });
        body.appendChild(list);
    }

    function fillDOMPanel(body) {
        const container = document.createElement('div');
        container.style.cssText = 'max-height:450px;overflow-y:auto;font-family:var(--pb-mono);font-size:10px;';
        function buildNode(node, depth) {
            if (depth > 30 || node.nodeType !== 1) return;
            if (node === host || host.contains(node)) return;
            const div = document.createElement('div');
            div.style.cssText = 'padding-left:' + (depth*12) + 'px;padding:2px 0;cursor:pointer;border-radius:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
            div.innerHTML = '<span style="color:var(--pb-accent);">&lt;' + node.tagName.toLowerCase() + '</span>' +
                (node.id ? '<span style="color:#f39c12;"> #' + node.id + '</span>' : '') +
                (node.classList && node.classList.length ? '<span style="color:var(--pb-text2);"> .' + Array.from(node.classList).slice(0,2).join('.') + '</span>' : '') +
                '<span style="color:var(--pb-accent);">&gt;</span>';
            div.addEventListener('click', e => { e.stopPropagation(); selectElement(node); });
            div.addEventListener('mouseenter', () => { node.style.outline = '1px solid var(--pb-primary)'; });
            div.addEventListener('mouseleave', () => { node.style.outline = ''; });
            if (STATE.selectedElement === node) div.style.background = 'rgba(108,92,231,0.18)';
            container.appendChild(div);
            Array.from(node.children).forEach(c => buildNode(c, depth + 1));
        }
        buildNode(document.body, 0);
        body.appendChild(container);
    }

    function fillAssetsPanel(body) {
        const upBtn = document.createElement('button');
        upBtn.className = 'pb-btn pb-btn-primary';
        upBtn.textContent = '📤 Upload Image';
        upBtn.style.width = '100%';
        upBtn.style.marginBottom = '8px';
        upBtn.addEventListener('click', () => {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = 'image/*';
            inp.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => {
                        STATE.assets.push({ name: file.name, data: ev.target.result, type: file.type });
                        showToast('✅ ' + file.name);
                        fillAssetsPanel(body);
                    };
                    reader.readAsDataURL(file);
                }
            });
            inp.click();
        });
        body.appendChild(upBtn);
        if (STATE.assets.length === 0) {
            body.innerHTML += '<p style="color:var(--pb-text2);text-align:center;padding:12px;font-size:10px;">No assets yet</p>';
        } else {
            STATE.assets.forEach((a, i) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px;border-radius:4px;margin-bottom:3px;background:var(--pb-bg);';
                row.innerHTML = '<img src="' + a.data + '" style="width:36px;height:36px;object-fit:cover;border-radius:3px;"><span style="font-size:10px;flex:1;overflow:hidden;text-overflow:ellipsis;">' + a.name + '</span>';
                const del = document.createElement('button');
                del.className = 'pb-btn pb-btn-sm pb-btn-danger';
                del.textContent = '✕';
                del.addEventListener('click', () => { STATE.assets.splice(i,1); fillAssetsPanel(body); });
                row.appendChild(del);
                body.appendChild(row);
            });
        }
    }

    function fillHistoryPanel(body) {
        const list = document.createElement('div');
        list.className = 'pb-hist-list';
        list.style.cssText = 'max-height:350px;overflow-y:auto;';
        STATE.history.forEach((cmd, i) => {
            const item = document.createElement('div');
            item.className = 'pb-hist-item' + (i === STATE.historyIndex ? ' cur' : '');
            item.textContent = (cmd.label || 'Action ' + (i+1));
            item.addEventListener('click', () => {
                while (STATE.historyIndex > i) undo();
                while (STATE.historyIndex < i) redo();
            });
            list.appendChild(item);
        });
        if (STATE.history.length === 0) list.innerHTML = '<p style="color:var(--pb-text2);text-align:center;padding:12px;font-size:10px;">No history</p>';
        body.appendChild(list);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
        const ub = document.createElement('button');
        ub.className = 'pb-btn pb-btn-outline pb-btn-sm';
        ub.textContent = '↩ Undo';
        ub.addEventListener('click', undo);
        const rb = document.createElement('button');
        rb.className = 'pb-btn pb-btn-outline pb-btn-sm';
        rb.textContent = '↪ Redo';
        rb.addEventListener('click', redo);
        row.appendChild(ub);
        row.appendChild(rb);
        body.appendChild(row);
    }

    function fillSettingsPanel(body) {
        const sets = [
            { l:'Dark Mode', t:'checkbox', g:()=>STATE.darkMode, s:v=>{STATE.darkMode=v;updateTheme();} },
            { l:'Accent Color', t:'color', g:()=>STATE.accentColor, s:v=>{STATE.accentColor=v;updateTheme();} },
            { l:'Auto Save', t:'checkbox', g:()=>STATE.autoSave, s:v=>{STATE.autoSave=v;} },
            { l:'Show Rulers', t:'checkbox', g:()=>STATE.showRulers, s:v=>{STATE.showRulers=v;} },
        ];
        sets.forEach(s => {
            const row = document.createElement('div');
            row.className = 'pb-row';
            row.style.cssText = 'justify-content:space-between;';
            const lbl = document.createElement('span');
            lbl.textContent = s.l;
            lbl.style.cssText = 'font-size:11px;';
            if (s.t === 'checkbox') {
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = s.g();
                cb.addEventListener('change', () => s.s(cb.checked));
                row.appendChild(lbl);
                row.appendChild(cb);
            } else if (s.t === 'color') {
                const inp = document.createElement('input');
                inp.type = 'color';
                inp.value = s.g();
                inp.style.cssText = 'width:36px;height:24px;border:none;cursor:pointer;border-radius:3px;';
                inp.addEventListener('input', () => s.s(inp.value));
                row.appendChild(lbl);
                row.appendChild(inp);
            }
            body.appendChild(row);
        });
        const resetBtn = document.createElement('button');
        resetBtn.className = 'pb-btn pb-btn-danger';
        resetBtn.textContent = '🔄 Reset Editor';
        resetBtn.style.width = '100%';
        resetBtn.style.marginTop = '8px';
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset all editor state? This cannot be undone.')) {
                STATE.history = []; STATE.historyIndex = -1; STATE.selectedElement = null;
                clearOverlays(); showToast('Editor reset');
            }
        });
        body.appendChild(resetBtn);
    }

    function updateTheme() {
        const h = shadow.host;
        if (STATE.darkMode) {
            h.style.setProperty('--pb-bg','#1a1a2e'); h.style.setProperty('--pb-surface','#16213e');
            h.style.setProperty('--pb-text','#e0e0e0'); h.style.setProperty('--pb-text2','#a0a0b8');
            h.style.setProperty('--pb-border','#2a2a45');
        } else {
            h.style.setProperty('--pb-bg','#f0f2f5'); h.style.setProperty('--pb-surface','#ffffff');
            h.style.setProperty('--pb-text','#1a1a1a'); h.style.setProperty('--pb-text2','#666');
            h.style.setProperty('--pb-border','#d0d0d0');
        }
        h.style.setProperty('--pb-primary', STATE.accentColor);
    }

    document.addEventListener('mouseover', U.throttle(e => {
        if (STATE.isDragging || STATE.isResizing || isDraggingToolbar) return;
        const t = e.target;
        if (!t || t === document.body || t === document.documentElement || t === host || host.contains(t) || (shadow && shadow.contains(t))) return;
        if (t !== STATE.hoveredElement) {
            STATE.hoveredElement = t;
            if (hoverEl) {
                const r = t.getBoundingClientRect();
                hoverEl.style.display = 'block';
                hoverEl.style.left = r.left + 'px';
                hoverEl.style.top = r.top + 'px';
                hoverEl.style.width = r.width + 'px';
                hoverEl.style.height = r.height + 'px';
            }
        }
    }, 35));

    document.addEventListener('mouseout', () => {
        if (hoverEl) hoverEl.style.display = 'none';
        STATE.hoveredElement = null;
    });

    document.addEventListener('click', e => {
        if (STATE.isDragging || STATE.isResizing || isDraggingToolbar) return;
        const t = e.target;
        if (!t || t === host || host.contains(t) || (shadow && shadow.contains(t)) || t.closest('#proboy-editor-host')) return;
        if (STATE.activeTool === 'select' || STATE.activeTool === 'move' || STATE.activeTool === 'text') {
            e.preventDefault();
            e.stopPropagation();
            selectElement(t);
        }
    }, !0);

    document.addEventListener('dblclick', e => {
        if (STATE.activeTool !== 'text' || !STATE.selectedElement) return;
        const el = STATE.selectedElement;
        if (el.textContent && el.children.length === 0 && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') {
            e.preventDefault();
            e.stopPropagation();
            el.contentEditable = 'true';
            el.focus();
            showToast('📝 Editing text. Click outside to finish.');
            const finish = () => {
                el.contentEditable = 'false';
                document.removeEventListener('click', finish);
                showToast('✅ Done editing');
            };
            setTimeout(() => document.addEventListener('click', finish), 100);
        }
    }, !0);

    document.addEventListener('pointerdown', e => {
        if (STATE.activeTool !== 'move' || !STATE.selectedElement) return;
        const t = e.target;
        if (t === host || (shadow && shadow.contains(t))) return;
        if (t === STATE.selectedElement || STATE.selectedElement.contains(t)) {
            e.preventDefault();
            STATE.isDragging = !0;
            STATE.dragStart = { x: e.clientX, y: e.clientY };
            const r = STATE.selectedElement.getBoundingClientRect();
            STATE.elementStart = { left: r.left, top: r.top, width: r.width, height: r.height };
            STATE.elementOriginalStyles = {
                position: STATE.selectedElement.style.position,
                left: STATE.selectedElement.style.left,
                top: STATE.selectedElement.style.top
            };
            if (!STATE.selectedElement.style.position || STATE.selectedElement.style.position === 'static')
                STATE.selectedElement.style.position = 'relative';
            document.addEventListener('pointermove', onDragMove, { passive: !1 });
            document.addEventListener('pointerup', onDragEnd);
        }
    });

    function onDragMove(e) {
        if (!STATE.isDragging || !STATE.selectedElement) return;
        const dx = e.clientX - STATE.dragStart.x;
        const dy = e.clientY - STATE.dragStart.y;
        STATE.selectedElement.style.left = (STATE.elementStart.left + dx) + 'px';
        STATE.selectedElement.style.top = (STATE.elementStart.top + dy) + 'px';
        refreshOverlay();
    }

    function onDragEnd() {
        if (STATE.isDragging && STATE.selectedElement) {
            const el = STATE.selectedElement;
            const fl = el.style.left, ft = el.style.top;
            const ol = STATE.elementOriginalStyles.left || '', ot = STATE.elementOriginalStyles.top || '';
            const op = STATE.elementOriginalStyles.position || '';
            const cmd = new Command(
                () => { el.style.left = fl; el.style.top = ft; },
                () => { el.style.left = ol; el.style.top = ot; el.style.position = op; },
                'Move'
            );
            execCmd(cmd);
        }
        STATE.isDragging = !1;
        document.removeEventListener('pointermove', onDragMove);
        document.removeEventListener('pointerup', onDragEnd);
    }

    document.addEventListener('keydown', e => {
        if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
        const ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && e.key === 'z') { e.preventDefault(); undo(); }
        else if (ctrl && (e.key === 'y' || (e.key === 'Z' && e.shiftKey))) { e.preventDefault(); redo(); }
        else if (ctrl && e.key === 'c' && STATE.selectedElement) { e.preventDefault(); STATE.copiedElement = STATE.selectedElement.cloneNode(!0); showToast('📋 Copied'); }
        else if (ctrl && e.key === 'v' && STATE.copiedElement && STATE.selectedElement) { e.preventDefault(); const cl = STATE.copiedElement.cloneNode(!0); STATE.selectedElement.appendChild(cl); showToast('📋 Pasted'); }
        else if (e.key === 'Delete' && STATE.selectedElement && STATE.selectedElement.parentElement) {
            e.preventDefault();
            const el = STATE.selectedElement;
            const parent = el.parentElement;
            const nextSib = el.nextSibling;
            const cmd = new Command(
                () => { el.remove(); },
                () => { if (nextSib) parent.insertBefore(el, nextSib); else parent.appendChild(el); },
                'Delete'
            );
            execCmd(cmd);
            STATE.selectedElement = null;
            clearOverlays();
            updateStylePanel();
        }
        else if (e.key === 'Escape') { STATE.selectedElement = null; clearOverlays(); updateStylePanel(); showToast('Deselected'); }
        else if (ctrl && e.key === 's') { e.preventDefault(); exportProject(); }
        else if (STATE.selectedElement && STATE.activeTool === 'move') {
            const el = STATE.selectedElement;
            const curL = parseInt(el.style.left) || 0, curT = parseInt(el.style.top) || 0;
            let nl = curL, nt = curT;
            if (e.key === 'ArrowUp') { e.preventDefault(); nt -= 1; }
            else if (e.key === 'ArrowDown') { e.preventDefault(); nt += 1; }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); nl -= 1; }
            else if (e.key === 'ArrowRight') { e.preventDefault(); nl += 1; }
            if (nl !== curL || nt !== curT) {
                el.style.left = nl + 'px';
                el.style.top = nt + 'px';
                refreshOverlay();
            }
        }
    });

    function toggleResponsive() {
        if (respFrame) { respFrame.remove(); respFrame = null; showToast('📱 Responsive off'); return; }
        const presets = { desktop:{w:1440,h:800}, laptop:{w:1024,h:700}, tablet:{w:768,h:900}, mobile:{w:375,h:700} };
        const preset = presets[STATE.responsiveMode] || presets.desktop;
        respFrame = document.createElement('div');
        respFrame.className = 'pb-resp-frame pb-pointer-auto';
        respFrame.style.width = preset.w + 'px';
        respFrame.style.height = preset.h + 'px';
        respFrame.style.left = '50%';
        respFrame.style.top = '50%';
        respFrame.style.transform = 'translate(-50%,-50%)';
        const iframe = document.createElement('iframe');
        iframe.srcdoc = document.documentElement.outerHTML;
        respFrame.appendChild(iframe);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'position:absolute;top:6px;right:6px;z-index:5;padding:5px 10px;background:var(--pb-primary);color:#fff;border:none;border-radius:4px;cursor:pointer;font-family:var(--pb-font);font-size:12px;';
        closeBtn.addEventListener('click', () => { respFrame.remove(); respFrame = null; });
        respFrame.appendChild(closeBtn);
        root.appendChild(respFrame);
        showToast('📱 ' + STATE.responsiveMode + ' (' + preset.w + 'px)');
    }

    function takeScreenshot() {
        showToast('📸 Capturing...');
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(window.innerWidth, 1920);
        canvas.height = Math.min(window.innerHeight, 1080);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📸 ProBoy Screenshot', canvas.width/2, canvas.height/2);
        ctx.font = '13px sans-serif';
        ctx.fillText('Use browser DevTools for full captures', canvas.width/2, canvas.height/2 + 35);
        canvas.toBlob(blob => {
            U.downloadBlob(blob, 'proboy-screenshot.png');
            showToast('✅ Downloaded');
        });
    }

    function exportProject() {
        showToast('📥 Building export...');
        let customCSS = '';
        const allStyled = document.querySelectorAll('body [style]');
        const seen = new Set();
        allStyled.forEach(el => {
            if (!el.style.cssText || !el.style.cssText.trim()) return;
            if (el === host || host.contains(el)) return;
            const sel = U.getPath(el);
            if (seen.has(sel)) return;
            seen.add(sel);
            customCSS += sel + ' {\n  ' + el.style.cssText.replace(/;/g, ';\n  ') + '\n}\n\n';
        });
        const htmlClone = document.documentElement.cloneNode(!0);
        const editorHost = htmlClone.querySelector('#proboy-editor-host');
        if (editorHost) editorHost.remove();
        const htmlStr = '<!DOCTYPE html>\n' + htmlClone.outerHTML;
        const files = {
            'index.html': htmlStr,
            'styles.css': customCSS || '/* No custom styles */',
            'script.js': '// Exported from ProBoy Editor\nconsole.log("ProBoy project");'
        };

        const popup = document.createElement('div');
        popup.className = 'pb-panel pb-pointer-auto';
        popup.style.cssText += 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:360px;z-index:2147483649;';
        popup.innerHTML = '<div class="pb-phead"><span>📥 Export Project</span><button class="pb-pclose" id="pb-exp-close">✕</button></div>' +
            '<div class="pb-pbody">' +
            '<p style="font-size:10px;color:var(--pb-text2);margin-bottom:8px;">All edits included. Download your project:</p>' +
            '<button class="pb-btn pb-btn-primary" style="width:100%;margin-bottom:5px;" id="pb-exp-html">📄 Download HTML</button>' +
            '<button class="pb-btn pb-btn-outline" style="width:100%;margin-bottom:5px;" id="pb-exp-css">🎨 Download CSS</button>' +
            '<button class="pb-btn pb-btn-outline" style="width:100%;margin-bottom:5px;" id="pb-exp-js">📜 Download JS</button>' +
            '<button class="pb-btn pb-btn-primary" style="width:100%;margin-bottom:5px;" id="pb-exp-bundle">📦 Download Bundle</button>' +
            '<button class="pb-btn pb-btn-outline" style="width:100%;margin-bottom:5px;" id="pb-exp-clip">📋 Copy HTML</button>' +
            '</div>';
        root.appendChild(popup);

        popup.querySelector('#pb-exp-close').addEventListener('click', () => popup.remove());
        popup.querySelector('#pb-exp-html').addEventListener('click', () => { U.downloadFile(files['index.html'], 'index.html'); popup.remove(); });
        popup.querySelector('#pb-exp-css').addEventListener('click', () => { U.downloadFile(files['styles.css'], 'styles.css', 'text/css'); popup.remove(); });
        popup.querySelector('#pb-exp-js').addEventListener('click', () => { U.downloadFile(files['script.js'], 'script.js', 'application/javascript'); popup.remove(); });
        popup.querySelector('#pb-exp-bundle').addEventListener('click', () => {
            let bundle = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n<title>ProBoy Export</title>\n<style>\n' + files['styles.css'] + '\n</style>\n</head>\n<body>\n' + (files['index.html'].replace(/<!DOCTYPE html>\n?/i,'').replace(/<html[^>]*>/i,'').replace(/<\/html>/i,'').replace(/<head>[\s\S]*?<\/head>/i,'').replace(/<body[^>]*>/i,'').replace(/<\/body>/i,'')) + '\n<script>\n' + files['script.js'] + '\n<\/script>\n</body>\n</html>';
            U.downloadFile(bundle, 'proboy-bundle.html');
            popup.remove();
        });
        popup.querySelector('#pb-exp-clip').addEventListener('click', () => { U.copyText(files['index.html']).then(() => showToast('📋 HTML copied!')); popup.remove(); });
    }

    function init() {
        createOverlays();
        updateTheme();
        showToast('🚀 ProBoy Web Editor Ready', 3000);
        console.log('%c🎨 ProBoy Web Editor %cv3.0',
            'font-size:16px;color:#6c5ce7;font-weight:bold;', 'color:#00cec9;');
        console.log('%c🖱️ Hover→Click→Edit→Export | Ctrl+Z undo | Ctrl+S export',
            'color:#a0a0b8;font-size:11px;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ProBoyEditor = {
        selectElement, undo, redo, exportProject, takeScreenshot,
        showToast, getState: () => STATE, togglePanel,
        refreshOverlay, clearOverlays
    };

    console.log('%c✅ ProBoy injected %c| API: window.ProBoyEditor',
        'background:#6c5ce7;color:#fff;padding:3px 10px;border-radius:12px;font-size:10px;',
        'color:#00cec9;font-size:10px;');

})();
