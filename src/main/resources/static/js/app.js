// src/main/resources/static/js/app.js
'use strict';

const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'text/plain', lineNumbers: true, lineWrapping: true, tabSize: 4,
    extraKeys: { 'Ctrl-Enter': () => renderDiagram(), 'Cmd-Enter': () => renderDiagram() }
});

let currentSettings = {}, renderCount = 0, renderTimer = null;

async function init() { await loadSettings(); renderDiagram(); }

async function loadSettings() {
    const res = await fetch('/api/settings');
    currentSettings = await res.json();
    applyMermaidConfig(currentSettings);
    populateSettingsForm(currentSettings);
}

function buildMermaidConfig(s) {
    return {
        startOnLoad: false, theme: s.theme, fontFamily: s.fontFamily,
        fontSize: s.fontSize, htmlLabels: s.htmlLabels,
        securityLevel: s.securityLevel, maxTextSize: s.maxTextSize,
        flowchart: { nodeSpacing: s.flowchartNodeSpacing, rankSpacing: s.flowchartRankSpacing,
                     wrappingWidth: s.flowchartWrappingWidth, curve: s.flowchartCurve },
        sequence: { messageMargin: s.sequenceMessageMargin, mirrorActors: s.sequenceMirrorActors,
                    boxMargin: s.sequenceBoxMargin },
        er: { entityPadding: s.erEntityPadding, layoutDirection: s.erLayoutDirection },
        diagramPadding: s.diagramPadding
    };
}
function applyMermaidConfig(s) { mermaid.initialize(buildMermaidConfig(s)); }

async function renderDiagram() {
    const code = editor.getValue().trim();
    const output = document.getElementById('diagram-output');
    const status = document.getElementById('render-status');
    if (!code) { output.innerHTML = ''; status.textContent = ''; return; }
    try {
        const { svg } = await mermaid.render('mermaid-' + (++renderCount), code);
        output.innerHTML = svg;
        const svgEl = output.querySelector('svg');
        if (svgEl && currentSettings.zoom && currentSettings.zoom !== 1.0) {
            svgEl.style.transform = `scale(${currentSettings.zoom})`;
            svgEl.style.transformOrigin = 'top left';
        }
        status.textContent = '✓'; status.className = 'render-status status-ok';
    } catch (err) {
        status.textContent = '✗ ' + (err.message || String(err)).split('\n')[0];
        status.className = 'render-status status-error';
    }
}

editor.on('change', () => { clearTimeout(renderTimer); renderTimer = setTimeout(renderDiagram, 500); });

document.getElementById('btn-export').addEventListener('click', () => {
    const svgEl = document.querySelector('#diagram-output svg');
    if (!svgEl) { alert('Нет диаграммы для экспорта'); return; }
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'diagram.svg' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

const settingsPanel = document.getElementById('settings-panel');
const settingsOverlay = document.getElementById('settings-overlay');
document.getElementById('btn-settings').addEventListener('click', openSettings);
document.getElementById('btn-close-settings').addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', closeSettings);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); });

function openSettings()  { populateSettingsForm(currentSettings); settingsPanel.classList.add('open'); settingsOverlay.classList.add('visible'); }
function closeSettings() { settingsPanel.classList.remove('open'); settingsOverlay.classList.remove('visible'); }

function populateSettingsForm(s) {
    setVal('s-theme', s.theme); setVal('s-fontFamily', s.fontFamily);
    setVal('s-fontSize', s.fontSize); setChk('s-htmlLabels', s.htmlLabels);
    setVal('s-securityLevel', s.securityLevel); setVal('s-maxTextSize', s.maxTextSize);
    setVal('s-nodeSpacing', s.flowchartNodeSpacing); setVal('s-rankSpacing', s.flowchartRankSpacing);
    setVal('s-wrappingWidth', s.flowchartWrappingWidth); setVal('s-curve', s.flowchartCurve);
    setVal('s-msgMargin', s.sequenceMessageMargin); setChk('s-mirrorActors', s.sequenceMirrorActors);
    setVal('s-boxMargin', s.sequenceBoxMargin); setVal('s-erPadding', s.erEntityPadding);
    setVal('s-erDirection', s.erLayoutDirection); setVal('s-diagramPadding', s.diagramPadding);
    setVal('s-zoom', Math.round((s.zoom || 1.0) * 100));
}

function collectSettingsForm() {
    return {
        theme: getVal('s-theme'), fontFamily: getVal('s-fontFamily'),
        fontSize: getInt('s-fontSize'), htmlLabels: getChk('s-htmlLabels'),
        securityLevel: getVal('s-securityLevel'), maxTextSize: getInt('s-maxTextSize'),
        flowchartNodeSpacing: getInt('s-nodeSpacing'), flowchartRankSpacing: getInt('s-rankSpacing'),
        flowchartWrappingWidth: getInt('s-wrappingWidth'), flowchartCurve: getVal('s-curve'),
        sequenceMessageMargin: getInt('s-msgMargin'), sequenceMirrorActors: getChk('s-mirrorActors'),
        sequenceBoxMargin: getInt('s-boxMargin'), erEntityPadding: getInt('s-erPadding'),
        erLayoutDirection: getVal('s-erDirection'), diagramPadding: getInt('s-diagramPadding'),
        zoomPercent: getInt('s-zoom')
    };
}

document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const res = await fetch('/api/settings', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(collectSettingsForm()) });
    if (res.ok) { currentSettings = await res.json(); applyMermaidConfig(currentSettings); closeSettings(); renderDiagram(); }
    else { const e = await res.json(); const [k, v] = Object.entries(e)[0]; alert(`${k}: ${v}`); }
});

document.getElementById('btn-reset-settings').addEventListener('click', async () => {
    const res = await fetch('/api/settings/reset', { method: 'POST' });
    if (res.ok) { currentSettings = await res.json(); applyMermaidConfig(currentSettings); populateSettingsForm(currentSettings); renderDiagram(); }
});

// Drag-to-resize
const divider = document.getElementById('divider');
const editorPane = document.querySelector('.pane-editor');
let dragging = false;
divider.addEventListener('mousedown', () => { dragging = true; divider.classList.add('dragging'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; });
document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const r = document.querySelector('.split-layout').getBoundingClientRect();
    editorPane.style.flex = `0 0 ${Math.min(Math.max(((e.clientX - r.left) / r.width) * 100, 20), 80)}%`;
    editor.refresh();
});
document.addEventListener('mouseup', () => { if (!dragging) return; dragging = false; divider.classList.remove('dragging'); document.body.style.cursor = ''; document.body.style.userSelect = ''; editor.refresh(); });

// Helpers
const getVal = id => document.getElementById(id).value;
const getInt = id => parseInt(document.getElementById(id).value, 10);
const getChk = id => document.getElementById(id).checked;
const setVal = (id, v) => { document.getElementById(id).value   = v; };
const setChk = (id, v) => { document.getElementById(id).checked = v; };

init();