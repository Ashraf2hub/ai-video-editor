/* ===================================================
   UPLOAD.JS — FILE HANDLING & VIDEO UPLOAD
   =================================================== */

// ==================== FILE STATE ====================

let uploadedFile = null;
let uploadedVideoUrl = null;

// ==================== DRAG & DROP ====================

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropArea = document.getElementById('drop-area');
  if (dropArea) dropArea.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.preventDefault();
  const dropArea = document.getElementById('drop-area');
  if (dropArea) dropArea.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const dropArea = document.getElementById('drop-area');
  if (dropArea) dropArea.classList.remove('drag-over');

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('video/')) {
      processFile(file);
    } else {
      showToast(
        AppState.lang === 'ar'
          ? '❌ يرجى رفع ملف فيديو فقط'
          : '❌ Please upload a video file only',
        'error'
      );
    }
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

// ==================== FILE PROCESSING ====================

function processFile(file) {
  // Validate
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    showToast(
      AppState.lang === 'ar'
        ? '❌ حجم الملف كبير جداً. الحد الأقصى 500 ميجابايت'
        : '❌ File too large. Maximum 500MB',
      'error'
    );
    return;
  }

  const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  if (!file.type.startsWith('video/')) {
    showToast(
      AppState.lang === 'ar'
        ? '❌ يرجى رفع ملف فيديو'
        : '❌ Please upload a video file',
      'error'
    );
    return;
  }

  uploadedFile = file;
  uploadedVideoUrl = URL.createObjectURL(file);

  // Store in session for other pages
  sessionStorage.setItem('vidai-video-url', uploadedVideoUrl);
  sessionStorage.setItem('vidai-file-name', file.name);
  sessionStorage.setItem('vidai-file-size', file.size);

  // Show file preview
  showFilePreview(file, uploadedVideoUrl);

  // Enable create button
  // Enable create button
  const createBtn = document.getElementById('create-btn');
  if (createBtn) createBtn.disabled = false;

  // 🤖 AI selects the template immediately on upload!
  if (selectedTemplateId === 'ai-select' && typeof aiSelectTemplate === 'function') {
    const templateId = aiSelectTemplate();
    selectTemplate(templateId);
    sessionStorage.setItem('vidai-ai-selected', '1');
  }

  showToast(
    (AppState.lang === 'ar' ? '✅ تم رفع الفيديو: ' : '✅ Video uploaded: ') + file.name,
    'success'
  );
}

function showFilePreview(file, videoUrl) {
  const dropArea = document.getElementById('drop-area');
  const preview = document.getElementById('file-preview');
  const thumb = document.getElementById('preview-thumb');
  const nameEl = document.getElementById('file-name-display');
  const metaEl = document.getElementById('file-meta-display');

  if (dropArea) {
    // Animate drop area out
    dropArea.style.minHeight = '80px';
    dropArea.style.padding = '20px';
  }

  if (preview) {
    preview.style.display = 'flex';
    preview.style.animation = 'fadeUp 0.4s var(--ease-spring) both';
  }

  if (thumb) {
    thumb.src = videoUrl;
    thumb.load();
  }

  if (nameEl) {
    nameEl.textContent = file.name.length > 30
      ? file.name.substring(0, 27) + '...'
      : file.name;
  }

  if (metaEl) {
    const size = formatFileSize(file.size);
    const type = file.type.split('/')[1]?.toUpperCase() || 'VIDEO';
    metaEl.textContent = `${type} • ${size}`;
  }
}

function removeFile() {
  uploadedFile = null;
  if (uploadedVideoUrl) {
    URL.revokeObjectURL(uploadedVideoUrl);
    uploadedVideoUrl = null;
  }

  sessionStorage.removeItem('vidai-video-url');
  sessionStorage.removeItem('vidai-file-name');
  sessionStorage.removeItem('vidai-file-size');

  const dropArea = document.getElementById('drop-area');
  const preview = document.getElementById('file-preview');
  const thumb = document.getElementById('preview-thumb');
  const fileInput = document.getElementById('file-input');
  const createBtn = document.getElementById('create-btn');

  if (preview) preview.style.display = 'none';
  if (thumb) thumb.src = '';
  if (fileInput) fileInput.value = '';
  if (createBtn) createBtn.disabled = true;

  if (dropArea) {
    dropArea.style.minHeight = '220px';
    dropArea.style.padding = '';
  }

  showToast(
    AppState.lang === 'ar' ? '🗑️ تم حذف الفيديو' : '🗑️ Video removed',
    'info'
  );
}

// ==================== NAVIGATE TO PROCESSING ====================

function startProcessing() {
  if (!uploadedVideoUrl) {
    showToast(
      AppState.lang === 'ar'
        ? '⚠️ يرجى رفع فيديو أولاً'
        : '⚠️ Please upload a video first',
      'warning'
    );
    return;
  }

  // Save template selection
  sessionStorage.setItem('vidai-template', selectedTemplateId || 'bloom');

  // Animate button
  const createBtn = document.getElementById('create-btn');
  if (createBtn) {
    createBtn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>`;
    createBtn.disabled = true;
  }

  // Navigate
  setTimeout(() => {
    window.location.href = 'processing.html';
  }, 600);
}

// ==================== UTILITY ====================

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ==================== GLOBAL DROP ON PAGE ====================

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files?.length && document.getElementById('drop-area')) {
    const file = files[0];
    if (file.type.startsWith('video/')) processFile(file);
  }
});
