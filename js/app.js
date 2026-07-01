/* ===================================================
   APP.JS — CORE APP LOGIC & i18n
   =================================================== */

// ==================== STATE ====================
const AppState = {
  lang: localStorage.getItem('vidai-lang') || 'en',
  selectedTemplate: 'bloom',
  selectedFile: null,
  videoUrl: null,
};

// ==================== LANGUAGE (i18n) ====================

function setLang(lang) {
  AppState.lang = lang;
  localStorage.setItem('vidai-lang', lang);

  const isRtl = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', isRtl);

  // Update all data-en / data-ar elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  // Update language toggle buttons
  ['lang-en', 'lang-ar', 'editor-lang-en', 'editor-lang-ar'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.toggle('active', id.includes(lang === 'ar' ? 'ar' : 'en'));
    }
  });

  // Re-render dynamic components
  if (document.getElementById('templates-grid')) {
    renderTemplateGallery('templates-grid', lang);
    attachTemplateCardEvents();
  }
  if (document.getElementById('editor-template-list')) {
    renderEditorTemplates('editor-template-list', lang);
    attachEditorTemplateEvents();
  }
  if (document.getElementById('effects-list')) {
    renderEffectsList('effects-list', lang);
  }
  if (document.getElementById('filter-grid')) {
    renderFilterGrid('filter-grid', lang);
  }
  if (document.getElementById('template-menu-list')) {
    renderTemplateMenu(lang);
  }
  if (document.getElementById('captions-list')) {
    renderCaptionsList();
  }
}

// ==================== TEMPLATE SELECTION ====================

let selectedTemplateId = 'bloom';

function selectTemplate(id) {
  selectedTemplateId = id;
  AppState.selectedTemplate = id;
  sessionStorage.setItem('vidai-template', id);

  const t = TEMPLATES.find(t => t.id === id);
  if (!t) return;

  // Update chip display
  const chipName = document.getElementById('template-chip-name');
  if (chipName) chipName.textContent = t.name[AppState.lang];

  // Highlight selected in gallery
  document.querySelectorAll('.template-card').forEach(card => {
    card.style.outline = 'none';
    card.style.transform = '';
  });
  const selected = document.getElementById('tpl-card-' + id);
  if (selected) {
    selected.style.outline = '3px solid var(--clr-primary)';
    selected.style.outlineOffset = '3px';
  }

  // Highlight selected in editor panel
  document.querySelectorAll('.template-thumb').forEach(thumb => {
    thumb.classList.remove('selected');
    thumb.setAttribute('aria-checked', 'false');
  });
  const editorThumb = document.getElementById('editor-tpl-' + id);
  if (editorThumb) {
    editorThumb.classList.add('selected');
    editorThumb.setAttribute('aria-checked', 'true');
  }

  // Apply template to canvas
  if (typeof applyTemplateToCanvas === 'function') {
    applyTemplateToCanvas(t);
  }

  showToast('✨ ' + t.name[AppState.lang] + (AppState.lang === 'ar' ? ' مطبّق' : ' template applied'), 'success');
}

function selectTemplateFromMenu(id) {
  selectTemplate(id);
  const menu = document.getElementById('template-menu');
  if (menu) menu.style.display = 'none';
}

function showTemplateMenu() {
  const menu = document.getElementById('template-menu');
  if (!menu) return;
  const isVisible = menu.style.display !== 'none';
  menu.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) renderTemplateMenu(AppState.lang);
}

function attachTemplateCardEvents() {
  // Cards already have onclick from renderTemplateGallery
}

function attachEditorTemplateEvents() {
  // Thumbs already have onclick from renderEditorTemplates
}

// Close template menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('template-menu');
  const chip = document.getElementById('template-chip');
  if (menu && chip && !menu.contains(e.target) && !chip.contains(e.target)) {
    menu.style.display = 'none';
  }
});

// ==================== NAVBAR SCROLL ====================

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
});

// ==================== STATS COUNTER ANIMATION ====================

const STATS_TARGETS = [
  { id: 'stat-1', target: 2.5, suffix: 'M+', decimals: 1 },
  { id: 'stat-2', target: 500, suffix: 'K+', decimals: 0 },
  { id: 'stat-3', target: 50, suffix: '+', decimals: 0 },
  { id: 'stat-4', target: 98, suffix: '%', decimals: 0 },
];

function animateStats() {
  STATS_TARGETS.forEach(stat => {
    const el = document.getElementById(stat.id);
    if (!el) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (eased * stat.target).toFixed(stat.decimals);
      el.textContent = value + stat.suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Trigger stats animation when section is visible
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateStats();
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse both';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==================== PANEL TOGGLES (Editor) ====================

let activeLeftPanel = 'templates';

function toggleLeftPanel(panelId) {
  activeLeftPanel = panelId;

  // Hide all panel content sections
  ['templates', 'text', 'effects', 'music'].forEach(id => {
    const el = document.getElementById(`panel-${id}-content`);
    if (el) el.style.display = id === panelId ? 'block' : 'none';
  });

  // Update sidebar button states
  const sidebarMap = { templates: 'templates', text: 'text', effects: 'effects', music: 'music' };
  Object.entries(sidebarMap).forEach(([key, btnKey]) => {
    const btn = document.getElementById(`sidebar-${btnKey}`);
    if (btn) {
      btn.classList.toggle('active', key === panelId);
      btn.setAttribute('aria-pressed', (key === panelId).toString());
    }
  });

  // Update left panel title
  const titles = {
    templates: { en: 'Templates', ar: 'القوالب' },
    text: { en: 'Add Caption', ar: 'أضف كابشن' },
    effects: { en: 'Effects', ar: 'التأثيرات' },
    music: { en: 'Music', ar: 'الموسيقى' }
  };
  const titleEl = document.getElementById('left-panel-title');
  if (titleEl && titles[panelId]) {
    titleEl.textContent = titles[panelId][AppState.lang];
  }

  // Show panel
  const panel = document.getElementById('left-panel');
  if (panel) panel.classList.remove('collapsed');
}

function closeLeftPanel() {
  const panel = document.getElementById('left-panel');
  if (panel) panel.classList.add('collapsed');

  document.querySelectorAll('.sidebar-icon-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
}

// ==================== RIGHT PANEL TABS ====================

function switchRightTab(tabId) {
  ['captions', 'style', 'export'].forEach(id => {
    const panel = document.getElementById(`right-${id}`);
    const tab = document.getElementById(`tab-${id}`);
    if (panel) panel.style.display = id === tabId ? 'block' : 'none';
    if (tab) {
      tab.classList.toggle('active', id === tabId);
      tab.setAttribute('aria-selected', (id === tabId).toString());
    }
  });
}

// ==================== ASPECT RATIO SELECTOR ====================

function setRatio(ratio) {
  const wrapper = document.getElementById('canvas-wrapper');
  if (!wrapper) return;

  const ratioMap = {
    '9:16': { cls: 'ratio-916', btn: 'ratio-916' },
    '16:9': { cls: 'ratio-169', btn: 'ratio-169' },
    '1:1': { cls: 'ratio-11', btn: 'ratio-11' },
  };

  // Remove all ratio classes
  wrapper.classList.remove('ratio-916', 'ratio-169', 'ratio-11');
  wrapper.classList.add(ratioMap[ratio].cls);

  // Update buttons
  document.querySelectorAll('.aspect-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  const activeBtn = document.getElementById(ratioMap[ratio].btn);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }

  // Update canvas size
  if (typeof resizeCanvas === 'function') resizeCanvas();
  sessionStorage.setItem('vidai-ratio', ratio);
}

// ==================== TRANSITION SELECTOR ====================

let selectedTransition = 'fade';

function setTransition(id) {
  selectedTransition = id;
  document.querySelectorAll('[id^="trans-"]').forEach(btn => btn.classList.remove('active'));
  const btn = document.getElementById(`trans-${id}`);
  if (btn) btn.classList.add('active');
  sessionStorage.setItem('vidai-transition', id);
}

// ==================== EXPORT MODAL ====================

let selectedExportFormat = 'mp4';

function openExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) modal.classList.add('open');
}

function closeExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) modal.classList.remove('open');
  // Reset progress
  const progressSection = document.getElementById('export-progress-section');
  const progressFill = document.getElementById('export-progress-fill');
  if (progressSection) progressSection.style.display = 'none';
  if (progressFill) progressFill.style.width = '0%';
}

function selectExportOption(format) {
  selectedExportFormat = format;
  document.querySelectorAll('.export-option').forEach(opt => opt.classList.remove('selected'));
  const opt = document.getElementById('opt-' + format);
  if (opt) opt.classList.add('selected');
}

async function doExport() {
  if (selectedExportFormat === 'png') {
    exportFrame();
    closeExportModal();
    return;
  }

  const progressSection = document.getElementById('export-progress-section');
  const progressFill = document.getElementById('export-progress-fill');
  const progressLabel = document.getElementById('export-progress-label');
  const exportBtn = document.getElementById('do-export-btn');

  if (progressSection) progressSection.style.display = 'block';
  if (exportBtn) exportBtn.disabled = true;

  // Simulate export progress
  let progress = 0;
  const labels = AppState.lang === 'ar'
    ? ['معالجة الفيديو...', 'إضافة الكابشن...', 'تطبيق التأثيرات...', 'إنهاء التصدير...', 'تم! ✅']
    : ['Processing video...', 'Adding captions...', 'Applying effects...', 'Finalizing export...', 'Done! ✅'];

  for (let i = 0; i <= 100; i += 5) {
    await new Promise(r => setTimeout(r, 100));
    progress = i;
    if (progressFill) progressFill.style.width = i + '%';
    const labelIdx = Math.floor((i / 100) * (labels.length - 1));
    if (progressLabel) progressLabel.textContent = labels[labelIdx];
  }

  // Export frame as PNG (actual working export)
  if (typeof exportFrame === 'function') exportFrame();

  showToast(AppState.lang === 'ar' ? '✅ تم تصدير الفيديو بنجاح!' : '✅ Video exported successfully!', 'success');

  setTimeout(() => {
    closeExportModal();
    if (exportBtn) exportBtn.disabled = false;
  }, 1000);
}

// ==================== FILTER APPLICATION ====================

let selectedVideoEffect = 'none';

function applyVideoEffect(effectId) {
  selectedVideoEffect = effectId;
  const effect = VIDEO_EFFECTS.find(e => e.id === effectId);
  if (!effect) return;

  const video = document.getElementById('video-player');
  if (video) video.style.filter = effect.cssFilter;

  // Update effect/filter buttons
  document.querySelectorAll('[id^="vfx-"], [id^="filter-"]').forEach(btn => btn.classList.remove('active'));
  const vfxBtn = document.getElementById(`vfx-${effectId}`);
  const filterBtn = document.getElementById(`filter-${effectId}`);
  if (vfxBtn) vfxBtn.classList.add('active');
  if (filterBtn) filterBtn.classList.add('active');

  showToast((AppState.lang === 'ar' ? '🎨 تأثير مطبّق: ' : '🎨 Effect applied: ') + effect.name[AppState.lang], 'success');
}

function applyFilter() {
  const brightness = document.getElementById('brightness-slider')?.value || 100;
  const contrast = document.getElementById('contrast-slider')?.value || 100;
  const saturation = document.getElementById('saturation-slider')?.value || 100;

  const video = document.getElementById('video-player');
  if (video) {
    video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  }
}

// ==================== COLOR PICKER ====================

function selectColor(swatchEl, target) {
  const color = swatchEl.dataset.color;
  const row = document.getElementById(`${target}-color-row`);
  if (row) {
    row.querySelectorAll('.color-swatch').forEach(s => {
      s.classList.remove('selected');
      s.setAttribute('aria-checked', 'false');
    });
    swatchEl.classList.add('selected');
    swatchEl.setAttribute('aria-checked', 'true');
  }
  if (target === 'text') {
    window._captionColor = color;
  }
}

function customColor(inputEl, target) {
  if (target === 'text') {
    window._captionColor = inputEl.value;
  }
}

// ==================== UNDO / REDO ====================

const undoStack = [];
const redoStack = [];

function editorUndo() {
  if (undoStack.length === 0) return;
  const state = undoStack.pop();
  redoStack.push(state);
  showToast(AppState.lang === 'ar' ? '↩ تم التراجع' : '↩ Undone', 'info');
}

function editorRedo() {
  if (redoStack.length === 0) return;
  const state = redoStack.pop();
  undoStack.push(state);
  showToast(AppState.lang === 'ar' ? '↪ تم الإعادة' : '↪ Redone', 'info');
}

// ==================== PROCESSING PAGE ANIMATION ====================

const processingSteps = [
  { delay: 0,    duration: 700,  status: { en: 'Uploading your video...', ar: 'رفع فيديوك...' } },
  { delay: 700,  duration: 900,  status: { en: 'Analyzing video content...', ar: 'تحليل محتوى الفيديو...' } },
  { delay: 1600, duration: 900,  status: { en: 'Generating AI captions...', ar: 'توليد كابشن بالذكاء الاصطناعي...' } },
  { delay: 2500, duration: 900,  status: { en: 'Applying effects & transitions...', ar: 'تطبيق التأثيرات والانتقالات...' } },
  { delay: 3400, duration: 600,  status: { en: 'Finalizing your project...', ar: 'إنهاء مشروعك...' } },
];

function runProcessingSequence() {
  const totalDuration = 4000;
  const statusEl = document.getElementById('processing-status');
  const progressFill = document.getElementById('progress-fill');
  const progressBar = document.getElementById('progress-bar-wrapper');
  const lang = AppState.lang;

  // Rotate tips
  let tipIdx = 0;
  const tipInterval = setInterval(() => {
    const tipEl = document.getElementById('processing-tip');
    if (tipEl) {
      tipEl.style.opacity = 0;
      setTimeout(() => {
        const tip = PROCESSING_TIPS[tipIdx % PROCESSING_TIPS.length];
        tipEl.querySelector('[data-en]')?.remove();
        tipEl.textContent = tip[lang];
        tipEl.style.opacity = 1;
        tipIdx++;
      }, 300);
    }
  }, 3000);

  // Run steps
  processingSteps.forEach((step, i) => {
    // Set step to running
    setTimeout(() => {
      if (statusEl) statusEl.textContent = step.status[lang];

      const stepEl = document.getElementById(`step-${i}`);
      const statusIcon = document.getElementById(`step-status-${i}`);
      if (stepEl) stepEl.classList.add('active');
      if (statusIcon) {
        statusIcon.className = 'step-status-icon running';
        statusIcon.textContent = '';
      }

      // Update progress
      const pct = Math.round(((step.delay + step.duration / 2) / totalDuration) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', pct);

    }, step.delay);

    // Complete step
    setTimeout(() => {
      const stepEl = document.getElementById(`step-${i}`);
      const statusIcon = document.getElementById(`step-status-${i}`);
      if (stepEl) { stepEl.classList.remove('active'); stepEl.classList.add('done'); }
      if (statusIcon) { statusIcon.className = 'step-status-icon done'; statusIcon.textContent = '✓'; }
    }, step.delay + step.duration);
  });

  // Complete
  setTimeout(() => {
    if (progressFill) progressFill.style.width = '100%';
    if (progressBar) progressBar.setAttribute('aria-valuenow', 100);
    if (statusEl) statusEl.textContent = lang === 'ar' ? '✅ جاهز! جارٍ الانتقال للمحرر...' : '✅ Done! Opening editor...';
    clearInterval(tipInterval);

    setTimeout(() => {
      window.location.href = 'editor.html';
    }, 600);
  }, totalDuration);
}

// ==================== AUTO-GENERATE CAPTIONS ====================

function autoGenerateCaptions() {
  const lang = AppState.lang;
  const captions = lang === 'ar' ? SAMPLE_CAPTIONS_AR : SAMPLE_CAPTIONS;
  const t = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  window._captions = captions.map(c => ({ ...c, color: t.textColor, fontFamily: t.fontFamily }));
  renderCaptionsList();
  renderTimelineBlocks();
  showToast(lang === 'ar' ? '🤖 تم توليد الكابشن تلقائياً!' : '🤖 Auto-captions generated!', 'success');
}

// ==================== LOAD AUDIO ====================

let audioElement = null;

function loadAudio(event) {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (audioElement) { audioElement.pause(); audioElement = null; }
  audioElement = new Audio(url);
  audioElement.loop = true;
  audioElement.volume = 0.3;

  const info = document.getElementById('audio-info');
  const nameEl = document.getElementById('audio-name');
  if (info) info.style.display = 'block';
  if (nameEl) nameEl.textContent = '🎵 ' + file.name;

  showToast((AppState.lang === 'ar' ? '🎵 تم تحميل الصوت: ' : '🎵 Audio loaded: ') + file.name, 'success');
}

// ==================== PREVIEW MODE TOGGLE ====================

function togglePreviewMode() {
  const leftPanel = document.getElementById('left-panel');
  const rightPanel = document.querySelector('.editor-panel-right');
  const isPreview = leftPanel?.classList.contains('collapsed');

  if (isPreview) {
    if (leftPanel) leftPanel.classList.remove('collapsed');
    if (rightPanel) rightPanel.style.display = 'flex';
    showToast(AppState.lang === 'ar' ? 'وضع التحرير' : 'Edit mode', 'info');
  } else {
    if (leftPanel) leftPanel.classList.add('collapsed');
    if (rightPanel) rightPanel.style.display = 'none';
    showToast(AppState.lang === 'ar' ? 'وضع المعاينة' : 'Preview mode', 'info');
  }
}

// ==================== FULLSCREEN ====================

function toggleFullscreen() {
  const canvasArea = document.getElementById('canvas-area');
  if (!document.fullscreenElement) {
    canvasArea?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language
  const savedLang = localStorage.getItem('vidai-lang') || 'en';
  setLang(savedLang);

  // Apply saved template
  const savedTemplate = sessionStorage.getItem('vidai-template') || 'bloom';
  setTimeout(() => selectTemplate(savedTemplate), 100);

  // Init templates gallery if on landing page
  if (document.getElementById('templates-grid')) {
    renderTemplateGallery('templates-grid', AppState.lang);
    renderTemplateMenu(AppState.lang);
  }

  // Init editor templates panel
  if (document.getElementById('editor-template-list')) {
    renderEditorTemplates('editor-template-list', AppState.lang);
  }

  // Init effects list
  if (document.getElementById('effects-list')) {
    renderEffectsList('effects-list', AppState.lang);
  }
  if (document.getElementById('filter-grid')) {
    renderFilterGrid('filter-grid', AppState.lang);
  }

  // Apply saved ratio
  const savedRatio = sessionStorage.getItem('vidai-ratio') || '9:16';
  if (document.getElementById('canvas-wrapper')) setRatio(savedRatio);
});
