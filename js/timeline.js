/* ===================================================
   TIMELINE.JS — TIMELINE COMPONENT
   =================================================== */

// ==================== TIME RULER ====================

function renderTimeRuler() {
  const ruler = document.getElementById('time-ruler');
  if (!ruler) return;

  const duration = EditorState.duration || 30; // Default 30s for demo
  const rulerWidth = ruler.clientWidth || 800;
  const pixelsPerSecond = rulerWidth / duration;

  ruler.innerHTML = '';

  for (let t = 0; t <= duration; t += 1) {
    const major = t % 5 === 0;
    const x = (t / duration) * 100;

    const mark = document.createElement('div');
    mark.className = `ruler-mark ${major ? 'major' : 'minor'}`;
    mark.style.left = x + '%';
    ruler.appendChild(mark);

    if (major) {
      const label = document.createElement('div');
      label.className = 'ruler-label';
      label.style.left = x + '%';
      label.textContent = formatTime(t);
      ruler.appendChild(label);
    }
  }
}

// ==================== VIDEO TRACK BLOCK ====================

function renderVideoTrackBlock() {
  const track = document.getElementById('track-video');
  if (!track) return;

  // Remove existing video block
  const existing = track.querySelector('.track-video-block');
  if (existing) existing.remove();

  const block = document.createElement('div');
  block.className = 'timeline-block track-video-block';
  block.style.left = '0%';
  block.style.width = '100%';
  block.textContent = sessionStorage.getItem('vidai-file-name') || '🎬 Video';
  block.title = 'Video track';
  track.appendChild(block);
}

// ==================== CAPTION BLOCKS ====================

function renderTimelineBlocks() {
  const captionTrack = document.getElementById('track-captions');
  const effectTrack = document.getElementById('track-effects');
  if (!captionTrack) return;

  const duration = EditorState.duration || 30;

  // Clear existing blocks (keep playhead)
  captionTrack.querySelectorAll('.timeline-block').forEach(b => b.remove());
  if (effectTrack) effectTrack.querySelectorAll('.timeline-block').forEach(b => b.remove());

  // Render caption blocks
  window._captions.forEach(caption => {
    const startPct = (caption.startTime / duration) * 100;
    const widthPct = ((caption.endTime - caption.startTime) / duration) * 100;

    const block = document.createElement('div');
    block.className = 'timeline-block track-caption-block';
    block.style.left = Math.max(0, startPct) + '%';
    block.style.width = Math.min(widthPct, 100 - startPct) + '%';
    block.textContent = caption.text.length > 20 ? caption.text.substring(0, 17) + '...' : caption.text;
    block.title = `${caption.text} (${formatTime(caption.startTime)} - ${formatTime(caption.endTime)})`;
    block.setAttribute('data-caption-id', caption.id);
    block.setAttribute('role', 'button');
    block.setAttribute('tabindex', '0');
    block.setAttribute('aria-label', `Caption: ${caption.text}`);

    block.addEventListener('click', () => {
      selectCaption(caption.id);
      if (videoPlayer) videoPlayer.currentTime = caption.startTime;
    });

    block.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        selectCaption(caption.id);
        if (videoPlayer) videoPlayer.currentTime = caption.startTime;
      }
    });

    // Make draggable
    makeDraggable(block, caption, captionTrack, duration);

    captionTrack.appendChild(block);

    // Add effect block
    if (effectTrack) {
      const effectBlock = document.createElement('div');
      effectBlock.className = 'timeline-block track-effect-block';
      effectBlock.style.left = Math.max(0, startPct) + '%';
      effectBlock.style.width = Math.min(widthPct * 0.3, 15) + '%';
      effectBlock.textContent = '✨ ' + (caption.effect || 'fx');
      effectBlock.style.opacity = '0.7';
      effectTrack.appendChild(effectBlock);
    }
  });

  // Re-render ruler with correct duration
  renderTimeRuler();
}

// ==================== DRAGGABLE TIMELINE BLOCKS ====================

function makeDraggable(block, caption, track, duration) {
  let isDragging = false;
  let startX = 0;
  let startLeft = 0;

  block.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startLeft = parseFloat(block.style.left);
    block.style.opacity = '0.7';
    block.classList.add('selected');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const trackRect = track.getBoundingClientRect();
    const dx = ((e.clientX - startX) / trackRect.width) * 100;
    const newLeft = Math.max(0, Math.min(startLeft + dx, 100 - parseFloat(block.style.width)));
    block.style.left = newLeft + '%';

    // Update caption times
    const captionDuration = caption.endTime - caption.startTime;
    caption.startTime = (newLeft / 100) * duration;
    caption.endTime = caption.startTime + captionDuration;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    block.style.opacity = '';
    renderCaptionsList();
  });
}

// ==================== TIMELINE CLICK SEEK ====================

document.addEventListener('DOMContentLoaded', () => {
  const trackVideo = document.getElementById('track-video');
  if (trackVideo) {
    trackVideo.addEventListener('click', (e) => {
      if (!EditorState.duration) return;
      const rect = trackVideo.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      const time = pct * EditorState.duration;
      if (videoPlayer) videoPlayer.currentTime = time;
    });
  }

  // Init demo timeline if no video loaded
  setTimeout(() => {
    if (!EditorState.videoLoaded) {
      EditorState.duration = 30;
      renderTimeRuler();
      renderVideoTrackBlock();
    }
  }, 500);
});

// ==================== KEYBOARD SHORTCUTS ====================

document.addEventListener('keydown', (e) => {
  // Only in editor
  if (!document.getElementById('editor-page')) return;

  // Space = play/pause (avoid triggering in inputs)
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
    e.preventDefault();
    togglePlayback();
  }

  // Arrow keys = seek
  if (e.code === 'ArrowLeft' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    e.preventDefault();
    skipTime(-1);
  }
  if (e.code === 'ArrowRight' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    e.preventDefault();
    skipTime(1);
  }

  // Delete = remove selected caption
  if ((e.code === 'Delete' || e.code === 'Backspace') && EditorState.activeCaption && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    deleteCaption(EditorState.activeCaption);
    EditorState.activeCaption = null;
  }

  // Ctrl+Z = undo
  if (e.ctrlKey && e.code === 'KeyZ') {
    e.preventDefault();
    editorUndo();
  }

  // Ctrl+Y or Ctrl+Shift+Z = redo
  if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
    e.preventDefault();
    editorRedo();
  }

  // Ctrl+E = export
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    openExportModal();
  }

  // Escape = close modal
  if (e.code === 'Escape') {
    closeExportModal();
    const templateMenu = document.getElementById('template-menu');
    if (templateMenu) templateMenu.style.display = 'none';
  }
});

// ==================== MINI-MAP OVERVIEW ====================
// (Shows a mini thumbnail of where you are in the video)

function updateMiniMap() {
  // Future enhancement: mini thumbnail strip
}
