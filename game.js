/* ISLAND BREAKER - Cross-Element Hybrid Fusion & In-Place Engine */

// --- Sound Manager with Strict Audio Throttling ---
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.lastBounceTime = 0;
    this.lastExplosionTime = 0;
    this.lastLaserTime = 0;
    this.lastCoinTime = 0;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playBounce() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastBounceTime < 40) return;
    this.lastBounceTime = now;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch(e){}
  }

  playExplosion() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastExplosionTime < 60) return;
    this.lastExplosionTime = now;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch(e){}
  }

  playLaser() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastLaserTime < 60) return;
    this.lastLaserTime = now;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch(e){}
  }

  playCoin() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastCoinTime < 80) return;
    this.lastCoinTime = now;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1318, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e){}
  }
}

const sounds = new SoundManager();

// --- Ball Definitions (Including 7 New Cross-Element Hybrid Balls!) ---
const BALL_TYPES = {
  // Base Balls (R, SR, SSR)
  BASIC: { id: 'BASIC', name: '기본공', grade: 'R', color: '#70a1ff', icon: '🔵', damage: 1, desc: '표준 단일 타격 (데미지 1)', synergyId: 'BASIC_PLUS' },
  DIFFUSE: { id: 'DIFFUSE', name: '난반사공', grade: 'SR', color: '#a55eea', icon: '🌀', damage: 1, desc: '불규칙 무작위 튕김 궤적 (1뎀)', synergyId: 'DIFFUSE_PLUS' },
  CROSS: { id: 'CROSS', name: '십자파괴공', grade: 'SSR', color: '#ff6b81', icon: '➕', damage: 1, desc: '가로/세로 전체 줄 십자 빔 (1뎀)', synergyId: 'CROSS_PLUS' },
  ROW: { id: 'ROW', name: '가로파괴공', grade: 'SR', color: '#eccc68', icon: '↔️', damage: 1, desc: '적중한 가로 줄 전체 레이저 (1뎀)', synergyId: 'ROW_PLUS' },
  COL: { id: 'COL', name: '세로파괴공', grade: 'SR', color: '#70a1ff', icon: '↕️', damage: 1, desc: '적중한 세로 열 전체 레이저 (1뎀)', synergyId: 'COL_PLUS' },
  BOMB: { id: 'BOMB', name: '폭탄공', grade: 'SSR', color: '#ff4757', icon: '💣', damage: 5, desc: '단일 타격 5 데미지 폭발', synergyId: 'BOMB_PLUS' },
  FIRE: { id: 'FIRE', name: '화염공', grade: 'SR', color: '#ffa502', icon: '🔥', damage: 1, desc: '인접 블록 3개에 화염 스플래시 (1뎀)', synergyId: 'FIRE_PLUS' },
  ELEC: { id: 'ELEC', name: '전기공', grade: 'SR', color: '#1e90ff', icon: '⚡', damage: 1, desc: '주변 블록 3개에 감전 벼락 방전 (1뎀)', synergyId: 'ELEC_PLUS' },

  // +1 Synergy Balls (★)
  BASIC_PLUS: { id: 'BASIC_PLUS', name: '강화 기본공+1★', grade: 'SR', color: '#00d2ff', icon: '🔵★', damage: 2, desc: '기본 데미지 2로 증가', isSynergy: 1, synergyId: 'BASIC_PLUS2' },
  DIFFUSE_PLUS: { id: 'DIFFUSE_PLUS', name: '강화 난반사공+1★', grade: 'SSR', color: '#8854d0', icon: '🌀★', damage: 2, desc: '데미지 2 + 극대화된 무작위 튕김 궤적', isSynergy: 1, synergyId: 'DIFFUSE_PLUS2' },
  CROSS_PLUS: { id: 'CROSS_PLUS', name: '강화 십자파괴공+1★', grade: 'SSR', color: '#fc5c65', icon: '➕★', damage: 2, desc: '데미지 2 + 가로/세로 전체 십자 빔 (2뎀)', isSynergy: 1, synergyId: 'CROSS_PLUS2' },
  ROW_PLUS: { id: 'ROW_PLUS', name: '강화 가로파괴공+1★', grade: 'SSR', color: '#fed330', icon: '↔️★', damage: 2, desc: '데미지 2 + 상하 3행 광역 레이저 (2뎀)', isSynergy: 1, synergyId: 'ROW_PLUS2' },
  COL_PLUS: { id: 'COL_PLUS', name: '강화 세로파괴공+1★', grade: 'SSR', color: '#45aaf2', icon: '↕️★', damage: 2, desc: '데미지 2 + 좌우 3열 광역 레이저 (2뎀)', isSynergy: 1, synergyId: 'COL_PLUS2' },
  BOMB_PLUS: { id: 'BOMB_PLUS', name: '강화 폭탄공+1★', grade: 'SSR', color: '#eb3b5a', icon: '💣★', damage: 10, desc: '단일 타격 10 데미지 초강력 폭발', isSynergy: 1, synergyId: 'BOMB_PLUS2' },
  FIRE_PLUS: { id: 'FIRE_PLUS', name: '강화 화염공+1★', grade: 'SSR', color: '#fa8231', icon: '🔥★', damage: 2, desc: '데미지 2 + 인접 블록 6개 연쇄 화염 (2뎀)', isSynergy: 1, synergyId: 'FIRE_PLUS2' },
  ELEC_PLUS: { id: 'ELEC_PLUS', name: '강화 전기공+1★', grade: 'SSR', color: '#2d98da', icon: '⚡★', damage: 2, desc: '데미지 2 + 주변 블록 6개 감전 벼락 (2뎀)', isSynergy: 1, synergyId: 'ELEC_PLUS2' },

  // +2 Synergy Balls (★★)
  BASIC_PLUS2: { id: 'BASIC_PLUS2', name: '강화 기본공+2★★', grade: 'SSR', color: '#00ffff', icon: '🔵★★', damage: 3, desc: '기본 데미지 3으로 증가', isSynergy: 2 },
  DIFFUSE_PLUS2: { id: 'DIFFUSE_PLUS2', name: '강화 난반사공+2★★', grade: 'SSR', color: '#b8e994', icon: '🌀★★', damage: 3, desc: '데미지 3 + 초고속 광기 난반사 궤적', isSynergy: 2 },
  CROSS_PLUS2: { id: 'CROSS_PLUS2', name: '강화 십자파괴공+2★★', grade: 'SSR', color: '#ff4757', icon: '➕★★', damage: 3, desc: '데미지 3 + 가로/세로 전체 십자 빔 (3뎀)', isSynergy: 2 },
  ROW_PLUS2: { id: 'ROW_PLUS2', name: '강화 가로파괴공+2★★', grade: 'SSR', color: '#ffb142', icon: '↔️★★', damage: 3, desc: '데미지 3 + 상하 5행 광역 레이저 (3뎀)', isSynergy: 2 },
  COL_PLUS2: { id: 'COL_PLUS2', name: '강화 세로파괴공+2★★', grade: 'SSR', color: '#2bcbba', icon: '↕️★★', damage: 3, desc: '데미지 3 + 좌우 5열 광역 레이저 (3뎀)', isSynergy: 2 },
  BOMB_PLUS2: { id: 'BOMB_PLUS2', name: '강화 폭탄공+2★★', grade: 'SSR', color: '#ff2d55', icon: '💣★★', damage: 18, desc: '단일 타격 18 데미지 파멸적 폭발', isSynergy: 2 },
  FIRE_PLUS2: { id: 'FIRE_PLUS2', name: '강화 화염공+2★★', grade: 'SSR', color: '#ff5252', icon: '🔥★★', damage: 3, desc: '데미지 3 + 인접 블록 9개 대화재 폭발 (3뎀)', isSynergy: 2 },
  ELEC_PLUS2: { id: 'ELEC_PLUS2', name: '강화 전기공+2★★', grade: 'SSR', color: '#18dcff', icon: '⚡★★', damage: 3, desc: '데미지 3 + 주변 블록 9개 초고압 벼락 (3뎀)', isSynergy: 2 },

  // 🧪 7 New Cross-Element Hybrid Balls! 🧪
  FIRE_BOMB: { id: 'FIRE_BOMB', name: '하이브리드 화염폭탄공', grade: 'SSR', color: '#ff3f34', icon: '💥🔥', damage: 6, desc: '타격 6뎀 + 인접 블록 6개 3뎀 대형 화염 폭발', isHybrid: true, isSynergy: 2 },
  ELEC_ROW: { id: 'ELEC_ROW', name: '하이브리드 전격가로공', grade: 'SSR', color: '#00d8d6', icon: '⚡↔️', damage: 2, desc: '가로 전체 2뎀 레이저 + 피격 주변 1뎀 감전 전이', isHybrid: true, isSynergy: 2 },
  ELEC_COL: { id: 'ELEC_COL', name: '하이브리드 전격세로공', grade: 'SSR', color: '#0be881', icon: '⚡↕️', damage: 2, desc: '세로 전체 2뎀 레이저 + 피격 주변 1뎀 감전 전이', isHybrid: true, isSynergy: 2 },
  DIFFUSE_CROSS: { id: 'DIFFUSE_CROSS', name: '하이브리드 난반사십자공', grade: 'SSR', color: '#ef5777', icon: '🌀➕', damage: 2, desc: '난반사 궤적으로 튕기며 매 적중 시 2뎀 십자 빔', isHybrid: true, isSynergy: 2 },
  PLASMA: { id: 'PLASMA', name: '하이브리드 플라즈마공', grade: 'SSR', color: '#ff5e57', icon: '⚡🔥', damage: 3, desc: '타격 3뎀 + 주변 모든 인접 블록 3뎀 플라즈마 폭발', isHybrid: true, isSynergy: 2 },
  BOMB_CROSS: { id: 'BOMB_CROSS', name: '하이브리드 폭발십자공', grade: 'SSR', color: '#ffc048', icon: '💣➕', damage: 8, desc: '타격 8뎀 + 가로/세로 전체 4뎀 폭발 레이저', isHybrid: true, isSynergy: 2 },
  HYBRID_GENERIC: { id: 'HYBRID_GENERIC', name: '하이브리드 융합공', grade: 'SSR', color: '#ffdd59', icon: '✨🔮', damage: 3, desc: '타격 3뎀 + 인접 블록 4개 2뎀 만능 방전', isHybrid: true, isSynergy: 2 },

  // 👑 Ultimate Super Power Balls (★3) 👑
  SUPER_POWER: { id: 'SUPER_POWER', name: '초강력 파멸 시너지공★3', grade: 'UR', color: '#ff3838', icon: '⚡🔥💥', damage: 25, desc: '타격 25뎀 + 화면 전체 5뎀 벼락 + 3x3 10뎀 핵폭발 + 십자 5뎀 파괴 레이저 동시 발동!', isSynergy: 3, isSuper: true },
  GOD_PULSE: { id: 'GOD_PULSE', name: '초강력 갓플라즈마공★3', grade: 'UR', color: '#ffaf40', icon: '🌀⚡💥', damage: 30, desc: '타격 30뎀 + 화면 내 모든 블록 7뎀 만유 방전 + 난반사 궤적', isSynergy: 3, isSuper: true }
};

const BRICK_TYPES = {
  NORMAL: 1,
  ELITE: 2,
  BONUS_BALL: 3,      // 🎁 공 획득 보너스
  BONUS_EXPLODE: 4,   // 💥 광역 폭발 보너스
  BONUS_LIGHTNING: 5, // ⚡ 전격 벼락 보너스
  UNBREAKABLE: 6      // 🛡️ 파괴 불가 블록 (4wave마다 중앙 출현, 2칸)
};

const keys = {
  ArrowLeft: false,
  ArrowRight: false
};

const keyHoldFrames = {
  ArrowLeft: 0,
  ArrowRight: 0
};

// --- Main Game State ---
const state = {
  score: 0,
  seashells: 0,
  wave: 1,
  startWave: 1,
  speedMultiplier: 2,
  isAiming: false,
  isShooting: false,
  isRecalling: false,
  aimStartPos: { x: 0, y: 0 },
  aimCurrentPos: { x: 0, y: 0 },
  aimAngle: -Math.PI / 2,
  
  turnFrames: 0,
  launchPos: { x: 0, y: 0 },
  
  ownedBalls: [
    BALL_TYPES.BASIC, BALL_TYPES.BASIC, BALL_TYPES.BASIC
  ],
  
  activeBalls: [],
  ballsToLaunch: [],
  launchTimer: 0,
  
  cols: 8,
  bricks: [],
  
  talentPoints: 0,
  talents: {
    seashellBoost: 0,
    bonusBrickRate: 0
  },
  
  skillCharge: 0,
  maxSkillCharge: 200,
  barrierActive: false,
  barrierX: 0,
  
  screenShake: 0,
  particles: [],
  shockwaves: [],
  beamEffects: [],
  floatingTexts: []
};

let canvas, ctx;
let cellWidth, cellHeight;
const BRICK_CORNER_RADIUS = 6;
const MAX_PARTICLES = 20;
const MAX_FLOATING_TEXTS = 8;
let currentFusionMode = 'same'; // 'same' or 'hybrid'

function loadSavedData() {
  const savedTP = localStorage.getItem('ib_tp');
  if (savedTP !== null) state.talentPoints = parseInt(savedTP, 10);
  
  const savedTalents = localStorage.getItem('ib_talents');
  if (savedTalents) {
    try {
      state.talents = JSON.parse(savedTalents);
    } catch(e){}
  }

  const savedMute = localStorage.getItem('ib_sound_muted');
  if (savedMute !== null) {
    sounds.isMuted = savedMute === 'true';
  }
}

function savePersistentData() {
  localStorage.setItem('ib_tp', state.talentPoints);
  localStorage.setItem('ib_talents', JSON.stringify(state.talents));
  localStorage.setItem('ib_sound_muted', sounds.isMuted);
}

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  loadSavedData();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  initGame();
  setupEventListeners();
  updateSoundUI();
  
  requestAnimationFrame(gameLoop);
});

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  cellWidth = canvas.width / state.cols;
  cellHeight = cellWidth;
  
  state.launchPos.x = canvas.width / 2;
  state.launchPos.y = canvas.height - 30;
}

function initGame() {
  state.score = 0;
  
  const startInput = document.getElementById('inputStartWave');
  let selectedStart = 1;
  if (startInput) {
    selectedStart = Math.max(1, parseInt(startInput.value, 10) || 1);
  }
  state.startWave = selectedStart;
  state.wave = selectedStart;
  
  state.seashells = 0;
  state.isAiming = false;
  state.isShooting = false;
  state.isRecalling = false;
  state.turnFrames = 0;
  state.screenShake = 0;
  state.activeBalls = [];
  state.particles = [];
  state.shockwaves = [];
  state.beamEffects = [];
  state.floatingTexts = [];
  
  state.skillCharge = 0;
  state.barrierActive = false;
  
  state.ownedBalls = [BALL_TYPES.BASIC, BALL_TYPES.BASIC, BALL_TYPES.BASIC];
  
  state.bricks = [];
  spawnBrickRow();
  spawnBrickRow();

  updateHUD();
}

function spawnBrickRow() {
  const defenseLineY = canvas.height - 40;
  let gameOverTriggered = false;

  for (let b of state.bricks) {
    b.row += 1;
    b.targetY = b.row * cellHeight + 10;
    
    if (b.targetY + b.h >= defenseLineY) {
      gameOverTriggered = true;
    }
  }

  if (gameOverTriggered) {
    triggerGameOver();
    return;
  }
  
  const baseHp = Math.floor(1 + state.wave * 1.5);
  const bonusRate = 0.15 + (state.talents.bonusBrickRate || 0) * 0.08;

  const isUnbreakableWave = (state.wave % 4 === 0);
  const centerCol = Math.floor((state.cols - 2) / 2);

  if (isUnbreakableWave) {
    state.bricks.push({
      col: centerCol,
      row: 0,
      x: centerCol * cellWidth + 1.5,
      y: 10,
      targetY: 10,
      w: cellWidth * 2 - 3,
      h: cellHeight - 3,
      r: BRICK_CORNER_RADIUS,
      hp: Infinity,
      maxHp: Infinity,
      type: BRICK_TYPES.UNBREAKABLE,
      isUnbreakable: true,
      shape: null,
      hitFlash: 0
    });
  }

  for (let c = 0; c < state.cols; c++) {
    if (isUnbreakableWave && (c === centerCol || c === centerCol + 1)) {
      continue;
    }

    if (Math.random() < 0.65) {
      let type = BRICK_TYPES.NORMAL;
      let hp = baseHp;
      
      const randType = Math.random();
      if (randType < 0.15) {
        type = BRICK_TYPES.ELITE;
        hp = Math.floor(baseHp * 2.2);
      } else if (randType < 0.15 + bonusRate) {
        const bonusTypes = [
          BRICK_TYPES.BONUS_EXPLODE,
          BRICK_TYPES.BONUS_LIGHTNING
        ];
        type = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        hp = Math.max(1, Math.floor(baseHp * 0.8));
      }
      
      // 22% chance of spawning triangle brick
      const isTriangle = Math.random() < 0.22;
      const shapes = ['TRIANGLE_TL', 'TRIANGLE_TR', 'TRIANGLE_BL', 'TRIANGLE_BR'];
      const shape = isTriangle ? shapes[Math.floor(Math.random() * shapes.length)] : null;

      state.bricks.push({
        col: c,
        row: 0,
        x: c * cellWidth + 1.5,
        y: 10,
        targetY: 10,
        w: cellWidth - 3,
        h: cellHeight - 3,
        r: BRICK_CORNER_RADIUS,
        hp: hp,
        maxHp: hp,
        type: type,
        shape: shape,
        hitFlash: 0
      });
    }
  }
}

// --- Keyboard & Mouse Controls ---
function setupEventListeners() {
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startAim = (e) => {
    sounds.init();
    if (state.isShooting) return;
    const pos = getPos(e);
    state.isAiming = true;
    state.aimStartPos = pos;
    state.aimCurrentPos = pos;
    updateAimAngle(pos);
  };

  const moveAim = (e) => {
    if (!state.isAiming || state.isShooting) return;
    const pos = getPos(e);
    state.aimCurrentPos = pos;
    updateAimAngle(pos);
  };

  const endAim = (e) => {
    if (!state.isAiming) return;
    state.isAiming = false;
    if (state.aimAngle < -0.15 && state.aimAngle > -Math.PI + 0.15) {
      launchBalls();
    }
  };

  canvas.addEventListener('mousedown', startAim);
  canvas.addEventListener('mousemove', moveAim);
  window.addEventListener('mouseup', endAim);

  canvas.addEventListener('touchstart', startAim, { passive: false });
  canvas.addEventListener('touchmove', moveAim, { passive: false });
  window.addEventListener('touchend', endAim);

  const btnSkill = document.getElementById('btnSkill');
  if (btnSkill) {
    btnSkill.addEventListener('click', () => {
      if (!state.barrierActive && state.skillCharge >= state.maxSkillCharge) {
        state.barrierActive = true;
        state.barrierX = state.launchPos.x;
        state.skillCharge = 0;
        sounds.playLaser();
        createFloatingText(state.launchPos.x, state.launchPos.y - 70, '🛡️ 방어벽 설치!', '#00d2d3');
        updateSkillUI();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.code === 'KeyA') {
      keys.ArrowLeft = true;
    }
    if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.code === 'KeyD') {
      keys.ArrowRight = true;
    }
    if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X' || e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      const btnSkill = document.getElementById('btnSkill');
      if (btnSkill && !btnSkill.disabled) {
        btnSkill.click();
      }
    }
    if (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z') {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      if (!state.isShooting) {
        advanceWave();
      }
    }
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      sounds.init();
      if (state.isShooting) {
        triggerRecall();
      } else {
        launchBalls();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft' || e.code === 'KeyA') {
      keys.ArrowLeft = false;
      keyHoldFrames.ArrowLeft = 0;
    }
    if (e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.code === 'KeyD') {
      keys.ArrowRight = false;
      keyHoldFrames.ArrowRight = 0;
    }
  });

  const inputWave = document.getElementById('inputStartWave');
  if (inputWave) {
    inputWave.addEventListener('change', () => {
      if (!state.isShooting) {
        initGame();
      }
    });
  }

  document.getElementById('btnSoundToggle').addEventListener('click', () => {
    sounds.isMuted = !sounds.isMuted;
    savePersistentData();
    updateSoundUI();
  });

  document.getElementById('btnSpeed').addEventListener('click', () => {
    const speedOptions = [2, 3, 4];
    const idx = speedOptions.indexOf(state.speedMultiplier);
    state.speedMultiplier = speedOptions[(idx + 1) % speedOptions.length];
    document.getElementById('btnSpeed').innerText = `⏩ ${state.speedMultiplier}x`;
  });

  document.getElementById('btnSkipWave').addEventListener('click', () => {
    if (state.isShooting) return;
    advanceWave();
  });

  document.getElementById('btnRecall').addEventListener('click', () => {
    sounds.init();
    if (state.isShooting) {
      triggerRecall();
    } else {
      launchBalls();
    }
  });

  document.getElementById('btnOpenShop').addEventListener('click', () => openModal('modalShop'));
  
  document.getElementById('btnOpenFusion').addEventListener('click', () => {
    renderFusionList();
    openModal('modalFusion');
  });

  document.getElementById('btnFuseAll').addEventListener('click', fuseAllBalls);
  const btnHybridAll = document.getElementById('btnFuseAllHybrid');
  if (btnHybridAll) {
    btnHybridAll.addEventListener('click', fuseAllHybridBalls);
  }
  const btnSuperAll = document.getElementById('btnFuseAllSuper');
  if (btnSuperAll) {
    btnSuperAll.addEventListener('click', fuseAllSuperBalls);
  }

  document.getElementById('btnOpenTalent').addEventListener('click', () => {
    renderTalentList();
    openModal('modalTalent');
  });

  document.getElementById('btnBuy1').addEventListener('click', () => buyBalls(1));
  document.getElementById('btnBuy6').addEventListener('click', () => buyBalls(6));
  document.getElementById('btnBuy24').addEventListener('click', () => buyBalls(24));
  document.getElementById('btnBuy64').addEventListener('click', () => buyBalls(64));

  document.getElementById('btnResetTalents').addEventListener('click', resetTalents);
  document.getElementById('btnRestart').addEventListener('click', () => {
    closeModal('modalGameOver');
    initGame();
  });
}

function updateSoundUI() {
  const btn = document.getElementById('btnSoundToggle');
  if (btn) {
    btn.innerText = sounds.isMuted ? '🔇 소리 OFF' : '🔊 소리 ON';
  }
}

function updateAimAngle(currentPos) {
  const dx = currentPos.x - state.launchPos.x;
  const dy = currentPos.y - state.launchPos.y;
  let angle = Math.atan2(dy, dx);
  if (angle > -0.15 && angle <= Math.PI / 2) angle = -0.15;
  if (angle < -Math.PI + 0.15 || angle > Math.PI / 2) angle = -Math.PI + 0.15;
  state.aimAngle = angle;
}

function triggerRecall() {
  state.isRecalling = true;
  state.ballsToLaunch = [];
  updateHUD();
}

// --- Ball Launch & Return ---
function launchBalls() {
  if (state.ownedBalls.length === 0) return;
  state.isShooting = true;
  state.isRecalling = false;
  state.turnFrames = 0;
  state.ballsToLaunch = [...state.ownedBalls];
  state.launchTimer = 0;
  updateHUD();
}

function spawnNextBallToField() {
  if (state.ballsToLaunch.length === 0) return;
  
  const ballType = state.ballsToLaunch.shift();
  const speed = 11;
  state.activeBalls.push({
    x: state.launchPos.x,
    y: state.launchPos.y,
    vx: Math.cos(state.aimAngle) * speed,
    vy: Math.sin(state.aimAngle) * speed,
    r: ballType.isSynergy === 2 ? 6.5 : (ballType.isSynergy === 1 ? 5.8 : 5.0),
    type: ballType,
    active: true,
    bounces: 0,
    lastHitBrick: null
  });
}

function onTurnComplete() {
  state.isShooting = false;
  state.isRecalling = false;
  state.turnFrames = 0;
  state.activeBalls = [];
  state.ballsToLaunch = [];
  state.barrierActive = false;
  
  advanceWave();
}

function advanceWave() {
  state.wave += 1;
  spawnBrickRow();
  updateHUD();
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function checkBrickCollisionAndReflect(ball, brick) {
  if (ball.lastHitBrick === brick) {
    if (
      ball.x + ball.r < brick.x - 2 ||
      ball.x - ball.r > brick.x + brick.w + 2 ||
      ball.y + ball.r < brick.y - 2 ||
      ball.y - ball.r > brick.y + brick.h + 2
    ) {
      ball.lastHitBrick = null;
    } else {
      return null;
    }
  }

  if (
    ball.x + ball.r < brick.x ||
    ball.x - ball.r > brick.x + brick.w ||
    ball.y + ball.r < brick.y ||
    ball.y - ball.r > brick.y + brick.h
  ) {
    return null;
  }

  if (brick.shape) {
    const x = brick.x;
    const y = brick.y;
    const w = brick.w;
    const h = brick.h;

    let faces = [];
    if (brick.shape === 'TRIANGLE_TL') {
      faces = [
        { p1: { x: x, y: y }, p2: { x: x + w, y: y }, nx: 0, ny: -1 },
        { p1: { x: x, y: y }, p2: { x: x, y: y + h }, nx: -1, ny: 0 },
        { p1: { x: x + w, y: y }, p2: { x: x, y: y + h }, nx: 1 / Math.SQRT2, ny: 1 / Math.SQRT2 }
      ];
    } else if (brick.shape === 'TRIANGLE_TR') {
      faces = [
        { p1: { x: x, y: y }, p2: { x: x + w, y: y }, nx: 0, ny: -1 },
        { p1: { x: x + w, y: y }, p2: { x: x + w, y: y + h }, nx: 1, ny: 0 },
        { p1: { x: x, y: y }, p2: { x: x + w, y: y + h }, nx: -1 / Math.SQRT2, ny: 1 / Math.SQRT2 }
      ];
    } else if (brick.shape === 'TRIANGLE_BL') {
      faces = [
        { p1: { x: x, y: y + h }, p2: { x: x + w, y: y + h }, nx: 0, ny: 1 },
        { p1: { x: x, y: y }, p2: { x: x, y: y + h }, nx: -1, ny: 0 },
        { p1: { x: x, y: y }, p2: { x: x + w, y: y + h }, nx: 1 / Math.SQRT2, ny: -1 / Math.SQRT2 }
      ];
    } else if (brick.shape === 'TRIANGLE_BR') {
      faces = [
        { p1: { x: x, y: y + h }, p2: { x: x + w, y: y + h }, nx: 0, ny: 1 },
        { p1: { x: x + w, y: y }, p2: { x: x + w, y: y + h }, nx: 1, ny: 0 },
        { p1: { x: x + w, y: y }, p2: { x: x, y: y + h }, nx: -1 / Math.SQRT2, ny: -1 / Math.SQRT2 }
      ];
    }

    let bestFace = null;
    let minDistance = Infinity;

    for (let f of faces) {
      const dot = ball.vx * f.nx + ball.vy * f.ny;
      if (dot >= 0) continue;

      const dist = distanceToSegment(ball.x, ball.y, f.p1.x, f.p1.y, f.p2.x, f.p2.y);
      if (dist <= ball.r + 4.0 && dist < minDistance) {
        minDistance = dist;
        bestFace = f;
      }
    }

    if (bestFace) {
      return { nx: bestFace.nx, ny: bestFace.ny };
    }
    return null;
  }

  // Rectangular brick
  const minX = brick.x + brick.r;
  const maxX = brick.x + brick.w - brick.r;
  const minY = brick.y + brick.r;
  const maxY = brick.y + brick.h - brick.r;

  const cx = Math.max(minX, Math.min(ball.x, maxX));
  const cy = Math.max(minY, Math.min(ball.y, maxY));

  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const distSq = dx * dx + dy * dy;
  const targetDist = brick.r + ball.r;

  if (distSq <= (targetDist + 2.0) * (targetDist + 2.0)) {
    let nx = 0;
    let ny = 0;
    if (distSq > 0) {
      const dist = Math.sqrt(distSq);
      nx = dx / dist;
      ny = dy / dist;
    } else {
      const speed = Math.hypot(ball.vx, ball.vy) || 1;
      nx = -ball.vx / speed;
      ny = -ball.vy / speed;
    }

    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      return { nx: nx, ny: ny };
    }
  }

  return null;
}

// --- Physics Engine ---
function updatePhysics() {
  if (!state.isShooting) {
    const minSpeed = 0.0005;
    const maxSpeed = 0.022;
    const accelFrames = 60;

    if (keys.ArrowLeft) {
      keyHoldFrames.ArrowLeft++;
      const progress = Math.min(1, Math.max(0, keyHoldFrames.ArrowLeft - 15) / accelFrames);
      const speed = minSpeed + (maxSpeed - minSpeed) * (progress * progress);
      state.aimAngle -= speed;
      if (state.aimAngle < -Math.PI + 0.15) state.aimAngle = -Math.PI + 0.15;
    } else {
      keyHoldFrames.ArrowLeft = 0;
    }

    if (keys.ArrowRight) {
      keyHoldFrames.ArrowRight++;
      const progress = Math.min(1, Math.max(0, keyHoldFrames.ArrowRight - 15) / accelFrames);
      const speed = minSpeed + (maxSpeed - minSpeed) * (progress * progress);
      state.aimAngle += speed;
      if (state.aimAngle > -0.15) state.aimAngle = -0.15;
    } else {
      keyHoldFrames.ArrowRight = 0;
    }
  }

  for (let b of state.bricks) {
    if (b.y < b.targetY) {
      b.y += (b.targetY - b.y) * 0.15;
    }
  }

  if (!state.isShooting) return;

  state.turnFrames += 1 * state.speedMultiplier;
  
  if (state.turnFrames > 14400) {
    triggerRecall();
  }

  const subSteps = 8;
  const stepVelScale = state.speedMultiplier / 2;

  if (state.ballsToLaunch.length > 0 && !state.isRecalling) {
    state.launchTimer += 1 * state.speedMultiplier;
    let spawnLimit = 0;
    while (state.launchTimer >= 4 && state.ballsToLaunch.length > 0 && spawnLimit < 6) {
      state.launchTimer -= 4;
      spawnNextBallToField();
      spawnLimit++;
    }
  }

  for (let step = 0; step < subSteps; step++) {
    for (let ball of state.activeBalls) {
      if (!ball.active) continue;

      if (state.isRecalling) {
        const dx = state.launchPos.x - ball.x;
        const dy = state.launchPos.y - ball.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 15) {
          ball.active = false;
          continue;
        }
        ball.x += (dx / dist) * (22 * stepVelScale / subSteps);
        ball.y += (dy / dist) * (22 * stepVelScale / subSteps);
        continue;
      }

      if (Math.abs(ball.vy) < 0.6) {
        ball.vy = ball.vy >= 0 ? 1.2 : -1.2;
      }

      const prevY = ball.y;
      ball.x += (ball.vx * stepVelScale) / subSteps;
      ball.y += (ball.vy * stepVelScale) / subSteps;

      // Barrier Collision
      if (state.barrierActive && ball.vy > 0 && !state.isRecalling) {
        const barrierY = state.launchPos.y - 70;
        const barrierWidth = (canvas.width / 4) * 1.3;
        const barrierX1 = state.barrierX - barrierWidth / 2;
        const barrierX2 = state.barrierX + barrierWidth / 2;

        if (ball.x >= barrierX1 && ball.x <= barrierX2) {
          if (prevY + ball.r <= barrierY && ball.y + ball.r >= barrierY) {
            ball.y = barrierY - ball.r - 0.1;
            ball.vy = -Math.abs(ball.vy);
            ball.bounces++;
            sounds.playBounce();
            createBarrierSplash(ball.x, barrierY);
          }
        }
      }

      if (ball.bounces > 180) {
        ball.active = false;
        continue;
      }

      // Wall Collisions
      if (ball.x - ball.r <= 0) {
        ball.x = ball.r + 0.1;
        ball.vx = Math.abs(ball.vx);
        ball.bounces++;
        sounds.playBounce();
      } else if (ball.x + ball.r >= canvas.width) {
        ball.x = canvas.width - ball.r - 0.1;
        ball.vx = -Math.abs(ball.vx);
        ball.bounces++;
        sounds.playBounce();
      }

      if (ball.y - ball.r <= 0) {
        ball.y = ball.r + 0.1;
        ball.vy = Math.abs(ball.vy);
        ball.bounces++;
        sounds.playBounce();
      } else if (ball.y + ball.r >= canvas.height - 10) {
        ball.active = false;
        if (state.activeBalls.every(b => !b.active || b === ball)) {
          state.launchPos.x = Math.max(20, Math.min(canvas.width - 20, ball.x));
        }
        continue;
      }

      // Brick Collisions (Unified Exact Geometry & Reflection Pipeline)
      for (let i = state.bricks.length - 1; i >= 0; i--) {
        const brick = state.bricks[i];
        const colRes = checkBrickCollisionAndReflect(ball, brick);
        if (colRes) {
          const nx = colRes.nx;
          const ny = colRes.ny;
          const dot = ball.vx * nx + ball.vy * ny;

          if (ball.type.id.startsWith('DIFFUSE') || ball.type.id === 'DIFFUSE_CROSS' || ball.type.id === 'GOD_PULSE') {
            randomizeBounce(ball, nx, ny);
          } else {
            ball.vx = ball.vx - 2 * dot * nx;
            ball.vy = ball.vy - 2 * dot * ny;
          }

          ball.x += nx * (ball.r + 1.2);
          ball.y += ny * (ball.r + 1.2);
          ball.lastHitBrick = brick;

          ball.bounces++;
          sounds.playBounce();

          triggerLightImpactFX(ball, brick, ball.x, ball.y, nx, ny);
          applyBallEffect(ball, brick);
          break;
        }
      }
    }
  }

  if (state.isShooting && state.ballsToLaunch.length === 0 && (state.activeBalls.length === 0 || state.activeBalls.every(b => !b.active))) {
    onTurnComplete();
  }
}

function triggerLightImpactFX(ball, brick, hitX, hitY, nx, ny) {
  state.screenShake = Math.min(3, 1 + ball.type.damage * 0.3);

  if (state.particles.length >= MAX_PARTICLES) return;

  const baseAngle = Math.atan2(ny, nx);
  for (let i = 0; i < 2; i++) {
    const spreadAngle = baseAngle + (Math.random() - 0.5) * (Math.PI * 0.6);
    const speed = Math.random() * 3 + 1;
    state.particles.push({
      x: hitX,
      y: hitY,
      vx: Math.cos(spreadAngle) * speed,
      vy: Math.sin(spreadAngle) * speed,
      life: 8,
      maxLife: 8,
      color: ball.type.color,
      size: Math.random() * 2 + 1
    });
  }
}

function randomizeBounce(ball, nx, ny) {
  const speed = Math.hypot(ball.vx, ball.vy) || 11;
  const normalAngle = Math.atan2(ny, nx);
  const randomOffset = (Math.random() - 0.5) * (Math.PI * 0.78);
  const newAngle = normalAngle + randomOffset;
  ball.vx = Math.cos(newAngle) * speed;
  ball.vy = Math.sin(newAngle) * speed;
}

// --- Ball Abilities & Collision-Triggered Bonus Blocks (Including Hybrid Abilities!) ---
function applyBallEffect(ball, hitBrick) {
  damageBrick(hitBrick, ball.type.damage, true);

  const col = hitBrick.col;
  const row = hitBrick.row;
  const tier = ball.type.isSynergy || 0;
  const bx = hitBrick.x + hitBrick.w / 2;
  const by = hitBrick.y + hitBrick.h / 2;

  if (hitBrick.type === BRICK_TYPES.BONUS_BALL) {
    const baseTypes = Object.values(BALL_TYPES).filter(t => !t.isSynergy && !t.isHybrid);
    const newBall = baseTypes[Math.floor(Math.random() * baseTypes.length)];
    state.ownedBalls.push(newBall);
    sounds.playCoin();
    createFloatingText(bx, by, `🎁 ${newBall.icon} 획득!`, newBall.color);
  } else if (hitBrick.type === BRICK_TYPES.BONUS_EXPLODE) {
    sounds.playExplosion();
    const adj = getAdjacentBricks(col, row);
    for (let ab of adj) {
      damageBrick(ab, 5, false);
    }
    createFloatingText(bx, by, '💥 폭발!', '#ff4757');
  } else if (hitBrick.type === BRICK_TYPES.BONUS_LIGHTNING) {
    sounds.playLaser();
    for (let b of state.bricks) {
      if (b !== hitBrick) {
        damageBrick(b, 1, false);
      }
    }
    createFloatingText(bx, by, '⚡ 벼락!', '#00d2ff');
  }

  // --- Hybrid Abilities ---
  if (ball.type.id === 'FIRE_BOMB') {
    sounds.playExplosion();
    const fireNeighbors = getAdjacentBricks(col, row);
    shuffleArray(fireNeighbors);
    for (let b of fireNeighbors.slice(0, 6)) {
      damageBrick(b, 3, false);
    }
    createFloatingText(bx, by, '💥🔥 화염폭탄!', '#ff3f34');
  } else if (ball.type.id === 'ELEC_ROW') {
    sounds.playLaser();
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, ball.type.color);
    for (let b of state.bricks) {
      if (b !== hitBrick && b.row === row) {
        damageBrick(b, 2, false);
        const adj = getAdjacentBricks(b.col, b.row);
        if (adj.length > 0) damageBrick(adj[0], 1, false);
      }
    }
  } else if (ball.type.id === 'ELEC_COL') {
    sounds.playLaser();
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, ball.type.color);
    for (let b of state.bricks) {
      if (b !== hitBrick && b.col === col) {
        damageBrick(b, 2, false);
        const adj = getAdjacentBricks(b.col, b.row);
        if (adj.length > 0) damageBrick(adj[0], 1, false);
      }
    }
  } else if (ball.type.id === 'DIFFUSE_CROSS') {
    sounds.playLaser();
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, ball.type.color);
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, ball.type.color);
    for (let b of state.bricks) {
      if (b !== hitBrick && (b.col === col || b.row === row)) {
        damageBrick(b, 2, false);
      }
    }
  } else if (ball.type.id === 'PLASMA') {
    sounds.playLaser();
    sounds.playExplosion();
    const plasmaTargets = getAdjacentBricks(col, row);
    for (let b of plasmaTargets) {
      damageBrick(b, 3, false);
    }
    createFloatingText(bx, by, '⚡🔥 플라즈마!', '#ff5e57');
  } else if (ball.type.id === 'BOMB_CROSS') {
    sounds.playExplosion();
    sounds.playLaser();
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, ball.type.color);
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, ball.type.color);
    for (let b of state.bricks) {
      if (b !== hitBrick && (b.col === col || b.row === row)) {
        damageBrick(b, 4, false);
      }
    }
  } else if (ball.type.id === 'HYBRID_GENERIC') {
    sounds.playLaser();
    const elecNeighbors = getAdjacentBricks(col, row);
    for (let b of elecNeighbors.slice(0, 4)) {
      damageBrick(b, 2, false);
    }
  } else if (ball.type.id === 'SUPER_POWER') {
    sounds.playExplosion();
    sounds.playLaser();
    state.screenShake = 14;
    state.shockwaves.push({ x: bx, y: by, r: 5, maxR: 120, color: '#ff3838', alpha: 1 });
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, '#ff3838');
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, '#ff3838');
    for (let b of state.bricks) {
      if (b !== hitBrick) damageBrick(b, 5, false);
    }
    const fireNeighbors = getAdjacentBricks(col, row);
    for (let b of fireNeighbors) {
      damageBrick(b, 10, false);
    }
    for (let b of state.bricks) {
      if (b !== hitBrick && (b.col === col || b.row === row)) {
        damageBrick(b, 5, false);
      }
    }
    createFloatingText(bx, by, '⚡🔥💥 초강력 파멸 (25)!', '#ff3838');
  } else if (ball.type.id === 'GOD_PULSE') {
    sounds.playExplosion();
    sounds.playLaser();
    state.screenShake = 16;
    state.shockwaves.push({ x: bx, y: by, r: 5, maxR: 150, color: '#ffaf40', alpha: 1 });
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, '#ffaf40');
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, '#ffaf40');
    for (let b of state.bricks) {
      if (b !== hitBrick) damageBrick(b, 7, false);
    }
    createFloatingText(bx, by, '🌀⚡💥 갓 플라즈마 (30)!', '#ffaf40');
  }

  // --- Regular Abilities ---
  if (ball.type.id.startsWith('CROSS') && ball.type.id !== 'DIFFUSE_CROSS' && ball.type.id !== 'BOMB_CROSS') {
    sounds.playLaser();
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, ball.type.color);
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, ball.type.color);
    const splashDmg = tier === 2 ? 3 : (tier === 1 ? 2 : 1);
    for (let b of state.bricks) {
      if (b !== hitBrick && (b.col === col || b.row === row)) {
        damageBrick(b, splashDmg, false);
      }
    }
  } else if (ball.type.id.startsWith('ROW') && ball.type.id !== 'ELEC_ROW') {
    sounds.playLaser();
    addBeamEffect('horizontal', hitBrick.y + hitBrick.h / 2, ball.type.color);
    const rowRange = tier === 2 ? 2 : (tier === 1 ? 1 : 0);
    const splashDmg = tier === 2 ? 3 : (tier === 1 ? 2 : 1);
    for (let b of state.bricks) {
      if (b !== hitBrick && Math.abs(b.row - row) <= rowRange) {
        damageBrick(b, splashDmg, false);
      }
    }
  } else if (ball.type.id.startsWith('COL') && ball.type.id !== 'ELEC_COL') {
    sounds.playLaser();
    addBeamEffect('vertical', hitBrick.x + hitBrick.w / 2, ball.type.color);
    const colRange = tier === 2 ? 2 : (tier === 1 ? 1 : 0);
    const splashDmg = tier === 2 ? 3 : (tier === 1 ? 2 : 1);
    for (let b of state.bricks) {
      if (b !== hitBrick && Math.abs(b.col - col) <= colRange) {
        damageBrick(b, splashDmg, false);
      }
    }
  } else if (ball.type.id.startsWith('BOMB') && ball.type.id !== 'FIRE_BOMB' && ball.type.id !== 'BOMB_CROSS') {
    sounds.playExplosion();
  } else if (ball.type.id.startsWith('FIRE') && ball.type.id !== 'FIRE_BOMB' && ball.type.id !== 'PLASMA') {
    sounds.playExplosion();
    const count = tier === 2 ? 9 : (tier === 1 ? 6 : 3);
    const splashDmg = tier === 2 ? 3 : (tier === 1 ? 2 : 1);
    const fireNeighbors = getAdjacentBricks(col, row);
    shuffleArray(fireNeighbors);
    const fireTargets = fireNeighbors.slice(0, count);
    for (let b of fireTargets) {
      damageBrick(b, splashDmg, false);
    }
  } else if (ball.type.id.startsWith('ELEC') && ball.type.id !== 'ELEC_ROW' && ball.type.id !== 'ELEC_COL' && ball.type.id !== 'PLASMA') {
    sounds.playLaser();
    const count = tier === 2 ? 9 : (tier === 1 ? 6 : 3);
    const splashDmg = tier === 2 ? 3 : (tier === 1 ? 2 : 1);
    const elecNeighbors = getAdjacentBricks(col, row);
    shuffleArray(elecNeighbors);
    const elecTargets = elecNeighbors.slice(0, count);
    for (let b of elecTargets) {
      damageBrick(b, splashDmg, false);
    }
  }
}

function damageBrick(brick, dmg, isDirectHit = false) {
  if (brick.type === BRICK_TYPES.UNBREAKABLE || brick.isUnbreakable) {
    brick.hitFlash = 3;
    sounds.playBounce();
    return;
  }

  brick.hp -= dmg;
  brick.hitFlash = isDirectHit ? 4 : 2;

  state.score += Math.round(dmg * 10);
  
  let shellGain = 1.15;
  if (brick.type >= BRICK_TYPES.BONUS_BALL) {
    shellGain = 6.0;
  } else if (brick.type === BRICK_TYPES.ELITE) {
    shellGain = 6.0;
  }
  
  shellGain = Math.round(shellGain * (1 + (state.talents.seashellBoost || 0) * 0.2));
  state.seashells += shellGain;

  // Charge skill on collision
  if (!state.barrierActive && state.skillCharge < state.maxSkillCharge) {
    state.skillCharge = Math.min(state.maxSkillCharge, state.skillCharge + 1);
    updateSkillUI();
  }

  if (brick.hp <= 0) {
    sounds.playCoin();
    const idx = state.bricks.indexOf(brick);
    if (idx !== -1) state.bricks.splice(idx, 1);
  }
}

function getAdjacentBricks(col, row) {
  return state.bricks.filter(b => 
    Math.abs(b.col - col) <= 1 && Math.abs(b.row - row) <= 1 && !(b.col === col && b.row === row)
  );
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// --- Ball Shop Gacha System ---
function buyBalls(count) {
  let price = 40;
  if (count === 6) price = 220;
  else if (count === 24) price = 800;
  else if (count === 64) price = 2000;
  else price = count * 40;

  if (state.seashells < price) {
    alert('조개가 부족합니다!');
    return;
  }
  state.seashells -= price;

  const baseTypes = Object.values(BALL_TYPES).filter(t => !t.isSynergy && !t.isHybrid);
  for (let i = 0; i < count; i++) {
    const randIndex = Math.floor(Math.random() * baseTypes.length);
    const drawnBall = baseTypes[randIndex];
    state.ownedBalls.push(drawnBall);
  }

  sounds.playCoin();
  createFloatingText(canvas.width / 2, canvas.height / 2, `🎁 ${count}회 연속 뽑기 완료!`, '#ffd166');
  updateHUD();
}

// --- Fusion System: Single-Screen Unified Fusion (Same & Hybrid) ---
function getHybridBall(id1, id2) {
  const set = new Set([id1, id2]);
  if (set.has('FIRE') && set.has('BOMB')) return BALL_TYPES.FIRE_BOMB;
  if (set.has('ELEC') && set.has('ROW')) return BALL_TYPES.ELEC_ROW;
  if (set.has('ELEC') && set.has('COL')) return BALL_TYPES.ELEC_COL;
  if (set.has('DIFFUSE') && set.has('CROSS')) return BALL_TYPES.DIFFUSE_CROSS;
  if (set.has('FIRE') && set.has('ELEC')) return BALL_TYPES.PLASMA;
  if (set.has('BOMB') && set.has('CROSS')) return BALL_TYPES.BOMB_CROSS;
  return BALL_TYPES.HYBRID_GENERIC;
}

function getCraftableCount(resId) {
  const resBall = BALL_TYPES[resId];
  if (!resBall) return 0;

  if (resBall.isSuper) {
    if (resId === 'GOD_PULSE') {
      const hybrids = state.ownedBalls.filter(b => b.isHybrid).length;
      return Math.floor(hybrids / 2);
    } else {
      const highCount = state.ownedBalls.filter(b => b.isSynergy === 2 || b.isHybrid).length;
      return Math.floor(highCount / 2);
    }
  } else if (resBall.isHybrid) {
    const hybridReqs = {
      FIRE_BOMB: ['FIRE', 'BOMB'],
      ELEC_ROW: ['ELEC', 'ROW'],
      ELEC_COL: ['ELEC', 'COL'],
      DIFFUSE_CROSS: ['DIFFUSE', 'CROSS'],
      PLASMA: ['FIRE', 'ELEC'],
      BOMB_CROSS: ['BOMB', 'CROSS']
    };
    const req = hybridReqs[resId];
    if (req) {
      const c1 = state.ownedBalls.filter(b => b.id === req[0]).length;
      const c2 = state.ownedBalls.filter(b => b.id === req[1]).length;
      return Math.min(c1, c2);
    } else if (resId === 'HYBRID_GENERIC') {
      const baseCounts = {};
      state.ownedBalls.forEach(b => {
        if (!b.isSynergy && !b.isHybrid) baseCounts[b.id] = (baseCounts[b.id] || 0) + 1;
      });
      const keys = Object.keys(baseCounts);
      let pairs = 0;
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          pairs += Math.min(baseCounts[keys[i]], baseCounts[keys[j]]);
        }
      }
      return pairs;
    }
  } else if (resBall.isSynergy) {
    const baseId = Object.keys(BALL_TYPES).find(id => BALL_TYPES[id].synergyId === resId);
    if (baseId) {
      const count = state.ownedBalls.filter(b => b.id === baseId).length;
      return Math.floor(count / 2);
    }
  }
  return 0;
}

window.craftResultBall = function(resId) {
  const resBall = BALL_TYPES[resId];
  if (!resBall) return;

  let firstIdx = -1;
  let secondIdx = -1;

  if (resBall.isSuper) {
    if (resId === 'GOD_PULSE') {
      for (let i = 0; i < state.ownedBalls.length; i++) {
        if (state.ownedBalls[i].isHybrid) {
          if (firstIdx === -1) firstIdx = i;
          else { secondIdx = i; break; }
        }
      }
    } else {
      for (let i = 0; i < state.ownedBalls.length; i++) {
        if (state.ownedBalls[i].isSynergy === 2 || state.ownedBalls[i].isHybrid) {
          if (firstIdx === -1) firstIdx = i;
          else { secondIdx = i; break; }
        }
      }
    }
  } else if (resBall.isHybrid) {
    const hybridReqs = {
      FIRE_BOMB: ['FIRE', 'BOMB'],
      ELEC_ROW: ['ELEC', 'ROW'],
      ELEC_COL: ['ELEC', 'COL'],
      DIFFUSE_CROSS: ['DIFFUSE', 'CROSS'],
      PLASMA: ['FIRE', 'ELEC'],
      BOMB_CROSS: ['BOMB', 'CROSS']
    };
    const req = hybridReqs[resId];
    if (req) {
      for (let i = 0; i < state.ownedBalls.length; i++) {
        if (state.ownedBalls[i].id === req[0] && firstIdx === -1) firstIdx = i;
        else if (state.ownedBalls[i].id === req[1] && secondIdx === -1) secondIdx = i;
      }
    } else {
      for (let i = 0; i < state.ownedBalls.length; i++) {
        const b = state.ownedBalls[i];
        if (!b.isSynergy && !b.isHybrid) {
          if (firstIdx === -1) firstIdx = i;
          else if (b.id !== state.ownedBalls[firstIdx].id) { secondIdx = i; break; }
        }
      }
    }
  } else if (resBall.isSynergy) {
    const baseId = Object.keys(BALL_TYPES).find(id => BALL_TYPES[id].synergyId === resId);
    if (baseId) {
      for (let i = 0; i < state.ownedBalls.length; i++) {
        if (state.ownedBalls[i].id === baseId) {
          if (firstIdx === -1) firstIdx = i;
          else { secondIdx = i; break; }
        }
      }
    }
  }

  if (firstIdx === -1 || secondIdx === -1) return;

  const minIdx = Math.min(firstIdx, secondIdx);
  const maxIdx = Math.max(firstIdx, secondIdx);

  state.ownedBalls[minIdx] = resBall;
  state.ownedBalls.splice(maxIdx, 1);

  sounds.playExplosion();
  createFloatingText(canvas.width / 2, canvas.height / 2, `✨ 조합 성공: ${resBall.name}!`, resBall.color);

  updateHUD();
  renderFusionList();
};

function renderFusionList() {
  const container = document.getElementById('fusionList');
  if (!container) return;
  container.innerHTML = '';

  const sameResultIds = Object.keys(BALL_TYPES).filter(id => BALL_TYPES[id].isSynergy && !BALL_TYPES[id].isSuper && !BALL_TYPES[id].isHybrid);
  const hybridResultIds = Object.keys(BALL_TYPES).filter(id => BALL_TYPES[id].isHybrid);
  const superResultIds = Object.keys(BALL_TYPES).filter(id => BALL_TYPES[id].isSuper);

  renderResultCategory(container, '🌟 동종 강화 조합 결과', sameResultIds, '#ffd166');
  renderResultCategory(container, '🧪 이종 융합 조합 결과', hybridResultIds, '#ff7979');
  renderResultCategory(container, '👑 초강력 시너지 융합 결과 (UR 등급)', superResultIds, '#ff3838', true);
}

function renderResultCategory(container, titleText, resultIds, titleColor, isSuperCategory = false) {
  const section = document.createElement('div');
  section.className = 'fusion-section';
  if (container.children.length > 0) section.style.marginTop = '16px';

  section.innerHTML = `
    <div style="font-size:0.88rem; font-weight:800; color:${titleColor}; padding:4px 0 8px 0; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <span>${titleText}</span>
      <span style="font-size:0.75rem; font-weight:400; color:#a0aec0;">(제작 가능한 공 기준 표시)</span>
    </div>
  `;

  let craftableCountTotal = 0;
  const listDiv = document.createElement('div');
  listDiv.style.display = 'flex';
  listDiv.style.flexDirection = 'column';
  listDiv.style.gap = '8px';

  resultIds.forEach(resId => {
    const craftableCount = getCraftableCount(resId);
    if (craftableCount > 0) {
      craftableCountTotal += craftableCount;
      const resBall = BALL_TYPES[resId];

      const item = document.createElement('div');
      item.className = 'talent-item';
      if (isSuperCategory) {
        item.style.border = '1px dashed rgba(255, 56, 56, 0.6)';
        item.style.background = 'linear-gradient(135deg, rgba(255,56,56,0.12), rgba(255,175,64,0.12))';
      }

      let superBadge = '';
      if (isSuperCategory) {
        superBadge = `
          <div style="background:linear-gradient(90deg, #ff3838, #ffaf40); color:white; font-size:0.72rem; font-weight:800; padding:3px 8px; border-radius:4px; margin-top:5px; display:inline-block;">
            👑 [초강력공 차이점] 25~30 압도적 데미지 + 화면 전체 4중 폭발 & 파멸 시너지 발동!
          </div>
        `;
      }

      item.innerHTML = `
        <div class="talent-info" style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <h4 style="margin:0;">${resBall.icon} ${resBall.name} <span style="font-size:0.75rem; opacity:0.8;">[${resBall.grade}]</span></h4>
            <span style="background:rgba(255,209,102,0.25); color:#ffd166; font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:10px;">제작 가능: ${craftableCount}개</span>
          </div>
          <p style="color:#e0e0e0; font-size:0.8rem; font-weight:600; margin-top:4px; margin-bottom:0;">✨ 특수 효과: ${resBall.desc}</p>
          ${superBadge}
        </div>
        <button class="btn-upgrade btn-fuse" style="margin-left:8px; ${isSuperCategory ? 'background:linear-gradient(135deg, #ff3838, #ffaf40);' : ''}" onclick="craftResultBall('${resId}')">
          조합하기
        </button>
      `;
      listDiv.appendChild(item);
    }
  });

  if (craftableCountTotal === 0) {
    section.innerHTML += `<p style="font-size:0.78rem; color:#a0aec0; padding:8px 0; text-align:center;">현재 보유한 재료로 제작 가능한 공이 없습니다.</p>`;
  } else {
    section.appendChild(listDiv);
  }

  container.appendChild(section);
}

// In-Place Same-Type Fusion
window.fuseBalls = function(baseId) {
  let firstIdx = -1;
  let secondIdx = -1;

  for (let i = 0; i < state.ownedBalls.length; i++) {
    if (state.ownedBalls[i].id === baseId) {
      if (firstIdx === -1) {
        firstIdx = i;
      } else {
        secondIdx = i;
        break;
      }
    }
  }

  if (firstIdx === -1 || secondIdx === -1) return;

  const baseBall = BALL_TYPES[baseId];
  const synBall = BALL_TYPES[baseBall.synergyId];

  state.ownedBalls[firstIdx] = synBall;
  state.ownedBalls.splice(secondIdx, 1);

  sounds.playExplosion();
  createFloatingText(canvas.width / 2, canvas.height / 2, `✨ 시너지 성공: ${synBall.name}!`, synBall.color);

  updateHUD();
  renderFusionList();
};

// In-Place Cross-Element Hybrid Fusion
window.fuseHybridBalls = function(id1, id2) {
  let idx1 = -1;
  let idx2 = -1;

  for (let i = 0; i < state.ownedBalls.length; i++) {
    if (state.ownedBalls[i].id === id1 && idx1 === -1) {
      idx1 = i;
    } else if (state.ownedBalls[i].id === id2 && idx2 === -1) {
      idx2 = i;
    }
    if (idx1 !== -1 && idx2 !== -1) break;
  }

  if (idx1 === -1 || idx2 === -1) return;

  const hybridBall = getHybridBall(id1, id2);
  
  const minIdx = Math.min(idx1, idx2);
  const maxIdx = Math.max(idx1, idx2);

  state.ownedBalls[minIdx] = hybridBall;
  state.ownedBalls.splice(maxIdx, 1);

  sounds.playExplosion();
  createFloatingText(canvas.width / 2, canvas.height / 2, `🧪 이종 융합 성공: ${hybridBall.name}!`, hybridBall.color);

  updateHUD();
  renderFusionList();
};

function fuseAllBalls() {
  let mergedAny = false;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < state.ownedBalls.length; i++) {
      const b1 = state.ownedBalls[i];
      if (!b1.synergyId) continue;

      for (let j = i + 1; j < state.ownedBalls.length; j++) {
        const b2 = state.ownedBalls[j];
        if (b2.id === b1.id) {
          state.ownedBalls[i] = BALL_TYPES[b1.synergyId];
          state.ownedBalls.splice(j, 1);
          mergedAny = true;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  if (mergedAny) {
    sounds.playExplosion();
    createFloatingText(canvas.width / 2, canvas.height / 2, `⚡ 모두 동종 조합 완료!`, '#ffd166');
  }

  updateHUD();
  renderFusionList();
}

function fuseAllHybridBalls() {
  let mergedAny = false;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < state.ownedBalls.length; i++) {
      const b1 = state.ownedBalls[i];
      if (b1.isSynergy || b1.isHybrid) continue;

      for (let j = i + 1; j < state.ownedBalls.length; j++) {
        const b2 = state.ownedBalls[j];
        if (!b2.isSynergy && !b2.isHybrid && b2.id !== b1.id) {
          const result = getHybridBall(b1.id, b2.id);
          state.ownedBalls[i] = result;
          state.ownedBalls.splice(j, 1);
          mergedAny = true;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  if (mergedAny) {
    sounds.playExplosion();
    createFloatingText(canvas.width / 2, canvas.height / 2, `🧪 모두 이종 융합 완료!`, '#ff7979');
  }

  updateHUD();
  renderFusionList();
}

window.fuseSuperBalls = function(id1, id2) {
  let idx1 = -1;
  let idx2 = -1;

  for (let i = 0; i < state.ownedBalls.length; i++) {
    if (state.ownedBalls[i].id === id1 && idx1 === -1) {
      idx1 = i;
    } else if (state.ownedBalls[i].id === id2 && idx2 === -1) {
      idx2 = i;
    }
    if (idx1 !== -1 && idx2 !== -1) break;
  }

  if (idx1 === -1 || idx2 === -1) return;

  const b1 = BALL_TYPES[id1];
  const b2 = BALL_TYPES[id2];
  let superBall = BALL_TYPES.SUPER_POWER;
  if (b1.isHybrid && b2.isHybrid) {
    superBall = BALL_TYPES.GOD_PULSE;
  }

  const minIdx = Math.min(idx1, idx2);
  const maxIdx = Math.max(idx1, idx2);

  state.ownedBalls[minIdx] = superBall;
  state.ownedBalls.splice(maxIdx, 1);

  sounds.playExplosion();
  createFloatingText(canvas.width / 2, canvas.height / 2, `👑 초강력 시너지 융합 성공: ${superBall.name}!`, superBall.color);

  updateHUD();
  renderFusionList();
};

function fuseAllSuperBalls() {
  let mergedAny = false;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < state.ownedBalls.length; i++) {
      const b1 = state.ownedBalls[i];
      if (b1.isSynergy !== 2 && !b1.isHybrid) continue;

      for (let j = i + 1; j < state.ownedBalls.length; j++) {
        const b2 = state.ownedBalls[j];
        if (b2.isSynergy === 2 || b2.isHybrid) {
          const result = (b1.isHybrid && b2.isHybrid) ? BALL_TYPES.GOD_PULSE : BALL_TYPES.SUPER_POWER;
          state.ownedBalls[i] = result;
          state.ownedBalls.splice(j, 1);
          mergedAny = true;
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  if (mergedAny) {
    sounds.playExplosion();
    createFloatingText(canvas.width / 2, canvas.height / 2, `💥 모두 초강력 융합 완료!`, '#ff3838');
  }

  updateHUD();
  renderFusionList();
}

// --- Talents System ---
const TALENT_DEFS = [
  { id: 'seashellBoost', name: '조개 획득량 증가', desc: '타격/파괴 시 조개 획득량 +20% 증가', maxLv: 5 },
  { id: 'bonusBrickRate', name: '보너스 블록 출현율 증가', desc: '2가지 특수 보너스 블록 출현 확률 +8% 증가 (최대 +40%)', maxLv: 5 }
];

function renderTalentList() {
  document.getElementById('talentPointText').innerText = state.talentPoints;
  const container = document.getElementById('talentList');
  container.innerHTML = '';

  TALENT_DEFS.forEach(t => {
    const curLv = state.talents[t.id] || 0;
    const item = document.createElement('div');
    item.className = 'talent-item';
    item.innerHTML = `
      <div class="talent-info">
        <h4>${t.name} (Lv.${curLv}/${t.maxLv})</h4>
        <p>${t.desc}</p>
      </div>
      <button class="btn-upgrade" ${curLv >= t.maxLv || state.talentPoints < 1 ? 'disabled' : ''} onclick="upgradeTalent('${t.id}')">
        강화 (1 TP)
      </button>
    `;
    container.appendChild(item);
  });
}

window.upgradeTalent = function(id) {
  if (state.talentPoints < 1) return;
  state.talents[id] = (state.talents[id] || 0) + 1;
  state.talentPoints -= 1;
  savePersistentData();
  renderTalentList();
};

function resetTalents() {
  let spent = 0;
  Object.keys(state.talents).forEach(k => {
    spent += state.talents[k];
    state.talents[k] = 0;
  });
  state.talentPoints += spent;
  savePersistentData();
  renderTalentList();
}

// --- Game Over ---
function triggerGameOver() {
  const earnedTP = Math.floor(state.wave / 3);
  state.talentPoints += earnedTP;
  savePersistentData();

  document.getElementById('finalWaveText').innerText = state.wave;
  document.getElementById('finalScoreText').innerText = state.score;
  document.getElementById('earnedTPText').innerText = `+${earnedTP} TP`;
  
  openModal('modalGameOver');
}

// --- Smooth 60 FPS Rendering Loop ---
function gameLoop() {
  updatePhysics();

  // Lightweight HUD sync once per frame
  document.getElementById('scoreText').innerText = state.score;
  document.getElementById('shellText').innerText = Math.floor(state.seashells);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake;
    const shakeY = (Math.random() - 0.5) * state.screenShake;
    ctx.translate(shakeX, shakeY);
    state.screenShake *= 0.8;
    if (state.screenShake < 0.2) state.screenShake = 0;
  }

  drawBackground();
  drawBricks();
  drawActiveBalls();
  drawAimLine();
  drawBarrier();
  drawLightFX();

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

function drawBackground() {
  ctx.strokeStyle = 'rgba(255, 71, 87, 0.7)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 30);
  ctx.lineTo(canvas.width, canvas.height - 30);
  ctx.stroke();
  ctx.setLineDash([]);

  // Launch pad base marker
  ctx.fillStyle = '#64dfdf';
  ctx.beginPath();
  ctx.arc(state.launchPos.x, state.launchPos.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Dynamic Launcher Remaining Ball Count Indicator
  const remainingCount = !state.isShooting ? state.ownedBalls.length : state.ballsToLaunch.length;

  if (remainingCount > 0 || !state.isShooting) {
    ctx.fillStyle = state.isShooting ? '#ffd166' : '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${remainingCount}`, state.launchPos.x, state.launchPos.y + 20);
  }
}

function drawTriangleShape(ctx, x, y, w, h, shape) {
  ctx.beginPath();
  if (shape === 'TRIANGLE_TL') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y + h);
  } else if (shape === 'TRIANGLE_TR') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
  } else if (shape === 'TRIANGLE_BL') {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
  } else if (shape === 'TRIANGLE_BR') {
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
  }
  ctx.closePath();
}

function drawBricks() {
  for (let b of state.bricks) {
    if (b.type === BRICK_TYPES.UNBREAKABLE) {
      ctx.save();
      const isFlashing = b.hitFlash > 0;
      if (isFlashing) b.hitFlash--;

      ctx.fillStyle = isFlashing ? '#ffffff' : '#2f3640';
      drawRoundedRect(ctx, b.x, b.y, b.w, b.h, b.r);
      ctx.fill();

      ctx.strokeStyle = isFlashing ? '#ffffff' : '#7f8fa6';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = isFlashing ? '#f5cd79' : '#fbc531';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 13px sans-serif';
      ctx.fillText('🛡️ UNBREAKABLE', b.x + b.w / 2, b.y + b.h / 2);

      ctx.restore();
      continue;
    }

    ctx.save();

    let color = getBrickColor(b);
    const isFlashing = b.hitFlash > 0;

    if (isFlashing) {
      color = '#ffffff';
      b.hitFlash--;
    }

    ctx.fillStyle = color;
    if (b.shape) {
      drawTriangleShape(ctx, b.x, b.y, b.w, b.h, b.shape);
    } else {
      drawRoundedRect(ctx, b.x, b.y, b.w, b.h, b.r);
    }
    ctx.fill();

    if (isFlashing) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (b.type === BRICK_TYPES.ELITE) {
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else if (b.type >= 3) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.fillStyle = isFlashing ? '#ff4757' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let iconStr = '';
    let labelStr = '';
    if (b.type === BRICK_TYPES.BONUS_BALL) { iconStr = '🎁'; labelStr = '+1공'; }
    else if (b.type === BRICK_TYPES.BONUS_EXPLODE) { iconStr = '💥'; labelStr = '3x3폭발'; }
    else if (b.type === BRICK_TYPES.BONUS_LIGHTNING) { iconStr = '⚡'; labelStr = '전체벼락'; }

    let textX = b.x + b.w / 2;
    let textY = b.y + b.h / 2;
    if (b.shape === 'TRIANGLE_TL') { textX = b.x + b.w * 0.35; textY = b.y + b.h * 0.35; }
    else if (b.shape === 'TRIANGLE_TR') { textX = b.x + b.w * 0.65; textY = b.y + b.h * 0.35; }
    else if (b.shape === 'TRIANGLE_BL') { textX = b.x + b.w * 0.35; textY = b.y + b.h * 0.65; }
    else if (b.shape === 'TRIANGLE_BR') { textX = b.x + b.w * 0.65; textY = b.y + b.h * 0.65; }

    if (labelStr) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${iconStr}${b.hp}`, textX, textY - 6);
      ctx.font = '800 9px sans-serif';
      ctx.fillStyle = isFlashing ? '#ff4757' : '#ffe066';
      ctx.fillText(labelStr, textX, textY + 8);
    } else {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${b.hp}`, textX, textY);
    }

    ctx.restore();
  }
}

function getBrickColor(b) {
  if (b.type === BRICK_TYPES.ELITE) return '#9b59b6';
  if (b.type === BRICK_TYPES.BONUS_BALL) return '#ff4757';
  if (b.type === BRICK_TYPES.BONUS_EXPLODE) return '#ff6b6b';
  if (b.type === BRICK_TYPES.BONUS_LIGHTNING) return '#00d2ff';

  const ratio = b.hp / b.maxHp;
  if (ratio > 0.7) return '#3498db';
  if (ratio > 0.4) return '#2ecc71';
  return '#e67e22';
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawActiveBalls() {
  for (let b of state.activeBalls) {
    if (!b.active) continue;
    ctx.save();
    
    if (b.type.isSuper) {
      ctx.shadowColor = b.type.color;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 3 + Math.sin(Date.now() / 80) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = b.type.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    if (b.type.isSynergy || b.type.isSuper) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Guaranteed 100% Exact Virtual Physics Simulation Trajectory Engine
function drawAimLine() {
  if (state.isShooting) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);

  const ballR = state.ownedBalls.length > 0 ? (state.ownedBalls[0].isSynergy === 2 ? 6.5 : (state.ownedBalls[0].isSynergy === 1 ? 5.8 : 5.0)) : 5.0;

  const simBall = {
    x: state.launchPos.x,
    y: state.launchPos.y,
    vx: Math.cos(state.aimAngle) * 11,
    vy: Math.sin(state.aimAngle) * 11,
    r: ballR,
    lastHitBrick: null
  };

  const subSteps = 8;
  const stepVelScale = state.speedMultiplier / 2;
  const points = [{ x: simBall.x, y: simBall.y }];
  const bouncePoints = [];
  
  let bounces = 0;
  let brickHits = 0;
  const maxSteps = 1200;

  for (let s = 0; s < maxSteps && brickHits < 2 && bounces < 15; s++) {
    if (Math.abs(simBall.vy) < 0.6) {
      simBall.vy = simBall.vy >= 0 ? 1.2 : -1.2;
    }

    simBall.x += (simBall.vx * stepVelScale) / subSteps;
    simBall.y += (simBall.vy * stepVelScale) / subSteps;

    let bouncedThisStep = false;

    if (simBall.x - simBall.r <= 0) {
      simBall.x = simBall.r + 0.1;
      simBall.vx = Math.abs(simBall.vx);
      bouncedThisStep = true;
      bouncePoints.push({ x: simBall.x, y: simBall.y, isBrick: false });
      bounces++;
    } else if (simBall.x + simBall.r >= canvas.width) {
      simBall.x = canvas.width - simBall.r - 0.1;
      simBall.vx = -Math.abs(simBall.vx);
      bouncedThisStep = true;
      bouncePoints.push({ x: simBall.x, y: simBall.y, isBrick: false });
      bounces++;
    }

    if (simBall.y - simBall.r <= 0) {
      simBall.y = simBall.r + 0.1;
      simBall.vy = Math.abs(simBall.vy);
      bouncedThisStep = true;
      bouncePoints.push({ x: simBall.x, y: simBall.y, isBrick: false });
      bounces++;
    } else if (simBall.y >= canvas.height - 30) {
      break;
    }

    for (let i = state.bricks.length - 1; i >= 0; i--) {
      const brick = state.bricks[i];
      const colRes = checkBrickCollisionAndReflect(simBall, brick);
      if (colRes) {
        const nx = colRes.nx;
        const ny = colRes.ny;
        const dot = simBall.vx * nx + simBall.vy * ny;

        simBall.vx = simBall.vx - 2 * dot * nx;
        simBall.vy = simBall.vy - 2 * dot * ny;
        simBall.x += nx * (simBall.r + 1.2);
        simBall.y += ny * (simBall.r + 1.2);
        simBall.lastHitBrick = brick;

        bouncedThisStep = true;
        bouncePoints.push({ x: simBall.x, y: simBall.y, isBrick: true });
        brickHits++;
        bounces++;
        break;
      }
    }

    if (bouncedThisStep || s % 4 === 0) {
      points.push({ x: simBall.x, y: simBall.y });
    }
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  for (let pt of bouncePoints) {
    ctx.fillStyle = pt.isBrick ? '#ff4757' : '#ffd166';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.isBrick ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ff4757';
  ctx.beginPath();
  ctx.arc(simBall.x, simBall.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function addBeamEffect(orientation, pos, color) {
  if (state.beamEffects.length >= 6) return;
  state.beamEffects.push({
    orientation,
    pos,
    color,
    life: 6,
    maxLife: 6
  });
}

function createFloatingText(x, y, text, color) {
  if (state.floatingTexts.length >= MAX_FLOATING_TEXTS) return;
  state.floatingTexts.push({
    x, y, text, color, life: 30, vy: -1
  });
}

// Fast Lightweight FX Rendering
function drawLightFX() {
  for (let i = state.beamEffects.length - 1; i >= 0; i--) {
    const beam = state.beamEffects[i];
    const progress = beam.life / beam.maxLife;

    ctx.save();
    ctx.strokeStyle = beam.color;
    ctx.lineWidth = 10 * progress;
    ctx.globalAlpha = progress * 0.7;
    ctx.beginPath();
    if (beam.orientation === 'horizontal') {
      ctx.moveTo(0, beam.pos);
      ctx.lineTo(canvas.width, beam.pos);
    } else {
      ctx.moveTo(beam.pos, 0);
      ctx.lineTo(beam.pos, canvas.height);
    }
    ctx.stroke();
    ctx.restore();

    beam.life--;
    if (beam.life <= 0) state.beamEffects.splice(i, 1);
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (p.life <= 0) state.particles.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y += ft.vy;
    ft.life--;

    ctx.save();
    ctx.globalAlpha = ft.life / 30;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();

    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }
}

function updateHUD() {
  document.getElementById('scoreText').innerText = state.score;
  document.getElementById('shellText').innerText = Math.floor(state.seashells);
  document.getElementById('waveText').innerText = state.wave;

  const invContainer = document.getElementById('ballsInventory');
  invContainer.innerHTML = '';

  const counts = {};
  for (let b of state.ownedBalls) {
    counts[b.id] = (counts[b.id] || 0) + 1;
  }

  Object.keys(counts).forEach(id => {
    const typeDef = BALL_TYPES[id];
    const tag = document.createElement('div');
    tag.className = `ball-tag ${typeDef.grade.toLowerCase()}`;
    tag.innerHTML = `<span>${typeDef.icon}</span> <span>x${counts[id]}</span>`;
    tag.title = `${typeDef.name} (${typeDef.grade}): ${typeDef.damage} 데미지`;
    invContainer.appendChild(tag);
  });

  updateSkillUI();
}

function updateSkillUI() {
  const btnSkill = document.getElementById('btnSkill');
  if (btnSkill) {
    if (state.barrierActive) {
      btnSkill.innerText = '🛡️ 방어벽 (X) 활성화됨';
      btnSkill.classList.remove('ready');
      btnSkill.disabled = true;
    } else {
      const pct = Math.floor((state.skillCharge / state.maxSkillCharge) * 100);
      if (state.skillCharge >= state.maxSkillCharge) {
        btnSkill.innerText = '🛡️ 방어벽 (X) READY!';
        btnSkill.classList.add('ready');
        btnSkill.disabled = false;
      } else {
        btnSkill.innerText = `🛡️ 방어벽 (X) (${pct}%)`;
        btnSkill.classList.remove('ready');
        btnSkill.disabled = true;
      }
    }
  }
}

function createBarrierSplash(x, y) {
  if (state.particles.length >= MAX_PARTICLES) return;
  for (let i = 0; i < 3; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const speed = Math.random() * 2 + 1;
    state.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 10,
      maxLife: 10,
      color: '#00d2d3',
      size: Math.random() * 2 + 1.5
    });
  }
}

function drawBarrier() {
  if (!state.barrierActive) return;

  ctx.save();
  const barrierY = state.launchPos.y - 70;
  const barrierWidth = (canvas.width / 4) * 1.3;
  const barrierX1 = state.barrierX - barrierWidth / 2;
  const barrierX2 = state.barrierX + barrierWidth / 2;

  ctx.strokeStyle = 'rgba(0, 210, 211, 0.4)';
  ctx.lineWidth = 8 + Math.sin(Date.now() / 100) * 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(barrierX1, barrierY);
  ctx.lineTo(barrierX2, barrierY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(barrierX1, barrierY);
  ctx.lineTo(barrierX2, barrierY);
  ctx.stroke();

  ctx.restore();
}

window.openModal = function(id) {
  document.getElementById(id).classList.add('active');
};

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};
