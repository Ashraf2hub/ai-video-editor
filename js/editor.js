/* ===================================================
   EDITOR.JS — CANVAS EFFECTS ENGINE & VIDEO EDITOR
   =================================================== */

// ==================== EDITOR STATE ====================

const EditorState = {
  videoLoaded: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  captions: [],
  activeCaption: null,
  currentTemplate: null,
  captionCounter: 0,
  animationFrameId: null,
  mediaRecorder: null,
  recordedChunks: [],
};

window._captions = [];
window._captionColor = '#FFFFFF';

// ==================== CANVAS & VIDEO SETUP ====================

const videoPlayer = document.getElementById('video-player');
const captionCanvas = document.getElementById('caption-canvas');
const ctx = captionCanvas?.getContext('2d');

function initEditor() {
  // Load video from session
  const videoUrl = sessionStorage.getItem('vidai-video-url');
  if (videoUrl && videoPlayer) {
    loadVideoFromUrl(videoUrl);
  } else {
    // Demo mode without video - show placeholder
    const placeholder = document.getElementById('no-video-msg');
    if (placeholder) placeholder.style.display = 'flex';
  }

  // Load saved template
  let savedTemplate = sessionStorage.getItem('vidai-template') || 'bloom';
  if (savedTemplate === 'ai-select') savedTemplate = 'bloom';
  const t = TEMPLATES.find(t => t.id === savedTemplate) || TEMPLATES[0];
  if (t) {
    EditorState.currentTemplate = t;
    selectTemplate(t.id);
  }

  // Init canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Drag & drop on canvas area
  const canvasArea = document.getElementById('canvas-area');
  if (canvasArea) {
    canvasArea.addEventListener('dragover', (e) => { e.preventDefault(); canvasArea.style.outline = '2px dashed rgba(124,58,237,0.5)'; });
    canvasArea.addEventListener('dragleave', () => { canvasArea.style.outline = ''; });
    canvasArea.addEventListener('drop', (e) => {
      e.preventDefault();
      canvasArea.style.outline = '';
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('video/')) {
        loadVideoFile(file);
      }
    });
  }

  // Start render loop for captions even without video
  requestAnimationFrame(renderFrame);
}

// Load video from a URL (blob or other)
function loadVideoFromUrl(videoUrl) {
  if (!videoPlayer) return;
  videoPlayer.src = videoUrl;
  videoPlayer.load();

  // Handle load error (URL might be stale)
  videoPlayer.onerror = () => {
    const placeholder = document.getElementById('no-video-msg');
    if (placeholder) placeholder.style.display = 'flex';
    if (videoPlayer) videoPlayer.style.display = 'none';
    const controls = document.getElementById('video-controls');
    if (controls) controls.style.display = 'none';
    showToast(AppState.lang === 'ar' ? '⚠️ تعذر تحميل الفيديو، يرجى رفعه مرة أخرى' : '⚠️ Could not load video, please re-upload', 'warning');
  };

  videoPlayer.onloadeddata = () => {
    videoPlayer.style.display = 'block';
    const placeholder = document.getElementById('no-video-msg');
    if (placeholder) placeholder.style.display = 'none';
    const controls = document.getElementById('video-controls');
    if (controls) controls.style.display = 'flex';
    EditorState.videoLoaded = true;
  };

  videoPlayer.addEventListener('loadedmetadata', onVideoLoaded, { once: true });
  videoPlayer.addEventListener('timeupdate', onTimeUpdate);
  videoPlayer.addEventListener('ended', onVideoEnded);
  videoPlayer.addEventListener('play', () => {
    EditorState.isPlaying = true;
    updatePlayPauseBtn();
    if (typeof audioElement !== 'undefined' && audioElement) audioElement.play();
    startRenderLoop();
  });
  videoPlayer.addEventListener('pause', () => {
    EditorState.isPlaying = false;
    updatePlayPauseBtn();
    if (typeof audioElement !== 'undefined' && audioElement) audioElement.pause();
  });

  showToast(AppState.lang === 'ar' ? '🎬 جارٍ تحميل الفيديو...' : '🎬 Loading video...', 'info');
}

// Load video from a File object (direct upload in editor)
function loadVideoFile(file) {
  const url = URL.createObjectURL(file);
  sessionStorage.setItem('vidai-video-url', url);
  sessionStorage.setItem('vidai-file-name', file.name);
  loadVideoFromUrl(url);
  showToast(AppState.lang === 'ar' ? '✅ تم رفع الفيديو: ' + file.name : '✅ Video uploaded: ' + file.name, 'success');
}

// Called from editor-file-input input element
function loadVideoInEditor(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('video/')) {
    showToast(AppState.lang === 'ar' ? '❌ يرجى اختيار ملف فيديو' : '❌ Please select a video file', 'error');
    return;
  }
  loadVideoFile(file);
}

function onVideoLoaded() {
  EditorState.duration = videoPlayer.duration;
  updateTimeDisplay();
  resizeCanvas();
  renderTimeRuler();
  renderVideoTrackBlock();

  // 🤖 Automatically generate AI captions on load
  if (typeof autoGenerateCaptions === 'function') {
    autoGenerateCaptions();
  }

  showToast(AppState.lang === 'ar' ? '✅ جاهز للتحرير!' : '✅ Ready to edit!', 'success');
}

function onVideoEnded() {
  EditorState.isPlaying = false;
  updatePlayPauseBtn();
}

function resizeCanvas() {
  const wrapper = document.getElementById('canvas-wrapper');
  if (!wrapper || !captionCanvas) return;

  const rect = wrapper.getBoundingClientRect();
  captionCanvas.width = rect.width;
  captionCanvas.height = rect.height;
}

// ==================== PLAYBACK CONTROLS ====================

function togglePlayback() {
  if (!videoPlayer) return;
  if (EditorState.isPlaying) {
    videoPlayer.pause();
  } else {
    videoPlayer.play();
  }
}

function skipTime(seconds) {
  if (!videoPlayer) return;
  videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.currentTime + seconds, EditorState.duration));
}

function seekVideo(value) {
  if (!videoPlayer || !EditorState.duration) return;
  videoPlayer.currentTime = (value / 100) * EditorState.duration;
}

function setVolume(value) {
  if (videoPlayer) videoPlayer.volume = parseFloat(value);
  if (audioElement) audioElement.volume = parseFloat(value) * 0.3;
}

function updatePlayPauseBtn() {
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  if (playIcon) playIcon.style.display = EditorState.isPlaying ? 'none' : 'block';
  if (pauseIcon) pauseIcon.style.display = EditorState.isPlaying ? 'block' : 'none';
}

function onTimeUpdate() {
  EditorState.currentTime = videoPlayer.currentTime;
  updateTimeDisplay();
  updatePlayhead();
  updateScrubber();
}

function updateTimeDisplay() {
  const display = document.getElementById('time-display');
  if (!display) return;
  const cur = formatTime(EditorState.currentTime);
  const dur = formatTime(EditorState.duration);
  display.textContent = `${cur} / ${dur}`;
}

function updateScrubber() {
  const scrubber = document.getElementById('video-scrubber');
  if (!scrubber || !EditorState.duration) return;
  scrubber.value = (EditorState.currentTime / EditorState.duration) * 100;
}

function updatePlayhead() {
  const playhead = document.getElementById('playhead');
  if (!playhead || !EditorState.duration) return;
  const pct = (EditorState.currentTime / EditorState.duration) * 100;
  playhead.style.left = pct + '%';
}

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startRenderLoop() {
  if (EditorState.animationFrameId) cancelAnimationFrame(EditorState.animationFrameId);
  function loop() {
    renderFrame();
    if (EditorState.isPlaying) {
      EditorState.animationFrameId = requestAnimationFrame(loop);
    }
  }
  EditorState.animationFrameId = requestAnimationFrame(loop);
}

// ==================== CANVAS RENDER ENGINE ====================

function renderFrame() {
  if (!ctx || !captionCanvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, captionCanvas.width, captionCanvas.height);

  const currentTime = videoPlayer ? videoPlayer.currentTime : 0;

  // Render active captions
  const activeCaptions = window._captions.filter(c =>
    currentTime >= c.startTime && currentTime <= c.endTime
  );

  activeCaptions.forEach(caption => {
    renderCaption(caption, currentTime);
  });
}

function renderCaption(caption, currentTime) {
  if (!ctx || !captionCanvas) return;

  const t = EditorState.currentTemplate || TEMPLATES[0];
  const progress = (currentTime - caption.startTime) / (caption.endTime - caption.startTime);
  const elapsed = currentTime - caption.startTime;

  // Resolve settings
  const color = caption.color || t.textColor || '#FFFFFF';
  const fontFamily = caption.fontFamily || t.fontFamily || 'Inter, sans-serif';
  const fontSize = caption.fontSize || t.fontSize || 36;
  const fontWeight = t.fontWeight || '700';
  const fontStyle = t.fontStyle || 'normal';
  const textShadow = t.textShadow || 'none';

  // Calculate animation offset
  let offsetX = 0, offsetY = 0, opacity = 1, scale = 1;

  switch (caption.effect) {
    case 'fadeUp': {
      opacity = Math.min(elapsed * 4, 1);
      offsetY = (1 - opacity) * 30;
      if (progress > 0.85) opacity = Math.max(0, 1 - (progress - 0.85) / 0.15);
      break;
    }
    case 'fadeIn': {
      opacity = Math.min(elapsed * 4, 1);
      if (progress > 0.85) opacity = Math.max(0, 1 - (progress - 0.85) / 0.15);
      break;
    }
    case 'slideLeft': {
      const slideProgress = Math.min(elapsed * 5, 1);
      offsetX = (1 - easeOutBack(slideProgress)) * -80;
      opacity = slideProgress;
      break;
    }
    case 'slideRight': {
      const slideRightProg = Math.min(elapsed * 5, 1);
      offsetX = (1 - easeOutBack(slideRightProg)) * 80;
      opacity = slideRightProg;
      break;
    }
    case 'bounce': {
      opacity = Math.min(elapsed * 6, 1);
      offsetY = Math.sin(elapsed * 8) * Math.max(0, 1 - elapsed * 2) * 15;
      break;
    }
    case 'zoom': {
      scale = 0.5 + Math.min(elapsed * 4, 0.5);
      opacity = Math.min(elapsed * 4, 1);
      break;
    }
    case 'glitch': {
      opacity = 1;
      if (elapsed < 0.3) {
        offsetX = (Math.random() - 0.5) * 8;
        offsetY = (Math.random() - 0.5) * 4;
      }
      break;
    }
    case 'typewriter': {
      opacity = 1;
      const charCount = Math.floor(elapsed * 15);
      caption._visibleText = caption.text.substring(0, charCount);
      break;
    }
    default: {
      opacity = Math.min(elapsed * 4, 1);
      if (progress > 0.85) opacity = Math.max(0, 1 - (progress - 0.85) / 0.15);
    }
  }

  if (opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Position
  const cw = captionCanvas.width;
  const ch = captionCanvas.height;
  const posY = t.position === 'center' ? ch * 0.5 : t.position === 'top' ? ch * 0.15 : ch * 0.82;
  const posX = cw / 2;

  ctx.translate(posX + offsetX, posY + offsetY);
  if (scale !== 1) ctx.scale(scale, scale);

  // Font setup
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const displayText = caption._visibleText || caption.text;

  // Background box
  if (t.textBg && t.textBg !== 'none') {
    const metrics = ctx.measureText(displayText);
    const padding = { x: 20, y: 12 };
    const boxW = metrics.width + padding.x * 2;
    const boxH = fontSize + padding.y * 2;

    ctx.fillStyle = t.textBg;
    roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 8);
    ctx.fill();
  }

  // Border/accent line
  if (t.borderColor && t.borderColor !== 'none') {
    const metrics = ctx.measureText(displayText);
    ctx.fillStyle = t.accentColor || color;
    ctx.fillRect(-metrics.width / 2 - 4, fontSize / 2 + 6, metrics.width + 8, 2);
  }

  // Text shadow
  if (textShadow && textShadow !== 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Text stroke for readability
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeText(displayText, 0, 0);

  // Main text
  ctx.fillStyle = color;
  ctx.fillText(displayText, 0, 0);

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ==================== TEMPLATE APPLICATION ====================

function applyTemplateToCanvas(template) {
  EditorState.currentTemplate = template;
  showToast((AppState.lang === 'ar' ? '🎨 تم تطبيق: ' : '🎨 Applied: ') + template.name[AppState.lang], 'success');
}

// ==================== CAPTION MANAGEMENT ====================

function addCaption() {
  const textEl = document.getElementById('new-caption-text');
  const startEl = document.getElementById('caption-start');
  const endEl = document.getElementById('caption-end');
  const effectEl = document.getElementById('caption-effect');
  const fontSizeEl = document.getElementById('font-size-slider');

  const text = textEl?.value?.trim();
  if (!text) {
    showToast(AppState.lang === 'ar' ? '⚠️ أدخل نص الكابشن' : '⚠️ Enter caption text', 'warning');
    return;
  }

  const startTime = parseFloat(startEl?.value || 0);
  const endTime = parseFloat(endEl?.value || 3);

  if (endTime <= startTime) {
    showToast(AppState.lang === 'ar' ? '⚠️ وقت النهاية يجب أن يكون بعد البداية' : '⚠️ End time must be after start time', 'warning');
    return;
  }

  const t = EditorState.currentTemplate || TEMPLATES[0];
  EditorState.captionCounter++;

  const newCaption = {
    id: EditorState.captionCounter,
    text,
    startTime,
    endTime,
    effect: effectEl?.value || 'fadeUp',
    color: window._captionColor || t.textColor || '#FFFFFF',
    fontSize: parseInt(fontSizeEl?.value || 36),
    fontFamily: t.fontFamily,
  };

  window._captions.push(newCaption);

  // Clear form
  if (textEl) textEl.value = '';

  renderCaptionsList();
  renderTimelineBlocks();

  showToast(AppState.lang === 'ar' ? '✅ تم إضافة الكابشن' : '✅ Caption added', 'success');
  switchRightTab('captions');
}

function renderCaptionsList() {
  const container = document.getElementById('captions-list');
  if (!container) return;

  if (window._captions.length === 0) {
    container.innerHTML = `<p style="font-size:0.8rem;color:var(--dark-text-muted);text-align:center;padding:20px 0;"
      data-en="No captions yet." data-ar="لا يوجد كابشن بعد.">
      ${AppState.lang === 'ar' ? 'لا يوجد كابشن بعد.' : 'No captions yet. Add captions or use Auto-Generate.'}
    </p>`;
    return;
  }

  container.innerHTML = window._captions.map((c, i) => `
    <div class="caption-item" id="caption-item-${c.id}"
         onclick="selectCaption(${c.id})"
         role="button" tabindex="0"
         aria-label="Caption ${i + 1}">
      <div class="caption-time-badge">
        ⏱ ${formatTime(c.startTime)} → ${formatTime(c.endTime)}
      </div>
      <div class="caption-text-preview" style="color:${c.color};">${c.text}</div>
      <div class="caption-edit-actions">
        <button class="caption-action-btn" onclick="event.stopPropagation();seekToCaption(${c.startTime})" title="Jump to">⏭</button>
        <button class="caption-action-btn" onclick="event.stopPropagation();duplicateCaption(${c.id})">⧉</button>
        <button class="caption-action-btn danger" onclick="event.stopPropagation();deleteCaption(${c.id})">✕</button>
      </div>
    </div>
  `).join('');
}

function selectCaption(id) {
  EditorState.activeCaption = id;
  document.querySelectorAll('.caption-item').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById('caption-item-' + id);
  if (el) el.classList.add('selected');
}

function deleteCaption(id) {
  window._captions = window._captions.filter(c => c.id !== id);
  renderCaptionsList();
  renderTimelineBlocks();
  showToast(AppState.lang === 'ar' ? '🗑️ تم حذف الكابشن' : '🗑️ Caption deleted', 'info');
}

function duplicateCaption(id) {
  const original = window._captions.find(c => c.id === id);
  if (!original) return;
  EditorState.captionCounter++;
  const duplicate = {
    ...original,
    id: EditorState.captionCounter,
    startTime: original.endTime + 0.2,
    endTime: original.endTime + (original.endTime - original.startTime) + 0.2,
  };
  window._captions.push(duplicate);
  renderCaptionsList();
  renderTimelineBlocks();
  showToast(AppState.lang === 'ar' ? '⧉ تم نسخ الكابشن' : '⧉ Caption duplicated', 'success');
}

function seekToCaption(time) {
  if (videoPlayer) videoPlayer.currentTime = time;
}

// ==================== EXPORT FRAME ====================

function exportFrame() {
  if (!captionCanvas) {
    showToast(AppState.lang === 'ar' ? '⚠️ لا يوجد فيديو للتصدير' : '⚠️ No video to export', 'warning');
    return;
  }

  // Create composite canvas
  const exportCanvas = document.createElement('canvas');
  const ew = captionCanvas.width || 720;
  const eh = captionCanvas.height || 1280;
  exportCanvas.width = ew;
  exportCanvas.height = eh;
  const ectx = exportCanvas.getContext('2d');

  // Draw video frame
  if (videoPlayer && EditorState.videoLoaded) {
    try {
      ectx.drawImage(videoPlayer, 0, 0, ew, eh);
    } catch (e) {
      // Fill with template bg if video draw fails
      const t = EditorState.currentTemplate || TEMPLATES[0];
      ectx.fillStyle = '#1A1A2E';
      ectx.fillRect(0, 0, ew, eh);
    }
  } else {
    const t = EditorState.currentTemplate || TEMPLATES[0];
    ectx.fillStyle = '#1A1A2E';
    ectx.fillRect(0, 0, ew, eh);
  }

  // Draw captions overlay
  ectx.drawImage(captionCanvas, 0, 0);

  // Download
  exportCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vidai-frame-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');

  showToast(AppState.lang === 'ar' ? '📸 تم تصدير الإطار كـ PNG' : '📸 Frame exported as PNG', 'success');
}

// ==================== CONTINUOUS RENDER LOOP ====================

function startContinuousRender() {
  function loop() {
    renderFrame();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// ==================== INIT EDITOR ====================

document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  startContinuousRender();
});
