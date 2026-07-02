/* ===================================================
   TEMPLATES DATA
   =================================================== */

const TEMPLATES = [
  {
    id: 'bloom',
    name: { en: 'Bloom', ar: 'بلوم' },
    desc: { en: 'Warm & cinematic', ar: 'دافئ وسينمائي' },
    bg: 'linear-gradient(160deg, #4A1942 0%, #8B3E6A 40%, #C97B63 100%)',
    textColor: '#FFFFFF',
    accentColor: '#F5C18A',
    fontStyle: 'italic',
    fontWeight: '700',
    textShadow: '0 2px 12px rgba(0,0,0,0.6)',
    textBg: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(245,193,138,0.5)',
    emoji: '🌸',
    previewLines: ['This is my', 'daily ROUTINE'],
    textStyle: 'cursive-warm',
    fontFamily: '"Playfair Display", serif',
    fontSize: 36,
    position: 'bottom'
  },
  {
    id: 'prism',
    name: { en: 'Prism Pro', ar: 'بريسم برو' },
    desc: { en: 'Bold & modern', ar: 'جريء وعصري' },
    bg: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    textColor: '#FFFFFF',
    accentColor: '#E94560',
    fontStyle: 'normal',
    fontWeight: '900',
    textShadow: 'none',
    textBg: 'none',
    borderColor: 'none',
    emoji: '💎',
    previewLines: ['Real', 'estate'],
    textStyle: 'bold-modern',
    fontFamily: '"Inter", sans-serif',
    fontSize: 42,
    position: 'center'
  },
  {
    id: 'paper',
    name: { en: 'Paper II', ar: 'بيبر 2' },
    desc: { en: 'Clean & academic', ar: 'نظيف وأكاديمي' },
    bg: 'linear-gradient(160deg, #0D1B2A 0%, #1B3A4B 50%, #065B73 100%)',
    textColor: '#E0F7FF',
    accentColor: '#00BCD4',
    fontStyle: 'normal',
    fontWeight: '700',
    textShadow: '0 1px 6px rgba(0,0,0,0.4)',
    textBg: 'rgba(6,91,115,0.4)',
    borderColor: 'rgba(0,188,212,0.4)',
    emoji: '📄',
    previewLines: ['HOW TO BE A', 'LIFELONG'],
    textStyle: 'clean-academic',
    fontFamily: '"Inter", sans-serif',
    fontSize: 32,
    position: 'bottom'
  },
  {
    id: 'prime',
    name: { en: 'Prime', ar: 'برايم' },
    desc: { en: 'Dramatic & dark', ar: 'درامي وغامق' },
    bg: 'linear-gradient(160deg, #0A0A0A 0%, #1A0A1A 50%, #2D1B2E 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FF3D71',
    fontStyle: 'normal',
    fontWeight: '800',
    textShadow: '0 0 20px rgba(255,61,113,0.5)',
    textBg: 'none',
    borderColor: 'rgba(255,61,113,0.3)',
    emoji: '⚡',
    previewLines: ['know this', 'one tip'],
    textStyle: 'dramatic-dark',
    fontFamily: '"Inter", sans-serif',
    fontSize: 38,
    position: 'bottom'
  },
  {
    id: 'neon',
    name: { en: 'Neon City', ar: 'نيون سيتي' },
    desc: { en: 'Cyberpunk vibes', ar: 'أجواء سايبربانك' },
    bg: 'linear-gradient(160deg, #020014 0%, #0D0030 50%, #1A0050 100%)',
    textColor: '#00FFE5',
    accentColor: '#FF00FF',
    fontStyle: 'normal',
    fontWeight: '900',
    textShadow: '0 0 15px rgba(0,255,229,0.8), 0 0 30px rgba(0,255,229,0.4)',
    textBg: 'none',
    borderColor: 'rgba(0,255,229,0.3)',
    emoji: '🌆',
    previewLines: ['LEVEL UP', 'YOUR GAME'],
    textStyle: 'neon-cyber',
    fontFamily: '"Inter", sans-serif',
    fontSize: 40,
    position: 'center'
  },
  {
    id: 'vintage',
    name: { en: 'Vintage', ar: 'عتيق' },
    desc: { en: 'Classic & retro', ar: 'كلاسيكي وريترو' },
    bg: 'linear-gradient(160deg, #3D2B1F 0%, #6B4226 50%, #9A6445 100%)',
    textColor: '#F5E6C8',
    accentColor: '#D4A04A',
    fontStyle: 'italic',
    fontWeight: '700',
    textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
    textBg: 'rgba(61,43,31,0.5)',
    borderColor: 'rgba(212,160,74,0.5)',
    emoji: '🎞️',
    previewLines: ['STORY TIME', 'with friends'],
    textStyle: 'vintage-retro',
    fontFamily: '"Playfair Display", serif',
    fontSize: 34,
    position: 'bottom'
  },
  {
    id: 'minimal',
    name: { en: 'Minimal', ar: 'مينيمال' },
    desc: { en: 'Clean & simple', ar: 'نظيف وبسيط' },
    bg: 'linear-gradient(160deg, #F8F8F8 0%, #E8E8E8 100%)',
    textColor: '#111111',
    accentColor: '#333333',
    fontStyle: 'normal',
    fontWeight: '600',
    textShadow: 'none',
    textBg: 'none',
    borderColor: 'rgba(0,0,0,0.1)',
    emoji: '⬜',
    previewLines: ['Simple.', 'Elegant.'],
    textStyle: 'minimal-clean',
    fontFamily: '"Inter", sans-serif',
    fontSize: 34,
    position: 'center'
  },
  {
    id: 'gradient',
    name: { en: 'Gradient Wave', ar: 'موجة تدرجية' },
    desc: { en: 'Colorful & dynamic', ar: 'ملون وديناميكي' },
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #f5576c 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FFE5FF',
    fontStyle: 'normal',
    fontWeight: '800',
    textShadow: '0 2px 15px rgba(0,0,0,0.3)',
    textBg: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
    emoji: '🌊',
    previewLines: ['TRENDING', 'right now'],
    textStyle: 'gradient-wave',
    fontFamily: '"Inter", sans-serif',
    fontSize: 38,
    position: 'bottom'
  }
];

const VIDEO_EFFECTS = [
  { id: 'none', name: { en: 'None', ar: 'بدون' }, icon: '○', cssFilter: '' },
  { id: 'vintage', name: { en: 'Vintage', ar: 'عتيق' }, icon: '🎞', cssFilter: 'sepia(50%) contrast(110%) brightness(90%)' },
  { id: 'cinematic', name: { en: 'Cinematic', ar: 'سينمائي' }, icon: '🎬', cssFilter: 'contrast(120%) saturate(80%) brightness(95%)' },
  { id: 'bw', name: { en: 'B&W', ar: 'أبيض وأسود' }, icon: '⬛', cssFilter: 'grayscale(100%) contrast(110%)' },
  { id: 'warm', name: { en: 'Warm', ar: 'دافئ' }, icon: '🌅', cssFilter: 'sepia(20%) saturate(130%) hue-rotate(-10deg) brightness(105%)' },
  { id: 'cool', name: { en: 'Cool', ar: 'بارد' }, icon: '❄️', cssFilter: 'saturate(80%) hue-rotate(20deg) brightness(105%)' },
  { id: 'dramatic', name: { en: 'Dramatic', ar: 'درامي' }, icon: '🔮', cssFilter: 'contrast(140%) saturate(120%) brightness(85%)' },
  { id: 'fade', name: { en: 'Faded', ar: 'باهت' }, icon: '🌫', cssFilter: 'contrast(85%) saturate(70%) brightness(110%)' },
];

const CAPTION_ANIMATIONS = [
  { id: 'fadeUp', name: { en: 'Fade Up', ar: 'تلاشي للأعلى' } },
  { id: 'fadeIn', name: { en: 'Fade In', ar: 'تلاشي' } },
  { id: 'slideLeft', name: { en: 'Slide Left', ar: 'انزلاق يسار' } },
  { id: 'slideRight', name: { en: 'Slide Right', ar: 'انزلاق يمين' } },
  { id: 'bounce', name: { en: 'Bounce', ar: 'ارتداد' } },
  { id: 'glitch', name: { en: 'Glitch', ar: 'تشويش' } },
  { id: 'typewriter', name: { en: 'Typewriter', ar: 'آلة كاتبة' } },
  { id: 'zoom', name: { en: 'Zoom In', ar: 'تكبير' } },
];

const PROCESSING_TIPS = [
  { en: '💡 Use Bloom for warm, cinematic content', ar: '💡 استخدم Bloom للمحتوى الدافئ والسينمائي' },
  { en: '⚡ Prism Pro works great for educational content', ar: '⚡ Prism Pro رائع للمحتوى التعليمي' },
  { en: '🎬 Try the Glitch effect for tech videos', ar: '🎬 جرب تأثير Glitch لفيديوهات التقنية' },
  { en: '📱 9:16 ratio is perfect for TikTok & Reels', ar: '📱 نسبة 9:16 مثالية لتيك توك وريلز' },
  { en: '✨ Auto-captions support Arabic and English', ar: '✨ الكابشن التلقائي يدعم العربية والإنجليزية' },
];

const SAMPLE_CAPTIONS = [
  { id: 1, text: 'Welcome to our channel!', startTime: 0.5, endTime: 3.0, effect: 'fadeUp', color: '#FFFFFF', fontSize: 36 },
  { id: 2, text: "Today we're going to learn something amazing.", startTime: 3.5, endTime: 7.0, effect: 'slideLeft', color: '#FFEB3B', fontSize: 32 },
  { id: 3, text: 'Make sure to like and subscribe! 🔔', startTime: 7.5, endTime: 11.0, effect: 'bounce', color: '#00E5FF', fontSize: 30 },
  { id: 4, text: "Let's get started right now!", startTime: 11.5, endTime: 14.0, effect: 'zoom', color: '#FFFFFF', fontSize: 36 },
];

const SAMPLE_CAPTIONS_AR = [
  { id: 1, text: 'أهلاً وسهلاً بقناتنا!', startTime: 0.5, endTime: 3.0, effect: 'fadeUp', color: '#FFFFFF', fontSize: 36 },
  { id: 2, text: 'اليوم سنتعلم شيئاً رائعاً معاً.', startTime: 3.5, endTime: 7.0, effect: 'slideLeft', color: '#FFEB3B', fontSize: 32 },
  { id: 3, text: 'لا تنسى الإعجاب والاشتراك! 🔔', startTime: 7.5, endTime: 11.0, effect: 'bounce', color: '#00E5FF', fontSize: 30 },
  { id: 4, text: 'هيا نبدأ الآن!', startTime: 11.5, endTime: 14.0, effect: 'zoom', color: '#FFFFFF', fontSize: 36 },
];

/* ==================== TEMPLATE RENDERING ==================== */

function renderTemplateGallery(containerId, lang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = TEMPLATES.map(t => `
    <div class="template-card" role="listitem" tabindex="0"
         onclick="selectTemplate('${t.id}')"
         onkeydown="if(event.key==='Enter')selectTemplate('${t.id}')"
         aria-label="${t.name[lang]} template"
         id="tpl-card-${t.id}">
      <div class="template-bg" style="background:${t.bg};width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;padding:0;"></div>
      <div class="template-overlay">
        <div class="template-text-preview" style="font-family:${t.fontFamily};color:${t.textColor};text-shadow:${t.textShadow};font-style:${t.fontStyle};">
          ${t.previewLines.join('<br/>')}
        </div>
        <div class="template-name">${t.name[lang]}</div>
      </div>
      <div class="template-badge-top">${t.emoji} ${t.name[lang]}</div>
    </div>
  `).join('');
}

function renderEditorTemplates(containerId, lang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = TEMPLATES.map(t => `
    <div class="template-thumb" id="editor-tpl-${t.id}"
         onclick="selectTemplate('${t.id}')"
         tabindex="0" role="radio" aria-checked="false"
         aria-label="${t.name[lang]}"
         onkeydown="if(event.key==='Enter')selectTemplate('${t.id}')">
      <div class="t-bg" style="background:${t.bg};">
        <div style="font-family:${t.fontFamily};color:${t.textColor};text-shadow:${t.textShadow};font-style:${t.fontStyle};font-weight:${t.fontWeight};font-size:0.6rem;text-align:center;margin-bottom:4px;">
          ${t.previewLines.join('<br/>')}
        </div>
        <div class="t-name">${t.emoji} ${t.name[lang]}</div>
      </div>
    </div>
  `).join('');
}

function renderEffectsList(containerId, lang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = VIDEO_EFFECTS.map(e => `
    <button class="effect-chip" id="vfx-${e.id}"
            onclick="applyVideoEffect('${e.id}')"
            aria-label="${e.name[lang]}">
      ${e.icon} ${e.name[lang]}
    </button>
  `).join('');
}

function renderFilterGrid(containerId, lang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = VIDEO_EFFECTS.slice(0, 6).map(e => `
    <button class="effect-chip" id="filter-${e.id}"
            onclick="applyVideoEffect('${e.id}')"
            aria-label="${e.name[lang]}"
            style="display:flex;flex-direction:column;gap:2px;align-items:center;height:50px;justify-content:center;">
      <span style="font-size:1.2rem;">${e.icon}</span>
      <span style="font-size:0.65rem;">${e.name[lang]}</span>
    </button>
  `).join('');
}

function renderTemplateMenu(lang = 'en') {
  const container = document.getElementById('template-menu-list');
  if (!container) return;

  const aiOption = `
    <button style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;border:1px solid rgba(124,58,237,0.2);background:rgba(124,58,237,0.04);cursor:pointer;width:100%;font-family:inherit;transition:all 0.2s;text-align:left;"
            onmouseover="this.style.background='rgba(124,58,237,0.08)'"
            onmouseout="this.style.background='rgba(124,58,237,0.04)'"
            onclick="selectTemplateFromMenu('ai-select')"
            aria-label="AI Auto-Select">
      <div style="width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg, #7c3aed, #db2777);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.85rem;color:white;">🪄</div>
      <div style="text-align:left;flex:1;">
        <div style="font-size:0.82rem;font-weight:700;color:#1A1A1A;">${lang === 'ar' ? '🪄 اختيار ذكي تلقائي (AI)' : '🪄 AI Auto-Select'}</div>
        <div style="font-size:0.72rem;color:#6B7280;">${lang === 'ar' ? 'دع الذكاء الاصطناعي يحلل محتواك ويقرر' : 'Let AI analyze your content and choose'}</div>
      </div>
    </button>
  `;

  container.innerHTML = aiOption + TEMPLATES.map(t => `
    <button style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);background:white;cursor:pointer;width:100%;font-family:inherit;transition:all 0.2s;text-align:left;"
            onmouseover="this.style.background='rgba(124,58,237,0.06)'"
            onmouseout="this.style.background='white'"
            onclick="selectTemplateFromMenu('${t.id}')"
            aria-label="Select ${t.name[lang]} template">
      <div style="width:28px;height:28px;border-radius:6px;background:${t.bg};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:0.85rem;">${t.emoji}</div>
      <div style="text-align:left;flex:1;">
        <div style="font-size:0.82rem;font-weight:700;color:#1A1A1A;">${t.name[lang]}</div>
        <div style="font-size:0.72rem;color:#6B7280;">${t.desc[lang]}</div>
      </div>
    </button>
  `).join('');
}
