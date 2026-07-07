/* =====================================================================
 * 游戏引擎核心：对局状态 / 单位 / 武器 / 战斗 / AI / 缩圈 / Boss / 野怪 / 拾取
 * 不直接操作 DOM —— 一切 UI 通过 bridge 事件与版本号通知 React
 * ===================================================================== */
import { TUNE, VIEW_W, VIEW_H } from './constants.js';
import { rand, randi, pick, clamp, lerp, dist, dist2, shuffle, distToSeg } from './utils.js';
import { WEAPONS, LEGENDS, findRecipe, recipePartner, wdef } from './data/weapons.js';
import { SKILLS } from './data/skills.js';
import { CONSUMABLES } from './data/consumables.js';
import { TECH, PLAYER_ONLY_TECH, TECH_TIERS, DISTILLS, CURSES, ELITES, ELITE_T1, ELITE_T2, DEPT_BOSSES, DEPT_BOSS_IDS, FINAL_BOSS_PHASES, ELITE_AFFIXES } from './data/tech.js';
import { MOBS, subWaves, PUBLIC_INCIDENTS, BR_MOB_POOL } from './data/mobs.js';
import { OBSTACLE_DEFS, PROP_VISUAL, T3_HIDE_RADIUS, T3_HIDE_DUR, T2_BLOCK_CHANCE, DESTROY_FADE_T, REGEN_CD, isDirectFireBullet } from './data/obstacles.js';
import { CHUNK_SIZE, CHUNK_STRIDE, GRID_N, CHUNK_TYPES, generateChunkGrid } from './data/chunks.js';
import { pickTemplate, JITTER } from './data/templates.js';
import { SUBS, MAX_SUB_SLOTS } from './data/subweapons.js';
import { ACTIVES } from './data/actives.js';
import { EVOLUTIONS } from './data/evolutions.js';
import { MILESTONE_TRACKS } from './data/milestones.js';
import { COPY } from './data/copy.js';
import { SPR, workerSprite, SHIRT_COLORS } from './sprites.js';
import { SFX, beep, later, cancelPendingSfx, initAudio } from './audio.js';
import { BGM } from './bgm.js';
import { keys, mouse, touch, handlers } from './input.js';
import * as bridge from './bridge.js';

/* ---------- 对外状态 ---------- */
export let G = null;
let state = 'menu';   // menu | playing | levelup | paused | dead | win
const loadedAt = Date.now();   // 防止页面加载瞬间的意外/合成 keydown 被误判成"按回车开局"
export const getG = () => G;
export const getState = () => state;
function setState(s) {
  const prev = state;
  state = s;
  /* 只在回主菜单时掐延时音符：原来任何非 playing 切换都掐，导致升级/晋升/死亡结算的
   * 琶音永远在响起前被取消（gainXp 同帧就 openLevelup），玩家从没听到过升职音效 */
  if (s === 'menu') cancelPendingSfx();
  BGM.onStateChange(s, prev, G);
  bridge.notify();
}

export const cam = { x: 0, y: 0, shake: 0 };
export function addShake(v) { cam.shake = Math.min(8, cam.shake + v); }

/* ---------- 开火模式（桌面）：手动 / 自动开火 / 全托管 ——触控板玩家友好 ---------- */
export const FIRE_MODES = ['手动', '自动开火', '全托管'];
let fireMode = 0;
try { fireMode = parseInt(localStorage.getItem('niuma_firemode') || '0', 10) || 0; } catch (e) { /* ignore */ }
export const getFireMode = () => fireMode;
export function cycleFireMode() {
  fireMode = (fireMode + 1) % 3;
  try { localStorage.setItem('niuma_firemode', String(fireMode)); } catch (e) { /* ignore */ }
  if (G && G.player.alive) addFloat(G.player.x, G.player.y - 22, `开火模式：${FIRE_MODES[fireMode]}`, '#ffcf33', 9, 1.3);
  bridge.notify();
}

function addFeed(text, hl) { bridge.emit('feed', { text, hl }); }
function warn(text) { bridge.emit('warn', text); }

export function addFloat(x, y, text, color, size = 7, life = .8) {
  if (G) G.floats.push({ x, y, text, color, size, life, t: 0 });
}
export function addParts(x, y, color, n, spd = 60, life = .5) {
  if (!G) return;
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(spd * .3, spd);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: rand(life * .5, life), t: 0, size: rand(1, 2.4) });
  }
}
export function addFx(fx) { if (G) { fx.t = 0; G.fx.push(fx); } }

/* 游戏内延迟任务队列：随 G.t 走、暂停自动冻结、切升级界面不丢。
 * 游戏逻辑的延迟结算一律用它；audio.js 的 later() 是可被取消的真实时间音效计时器，
 * 之前被误用来调度核爆/延迟爆炸，导致升级/暂停会吞掉这些伤害。 */
function delay(fn, sec) { if (G) G.delayed.push({ at: G.t + sec, fn }); }

/* 正赛战斗时间：试用期结束的真实时刻做锚（击杀驱动的试用期时长不定，
 * 旧的 trialOffset 只是开局预算值，用它对表会导致转正瞬间缩圈连跳） */
const combatT = () => G.t - (G.trialEndT ?? G.trialOffset);

/* 预判射击角：按目标速度（updateUnit 每帧记录 _vx/_vy）计算提前量——
 * 全托管自瞄与全部炮台原来都打目标"当前位置"，慢弹对移动怪十打九空 */
function leadAim(sx, sy, t, bspd) {
  if (!bspd || bspd < 60) return Math.atan2(t.y - sy, t.x - sx);
  const tt = Math.min(.9, dist(sx, sy, t.x, t.y) / bspd);
  return Math.atan2(t.y + (t._vy || 0) * tt - sy, t.x + (t._vx || 0) * tt - sx);
}

/* ---------- 单位 ---------- */
function defaultMods() {
  return { spd: 1, dmg: 1, dmgTaken: 1, fireRate: 1, xp: 1, bulletSpd: 1, pierce: 0,
    dodge: 0, killHeal: 0, standRegen: 0, auraDmg: 0, aggro: 1, itemBoost: 1,
    xpPerSec: 0, dropChance: 0, dashCd: 0, lowHpSpd: 0, revive: 0, levelHp: 0, maxHpAdd: 0,
    activeCdMul: 1,
    multishot: 0, crit: 0, homing: 0, range: 1, rag: 0, sysPrompt: 0,
    echoMult: 1, ragBoost: 1,
    /* 人设四·首席降本增效官 */
    workplacePolitics: 0, slowPower: 0, stunPunish: 0, stunSpread: 0, kpiPerLayer: 0,
    fuseBreak: false, blameReflect: false, blameReflectPct: .4, bottomCut: false, assemblyNuke: false,
    /* 人设五·摸鱼表演艺术家 */
    onlineResponse: 0, fakeBusy: 0, dodgeBoost: 0, uptimeCertRate: 0, neverOffline: false,
    fakeDiligence: false, fakeDiligencePct: .35, perpetualSlack: false, perpetualSlackTier: 50,
    /* 人设一·人肉 RLHF 训练员 */
    executeThreshold: 0, lowHpExecuteDmg: 0, executeBlastChance: 0,
    thirdHitExecute: false, terminalCrit: false, executionNuke: false, lastWords: false,
    /* 人设二·万年活人矿·二次入职 */
    heavyHitReduce: 0, lowHpResist: 0, scarBadge: 0, damageToShield: 0,
    secondEntry: false, backwater: false, overworkNuke: false,
    /* 人设三·一人公司 OPC */
    contractorSummon: 0, summonDmg: 0, summonCdMul: 1, damageToSummon: 0,
    workstationCache: false, headhunter: false, contractorMatrix: false, severanceNuke: false,
    /* 觉醒专属标记位 */
    __evoDismissalChain: false, __evoOnlineOffline: false, __evoFakeDiligenceUpgrade: false,
    __evoOutsourceEmpire: false, __evoLayoffWave: false,
    /* v18 通用 proc 框架——技能/装备只往 procs[hook] 里 push 描述性对象，
     * 由 applyDamage/killUnit 统一触发。每个 proc 对象至少要有 { chance, effect } 字段。
     * hook 类型：onHit (打到别人)、onCrit (打出暴击)、onKill (击杀)、onHurt (自己受伤) */
    procs: { onHit: [], onCrit: [], onKill: [], onHurt: [] } };
}

/* "牛马"判定：参与大逃杀名次的普通打工人（试用期 PVP 锁定的保护对象） */
const isWorker = u => u && !u.isBoss && !u.isHR && !u.isElite && !u.isMob;

/* 阵营判定：策反盟友、野怪互不为敌 */
export function isFoe(a, b) {
  if (!a || !b || a === b || !b.alive) return false;
  if (a.allyOwner === b || b.allyOwner === a) return false;
  if (a.allyOwner && a.allyOwner === b.allyOwner) return false;
  if (a.isElite && b.isElite) return false;
  return true;
}

function makeUnit(name, x, y, opts = {}) {
  const shirt = opts.shirt || pick(SHIRT_COLORS);
  return {
    name, x, y, r: 5,
    isPlayer: !!opts.isPlayer, isBoss: !!opts.isBoss, isHR: !!opts.isHR,
    hpBase: opts.hp || TUNE.botHp, hp: opts.hp || TUNE.botHp,
    spdBase: opts.spd || TUNE.playerSpeed * rand(.92, 1.02),
    shirt, spr: opts.isBoss ? SPR.boss : workerSprite(shirt),
    face: 1, walkT: 0, aim: 0,
    weapon: { id: opts.weaponId || 'chatgpt', lvl: 1, leg: null, cd: 0,
      charge: 0, charging: false, pillarT: 3, droneAng: rand(0, 6), droneCds: [0, 0, 0, 0] },
    weapon2: null, weapon2Unlocked: false,   // v2.3 双持：第二主武器槽（升级卡「双持工牌」解锁，玩家专属）
    mods: defaultMods(), skills: {},
    xp: 0, level: 1, kills: 0,
    alive: true, hurtT: 0, standT: 0, stunT: 0, invulnT: 0,
    shield: 0, shieldT: 0, auraT: 0,
    buffs: { spdT: 0, spdM: 1, fireT: 0, fireM: 1, dmgT: 0, dmgM: 1 },
    dashT: 0, dashVx: 0, dashVy: 0, dashDur: 0,
    beamFiring: false, lastAtk: null, isMoving: false, moveT: 0, idleT: 0,
    curses: { hallu: 0, overfit: 0, repeat: 0, overflow: 0 }, repeatAim: 0,
    tech: {}, ragAng: rand(0, 6), ragCds: [0, 0], sysT: 0,
    allyOwner: null, allyUntil: 0, vulnT: 0, vulnBonus: 0,
    /* 人设四·首席降本增效官 运行时状态 */
    politicsT: 0, politicsDmg: 0, politicsOwner: null, fuseBreakCd: 0, bottomCutT: 0, bottomCutMark: 0,
    meetingPoints: 0, assemblyT: 0, kpiLayers: 0, kpiLayerT: 0,
    /* 副武器专属延迟结算（任意单位都可能被命中，字段放在通用 tick 里处理） */
    oaSlowT: 0, oaBurstT: 0, oaBurstDmg: 0, oaBurstOwner: null, badgeMarkT: 0, badgeMarkOwner: null,
    linkedTo: null, linkedT: 0, lastDealT: -999,
    /* 人设五·摸鱼表演艺术家 运行时状态 */
    noHitT: 0, slackMiles: 0, slackBurstT: 0, slackTickT: 0, ignoreDmgT: 0,
    /* 人设三·一人公司 OPC 运行时状态 */
    opcSummonT: 0, opcFocusTarget: null, opcFocusT: 0, workstationStacks: 0,
    opcKillMarks: 0, severancePoints: 0, severanceCd: 0, opcMatrixT: 0,
    distills: null, dstT: null,                         // 大模型蒸馏
    /* v2.0 双主动槽：Q 短 CD / E 长 CD；pl.active 保留为 Q 槽别名以兼容旧代码 */
    subs: {}, active: null, activeCd: 0,                // Q 槽（等价 activeQ）
    activeQ: null, activeE: null, activeQCd: 0, activeECd: 0,
    milestones: {},
    kpi: 0, pot: 0,                                     // v2.0 KPI 抢功 / 锅值 甩锅
    history: [],                                        // 用于版本回滚（3 秒前快照）
    isSummon: false, summonType: null, sumT: 2,         // AI 替身（蒸馏召唤物）
    isMob: false, mobType: null, mobHitT: 0, mobTarget: null, isSplitChild: false,   // 试用期杂鱼
    isElite: false, eliteType: null, eliteTier: 0, touchT: 0, injT: 1,
    empowerT: 0, reportedT: 0,                          // 向上管理光环 / 被打小报告
    slideT: 1, coneWarnT: 0, coneAng: 0, coneCd: 5,     // PPT 大师
    pokeT: 1, auraTickT: 0, reportT: 4,                 // 向上管理 / 小报告
    bot: opts.bot || null, bossAI: null,
  };
}
export const maxHp = u => Math.max(20, u.hpBase + u.mods.maxHpAdd);
export const wpnDmg = u => {
  const def = wdef(u);
  const grow = def.kind === 'drone' ? 1.2 : 1.3;   // v18 Bug 3 修：drone 1.15→1.20，Lv.5 lvlMult 1.749→2.074 补齐欠模
  const lvlMult = u.weapon.leg ? 1 : Math.pow(grow, u.weapon.lvl - 1);
  const empower = u.empowerT > 0 ? 1.25 : 1;        // 向上管理光环
  return def.dmg * lvlMult * u.mods.dmg * empower * (u._offhand ? .55 : 1);   // 双持副手 55% 伤害
};
export const droneCount = (u, def) =>
  def.kind === 'drone' ? Math.min(3, def.drones + Math.floor((u.weapon.lvl - 1) / 2)) : def.drones;
export const wpnName = u => u.weapon.leg ? LEGENDS[u.weapon.leg].name : `${WEAPONS[u.weapon.id].name} Lv.${u.weapon.lvl}`;
export const fireRateOf = u => {
  const f = u.mods.fireRate * (u.buffs.fireT > 0 ? u.buffs.fireM : 1) * (u.curses.overflow > 0 ? .55 : 1);
  return f <= 2 ? f : 2 + Math.sqrt(f - 2) * .6;   // 软上限：射速不再是唯一无限乘区
};
export const speedOf = u => {
  let s = u.spdBase * u.mods.spd * (u.buffs.spdT > 0 ? u.buffs.spdM : 1);
  if (u.mods.lowHpSpd && u.hp < maxHp(u) * .3) s *= 1 + u.mods.lowHpSpd;
  if (u.beamFiring) s *= .5;
  if (u.curses.overfit > 0) s *= .6;
  if (u.empowerT > 0) s *= 1.15;
  if (u.reviewBoostT > 0) s *= 1.15;   // 需求评审会光环
  /* 3秒发言等待区（slowPower）：玩家施加的减速更狠——原字段从未被消费，卡完全无效 */
  const slowPow = !u.isPlayer && G.player ? (G.player.mods.slowPower || 0) : 0;
  if (u.oaSlowT > 0) s *= Math.max(.25, .6 - slowPow);   // OA审批流公文包（基础 40% 减速）
  /* v2.0 §3.5 消防警报事件：全场移速 -20%（单独通道，不叠 oaSlow）*/
  if (G.sprinklerActiveT > 0) s *= .8;
  let slow = 1;
  for (const bz of G.burns) {
    if (bz.slow <= 0 || !isFoe(bz.owner, u) || dist2(u.x, u.y, bz.x, bz.y) >= bz.r * bz.r) continue;
    const amp = bz.owner && bz.owner.isPlayer ? (bz.owner.mods.slowPower || 0) : 0;
    slow = Math.min(slow, 1 - Math.min(.8, bz.slow + amp));
  }
  return s * slow;
};

/* ---------- 对局创建 ---------- */
function newGame(trialMonths = 0) {
  const W = TUNE.world;
  const g = {
    /* 试用期：每月三波固定敌人 + 月度考核 Boss；期间同事互相无敌
     *   subWave     当月子波 1/2/3   0 = 未开始
     *   subWaveDefs 当月三波定义（subWaves(month) 返回）
     *   subWavePool 本波待 spawn 的 mob 类型队列（分批放）
     *   subWaveTarget 本波总数、subWaveKilled 已击杀（钩在 killUnit）
     *   bossReadyT  3 波清完到 Boss 登场的短延迟（给玩家 breather）
     *   monthDone   本月 Boss 已死，等 waveT 走完切下月 */
    trial: { months: trialMonths, active: trialMonths > 0, wave: 0, waveT: .01,
      subWave: 0, subWaveDefs: null, subWavePool: [], subWaveTarget: 0, subWaveKilled: 0, subWaveSpawnT: 0,
      bossThisWave: false, bossReadyT: 0, monthDone: false,
      bossOrder: shuffle(['ppt', 'meeting', 'intern', 'attendance']), cdWarned: false },   // 考核池只含无需同事在场的四位
    trialOffset: Array.from({ length: trialMonths }, (_, i) => TUNE.trialWaveT(i + 1)).reduce((a, b) => a + b, 0),
    /* 割草流清场快：试用期越长，转正后的缩圈时间轴按比例前移 */
    zonePhases: TUNE.zonePhases.map(p => ({ ...p, at: Math.round(p.at * (1 - trialMonths * .06)) })),
    trialXpEarned: 0, rerollCredits: 0, dryDrafts: 0, lastMilestoneRareLevel: 0,
    delayed: [],                                        // 游戏内延迟任务（随 G.t 结算）
    /* v2.3 地面贴花：咖啡渍/散落文件/线缆等氛围装饰（贴图缺失时 render 跳过） */
    decals: Array.from({ length: 46 }, () => ({ x: rand(80, W - 80), y: rand(80, W - 80), i: randi(0, 9), a: rand(0, Math.PI * 2) })),
    trialEndT: trialMonths > 0 ? null : 0,              // 试用期实际结束时刻（击杀驱动后时长不定，缩圈/Boss以此为锚）
    t: 0, endT: 0, units: [], projs: [], pickups: [], floats: [], parts: [], fx: [], burns: [],
    obstacles: [], decor: [],
    rooms: [],   // 带门房间登记表 {x0,y0,x1,y1,dx,dy}：mob 寻路经门进出，见 updateMob
    zone: { cx: W / 2, cy: W / 2, r: TUNE.zoneR0, phase: 0, shrinking: false,
      fromR: 0, toR: 0, fromCx: 0, fromCy: 0, toCx: 0, toCy: 0, shrinkT: 0, dps: 1 },
    kills: 0, playerRank: 0, bossSpawned: false, bossDead: false, boss: null, turrets: [],
    chipT: 15, itemT: 12, techT: 20, eliteT: 35, minibossT: 95, incidentT: 55, incidentSeq: 0, pendingLevels: 0, hoverChip: null,
    /* v2.0 Phase E · 5 种环境事件 CD 计时器 */
    sprinklerT: rand(90, 120), sprinklerActiveT: 0,
    blackoutT: rand(150, 200), blackoutActiveT: 0,
    overtimeT: rand(180, 240), overtimeActiveT: 0,
    deliveryT: rand(60, 90),
    hrPatrolT: rand(200, 260),
    /* v2.0 Phase D §6.3 · 3 隐藏区解锁追踪 */
    destroyCount: 0,                     // 累计破坏物品数
    cleanerTriggered: false,             // 清洁工事件是否已触发
    eventSet: new Set(),                 // 已触发的 5 种环境事件 ID
    safeAutoUnlocked: false,             // 全事件触发后保险柜是否已自动开锁
    chunkVisitedSet: new Set(),          // 玩家走过的 chunk 类型
    hiddenFloorUnlocked: false,          // 隐藏楼层是否已解锁
    pityChipDone: false, pityT: 2, deathInfo: null, newBest: false,
    deathLine: '', winLine: '', freezeT: 0, streak: 0, lastKillT: undefined, heartT: 0,
  };

  /* v2.0 Chunk 系统 · 7×7 网格生成
   *   每 chunk 400×400，按类型 populate 家具与装饰
   *   陆续记录 g.chunkGrid[y][x] 用于缩圈叙事（Phase F）与小地图着色 */
  g.chunkGrid = generateChunkGrid();
  g.chunkClosed = Array.from({ length: GRID_N }, () => Array(GRID_N).fill(false));
  const rects = [];
  const spawnProp = (spr, x, y, arr, chunkX, chunkY) => {
    const def = OBSTACLE_DEFS[spr];
    if (!def) return;
    /* v2.0 §3.4：5% 概率文件柜是"上锁"版 */
    const locked = spr === 'cabinet' && Math.random() < .05;
    /* v2.0 §3.4：50% 概率打印机是"卡纸"版 */
    const jammed = spr === 'printer' && Math.random() < .5;
    /* v2.0 hitbox = 视觉尺寸（PROP_VISUAL），看到什么就挡什么
     * fallback 到 def.w/h（用于 wall/elevator/bulletin_board 等程序化渲染项）*/
    const vis = PROP_VISUAL[spr];
    const hitX = vis ? x + vis.ox : x + 2;
    const hitY = vis ? y + vis.oy : y + 18;
    const hitW = vis ? vis.dw : def.w;
    const hitH = vis ? vis.dh : def.h;
    arr.push({
      x: hitX, y: hitY, w: hitW, h: hitH, sx: x, sy: y, spr,
      hp: def.hp, hpMax: def.hp, cover: def.cover, regenerable: def.regenerable, loot: def.loot,
      destroyed: false, destroyedT: 0, regenT: 0,
      cx: chunkX, cy: chunkY,
      locked, jammed, jamHits: 0,
    });
  };
  /* v2.1 生成算法简化 · 家具岛策略
   *   Layer 1: chunk 布局（generateChunkGrid 满足邻接约束）
   *   Layer 2: pickTemplate 从 3 variants 抽 1 个 + 25% 旋转
   *   Layer 3 已删除 —— 抖动/随机换皮/惊喜物是"杂乱感"根源，模板坐标即最终坐标 */
  for (let cy = 0; cy < GRID_N; cy++) {
    for (let cx = 0; cx < GRID_N; cx++) {
      const type = g.chunkGrid[cy][cx];
      const tpl = pickTemplate(type);
      if (!tpl) continue;
      const chunkX0 = cx * CHUNK_STRIDE, chunkY0 = cy * CHUNK_STRIDE;
      /* Obstacles */
      for (const entry of tpl.obstacles) {
        const x = chunkX0 + entry.dx;
        const y = chunkY0 + entry.dy;
        if (dist2(x, y, W / 2, W / 2) < 160 * 160) continue;
        rects.push({ x, y });
        spawnProp(entry.spr, x, y, g.obstacles, cx, cy);
      }
      /* Decor：模板原样落位 */
      for (const entry of tpl.decor) {
        const x = chunkX0 + entry.dx;
        const y = chunkY0 + entry.dy;
        if (dist2(x, y, W / 2, W / 2) < 130 * 130) continue;
        spawnProp(entry.spr, x, y, g.decor, cx, cy);
      }
      /* Walls (会议室 chokepoint) */
      for (const w of tpl.walls) {
        g.obstacles.push({
          x: chunkX0 + w.x, y: chunkY0 + w.y, w: w.w, h: w.h,
          sx: chunkX0 + w.x, sy: chunkY0 + w.y, spr: 'wall',
          hp: 9999, hpMax: 9999, cover: 'T1', regenerable: false, indestructible: true,
          loot: { chip: 0, tech: 0, heal: 0 },
          destroyed: false, destroyedT: 0, regenT: 0, cx, cy,
        });
      }
      /* 房间登记：算 bbox + 找门缺口中心，mob 靠它寻路进出（4 侧里被拆成 2 段的那侧有门） */
      if (tpl.walls.length >= 4) {
        const xs0 = Math.min(...tpl.walls.map(w2 => w2.x)), ys0 = Math.min(...tpl.walls.map(w2 => w2.y));
        const xs1 = Math.max(...tpl.walls.map(w2 => w2.x + w2.w)), ys1 = Math.max(...tpl.walls.map(w2 => w2.y + w2.h));
        const horiz = tpl.walls.filter(w2 => w2.w > w2.h), vert = tpl.walls.filter(w2 => w2.h >= w2.w);
        let door = null;
        for (const [list, isHoriz] of [
          [horiz.filter(w2 => w2.y === ys0), true],            // top
          [horiz.filter(w2 => w2.y + w2.h === ys1), true],     // bottom
          [vert.filter(w2 => w2.x === xs0), false],            // left
          [vert.filter(w2 => w2.x + w2.w === xs1), false],     // right
        ]) {
          if (list.length === 2) {
            const [a, b] = list.slice().sort((p1, p2) => isHoriz ? p1.x - p2.x : p1.y - p2.y);
            door = isHoriz
              ? { x: (a.x + a.w + b.x) / 2, y: a.y + a.h / 2 }
              : { x: a.x + a.w / 2, y: (a.y + a.h + b.y) / 2 };
            break;
          }
        }
        if (door) g.rooms.push({
          x0: chunkX0 + xs0, y0: chunkY0 + ys0, x1: chunkX0 + xs1, y1: chunkY0 + ys1,
          dx: chunkX0 + door.x, dy: chunkY0 + door.y,
        });
      }
      /* Safe (boss chunk 保险柜) */
      if (tpl.safe) {
        const sx = chunkX0 + tpl.safe.dx, sy = chunkY0 + tpl.safe.dy;
        g.obstacles.push({
          x: sx, y: sy, w: 36, h: 44, sx, sy, spr: 'safe',
          hp: 200, hpMax: 200, cover: 'T1', regenerable: false,
          loot: { chip: 0, tech: 0, heal: 0, special: 'legendary' },
          destroyed: false, destroyedT: 0, regenT: 0, cx, cy,
          isSafe: true,
        });
      }
    }
  }

  /* 玩家 + 机器人牛马 */
  const wIds = Object.keys(WEAPONS);
  const pa = rand(0, Math.PI * 2);
  const player = makeUnit('你（牛马本马）', W / 2 + Math.cos(pa) * 350, W / 2 + Math.sin(pa) * 350,
    { isPlayer: true, hp: TUNE.playerHp, spd: TUNE.playerSpeed, weaponId: pick(wIds), shirt: '#ffcf33' });
  player.subSlotCount = MAX_SUB_SLOTS;   // 里程碑事件解锁到4，见 unlockSubSlot()
  g.units.push(player);
  g.player = player;

  const names = shuffle(COPY.botNames).slice(0, TUNE.botCount);
  /* v2.0 · 7 同事 AI 分型
   *   juan(卷王)         : 高攻击力，主动索敌
   *   norm(普通打工人)   : 中等
   *   moyu(摸鱼大师)     : 见人就跑，只被逼才反击
   *   veteran(老油条)    : 只抢残血目标（>70% hp 时逃避）
   *   crony(关系户)      : 贴 Boss/精英 蹭击杀，命中差
   *   outsource(外包)    : 高攻击欲但命中差
   *   firefighter(救火队长): 优先冲公共事故
   *   uptalk(向上管理)   : 只贴 buffs.dmgM > 1 的强者
   * 池子按 GDD 权重分布：卷王6 普通6 摸鱼3 老油条2 关系户1 外包3 救火1 向上1 = 20 */
  const persPool = shuffle([
    ...Array(6).fill('juan'), ...Array(6).fill('norm'), ...Array(3).fill('moyu'),
    ...Array(2).fill('veteran'), ...Array(1).fill('crony'), ...Array(3).fill('outsource'),
    ...Array(1).fill('firefighter'), ...Array(1).fill('uptalk'),
  ]);
  if (trialMonths > 0) {
    /* 试用期：同事还没到岗（转正日空降入场，届时按月数补发育） */
    g.latentBots = names.map((n, i) => ({ name: n, pers: persPool[i % persPool.length] }));
  } else {
    g.latentBots = null;
    for (let i = 0; i < TUNE.botCount; i++) {
      let bx = W / 2, by = W / 2;
      for (let tries = 0; tries < 30; tries++) {
        const a = rand(0, Math.PI * 2), rr = rand(250, TUNE.zoneR0 * .85);
        bx = W / 2 + Math.cos(a) * rr; by = W / 2 + Math.sin(a) * rr;
        if (g.units.every(u => dist2(u.x, u.y, bx, by) > 260 * 260)) break;
      }
      const pers = persPool[i % persPool.length];
      g.units.push(makeUnit(names[i], bx, by, { weaponId: pick(wIds), bot: {
        pers, state: 'wander', wx: bx, wy: by, target: null, decideT: rand(0, .3),
        aimErr: pers === 'juan' ? .07 : pers === 'norm' ? .13
        : pers === 'veteran' ? .12 : pers === 'crony' ? .28
        : pers === 'outsource' ? .22 : pers === 'firefighter' ? .10
        : pers === 'uptalk' ? .20 : .2,
        chargeHold: 0, provokedT: 0, strafe: 1,
      } }));
    }
  }

  for (let i = 0; i < 26; i++) spawnChip(g, pick(wIds), 1);
  for (let i = 0; i < (TUNE.initialItemCount || 16); i++) spawnItem(g);
  for (let i = 0; i < 6; i++) spawnTech(g, pickTechId());
  return g;
}
function randPosInZone(g, margin = .88) {
  for (let tries = 0; tries < 30; tries++) {
    const a = rand(0, Math.PI * 2), rr = Math.sqrt(Math.random()) * g.zone.r * margin;
    const x = g.zone.cx + Math.cos(a) * rr, y = g.zone.cy + Math.sin(a) * rr;
    if (x > 40 && y > 40 && x < TUNE.world - 40 && y < TUNE.world - 40 &&
        !g.obstacles.some(o => x > o.x - 14 && x < o.x + o.w + 14 && y > o.y - 14 && y < o.y + o.h + 14)) return { x, y };
  }
  return { x: g.zone.cx, y: g.zone.cy };
}
function spawnChip(g, id, lvl, x, y) {
  if (x === undefined) ({ x, y } = randPosInZone(g));
  g.pickups.push({ type: 'chip', id, lvl, x, y, bob: rand(0, 6) });
}
const SURVIVAL_ITEM_IDS = [
  'iced_americano', 'n1_package', 'n2_package', 'teambuild_milktea',
  'workers_comp', 'sick_leave_note', 'noise_cancel_headset',
];
function pickConsumableId(g) {
  if (g && !g.trial.active && Math.random() < .55) return pick(SURVIVAL_ITEM_IDS);
  return pick(Object.keys(CONSUMABLES));
}
function spawnItem(g, id, x, y) {
  if (x === undefined) ({ x, y } = randPosInZone(g));
  g.pickups.push({ type: 'item', id: id || pickConsumableId(g), x, y, bob: rand(0, 6) });
}
function spawnXp(g, x, y, amt) {
  g.pickups.push({ type: 'xp', amt, x: x + rand(-8, 8), y: y + rand(-8, 8), bob: rand(0, 6) });
}
/* 随机选一个模组 id（蒸馏为稀有权重） */
function pickTechId() {
  if (Math.random() < .08) return 'distill';
  return pick(Object.keys(TECH).filter(k => k !== 'distill'));
}
/* 品级掉落：标准 60% / Pro 30% / Ultra 10%；elite=true 时上偏（35/40/25） */
function rollTier(elite) {
  const r = Math.random();
  if (elite) return r < .35 ? 1 : r < .75 ? 2 : 3;
  return r < .6 ? 1 : r < .9 ? 2 : 3;
}
function spawnTech(g, id, x, y, tier) {
  if (x === undefined) ({ x, y } = randPosInZone(g));
  g.pickups.push({ type: 'tech', id, tier: tier || rollTier(false), x, y, bob: rand(0, 6) });
}

/* ---------- v2.0 §6.3 隐藏区解锁 · 3 种触发条件 ---------- */
/* 1) 清洁工事件：累计破坏 30 件 → 随机非 boss/break chunk 变宝藏房 */
function triggerCleanerEvent() {
  if (!G.chunkGrid) return;
  /* 挑一个非 boss/非 corridor 的 chunk（有内容的地方藏宝更合理）*/
  const candidates = [];
  for (let cy = 0; cy < GRID_N; cy++) for (let cx = 0; cx < GRID_N; cx++) {
    const t = G.chunkGrid[cy][cx];
    if (t !== 'boss' && t !== 'corridor') candidates.push({ cx, cy });
  }
  if (!candidates.length) return;
  const spot = pick(candidates);
  const px = spot.cx * CHUNK_STRIDE + CHUNK_SIZE / 2;
  const py = spot.cy * CHUNK_STRIDE + CHUNK_SIZE / 2;
  /* 撒 3-5 高稀有 loot */
  const n = randi(3, 6);
  const wids = Object.keys(WEAPONS);
  for (let i = 0; i < n; i++) {
    const dx = px + rand(-40, 40), dy = py + rand(-40, 40);
    const r = Math.random();
    if (r < .4) spawnChip(G, pick(wids), 2, dx, dy);           // Lv.2 chip
    else if (r < .75) spawnTech(G, pickTechId(), dx, dy, 3);    // Ultra tier tech
    else G.pickups.push({ type: 'heal', amt: 40, x: dx, y: dy, bob: rand(0, 6) });
  }
  addFx({ type: 'boom', x: px, y: py, r: 100, color: '#c9a227', life: .8 });
  addFloat(px, py - 22, '🧹 清洁工整理出宝藏！', '#ffcf33', 12, 3);
  warn(`🧹 清洁工事件：${CHUNK_TYPES[G.chunkGrid[spot.cy][spot.cx]].label} 变宝藏房！`);
  addFeed(`累计破坏 30 件 → 清洁工事件在 ${CHUNK_TYPES[G.chunkGrid[spot.cy][spot.cx]].label} 藏了宝`, true);
  SFX.levelup();
}

/* 2) 全 5 环境事件触发过 → 老板保险柜自动开锁 */
function markEventTriggered(eventId) {
  if (!G.eventSet) G.eventSet = new Set();
  G.eventSet.add(eventId);
  if (G.eventSet.size >= 5 && !G.safeAutoUnlocked) {
    G.safeAutoUnlocked = true;
    const safe = G.obstacles.find(o => o.spr === 'safe' && !o.destroyed);
    if (safe) {
      safe.hp = 0; safe.destroyed = true; safe.destroyedT = DESTROY_FADE_T;
      onObstacleDestroyed(safe);
      warn('🎉 全 5 环境事件亲历 → 老板保险柜自动开锁！');
      addFeed('触发全 5 种环境事件 → 保险柜自动开锁', true);
    }
  }
}

/* 3) 走过 6 chunk 类型 → 下次电梯传送到"隐藏楼层"（世界中心大宝藏堆） */
function checkHiddenFloor() {
  if (!G.chunkVisitedSet) G.chunkVisitedSet = new Set();
  if (G.chunkVisitedSet.size >= 6 && !G.hiddenFloorUnlocked) {
    G.hiddenFloorUnlocked = true;
    warn('🗺️ 走过全 6 种 chunk → 下次电梯将开去隐藏楼层！');
    addFeed('地图全解锁 → 下次电梯 = 隐藏楼层', true);
  }
}

/* ---------- v2.0 掩体破坏：Loot 表 + 特殊效果 ---------- */
function onObstacleDestroyed(o) {
  const cx = o.sx + o.w / 2, cy = o.sy + o.h / 2;
  const loot = o.loot || {};
  /* v2.0 §6.3 累计破坏计数 → 30 件触发清洁工事件（随机 chunk 撒 loot） */
  G.destroyCount = (G.destroyCount || 0) + 1;
  if (G.destroyCount === 30 && !G.cleanerTriggered) {
    G.cleanerTriggered = true;
    triggerCleanerEvent();
  }
  /* 粒子 + SFX */
  addParts(cx, cy, o.cover === 'T1' ? '#8a6a4a' : '#c9c4b4', 18, 90, .6);
  addShake(2);
  SFX.explo();
  /* 芯片掉落：随机武器 id */
  if (loot.chip && Math.random() < loot.chip) {
    const wids = Object.keys(WEAPONS);
    spawnChip(G, pick(wids), 1, cx + rand(-6, 6), cy + rand(-6, 6));
  }
  /* Tech 模组掉落 · design §3.2：文件柜 Pro 品级 +20% */
  if (loot.tech && Math.random() < loot.tech) {
    const eliteTierRoll = o.spr === 'cabinet' && Math.random() < .20;
    spawnTech(G, pickTechId(), cx + rand(-6, 6), cy + rand(-6, 6), rollTier(eliteTierRoll));
  }
  /* 回血拾取（heal 类型，无 shield 走 hp 通道）*/
  if (loot.heal && Math.random() < loot.heal) {
    G.pickups.push({ type: 'heal', amt: 20, x: cx + rand(-6, 6), y: cy + rand(-6, 6), bob: rand(0, 6) });
  }
  /* XP 大丸子（v2.0 align design §3.2 白板/绿植等）*/
  if (loot.xp && Math.random() < loot.xp) {
    spawnXp(G, cx, cy, 12);
  }
  /* 5% 随机技能卡（白板专属）*/
  if (loot.skillCard && Math.random() < loot.skillCard) {
    if (G.player.alive) {
      const skPool = SKILLS.filter(s => !s.persona || s.persona === G.player.persona);
      if (skPool.length) {
        applySkill(G.player, pick(skPool));
        addFloat(cx, cy - 24, '🎁 白板灵光：随机技能升级！', '#c9a227', 9, 1.4);
        SFX.levelup();
      }
    }
  }
  /* 15% 过期 debuff（垃圾桶）*/
  if (loot.debuff && Math.random() < loot.debuff) {
    if (G.player.alive) {
      G.player.oaSlowT = Math.max(G.player.oaSlowT, 3);
      addFloat(cx, cy - 20, '💩 过期外卖：3s 减速', '#8a6a4a', 8, 1.1);
    }
  }
  /* 5% 上锁文件柜（必掉 distill 大礼）*/
  if (o.spr === 'cabinet' && o.locked) {
    if (G.player.alive) {
      /* 之前要求 distills 已非空才发奖，恰好堵死"送你第一个蒸馏"的场景（大多数局白开） */
      G.player.distills = G.player.distills || {};
      G.player.dstT = G.player.dstT || {};
      const dstIds = Object.keys(DISTILLS).filter(k => !G.player.distills[k]);
      if (dstIds.length) {
        G.player.distills[pick(dstIds)] = true;
        addFloat(cx, cy - 20, '🔓 上锁文件柜：解锁蒸馏！', '#b665ff', 10, 1.6);
        addShake(3); SFX.fuse();
      }
    }
  }
  /* 特殊效果 */
  if (loot.special === 'explode') {
    /* 微波炉爆炸：60 半径 30 伤 AoE + 蘑菇云特效 + 蘑菇云 SFX */
    addFx({ type: 'boom', x: cx, y: cy, r: 60, color: '#ff9440', life: .45 });
    /* 蘑菇云：3 层向上飘的橙色云粒子 */
    for (let i = 0; i < 24; i++) {
      const upBias = -Math.random() * 90 - 20;
      const spread = rand(-40, 40);
      G.parts.push({ x: cx + spread * .5, y: cy - 4, vx: spread * 1.5, vy: upBias,
        color: i < 8 ? '#ff9440' : i < 16 ? '#c9a227' : '#e8825a',
        size: 3 + Math.random() * 2, t: 0, life: rand(.8, 1.4) });
    }
    /* 顶部一朵大云 */
    delay(() => {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        G.parts.push({ x: cx + Math.cos(a) * 20, y: cy - 40 + Math.sin(a) * 10,
          vx: Math.cos(a) * 20, vy: -10 + Math.sin(a) * 4,
          color: '#c9a227', size: 4, t: 0, life: 1.2 });
      }
    }, .2);
    for (const u of G.units) {
      if (!u.alive || u.isPlayer) continue;
      if (dist2(cx, cy, u.x, u.y) < 60 * 60) applyDamage(u, 30, G.player, { stun: .2 });
    }
    addShake(5);
    SFX.mushroom();   // 覆盖默认 explo SFX（更震撼）
  } else if (loot.special === 'slow_pool') {
    /* 饮水机爆：60 半径 8s 减速地面 */
    G.burns.push({ x: cx, y: cy, r: 60, dps: 0, slow: .4, life: 8, t: 0, owner: G.player, color: '#38d3e8' });
    addFloat(cx, cy - 12, '水漫办公室', '#38d3e8', 7, 1);
  } else if (loot.special === 'heal_aura') {
    /* 咖啡机爆：回血光环 6s。半径 20 连站进去都难，放宽到 40；治疗结算见燃烧区循环的 dps<0 分支 */
    G.burns.push({ x: cx, y: cy, r: 40, dps: -3, slow: 0, life: 6, t: 0, owner: G.player, color: '#7ee08a' });
    addFloat(cx, cy - 12, '咖啡飘香：+3 hp/s', '#7ee08a', 7, 1);
  } else if (loot.special === 'fire_alarm') {
    /* 消防喷淋爆：全场火警 3s，dps 2（design §3.2 手动触发比常规事件强）*/
    G.sprinklerActiveT = Math.max(G.sprinklerActiveT || 0, 3);
    G.sprinklerBoostedDps = 2;   // 让 tick 循环用 2 dps 而不是常规 1 dps
    warn('🚨 手动触发消防警报！');
    addFloat(cx, cy - 12, '消防警报（2 dps）', '#ff6a6a', 8, 1);
  } else if (loot.special === 'pie_aoe') {
    /* PPT 展板爆：变形大饼 AoE 15 伤 */
    addFx({ type: 'boom', x: cx, y: cy, r: 80, color: '#ffcf33', life: .5 });
    for (const u of G.units) {
      if (!u.alive || u.isPlayer) continue;
      if (dist2(cx, cy, u.x, u.y) < 80 * 80) applyDamage(u, 15, G.player);
    }
    addFloat(cx, cy - 12, '📊 画大饼 AoE', '#ffcf33', 8, 1);
  } else if (loot.special === 'harass_call') {
    /* 座机爆：40% 概率触发骚扰电话，全场敌人 3s -20% 攻速 + 铃声 SFX */
    if (Math.random() < .4) {
      for (const u of G.units) {
        if (!u.alive || u.isPlayer) continue;
        u.buffs.fireT = Math.max(u.buffs.fireT, 3);
        u.buffs.fireM = Math.min(u.buffs.fireM, 0.8);
      }
      SFX.phoneRing();   // 叮铃铃铃真实电话铃声
      addFloat(cx, cy - 12, '☎️ 骚扰电话：全场攻速 -20%', '#c58fff', 8, 1);
    }
  } else if (loot.special === 'legendary') {
    /* 保险柜爆：必掉一张 Lv.3 传说 chip + 惊动老板 */
    const wids = Object.keys(WEAPONS);
    spawnChip(G, pick(wids), 3, cx, cy);
    addFx({ type: 'boom', x: cx, y: cy, r: 80, color: '#ffcf33', life: .8 });
    addFloat(cx, cy - 20, '💰 传说级芯片！', '#ffcf33', 12, 2);
    warn('💰 保险柜被撬开——老板发怒了');
    addFeed('保险柜被撬开：传说 chip + 老板发怒', true);
    addShake(6); SFX.boss();
    /* 老板惊动：如果老板在场，把老板传送到玩家身边 */
    if (G.boss && G.boss.alive) {
      const p = G.player;
      G.boss.x = p.x + rand(-40, 40); G.boss.y = p.y + rand(-40, 40);
    }
  }
}

/* ---------- 开火 ---------- */
export function nearestUnit(x, y, range, filter) {
  let best = null, bd = range * range;
  for (const t of G.units) {
    if (!filter(t)) continue;
    const d = dist2(x, y, t.x, t.y);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}
function nearPlayer(x, y) {
  return G.player.alive && dist2(x, y, G.player.x, G.player.y) < 300 * 300;
}

function spawnBullet(u, a, opt = {}) {
  const def = wdef(u);
  const spd = (opt.spd || def.spd || 300) * u.mods.bulletSpd;
  G.projs.push({
    sprKey: opt.sprKey || (u && u._projKey) || null,   // v2.4 弹道专属贴图键
    x: opt.x !== undefined ? opt.x : u.x, y: opt.y !== undefined ? opt.y : u.y - 4,
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, spd,
    dmg: opt.dmg !== undefined ? opt.dmg : wpnDmg(u),
    r: opt.r || 2, pierce: (opt.pierce !== undefined ? opt.pierce : (def.pierce || 0)) + u.mods.pierce,
    hit: new Set(), owner: u,
    color: opt.color || def.color, shape: opt.shape || 'dot',
    dist: 0, maxDist: opt.exact ? opt.range : (opt.range || def.range || 250) * u.mods.range,
    homing: (opt.homing || 0) + u.mods.homing, boom: opt.boom || null,
    boomerang: opt.boomerang || null, zap: opt.zap || null, zapT: 0,
    stun: opt.stun || 0, fromBoss: !!u.isBoss, curse: opt.curse || null, vuln: opt.vuln || null,
    onHitMark: opt.onHitMark || null,
    absorb: opt.absorb || null,
    _peaSubsidy: opt._peaSubsidy || false,
    _shotgun: opt._shotgun || false,
    coverBypassed: false,
  });
  /* 少样本提示：并排复制弹道（复制弹伤害按品级折损，防终盘乘算失控） */
  if (u.mods.multishot && !opt._echo) {
    const px = Math.cos(a + Math.PI / 2), py = Math.sin(a + Math.PI / 2);
    const echoDmg = (opt.dmg !== undefined ? opt.dmg : wpnDmg(u)) * u.mods.echoMult;
    for (let i = 1; i <= u.mods.multishot; i++) {
      const off = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 7;
      spawnBullet(u, a, { ...opt, _echo: true, dmg: echoDmg,
        /* 爆炸/放电也要按品级折损——引用共享曾让复制弹的 AoE 全额泄漏 */
        boom: opt.boom ? { ...opt.boom, dmg: opt.boom.dmg * u.mods.echoMult,
          burn: opt.boom.burn ? { ...opt.boom.burn, dps: opt.boom.burn.dps * u.mods.echoMult } : null } : null,
        zap: opt.zap ? { ...opt.zap, dmg: opt.zap.dmg * u.mods.echoMult } : null,
        boomerang: opt.boomerang ? { ...opt.boomerang } : null,
        x: (opt.x !== undefined ? opt.x : u.x) + px * off,
        y: (opt.y !== undefined ? opt.y : u.y - 4) + py * off });
    }
  }
}
function fireBeam(u, a, len, width, dmg, color) {
  let x2 = u.x + Math.cos(a) * len * u.mods.range, y2 = u.y + Math.sin(a) * len * u.mods.range;
  /* Fix · 光束被不可破坏墙截断（沿光束方向采样，遇到 wall 就 cut off） */
  const dx = x2 - u.x, dy = y2 - u.y;
  const total = Math.hypot(dx, dy);
  if (total > 0) {
    const step = 4;
    let cutT = 1;
    for (const o of G.obstacles) {
      if (!o.indestructible || o.destroyed) continue;
      const steps = Math.ceil(total / step);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const sx = u.x + dx * t, sy = u.y + dy * t;
        if (sx >= o.x && sx <= o.x + o.w && sy >= o.y && sy <= o.y + o.h) {
          if (t < cutT) cutT = t;
          break;
        }
      }
    }
    if (cutT < 1) { x2 = u.x + dx * cutT; y2 = u.y + dy * cutT; }
  }
  addFx({ type: 'beam', x1: u.x, y1: u.y - 4, x2, y2, w: width, color, life: .18 });
  /* v2.0 §5.1 · charge 激光穿透 T1/T2 掩体但消耗掩体 HP（design 承诺"消耗掩体 HP 而不是直接挡"）*/
  const canBreak = u && (u.isPlayer || u.isBoss);
  if (canBreak && G.obstacles) {
    for (const arr of [G.obstacles, G.decor]) {
      for (const o of arr) {
        if (o.destroyed || o.cover === 'T3' || o.indestructible) continue;
        if (distToSeg(o.x + o.w / 2, o.y + o.h / 2, u.x, u.y, x2, y2) < width / 2 + Math.max(o.w, o.h) / 2) {
          o.hp -= dmg * .35;   // 激光对掩体伤害 = 单位伤害 35%（避免一枪拆全场）
          if (o.hp <= 0 && !o.destroyed) { o.destroyed = true; o.destroyedT = DESTROY_FADE_T; onObstacleDestroyed(o); }
        }
      }
    }
  }
  for (const t of G.units) {
    if (!isFoe(u, t)) continue;
    if (distToSeg(t.x, t.y, u.x, u.y, x2, y2) < width / 2 + t.r) applyDamage(t, dmg, u);
  }
}
function chainZap(u, sx, sy, firstTarget, count, dmg, decay, stun = 0) {
  const hitSet = new Set([u]);
  const pts = [{ x: sx, y: sy }];
  let cur = firstTarget, cx = sx, cy = sy, d = dmg;
  for (let i = 0; i <= count && cur; i++) {
    pts.push({ x: cur.x, y: cur.y });
    applyDamage(cur, d, u, { stun });
    hitSet.add(cur);
    d *= decay;
    cx = cur.x; cy = cur.y;
    cur = nearestUnit(cx, cy, 140, t => !hitSet.has(t) && isFoe(u, t));
  }
  if (pts.length > 1) addFx({ type: 'bolt', pts, color: '#bfe6ff', life: .22 });
}

function updateWeapon(u, dt, wantFire, aimA) {
  const w = u.weapon, def = wdef(u);
  /* v2.4 玩家主武器弹标记专属贴图键（proj_<id>.png），函数尾清空防泄漏到副武器/炮台 */
  if (u.isPlayer) u._projKey = 'proj_' + w.id;
  w.cd -= dt * fireRateOf(u);
  u.aim = aimA;
  u.beamFiring = false;
  if (u.stunT > 0) return;
  const kind = def.kind;

  /* v2.0 十倍交付机（leg_delivery）：主武器蓄能光束 + 每 nodeCd 部署自动化节点，最多 3 座；3 座齐全形成三角流水线燃烧场
   * 复用 G.turrets（kind='delivery_node'）+ G.burns（连线燃烧带） */
  if (kind === 'leg_delivery') {
    /* 主武器：像 charge 一样蓄能，wantFire 期间 charge 上涨；松开或 cd<=0 时释放光束 */
    if (wantFire && w.cd <= 0) {
      w.charging = true;
      w.charge = Math.min(def.chargeT, (w.charge || 0) + dt * fireRateOf(u));
    } else if (w.charging) {
      const p = (w.charge || 0) / def.chargeT;
      const dmg = def.dmg * u.mods.dmg * (0.5 + p * 0.8);
      const bw = def.beamW * (0.5 + p * 0.8);
      fireBeam(u, aimA, def.range * u.mods.range, bw, dmg, def.color);
      if (u.isPlayer || nearPlayer(u.x, u.y)) SFX.laser();
      w.charging = false; w.charge = 0; w.cd = def.cd;
    }
    /* 部署节点：每 nodeCd 秒，如果节点数不足 nodeMax，就在玩家附近落一个 */
    w.nodeT = (w.nodeT || 0) - dt;
    const myNodes = G.turrets.filter(tr => tr.owner === u && tr.kind === 'delivery_node' && tr.life > 0);
    if (w.nodeT <= 0 && myNodes.length < def.nodeMax) {
      w.nodeT = def.nodeCd;
      const a = rand(0, Math.PI * 2), rr = rand(30, 50);
      G.turrets.push({
        x: u.x + Math.cos(a) * rr, y: u.y + Math.sin(a) * rr,
        owner: u, lv: w.lvl, cd: 0, life: def.nodeLife, kind: 'delivery_node',
        nodeDmg: def.nodeDmg * u.mods.dmg, nodeShotCd: def.nodeShotCd, nodeRange: def.nodeRange,
      });
      addFloat(u.x, u.y - 12, '自动化节点上线', '#e8825a', 7, .8);
    }
    /* 3 节点齐全 → 每帧刷 3 条燃烧带；每帧添加短命 burn 让线段"续命" */
    if (myNodes.length >= 3 && def.lineDps) {
      const [n1, n2, n3] = myNodes;
      const pairs = [[n1, n2], [n2, n3], [n3, n1]];
      for (const [a2, b2] of pairs) {
        const mx = (a2.x + b2.x) / 2, my = (a2.y + b2.y) / 2;
        const len = Math.hypot(b2.x - a2.x, b2.y - a2.y) / 2;
        G.burns.push({ x: mx, y: my, r: Math.max(len, 20), dps: def.lineDps * u.mods.dmg, slow: .15, life: .12, t: 0,
          owner: u, color: '#e8825a', deliveryLine: { x1: a2.x, y1: a2.y, x2: b2.x, y2: b2.y } });
      }
    }
    return;
  }

  /* 环绕僚机：常驻自动索敌（仅 Copilot 遗留的 drone 与 tenx 旧版 leg_drone 若未升级）*/
  if (kind === 'drone' || kind === 'leg_drone') {
    const n = droneCount(u, def);
    w.droneAng += dt * 2;
    for (let i = 0; i < n; i++) {
      w.droneCds[i] -= dt * fireRateOf(u);
      const da = w.droneAng + i * Math.PI * 2 / n;
      const dx = u.x + Math.cos(da) * 20, dy = u.y - 6 + Math.sin(da) * 20;
      if (w.droneCds[i] <= 0) {
        const t = nearestUnit(dx, dy, def.range, o => isFoe(u, o));
        if (t) {
          w.droneCds[i] = (kind === 'drone' ? .8 : .85);
          /* 非玩家持有的自瞄炮台加散布，治「零误差自瞄秒杀玩家」 */
          spawnBullet(u, leadAim(dx, dy, t, def.spd) + (u.isPlayer ? 0 : rand(-.12, .12)),
            { x: dx, y: dy, dmg: wpnDmg(u), spd: def.spd, range: def.range * 1.3,
              color: def.color, shape: kind === 'leg_drone' ? 'streak' : 'dot',
              pierce: kind === 'leg_drone' ? 2 : 0 });
          if (u.isPlayer) SFX.shoot();
        }
      }
    }
    if (kind === 'leg_drone' && wantFire && w.cd <= 0) {   // 齐射
      w.cd = def.cd;
      for (let i = 0; i < n; i++) {
        const da = w.droneAng + i * Math.PI * 2 / n;
        spawnBullet(u, aimA + rand(-.05, .05),
          { x: u.x + Math.cos(da) * 20, y: u.y - 6 + Math.sin(da) * 20,
            dmg: def.volleyDmg * u.mods.dmg, spd: 420, range: 260, color: '#ffd9a8', shape: 'streak', pierce: 3, r: 3 });
      }
      if (u.isPlayer) SFX.laser();
    }
    return;   // 僚机类本体不走通用开火
  }

  /* 画饼成真：4 种大饼随机（爆炸 / 纯燃烧 / 护盾 / 弹跳） */
  if (kind === 'leg_pie' && w.burst > 0) {
    w.burstT -= dt;
    if (w.burstT <= 0) {
      w.burstT = .13;
      w.burst--;
      const roll = Math.random();
      const baseOpts = { shape: 'bigpie', r: 5, range: def.range * rand(.7, 1), dmg: 0 };
      const baseDmg = def.dmg * u.mods.dmg;
      if (roll < .33) {
        /* 爆炸饼：原版 boom + burn ring */
        spawnBullet(u, u.aim + rand(-.08, .08), { ...baseOpts,
          boom: { r: def.boomR, dmg: baseDmg, burn: { r: def.burnR, dps: def.burnDps, slow: .35, t: def.burnT } } });
      } else if (roll < .66) {
        /* 纯燃烧饼：无 boom 但更大更持久的燃烧区 */
        spawnBullet(u, u.aim + rand(-.08, .08), { ...baseOpts, color: '#ff6a3d',
          boom: { r: 8, dmg: baseDmg * .3, burn: { r: def.burnR * 1.4, dps: def.burnDps * 1.6, slow: .45, t: def.burnT * 1.5 } } });
      } else if (roll < .83) {
        /* 护盾饼：落地丢一个护盾拾取 */
        spawnBullet(u, u.aim + rand(-.08, .08), { ...baseOpts, color: '#ffe270',
          boom: { r: def.boomR * .6, dmg: baseDmg * .5, dropShield: 25 } });
      } else {
        /* 弹跳饼：pierce 高 + 命中弹跳角度，不 boom */
        spawnBullet(u, u.aim + rand(-.08, .08), { ...baseOpts, color: '#c9a227',
          dmg: baseDmg * .6, pierce: 4, shape: 'bigpie',
          boom: { r: def.boomR * .8, dmg: baseDmg * 1.2, burn: { r: def.burnR * .6, dps: def.burnDps, slow: .25, t: def.burnT * .6 } } });
      }
    }
  }

  /* 价格屠夫补贴衰减：空窗 subsidyDecayT 秒掉 1 层 */
  if (kind === 'leg_pea' && w.subsidy > 0) {
    w._subsidyIdleT = (w._subsidyIdleT || 0) + dt;
    if (w._subsidyIdleT >= (def.subsidyDecayT || 2)) {
      w._subsidyIdleT = 0;
      w.subsidy = Math.max(0, w.subsidy - 1);
    }
  }

  /* AGI 降临：对齐审判柱——目标附近有玩家/持枪者时放大打击 */
  if (kind === 'leg_agi') {
    w.pillarT -= dt;
    if (w.pillarT <= 0) {
      const t = nearestUnit(u.x, u.y, 300, o => isFoe(u, o));
      if (t) {
        w.pillarT = def.pillarCd;
        const near = def.nearBonusR ? dist2(u.x, u.y, t.x, t.y) < def.nearBonusR * def.nearBonusR : false;
        const dmgMult = near ? (def.nearBonusMult || 1.5) : 1;
        const rMult = near ? 1.25 : 1;
        const color = near ? '#ffe270' : '#ffffff';
        addFx({ type: 'pillar', x: t.x, y: t.y, r: def.pillarR * rMult, color, life: .5 });
        explodeAt(t.x, t.y, def.pillarR * rMult, def.pillarDmg * u.mods.dmg * dmgMult, u, color);
        if (near && u.isPlayer) addFloat(t.x, t.y - 24, '对齐加持！', '#ffcf33', 8, 1);
        if (u.isPlayer || nearPlayer(t.x, t.y)) SFX.explo();
      }
    }
  }

  /* Claude 蓄力（吃模组：射速类加快蓄力、注意力加宽光束、少样本扇形多束） */
  if (kind === 'charge') {
    if (wantFire && w.cd <= 0) {
      w.charging = true;
      w.charge = Math.min(def.chargeT, w.charge + dt * fireRateOf(u));
      if (u.isPlayer && Math.random() < dt * 8) addParts(u.x + Math.cos(aimA) * 10, u.y - 4 + Math.sin(aimA) * 10, def.color, 1, 30, .3);
    } else if (w.charging) {
      const p = w.charge / def.chargeT;
      const dmg = lerp(def.dmg, def.dmgMax, p) * Math.pow(1.3, w.lvl - 1) * u.mods.dmg;
      const bw = def.beamW * (0.5 + p * 0.8) * (1 + .25 * (u.tech.attention || 0));
      fireBeam(u, aimA, def.range, bw, dmg, def.color);
      for (let i = 1; i <= u.mods.multishot; i++)
        fireBeam(u, aimA + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * .14, def.range, bw, dmg * u.mods.echoMult, def.color);
      if (u.isPlayer || nearPlayer(u.x, u.y)) SFX.laser();
      w.charging = false; w.charge = 0; w.cd = def.cd;
    }
    return;
  }

  /* ---------- v18 新增：5 种非弹道 kind ---------- */
  /* 贴身持续光环——tick 式伤害，射程模组扩范围（复用 shredder 模式） */
  if (kind === 'aura') {
    w.tickT = (w.tickT || 0) - dt * fireRateOf(u);
    if (w.tickT <= 0) {
      w.tickT = def.tickCd;
      const r = def.range * u.mods.range;
      const dmg2 = wpnDmg(u);
      let hit = false;
      for (const t of G.units) {
        if (!isFoe(u, t) || dist2(u.x, u.y, t.x, t.y) > r * r) continue;
        applyDamage(t, dmg2, u, { quiet: true });
        hit = true;
      }
      if (hit && u.isPlayer && Math.random() < .3) addParts(u.x + rand(-r/2, r/2), u.y + rand(-r/2, r/2), def.color, 1, 20, .3);
    }
    return;
  }
  /* 工位钉子户——定期部署固定炮台，最多 3 座；炮台复用 G.turrets 已有的循环 */
  if (kind === 'totem') {
    w.deployT = (w.deployT || 0) - dt * fireRateOf(u);
    const mine = G.turrets.filter(tr => tr.owner === u && tr.kind === 'totem');
    if (w.deployT <= 0 && mine.length < (def.maxDeploy + (w.lvl >= 3 ? 1 : 0))) {
      w.deployT = def.cd;
      G.turrets.push({ x: u.x, y: u.y, owner: u, lv: w.lvl, cd: 0, life: def.deployLife, kind: 'totem',
        totemDmg: wpnDmg(u), totemShotCd: def.shotCd, totemRange: def.range });
      addFloat(u.x, u.y - 12, '工位', '#c9c4b4', 6, .5);
    }
    return;
  }
  /* 尾迹布雷——只在移动中触发，走 explodeAt + 延迟触发（用 G.burns 存活+触发圈） */
  if (kind === 'mine') {
    if (u.walkT > .05 && u.standT < .1) {   // 正在移动
      w.mineT = (w.mineT || 0) - dt * fireRateOf(u);
      if (w.mineT <= 0) {
        w.mineT = def.cd;
        // 用 G.burns 承载"待引爆的地雷"，触发条件在 G.burns 兼容遍历里补充判定
        G.burns.push({ x: u.x, y: u.y, r: def.triggerR, dps: 0, slow: 0, life: def.fuseT + 6, t: 0,
          owner: u, color: def.color, mineDmg: wpnDmg(u) * 2.5, mineExplR: def.r, mineArmed: false, mineFuseT: def.fuseT });
      }
    }
    return;
  }
  /* 实习生军团——召唤 3 只自动索敌开火的召唤物；复用 isSummon + allyOwner */
  if (kind === 'summon') {
    w.summonT = (w.summonT || 0) - dt;
    const mine = G.units.filter(o => o.isSummon && o.alive && o.allyOwner === u && o.summonType === 'intern');
    if (w.summonT <= 0 && mine.length < def.maxSummons) {
      w.summonT = def.cd;
      const a = rand(0, Math.PI * 2), rr = 30;
      const intern = makeUnit('实习生', u.x + Math.cos(a) * rr, u.y + Math.sin(a) * rr,
        { hp: 40, spd: 110, shirt: '#9aa4b5', weaponId: 'chatgpt' });
      intern.isSummon = true; intern.allyOwner = u; intern.allyUntil = G.t + def.summonLife;
      intern.summonType = 'intern';
      intern.r = 4; intern.level = 0;
      intern.mods.dmg = 0.4 + u.mods.dmg * 0.6;   // v18 补强：主武器加成传承比例 40%→60%，让 satmurbuild 玩家的实习生也硬
      intern.spr = SPR.mob_army || u.spr;
      G.units.push(intern);
      addFloat(u.x, u.y - 12, '实习生上岗', '#ffcf33', 7, .8);
    }
    return;
  }
  /* 燃烧场地——投放持续场地，dps + 减速 */
  if (kind === 'field') {
    if (!wantFire || w.cd > 0) return;
    w.cd = def.cd;
    let tx = u.x + Math.cos(aimA) * def.range * u.mods.range;
    let ty = u.y + Math.sin(aimA) * def.range * u.mods.range;
    if (u.isPlayer) {
      const tp = touch.using ? touch.aimTarget : null;
      if (tp) { tx = tp.x; ty = tp.y; }
      else if (mouse) {
        const dx = mouse.x + cam.x - u.x, dy = mouse.y + cam.y - u.y;
        const dLen = Math.hypot(dx, dy);
        const cap = def.range * u.mods.range;
        if (dLen > 10) {
          const useLen = Math.min(dLen, cap);
          tx = u.x + dx / dLen * useLen;
          ty = u.y + dy / dLen * useLen;
        }
      }
    }
    const r = def.r * u.mods.range;
    /* v18 field 补强：dps 也乘 lvlMult 让 field 也吃武器等级加成，dps 22→32 base + 让燃烧场 DPS 接近 350 而非 47 */
    const lvlMultForField = Math.pow(1.3, w.lvl - 1);
    G.burns.push({ x: tx, y: ty, r, dps: def.dps * u.mods.dmg * lvlMultForField, slow: def.slow, life: def.life, t: 0, owner: u, color: def.color });
    addFx({ type: 'boom', x: tx, y: ty, r, color: def.color, life: .3 });
    if (u.isPlayer) SFX.explo();
    return;
  }

  /* 无限上下文：持续双联横扫光束 */
  /* v2.0 无限上下文：按住收集目标（最多 ctxCap），松开时对全部命中目标造成 summaryDmg
   * 按住期间双联激光每 cd 造成基础伤害 + 把被击中的敌人加进 ctx 列表；松开触发"摘要处决" */
  if (kind === 'leg_beam') {
    if (!w.ctxList) w.ctxList = [];
    if (wantFire) {
      u.beamFiring = true;
      if (w.cd <= 0) {
        w.cd = def.cd;
        const off = Math.PI / 2;
        for (const side of [-1, 1]) {
          const ox = Math.cos(aimA + off) * 5 * side, oy = Math.sin(aimA + off) * 5 * side;
          const x2 = u.x + ox + Math.cos(aimA) * 800, y2 = u.y + oy + Math.sin(aimA) * 800;
          addFx({ type: 'beam', x1: u.x + ox, y1: u.y - 4 + oy, x2, y2, w: 5, color: def.color, life: .1 });
          for (const t of G.units) {
            if (!isFoe(u, t) || !t.alive) continue;
            if (distToSeg(t.x, t.y, u.x + ox, u.y + oy, x2, y2) < 4 + t.r) {
              applyDamage(t, def.dmg * u.mods.dmg, u);
              /* 加入 ctx（去重 + 上限） */
              if (!w.ctxList.includes(t) && w.ctxList.length < (def.ctxCap || 30)) {
                w.ctxList.push(t);
                if (u.isPlayer && w.ctxList.length <= 3) addFloat(t.x, t.y - 18, '写进上下文', '#38d3e8', 7, .6);
              }
            }
          }
        }
        if (u.isPlayer && Math.random() < .3) SFX.laser();
      }
    } else if (w.ctxList.length) {
      /* 松开：摘要处决 */
      const alive = w.ctxList.filter(t => t.alive);
      const bonus = alive.length >= (def.ctxCap || 30) ? 1.5 : 1;
      const summary = (def.summaryDmg || 36) * u.mods.dmg * bonus;
      for (const t of alive) {
        addFx({ type: 'beam', x1: u.x, y1: u.y - 4, x2: t.x, y2: t.y, w: 3, color: '#ffcf33', life: .18 });
        applyDamage(t, summary, u, { stun: .15 });
      }
      if (u.isPlayer && alive.length) {
        addFloat(u.x, u.y - 22, `摘要处决 ×${alive.length}`, '#38d3e8', 9, 1.2);
        SFX.laser(); addShake(3);
      }
      w.ctxList = [];
    }
    return;
  }

  if (!wantFire || w.cd > 0) return;
  w.cd = def.cd;
  const dmg = wpnDmg(u);

  switch (kind) {
    case 'mg':
      spawnBullet(u, aimA + rand(-def.spread, def.spread), { shape: 'diamond' });
      break;
    case 'sniper':
      spawnBullet(u, aimA, { shape: 'streak', r: 2.5 });
      if (u.isPlayer || nearPlayer(u.x, u.y)) SFX.laser();
      break;
    case 'shotgun': {
      const n = def.count + (w.lvl >= 3 ? 1 : 0) + (w.lvl >= 5 ? 1 : 0);
      /* v2.0：shotgun 散弹标签 → 掩体命中时 40% 概率钻缝穿透（design §5.1）*/
      for (let i = 0; i < n; i++) spawnBullet(u, aimA + (i / (n - 1) - .5) * def.spread, { shape: 'dot', _shotgun: true });
      break;
    }
    case 'lob': {
      /* 射程模组扩大可及距离，但落点必须精确=瞄准点（曾经会"扔过头"） */
      const cap = def.range * u.mods.range;
      let range = cap;
      if (u.isPlayer) {
        /* 全托管也用自瞄目标的距离定落点——原来桌面全托管落点跟着鼠标位置走，等于随机 */
        const tp = (touch.using || fireMode === 2) ? touch.aimTarget : null;
        range = tp ? clamp(dist(u.x, u.y, tp.x, tp.y), 50, cap)
                   : clamp(dist(u.x, u.y, mouse.x + cam.x, mouse.y + cam.y), 50, cap);
      }
      else if (u.bot && u.bot.target) range = clamp(dist(u.x, u.y, u.bot.target.x, u.bot.target.y), 50, cap);
      spawnBullet(u, aimA, { shape: 'pie', r: 4, range, exact: true, boom: { r: def.boomR, dmg }, dmg: 0 });
      break;
    }
    case 'homing':
      spawnBullet(u, aimA, { shape: 'pea', homing: def.homing, r: 2.5 });
      break;
    case 'chain': {
      /* 吃模组：注意力扩索敌半径、越级汇报/思维链多跳、少样本多一条起始分叉 */
      const rng = def.range * u.mods.range * (1 + .12 * (u.tech.attention || 0));
      const chains = def.chains + u.mods.pierce;
      const t = nearestUnit(u.x, u.y, rng, o => isFoe(u, o));
      if (t) {
        chainZap(u, u.x, u.y - 4, t, chains, dmg, def.decay);
        for (let i = 0; i < u.mods.multishot; i++) {
          const t2 = nearestUnit(u.x, u.y, rng, o => isFoe(u, o) && o !== t);
          if (t2) chainZap(u, u.x, u.y - 4, t2, chains, dmg * u.mods.echoMult, def.decay);
        }
        if (u.isPlayer || nearPlayer(u.x, u.y)) SFX.hit();
      } else w.cd = .15;
      break;
    }
    case 'single':
      spawnBullet(u, aimA, { shape: 'orb', r: 2.5 });
      break;
    case 'twin': {
      const off = aimA + Math.PI / 2;
      for (const side of [-1, 1])
        spawnBullet(u, aimA, { x: u.x + Math.cos(off) * 5 * side, y: u.y - 4 + Math.sin(off) * 5 * side, shape: 'star' });
      break;
    }
    case 'gacha': {
      const roll = rand(.5, 3), mode = randi(0, 3);
      const col = pick(['#ff6a8a', '#ffcf33', '#4ec9a0', '#6aa3ff', '#e86ad0']);
      if (mode === 0) spawnBullet(u, aimA, { dmg: dmg * roll * 1.6, r: 3.5, shape: 'orb', color: col });
      else if (mode === 1) for (let i = -1; i <= 1; i++) spawnBullet(u, aimA + i * .22, { dmg: dmg * roll * .6, shape: 'dot', color: col });
      else if (mode === 2) spawnBullet(u, aimA, { dmg: dmg * roll * 1.2, pierce: 3, shape: 'streak', color: col });
      else spawnBullet(u, aimA, { dmg: 0, boom: { r: 30, dmg: dmg * roll * 1.4 }, shape: 'pie', r: 3, color: col });
      break;
    }
    case 'boomerang':
      spawnBullet(u, aimA, { shape: 'boomerang', r: 3.5, range: def.range, boomerang: { phase: 0 }, pierce: 99 });
      break;
    case 'leg_agi':
      spawnBullet(u, aimA + rand(-.15, .15), { shape: 'orb', homing: def.homing, r: 2 });
      break;
    case 'leg_pea': {
      /* 价格屠夫补贴：每次命中攒 1 层（最多 maxSubsidy），空窗 subsidyDecayT 秒掉 1 层
       * 层数直接提升本次开火弹伤 (1 + stacks*subsidyStep) */
      const stacks = u.weapon.subsidy || 0;
      const boost = 1 + stacks * (def.subsidyStep || .035);
      const overrideDmg = wpnDmg(u) * boost;
      for (let i = 0; i < def.count; i++)
        spawnBullet(u, aimA + (i / (def.count - 1) - .5) * def.spread,
          { shape: 'pea', homing: def.homing, r: 2, dmg: overrideDmg, _peaSubsidy: true });
      break;
    }
    case 'leg_pie':
      w.burst = 3; w.burstT = 0;
      break;
    case 'leg_boom':
      spawnBullet(u, aimA, { shape: 'bigboom', r: 5, range: def.range, boomerang: { phase: 0 }, pierce: 99,
        zap: { cd: def.zapCd, dmg: def.zapDmg * u.mods.dmg, chains: def.chains }, stun: .2,
        absorb: def.absorbR ? { r: def.absorbR, dmg: def.absorbDmg, count: 0 } : null });
      break;
  }
  if (u.isPlayer && !['sniper', 'chain'].includes(kind)) {
    SFX.shoot();
    /* 枪口火焰帧动画（素材缺失时 render 静默跳过） */
    addFx({ type: 'muzzle', x: u.x + Math.cos(aimA) * 9, y: u.y - 4 + Math.sin(aimA) * 9, ang: aimA, r: 10, life: .14 });
  }
  if (u.isPlayer) u._projKey = null;
}

/* ---------- v18: 通用 proc 触发器 ----------
 * proc 描述对象格式：{ chance: 0-1, effect: string, ...params }
 * effect 类型：
 *  - 'burn'       : ctx=target，命中时给目标叠一层燃烧 dot（火附魔）
 *  - 'chill'      : ctx=target，命中时减速目标 40% 持续 params.dur
 *  - 'shock'      : ctx=target，命中时对目标+周围3只额外发一次链电（雷附魔）
 *  - 'poison'     : ctx=target，命中时叠 dot（毒附魔）
 *  - 'heal'       : 攻击者回血 params.amount（吸血）
 *  - 'shield'     : 攻击者获得 params.amount 护盾（每击杀）
 *  - 'blastKill'  : 击杀时以目标位置为中心的 AOE 爆炸（每击杀）
 *  - 'thornsHurt' : 受伤时反弹 params.pct 伤害给攻击者（复仇圆环）
 */
function fireProcs(source, hook, ctx) {
  const list = source.mods.procs && source.mods.procs[hook];
  if (!list || !list.length) return;
  /* v18 Bug 6 修：onHit 元素附魔类每次命中最多触发 1 个（4 张满级同装原 99.1% 触发→现按各卡权重挑一个，且非元素类照常独立结算）*/
  const elementalEffects = { burn: 1, chill: 1, poison: 1, heal: 1 };
  let elementalFired = false;
  for (const p of list) {
    if (hook === 'onHit' && elementalEffects[p.effect]) {
      if (elementalFired) continue;   // 本次命中已触发过一个元素附魔
      if (Math.random() > (p.chance || 1)) continue;
      elementalFired = true;
    } else {
      if (Math.random() > (p.chance || 1)) continue;
    }
    const t = ctx.target || ctx.victim;
    switch (p.effect) {
      case 'burn':
        if (t && t.alive) G.burns.push({ x: t.x, y: t.y, r: 24, dps: p.dps || 4, slow: 0,
          life: p.dur || 2, t: 0, owner: source, color: '#ff8f5a' });
        break;
      case 'chill':
        if (t) { t.oaSlowT = Math.max(t.oaSlowT || 0, p.dur || 1.5); }
        break;
      case 'shock':
        if (t && t.alive) {
          const dmg = (p.dmg || 5) * source.mods.dmg;
          chainZapNoRecurse(source, t.x, t.y, t, p.chains || 3, dmg, .8);
        }
        break;
      case 'poison':
        if (t) {
          t.poisonDps = (t.poisonDps || 0) + (p.dps || 2);
          t.poisonT = Math.max(t.poisonT || 0, p.dur || 3);
          t.poisonOwner = source;
        }
        break;
      case 'heal':
        if (source.alive) source.hp = Math.min(maxHp(source), source.hp + (p.amount || 2));
        break;
      case 'shield':
        source.shield = Math.min((source.shield || 0) + (p.amount || 5), maxHp(source));
        source.shieldT = 12;
        break;
      case 'blastKill':
        if (ctx.victim) explodeAtNoRecurse(ctx.victim.x, ctx.victim.y, p.r || 60, (p.dmg || 15) * source.mods.dmg, source, '#ff9440');
        break;
      case 'thornsHurt':
        if (ctx.attacker && ctx.attacker.alive && ctx.attacker !== source) {
          applyDamage(ctx.attacker, (ctx.dmg || 5) * (p.pct || .3), source, { quiet: true, fromProc: true });
        }
        break;
    }
  }
}

/* v18 proc 专用：无递归版本，防止 proc 触发的伤害再触发 proc 无限循环 */
function explodeAtNoRecurse(x, y, r, dmg, owner, color) {
  addFx({ type: 'boom', x, y, r, color: color || '#ff9440', life: .35 });
  addParts(x, y, color || '#ff9440', 14, 90, .5);
  addShake(3);
  for (const t of G.units) {
    if (!isFoe(owner, t)) continue;
    if (dist2(x, y, t.x, t.y) < (r + t.r) * (r + t.r)) applyDamage(t, dmg, owner, { fromProc: true });
  }
  if (nearPlayer(x, y)) SFX.explo();
}
function chainZapNoRecurse(source, sx, sy, firstTarget, count, dmg, decay) {
  const hit = new Set([firstTarget]);
  let curr = firstTarget, cx = sx, cy = sy;
  for (let i = 0; i < count && curr; i++) {
    addFx({ type: 'bolt', pts: [{ x: cx, y: cy }, { x: curr.x, y: curr.y - 4 }], color: '#7ec4ff', life: .12 });
    applyDamage(curr, dmg, source, { quiet: true, fromProc: true });
    dmg *= decay;
    cx = curr.x; cy = curr.y;
    curr = nearestUnit(curr.x, curr.y, 180, o => isFoe(source, o) && !hit.has(o));
    if (curr) hit.add(curr);
  }
}

/* ---------- 爆炸 / 燃烧区 ---------- */
function explodeAt(x, y, r, dmg, owner, color, burn) {
  addFx({ type: 'boom', x, y, r, color: color || '#ff9440', life: .35 });
  addParts(x, y, color || '#ff9440', 14, 90, .5);
  addShake(3);
  for (const t of G.units) {
    if (!isFoe(owner, t)) continue;
    if (dist2(x, y, t.x, t.y) < (r + t.r) * (r + t.r)) applyDamage(t, dmg, owner);
  }
  if (burn) G.burns.push({ x, y, r: burn.r, dps: burn.dps, slow: burn.slow, life: burn.t, t: 0, owner, color: '#e86ad0' });
  if (nearPlayer(x, y)) SFX.explo();
}

function canExecuteTarget(t) {
  return t && t.alive && !t.isBoss && t.eliteTier !== 2 && !t.isHR;
}
function tryExecuteTarget(attacker, target, threshold, label = '处决标注') {
  if (!attacker || !attacker.isPlayer || !canExecuteTarget(target) || target.hp <= 0) return false;
  const mh = maxHp(target);
  if (mh <= 0 || target.hp / mh > threshold) return false;
  addFloat(target.x, target.y - 22, label, '#ff9440', 9, 1);
  addParts(target.x, target.y, '#ff9440', 16, 100, .55);
  addFx({ type: 'executefx', x: target.x, y: target.y - 4, r: 16, life: .4 });   // 处决红 X
  killUnit(target, attacker, 'execute', { executed: true });
  return true;
}

const OPC_SUMMON_CAP = 10;
function isOpcSummon(u, owner) {
  return !!(u && u.alive && u.isSummon && u.opcSummon && (!owner || u.allyOwner === owner));
}
function opcSummons(owner) {
  return G.units.filter(u => isOpcSummon(u, owner));
}
function trimOpcSummons(owner) {
  const mine = opcSummons(owner).sort((a, b) => (a.opcSpawnT || 0) - (b.opcSpawnT || 0));
  const cap = OPC_SUMMON_CAP + (owner.mods.__evoOutsourceEmpire ? 2 : 0);
  while (mine.length > cap) {
    const old = mine.shift();
    old.alive = false;
    addParts(old.x, old.y, '#9aa4b5', 8, 70, .4);
  }
}
function recordOpcRetirement(owner, summon, forced = false) {
  if (!owner || !owner.alive || !summon || !summon.opcSummon) return;
  if (owner.mods.workstationCache && !forced) owner.workstationStacks = Math.min(5, (owner.workstationStacks || 0) + 1);
  if (owner.mods.severanceNuke) {
    const senior = summon.opcSenior ? 2 : 1;
    owner.severancePoints = Math.min(30, (owner.severancePoints || 0) + senior);
    if (owner.isPlayer && (owner.severancePoints % 5 === 0 || owner.severancePoints >= 15))
      addFloat(owner.x, owner.y - 26, `遣散费 ${owner.severancePoints}/15`, '#ffcf33', 8, .9);
  }
}
function spawnOpcSummon(owner, type = 'contractor', opts = {}) {
  if (!owner || !owner.alive || !G) return null;
  const a = opts.ang ?? rand(0, Math.PI * 2), rr = opts.dist ?? rand(26, 44);
  const senior = !!opts.senior;
  const cache = Math.min(3, owner.workstationStacks || 0);
  if (cache > 0) owner.workstationStacks--;
  const typeCfg = {
    contractor: { name: '外包幻影', hp: 26, spd: 128, dmg: .34, life: 12, color: '#9ad1ff', cd: .72 },
    clone: { name: '数字分身', hp: 34, spd: 138, dmg: opts.dmg ?? .45, life: opts.life ?? 10, color: '#d9b3ff', cd: .62 },
    wall: { name: '应届生炮灰墙', hp: 58, spd: 96, dmg: .26, life: 9, color: '#c9c4b4', cd: .9 },
  }[type] || {};
  const hpMul = 1 + cache * .25 + (senior ? .65 : 0);
  const dmgMul = 1 + (owner.mods.summonDmg || 0) + cache * .2 + (senior ? .5 : 0);
  const s = makeUnit(typeCfg.name || '外包幻影', owner.x + Math.cos(a) * rr, owner.y + Math.sin(a) * rr,
    { hp: Math.round((typeCfg.hp || 26) * hpMul), spd: typeCfg.spd || 125, shirt: typeCfg.color || '#9ad1ff', weaponId: owner.weapon.id });
  s.isSummon = true; s.opcSummon = true; s.summonType = `opc_${type}`;
  s.sprKey = `mob_opc_${type}`;   // v2.4 召唤物专属立绘（走 MOB_ANIM 通道）
  s.allyOwner = owner; s.allyUntil = G.t + (opts.life || typeCfg.life || 10);
  s.r = type === 'wall' ? 6 : 4; s.level = 1; s.sumT = rand(.1, .45);
  s.opcSpawnT = G.t; s.opcDmgMul = (typeCfg.dmg || .35) * dmgMul;
  s.opcShotCd = typeCfg.cd || .7; s.opcSenior = senior;
  s.weapon.id = owner.weapon.id; s.weapon.lvl = Math.max(1, owner.weapon.lvl - (type === 'clone' ? 0 : 1)); s.weapon.leg = null;
  s.mods.dmg = Math.max(.25, owner.mods.dmg * s.opcDmgMul);
  s.mods.fireRate = Math.min(1.8, owner.mods.fireRate * (type === 'clone' ? .9 : .7));
  G.units.push(s);
  addFx({ type: 'summonfx', x: s.x, y: s.y, r: 13, life: .4 });   // 上岗蓝圈
  trimOpcSummons(owner);
  if (owner.isPlayer && Math.random() < .55) addFloat(owner.x, owner.y - 16, senior ? '资深外包上岗' : '外包上线', '#9ad1ff', 7, .7);
  return s;
}
function triggerSeveranceNuke(owner, x = owner.x, y = owner.y, waves = 1) {
  if (!owner || !owner.alive) return;
  owner.severanceCd = 30;
  owner.severancePoints = 0;
  const base = Math.min(240, 70 + wpnDmg(owner) * 2.2);
  for (let i = 0; i < waves; i++) {
    /* 用游戏内延迟队列：原来走 later()（音效计时器），升级/暂停同帧会把后续波次全部取消，
     * 遣散费扣了核爆却不响 */
    delay(() => {
      if (!owner.alive) return;
      explodeAtNoRecurse(x + rand(-18, 18), y + rand(-18, 18), 160, base * (owner.mods.__evoLayoffWave ? 1.08 : 1), owner, '#9ad1ff');
    }, i * .16);
  }
  for (let i = 0; i < Math.min(3, 1 + waves); i++) spawnOpcSummon(owner, 'contractor', { life: 10 + i });
  addFx({ type: 'nukefx', x, y, r: 60, life: 1 });
  addFloat(owner.x, owner.y - 30, owner.mods.__evoLayoffWave ? '离职潮协议！' : '退休金核爆！', '#9ad1ff', 10, 1.3);
  addShake(5); SFX.boss();
}

/* ---------- 伤害 / 诅咒 / 击杀 ---------- */
export function applyDamage(target, raw, attacker, opts = {}) {
  if (!target.alive || !G) return;
  /* 欠薪结算（我不下班了）不可被无敌/闪避赖掉——否则掐个病假条时机就能白嫖整段爆发 */
  const inevitable = opts.cause === 'zone' || opts.cause === 'wage_debt';
  if (target.invulnT > 0 && !inevitable) return;   // 画饼护盾挡不住裁员红线
  /* 试用期：同事之间互相无敌（PVE 照常） */
  if (G.trial.active && attacker && isWorker(attacker) && isWorker(target)) return;
  /* 精英词条：卡权限（固定诅咒）/ Bug（随机诅咒）——之前是全工程无消费的空壳标记 */
  if (attacker && (attacker._permaCurse || attacker._buggyProc) && target.isPlayer && !inevitable) {
    if (attacker._permaCurse && Math.random() < .25) applyCurse(target, attacker._permaCurse, 3);
    if (attacker._buggyProc && Math.random() < attacker._buggyProc) applyCurse(target, pick(['repeat', 'overflow', 'overfit']), 2.5);
  }
  const dodgeChance = (target.mods.dodge || 0) + (target.isPlayer && target.opcMatrixT > 0 ? .12 : 0);
  if (dodgeChance > 0 && !inevitable && Math.random() < Math.min(.9, dodgeChance)) {
    addFloat(target.x, target.y - 14, '甩锅！', '#9aa4b5', 6, .5);
    /* 已读不回学：闪避成功后短暂提速 */
    if (target.isPlayer && target.mods.dodgeBoost) {
      target.buffs.spdT = Math.max(target.buffs.spdT, 1);
      target.buffs.spdM = Math.max(target.buffs.spdM, 1 + target.mods.dodgeBoost);
    }
    return;
  }
  let dmg = raw * target.mods.dmgTaken;
  if (target.vulnT > 0) dmg *= (1.2 + (target.vulnBonus || 0));   // 团建易伤 + 回收站冷静期加成
  /* 牛马内战伤害衰减：机器人互卷是内耗（决赛圈内卷升级，避免僵局） */
  if (attacker && attacker.bot && !attacker.isHR && attacker.allyOwner !== G.player &&
      target.bot && !target.isHR) dmg *= G.zone.phase >= 4 ? .55 : .28;
  /* 持传说的机器人对玩家降额，治「进圈即被 0.6 秒开盒」的随机暴毙 */
  if (attacker && attacker.bot && !attacker.isHR && attacker.weapon.leg && target.isPlayer) dmg *= .65;
  let crit = false;
  if (attacker && attacker.mods && attacker.mods.crit && Math.random() < attacker.mods.crit) {
    dmg *= 2; crit = true;
  }
  if (attacker && attacker.mods && attacker.mods.lowHpExecuteDmg && target.hp / maxHp(target) < .45) {
    dmg *= 1 + attacker.mods.lowHpExecuteDmg * (1 - attacker.hp / maxHp(attacker));
  }
  if (attacker && attacker.mods && attacker.mods.terminalCrit && !opts.fromProc && opts.cause !== 'zone') {
    if (Math.random() < .2) { dmg *= 3; crit = true; }
    else dmg *= .82;
  }
  if (attacker && attacker.buffs && attacker.buffs.dmgT > 0) dmg *= attacker.buffs.dmgM;   // 季度考核倒计时 KPI压力等临时增伤
  if (target.isPlayer && target.mods.damageToSummon && opts.cause !== 'zone' && opts.cause !== 'wage_debt' && !opts.fromProc) {
    const mine = opcSummons(target).filter(s => s.hp > maxHp(s) * .15);
    const transferChance = target.mods.damageToSummon >= 1 ? 1 : Math.min(.7, target.mods.damageToSummon);
    if (mine.length && Math.random() < transferChance) {
      const patsy = pick(mine);
      applyDamage(patsy, dmg * .85, attacker, { quiet: true, fromProc: true });
      addFloat(target.x, target.y - 18, '分身背锅', '#9ad1ff', 7, .7);
      return;
    }
  }
  if (target.isPlayer && target.mods.heavyHitReduce && dmg > target.hp * .15)
    dmg *= 1 - Math.min(.5, target.mods.heavyHitReduce);
  if (target.isPlayer && target.mods.lowHpResist && target.hp < maxHp(target) * .5) {
    const mult = target.hp < maxHp(target) * .25 ? 2 : 1;
    dmg *= 1 - Math.min(.55, target.mods.lowHpResist * mult);
  }
  /* 办公室政治：小概率给目标挂"内耗标记"，1.5秒后对最近另一敌人溅射本次伤害30% */
  if (attacker && attacker.mods.workplacePolitics && Math.random() < attacker.mods.workplacePolitics) {
    target.politicsT = 1.5; target.politicsDmg = dmg * .3; target.politicsOwner = attacker;
  }
  /* 线上响应术：移动中受到的伤害减免 */
  if (target.isPlayer && target.mods.onlineResponse && target.moveT > 2) dmg *= (1 - Math.min(.6, target.mods.onlineResponse));
  if (target.shield > 0) {
    const ab = Math.min(target.shield, dmg);
    target.shield -= ab; dmg -= ab;
    addFloat(target.x, target.y - 14, `盾-${Math.round(ab)}`, '#6aa3ff', 6, .5);
    if (target.shield <= 0 && target.isPlayer) addFx({ type: 'shieldbreak', x: target.x, y: target.y - 6, r: 15, life: .4 });   // 破盾碎裂
  }
  if (target.isPlayer && target.noClockoutT > 0 && opts.cause !== 'zone' && opts.cause !== 'wage_debt') {
    const defer = dmg * .45;
    dmg -= defer;
    target.wageDebt = (target.wageDebt || 0) + defer;
    if (defer > 1) addFloat(target.x, target.y - 28, `欠薪 +${Math.round(defer)}`, '#ffcf33', 6, .5);
  }
  /* 重复造轮子任务：dmgTaken=.2 期间减伤80%持续生效，累计命中的折后伤害耗尽独立护盾计数后破防硬直 */
  if (target.mobShieldHp > 0 && !target.mobShieldBroken) {
    target.mobShieldHp -= dmg;
    if (target.mobShieldHp <= 0) {
      target.mobShieldBroken = true;
      target.mods.dmgTaken = 1;
      target.stunT = Math.max(target.stunT, 1.2);
      if (nearPlayer(target.x, target.y)) addFloat(target.x, target.y - 14, '破防了！', '#ff9440', 7, .6);
    }
  }
  if (dmg <= 0) return;
  /* 甩锅式反伤：受到的伤害一定概率完全转移给附近受控敌人（觉醒后概率更高，见下方常量） */
  if ((target.isPlayer || target.isElite) && target.mods.blameReflect && opts.cause !== 'zone' && !(attacker && attacker.isBoss) && !opts.fromProc) {
    if (Math.random() < target.mods.blameReflectPct) {
      const patsy = nearestUnit(target.x, target.y, 90, t => isFoe(target, t) && t.stunT > 0);
      if (patsy) {
        applyDamage(patsy, dmg * 1.5, attacker, { quiet: false });
        addFloat(target.x, target.y - 14, '甩锅成功！', '#c58fff', 7, .7);
        return;
      }
    }
  }
  /* 熔断机制：单次重击（>15%当前生命）触发全屏眩晕+短暂免疫，20秒冷却 */
  if (target.isPlayer && target.mods.fuseBreak && target.fuseBreakCd <= 0 && dmg > target.hp * .15) {
    target.fuseBreakCd = 20;
    target.invulnT = Math.max(target.invulnT, .6);
    for (const t of G.units) if (isFoe(target, t) && dist2(target.x, target.y, t.x, t.y) < 260 * 260) t.stunT = Math.max(t.stunT, 1.2);
    addFloat(target.x, target.y - 20, '熔断保护！', '#9ad1ff', 9, 1);
    SFX.deny(); addShake(4);
  }
  if (target.isPlayer) { target.noHitT = 0; target.fdIdleT = 0; }   // 在线时长认证 / 假勤奋真怠工 各自计时清零
  if (attacker && attacker.isPlayer) attacker.lastDealT = G.t;   // 摸鱼申诉信：判定是否真的没输出
  if (target.isPlayer && target.mods.lastWords && !target.lastWordsUsed && opts.cause !== 'zone' &&
      target.hp - dmg <= maxHp(target) * .15) {
    target.lastWordsUsed = true;
    const dur = target.mods.__evoLastFeedback ? 8 : 6;
    target.invulnT = Math.max(target.invulnT, dur);
    target.buffs.fireT = Math.max(target.buffs.fireT, dur); target.buffs.fireM = Math.max(target.buffs.fireM, target.mods.__evoLastFeedback ? 2.05 : 1.8);
    target.buffs.dmgT = Math.max(target.buffs.dmgT, dur); target.buffs.dmgM = Math.max(target.buffs.dmgM, target.mods.__evoLastFeedback ? 1.75 : 1.5);
    dmg = Math.min(dmg, Math.max(0, target.hp - 1));
    if (target.mods.__evoLastFeedback) target.hp = Math.min(maxHp(target), target.hp + maxHp(target) * .25);
    addFloat(target.x, target.y - 24, '临终遗言：最后一轮标注', '#ff9440', 10, 1.5);
    SFX.fuse(); addShake(5);
  }
  /* 被优化了但我假装没看见（觉醒）：35%概率无视本次伤害，但仍完整走完结算流程（curse/vulnT等副作用不受影响），
     对Boss/小Boss的固定演出类攻击不生效 */
  if (target.isPlayer && target.ignoreDmgT > 0 && !(attacker && (attacker.isBoss || attacker.eliteTier === 2)) && Math.random() < .35) {
    addFloat(target.x, target.y - 14, '已读不回', '#c9d4e4', 7, .6);
  } else {
    const hpBeforeDamage = target.hp;
    target.hp -= dmg;
    const actualDmg = Math.max(0, hpBeforeDamage - Math.max(0, target.hp));
    /* 暴击星芒 / 玩家受击溅射（素材缺失时 render 静默跳过） */
    if (crit && nearPlayer(target.x, target.y)) addFx({ type: 'critfx', x: target.x, y: target.y - 6, r: 12, life: .32 });
    if (target.isPlayer && actualDmg > 3) addFx({ type: 'hurtfx', x: target.x + rand(-4, 4), y: target.y - 6, r: 10, life: .3 });
    if (target.isPlayer && actualDmg > 0) {
      if (target.mods.scarBadge) {
        target.hardinessLayers = Math.min(10, (target.hardinessLayers || 0) + target.mods.scarBadge);
        target.hardinessT = 6;
      }
      if (target.mods.damageToShield) {
        const shield = Math.round(actualDmg * Math.min(.5, target.mods.damageToShield));
        if (shield > 0) {
          target.shield = Math.min(maxHp(target), (target.shield || 0) + shield);
          target.shieldT = Math.max(target.shieldT || 0, 2.5);
        }
      }
      if (target.mods.backwater && target.hp < maxHp(target) * .3) {
        target.backwaterActive = true;
        target.bloodDebtDamage = (target.bloodDebtDamage || 0) + actualDmg;
      }
      if (target.mods.overworkNuke)
        target.overworkDamage = (target.overworkDamage || 0) + actualDmg;
    }
  }
  if (attacker && attacker.isPlayer && attacker.mods && !opts.fromProc && target.alive && target.hp > 0) {
    let execThreshold = attacker.mods.executeThreshold || 0;
    if (attacker.mods.thirdHitExecute && canExecuteTarget(target)) {
      if (target.rlhfReviewOwner !== attacker) {
        target.rlhfReviewOwner = attacker;
        target.rlhfReviewCount = 0;
      }
      target.rlhfReviewCount = (target.rlhfReviewCount || 0) + 1;
      if (target.rlhfReviewCount >= 3) {
        target.rlhfReviewCount = 0;
        execThreshold = Math.max(execThreshold, .25);
        target.vulnT = Math.max(target.vulnT || 0, 1.2);
        target.vulnBonus = Math.max(target.vulnBonus || 0, .15);
        addFloat(target.x, target.y - 20, '三审复核', '#ff9440', 8, .8);
      }
    }
    if (execThreshold > 0 && tryExecuteTarget(attacker, target, execThreshold)) return;
  }
  target.hurtT = .15;
  /* 只有重击（>5% 最大生命）才打断"站定"状态——蹭血不再无限打断带薪如厕 */
  if (dmg > maxHp(target) * .05) target.standT = 0;
  if (opts.stun) {
    target.stunT = Math.max(target.stunT, opts.stun);
    if (attacker && attacker.mods) {
      /* 回收站冷静期：眩晕命中后目标下一次受伤加成 */
      if (attacker.mods.stunPunish) target.vulnT = Math.max(target.vulnT, 2), target.vulnBonus = Math.max(target.vulnBonus, attacker.mods.stunPunish);
      /* 连坐制度：眩晕概率传染给附近另一敌人 */
      if (attacker.mods.stunSpread && Math.random() < attacker.mods.stunSpread) {
        const near = nearestUnit(target.x, target.y, 150, t => t !== target && isFoe(attacker, t));
        if (near) near.stunT = Math.max(near.stunT, opts.stun * .7);
      }
    }
  }
  if (attacker && target.bot) { target.bot.provokedT = 4; target.lastAtk = attacker; }
  if (target.isPlayer) { addShake(2); SFX.hurt(); }
  /* v18: 通用 proc 触发——onHit(攻击者)、onCrit(仅暴击)、onHurt(受伤者)
   * opts.fromProc 防递归：proc 造成的伤害不再触发新 proc，杜绝无限循环 */
  if (!opts.fromProc && attacker && attacker.mods && attacker.mods.procs) {
    fireProcs(attacker, 'onHit', { target, dmg, crit });
    if (crit) fireProcs(attacker, 'onCrit', { target, dmg });
  }
  if (!opts.fromProc && target.mods && target.mods.procs) fireProcs(target, 'onHurt', { attacker, dmg });
  const show = !opts.quiet && (target.isPlayer || (attacker && attacker.isPlayer) || nearPlayer(target.x, target.y));
  if (show) {
    addFloat(target.x + rand(-4, 4), target.y - 16, String(Math.round(dmg)) + (crit ? '!' : ''),
      crit ? '#ff8f5a' : target.isPlayer ? '#ff6a6a' : (attacker && attacker.isPlayer ? '#ffe27a' : '#c9c4b4'),
      (target.isPlayer ? 8 : 7) + (crit ? 2 : 0), .6);
    addParts(target.x, target.y - 6, '#ff6a6a', 3, 50, .3);
    if (attacker && attacker.isPlayer) SFX.hit();
  }
  if (target.hp <= 0) killUnit(target, attacker, opts.cause, opts);
}

export function applyCurse(u, id, dur) {
  if (!u.alive || u.isBoss || u.isElite) return;
  if (u.debuffImmuneT > 0) return;   // 饮水机的 debuff 免疫窗口
  const fresh = u.curses[id] <= 0;
  if (id === 'repeat' && fresh) u.repeatAim = u.aim;
  u.curses[id] = Math.max(u.curses[id], dur);
  if (fresh && (u.isPlayer || nearPlayer(u.x, u.y)))
    addFloat(u.x, u.y - 22, `中了「${CURSES[id].name}」`, CURSES[id].color, 7, 1.1);
  if (fresh && u.isPlayer) { SFX.deny(); addShake(2); }
}

function killUnit(victim, killer, cause, opts = {}) {
  if (killer && killer.opcSummon && killer.allyOwner && killer.allyOwner.alive) killer = killer.allyOwner;
  /* 试用期晕倒救济：每月一次被同事扶起（试用期是发育期，不该有一波带走）——
     代价是扣经验；正赛阶段无此待遇 */
  if (victim.isPlayer && G.trial.active && !G.trial.revivedThisWave) {
    G.trial.revivedThisWave = true;
    victim.hp = maxHp(victim) * .4;   // v18：0.6→0.4 免死回血调低，容错度收紧
    victim.invulnT = 1.5;
    victim.xp = Math.max(0, victim.xp - Math.round(TUNE.levelNeed(victim.level) * .5));   // v18：扣半级经验（前期几乎无损，后期真的痛）
    for (const m of G.units) {
      if (m.isMob && m.alive && dist2(m.x, m.y, victim.x, victim.y) < 130 * 130) {
        m.alive = false;
        if (G.trial.active && m.trialSubWave === G.trial.subWave) G.trial.subWaveKilled++;
        if (m.mobGroup) m.mobGroup.alive--;   // 绕过 killUnit 的救济清怪也要递减组计数，不然外包大军组奖励永久卡死
      }
    }
    for (const p of G.projs) if (dist2(p.x, p.y, victim.x, victim.y) < 130 * 130) p.dead = true;
    addFx({ type: 'revivefx', x: victim.x, y: victim.y, r: 20, life: .8 });
    addFloat(victim.x, victim.y - 22, '晕倒了…被同事扶起（扣半月薪水）', '#ffcf33', 8, 1.6);
    addFeed('你在工位晕倒，被同事扶到茶水间缓了缓', true);
    addParts(victim.x, victim.y, '#7ee08a', 16, 90, .6);
    SFX.hurt();
    return;
  }
  if (victim.isPlayer && victim.mods.secondEntry && !victim.secondEntryUsed) {
    victim.secondEntryUsed = true;
    victim.hp = Math.max(1, maxHp(victim) * .35);
    victim.invulnT = Math.max(victim.invulnT, 2.2);
    victim.xp = Math.max(0, victim.xp - Math.round(TUNE.levelNeed(victim.level) * .1));
    for (const k in victim.curses) victim.curses[k] = 0;
    victim.reportedT = 0; victim.oaSlowT = 0; victim.stunT = 0; victim.vulnT = 0;
    addFx({ type: 'revivefx', x: victim.x, y: victim.y, r: 22, life: .85 });
    addFloat(victim.x, victim.y - 24, '二次入职：工龄清零，继续上班', '#ffcf33', 10, 1.6);
    addFeed('你被返聘成更便宜的外包，原地二次入职', true);
    addParts(victim.x, victim.y, '#ffcf33', 24, 110, .8);
    if (victim.mods.__evoShiftChange) {
      let healed = 0;
      for (const t of G.units) {
        if (!isFoe(victim, t) || t.isBoss || dist2(victim.x, victim.y, t.x, t.y) > 240 * 240) continue;
        const a = Math.atan2(t.y - victim.y, t.x - victim.x);
        t.x = victim.x + Math.cos(a) * 46;
        t.y = victim.y + Math.sin(a) * 46;
        t.stunT = Math.max(t.stunT, 2.4);
        const d = Math.min(maxHp(victim) * 1.3, t.eliteTier === 2 ? 260 : 180);
        applyDamage(t, d, victim, { quiet: true });
        healed += d * .08;
      }
      victim.hp = Math.min(maxHp(victim), victim.hp + healed);
      addFloat(victim.x, victim.y - 38, '诈尸交接班！', '#ff9440', 10, 1.4);
      addShake(6); SFX.boss();
    } else if (victim.isPlayer || nearPlayer(victim.x, victim.y)) SFX.fuse();
    return;
  }
  if (victim.mods.revive > 0) {
    /* 摸鱼申诉信的"装忙减半档"（revive=.5）之前与满档无差别：现在复活回血减半 */
    victim.hp = maxHp(victim) * (victim.mods.revive >= 1 ? .5 : .25);
    victim.mods.revive = 0;
    victim.invulnT = 1.2;
    for (const p of G.projs) if (dist2(p.x, p.y, victim.x, victim.y) < 90 * 90) p.dead = true;
    addFx({ type: 'revivefx', x: victim.x, y: victim.y, r: 20, life: .8 });
    addFloat(victim.x, victim.y - 20, victim.isBoss ? '“我给自己批了 N+1！”' : 'N+1到账，原地复活！', '#ffcf33', 8, 1.4);
    if (victim.isBoss) addFeed('老板 动用蒸馏来的 N+1 条款原地复活', true);
    addParts(victim.x, victim.y, '#ffcf33', 20, 100, .7);
    if (victim.isPlayer || nearPlayer(victim.x, victim.y)) SFX.fuse();
    return;
  }
  /* 已发送-撤回中：死亡50%概率原地"撤回"复活一次，不可再次触发，纯节奏/心理设计怪 */
  if (victim.isMob) {
    const mm = MOBS[victim.mobType];
    /* 需求冻结期间（noRecallT）撤回复活被冻结——该字段之前无任何消费者 */
    if (mm.recallChance && !victim.recalled && !(victim.noRecallT > 0) && Math.random() < mm.recallChance) {
      victim.recalled = true;
      victim.hp = maxHp(victim);
      if (nearPlayer(victim.x, victim.y)) addFloat(victim.x, victim.y - 14, '消息撤回中…', '#6aa3ff', 7, .9);
      return;
    }
  }
  victim.alive = false;
  victim.hp = 0;
  /* 试用期波次进度：任何死因（含无凶手的到期/环境死/策反后阵亡）都要计数——
   * 原来计数在"有凶手"分支里，无凶手死亡会让波次永远差几只推不动 */
  if (victim.isMob && G.trial.active && victim.trialSubWave === G.trial.subWave) G.trial.subWaveKilled++;
  if (victim.isMob && victim.mobGroup) victim.mobGroup.alive--;   // 组计数同理：与死因/凶手无关
  addParts(victim.x, victim.y, victim.isBoss ? '#b665ff' : victim.shirt, victim.isBoss ? 40 : victim.isMob ? 7 : 16, 110, .7);
  if (!victim.isMob && !victim.isSummon) {   // 召唤物到期不播死亡演出，OPC 流不再几秒一次"已优化"刷屏
    addParts(victim.x, victim.y, '#f2efe6', 8, 70, .5);
    addFloat(victim.x, victim.y - 18, victim.isBoss ? '老板毕业了！' : '已优化', victim.isBoss ? '#b665ff' : '#ff6a6a', 8, 1);
    if (victim.isPlayer || (killer && killer.isPlayer) || nearPlayer(victim.x, victim.y)) SFX.death();
  }

  /* v2.0 公共事故被击杀：KPI 奖励 + 锅值削减（吃到 KPI 就是抢功） */
  if (victim.isMob && MOBS[victim.mobType] && MOBS[victim.mobType].publicIncident) {
    const m = MOBS[victim.mobType];
    const kpi = m.kpiReward || 24;
    if (killer && killer.isPlayer) {
      killer.kpi = Math.min(100, (killer.kpi || 0) + kpi);
      killer.pot = Math.max(0, (killer.pot || 0) - Math.floor(kpi * .3));
      addFloat(victim.x, victim.y - 26, `KPI +${kpi}`, '#ffcf33', 10, 1.4);
      addFeed(`✅ 抢到「${m.publicIncident}」：KPI +${kpi}，锅值 −${Math.floor(kpi * .3)}`, true);
      /* KPI 攒满兑现——之前 kpi 只加不用，整个奖励闭环空转 */
      if (killer.kpi >= 100) {
        killer.kpi = 0;
        gainXp(killer, 120);
        killer.shield = Math.min(maxHp(killer), (killer.shield || 0) + 25);
        killer.shieldT = Math.max(killer.shieldT || 0, 10);
        addFloat(killer.x, killer.y - 34, '🏆 季度之星：+120经验 +25盾', '#ffcf33', 10, 1.6);
        addFeed('KPI 攒满 100：当选季度之星，奖励已发放', true);
      }
    }
  }

  /* 掉落 */
  if (victim.isMob) {
    const m = MOBS[victim.mobType];
    /* 需求变更单：打死分裂成两张小的；抄送轰炸：35%概率分裂出1只"已读不回"（splitChance/splitCount/splitInto 可选覆盖）
     * 需求冻结期间（noSplitT）分裂被冻结——该字段之前无任何消费者 */
    if (m.split && !victim.isSplitChild && !(victim.noSplitT > 0) && Math.random() < (m.splitChance ?? 1)) {
      const childType = m.splitInto || victim.mobType;
      for (let i = 0; i < (m.splitCount ?? 2); i++) spawnMob(childType, victim.x + rand(-10, 10), victim.y + rand(-10, 10), true, victim.mobMonth || 1);
      if (nearPlayer(victim.x, victim.y))
        addFloat(victim.x, victim.y - 14, childType === victim.mobType ? '需求又变了！' : '转发出去了！', '#7ac8ff', 6, .8);
    }
    if (Math.random() < .15) spawnXp(G, victim.x, victim.y, 2);
    /* 工资小偷：吐出偷走的全部经验 ×1.5（打死它就是赚的） */
    if (victim.stolenXp) {
      spawnXp(G, victim.x, victim.y, Math.round(victim.stolenXp * 1.5) + 2);
      if (nearPlayer(victim.x, victim.y)) addFloat(victim.x, victim.y - 16, '赃款追回！', '#ffcf33', 8, 1);
    }
    /* 地板咖啡豆：环境刮痧的对冲回复（割草游戏的地板鸡定律） */
    if (Math.random() < .12) G.pickups.push({ type: 'heal', amt: 4, x: victim.x, y: victim.y, bob: rand(0, 6) });
  } else if (victim.isElite) {
    /* 精英词条死亡效果：抄送/红点——之前是全工程无消费的空壳标记 */
    if (victim._ccOnDeath) {
      for (let i = 0; i < 2; i++) spawnMob('read_reply', victim.x + rand(-14, 14), victim.y + rand(-14, 14), false, 2);
      addFloat(victim.x, victim.y - 22, '死前抄送了全员', '#9ad1ff', 8, 1);
    }
    if (victim._redDotSpawn) {
      for (let i = 0; i < 3; i++) spawnMob('email', victim.x + rand(-16, 16), victim.y + rand(-16, 16), false, 2);
      addFloat(victim.x, victim.y - 30, '红点未读 ×3', '#ff4f4f', 8, 1);
    }
    spawnTech(G, pickTechId(), victim.x, victim.y, rollTier(victim.eliteTier === 2));
    spawnXp(G, victim.x, victim.y, victim.eliteTier === 2 ? 20 : 10);
    if (victim.eliteTier === 2) {   // 小 Boss 掉双倍模组（品级上偏）+ 消耗品
      spawnTech(G, pickTechId(), victim.x + rand(-12, 12), victim.y + rand(-12, 12), rollTier(true));
      spawnItem(G, undefined, victim.x + rand(-14, 14), victim.y + rand(-14, 14));
      addFeed(`小Boss ${victim.name} 被优化了`, !!(killer && killer.isPlayer));
      /* 亲手击杀 → 掉 AI 替身样本（公司用 AI 换员工，你用 AI 换同事） */
      if (killer && killer.isPlayer) {
        G.pickups.push({ type: 'sample', boss: victim.eliteType, x: victim.x + rand(-8, 8), y: victim.y + rand(-8, 8), bob: rand(0, 6) });
        addFloat(victim.x, victim.y - 26, 'AI 替身样本掉落！', '#d9b3ff', 8, 1.4);
      }
    }
  } else if (!victim.isPlayer && !victim.isBoss && !victim.isSummon) {
    if (victim.weapon.leg) spawnChip(G, victim.weapon.id, 5, victim.x, victim.y);
    else spawnChip(G, victim.weapon.id, victim.weapon.lvl, victim.x, victim.y);
    if (Math.random() < .35) spawnItem(G, undefined, victim.x + rand(-14, 14), victim.y + rand(-14, 14));
    spawnXp(G, victim.x, victim.y, 6);
  }
  if (victim.isBoss) {
    G.bossDead = true;
    for (const u of G.units) if (u.isHR && u.alive) { u.alive = false; addParts(u.x, u.y, '#9aa4b5', 10, 80, .5); }
    addFeed('老板 已毕业，HR 集体跑路', true);
    addShake(8);
  }

  /* 击杀奖励 */
  if (killer && killer.alive) {
    gainXp(killer, victim.isMob ? (victim.mobXp || MOBS[victim.mobType].xp)
      : (TUNE.xpPerKill + victim.level * 3) * (victim.isBoss ? 4 : 1) + (victim.isElite ? 15 : 0));
    if (killer.mods.killHeal) killer.hp = Math.min(maxHp(killer), killer.hp + killer.mods.killHeal * (victim.isMob ? .3 : 1));
    if (killer.isPlayer && killer.wageDebt > 0) {
      const cut = victim.isMob ? 10 : 24;
      killer.wageDebt = Math.max(0, killer.wageDebt - cut);
      if (killer.wageDebt <= 0) addFloat(killer.x, killer.y - 26, '欠薪已抵消', '#7ee08a', 8, .9);
    }
    if (killer.isPlayer && killer.mods.headhunter && !victim.isSummon) {
      killer.opcKillMarks = (killer.opcKillMarks || 0) + (victim.isElite || victim.isBoss ? 3 : 1);
      if (killer.opcKillMarks >= 10) {
        killer.opcKillMarks = 0;
        const hire = opcSummons(killer).filter(s => !s.opcSenior).sort((a, b) => maxHp(b) - maxHp(a))[0];
        if (hire) {
          hire.opcSenior = true;
          hire.hpBase = Math.round(hire.hpBase * 1.55); hire.hp = Math.min(maxHp(hire), hire.hp + 24);
          hire.mods.dmg *= 1.45; hire.opcDmgMul *= 1.25; hire.allyUntil += 10;
          addFloat(hire.x, hire.y - 20, '资深员工转正', '#ffcf33', 8, 1);
        }
      }
    }
    const rlhfExecuted = killer.isPlayer && (opts.executed || cause === 'execute');
    if (rlhfExecuted) {
      if (killer.mods.executeBlastChance && Math.random() < killer.mods.executeBlastChance)
        explodeAtNoRecurse(victim.x, victim.y, 72, Math.min(maxHp(victim) * .22 + wpnDmg(killer), 140), killer, '#ff9440');
      if (killer.mods.executionNuke) {
        killer.executeCounter = (killer.executeCounter || 0) + 1;
        const nukeNeed = killer.mods.executionNukeEvery || 12;
        if (killer.executeCounter >= nukeNeed) {
          killer.executeCounter = 0;
          explodeAtNoRecurse(victim.x, victim.y, 185, Math.min(200 + wpnDmg(killer) * 2, 260), killer, '#ff4f4f');
          addFx({ type: 'nukefx', x: victim.x, y: victim.y, r: 66, life: 1 });
          addFloat(killer.x, killer.y - 28, '核按钮授权：全量优化', '#ff4f4f', 10, 1.4);
          SFX.boss(); addShake(6);
        } else if (killer.executeCounter % 3 === 0) {
          addFloat(killer.x, killer.y - 24, `处决样本 ${killer.executeCounter}/${nukeNeed}`, '#ff9440', 8, .9);
        }
      }
    }
    /* 全员大会核爆：控制效果间接/直接导致的击杀累积会议积分 */
    if (killer.mods.assemblyNuke && (victim.stunT > 0 || victim.curses.repeat > 0)) killer.meetingPoints = (killer.meetingPoints || 0) + 1;
    /* 临时工外包大军：全组最后1只死亡才一次性结算奖励经验（拖到最后一击才爆发）
     * 计数递减在下方通用段（无凶手死亡也要递减），这里只发放奖励 */
    if (victim.isMob && victim.mobGroup && victim.mobGroup.alive <= 0) {
      const bonus = MOBS[victim.mobType].groupBonusXp || 0;
      gainXp(killer, bonus);
      if (nearPlayer(victim.x, victim.y)) addFloat(victim.x, victim.y - 20, `外包大军清空 +${bonus}经验`, '#ffcf33', 8, 1);
    }
    /* v18: onKill proc 触发（杂鱼击杀也算，让"每击杀触发"类效果在割草时也生效） */
    if (!opts.fromProc && killer.mods && killer.mods.procs) fireProcs(killer, 'onKill', { victim });
    if (victim.isMob) {
      /* 波次计数已上移到死亡通用段（任何死因都算），这里只留击杀音效 */
      if (killer.isPlayer) SFX.hit();
      return;   // 杂鱼不进击杀数/连杀/播报
    }
    killer.kills++;
    if (killer.mods.dropChance && Math.random() < killer.mods.dropChance)
      spawnItem(G, undefined, victim.x + rand(-10, 10), victim.y + rand(-10, 10));
    if (killer.isPlayer) {
      G.kills++; SFX.kill();
      G.freezeT = .07;
      if (G.t - (G.lastKillT === undefined ? -9 : G.lastKillT) < 3) G.streak++;
      else G.streak = 1;
      G.lastKillT = G.t;
      if (G.streak >= 2) {
        const label = G.streak === 2 ? '双杀！' : G.streak === 3 ? '三杀！！' : `裁员风暴 ×${G.streak}！！！`;
        addFloat(killer.x, killer.y - 28, label, '#ffcf33', 10, 1.2);
        beep(500 + G.streak * 90, 900 + G.streak * 90, .13, 'triangle', .055);
      }
    }
  }

  /* 击杀播报 */
  if (victim.isSummon) {
    /* 自然到期（inject/寿命）不播报；只有被敌人打死才低调提一句——原来每次到期都高亮刷屏 */
    if (cause !== 'inject' && killer) addFeed(`你的 ${victim.name} 阵亡了`, false);
  } else if (victim.isHR) {
    /* 老板的小兵：击杀原来完全静默（计数在涨但没有任何播报），玩家以为没统计 */
    if (killer && killer.isPlayer) addFeed(`✂️ 优化了老板的走狗 ${victim.name}`, true);
  } else if (!victim.isHR && !victim.isElite && !victim.isMob) {
    if (cause === 'zone') addFeed(`${victim.name} 被裁员红线优化了`, victim.isPlayer);
    else if (cause === 'burn') addFeed(`${victim.name} 倒在了画的饼里`, victim.isPlayer);
    else if (cause === 'inject') addFeed(`${victim.name} 提示词失效，精神崩溃离职`, false);
    else if (killer && killer.isMob) addFeed(`${victim.name} 被${killer.name}淹没了（没熬过试用期琐事）`, victim.isPlayer);
    else if (killer && killer.isElite) addFeed(`${victim.name} 被 ${killer.name} 带走了`, victim.isPlayer);
    else if (killer) addFeed(`${killer.name} 用「${killer.weapon.leg ? LEGENDS[killer.weapon.leg].name : WEAPONS[killer.weapon.id].name}」优化了 ${victim.name}`, victim.isPlayer || killer.isPlayer);
  }

  if (victim.isPlayer) {
    G.playerRank = aliveWorkers() + 1 + (G.latentBots ? G.latentBots.length : 0);
    G.deathLine = pick(COPY.deathLines);
    /* 死亡回执：凶手、差距——最强的"再来一局"燃料 */
    G.deathInfo = {
      killer: killer ? killer.name : (cause === 'zone' ? '裁员红线' : cause === 'burn' ? '一张画的饼' : '意外'),
      weapon: killer && !killer.isElite && !killer.isBoss && !killer.isMob
        ? (killer.weapon.leg ? `「${LEGENDS[killer.weapon.leg].name}」` : WEAPONS[killer.weapon.id].name)
        : null,
      remaining: aliveWorkers(),
      bossPct: G.bossSpawned && G.boss && G.boss.alive ? Math.round(G.boss.hp / maxHp(G.boss) * 100) : null,
    };
    G.endT = 1;
  }
}
export function aliveWorkers() {
  /* 被策反的不算竞争者 */
  return G.units.filter(u => u.alive && !u.isBoss && !u.isHR && !u.isElite && !u.isMob && !u.allyOwner).length;
}
/* 某品牌芯片是否还可能拿到（场上有掉落，或有活着的持有者迟早会掉） */
export function chipObtainable(id) {
  if (!G) return false;
  if (G.pickups.some(p => p.type === 'chip' && p.id === id)) return true;
  return G.units.some(u => u.alive && !u.isElite && !u.isBoss && !u.isPlayer && !u.weapon.leg && u.weapon.id === id);
}

/* ---------- 经验 / 技能 / 消耗品 / 模组 ---------- */
export function gainXp(u, amt) {
  /* 试用期工资打折：多源经验的总闸，防止发育期通胀吃光整个卡池 */
  if (G && G.trial.active && u.isPlayer) {
    amt *= .55;   // v18：0.42→0.55（配合 levelNeed 底数回到 1.22），转正当刻目标 Lv.11-13 而非 8-10
    G.trialXpEarned = (G.trialXpEarned || 0) + amt * u.mods.xp;   // 记账：转正同事按此补发育
  }
  u.xp += amt * u.mods.xp;
  while (u.xp >= TUNE.levelNeed(u.level)) {
    u.xp -= TUNE.levelNeed(u.level);
    u.level++;
    if (u.mods.levelHp) { u.hpBase += u.mods.levelHp; u.hp = Math.min(maxHp(u), u.hp + u.mods.levelHp); }
    if (u.isPlayer) {
      const heal = TUNE.levelHeal || 0;
      const shield = TUNE.levelShield || 0;
      if (heal) u.hp = Math.min(maxHp(u), u.hp + heal);
      if (shield) {
        u.shield = Math.max(u.shield || 0, shield);
        u.shieldT = Math.max(u.shieldT || 0, TUNE.levelShieldT || 5);
      }
      G.pendingLevels++;
      SFX.levelup();
      addFx({ type: 'levelupfx', x: u.x, y: u.y, r: 22, life: .8 });   // 升职金光柱
      addFloat(u.x, u.y - 20, `升职了！+${heal} HP +${shield} 盾`, '#ffcf33', 9, 1);
    } else {
      /* 机器人不抽人设专属卡：这些卡的消费点全在玩家专属路径里，抽到即废（白白浪费成长） */
      const pool = SKILLS.filter(s => !s.persona && (u.skills[s.id] || 0) < s.max && (!s.valid || s.valid(u)));
      if (pool.length) applySkill(u, pick(pool));
      u.hp = Math.min(maxHp(u), u.hp + 15);
    }
  }
}
export function applySkill(u, s) {
  u.skills[s.id] = (u.skills[s.id] || 0) + 1;
  const hpBefore = maxHp(u);
  s.apply(u.mods);
  const diff = maxHp(u) - hpBefore;
  if (diff > 0) u.hp += diff;
  u.hp = Math.min(maxHp(u), u.hp);
}

function useItem(u, id) {
  const boost = u.mods.itemBoost;
  const F = n => Math.round(n * boost);
  const healWithOverflowShield = (rawHeal, shieldRate = .5) => {
    const mh = maxHp(u);
    const before = u.hp;
    const heal = Math.max(0, Math.round(rawHeal));
    u.hp = Math.min(mh, u.hp + heal);
    const gained = u.hp - before;
    const overflow = Math.max(0, heal - gained);
    if (overflow > 0) {
      u.shield = Math.min(mh, (u.shield || 0) + Math.round(overflow * shieldRate));
      u.shieldT = Math.max(u.shieldT || 0, 10);
    }
    return { gained: Math.round(gained), shield: overflow > 0 ? Math.round(overflow * shieldRate) : 0 };
  };
  switch (id) {
    case 'iced_americano':
      u.hp = Math.min(maxHp(u), u.hp + F(30));
      if (u.isPlayer) addFloat(u.x, u.y - 16, `+${F(30)} HP`, '#7ee08a', 8, .8);
      break;
    case 'overtime_redbull':
      u.buffs.spdT = 5 * boost; u.buffs.spdM = 1.5;
      if (u.isPlayer) addFloat(u.x, u.y - 16, '加班冲刺！', '#6aa3ff', 8, .8);
      break;
    case 'stock_option':
      gainXp(u, F(50));
      if (u.isPlayer) addFloat(u.x, u.y - 16, `+${F(50)} 经验`, '#ffe27a', 8, .8);
      break;
    case 'n1_package':
      u.shield = Math.max(u.shield || 0, F(30)); u.shieldT = Math.max(u.shieldT || 0, 10);   // 不再把更高的现有护盾覆盖降级
      if (u.isPlayer) addFloat(u.x, u.y - 16, `+${F(30)} 护盾`, '#6aa3ff', 8, .8);
      break;
    case 'teambuild_milktea':
      u.buffs.fireT = 8 * boost; u.buffs.fireM = 1.3;
      if (u.isPlayer) addFloat(u.x, u.y - 16, '奶茶到位，射速拉满', '#ff9edb', 8, .8);
      break;
    case 'boss_pie':
      if (Math.random() < .5) {
        u.hp = Math.min(maxHp(u), u.hp + F(25));
        if (u.isPlayer) addFloat(u.x, u.y - 16, `真香 +${F(25)} HP`, '#7ee08a', 8, .8);
      } else if (u.isPlayer) addFloat(u.x, u.y - 16, '饼是画的', '#9aa4b5', 8, 1);
      break;
    case 'double_quota':
      u.buffs.fireT = 6 * boost; u.buffs.fireM = 1.5;
      if (u.isPlayer) addFloat(u.x, u.y - 16, '双倍配额，敞开用！', '#ffcf33', 9, 1);
      break;
    case 'reset_card': {
      u.weapon.cd = 0; u.dashT = 0; u.activeCd = 0;
      u.activeQCd = 0; u.activeECd = 0;
      u.weapon.droneCds = [0, 0, 0, 0]; u.ragCds = [0, 0];
      u.weapon.pillarT = 0;
      if (u.dstT) for (const k in u.dstT) u.dstT[k] = 0;
      for (const sid in u.subs) u.subs[sid].t = 0;
      if (u.isPlayer) addFloat(u.x, u.y - 16, '本月用量已清零', '#67c98b', 9, 1);
      break;
    }
    case 'n2_package':
      u.shield = Math.max(u.shield || 0, F(60)); u.shieldT = Math.max(u.shieldT || 0, 12);   // 同上：取高不覆盖
      u.hp = Math.min(maxHp(u), u.hp + F(20));
      if (u.isPlayer) addFloat(u.x, u.y - 16, `2N 到账：+${F(60)} 盾 +${F(20)} HP`, '#c9a227', 9, 1);
      break;
    case 'resume_refresh':
      if (u.isPlayer) {
        G.rerollCredits = (G.rerollCredits || 0) + 1;
        addFloat(u.x, u.y - 16, `简历已刷新（重抽机会 ×${G.rerollCredits}）`, '#7ac8ff', 8, 1);
      }
      break;
    case 'workers_comp': {
      const missing = maxHp(u) - u.hp;
      const heal = Math.min(F(80), Math.max(F(25), Math.round(missing * .55 * boost)));
      const got = healWithOverflowShield(heal, .6);
      if (u.isPlayer) addFloat(u.x, u.y - 16, `工伤报销 +${got.gained} HP${got.shield ? ` +${got.shield}盾` : ''}`, '#7ee08a', 8, 1);
      break;
    }
    case 'sick_leave_note': {
      const got = healWithOverflowShield(F(22), .5);
      u.invulnT = Math.max(u.invulnT || 0, 1.8 * boost);
      if (u.isPlayer) addFloat(u.x, u.y - 16, `病假批准 +${got.gained} HP · 短暂无敌`, '#6aa3ff', 8, 1);
      break;
    }
    case 'noise_cancel_headset':
      for (const k in u.curses) u.curses[k] = 0;
      u.reportedT = 0;
      u.oaSlowT = 0;
      u.stunT = 0;
      u.vulnT = 0;
      u.buffs.spdT = Math.max(u.buffs.spdT, 4 * boost);
      u.buffs.spdM = Math.max(u.buffs.spdM, 1.25);
      if (u.isPlayer) addFloat(u.x, u.y - 16, '降噪成功：清负面 + 提速', '#7ac8ff', 8, 1);
      break;
    case 'power_bank': {
      const cut = F(8);
      u.weapon.cd = 0;
      u.dashT = Math.max(0, (u.dashT || 0) - F(3));
      u.activeCd = Math.max(0, (u.activeCd || 0) - cut);
      u.activeQCd = Math.max(0, (u.activeQCd || 0) - cut);
      u.activeECd = Math.max(0, (u.activeECd || 0) - cut);
      for (const sid in u.subs) u.subs[sid].t = Math.max(0, (u.subs[sid].t || 0) - F(3));
      if (u.isPlayer) addFloat(u.x, u.y - 16, `充电完成：冷却 -${cut}s`, '#ffcf33', 8, 1);
      break;
    }
    case 'admin_supply_bag':
      if (G) {
        const a = rand(0, Math.PI * 2), b = a + Math.PI * .75;
        spawnItem(G, pick(SURVIVAL_ITEM_IDS), u.x + Math.cos(a) * 16, u.y + Math.sin(a) * 16);
        G.pickups.push({ type: 'heal', amt: F(22), x: u.x + Math.cos(b) * 16, y: u.y + Math.sin(b) * 16, bob: rand(0, 6) });
      }
      if (u.isPlayer) addFloat(u.x, u.y - 16, '行政补给已拆封', '#ff9edb', 8, 1);
      break;
  }
  if (u.isPlayer) SFX.pickup();
}

export function applyTechPickup(u, id, tier = 1) {
  const t = TECH[id], m = u.mods;
  const t3 = (a, b, c) => [a, b, c][tier - 1];   // 标准 / Pro / Ultra
  if (!t.instant) u.tech[id] = (u.tech[id] || 0) + 1;
  switch (id) {
    /* v18: echoMult 改为软上限公式，杜绝"Ultra Fewshot ×2 → 单次输出 2.8 倍"绕过射速软上限的隐藏乘区
     * multishot=1: echoMult=0.65（Ultra旧值0.9），multishot=2: 0.733，multishot=3: 0.775——递增速率放缓 */
    case 'fewshot': m.multishot++; m.echoMult = 0.4 + 0.5 * (1 - 1 / (1 + m.multishot)); break;
    case 'cot': m.pierce += t3(1, 1, 2); break;
    case 'temp': m.crit += t3(.10, .14, .19); break;
    case 'quant': { const v = t3(1.10, 1.15, 1.22); m.fireRate *= v; m.bulletSpd *= v; break; }
    case 'attention': m.homing += t3(.8, 1.1, 1.5); break;
    case 'kvcache': m.fireRate *= t3(1.08, 1.12, 1.18); break;
    case 'finetune': { const v = t3(1.05, 1.08, 1.12); m.dmg *= v; m.fireRate *= v; m.spd *= t3(1.03, 1.05, 1.08); break; }
    case 'ctxwin': m.range *= t3(1.18, 1.25, 1.35); break;
    case 'sysprompt': m.sysPrompt = Math.max(m.sysPrompt, t3(10, 15, 22)); u.shield = Math.max(u.shield, t3(20, 30, 45)); u.shieldT = 12; break;
    case 'rag': m.rag = Math.min(2, m.rag + 1); m.ragBoost = Math.max(m.ragBoost, t3(1, 1.15, 1.35)); break;
    case 'inject': doInject(u, t3(12, 20, 30)); break;
    case 'clear': doClear(u, t3(70, 95, 125), t3(22, 30, 42)); break;
    case 'distill': grantDistill(u); break;
  }
  if (u.isPlayer && id !== 'distill') {
    const tierInfo = TECH_TIERS[tier - 1];
    addFloat(u.x, u.y - 18, `模组：${tierInfo.label}${t.name}`, tierInfo.color || t.color, tier === 3 ? 9 : 8, 1.1);
    SFX.chip();
    if (tier === 3) SFX.fuse();
  }
}

/* ---------- 人设四/五：控场反噬 + 摸鱼位移流的周期性状态机（仅玩家） ---------- */
function updatePersonaSkills(u, dt) {
  /* 办公室政治：内耗标记倒计时，到点溅射给最近另一敌人 */
  if (u.politicsT > 0) {
    u.politicsT -= dt;
    if (u.politicsT <= 0 && u.alive) {
      const near = nearestUnit(u.x, u.y, 150, t => t !== u && isFoe(u.politicsOwner || u, t));
      if (near) applyDamage(near, u.politicsDmg, u.politicsOwner, { quiet: true });
    }
  }
  u.fuseBreakCd -= dt;

  if (!u.isPlayer) return;
  u.opcFocusT = Math.max(0, (u.opcFocusT || 0) - dt);
  u.severanceCd = Math.max(0, (u.severanceCd || 0) - dt);
  u.opcMatrixT = Math.max(0, (u.opcMatrixT || 0) - dt);
  if (u.mods.contractorSummon > 0) {
    const mine = opcSummons(u);
    const cap = Math.min(OPC_SUMMON_CAP, 1 + u.mods.contractorSummon);
    u.opcSummonT -= dt;
    if (u.opcSummonT <= 0 && mine.length < cap) {
      u.opcSummonT = Math.max(2.2, 6.4 * (u.mods.summonCdMul || 1));
      spawnOpcSummon(u, 'contractor');
    }
    if (u.mods.summonCdMul < 1 && mine.length) {
      u.buffs.spdT = Math.max(u.buffs.spdT, .35);
      u.buffs.spdM = Math.max(u.buffs.spdM, 1 + Math.min(.18, (1 - u.mods.summonCdMul) * .8));
    }
  }
  const activeOpc = opcSummons(u);
  if (u.mods.contractorMatrix && activeOpc.length >= 6) {
    u.opcMatrixT = Math.max(u.opcMatrixT, .35);
    u.buffs.dmgT = Math.max(u.buffs.dmgT, .35);
    u.buffs.dmgM = Math.max(u.buffs.dmgM, 1.12);
    const focus = u.opcFocusTarget && u.opcFocusTarget.alive ? u.opcFocusTarget
      : nearestUnit(u.x, u.y, 260, t => isFoe(u, t));
    if (focus) {
      focus.vulnT = Math.max(focus.vulnT || 0, .5);
      focus.vulnBonus = Math.max(focus.vulnBonus || 0, .15);
      u.opcFocusTarget = focus; u.opcFocusT = Math.max(u.opcFocusT, .4);
    }
  }
  if (u.mods.severanceNuke && u.severanceCd <= 0 && (u.severancePoints || 0) >= 15) {
    triggerSeveranceNuke(u, u.x, u.y, 1);
  }
  /* 假装忙碌：闲置超1.5秒触发短暂提速，逼玩家别停 */
  if (u.mods.fakeBusy && u.idleT > 1.5) {
    u.idleT = 0;
    u.buffs.spdT = Math.max(u.buffs.spdT, 1);
    u.buffs.spdM = Math.max(u.buffs.spdM, 1.2);
  }
  /* 在线时长认证：连续不被命中每5秒叠一层"活跃认证"，被命中清零（noHitT 在 applyDamage 里清零）
   * 假勤奋真怠工改用独立计时 fdIdleT——原来两技能共用 noHitT，假勤奋每 8s 清零一次，认证永远卡在 1 层 */
  u.noHitT += dt;
  u.fdIdleT = (u.fdIdleT || 0) + dt;
  if (u.mods.uptimeCertRate) {
    const layers = Math.min(5, Math.floor(u.noHitT / 5));
    if (layers > 0) {
      u.buffs.dmgT = Math.max(u.buffs.dmgT, .3);
      u.buffs.dmgM = Math.max(u.buffs.dmgM, 1 + layers * .02 * u.mods.uptimeCertRate);
      u.buffs.fireT = Math.max(u.buffs.fireT, .3); u.buffs.fireM = Math.max(u.buffs.fireM, 1 + layers * .03 * u.mods.uptimeCertRate);
    }
  }
  /* 假勤奋，真怠工：v18 改为总伤害池模型（perFoe 双封顶）——杜绝"每目标独立×3伤害"的清屏 AoE 翻倍 DPS
   * 破局分析：旧版对 15 只怪各吃满 wpnDmg×3 = 全屏 wpnDmg*45 相当于 DPS 翻倍
   * 新版：per-target = min(wpnDmg*3, totalBurst/hitCount)，totalBurst = wpnDmg*8
   *  - 1 只怪: min(3, 8) = wpnDmg*3（=旧值）
   *  - 5 只怪: min(3, 1.6) = wpnDmg*1.6（总 8 倍）
   *  - 15 只怪: min(3, 0.53) = wpnDmg*0.53（总 8 倍，不再线性膨胀）*/
  u.ignoreDmgT -= dt;
  if (u.hardinessT > 0) {
    u.hardinessT -= dt;
    const layers = Math.min(10, u.hardinessLayers || 0);
    if (layers > 0) {
      u.buffs.dmgT = Math.max(u.buffs.dmgT, .25);
      u.buffs.dmgM = Math.max(u.buffs.dmgM, 1 + layers * .025);
    }
    if (u.hardinessT <= 0) u.hardinessLayers = 0;
  }
  if (u.bloodVanT > 0) {
    u.bloodVanT -= dt;
    u.hp = Math.min(maxHp(u), u.hp + (u.bloodVanHeal || 6) * dt);
    u.vulnT = Math.max(u.vulnT || 0, .2);
    u.vulnBonus = Math.max(u.vulnBonus || 0, u.bloodVanVuln || .12);
    if (u.bloodVanT <= 0) addFloat(u.x, u.y - 20, '献血车收摊', '#9aa4b5', 7, .8);
  }
  if (u.noClockoutT > 0) {
    u.noClockoutT -= dt;
    if (u.noClockoutT <= 0 && u.wageDebt > 0) {
      const debt = u.wageDebt;
      u.wageDebt = 0;
      addFloat(u.x, u.y - 24, `欠薪结算 -${Math.round(debt)}`, '#ff6a6a', 8, 1);
      applyDamage(u, debt, null, { cause: 'wage_debt', quiet: false });
    }
  }
  if (u.mods.backwater) {
    const low = u.hp < maxHp(u) * .3;
    if (low) {
      u.backwaterActive = true;
      u.buffs.dmgT = Math.max(u.buffs.dmgT, .3); u.buffs.dmgM = Math.max(u.buffs.dmgM, 1.35);
      u.buffs.fireT = Math.max(u.buffs.fireT, .3); u.buffs.fireM = Math.max(u.buffs.fireM, 1.2);
    } else if ((u.backwaterActive || (u.bloodDebtDamage || 0) > 0) && u.hp >= maxHp(u) * .45) {
      u.backwaterActive = false;
      const scale = u.mods.__evoFubaoField ? .55 : .32;
      const dmg = Math.min((u.bloodDebtDamage || 0) * scale, maxHp(u) * (u.mods.__evoFubaoField ? 2.2 : 1.4));
      u.bloodDebtDamage = 0;
      if (dmg > 8) {
        explodeAtNoRecurse(u.x, u.y, u.mods.__evoFubaoField ? 155 : 120, dmg, u, '#ff9440');
        addFloat(u.x, u.y - 26, '血债清算', '#ff9440', 10, 1.2);
      }
    }
  }
  u.overworkCd = Math.max(0, (u.overworkCd || 0) - dt);
  if (u.mods.overworkNuke && u.overworkCd <= 0 && (u.overworkDamage || 0) >= maxHp(u) * 2.4) {
    u.overworkDamage = 0;
    u.overworkCd = 20;
    u.invulnT = Math.max(u.invulnT, .6);
    u.hp = Math.min(maxHp(u), u.hp + maxHp(u) * .45);
    const dmg = Math.min(maxHp(u) * 1.25, 260);
    for (const t of G.units) if (isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 170 * 170) {
      applyDamage(t, t.isBoss || t.eliteTier === 2 ? Math.min(dmg, 180) : dmg, u, { quiet: false });
      t.vulnT = Math.max(t.vulnT || 0, 5); t.vulnBonus = Math.max(t.vulnBonus || 0, .2);
    }
    addFx({ type: 'nukefx', x: u.x, y: u.y, r: 62, life: 1 });
    addFloat(u.x, u.y - 28, '996核爆协议！', '#ff6a6a', 11, 1.4);
    addShake(6); SFX.boss();
  }
  if (u.mods.fakeDiligence && u.fdIdleT >= (u.mods.__evoFakeDiligenceUpgrade ? 5 : 8)) {
    u.fdIdleT = 0;
    const foes = G.units.filter(t => isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 260 * 260);
    if (foes.length > 0) {
      const totalBurst = wpnDmg(u) * 8;
      const perFoe = Math.min(wpnDmg(u) * 3, totalBurst / foes.length);
      for (const t of foes) applyDamage(t, perFoe, u, { quiet: false });
    }
    addFloat(u.x, u.y - 22, '业绩展示！', '#b665ff', 9, 1.2); addShake(3); SFX.fuse();
    if (u.mods.__evoFakeDiligenceUpgrade) { u.ignoreDmgT = 2; addFloat(u.x, u.y - 32, '已读不回状态', '#c9d4e4', 8, 1); }
  }
  /* 季度考核倒计时：场上每个受控敌人给自身一层KPI压力，每秒重算一次（不做同帧刷层） */
  if (u.mods.kpiPerLayer) {
    u.kpiLayerT -= dt;
    if (u.kpiLayerT <= 0) {
      u.kpiLayerT = 1;
      let n = 0;
      for (const t of G.units) if (t.alive && isFoe(u, t) && t.stunT > 0) n++;
      u.kpiLayers = Math.min(20, n);
    }
    if (u.kpiLayers > 0) {
      u.buffs.dmgT = Math.max(u.buffs.dmgT, .3);
      u.buffs.dmgM = Math.max(u.buffs.dmgM, 1 + u.kpiLayers * u.mods.kpiPerLayer);
    }
  }
  /* 末位淘汰制：每8秒强制"约谈"场上生命最低的敌人，定身2秒后爆炸，再指向下一个最低生命目标 */
  if (u.mods.bottomCut) {
    u.bottomCutT -= dt;
    if (u.bottomCutT <= 0) {
      u.bottomCutT = 8;
      let worst = null, worstHp = Infinity;
      for (const t of G.units) if (t.alive && isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 500 * 500 && t.hp < worstHp) { worst = t; worstHp = t.hp; }
      if (worst) {
        worst.stunT = Math.max(worst.stunT, 2);
        worst.bottomCutMark = 2;
      }
    }
  }
  for (const t of G.units) {
    if (t.bottomCutMark > 0) {
      t.bottomCutMark -= dt;
      if (t.bottomCutMark <= 0 && t.alive) {
        t.bottomCutMark = 0;
        /* v18：加分层封顶——普通杂鱼上限 250、T1 精英 250、T2 小 Boss 400、老板 150
         * 破局分析：旧版无差别 maxHp*2 让每 8s 白嫖秒杀 T2 小 Boss（约 500-800 血 → 一发 1000-1600 直接死）*/
        const cap = t.isBoss ? 150 : t.eliteTier === 2 ? 400 : t.isElite ? 250 : 250;
        explodeAt(t.x, t.y, 110, Math.min(maxHp(t) * 2, cap), u, '#ff6a6a');
        /* 觉醒承诺"沿链殉爆"：连坐搭档吃 60% 爆炸伤害（原来完全未实现） */
        if (u.mods.__evoDismissalChain && t.linkedTo && t.linkedTo.alive)
          applyDamage(t.linkedTo, Math.min(maxHp(t.linkedTo), cap) * .6, u, { quiet: false });
      }
    }
  }
  /* 全员大会核爆：会议积分满30点触发全屏拉拽+核爆 */
  if (u.mods.assemblyNuke) {
    if (u.assemblyT > 0) {
      u.assemblyT -= dt;
      if (u.assemblyT <= 0) {
        const dmg = Math.min(wpnDmg(u) * 3.5, 300);
        for (const t of G.units) if (isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 260 * 260)
          applyDamage(t, t.isBoss || t.eliteTier === 2 ? Math.min(dmg, 300) : dmg, u, { quiet: false });
        addFx({ type: 'nukefx', x: u.x, y: u.y, r: 70, life: 1 });
        addFloat(u.x, u.y - 24, '全员大会核爆！', '#ff6a6a', 10, 1.4); addShake(6); SFX.boss();
      }
    } else if (u.meetingPoints >= 30) {
      u.meetingPoints = 0;
      u.assemblyT = 3;
      for (const t of G.units) if (isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 300 * 300) {
        t.stunT = Math.max(t.stunT, 3);
        const a = Math.atan2(u.y - t.y, u.x - t.x), dd = Math.min(80, dist(u.x, u.y, t.x, t.y) - 40);
        t.x += Math.cos(a) * dd; t.y += Math.sin(a) * dd;
      }
      addFloat(u.x, u.y - 20, '全员大会召集中…', '#ff9440', 9, 1.4); SFX.zone();
    }
  }
  /* 永动摸鱼引擎：v18 大幅收紧——阈值 300→800、burstT 4→2、加 10 秒硬冷却
   * 破局分析：旧版触发周期 1.92s 充能 + 4s 无敌 = 6s 循环 → 67% 时间无敌+免费打输出
   * 新版：约 5s 充能 + 2s 无敌 + 10s 冷却 = 17s 循环 → 12% 时间无敌，回归"大招"稀有感 */
  if (u.mods.perpetualSlack) {
    u.slackCd = (u.slackCd || 0) - dt;
    if (u.slackBurstT > 0) {
      u.slackBurstT -= dt;
      u.invulnT = Math.max(u.invulnT, dt + .05);
      u.slackTickT -= dt;
      if (u.slackTickT <= 0) {
        u.slackTickT = .2;
        for (const t of G.units) if (isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 50 * 50) {
          applyDamage(t, wpnDmg(u) * .6, u, { quiet: true });
          if (u.mods.__evoOnlineOffline && (u.__slackStacks || 0) < 15) {
            /* 觉醒：在线但心已离职——命中叠永久攻击力，上限15层。
             * 原实现用首次快照整体覆写 mods.dmg，会回滚之后拿到的一切增伤（越玩越弱）；
             * 改为每获得一层只乘一次 1%，与其它伤害来源正常叠乘 */
            u.__slackStacks = (u.__slackStacks || 0) + 1;
            u.mods.dmg *= 1.01;
          }
        }
      }
    } else if (u.slackMiles >= 800 && u.slackCd <= 0) {
      u.slackMiles = 0;
      u.slackBurstT = 2;
      u.slackCd = 10;   // 硬冷却：触发后 10 秒内即使再攒够 800px 也不能再触发
      u.buffs.spdT = Math.max(u.buffs.spdT, 2); u.buffs.spdM = Math.max(u.buffs.spdM, 3);
      addFloat(u.x, u.y - 20, '高铁摸鱼！', '#ffcf33', 9, 1.2); SFX.dash();
      /* 觉醒描述承诺"附带完整临时下线效果"——原来只有 0.3s 无敌，现在补齐隐身+双倍移速 1 秒 */
      if (u.mods.__evoOnlineOffline) {
        u.invulnT = Math.max(u.invulnT, 1);
        u.hiddenT = Math.max(u.hiddenT || 0, 1);
        u.buffs.spdM = Math.max(u.buffs.spdM, 2);
      }
    }
  }
}

/* ---------- 大模型蒸馏：随机获得一个 Boss/小Boss 技能弱化版 ---------- */
function grantDistill(u) {
  const pool = Object.keys(DISTILLS).filter(k => !(u.distills && u.distills[k]));
  if (!pool.length) {
    gainXp(u, 50);
    if (u.isPlayer) addFloat(u.x, u.y - 18, '蒸馏已饱和 +50经验', '#9aa4b5', 7, .9);
    return;
  }
  const k = pick(pool);
  u.distills = u.distills || {};
  u.dstT = u.dstT || {};
  u.distills[k] = true;
  u.dstT[k] = 2;
  addFloat(u.x, u.y - 24, `蒸馏成功：「${DISTILLS[k].name}」`, '#b665ff', 9, 1.6);
  addFeed(`你 蒸馏出了 ${DISTILLS[k].src} 的「${DISTILLS[k].name}」`, true);
  addParts(u.x, u.y, '#b665ff', 26, 120, .8);
  SFX.fuse();
}
/* 蒸馏技能的自动施放（玩家专属） */
function updateDistills(u, dt) {
  const D = u.distills;
  for (const k in D) {
    if (k === 'align') continue;                       // 被动，见子弹碰撞
    u.dstT[k] -= dt;
    if (u.dstT[k] > 0) continue;
    if (k === 'ppt') {
      u.dstT[k] = 10;
      const ang = u.aim;
      addFx({ type: 'coneflash', x: u.x, y: u.y, ang, spread: .5, len: 120, color: '#e8e4d8', life: .3 });
      for (const t of G.units) {
        if (!isFoe(u, t) || dist(u.x, u.y, t.x, t.y) > 120) continue;
        let da = Math.atan2(t.y - u.y, t.x - u.x) - ang;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < .5) applyDamage(t, 14, u, { stun: .5 });
      }
    } else if (k === 'snitch') {
      const v = nearestUnit(u.x, u.y, 350, t => isFoe(u, t) && t.bot && !t.isHR && !t.isElite);
      if (!v) { u.dstT[k] = 2; continue; }
      u.dstT[k] = 14;
      v.reportedT = 5;
      addFloat(v.x, v.y - 22, '已被举报', '#ff4f4f', 7, 1.2);
    } else if (k === 'pie') {
      u.dstT[k] = 8;
      for (let i = 0; i < 6; i++)
        spawnBullet(u, i / 6 * Math.PI * 2, { dmg: 8 * u.mods.dmg, spd: 140, range: 200, shape: 'pie', r: 3, _echo: true });
    } else if (k === 'upman') {
      u.dstT[k] = 10;
      u.empowerT = 3;
      u.hp = Math.min(maxHp(u), u.hp + 6);
      addFloat(u.x, u.y - 18, '向上管理：自我赋能', '#c9a227', 7, .9);
    } else if (k === 'pua') {
      u.dstT[k] = 9;
      addFx({ type: 'boom', x: u.x, y: u.y, r: 90, color: '#b665ff', life: .35 });
      for (const t of G.units) {
        if (!isFoe(u, t) || dist2(u.x, u.y, t.x, t.y) > 90 * 90) continue;
        applyDamage(t, 6, u);
        const a = Math.atan2(t.y - u.y, t.x - u.x);
        t.x += Math.cos(a) * 30; t.y += Math.sin(a) * 30;
      }
    }
  }
}
function doInject(u, dur = 20) {
  const owner = u.allyOwner || u;
  /* 1) 优先策反同事（原有逻辑）：白嫖一个持枪打手 */
  const t = nearestUnit(u.x, u.y, 320, o => isFoe(u, o) && o.bot && !o.isHR && !o.isElite && !o.allyOwner);
  if (t) {
    t.allyOwner = owner; t.allyUntil = G.t + dur;
    t.bot.target = null; t.bot.decideT = 0;
    t.bot.provokedT = 0; t.lastAtk = null;
    addFloat(t.x, t.y - 20, '已被注入：开始帮忙打工', '#ff6a8a', 7, 1.4);
    if (u.isPlayer || nearPlayer(u.x, u.y)) { addFeed(`${u.name} 策反了 ${t.name}（${Math.round(dur)}秒）`, u.isPlayer); SFX.fuse(); }
    return;
  }
  /* 2) 没有同事在场 → 对老板/月度考核官注入：污染系统提示词（眩晕+易伤+减速）
   *    之前对 Boss 完全无效，这张卡在 Boss 战里是废纸 */
  const big = nearestUnit(u.x, u.y, 340, o => isFoe(u, o) && (o.isBoss || o.eliteTier === 2));
  if (big) {
    big.stunT = Math.max(big.stunT, 1.5);
    big.oaSlowT = Math.max(big.oaSlowT, 4);
    big.vulnT = Math.max(big.vulnT || 0, 3 + dur * .15);           // 模组档位 12/20/30 → 4.8/6/7.5 秒易伤
    big.vulnBonus = Math.max(big.vulnBonus || 0, .3);
    addFloat(big.x, big.y - 26, '⚠ 系统提示词已被污染', '#ff6a8a', 9, 1.5);
    if (u.isPlayer || nearPlayer(u.x, u.y)) { addFeed(`${u.name} 往 ${big.name} 的系统提示词里塞了脏数据`, u.isPlayer); SFX.fuse(); }
    return;
  }
  /* 3) 试用期/只剩杂鱼 → 策反最近几只小兵倒戈成临时打手（借用 OPC 召唤物近战 AI）
   *    之前试用期捡到这张卡毫无价值 */
  const mobs = G.units.filter(o => o.alive && o.isMob && !o.isSummon && !MOBS[o.mobType].publicIncident
    && o.spdBase > 0 && dist2(u.x, u.y, o.x, o.y) < 320 * 320)
    .sort((a, b) => dist2(u.x, u.y, a.x, a.y) - dist2(u.x, u.y, b.x, b.y))
    .slice(0, 2 + Math.round(dur / 12));   // 档位 12/20/30 → 3/4/5 只
  if (mobs.length) {
    for (const mb of mobs) {
      /* 策反视同"处理掉"：计入波次进度，且脱离杂鱼计数，避免波次卡死 */
      if (G.trial.active && mb.trialSubWave === G.trial.subWave) G.trial.subWaveKilled++;
      if (mb.mobGroup) { mb.mobGroup.alive--; mb.mobGroup = null; }
      mb.trialSubWave = null;
      mb.isMob = false; mb.isSummon = true; mb.opcSummon = true; mb.injectConvert = true;
      mb.summonType = 'opc_wall';
      mb.allyOwner = owner; mb.allyUntil = G.t + dur * .75;
      mb.opcShotCd = .85; mb.sumT = rand(.1, .4);
      mb.hp = Math.min(maxHp(mb), mb.hp + 10);
      mb.shirt = '#ff6a8a';
      addFloat(mb.x, mb.y - 14, '已被注入', '#ff6a8a', 6, .9);
    }
    if (u.isPlayer) { addFeed(`提示注入生效：${mobs.length} 只琐事倒戈帮你打工`, true); SFX.fuse(); }
    return;
  }
  gainXp(u, 25);
  if (u.isPlayer) addFloat(u.x, u.y - 16, '附近没有可注入对象 +25经验', '#9aa4b5', 7, .8);
}
function doClear(u, radius = 95, dmg = 30) {
  let n = 0;
  for (const p of G.projs) if (p.owner !== u) { p.dead = true; n++; }
  addFx({ type: 'boom', x: u.x, y: u.y, r: radius, color: '#ffffff', life: .5 });
  for (const t of G.units) {
    if (!isFoe(u, t)) continue;
    if (dist2(u.x, u.y, t.x, t.y) < radius * radius) {
      applyDamage(t, dmg, u);
      const a = Math.atan2(t.y - u.y, t.x - u.x);
      t.x += Math.cos(a) * 40; t.y += Math.sin(a) * 40;
    }
  }
  addShake(5);
  if (u.isPlayer || nearPlayer(u.x, u.y)) SFX.explo();
  if (u.isPlayer) addFloat(u.x, u.y - 20, `/clear 已清除 ${n} 发子弹`, '#ffffff', 8, 1);
}

/* 试用期启动某一波：填充 subWavePool（等待 spawn 的类型队列） +
 *   计算 subWaveTarget（考虑 groupSize 展开）+ 重置 killed 计数 */
function startTrialSubWave(idx) {
  const tr = G.trial;
  const comp = tr.subWaveDefs && tr.subWaveDefs[idx - 1];
  tr.subWave = idx;
  tr.subWaveKilled = 0;
  tr.subWavePool = [];
  tr.subWaveSpawnT = idx === 1 ? .3 : .5;   // 首波开局稍等，2/3 波多给点喘息
  let target = 0;
  if (comp) for (const { type, count } of comp) {
    for (let i = 0; i < count; i++) tr.subWavePool.push(type);
    const m = MOBS[type];
    target += (m && m.groupSize) ? m.groupSize * count : count;
  }
  tr.subWaveTarget = target;
  if (idx >= 2) warn(`⚡ 第 ${idx} 波：${describeSubWave(comp)}`);
}
function describeSubWave(comp) {
  if (!comp) return '';
  return comp.map(({ type, count }) => `${(MOBS[type] && MOBS[type].name) || type}×${count}`).join('、');
}

/* ---------- 主循环 ---------- */
export function update(dt) {
  if (G.freezeT > 0) { G.freezeT -= dt; dt *= .15; }   // 击杀顿帧
  G.t += dt;
  BGM.refreshPlayingTrack(G);   // 试用期/正式大逃杀/老板战之间的 BGM 切轨，幂等，开销可忽略
  /* 游戏内延迟任务结算（暂停/升级期间自然冻结，回调里再排新任务也安全） */
  if (G.delayed && G.delayed.length) {
    const due = G.delayed.filter(d => G.t >= d.at);
    if (due.length) {
      G.delayed = G.delayed.filter(d => G.t < d.at);
      for (const d of due) d.fn();
    }
  }

  /* ---------- 试用期波次调度（击杀驱动，非时间驱动） ----------
   *   每月 3 波固定敌人 + 月度考核 Boss
   *   - 每波从玩家四周远处涌入并主动追击，全部击杀才进入下一波
   *   - 第 3 波清完 → 短暂 breather → 月度考核官登场
   *   - Boss 击杀 → 立即进入下一月（0.8s 过渡）
   *   - 不再有"存活到时间点"这种模糊目标 */
  const tr = G.trial;
  if (tr.active) {
    /* 换月：wave===0（首月）或 monthDone 走完过渡；用 waveT 只当短过渡计时器 */
    if (tr.waveT > 0) tr.waveT -= dt;
    const canAdvanceMonth = tr.wave < tr.months && (tr.wave === 0 || (tr.monthDone && tr.waveT <= 0));
    if (canAdvanceMonth) {
      tr.wave++;
      tr.monthDone = false;
      tr.bossThisWave = false;
      tr.bossReadyT = 0;
      tr.revivedThisWave = false;
      tr.subWaveDefs = subWaves(tr.wave);
      warn(`📋 第 ${tr.wave}/${tr.months} 个月：三波压力测试即将开始`);
      SFX.zone();
      /* 深夜加班灯：第2月起每月开局固定放2盏，静止环境怪，不进波次池 */
      if (tr.wave >= 2) {
        for (let i = 0; i < 2; i++) {
          const a = rand(0, Math.PI * 2), rr = rand(150, 350);
          spawnMob('night_lamp',
            clamp(G.player.x + Math.cos(a) * rr, 30, TUNE.world - 30),
            clamp(G.player.y + Math.sin(a) * rr, 30, TUNE.world - 30), false, tr.wave);
        }
      }
      tr.hunterT = 20;
      startTrialSubWave(1);
    }
    /* KPI 追杀者：第3月起周期性单只登场（保留原设计）*/
    if (tr.wave >= 3 && !tr.monthDone) {
      tr.hunterT = (tr.hunterT ?? 20) - dt;
      if (tr.hunterT <= 0 && G.player.alive && !G.units.some(u2 => u2.mobType === 'kpi_hunter' && u2.alive)) {
        tr.hunterT = 45;
        const a = rand(0, Math.PI * 2), rr = rand(320, 420);
        spawnMob('kpi_hunter',
          clamp(G.player.x + Math.cos(a) * rr, 30, TUNE.world - 30),
          clamp(G.player.y + Math.sin(a) * rr, 30, TUNE.world - 30), false, tr.wave);
        warn('🏃 KPI 追杀者盯上你了——甩不掉就是硬拼');
      }
    }
    /* 分批 spawn 本波敌人：每 0.3s 一个"团"——同方向 5 只簇拥着涌来。
     *   每团换一个方向 → 四面八方轮番施压，割草的包围感来自成团不来自散点 */
    if (tr.subWavePool.length > 0 && G.player.alive) {
      tr.subWaveSpawnT -= dt;
      if (tr.subWaveSpawnT <= 0) {
        /* 第 1 月倾倒放缓（0.3→0.5s/团）：开局 DPS 低，5只/0.3s 的倾泻会在第一波直接淹死新手 */
        tr.subWaveSpawnT = tr.wave <= 1 ? .5 : .3;
        const packA = rand(0, Math.PI * 2), packR = rand(300, 400);
        const packX = clamp(G.player.x + Math.cos(packA) * packR, 30, TUNE.world - 30);
        const packY = clamp(G.player.y + Math.sin(packA) * packR, 30, TUNE.world - 30);
        for (let i = 0; i < 5 && tr.subWavePool.length > 0; i++) {
          const type = tr.subWavePool.shift();
          const x = clamp(packX + rand(-45, 45), 30, TUNE.world - 30);
          const y = clamp(packY + rand(-45, 45), 30, TUNE.world - 30);
          if (MOBS[type].groupSize) {
            const gg = spawnMobGroup(type, x, y, tr.wave);
            for (const u of gg) u.trialSubWave = tr.subWave;
          } else {
            const u = spawnMob(type, x, y, false, tr.wave);
            if (u) u.trialSubWave = tr.subWave;
          }
        }
      }
    }
    /* 本波清完（pool 空 && 击杀达标）→ 推进 */
    if (tr.subWave > 0 && !tr.bossThisWave && !tr.monthDone
        && tr.subWavePool.length === 0 && tr.subWaveKilled >= tr.subWaveTarget) {
      if (tr.subWave < 3) {
        addFloat(G.player.x, G.player.y - 22, `✅ 第 ${tr.subWave} 波清完！+12 HP`, '#7ee08a', 11, 1.4);
        /* 清波奖励：小回血+小护盾——给下一波留缓冲，试用期不再是无喘息的绞肉机 */
        if (G.player.alive) {
          G.player.hp = Math.min(maxHp(G.player), G.player.hp + 12);
          G.player.shield = Math.max(G.player.shield || 0, 10);
          G.player.shieldT = Math.max(G.player.shieldT || 0, 6);
        }
        SFX.levelup();
        startTrialSubWave(tr.subWave + 1);
      } else if (tr.bossReadyT <= 0) {
        /* 3 波全部清完，1.4s breather 再出 Boss */
        tr.bossReadyT = 1.4;
        warn(`🎉 三波已清！月度考核官准备登场——`);
        addFloat(G.player.x, G.player.y - 22, '喘口气……', '#7ee08a', 10, 1.2);
      }
    }
    /* Boss 登场 */
    if (tr.bossReadyT > 0 && !tr.bossThisWave) {
      tr.bossReadyT -= dt;
      if (tr.bossReadyT <= 0) {
        tr.bossThisWave = true;
        tr.bossReadyT = 0;
        const bt = tr.bossOrder[(tr.wave - 1) % tr.bossOrder.length];
        warn(`🚨 月度考核官登场！击败即可通关第 ${tr.wave} 月`);
        addShake(6);
        SFX.boss();
        spawnElite(bt, G.player, 1 + .08 * G.player.level);
      }
    }
    /* Boss 死 → 本月完成 → 0.8s 过渡切下月 */
    if (tr.bossThisWave && !tr.monthDone) {
      const bossAlive = G.units.some(u2 => u2.isElite && u2.eliteTier === 2 && u2.alive);
      if (!bossAlive) {
        tr.monthDone = true;
        tr.waveT = .8;
        gainXp(G.player, 15 + 8 * tr.wave);
        addFloat(G.player.x, G.player.y - 22, `✨ 通过第 ${tr.wave} 月考核！`, '#ffcf33', 12, 1.6);
        SFX.levelup();
        addFeed(`第 ${tr.wave} 月通过考核`, true);
      }
    }
    /* 最后一月转正提示（Boss 一死就提示，不再靠倒计时） */
    if (tr.wave === tr.months && tr.monthDone && !tr.cdWarned) {
      tr.cdWarned = true;
      warn('⏳ 转正即将开始——同事马上到岗');
    }
    /* 试用期彻底结束：最后一月 Boss 已死且过渡走完 */
    if (tr.wave >= tr.months && tr.monthDone && tr.waveT <= 0) {
      tr.active = false;
      /* 记录试用期实际结束时刻：缩圈/Boss/同事仇恨的时间轴一律从这里起算。
       * 原来用开局时按旧时间驱动公式预算的 trialOffset，实际时长普遍超预算，
       * 转正瞬间会连补 1-2 个缩圈相位（圈突然狂缩），速通则要干等 */
      G.trialEndT = G.t;
      spawnLateBots();
      warn('📢 试用期结束，全体同事到岗——正式开卷！');
      addFeed('HR：全员转正述职即日开始，祝各位好运', true);
      SFX.boss(); addShake(5);
    }
  }

  updateZone(dt);

  /* 濒死心跳 */
  if (G.player.alive && G.player.hp < maxHp(G.player) * .3) {
    G.heartT -= dt;
    if (G.heartT <= 0) {
      G.heartT = .9;
      beep(75, 45, .12, 'sine', .11);
      later(() => beep(70, 42, .1, 'sine', .09), 150);
    }
  }

  /* 补给刷新：芯片/模组在后期停止，正式大逃杀的消耗品和回血补给持续低频投放 */
  const canRestockGear = G.zone.phase < 3;
  const canRestockItems = G.zone.phase < 3 || !tr.active;
  if (canRestockGear) {
    G.chipT -= dt;
    if (G.chipT <= 0) {
      G.chipT = 15;
      if (G.pickups.filter(p => p.type === 'chip').length < 14) spawnChip(G, pick(Object.keys(WEAPONS)), Math.random() < .25 ? 2 : 1);
    }
    G.techT -= dt;
    if (G.techT <= 0) {
      G.techT = 25;
      if (G.pickups.filter(p => p.type === 'tech').length < 8) spawnTech(G, pickTechId());
    }
  }
  if (canRestockItems) {
    G.itemT -= dt;
    if (G.itemT <= 0) {
      const finalCircle = G.zone.phase >= 3;
      G.itemT = !tr.active ? (finalCircle ? TUNE.battleFinalItemInterval : TUNE.battleItemInterval) : 12;
      const itemCap = !tr.active ? (finalCircle ? TUNE.battleFinalItemCap : TUNE.battleItemCap) : 12;
      if (G.pickups.filter(p => !p.dead && p.type === 'item').length < itemCap) spawnItem(G);
      if (!tr.active && Math.random() < TUNE.battleHealDropChance &&
          G.pickups.filter(p => !p.dead && p.type === 'heal').length < (finalCircle ? 8 : 12)) {
        const pos = randPosInZone(G, finalCircle ? .55 : .75);
        G.pickups.push({ type: 'heal', amt: finalCircle ? 25 : 20, x: pos.x, y: pos.y, bob: rand(0, 6) });
      }
    }
  }
  /* v2.2 正赛"琐事骚扰潮"：转正后周期性小撮杂鱼（含新行为怪）从圈内一角涌来，
   * 维持割草密度与怪物多样性——免试用期玩家也能见到全部怪物品类 */
  if (!tr.active && G.player.alive) {
    G.mobTrickleT = (G.mobTrickleT ?? 14) - dt;
    if (G.mobTrickleT <= 0) {
      G.mobTrickleT = G.zone.phase >= 3 ? 34 : 22;
      const wild = G.units.filter(u => u.alive && u.isMob && !u.publicIncident).length;
      const cap = G.zone.phase >= 3 ? 6 : 14;
      if (wild < cap) {
        const n = randi(3, 6), a0 = rand(0, Math.PI * 2);
        const month = Math.min(5, 3 + G.zone.phase);
        for (let i = 0; i < n; i++) {
          const a = a0 + rand(-.6, .6), rr = rand(300, 400);
          spawnMob(pick(BR_MOB_POOL),
            clamp(G.player.x + Math.cos(a) * rr, 30, TUNE.world - 30),
            clamp(G.player.y + Math.sin(a) * rr, 30, TUNE.world - 30), false, month);
        }
        addFeed('一批琐事找上门来', false);
      }
    }
  }
  /* 精英野怪刷新（tier1 普通野怪；试用期由波次接管，不走常规刷新） */
  if (!tr.active) G.eliteT -= dt;
  if (G.eliteT <= 0) {
    G.eliteT = 22;
    const cap = G.zone.phase >= 4 ? 1 : Math.min(4, 1 + G.zone.phase);   // 终圈少刷
    if (G.units.filter(u => u.isElite && u.alive && u.eliteTier === 1).length < cap) spawnElite(pick(ELITE_T1));
  }
  /* 搭档芯片绝版保底（一次性，不违反决赛圈停止补给） */
  G.pityT -= dt;
  if (G.pityT <= 0 && !G.pityChipDone) {
    G.pityT = 2;
    const pl2 = G.player;
    if ((G.zone.phase >= 2 || G.bossSpawned) && pl2.alive && !pl2.weapon.leg && pl2.weapon.lvl >= 5) {
      const rp = recipePartner(pl2.weapon.id);
      if (rp && !chipObtainable(rp.partner)) {
        G.pityChipDone = true;
        const pos = randPosInZone(G, .5);
        spawnChip(G, rp.partner, 1, pos.x, pos.y);
        addFeed('行政悄悄补发了一块搭档芯片（下不为例）', true);
      }
    }
  }
  /* 职场怪物小 Boss（tier2，更稀有）+ v2.0：正式阶段偶发部门 Boss
   * design §2.1：老板办公室 chunk 内 elite spawn 加倍（连刷 2 只） */
  if (!tr.active) G.minibossT -= dt;
  if (G.minibossT <= 0) {
    G.minibossT = 55;
    const cap2 = G.zone.phase >= 2 ? 2 : 1;
    if (G.units.filter(u => u.isElite && u.alive && u.eliteTier === 2).length < cap2) {
      const useDept = G.zone.phase >= 2 && Math.random() < .4;
      spawnElite(pick(useDept ? DEPT_BOSS_IDS : ELITE_T2));
      /* Boss chunk 加倍：如果玩家在老板办公室 chunk 里，多刷 1 只 */
      const plCx = Math.floor(G.player.x / CHUNK_STRIDE);
      const plCy = Math.floor(G.player.y / CHUNK_STRIDE);
      if (G.chunkGrid && G.chunkGrid[plCy] && G.chunkGrid[plCy][plCx] === 'boss') {
        spawnElite(pick(useDept ? DEPT_BOSS_IDS : ELITE_T2));
      }
    }
  }

  /* v2.0 公共事故：转正后（试用期结束）正式阶段出现，处理成功给 KPI，失败涨锅值 */
  if (!tr.active && G.player.alive) {
    G.incidentT -= dt;
    if (G.incidentT <= 0) {
      G.incidentT = rand(45, 65);
      const active = G.units.filter(u => u.alive && u.mobType && MOBS[u.mobType] && MOBS[u.mobType].publicIncident).length;
      if (active < 2) spawnPublicIncident();
    }
  }

  /* 尸体清扫：杂鱼 + 召唤物 + 精英（OPC 流每几秒产出一个短命召唤物，原来只清杂鱼，
   * 长局累积数百死单位拖慢全量遍历）。同事尸体保留（结算/播报用） */
  G.corpseT = (G.corpseT ?? 2) - dt;
  if (G.corpseT <= 0) {
    G.corpseT = 2;
    if (G.units.some(u => !u.alive && (u.isMob || u.isSummon || u.isElite)))
      G.units = G.units.filter(u => u.alive || !(u.isMob || u.isSummon || u.isElite));
  }

  /* 喷淋倒计时不分阶段递减：原来放在"非试用期"块里，试用期打爆消防栓后全场减速直到转正才解除 */
  if (G.sprinklerActiveT > 0) {
    G.sprinklerActiveT -= dt;
    if (G.sprinklerActiveT <= 0) G.sprinklerBoostedDps = 0;
  }
  /* v2.0 Phase E · 5 种环境事件 tick（试用期不触发，避免玩家开局暴毙） */
  if (!tr.active && G.player.alive) {
    /* 1) 消防警报：8s 内所有单位 1dps + 20% 减速 */
    G.sprinklerT -= dt;
    if (G.sprinklerT <= 0) {
      G.sprinklerT = rand(90, 120);
      G.sprinklerActiveT = 8;
      warn('🚨 消防警报！全楼喷淋 8 秒');
      addFeed('消防警报响起，全楼喷淋启动', true);
      SFX.deny(); addShake(4);
      markEventTriggered('sprinkler');
    }
    if (G.sprinklerActiveT > 0) {
      const dps = G.sprinklerBoostedDps || 1;
      for (const u of G.units) {
        if (!u.alive) continue;
        /* 走 applyDamage 累计通道：原来直接 u.hp -= 会把单位打成负血不死的"僵尸"（唯一死亡入口在 applyDamage） */
        u.sprinklerAcc = (u.sprinklerAcc || 0) + dt * dps;
        if (u.sprinklerAcc >= 1) { const d = u.sprinklerAcc; u.sprinklerAcc = 0; applyDamage(u, d, null, { cause: 'zone', quiet: true }); }
      }
      /* v2.0 §8.20 喷淋视觉：视口范围内每帧撒 ~15 颗淡蓝水滴粒子（向下 gravity）*/
      if (G.player.alive) {
        const pl = G.player, viewR = 400;
        for (let i = 0; i < 15; i++) {
          const dx = rand(-viewR, viewR), dy = rand(-viewR, -viewR / 2);
          G.parts.push({
            x: pl.x + dx, y: pl.y + dy,
            vx: rand(-6, 6), vy: rand(120, 200),
            color: Math.random() < .3 ? '#a0e0ff' : '#6aa3ff',
            size: 2, t: 0, life: rand(.35, .55),
          });
        }
      }
    }
    /* 2) 停电 3s：屏幕暗，bot AI 索敌半径缩小 */
    G.blackoutT -= dt;
    if (G.blackoutT <= 0) {
      G.blackoutT = rand(150, 200);
      G.blackoutActiveT = 3;
      warn('⚡ 停电！3 秒内视野受限');
      SFX.zone();
      markEventTriggered('blackout');
    }
    if (G.blackoutActiveT > 0) G.blackoutActiveT -= dt;
    /* 3) 加班通知：6s 全场 bot 集火老板方向 */
    G.overtimeT -= dt;
    if (G.overtimeT <= 0) {
      G.overtimeT = rand(180, 240);
      G.overtimeActiveT = 6;
      warn('📢 老板临时通知：今晚全员加班');
      addFeed('老板 · 今晚全员加班', true);
      markEventTriggered('overtime');
    }
    if (G.overtimeActiveT > 0) G.overtimeActiveT -= dt;
    /* 4) 快递空投：从空中掉一个物资箱，玩家可拾取 */
    G.deliveryT -= dt;
    if (G.deliveryT <= 0) {
      G.deliveryT = rand(60, 90);
      const z = G.zone;
      const a = rand(0, Math.PI * 2), rr = rand(0, z.r * .6);
      const dx = z.cx + Math.cos(a) * rr, dy = z.cy + Math.sin(a) * rr;
      /* v2.0 §8.20 快递箱视觉：先加"从天空掉落"的 crate fx，落地时才 spawn loot */
      if (!G.crates) G.crates = [];
      G.crates.push({ x: dx, y: dy, fallT: .8, done: false });
      delay(() => {   // loot 与箱子落地同步出现（原来箱子还在天上 loot 已经躺地上了）
        spawnChip(G, pick(Object.keys(WEAPONS)), 2, dx, dy);   // Lv.2 chip
        spawnTech(G, pickTechId(), dx + rand(-16, 16), dy + rand(-16, 16), rollTier(true));
        spawnItem(G, undefined, dx + rand(-20, 20), dy + rand(-20, 20));
        spawnItem(G, undefined, dx + rand(-20, 20), dy + rand(-20, 20));
        G.pickups.push({ type: 'heal', amt: 35, x: dx + rand(-18, 18), y: dy + rand(-18, 18), bob: rand(0, 6) });
      }, .8);
      addFx({ type: 'boom', x: dx, y: dy, r: 40, color: '#ffcf33', life: .5 });
      /* v2.0 §3.5 快递落地砸中伤害：40 半径 25 伤 AoE（防站在原地捡 loot）
       * 用 explodeAt 走环境伤害（owner=G.player 但 quiet 走 zone-style dmg）*/
      /* 落地伤害延迟到箱子落地动画结束（fallT 0.8s）才结算，且走 applyDamage——
       * 原来当帧直接 u.hp -= 25，既在动画前就扣血，又能把单位打成负血不死 */
      delay(() => {
        for (const u of G.units) {
          if (!u.alive) continue;
          if (dist2(dx, dy, u.x, u.y) < 40 * 40) {
            applyDamage(u, 25, null, { quiet: !u.isPlayer, stun: .3 });
            if (u.isPlayer) {
              addFloat(u.x, u.y - 20, '📦 被快递砸了！-25', '#ff6a6a', 8, 1.2);
              addShake(4);
            }
          }
        }
      }, .8);
      addShake(3);
      addFeed(`📦 快递空投在 (${Math.round(dx)}, ${Math.round(dy)}) 落地（40 半径 25 伤）`, true);
      warn('📦 有物资空投！小心砸中');
      markEventTriggered('delivery');
    }
    /* 5) HR 巡视：zone.phase>=2 才触发 */
    if (G.zone.phase >= 2) {
      G.hrPatrolT -= dt;
      if (G.hrPatrolT <= 0) {
        G.hrPatrolT = rand(200, 260);   // design §3.5 CD 范围
        const z = G.zone;
        const ang = rand(0, Math.PI * 2);
        for (let i = 0; i < 4; i++) {
          const ax = z.cx + Math.cos(ang) * (z.r * .95) + rand(-20, 20);
          const ay = z.cy + Math.sin(ang) * (z.r * .95) + rand(-20, 20);
          spawnHR(clamp(ax, 30, TUNE.world - 30), clamp(ay, 30, TUNE.world - 30));
        }
        warn('🕴️ HR 巡视队从边缘赶来清场');
        addFeed('HR 巡视队入场（4 人）', true);
        markEventTriggered('hr_patrol');
      }
    }
  }

  /* v2.0 §8.20 快递箱 tick：倒计时（fallT）落地时消失 */
  if (G.crates && G.crates.length) {
    for (const c of G.crates) c.fallT = Math.max(0, c.fallT - dt);
    G.crates = G.crates.filter(c => c.fallT > 0);
  }

  /* v2.0 掩体 tick：破坏倒计时消失 + 可再生 obstacle 定时重生 */
  const propTick = (arr) => {
    for (const o of arr) {
      if (!o.destroyed && o.spr === 'coffee_machine') o._coffeeCd = Math.max(0, (o._coffeeCd || 0) - dt);
      /* 电梯全局节拍：原来开门倒计时写在"玩家贴着才执行"的交互循环里，
       * 等于要在电梯上罚站 45 秒才开门——没人知道电梯怎么用。现在全局走表 */
      if (!o.destroyed && o.spr === 'elevator') {
        o._openT = Math.max(0, (o._openT || 0) - dt);
        o._nextRing = (o._nextRing ?? 45) - dt;
        if (o._nextRing <= 0) {
          o._nextRing = 45; o._openT = 3;
          if (nearPlayer(o.x, o.y)) addFloat(o.x, o.y - 16, '🛗 电梯到了', '#38d3e8', 8, 1.2);
        }
        if (o._callT > 0 && G.t - (o._lastCallTouch || 0) > .25) o._callT = 0;   // 人走了，呼叫作废
      }
      if (o.destroyed) {
        o.destroyedT -= dt;
        if (o.destroyedT <= 0 && o.regenerable) {
          o.regenT = (o.regenT || 0) + dt;
          if (o.regenT >= REGEN_CD) {
            o.destroyed = false; o.hp = o.hpMax; o.regenT = 0;
            addParts(o.sx + o.w / 2, o.sy + o.h / 2, '#7ee08a', 8, 60, .4);
          }
        }
      }
    }
  };
  propTick(G.obstacles);
  propTick(G.decor);

  /* v2.0 T3 隐蔽：玩家进入 T3 obstacle 半径内隐身 1.5s，bot AI 会丢目标 */
  if (G.player.alive) {
    const pl = G.player;
    pl.hiddenT = Math.max(0, (pl.hiddenT || 0) - dt);
    const r2 = T3_HIDE_RADIUS * T3_HIDE_RADIUS;
    for (const arr of [G.obstacles, G.decor]) {
      for (const o of arr) {
        if (o.destroyed || o.cover !== 'T3') continue;
        if (dist2(pl.x, pl.y, o.sx + o.w / 2, o.sy + o.h / 2) < r2) {
          pl.hiddenT = T3_HIDE_DUR;
          break;
        }
      }
      if (pl.hiddenT > 0) break;
    }

    /* v2.0 §3.3 走过即触发交互（design 说 F 键，用户要走过触发）：
     *   咖啡机 触碰即喝 → 回血，满血时转为少量护盾（单台库存 + 短 CD）
     *   饮水机 走过 → 3s debuff 免疫
     *   消防栓（sprinkler_head 未破坏）走过一次 → 5s 全场减速 50%（CD 60s）
     *   座机 走过 → 40% 概率骚扰电话
     *   ppt_board 走过 → 打一张离职证明（30% 召唤 HR 精英）
     *   电梯（暂用 boss chunk 中央）每 45s 打开 3s，进入传送到随机另一台 */
    pl._coffeeCd = Math.max(0, (pl._coffeeCd || 0) - dt);
    pl._sprinklerCd = Math.max(0, (pl._sprinklerCd || 0) - dt);
    pl._coffeeUses = pl._coffeeUses || 0;
    pl._bulletinCd = Math.max(0, (pl._bulletinCd || 0) - dt);
    pl._elevatorCd = Math.max(0, (pl._elevatorCd || 0) - dt);
    /* v2.0 §6.3(3) chunk 类型访问追踪 → 6 种全走过解锁隐藏楼层 */
    if (G.chunkGrid) {
      const pcx = Math.floor(pl.x / CHUNK_STRIDE), pcy = Math.floor(pl.y / CHUNK_STRIDE);
      if (pcx >= 0 && pcx < GRID_N && pcy >= 0 && pcy < GRID_N) {
        const ptype = G.chunkGrid[pcy][pcx];
        if (ptype) G.chunkVisitedSet.add(ptype);
      }
      checkHiddenFloor();   // 每帧检查（cheap）
    }
    for (const arr of [G.obstacles, G.decor]) {
      for (const o of arr) {
        if (o.destroyed) continue;
        if (pl.x < o.x - 8 || pl.x > o.x + o.w + 8 || pl.y < o.y - 8 || pl.y > o.y + o.h + 8) continue;
        if (o.spr === 'coffee_machine' && pl._coffeeCd <= 0 && (o._coffeeCd || 0) <= 0 &&
            (o._coffeeUses || 0) < (TUNE.coffeeMachineUses || 4)) {
          const mh = maxHp(pl);
          const heal = TUNE.coffeeMachineHeal || 16;
          const shield = TUNE.coffeeMachineShield || 0;
          if (pl.hp < mh || (shield && (pl.shield || 0) < shield)) {
            const beforeHp = pl.hp;
            pl.hp = Math.min(mh, pl.hp + heal);
            const gained = Math.round(pl.hp - beforeHp);
            if (shield && gained < heal) {
              pl.shield = Math.max(pl.shield || 0, shield);
              pl.shieldT = Math.max(pl.shieldT || 0, 8);
            }
            o._coffeeUses = (o._coffeeUses || 0) + 1;
            o._coffeeCd = TUNE.coffeeMachineCd || 10;
            pl._coffeeCd = TUNE.coffeePlayerCd || .8;
            pl._coffeeUses = (pl._coffeeUses || 0) + 1;
            const left = Math.max(0, (TUNE.coffeeMachineUses || 4) - o._coffeeUses);
            const msg = gained > 0
              ? `☕ 咖啡 +${gained} HP${gained < heal && shield ? ` +${shield}盾` : ''}`
              : `☕ 咖啡 +${shield}盾`;
            addFloat(o.x, o.y - 16, `${msg}（余 ${left}）`, '#8a6a4a', 8, 1.2);
            addFx({ type: 'healfx', x: pl.x, y: pl.y - 4, r: 13, life: .38 });
            SFX.pickup();
          }
        } else if (o.spr === 'cooler') {
          /* 真·debuff 免疫：原来误用 ignoreDmgT（35% 免伤），对诅咒/减速毫无免疫作用 */
          pl.debuffImmuneT = Math.max(pl.debuffImmuneT || 0, 3);
          for (const k in pl.curses) pl.curses[k] = 0;
          pl.oaSlowT = 0;
        } else if (o.spr === 'sprinkler_head' && pl._sprinklerCd <= 0) {
          pl._sprinklerCd = 60;
          for (const u of G.units) {
            if (u.alive && !u.isPlayer && !u.isBoss) u.oaSlowT = Math.max(u.oaSlowT, 5);
          }
          addFloat(o.x, o.y - 16, '🚨 消防栓：全场减速 5s', '#ff6a6a', 9, 1.2);
          SFX.deny(); addShake(3);
        } else if (o.spr === 'printer' && !o._resumeUsed) {
          /* v2.0 §3.3 走过打印机 → 打一张"离职证明"，30% 召唤 HR 精英 */
          o._resumeUsed = true;
          if (Math.random() < .3) {
            spawnHR(o.x + o.w / 2 + rand(-40, 40), o.y + o.h / 2 + rand(-40, 40));
            addFloat(o.x, o.y - 16, '📃 离职证明打好了！HR 追来了', '#ff6a6a', 9, 1.4);
            warn('📃 你打了一张离职证明——HR 追来了！');
          } else addFloat(o.x, o.y - 16, '📃 只打了 A4 纸，无人问津', '#9aa4b5', 8, 1);
        } else if (o.spr === 'bulletin_board' && !o._tipShown && pl._bulletinCd <= 0) {
          /* v2.0 §3.3 公告板走过 → 随机 tip 提示 */
          pl._bulletinCd = 15;
          o._tipShown = true;
          const tips = [
            '📌 提示：桌子只挡子弹不挡人',
            '📌 提示：贴绿植 1.5 秒可以隐身',
            '📌 提示：碰到咖啡机可以喝一口回血，打爆还会掉回血光环',
            '📌 提示：老板保险柜里有传说 chip',
            '📌 提示：咖啡机不只在茶水区，开放办公区也能补血',
            '📌 提示：卡纸打印机需要打 3 次拿卡',
            '📌 提示：文件柜 5% 是上锁的（掉蒸馏）',
            '📌 提示：站上电梯呼叫一秒，开门即传送到另一台',
          ];
          const tip = pick(tips);
          addFloat(o.x, o.y - 16, tip, '#7ac8ff', 9, 3);
          setTimeout(() => { if (o) o._tipShown = false; }, 10000);
        } else if (o.spr === 'elevator') {
          /* v2.0 §3.3 电梯：站上去呼叫 1.2 秒即开门传送（全局每 45s 也会自动到站，计时在 propTick）
           * §6.3(3) 隐藏楼层：走过全 6 chunk 后下次电梯直接送去世界中心大宝藏堆 */
          if ((o._openT || 0) <= 0 && !pl._elevatorCd) {
            o._lastCallTouch = G.t;
            o._callT = (o._callT || 0) + dt;
            if (o._callT >= 1.2) {
              o._callT = 0; o._openT = 3;
              addFloat(o.x, o.y - 16, '🛗 叮！电梯开门了', '#38d3e8', 9, 1.2);
              SFX.pickup();
            } else if (Math.random() < dt * 2.5) {
              addFloat(o.x + o.w / 2, o.y - 12, '🛗 呼叫中…', '#38d3e8', 7, .5);
            }
          }
          if (o._openT > 0 && !pl._elevatorCd) {
            if (G.hiddenFloorUnlocked && !G.hiddenFloorConsumed) {
              /* 隐藏楼层：传送到世界中心 + 大宝藏堆 */
              G.hiddenFloorConsumed = true;
              const cx = TUNE.world / 2, cy = TUNE.world / 2;
              pl.x = cx; pl.y = cy;
              pl._elevatorCd = 5;
              /* 撒 8 件顶级 loot */
              const wids = Object.keys(WEAPONS);
              for (let i = 0; i < 8; i++) {
                const a = i * (Math.PI * 2 / 8), rr = 40;
                const dx = cx + Math.cos(a) * rr, dy = cy + Math.sin(a) * rr;
                if (i < 3) spawnChip(G, pick(wids), 3, dx, dy);          // 3 张 Lv.3 传说 chip
                else if (i < 6) spawnTech(G, pickTechId(), dx, dy, 3);   // 3 个 Ultra tech
                else G.pickups.push({ type: 'heal', amt: 50, x: dx, y: dy, bob: rand(0, 6) });
              }
              addFx({ type: 'boom', x: cx, y: cy, r: 120, color: '#ffcf33', life: 1.2 });
              warn('🗝️ 电梯抵达隐藏楼层！大宝藏堆等着你');
              addFeed('🗝️ 隐藏楼层解锁 · 8 件顶级 loot', true);
              SFX.fuse(); addShake(6);
            } else {
              /* 普通传送到另一台电梯 */
              const others = G.obstacles.filter(x => x.spr === 'elevator' && x !== o && !x.destroyed);
              if (others.length) {
                const target = pick(others);
                addFx({ type: 'teleportfx', x: pl.x, y: pl.y - 4, r: 16, life: .35 });
                pl.x = target.x + target.w / 2; pl.y = target.y + target.h / 2;
                pl._elevatorCd = 3;
                addFx({ type: 'teleportfx', x: pl.x, y: pl.y - 4, r: 16, life: .35 });
                addFloat(pl.x, pl.y - 16, '🛗 到楼了', '#38d3e8', 9, 1.4);
                SFX.dash();
              }
            }
          }
        }
      }
    }
    const searchable = { desk: .30, cabinet: .60, printer: .40, whiteboard: .15 };
    for (const o of G.obstacles) {
      if (o.destroyed || o.searched || !(o.spr in searchable)) continue;
      if (pl.x < o.x - 8 || pl.x > o.x + o.w + 8 || pl.y < o.y - 8 || pl.y > o.y + o.h + 8) continue;
      o.searched = true;
      const cx = o.sx + o.w / 2, cy = o.sy + o.h / 2;
      if (Math.random() < searchable[o.spr]) {
        spawnTech(G, pickTechId(), cx, cy, rollTier(false));
        addFloat(cx, cy - 20, '抽屉里翻到了模组', '#7ee08a', 8, 1.1);
        SFX.pickup();
      } else {
        addFloat(cx, cy - 20, pick(['抽屉全是外卖袋…', '一堆过期周报', '空的，白翻', '只有 A4 纸']), '#9aa4b5', 7, .8);
      }
    }
    /* decor 里 cabinet/printer 也可搜（有些 spawn 在 decor 里） */
    for (const o of G.decor) {
      if (o.destroyed || o.searched || !(o.spr in searchable)) continue;
      if (pl.x < o.x - 8 || pl.x > o.x + o.w + 8 || pl.y < o.y - 8 || pl.y > o.y + o.h + 8) continue;
      o.searched = true;
      const cx = o.sx + o.w / 2, cy = o.sy + o.h / 2;
      if (Math.random() < searchable[o.spr]) {
        spawnTech(G, pickTechId(), cx, cy, rollTier(false));
        addFloat(cx, cy - 20, '抽屉里翻到了模组', '#7ee08a', 8, 1.1);
        SFX.pickup();
      } else addFloat(cx, cy - 20, pick(['抽屉全是外卖袋…', '一堆过期周报', '空的，白翻']), '#9aa4b5', 7, .8);
    }
  }

  for (const u of G.units) if (u.alive) updateUnit(u, dt);

  /* 订书机炮台 / 消防警报喷淋装置 */
  for (const tr2 of G.turrets) {
    tr2.life -= dt; tr2.cd -= dt;
    if (!tr2.owner.alive) continue;
    if (tr2.kind === 'sprinkler') {
      /* 消防警报喷淋装置：持续小范围减速伤害区，敌人扎堆(8+)时额外触发一次全范围定身 */
      if (tr2.cd <= 0) {
        tr2.cd = .3;
        const r = SUBS.fire_sprinkler.radius[tr2.lv - 1];
        let n = 0;
        for (const t of G.units) {
          if (!isFoe(tr2.owner, t) || dist2(tr2.x, tr2.y, t.x, t.y) > r * r) continue;
          n++;
          applyDamage(t, SUBS.fire_sprinkler.dps[tr2.lv - 1] * tr2.owner.mods.dmg * .3, tr2.owner, { quiet: true });
          t.oaSlowT = Math.max(t.oaSlowT, .5);
        }
        if (n >= 8 && !(tr2.stunCd > 0)) {
          tr2.stunCd = 6;
          for (const t of G.units) if (isFoe(tr2.owner, t) && dist2(tr2.x, tr2.y, t.x, t.y) < r * r) t.stunT = Math.max(t.stunT, .8);
          if (nearPlayer(tr2.x, tr2.y)) addFloat(tr2.x, tr2.y - 16, '消防演习强制疏散！', '#6aa3ff', 8, 1);
        }
      }
      tr2.stunCd = (tr2.stunCd || 0) - dt;
      continue;
    }
    if (tr2.kind === 'knowledge_base') {
      if (tr2.cd <= 0) {
        const t = nearestUnit(tr2.x, tr2.y, tr2.kbRange || 230, o => isFoe(tr2.owner, o));
        if (t) {
          tr2.cd = tr2.kbShotCd || .65;
          if (tr2.owner.mods.__evoOutsourceEmpire) {
            t.vulnT = Math.max(t.vulnT || 0, .7);
            t.vulnBonus = Math.max(t.vulnBonus || 0, .12);
          }
          spawnBullet(tr2.owner, leadAim(tr2.x, tr2.y, t, 330),
            { x: tr2.x, y: tr2.y - 3, dmg: tr2.kbDmg || 8, spd: 330, range: tr2.kbRange || 230,
              shape: 'dot', color: '#9ad1ff', _echo: true, pierce: tr2.owner.mods.__evoOutsourceEmpire ? 1 : 0 });
        } else tr2.cd = .35;
      }
      continue;
    }
    /* v18 新增：主武器 totem 类炮台——每 shotCd 自动索敌开火 */
    if (tr2.kind === 'totem') {
      if (tr2.cd <= 0) {
        const t = nearestUnit(tr2.x, tr2.y, tr2.totemRange || 190, o => isFoe(tr2.owner, o));
        if (t) {
          tr2.cd = tr2.totemShotCd;
          spawnBullet(tr2.owner, leadAim(tr2.x, tr2.y, t, 430),
            { x: tr2.x, y: tr2.y - 3, dmg: tr2.totemDmg, spd: 430, range: (tr2.totemRange || 190) * 1.2,
              shape: 'dot', color: '#67c98b', _echo: true });
        } else tr2.cd = .3;
      }
      continue;
    }
    /* v2.0 十倍交付机自动化节点：同 totem 但用节点定义 */
    if (tr2.kind === 'delivery_node') {
      if (tr2.cd <= 0) {
        const t = nearestUnit(tr2.x, tr2.y, tr2.nodeRange || 260, o => isFoe(tr2.owner, o));
        if (t) {
          tr2.cd = tr2.nodeShotCd || .6;
          spawnBullet(tr2.owner, leadAim(tr2.x, tr2.y, t, 340),
            { x: tr2.x, y: tr2.y - 3, dmg: tr2.nodeDmg, spd: 340, range: tr2.nodeRange || 260,
              shape: 'streak', color: '#e8825a', _echo: true, pierce: 1 });
        } else tr2.cd = .3;
      }
      continue;
    }
    if (tr2.cd <= 0) {
      const t = nearestUnit(tr2.x, tr2.y, 170, o => isFoe(tr2.owner, o));
      if (t) {
        tr2.cd = .7;
        spawnBullet(tr2.owner, leadAim(tr2.x, tr2.y, t, 320),
          { x: tr2.x, y: tr2.y - 3, dmg: (tr2.shotDmg ?? SUBS.stapler.shot[tr2.lv - 1]) * tr2.owner.mods.dmg,
            spd: 320, range: 190, shape: 'dot', color: '#c9c4b4', _echo: true });
      }
    }
  }
  G.turrets = G.turrets.filter(t => t.life > 0);

  updateProjs(dt);
  updatePickups(dt);

  /* 花名册点对点连坐：锁链超距拉扯撞击，50%伤害互相同步 */
  for (const u of G.units) {
    if (!u.alive || !u.linkedTo || u.linkedT <= 0) { u.linkedTo = null; continue; }
    u.linkedT -= dt;
    const b = u.linkedTo;
    if (!b.alive || b.linkedTo !== u) { u.linkedTo = null; u.linkedT = 0; continue; }
    if (u === (u.x < b.x ? u : b)) {   // 每对只处理一次（按x坐标固定谁来算）
      const d = dist(u.x, u.y, b.x, b.y), maxD = 140;
      if (d > maxD) {
        const a = Math.atan2(b.y - u.y, b.x - u.x);
        const pull = (d - maxD) * .5;
        u.x += Math.cos(a) * pull; u.y += Math.sin(a) * pull;
        b.x -= Math.cos(a) * pull; b.y -= Math.sin(a) * pull;
        applyDamage(u, pull * .8, b, { quiet: true }); applyDamage(b, pull * .8, u, { quiet: true });
      }
    }
    if (u.linkedT <= 0) u.linkedTo = null;
  }
  /* 会议室预定表 / 健身环挑战：区域内敌人扎堆时互相碰撞眩晕 */
  for (const bz of G.burns) {
    if (!bz.roomTrap && !bz.ringStun) continue;
    bz.stunCd = (bz.stunCd || 0) - dt;
    if (bz.stunCd > 0) continue;
    const trapped = G.units.filter(t => t.alive && isFoe(bz.owner, t) && dist2(t.x, t.y, bz.x, bz.y) < bz.r * bz.r);
    if (trapped.length >= (bz.ringStun ? 1 : 2)) {
      bz.stunCd = .5;
      for (const t of trapped) t.stunT = Math.max(t.stunT, .5);
    }
  }
  /* v18: proc 毒 dot——每秒 tick 一次 */
  for (const u of G.units) {
    if (u.poisonT > 0 && u.alive) {
      u.poisonT -= dt;
      u.poisonTickT = (u.poisonTickT || 0) - dt;
      if (u.poisonTickT <= 0) {
        u.poisonTickT = 1;
        applyDamage(u, u.poisonDps, u.poisonOwner || u, { quiet: true, fromProc: true });
      }
      if (u.poisonT <= 0) u.poisonDps = 0;
    }
  }
  /* v18 新增：mine 类主武器地雷——burn 记录武装+触发 */
  for (const bz of G.burns) {
    if (bz.mineDmg === undefined) continue;
    if (!bz.mineArmed) {
      bz.mineArmedT = (bz.mineArmedT || 0) + dt;
      if (bz.mineArmedT >= bz.mineFuseT) bz.mineArmed = true;
      continue;
    }
    // 已武装：检测敌人踩到触发圈
    const stepper = G.units.find(t => t.alive && isFoe(bz.owner, t) && dist2(t.x, t.y, bz.x, bz.y) < bz.r * bz.r);
    if (stepper) {
      bz.t = bz.life;   // 标记为需要移除
      explodeAt(bz.x, bz.y, bz.mineExplR, bz.mineDmg, bz.owner, bz.color);
    }
  }
  for (const b of G.burns) b.t += dt;
  G.burns = G.burns.filter(b => b.t < b.life);
  for (const f of G.fx) f.t += dt;
  G.fx = G.fx.filter(f => f.t < f.life);
  for (const p of G.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .92; p.vy *= .92; }
  G.parts = G.parts.filter(p => p.t < p.life);
  for (const f of G.floats) { f.t += dt; f.y -= 14 * dt; }
  G.floats = G.floats.filter(f => f.t < f.life);

  const pl = G.player;
  cam.x = clamp(pl.x - VIEW_W / 2, 0, TUNE.world - VIEW_W);
  cam.y = clamp(pl.y - VIEW_H / 2, 0, TUNE.world - VIEW_H);
  cam.shake = Math.max(0, cam.shake - dt * 18);

  endChecks(dt);
  if (state === 'playing' && G.pendingLevels > 0 && pl.alive && G.winT === undefined && G.endT <= 0) openLevelup();
}

function updateUnit(u, dt) {
  /* 速度记录（预判射击用） */
  if (dt > 0) {
    u._vx = (u.x - (u._px ?? u.x)) / dt; u._vy = (u.y - (u._py ?? u.y)) / dt;
    u._px = u.x; u._py = u.y;
  }
  u.hurtT -= dt; u.invulnT -= dt; u.stunT -= dt;
  /* 通用限时状态衰减 */
  if (u.debuffImmuneT > 0) { u.debuffImmuneT -= dt; u.oaSlowT = 0; u.reportedT = Math.min(u.reportedT, 0); }
  if (u.noSplitT > 0) u.noSplitT -= dt;
  if (u.noRecallT > 0) u.noRecallT -= dt;
  if (u._muteWide) {   // 强制静音的碰撞体积增大是临时的：到时还原，不再永久叠乘
    u.muteWidenT -= dt;
    if (u.muteWidenT <= 0) { u._muteWide = false; u.r /= 1.3; }
  }
  u.buffs.spdT -= dt; u.buffs.fireT -= dt; u.buffs.dmgT -= dt;
  u.dashT -= dt;
  u.empowerT -= dt; u.reportedT -= dt; u.vulnT -= dt;
  if (u.vulnT <= 0 && u.vulnBonus) u.vulnBonus = 0;   // 易伤加成随易伤到期归零：原来只增不减，Boss 吃过一次高档易伤就永久按最高档结算
  u.reviewBoostT -= dt; u.oaSlowT -= dt;
  if (u.shield > 0) { u.shieldT -= dt; if (u.shieldT <= 0) u.shield = 0; }
  for (const k in u.curses) if (u.curses[k] > 0) u.curses[k] -= dt;
  /* OA审批流公文包：命中后延迟0.8秒引爆叠加伤害（任意单位都可能中招，通用结算） */
  if (u.oaBurstT > 0) {
    u.oaBurstT -= dt;
    if (u.oaBurstT <= 0 && u.alive) applyDamage(u, u.oaBurstDmg, u.oaBurstOwner, { quiet: true });
  }
  /* 在线状态徽章：被"已读"标记的敌人延迟引爆 */
  if (u.badgeMarkT > 0) {
    u.badgeMarkT -= dt;
    if (u.badgeMarkT <= 0 && u.alive && u.badgeMarkOwner) applyDamage(u, wpnDmg(u.badgeMarkOwner) * .5 * (u.badgeMarkMul || 1), u.badgeMarkOwner, { quiet: true });   // Lv3"引爆伤害提升"之前无效
  }

  /* 系统提示：自动补盾（补盾量随品级） */
  if (u.mods.sysPrompt) {
    u.sysT -= dt;
    if (u.sysT <= 0) {
      u.sysT = 45;
      if (u.shield < u.mods.sysPrompt) {
        u.shield = u.mods.sysPrompt; u.shieldT = 10;
        if (u.isPlayer) addFloat(u.x, u.y - 16, '系统提示：自动补盾', '#e8e4d8', 7, .8);
      }
    }
  }
  /* 人设状态机：对所有单位调用——politicsT（办公室政治内耗标记）挂在敌人身上倒计时，
   * 原来只对玩家调用导致标记永不引爆，这张白卡满5层也完全无效 */
  updatePersonaSkills(u, dt);
  /* 大模型蒸馏技能自动施放 / 副武器 / 主动技能冷却 */
  if (u.isPlayer) {
    if (u.distills) updateDistills(u, dt);
    updateSubs(u, dt);
    u.activeCd -= dt;
    u.activeQCd -= dt; u.activeECd -= dt;
    /* 版本回滚快照：每 0.5s 记一次，保留 3 秒滑窗（6 个快照） */
    u._histT = (u._histT || 0) - dt;
    if (u._histT <= 0) {
      u._histT = .5;
      u.history.unshift({ x: u.x, y: u.y, hp: u.hp, t: G.t });
      if (u.history.length > 8) u.history.length = 8;
    }
  }
  /* RAG 知识库炮台 */
  if (u.mods.rag) {
    u.ragAng += dt * 2.6;
    for (let i = 0; i < u.mods.rag; i++) {
      u.ragCds[i] -= dt;
      if (u.ragCds[i] > 0) continue;
      const da = u.ragAng + i * Math.PI;
      const dx = u.x + Math.cos(da) * 27, dy = u.y - 5 + Math.sin(da) * 27;
      const t = nearestUnit(dx, dy, 140, o => isFoe(u, o));
      if (t) {
        u.ragCds[i] = 1.0;
        spawnBullet(u, Math.atan2(t.y - dy, t.x - dx),
          { x: dx, y: dy, dmg: (6 + u.level * .5) * u.mods.dmg * u.mods.ragBoost, spd: 300, range: 180,
            color: '#67c98b', shape: 'dot', _echo: true });
      }
    }
  }
  /* 策反到期 */
  if (u.allyOwner && G.t > u.allyUntil) {
    if (u.opcSummon) recordOpcRetirement(u.allyOwner, u, false);
    u.allyOwner = null;
    killUnit(u, null, 'inject');
    return;
  }
  /* 职场毒瘤光环 */
  if (u.mods.auraDmg) {
    u.auraT -= dt;
    if (u.auraT <= 0) {
      u.auraT = .5;
      for (const t of G.units)
        if (isFoe(u, t) && dist2(u.x, u.y, t.x, t.y) < 100 * 100)
          applyDamage(t, u.mods.auraDmg * .5, u, { quiet: true });
    }
  }
  if (u.mods.standRegen && u.standT > 1 && u.hp < maxHp(u))
    u.hp = Math.min(maxHp(u), u.hp + u.mods.standRegen * dt);
  if (u.mods.xpPerSec) gainXp(u, u.mods.xpPerSec * dt);

  /* 圈外伤害（试用期豁免：发育期不设跑毒压力） */
  const z = G.zone;
  if (!G.trial.active && dist(u.x, u.y, z.cx, z.cy) > z.r) {
    u.zoneAcc = (u.zoneAcc || 0) + z.dps * dt;
    if (u.zoneAcc >= 1) {
      const d = u.zoneAcc; u.zoneAcc = 0;
      applyDamage(u, d, null, { cause: 'zone', quiet: !u.isPlayer });
    }
  }
  /* 燃烧区：伤害 / 治疗光环 / 红线拉齐 */
  for (const bz of G.burns) {
    /* 治疗光环（咖啡飘香 dps<0）：只治主人阵营。原来负 dps 走敌方燃烧累计——既治不了任何人，
     * 还把敌人的 burnAcc 拖成负数抵消后续真燃烧伤害 */
    if (bz.dps < 0) {
      if ((u === bz.owner || (bz.owner && u.allyOwner === bz.owner)) && u.hp < maxHp(u)
          && dist2(u.x, u.y, bz.x, bz.y) < bz.r * bz.r)
        u.hp = Math.min(maxHp(u), u.hp - bz.dps * dt);
      continue;
    }
    /* 红线拉齐：敌人贴近红线段每 0.5s 结算一次——redline 载荷原来无任何消费者，大招只有特效没伤害 */
    if (bz.redline && isFoe(bz.owner, u)
        && distToSeg(u.x, u.y, bz.redline.x1, bz.redline.y1, bz.redline.x2, bz.redline.y2) < u.r + 7
        && (u._redlineLast ?? -9) < G.t - .5) {
      u._redlineLast = G.t;
      applyDamage(u, bz.redline.dmg, bz.owner, { quiet: false });
    }
    if (bz.dps > 0 && isFoe(bz.owner, u) && dist2(u.x, u.y, bz.x, bz.y) < bz.r * bz.r) {
      u.burnAcc = (u.burnAcc || 0) + bz.dps * dt;
      if (u.burnAcc >= 2) { const d = u.burnAcc; u.burnAcc = 0; applyDamage(u, d, bz.owner, { cause: 'burn', quiet: true }); }
    }
  }
  if (!u.alive) return;

  if (u.isBoss) { updateBoss(u, dt); return; }
  if (u.isElite) { updateElite(u, dt); return; }
  if (u.isSummon) { updateSummon(u, dt); return; }
  if (u.isMob) { updateMob(u, dt); return; }

  let mvx = 0, mvy = 0, wantFire = false, aimA = u.aim;
  if (u.isPlayer) {
    if (keys.has('KeyW') || keys.has('ArrowUp')) mvy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) mvy += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mvx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mvx += 1;
    const m = Math.hypot(mvx, mvy);
    if (m > 0) { mvx /= m; mvy /= m; }
    if (touch.using) {
      /* 触屏：摇杆移动 + 自动瞄准 + 自动开火 */
      if (touch.active) {
        mvx = touch.dx; mvy = touch.dy;
        const tm = Math.hypot(mvx, mvy);
        if (tm > 1) { mvx /= tm; mvy /= tm; }
      }
      const def = wdef(u);
      const rng = Math.max(190, (def.range || 220) * 1.15);
      const tgt = nearestUnit(u.x, u.y, rng, o => isFoe(u, o));
      touch.aimTarget = tgt;
      if (tgt) {
        aimA = Math.atan2(tgt.y - u.y, tgt.x - u.x);
        wantFire = def.kind === 'charge' ? u.weapon.charge < def.chargeT - .01 : true;
      } else {
        wantFire = def.kind === 'charge' && u.weapon.charging;
      }
    } else {
      aimA = Math.atan2(mouse.y + cam.y - u.y, mouse.x + cam.x - u.x);
      const def = wdef(u);
      if (fireMode === 2 && !mouse.down) {
        /* 全托管：自动瞄准最近敌人 + 自动开火（按住鼠标可临时手动接管） */
        const rng = Math.max(190, (def.range || 220) * 1.15);
        const tgt = nearestUnit(u.x, u.y, rng, o => isFoe(u, o));
        touch.aimTarget = tgt;
        if (tgt) {
          aimA = leadAim(u.x, u.y, tgt, def.spd || 0);   // 全托管自瞄带移动预判
          wantFire = def.kind === 'charge' ? u.weapon.charge < def.chargeT - .01 : true;
        } else {
          wantFire = def.kind === 'charge' && u.weapon.charging;
        }
      } else if (fireMode === 1) {
        /* 自动开火：瞄准仍靠鼠标，附近有敌人就自动扣扳机 */
        touch.aimTarget = null;
        const rng = Math.max(220, (def.range || 220) * 1.2);
        const hasFoe = !!nearestUnit(u.x, u.y, rng, o => isFoe(u, o));
        if (mouse.down) wantFire = true;
        else if (hasFoe) wantFire = def.kind === 'charge' ? u.weapon.charge < def.chargeT - .01 : true;
        else wantFire = def.kind === 'charge' && u.weapon.charging;
      } else {
        touch.aimTarget = null;
        wantFire = mouse.down;
      }
    }
  } else {
    const r = botThink(u, dt);
    mvx = r.mvx; mvy = r.mvy; wantFire = r.wantFire; aimA = r.aimA;
  }
  /* 诅咒对瞄准的影响 */
  if (u.curses.hallu > 0) aimA += Math.sin(G.t * 11 + u.x * .07) * .28;
  if (u.curses.repeat > 0) aimA = u.repeatAim;
  moveWithCollide(u, mvx, mvy, dt);
  updateWeapon(u, dt, wantFire, aimA);
  /* v2.3 双持：副手武器与主武器同角度同时开火（55% 伤害，见 wpnDmg 的 _offhand） */
  if (u.isPlayer && u.weapon2) {
    const main = u.weapon;
    u.weapon = u.weapon2; u._offhand = true;
    updateWeapon(u, dt, wantFire, aimA);
    u.weapon = main; u._offhand = false;
  }
}

function moveWithCollide(u, mx, my, dt) {
  if (u.stunT > 0) { mx = 0; my = 0; }
  const sp = speedOf(u);
  let vx = mx * sp, vy = my * sp;
  if (u.dashDur > 0) { vx += u.dashVx; vy += u.dashVy; u.dashDur -= dt; }
  const moving = Math.abs(vx) + Math.abs(vy) > 5;
  if (moving) { u.walkT += dt * 9; u.standT = 0; } else u.standT += dt;
  /* 摸鱼表演艺术家：移动/闲置状态追踪（线上响应术/假装忙碌/永动摸鱼引擎共用） */
  if (u.isPlayer) {
    u.isMoving = moving;
    if (moving) { u.moveT += dt; u.idleT = 0; } else { u.idleT += dt; u.moveT = 0; }
    if (u.mods.perpetualSlack && moving) {
      const dist = Math.min(Math.hypot(vx, vy) * dt, u.spdBase * 1.2 * dt);   // 每秒最多累计正常移速×1.2，防瞬移刷值
      u.slackMiles = (u.slackMiles || 0) + dist;
    }
  }
  /* v2.0 掩体核心机制：家具不挡人（穿过），wall/safe 挡人 · 轴分离滑动碰撞：
   *   撞墙后 X 分量被拦仍能保留 Y 分量，让 mob 能沿墙滑到门缺口进入房间，而不是贴墙原地打转 */
  const hitWall = (x, y) => {
    for (const o of G.obstacles) {
      if (o.destroyed) continue;
      if (o.spr !== 'wall' && o.spr !== 'safe') continue;
      const nx = clamp(x, o.x, o.x + o.w), ny = clamp(y, o.y, o.y + o.h);
      const dx = x - nx, dy = y - ny;
      if (dx * dx + dy * dy < u.r * u.r) return true;
    }
    return false;
  };
  const nx = u.x + vx * dt, ny = u.y + vy * dt;
  if (!hitWall(nx, ny)) { u.x = nx; u.y = ny; }
  else {
    /* 试探单轴：只 X / 只 Y —— 允许"沿墙滑" */
    if (!hitWall(nx, u.y)) u.x = nx;
    else if (!hitWall(u.x, ny)) u.y = ny;
    /* 两轴都被挡：完全静止（原地贴墙）*/
  }
  u.x = clamp(u.x, 8, TUNE.world - 8);
  u.y = clamp(u.y, 12, TUNE.world - 6);
}

/* ---------- 机器人 AI ---------- */
function botThink(u, dt) {
  const b = u.bot, z = G.zone;
  b.decideT -= dt; b.provokedT -= dt;
  const distZone = dist(u.x, u.y, z.cx, z.cy);

  if (b.decideT <= 0) {
    b.decideT = rand(.25, .45);
    if (distZone > z.r - 50) {
      b.state = 'tozone';
      const a = Math.atan2(z.cy - u.y, z.cx - u.x) + rand(-.4, .4);
      const d = Math.max(80, distZone - z.r * .45);
      b.wx = u.x + Math.cos(a) * d; b.wy = u.y + Math.sin(a) * d;
    } else {
      /* v2.0 · 分型感知半径：卷王/救火最大，关系户/向上最小 */
      let baseAggro =
        b.pers === 'juan' ? 260 :
        b.pers === 'firefighter' ? 250 :
        b.pers === 'outsource' ? 220 :
        b.pers === 'norm' ? 190 :
        b.pers === 'veteran' ? 160 :
        b.pers === 'uptalk' ? 130 :
        b.pers === 'crony' ? 120 :
        140;
      /* v2.0 §3.5 停电事件："导航失效" · 3s 内 bot 索敌半径归零 */
      if (G.blackoutActiveT > 0) baseAggro = 0;
      /* 仇恨爬坡按战斗时间算：转正日空降的同事同样有热身期 */
      const ramp = Math.min(1, .1 + Math.max(0, combatT()) / 120);
      const aggroR = baseAggro * ramp * (1 + .15 * z.phase);
      let tgt = null, bd = Infinity;
      if (G.trial.active) {
        /* 试用期：机器人也去刷怪（杂鱼和月度考核 Boss） */
        tgt = nearestUnit(u.x, u.y, 320, t => (t.isMob || t.isElite) && t.alive);
        if (tgt) bd = dist2(u.x, u.y, tgt.x, tgt.y);
      } else {
        /* 被打小报告的人吸引全场仇恨（小报告是群发的，感知半径与索敌无关） */
        /* 允许"被点名"的精英吸引全场仇恨——chased 词条与甩锅群发都靠这个生效 */
        const snitched = nearestUnit(u.x, u.y, Math.max(450, aggroR * 2), t =>
          t.reportedT > 0 && isFoe(u, t) && !t.isBoss);
        if (snitched) { tgt = snitched; bd = dist2(u.x, u.y, snitched.x, snitched.y); }
        else for (const t of G.units) {
          if (!isFoe(u, t)) continue;
          if (u.isHR && (t.isBoss || t.isHR)) continue;
          /* v2.0 T3 隐蔽：玩家隐身时 bot 不索敌（除非 bot 已经贴脸 60px 内 = 撞见）*/
          if (t.isPlayer && t.hiddenT > 0 && dist2(u.x, u.y, t.x, t.y) > 60 * 60) continue;
          const dr = aggroR * (t.isBoss ? .75 : t.mods.aggro);
          const d2 = dist2(u.x, u.y, t.x, t.y);
          if (d2 < dr * dr && d2 < bd) { bd = d2; tgt = t; }
        }
      }
      const provoked = !G.trial.active && b.provokedT > 0 && u.lastAtk && u.lastAtk.alive && isFoe(u, u.lastAtk);
      if (!tgt && provoked) { tgt = u.lastAtk; bd = dist2(u.x, u.y, tgt.x, tgt.y); }
      const dogpile = (G.trial.active && !!tgt) || (!!tgt && tgt.reportedT > 0);   // 试用期刷怪/被举报者：豁免出手门槛

      /* v2.0 分型专属决策先行 */
      /* 救火队长：优先追公共事故（KPI 机会） */
      if (b.pers === 'firefighter' && !G.trial.active) {
        const incident = nearestUnit(u.x, u.y, 420, t => t.publicIncident && t.alive);
        if (incident) { b.state = 'fight'; b.target = incident; tgt = incident; bd = dist2(u.x, u.y, incident.x, incident.y); }
      }
      /* v2.0 §3.5 加班通知：所有 bot 集火"离 boss 最近的非 boss/HR 目标"6 秒 */
      if (G.overtimeActiveT > 0 && G.boss && G.boss.alive) {
        let closestToBoss = null, dBest = Infinity;
        for (const t of G.units) {
          if (!t.alive || t.isBoss || t.isHR) continue;
          const d = dist2(t.x, t.y, G.boss.x, G.boss.y);
          if (d < dBest) { dBest = d; closestToBoss = t; }
        }
        if (closestToBoss && isFoe(u, closestToBoss)) {
          tgt = closestToBoss; bd = dist2(u.x, u.y, tgt.x, tgt.y);
          b.state = 'fight'; b.target = tgt;
        }
      }
      /* 关系户：贴最近 Boss/精英，让别人打，只在很近距离才开火 */
      if (b.pers === 'crony' && !G.trial.active) {
        const patron = nearestUnit(u.x, u.y, 500, t => (t.isBoss || t.eliteTier === 2) && t.alive && !isFoe(u, t));
        if (patron) {
          const a = Math.atan2(u.y - patron.y, u.x - patron.x);
          b.wx = patron.x + Math.cos(a) * 100; b.wy = patron.y + Math.sin(a) * 100;
          b.state = 'crony'; b.target = tgt;
        }
      }
      /* 向上管理：贴最近带 dmg buff 的强者，蹭光环 */
      if (b.pers === 'uptalk' && !G.trial.active) {
        const patron = nearestUnit(u.x, u.y, 500, t => t.bot && t.alive && (t.buffs?.dmgM || 1) > 1.05 && t !== u);
        if (patron) {
          b.wx = patron.x + rand(-50, 50); b.wy = patron.y + rand(-50, 50);
          b.state = 'uptalk'; b.target = tgt;
        }
      }
      /* 老油条：目标 HP > 70% 时不打（等别人磨），只补刀残血 */
      if (b.pers === 'veteran' && tgt && tgt.hp / maxHp(tgt) > .7) {
        tgt = null; bd = Infinity;
      }
      /* 外包：多人成群，找同型队友跟随 */
      if (b.pers === 'outsource' && !tgt) {
        const buddy = nearestUnit(u.x, u.y, 300, t => t.bot && t.bot.pers === 'outsource' && t.alive && t !== u);
        if (buddy) { b.wx = buddy.x + rand(-40, 40); b.wy = buddy.y + rand(-40, 40); b.state = 'swarm'; }
      }

      if (tgt && !G.trial.active && z.phase < 3 && ((b.pers === 'moyu' && !provoked && !dogpile) || (u.hp < maxHp(u) * .3 && b.pers !== 'juan'))) {
        /* 摸鱼怪见人就溜；残血也跑；决赛圈背水一战 */
        b.state = 'flee'; b.target = tgt;
        const a = Math.atan2(u.y - tgt.y, u.x - tgt.x) + rand(-.4, .4);
        b.wx = clamp(u.x + Math.cos(a) * 150, z.cx - z.r * .85, z.cx + z.r * .85);
        b.wy = clamp(u.y + Math.sin(a) * 150, z.cy - z.r * .85, z.cy + z.r * .85);
      } else if (tgt && (dogpile || b.pers === 'juan' || provoked || (bd < 85 * 85 && combatT() >= 30) || z.phase >= 2)) {
        b.state = 'fight'; b.target = tgt;
        if (!b.strafe || Math.random() < .3) b.strafe = Math.random() < .5 ? 1 : -1;
        const ideal = (wdef(u).range || 200) * .6;
        const ta = Math.atan2(u.y - tgt.y, u.x - tgt.x) + b.strafe * .8;
        b.wx = tgt.x + Math.cos(ta) * ideal;
        b.wy = tgt.y + Math.sin(ta) * ideal;
        /* v2.0 · 分型用掩体：非"卷王/救火"分型有几率寻最近 T1 掩体躲进去
         * 覆盖当前 wx/wy，让 bot 移动路径指向掩体后方 */
        const usesCover = { juan: 0, firefighter: .3, outsource: .3, norm: .5, moyu: .8, veteran: .85, crony: .9, uptalk: .95 };
        const p = usesCover[b.pers] || .5;
        if (Math.random() < p * .35) {   // 每次决策 35% * p 概率去找掩体
          let bestCover = null, bestScore = Infinity;
          for (const o of G.obstacles) {
            if (o.destroyed || o.cover !== 'T1') continue;
            const cx = o.sx + o.w / 2, cy = o.sy + o.h / 2;
            /* 掩体应在 bot 和 target 之间（相对 target 更远） */
            const dToBot = dist2(cx, cy, u.x, u.y);
            const dToTgt = dist2(cx, cy, tgt.x, tgt.y);
            if (dToBot > 220 * 220 || dToTgt < dToBot) continue;
            /* 优先近 + 侧面（strafe 方向）*/
            const score = dToBot + dToTgt * .3;
            if (score < bestScore) { bestScore = score; bestCover = { cx, cy }; }
          }
          if (bestCover) {
            /* 目标点：掩体后方（远离敌人方向）*/
            const away = Math.atan2(bestCover.cy - tgt.y, bestCover.cx - tgt.x);
            b.wx = bestCover.cx + Math.cos(away) * 24;
            b.wy = bestCover.cy + Math.sin(away) * 24;
            b.state = 'cover';
          }
        }
      } else {
        b.target = null;
        let pk = null, pd = 280 * 280;
        if (!u.isHR) {
          for (const p of G.pickups) {
            if (p.type !== 'chip' && p.type !== 'item' && p.type !== 'tech') continue;
            if (p.type === 'chip') {
              if (u.weapon.leg) continue;
              const w = u.weapon;
              const useful = (p.id === w.id && w.lvl < 5) || p.lvl > w.lvl ||
                (w.lvl === 5 && findRecipe(w.id, p.id));
              if (!useful) continue;
            }
            if (p.type === 'tech') {
              const t = TECH[p.id];
              if (!t.instant && (u.tech[p.id] || 0) >= t.max) continue;
              if (PLAYER_ONLY_TECH.includes(p.id)) continue;
            }
            const d2 = dist2(u.x, u.y, p.x, p.y);
            if (d2 < pd && dist(p.x, p.y, z.cx, z.cy) < z.r * .95) { pd = d2; pk = p; }
          }
        }
        if (pk) { b.state = 'loot'; b.wx = pk.x; b.wy = pk.y; }
        else if (b.state !== 'wander' || dist2(u.x, u.y, b.wx, b.wy) < 30 * 30) {
          b.state = 'wander';
          const p = randPosInZone(G, .7);
          b.wx = p.x; b.wy = p.y;
        }
      }
    }
  }

  const dx = b.wx - u.x, dy = b.wy - u.y, dd = Math.hypot(dx, dy);
  let mvx = 0, mvy = 0;
  if (dd > 6) { mvx = dx / dd; mvy = dy / dd; }

  let wantFire = false, aimA = u.aim;
  const tgt = b.target;
  if (tgt && tgt.alive) {
    const def = wdef(u), d = dist(u.x, u.y, tgt.x, tgt.y);
    aimA = Math.atan2(tgt.y - u.y, tgt.x - u.x) + rand(-b.aimErr, b.aimErr);
    const inRange = d < (def.range || 220) * 1.05;
    if (def.kind === 'charge') {
      if (b.chargeHold > 0) { b.chargeHold -= dt; wantFire = true; }
      else if (inRange && u.weapon.cd <= 0 && !u.weapon.charging) b.chargeHold = rand(.4, 1.1);
    } else {
      /* 开火节律：打打停停，不做永动压枪机器 */
      wantFire = inRange && Math.sin(G.t * 1.7 + u.x * .13) > -.35;
    }
  } else b.target = null;
  return { mvx, mvy, wantFire, aimA };
}

/* ---------- 缩圈（时间轴从试用期结束后起算） ---------- */
function updateZone(dt) {
  if (G.trial.active) return;
  const bt = combatT();   // 战斗时间（从试用期实际结束起算）
  const z = G.zone, phases = G.zonePhases;   // 试用期越长时间轴越前移（割草流清场快）
  if (z.phase < phases.length && bt >= phases[z.phase].at) {
    const p = phases[z.phase];
    z.shrinking = true; z.shrinkT = 0;
    z.fromR = z.r; z.toR = TUNE.zoneR0 * p.pct;
    z.fromCx = z.cx; z.fromCy = z.cy;
    /* v2.0 Phase F Gap 3：最后一次 shrink 收敛到 boss chunk 中心（design §5.4 终局设定）
     * 判定 "最后一次"：当前正准备进入的 phase 是 zonePhases 最后一个 */
    const isFinalPhase = z.phase === phases.length - 1;
    let bossChunkCenter = null;
    if (isFinalPhase && G.chunkGrid) {
      for (let cy = 0; cy < GRID_N && !bossChunkCenter; cy++) {
        for (let cx = 0; cx < GRID_N && !bossChunkCenter; cx++) {
          if (G.chunkGrid[cy][cx] === 'boss') {
            bossChunkCenter = { x: cx * CHUNK_STRIDE + CHUNK_SIZE / 2, y: cy * CHUNK_STRIDE + CHUNK_SIZE / 2 };
          }
        }
      }
    }
    if (bossChunkCenter) {
      z.toCx = clamp(bossChunkCenter.x, z.toR + 60, TUNE.world - z.toR - 60);
      z.toCy = clamp(bossChunkCenter.y, z.toR + 60, TUNE.world - z.toR - 60);
      addFeed('🎯 终局圈收敛到老板办公室', true);
    } else {
      const drift = (z.fromR - z.toR) * .4;
      const a = rand(0, Math.PI * 2);
      z.toCx = clamp(z.cx + Math.cos(a) * drift, z.toR + 60, TUNE.world - z.toR - 60);
      z.toCy = clamp(z.cy + Math.sin(a) * drift, z.toR + 60, TUNE.world - z.toR - 60);
    }
    z.dps = p.dps;
    warn(COPY.zoneWarnings[Math.min(z.phase, COPY.zoneWarnings.length - 1)]);
    SFX.zone();
    z.phase++;
    if (z.phase >= 2) unlockSubSlot();   // 0个月试用期兜底路径：转正路径打不到时靠缩圈进度解锁
    /* 开放式大平层：不再按 chunk 类型关闭"房间"。危险只来自常规缩圈。 */
    /* 缩圈绩效结算：把成长决策钉在缩圈节拍上，治后期升级断档 */
    if (G.player.alive) {
      gainXp(G.player, 15 * z.phase);
      addFloat(G.player.x, G.player.y - 22, `绩效结算 +${15 * z.phase} 经验`, '#ffe27a', 8, 1.2);
    }
  }
  if (z.shrinking) {
    z.shrinkT += dt;
    const t = Math.min(1, z.shrinkT / TUNE.shrinkDur);
    z.r = lerp(z.fromR, z.toR, t);
    z.cx = lerp(z.fromCx, z.toCx, t);
    z.cy = lerp(z.fromCy, z.toCy, t);
    if (t >= 1) z.shrinking = false;
  }
}

/* ---------- Boss：老板 ---------- */
function spawnBoss() {
  const z = G.zone;
  /* 血量锚定玩家战力指数：时机插值 + 等级 + 模组/副武器/蒸馏/传说全部计入，
     强 build 不再把终局 Boss 打成过场动画 */
  const pl = G.player;
  const techN = Object.values(pl.tech).reduce((a, b) => a + b, 0);
  const subN = Object.values(pl.subs).reduce((a, s) => a + s.lv, 0);
  const dstN = pl.distills ? Object.keys(pl.distills).length : 0;
  const bt = Math.max(0, combatT());
  /* 血量抬升 + dstN 乘算段：让满 build 玩家真的能吃到"半血狂暴"阶段
   * （原设计：60/90/120/150 系数下满配 hp≈4360，玩家 DPS≈2000 → 狂暴总时长 1-2 秒被踩过）
   * v18 修正：techN/subN/dstN 60→180/90→220/120→280；再叠 (1+0.15×dstN) 乘算段，
   * 让蒸馏堆得越多 Boss 越难，形成"越强越危险"的反馈 */
  const hp = Math.round((900
    + 600 * Math.min(1, Math.max(bt / TUNE.bossAt, pl.level / 15))
    + 60 * pl.level + 180 * techN + 220 * subN + 280 * dstN
    + (pl.weapon.leg ? 400 : 0))
    * (1 + 0.15 * dstN));
  const b = makeUnit('老板', clamp(z.cx + rand(-100, 100), 60, TUNE.world - 60),
    clamp(z.cy + rand(-100, 100), 60, TUNE.world - 60),
    { isBoss: true, hp, spd: 55 });
  b.r = 10; b.level = 10; b.spdBase = 55;
  b.bossAI = { pieT: 2.5, burstT: 1.5, summonT: 10, shoutT: 3, touchT: 0,
    distillT: 5, distillCount: 0, distillCap: 3, distilled: [], distilledIds: [], enraged: false,
    buff: { dmg: 1, rate: 1, pies: 0, homing: 0, range: 1 },
    /* v2.0 五阶段：P1画饼 / P2客户插单 / P3组织架构 / P4AI提效 / P5离职答辩 */
    phaseIdx: -1, phaseAnnounceT: 0 };
  G.units.push(b);
  G.boss = b; G.bossSpawned = true;
  warn('📢 紧急通知：老板亲自下场了！');
  addFeed('老板 带着期权和大饼进场了', true);
  SFX.boss(); addShake(6);
}
function spawnHR(x, y) {
  const h = makeUnit('HR·' + pick(['小美', '小帅', 'Tina', 'Jack', 'Vicky']), x, y,
    { isHR: true, hp: 60, weaponId: pick(['gemini', 'chatgpt', 'qwen']), shirt: '#9aa4b5',
      bot: { pers: 'juan', state: 'wander', wx: x, wy: y, target: null, decideT: 0, aimErr: .12, chargeHold: 0, provokedT: 9, strafe: 1 } });
  h.weapon.lvl = 2;
  G.units.push(h);
}
/* ---------- 副武器（办公室兵器，全自动索敌） ---------- */
function updateSubs(u, dt) {
  u._projKey = null;   // 防主武器弹贴图键残留到副武器弹（updateWeapon 有提前 return 路径）
  const fr = Math.min(fireRateOf(u), 1.6);   // 副武器统一吃射速但有独立上限
  for (const rawId in u.subs) {
    /* v2.0：mimic 字段让新副武器直接复用现有 kind 分支，不改分派 */
    const id = (SUBS[rawId] && SUBS[rawId].mimic) || rawId;
    const s = u.subs[rawId], def = SUBS[rawId];
    if (id === 'monitor') {
      /* 环绕撞击：显示器回旋盾 */
      s.ang = (s.ang || 0) + dt * 3;
      const n = def.count[s.lv - 1];
      for (let i = 0; i < n; i++) {
        const a = s.ang + i * Math.PI * 2 / n;
        const mx = u.x + Math.cos(a) * 34, my = u.y - 4 + Math.sin(a) * 34;
        for (const t of G.units) {
          if (!isFoe(u, t) || dist2(mx, my, t.x, t.y) > (14 + t.r) * (14 + t.r)) continue;
          if (!t._monHit || G.t - t._monHit > .5 / fr) {
            t._monHit = G.t;
            applyDamage(t, def.dmg[s.lv - 1] * u.mods.dmg, u);
            const push = a + Math.PI / 2;   // 沿切线轻推：不再把敌人推出光环/键盘半径
            t.x += Math.cos(push) * 4; t.y += Math.sin(push) * 4;
          }
        }
      }
      continue;
    }
    if (id === 'shredder') {
      /* 贴身绞杀光环（间隔吃射速、半径吃射程模组） */
      s.t = (s.t || 0) - dt * fr;
      if (s.t <= 0) {
        s.t = .4;
        const r = def.radius[s.lv - 1] * u.mods.range;
        let hitAny = false;
        for (const t of G.units) {
          if (!isFoe(u, t) || dist2(u.x, u.y, t.x, t.y) > r * r) continue;
          applyDamage(t, def.dps[s.lv - 1] * .4 * u.mods.dmg, u, { quiet: true });
          hitAny = true;
        }
        if (hitAny && Math.random() < .5) addParts(u.x + rand(-20, 20), u.y + rand(-20, 20), '#e8e4d8', 2, 40, .4);
      }
      continue;
    }
    s.t = (s.t || 0) - dt * fr;
    if (s.t > 0) continue;
    if (id === 'keyboard') {
      const t = nearestUnit(u.x, u.y, 90, o => isFoe(u, o));
      if (!t) { s.t = .3; continue; }
      s.t = def.cd;
      const ang = Math.atan2(t.y - u.y, t.x - u.x);
      addFx({ type: 'slash', x: u.x, y: u.y - 4, ang, r: 70, spread: 1.1, color: '#c9d4e4', life: .18 });
      for (const o of G.units) {
        if (!isFoe(u, o) || dist(u.x, u.y, o.x, o.y) > 92) continue;
        let da = Math.atan2(o.y - u.y, o.x - u.x) - ang;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < 1.1) {
          applyDamage(o, def.dmg[s.lv - 1] * u.mods.dmg, u, { stun: .15 });
          const kb = s.lv >= 3 ? 18 : 10;
          o.x += Math.cos(ang) * kb; o.y += Math.sin(ang) * kb;
        }
      }
      if (nearPlayer(u.x, u.y)) SFX.hit();
    } else if (id === 'stapler') {
      s.t = def.cd;
      /* 只数/拆同类无 kind 炮台：原来不过滤会把知识库炮台、喷淋装置、交付节点一起拆掉 */
      const mine = G.turrets.filter(tr => tr.owner === u && !tr.kind);
      if (mine.length >= def.count[s.lv - 1]) mine[0].life = 0;   // 旧的拆掉
      /* shotDmg 记录自己的伤害表：自动化脚本终端(mimic stapler)原来永远打订书机的 6/9/12 */
      G.turrets.push({ x: u.x + rand(-12, 12), y: u.y + rand(-12, 12), owner: u, lv: s.lv, cd: .3, life: def.life,
        shotDmg: (def.shot || SUBS.stapler.shot)[s.lv - 1] });
      addFloat(u.x, u.y - 16, '炮台已部署', '#c9c4b4', 6, .6);
    } else if (id === 'knowledge_base') {
      s.t = def.cd * (u.mods.summonCdMul || 1);
      const maxCount = def.count[s.lv - 1] + (u.mods.__evoOutsourceEmpire ? 2 : 0);
      const mine = G.turrets.filter(tr => tr.owner === u && tr.kind === 'knowledge_base');
      while (mine.length >= maxCount) mine.shift().life = 0;
      const life = def.life[s.lv - 1] * (u.mods.__evoOutsourceEmpire ? 3.5 : 1);
      G.turrets.push({ x: u.x + rand(-18, 18), y: u.y + rand(-18, 18), owner: u, lv: s.lv, cd: .2,
        life, kind: 'knowledge_base', kbDmg: def.shot[s.lv - 1] * u.mods.dmg * (1 + (u.mods.summonDmg || 0)),
        kbRange: 210 + s.lv * 25, kbShotCd: u.mods.__evoOutsourceEmpire ? .45 : .65 });
      addFloat(u.x, u.y - 16, '知识库上线', '#9ad1ff', 7, .7);
    } else if (id === 'digital_clone') {
      s.t = def.cd * (u.mods.summonCdMul || 1);
      spawnOpcSummon(u, 'clone', { life: def.life[s.lv - 1], dmg: def.dmg[s.lv - 1] });
    } else if (id === 'mug') {
      const r0 = 230 * u.mods.range;
      const t = nearestUnit(u.x, u.y, r0, o => isFoe(u, o));
      if (!t) { s.t = .4; continue; }
      s.t = def.cd;
      spawnBullet(u, Math.atan2(t.y - u.y, t.x - u.x),
        { shape: 'mugp', r: 3, spd: 240, range: clamp(dist(u.x, u.y, t.x, t.y), 40, r0), exact: true,
          dmg: 0, boom: { r: 26, dmg: def.dmg[s.lv - 1] * u.mods.dmg }, _echo: true });
    } else if (id === 'laserpen') {
      const t = nearestUnit(u.x, u.y, 270, o => isFoe(u, o));
      if (!t) { s.t = .4; continue; }
      s.t = def.cd;
      fireBeam(u, Math.atan2(t.y - u.y, t.x - u.x), 270, 3, def.dmg[s.lv - 1] * u.mods.dmg, '#ff4f4f');
      if (nearPlayer(u.x, u.y)) SFX.laser();
    } else if (id === 'pressure_pills') {
      /* 降压药丸摇摇乐：近身药雾，敌人减速受伤，玩家按命中回血 */
      s.t = def.cd;
      const evo = u.mods.__evoFubaoField ? 1.25 : 1;
      const r = def.radius[s.lv - 1] * u.mods.range * evo;
      let hits = 0;
      for (const t of G.units) {
        if (!isFoe(u, t) || dist2(u.x, u.y, t.x, t.y) > r * r) continue;
        t.oaSlowT = Math.max(t.oaSlowT || 0, .6);
        applyDamage(t, def.dps[s.lv - 1] * u.mods.dmg * evo, u, { quiet: true });
        hits++;
      }
      if (hits) {
        u.hp = Math.min(maxHp(u), u.hp + def.heal[s.lv - 1] * Math.min(4, hits) * (u.mods.__evoFubaoField ? 1.4 : 1));
        if (Math.random() < .45) addParts(u.x + rand(-18, 18), u.y + rand(-18, 18), '#7ee08a', 2, 35, .35);
      }
    } else if (id === 'labor_gloves') {
      /* 劳保手套双节棍：近身反打，命中转护盾 */
      const t = nearestUnit(u.x, u.y, 95, o => isFoe(u, o));
      if (!t) { s.t = .35; continue; }
      s.t = def.cd;
      const ang = Math.atan2(t.y - u.y, t.x - u.x);
      addFx({ type: 'slash', x: u.x, y: u.y - 4, ang, r: 78, spread: 1.0, color: '#ffcf33', life: .16 });
      let hits = 0;
      for (const o of G.units) {
        if (!isFoe(u, o) || dist(u.x, u.y, o.x, o.y) > 98) continue;
        let da = Math.atan2(o.y - u.y, o.x - u.x) - ang;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < 1.0) { applyDamage(o, def.dmg[s.lv - 1] * u.mods.dmg, u, { stun: .18 }); hits++; }
      }
      if (hits) {
        u.shield = Math.min(maxHp(u), (u.shield || 0) + def.shield[s.lv - 1] * hits);
        u.shieldT = Math.max(u.shieldT || 0, 6);
      }
    } else if (id === 'exit_notice') {
      /* 离职申请单发射器：命中先贴单，延迟追责爆发 */
      const t = nearestUnit(u.x, u.y, 250, o => isFoe(u, o));
      if (!t) { s.t = .4; continue; }
      s.t = def.cd;
      spawnBullet(u, Math.atan2(t.y - u.y, t.x - u.x),
        { shape: 'doc', r: 3, spd: 285, range: 260, color: '#ffcf33',
          dmg: def.dmg[s.lv - 1] * u.mods.dmg * .45, _echo: true,
          onHitMark: { slowT: .6, burstT: .9, burstDmg: def.dmg[s.lv - 1] * u.mods.dmg * 1.45 } });
    } else if (id === 'bonus_check') {
      /* 年终奖支票·空头：残血兑现，高血只是画饼 */
      const t = nearestUnit(u.x, u.y, 285, o => isFoe(u, o));
      if (!t) { s.t = .4; continue; }
      s.t = def.cd;
      const threshold = def.execute[s.lv - 1] + (u.mods.executeThreshold || 0) * .35;
      if (!tryExecuteTarget(u, t, threshold, '空头支票兑现')) {
        const low = t.hp / maxHp(t) < .45;
        applyDamage(t, def.dmg[s.lv - 1] * u.mods.dmg * (low ? 2.2 : .65), u, { quiet: !low, stun: low ? .2 : 0 });
      }
    } else if (id === 'oa_form') {
      /* OA审批流公文包：命中后40%减速2秒+延迟0.8秒引爆叠加伤害 */
      const t = nearestUnit(u.x, u.y, 220, o => isFoe(u, o));
      if (!t) { s.t = .4; continue; }
      s.t = def.cd;
      spawnBullet(u, Math.atan2(t.y - u.y, t.x - u.x),
        { shape: 'dot', r: 3, spd: 260, range: 220, color: '#c9d4e4',
          dmg: def.dmg[s.lv - 1] * u.mods.dmg * .4, _echo: true,
          onHitMark: { slowT: 2, burstT: .8, burstDmg: def.dmg[s.lv - 1] * u.mods.dmg * 1.6 } });
    } else if (id === 'fire_sprinkler') {
      /* 消防警报喷淋装置：部署固定喷淋区，范围内减速可叠加，敌人扎堆时定身 */
      s.t = def.cd;
      const mine = G.turrets.filter(tr => tr.owner === u && tr.kind === 'sprinkler');
      if (mine.length >= 1) mine[0].life = 0;
      G.turrets.push({ x: u.x, y: u.y, owner: u, lv: s.lv, cd: .3, life: def.life, kind: 'sprinkler' });
    } else if (id === 'meeting_room') {
      /* 会议室预定表：矩形近似为圆形减速灼烧区，2个以上敌人困在内会互相碰撞眩晕 */
      s.t = def.cd;
      const r = def.radius[s.lv - 1] * u.mods.range;
      G.burns.push({ x: u.x, y: u.y, r, dps: def.dps[s.lv - 1] * u.mods.dmg, slow: .5, life: def.life, t: 0, owner: u, color: '#6aa3ff', roomTrap: true });
    } else if (id === 'online_badge') {
      /* 在线状态徽章：移动中光环内敌人被"已读"标记，1.5秒后引爆 */
      if (!u.isMoving) { s.t = .3; continue; }
      s.t = def.cd;
      const r = 90 * u.mods.range;
      for (const t of G.units) {
        if (!isFoe(u, t) || t.badgeMarkT > 0 || dist2(u.x, u.y, t.x, t.y) > r * r) continue;
        if (Math.random() < def.markChance[s.lv - 1]) { t.badgeMarkT = 1.5; t.badgeMarkOwner = u; t.badgeMarkMul = 1 + (s.lv - 1) * .3; }
      }
    } else if (id === 'fitness_ring') {
      /* 健身环挑战：边跑边在身后布下短暂定身圈 */
      if (!u.isMoving) { s.t = .3; continue; }
      s.t = def.cd;
      /* dps 取自定义表：待办清单地雷(mimic)宣称"定身+微伤"，原来复用此分支永远 dps:0 */
      G.burns.push({ x: u.x, y: u.y, r: def.radius[s.lv - 1] * u.mods.range, dps: def.dps ? def.dps[s.lv - 1] * u.mods.dmg : 0, slow: .001, life: 1.2, t: 0, owner: u, color: '#c9a227', ringStun: true });
    }
  }
}

/* ---------- 主动技能 helpers（v2.0 双槽新增效果需要的通用工具） ---------- */
function enemiesInRadius(pl, cx, cy, r) {
  const out = []; const r2 = r * r;
  for (const t of G.units) if (t.alive && isFoe(pl, t) && dist2(cx, cy, t.x, t.y) < r2) out.push(t);
  return out;
}
function nearestAimTarget(pl, range) {
  let best = null, bestScore = Infinity;
  for (const t of G.units) {
    if (!t.alive || !isFoe(pl, t)) continue;
    const dx = t.x - pl.x, dy = t.y - pl.y, d = Math.hypot(dx, dy);
    if (d > range) continue;
    const ang = Math.atan2(dy, dx);
    let da = ang - pl.aim; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
    const score = Math.abs(da) * 90 + d;   // 越靠准星越优先
    if (score < bestScore) { bestScore = score; best = t; }
  }
  return best;
}
function clearEnemyProjectiles(cx, cy, r, pl) {
  let n = 0; const r2 = r * r;
  for (const p of G.projs) {
    if (p.dead) continue;
    if (isFoe(pl, p.owner) && dist2(p.x, p.y, cx, cy) < r2) { p.dead = true; n++; }
  }
  return n;
}
function moveDirFromInput(pl) {
  let mx = 0, my = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  if (touch.using && touch.active) { mx = touch.dx; my = touch.dy; }
  const m = Math.hypot(mx, my);
  if (!m) return { x: Math.cos(pl.aim), y: Math.sin(pl.aim) };
  return { x: mx / m, y: my / m };
}
/* ---------- 主动技能（Q 短 CD / E 长 CD 双槽） ---------- */
export function castActive(slot = 'q') {
  const pl = G && G.player;
  if (!pl || !pl.alive || state !== 'playing') return;
  const key = slot === 'e' ? 'activeE' : 'activeQ';
  const cdKey = slot === 'e' ? 'activeECd' : 'activeQCd';
  /* 兼容旧存档：Q 槽没设时读 pl.active */
  const active = pl[key] || (slot === 'q' ? pl.active : null);
  if (!active) return;
  if (pl[cdKey] > 0 || (slot === 'q' && !pl.activeQ && pl.activeCd > 0)) { SFX.deny(); return; }
  const id = active.id, lv = active.lv, def = ACTIVES[id];
  if (!def) return;
  pl[cdKey] = def.cd[lv - 1] * (pl.mods.activeCdMul || 1);
  if (slot === 'q') pl.activeCd = pl[cdKey];   // 兼容旧代码用 pl.activeCd 查询
  if (id === 'blink') {
    let mx = 0, my = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
    if (touch.using && touch.active) { mx = touch.dx; my = touch.dy; }
    const m = Math.hypot(mx, my);
    if (!m) { mx = Math.cos(pl.aim); my = Math.sin(pl.aim); } else { mx /= m; my /= m; }
    let d0 = def.dist[lv - 1];
    if (pl.curses.overfit > 0) {   // 过拟合诅咒同样限制瞬移，精英反制不被架空
      d0 *= .4;
      addFloat(pl.x, pl.y - 18, '陷入局部最优！', '#ff8f5a', 7, .7);
    }
    addParts(pl.x, pl.y, '#38d3e8', 10, 70, .4);
    addFx({ type: 'teleportfx', x: pl.x, y: pl.y - 4, r: 15, life: .35 });   // 起点漩涡
    pl.x = clamp(pl.x + mx * d0, 10, TUNE.world - 10);
    pl.y = clamp(pl.y + my * d0, 12, TUNE.world - 8);
    pl.invulnT = Math.max(pl.invulnT, .3);
    addFx({ type: 'teleportfx', x: pl.x, y: pl.y - 4, r: 15, life: .35 });   // 终点漩涡
    addParts(pl.x, pl.y, '#38d3e8', 14, 80, .5);
    SFX.dash();
  } else if (id === 'layoff') {
    /* 固定伤害 + 目标最大生命百分比：后期不再是死卡，对 Boss 单发上限 150 */
    const len = 300 * pl.mods.range;
    const x2 = pl.x + Math.cos(pl.aim) * len, y2 = pl.y + Math.sin(pl.aim) * len;
    addFx({ type: 'beam', x1: pl.x, y1: pl.y - 4, x2, y2, w: 10, color: '#ff4f4f', life: .25 });
    for (const t of G.units) {
      if (!isFoe(pl, t)) continue;
      if (distToSeg(t.x, t.y, pl.x, pl.y, x2, y2) < 5 + t.r) {
        let d = (def.dmg[lv - 1] + maxHp(t) * def.pct[lv - 1]) * pl.mods.dmg;
        if (t.isBoss) d = Math.min(d, 150);
        applyDamage(t, d, pl);
      }
    }
    if (pl.mods.__evoLayoffWave) {
      const mine = opcSummons(pl);
      if (mine.length) {
        const waves = Math.min(6, mine.length);
        for (const s of mine) {
          recordOpcRetirement(pl, s, true);
          s.alive = false;
          addParts(s.x, s.y, '#9ad1ff', 8, 70, .35);
        }
        triggerSeveranceNuke(pl, x2, y2, waves);
      }
    }
    addFloat(pl.x, pl.y - 20, '裁员通知已送达', '#ff4f4f', 8, 1);
    addShake(4);
    SFX.laser();
  } else if (id === 'performance_eliminate') {
    /* 绩效末位淘汰：点名最低血量目标，低于阈值直接处决；Boss/高血只吃封顶伤害 */
    const t = G.units.filter(x => x.alive && isFoe(pl, x) && dist2(pl.x, pl.y, x.x, x.y) < 420 * 420)
      .sort((a, b) => (a.hp / maxHp(a)) - (b.hp / maxHp(b)))[0];
    if (t) {
      const threshold = def.threshold[lv - 1] + (pl.mods.executeThreshold || 0) * .45;
      addFx({ type: 'beam', x1: pl.x, y1: pl.y - 4, x2: t.x, y2: t.y, w: 5, color: '#ff9440', life: .22 });
      if (!tryExecuteTarget(pl, t, threshold, '末位淘汰')) {
        const d = Math.min(def.dmg[lv - 1] + maxHp(t) * .08, t.isBoss || t.eliteTier === 2 ? 160 : 220);
        applyDamage(t, d * pl.mods.dmg, pl, { stun: .25 });
      }
      addFloat(pl.x, pl.y - 20, '绩效末位淘汰', '#ff9440', 9, 1);
      SFX.laser();
    } else addFloat(pl.x, pl.y - 16, '没有可优化对象', '#9aa4b5', 7, .7);
  } else if (id === 'blood_donation_van') {
    /* 献血车驻场：短时回血，但自身处于小额易伤，考验站位 */
    pl.bloodVanT = def.dur[lv - 1];
    pl.bloodVanHeal = def.heal[lv - 1];
    pl.bloodVanVuln = lv >= 3 ? .08 : lv >= 2 ? .12 : .16;
    pl.hp = Math.min(maxHp(pl), pl.hp + 8 + lv * 4);
    addFx({ type: 'boom', x: pl.x, y: pl.y, r: 105 + lv * 20, color: '#7ee08a', life: .5 });
    addFloat(pl.x, pl.y - 22, '献血车驻场', '#7ee08a', 9, 1.1);
    SFX.pickup();
  } else if (id === 'blame_mass') {
    const t = nearestAimTarget(pl, 380 * pl.mods.range) || nearestUnit(pl.x, pl.y, 380, o => isFoe(pl, o));
    if (t) {
      pl.opcFocusTarget = t;
      pl.opcFocusT = def.dur[lv - 1];
      t.vulnT = Math.max(t.vulnT || 0, def.dur[lv - 1]);
      t.vulnBonus = Math.max(t.vulnBonus || 0, .25 + lv * .08);
      applyDamage(t, def.dmg[lv - 1] * pl.mods.dmg * (1 + (pl.mods.summonDmg || 0)), pl, { stun: .2 });
      addFx({ type: 'beam', x1: pl.x, y1: pl.y - 4, x2: t.x, y2: t.y, w: 5, color: '#9ad1ff', life: .25 });
      addFloat(pl.x, pl.y - 22, '全体分身：集中甩锅', '#9ad1ff', 9, 1);
      SFX.laser();
    } else addFloat(pl.x, pl.y - 16, '没有可甩锅对象', '#9aa4b5', 7, .7);
  } else if (id === 'bing_shield') {
    pl.invulnT = Math.max(pl.invulnT, def.dur[lv - 1]);
    addFloat(pl.x, pl.y - 20, '这饼真香（无敌）', '#ffcf33', 8, 1);
    SFX.pickup();
  } else if (id === 'teambuild') {
    const r = def.radius[lv - 1];
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#ffcf33', life: .4 });
    for (const t of G.units) {
      if (!isFoe(pl, t) || t.isBoss || dist2(pl.x, pl.y, t.x, t.y) > r * r) continue;
      const a = Math.atan2(t.y - pl.y, t.x - pl.x);
      t.x = pl.x + Math.cos(a) * 42;
      t.y = pl.y + Math.sin(a) * 42;
      t.stunT = Math.max(t.stunT, .4);
      t.vulnT = 1.5;   // 被拉来开会的人 1.5 秒内受伤 +20%
    }
    addFloat(pl.x, pl.y - 20, '来都来了！', '#ffcf33', 9, 1);
    SFX.explo();
  } else if (id === 'force_mute') {
    /* 强制五分钟静音：扇形范围眩晕+减速+碰撞体积临时增大制造互相卡位 */
    const r = def.range[lv - 1];
    for (const t of G.units) {
      if (!isFoe(pl, t)) continue;
      const d2v = dist2(pl.x, pl.y, t.x, t.y);
      if (d2v > r * r) continue;
      const rel = Math.atan2(t.y - pl.y, t.x - pl.x);
      let dd = rel - pl.aim; while (dd > Math.PI) dd -= Math.PI * 2; while (dd < -Math.PI) dd += Math.PI * 2;
      if (Math.abs(dd) > 1.0) continue;
      t.stunT = Math.max(t.stunT, 1.5);
      t.oaSlowT = Math.max(t.oaSlowT, 2);
      /* 碰撞体积临时增大 4s：原来 *=1.3 无恢复逻辑还能无限叠乘，Boss 半径指数膨胀 */
      if (!t._muteWide) { t._muteWide = true; t.r *= 1.3; }
      t.muteWidenT = Math.max(t.muteWidenT || 0, 4);
    }
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#9ad1ff', life: .3 });
    addFloat(pl.x, pl.y - 20, '麦克风已被管理员静音', '#9ad1ff', 8, 1);
    SFX.zone();
  } else if (id === 'linked_fate') {
    /* 花名册点对点连坐：锁链连接两个敌人，超距拉扯撞击；觉醒后按生命排序把全场敌人编织成完整锁链 */
    if (pl.mods.__evoDismissalChain) {
      const all = G.units.filter(t => isFoe(pl, t) && dist2(pl.x, pl.y, t.x, t.y) < 500 * 500)
        .sort((a, b) => a.hp - b.hp).slice(0, 6);
      /* 两两配对：连坐结算要求严格互指，原来链式赋值会被下一次迭代覆盖，只有链尾一对生效 */
      for (let i = 0; i + 1 < all.length; i += 2) {
        all[i].linkedTo = all[i + 1]; all[i].linkedT = 12;
        all[i + 1].linkedTo = all[i]; all[i + 1].linkedT = 12;
      }
      pl.buffs.spdT = Math.max(pl.buffs.spdT, 12); pl.buffs.spdM = Math.max(pl.buffs.spdM, 1.15);
      pl.buffs.dmgT = Math.max(pl.buffs.dmgT, 12); pl.buffs.dmgM = Math.max(pl.buffs.dmgM, 1.1);
      addFloat(pl.x, pl.y - 20, '永续裁员委员会：全场连坐！', '#ff6a6a', 10, 1.3);
      SFX.boss(); addShake(5);
    } else {
      const near = G.units.filter(t => isFoe(pl, t) && dist2(pl.x, pl.y, t.x, t.y) < 420 * 420)
        .sort((a, b) => dist2(pl.x, pl.y, a.x, a.y) - dist2(pl.x, pl.y, b.x, b.y)).slice(0, 2);
      if (near.length === 2) {
        const [a, b] = near;
        a.linkedTo = b; b.linkedTo = a; a.linkedT = 8; b.linkedT = 8;
        addFx({ type: 'beam', x1: a.x, y1: a.y, x2: b.x, y2: b.y, w: 4, color: '#ffcf33', life: .6 });
        addFloat(pl.x, pl.y - 20, '从今天起，你们两个互相负责', '#ffcf33', 8, 1.1);
        SFX.laser();
      } else {
        addFloat(pl.x, pl.y - 16, '附近人手不够，连坐不了', '#9aa4b5', 7, .8);
      }
    }
  } else if (id === 'temp_offline') {
    /* 临时下线：1秒完全隐身+无敌+移速×2+穿墙冲刺，逃生位移 vs 摸鱼瞬移的进攻位移 */
    let mx = Math.cos(pl.aim), my = Math.sin(pl.aim);
    if (keys.has('KeyW') || keys.has('ArrowUp')) my = -1, mx = 0;
    if (keys.has('KeyS') || keys.has('ArrowDown')) my = 1, mx = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx = -1, my = 0;
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx = 1, my = 0;
    pl.invulnT = Math.max(pl.invulnT, def.dur[lv - 1]);
    pl.hiddenT = Math.max(pl.hiddenT || 0, def.dur[lv - 1]);   // 卡面写"隐身"：现在杂鱼/同事索敌都会失去玩家目标
    pl.buffs.spdT = Math.max(pl.buffs.spdT, def.dur[lv - 1]);
    pl.buffs.spdM = Math.max(pl.buffs.spdM, 2);
    pl.x = clamp(pl.x + mx * 60, 10, TUNE.world - 10);
    pl.y = clamp(pl.y + my * 60, 12, TUNE.world - 8);
    addParts(pl.x, pl.y, '#d8e8ff', 12, 80, .5);
    addFloat(pl.x, pl.y - 20, '临时下线', '#d8e8ff', 8, 1);
    SFX.dash();
  } else if (id === 'slack_appeal') {
    /* 摸鱼申诉信：最近5秒没输出=真摸鱼，回大量血+下次致命伤害保留1血；有输出则效果减半 */
    const reallySlacking = G.t - (pl.lastDealT || -999) > 5;
    const heal = reallySlacking ? maxHp(pl) * .4 : maxHp(pl) * .2;
    pl.hp = Math.min(maxHp(pl), pl.hp + heal);
    pl.mods.revive = Math.max(pl.mods.revive, reallySlacking ? 1 : .5);
    addFloat(pl.x, pl.y - 20, reallySlacking ? '真摸鱼认证通过！' : '装忙没蒙混过去…', reallySlacking ? '#7ee08a' : '#9aa4b5', 8, 1.1);
    SFX.pickup();
  } else if (id === 'nitpick') {
    /* v2.0 专挑细节：准星最近目标破防 + 易伤 + 破盾 */
    const t = nearestAimTarget(pl, def.range[lv - 1] * pl.mods.range);
    if (t) {
      addFx({ type: 'beam', x1: pl.x, y1: pl.y - 4, x2: t.x, y2: t.y, w: 4 + lv, color: '#ff4f4f', life: .18 });
      t.vulnT = Math.max(t.vulnT, 2.2 + lv * .4); t.vulnBonus = Math.max(t.vulnBonus, .15 + lv * .08);
      if (t.mobShieldHp > 0) t.mobShieldHp -= def.dmg[lv - 1] * 1.5;
      applyDamage(t, def.dmg[lv - 1] * pl.mods.dmg * (t.bossNode ? 2.4 : 1), pl, { stun: .15 + lv * .05 });
      addFloat(t.x, t.y - 18, '细节不对！', '#ff4f4f', 8, 1);
      SFX.hit();
    } else addFloat(pl.x, pl.y - 16, '没找到可挑的细节', '#9aa4b5', 7, .7);
  } else if (id === 'screenshot') {
    /* 截图留痕：冻结一圈，延迟 850ms 结算追加伤害 */
    const r = def.radius[lv - 1];
    const tx = pl.x + Math.cos(pl.aim) * 110, ty = pl.y + Math.sin(pl.aim) * 110;
    addFx({ type: 'boom', x: tx, y: ty, r, color: '#9ad1ff', life: 1.0 });
    const caught = enemiesInRadius(pl, tx, ty, r);
    for (const t of caught) { t.stunT = Math.max(t.stunT, .9 + lv * .15); t.vulnT = Math.max(t.vulnT, 1.8); }
    delay(() => { if (pl.alive) explodeAt(tx, ty, r * .75, (22 + lv * 14 + caught.length * 3) * pl.mods.dmg, pl, '#9ad1ff'); }, .85);
    addFloat(pl.x, pl.y - 20, '截图留痕，稍后追责', '#9ad1ff', 8, 1);
    SFX.zone();
  } else if (id === 'out_of_scope') {
    /* 这个不在范围内：护盾 + 清锅值 + 清弹幕 + 弹开近身 */
    const shield = def.shield[lv - 1];
    pl.shield = Math.min(maxHp(pl), (pl.shield || 0) + shield); pl.shieldT = 10;
    const old = pl.pot || 0; pl.pot = Math.max(0, old - (18 + lv * 12));
    const cleared = clearEnemyProjectiles(pl.x, pl.y, 145 + lv * 25, pl);
    for (const t of enemiesInRadius(pl, pl.x, pl.y, 90 + lv * 20)) {
      const a = Math.atan2(t.y - pl.y, t.x - pl.x); t.x += Math.cos(a) * 24; t.y += Math.sin(a) * 24;
      t.stunT = Math.max(t.stunT, .35);
    }
    addFloat(pl.x, pl.y - 20, `不在范围内：锅值 -${old - pl.pot}`, '#6aa3ff', 8, 1);
    if (cleared) addFloat(pl.x, pl.y - 32, `清理 ${cleared} 条扯皮弹幕`, '#9ad1ff', 7, .8);
    SFX.pickup();
  } else if (id === 'cc_all') {
    /* 邮件抄送全员：单体 + 圈内其它敌人 65% 伤害 */
    const t = nearestAimTarget(pl, 280 * pl.mods.range);
    if (t) {
      applyDamage(t, def.dmg[lv - 1] * pl.mods.dmg, pl, { stun: .1 });
      const r = def.radius[lv - 1];
      for (const o of enemiesInRadius(pl, t.x, t.y, r)) if (o !== t) applyDamage(o, def.dmg[lv - 1] * .65 * pl.mods.dmg, pl, { quiet: true });
      addFx({ type: 'boom', x: t.x, y: t.y, r, color: '#c58fff', life: .35 });
      addFloat(t.x, t.y - 20, '抄送全员', '#c58fff', 8, 1);
      SFX.laser();
    }
  } else if (id === 'dead_in_group') {
    /* 群里装死：短暂无敌 + 移速加成 + 敌方转移目标 */
    const dur = def.dur[lv - 1];
    pl.invulnT = Math.max(pl.invulnT, dur); pl.buffs.spdT = Math.max(pl.buffs.spdT, dur); pl.buffs.spdM = Math.max(pl.buffs.spdM, 1.45);
    pl.pot = Math.max(0, (pl.pot || 0) - (10 + lv * 8));
    for (const t of enemiesInRadius(pl, pl.x, pl.y, 220)) if (t.bot) t.bot.target = null; else t.mobTarget = null;
    if (lv >= 3) clearEnemyProjectiles(pl.x, pl.y, 220, pl);
    addFloat(pl.x, pl.y - 20, '群里装死：在线但不可见', '#d8e8ff', 8, 1);
    SFX.dash();
  } else if (id === 'freeze_scope') {
    /* 需求冻结：范围内敌人停止复活/分裂/变形 + 定身 */
    const r = def.radius[lv - 1], dur = 2.2 + lv * .7;
    for (const t of enemiesInRadius(pl, pl.x, pl.y, r)) {
      t.stunT = Math.max(t.stunT, dur);
      t.noSplitT = Math.max(t.noSplitT || 0, dur);
      t.noRecallT = Math.max(t.noRecallT || 0, dur);
    }
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#67c98b', life: .4 });
    addFloat(pl.x, pl.y - 20, '需求冻结：本轮不改', '#67c98b', 8, 1);
    SFX.zone();
  } else if (id === 'sync_once') {
    /* 我同步一下：偷附近最强敌人的攻速/移速 buff */
    const near = enemiesInRadius(pl, pl.x, pl.y, 260).sort((a, b) => maxHp(b) - maxHp(a))[0];
    const dur = def.dur[lv - 1];
    pl.buffs.fireT = Math.max(pl.buffs.fireT, dur);
    pl.buffs.fireM = Math.max(pl.buffs.fireM, near && near.empowerT > 0 ? 1.45 : 1.25 + lv * .06);
    pl.buffs.spdT = Math.max(pl.buffs.spdT, dur);
    pl.buffs.spdM = Math.max(pl.buffs.spdM, near && near.empowerT > 0 ? 1.35 : 1.15 + lv * .04);
    if (lv >= 3) pl.hp = Math.min(maxHp(pl), pl.hp + 18);
    addFloat(pl.x, pl.y - 20, '我同步一下：成果复用', '#ffcf33', 8, 1);
    SFX.pickup();
  } else if (id === 'pull_meeting') {
    /* 先拉个会：一圈拽到身前 + 眩晕 + 700ms 后爆炸 */
    const r = def.radius[lv - 1];
    for (const t of enemiesInRadius(pl, pl.x, pl.y, r)) {
      if (t.isBoss) continue;
      const a = Math.atan2(t.y - pl.y, t.x - pl.x);
      t.x = pl.x + Math.cos(a) * rand(36, 52); t.y = pl.y + Math.sin(a) * rand(36, 52);
      t.stunT = Math.max(t.stunT, .8 + lv * .2); t.vulnT = Math.max(t.vulnT, 1.8);
    }
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#ffcf33', life: .45 });
    delay(() => { if (pl.alive) explodeAt(pl.x, pl.y, r * .55, (28 + lv * 16) * pl.mods.dmg, pl, '#ffcf33'); }, .7);
    addFloat(pl.x, pl.y - 20, '先拉个会', '#ffcf33', 9, 1); SFX.explo();
  } else if (id === 'leader_decides') {
    /* 让领导拍板：审批光束打最高血敌人；击杀返还 40% CD */
    const t = G.units.filter(x => x.alive && isFoe(pl, x)).sort((a, b) => b.hp - a.hp)[0];
    if (t) {
      fireBeam(pl, Math.atan2(t.y - pl.y, t.x - pl.x), dist(pl.x, pl.y, t.x, t.y) + 20, 12, def.dmg[lv - 1] * pl.mods.dmg, '#ffffff');
      t.stunT = Math.max(t.stunT, lv >= 3 ? .8 : .25);
      if (!t.alive) pl[cdKey] *= .6;
      addFloat(t.x, t.y - 22, '领导已拍板', '#ffffff', 9, 1);
      SFX.laser();
    }
  } else if (id === 'client_word') {
    /* 客户一句话：范围内敌人随机传送 + 造成伤害；副作用生成 1-2 返工单 */
    const r = def.radius[lv - 1];
    for (const t of enemiesInRadius(pl, pl.x, pl.y, r)) {
      const a = rand(0, Math.PI * 2), rr = rand(r * .65, r * 1.15);
      t.x = clamp(pl.x + Math.cos(a) * rr, 20, TUNE.world - 20);
      t.y = clamp(pl.y + Math.sin(a) * rr, 20, TUNE.world - 20);
      applyDamage(t, (18 + lv * 12) * pl.mods.dmg, pl, { quiet: true });
    }
    const rework = lv === 1 ? 2 : lv === 2 ? 1 : 0;
    for (let i = 0; i < rework; i++) spawnMob('cr', pl.x + rand(-80, 80), pl.y + rand(-80, 80), false, Math.max(1, (G.trial && G.trial.wave) || 3));
    pl.pot = Math.min(100, (pl.pot || 0) + (rework ? 8 : 3));
    addFloat(pl.x, pl.y - 20, '客户一句话，三周白干', '#ff6a6a', 9, 1); SFX.explo();
  } else if (id === 'rollback') {
    /* 版本回滚：回到 3 秒前的位置/血量并清弹 */
    const snap = (pl.history || []).find(h => G.t - h.t > 2.5) || pl.history[pl.history.length - 1];
    if (snap) {
      pl.x = snap.x; pl.y = snap.y;
      pl.hp = Math.min(maxHp(pl), Math.max(pl.hp, snap.hp));
    }
    clearEnemyProjectiles(pl.x, pl.y, 260 + lv * 40, pl);
    if (lv >= 3) pl.invulnT = Math.max(pl.invulnT, .5);
    addParts(pl.x, pl.y, '#67c98b', 18, 100, .6);
    addFloat(pl.x, pl.y - 20, '版本回滚', '#67c98b', 9, 1); SFX.pickup();
  } else if (id === 'blame_broadcast') {
    /* 甩锅群发：把自身锅值移给最高血敌人，标记被举报 + 易伤 + 直接伤害 */
    const r = def.radius[lv - 1];
    const t = enemiesInRadius(pl, pl.x, pl.y, r).sort((a, b) => b.hp - a.hp)[0];
    if (t) {
      const move = Math.min(pl.pot || 0, 28 + lv * 18);
      pl.pot = Math.max(0, (pl.pot || 0) - move);
      t.reportedT = Math.max(t.reportedT, 7 + lv * 2);
      t.vulnT = Math.max(t.vulnT, 3); t.vulnBonus = Math.max(t.vulnBonus, .25);
      applyDamage(t, (20 + move * .9) * pl.mods.dmg, pl, { stun: .35 });
      addFloat(t.x, t.y - 22, `锅已转移 +${move}`, '#c58fff', 9, 1);
      SFX.deny();
    }
  } else if (id === 'all_mute') {
    /* 全员静音：全场眩晕 + 清所有敌弹 */
    let n = 0;
    for (const t of G.units) {
      if (!isFoe(pl, t)) continue;
      t.stunT = Math.max(t.stunT, def.dur[lv - 1] * .45);
      t.oaSlowT = Math.max(t.oaSlowT, def.dur[lv - 1]); n++;
      if (t.isBoss && t.bossAI) t.bossAI.shoutT = (t.bossAI.shoutT || 0) + 2;
    }
    const cleared = clearEnemyProjectiles(pl.x, pl.y, 9999, pl);
    addFx({ type: 'boom', x: pl.x, y: pl.y, r: 260, color: '#9ad1ff', life: .3 });
    addFloat(pl.x, pl.y - 20, `全员静音：清 ${cleared} 弹`, '#9ad1ff', 8, 1);
    SFX.zone();
  } else if (id === 'ppt_oneclick') {
    /* 一键生成 PPT：横向推进多页幻灯片墙 */
    const waves = def.waves[lv - 1];
    for (let i = 0; i < waves; i++) {
      const off = (i - (waves - 1) / 2) * 28;
      const side = pl.aim + Math.PI / 2;
      spawnBullet(pl, pl.aim, {
        x: pl.x + Math.cos(side) * off, y: pl.y + Math.sin(side) * off,
        shape: 'slide', r: 7,
        dmg: (16 + lv * 7) * pl.mods.dmg, spd: 230, range: 380, pierce: 99, color: '#f2efe6', _echo: true,
      });
    }
    addFloat(pl.x, pl.y - 20, '一键生成 PPT', '#f2efe6', 9, 1); SFX.shoot();
  } else if (id === 'redline_align') {
    /* 红线拉齐：垂直准星画一条 4s 红线，敌人穿过受伤 + 玩家获盾 */
    const len = def.len[lv - 1], a = pl.aim + Math.PI / 2;
    const x1 = pl.x + Math.cos(a) * len / 2, y1 = pl.y + Math.sin(a) * len / 2;
    const x2 = pl.x - Math.cos(a) * len / 2, y2 = pl.y - Math.sin(a) * len / 2;
    addFx({ type: 'beam', x1, y1, x2, y2, w: 9, color: '#ff4f4f', life: 4 });
    G.burns.push({ x: pl.x, y: pl.y, r: len / 2, dps: 0, slow: 0, life: 4, t: 0, owner: pl, color: '#ff4f4f', redline: { x1, y1, x2, y2, dmg: 10 + lv * 8 } });
    pl.shield = Math.min(maxHp(pl), (pl.shield || 0) + 18 + lv * 14); pl.shieldT = 8;
    addFloat(pl.x, pl.y - 20, '红线拉齐', '#ff4f4f', 9, 1); SFX.zone();
  } else if (id === 'org_restructure') {
    /* 组织架构调整：范围内敌人随机传送 + 易伤混乱状态 */
    const r = def.radius[lv - 1];
    const vulnDur = 3 + lv;                        // 4s / 5s / 6s
    const vulnBonus = .2 + lv * .1;                // 0.3 / 0.4 / 0.5（原 .3+lv*.1 比卡面多一档）
    const targets = lv >= 3 ? G.units.filter(t => t.alive && isFoe(pl, t) && !t.isBoss) : enemiesInRadius(pl, pl.x, pl.y, r).filter(t => !t.isBoss);
    for (const t of targets) {
      const a = rand(0, Math.PI * 2), rr = rand(80, 220);
      t.x = clamp(pl.x + Math.cos(a) * rr, 20, TUNE.world - 20);
      t.y = clamp(pl.y + Math.sin(a) * rr, 20, TUNE.world - 20);
      t.vulnT = Math.max(t.vulnT, vulnDur);
      t.vulnBonus = Math.max(t.vulnBonus, vulnBonus);
      t.stunT = Math.max(t.stunT, 1.2);
      if (t.bot) t.bot.target = null; else t.mobTarget = null;
    }
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#c58fff', life: .5 });
    addFloat(pl.x, pl.y - 20, `组织架构调整：${targets.length} 人重新汇报`, '#c58fff', 9, 1.2);
    SFX.explo(); addShake(3);
  } else if (id === 'resignation_bomb') {
    /* 自爆式辞职信：按已损失生命放大范围爆发，自己获得短暂无敌但不扣血 */
    const r = def.radius[lv - 1] * pl.mods.range;
    const missing = Math.max(20, maxHp(pl) - pl.hp);
    const dmg = (34 + missing * (.95 + lv * .25)) * pl.mods.dmg;
    pl.invulnT = Math.max(pl.invulnT, .8 + lv * .15);
    addFx({ type: 'boom', x: pl.x, y: pl.y, r, color: '#ff9440', life: .5 });
    for (const t of enemiesInRadius(pl, pl.x, pl.y, r)) {
      const cap = t.isBoss || t.eliteTier === 2 ? 190 : 360;
      applyDamage(t, Math.min(dmg, cap), pl, { stun: .25 + lv * .1 });
    }
    addFloat(pl.x, pl.y - 22, '自爆式辞职信', '#ff9440', 10, 1.2);
    SFX.explo(); addShake(5);
  } else if (id === 'no_clockout') {
    /* 我不下班了：扣当前生命换爆发，期间部分伤害转欠薪延迟结算，击杀可抵扣 */
    const dur = def.dur[lv - 1];
    const cost = Math.min(pl.hp - 1, Math.max(12, pl.hp * .25));
    if (cost > 0) pl.hp -= cost;
    pl.noClockoutT = dur;
    pl.wageDebt = 0;
    pl.buffs.spdT = Math.max(pl.buffs.spdT, dur); pl.buffs.spdM = Math.max(pl.buffs.spdM, 1.25 + lv * .1);
    pl.buffs.fireT = Math.max(pl.buffs.fireT, dur); pl.buffs.fireM = Math.max(pl.buffs.fireM, 1.35 + lv * .12);
    pl.buffs.dmgT = Math.max(pl.buffs.dmgT, dur); pl.buffs.dmgM = Math.max(pl.buffs.dmgM, 1.15 + lv * .08);
    addFx({ type: 'boom', x: pl.x, y: pl.y, r: 130, color: '#ffcf33', life: .4 });
    addFloat(pl.x, pl.y - 22, '我不下班了', '#ffcf33', 10, 1.2);
    SFX.fuse(); addShake(4);
  } else if (id === 'fake_busy_staffing') {
    pl.invulnT = Math.max(pl.invulnT, def.dur[lv - 1]);
    pl.buffs.fireT = Math.max(pl.buffs.fireT, def.dur[lv - 1] + 1);
    pl.buffs.fireM = Math.max(pl.buffs.fireM, 1.18);
    const count = def.count[lv - 1];
    for (let i = 0; i < count; i++)
      spawnOpcSummon(pl, i % 3 === 0 ? 'wall' : 'contractor', { life: 9 + lv * 2, ang: Math.PI * 2 * i / count });
    addFx({ type: 'boom', x: pl.x, y: pl.y, r: 145, color: '#9ad1ff', life: .45 });
    addFloat(pl.x, pl.y - 22, '虚假繁忙：分身代班', '#9ad1ff', 10, 1.2);
    SFX.pickup();
  }
  bridge.notify();
}

/* ---------- 转正日：同事空降入场（按试用期长短补发育，不白白落后） ---------- */
function spawnLateBots() {
  unlockSubSlot();   // 转正里程碑：解锁副武器第4槽
  if (!G.latentBots) return;
  const wIds = Object.keys(WEAPONS);
  const months = G.trial.months;
  for (const lb of G.latentBots) {
    let bx = TUNE.world / 2, by = TUNE.world / 2;
    for (let tries = 0; tries < 30; tries++) {
      const p = randPosInZone(G, .85);
      if (dist2(p.x, p.y, G.player.x, G.player.y) > 380 * 380) { bx = p.x; by = p.y; break; }
    }
    const u = makeUnit(lb.name, bx, by, { weaponId: pick(wIds), bot: {
      pers: lb.pers, state: 'wander', wx: bx, wy: by, target: null, decideT: rand(0, .4),
      aimErr: lb.pers === 'juan' ? .07 : lb.pers === 'norm' ? .13 : .2,
      chargeHold: 0, provokedT: 0, strafe: 1,
    } });
    /* v18：追赶发育强化——原公式让同事只到 Lv.6-7、1 模组，DPS 只有玩家 10-15%，PVP 不成立
     * 现调整目标：同事 DPS ≈ 玩家 40-60%，转正后 PVP 才有真实交火 */
    u.weapon.lvl = clamp(2 + months, 2, 5);   // 3月档从 Lv.4 直接到 Lv.5
    G.units.push(u);
    /* 追赶发育锚定玩家实际收益的 85%（原 0.6，同事本来就是玩家的对照组，不该被人为拉低） */
    gainXp(u, Math.round((G.trialXpEarned || 30 * months) * .85) + randi(0, 25));
    /* 模组数从 floor(months/2) 提到 months+1（3月档给4个模组，超过玩家试用期均值） */
    for (let k = 0; k < months + 1; k++)
      applyTechPickup(u, pick(Object.keys(TECH).filter(t => !PLAYER_ONLY_TECH.includes(t) && !TECH[t].instant)), rollTier(months >= 3));
    /* （移除）原"50% 概率给同事一件副武器"：updateSubs 只对玩家执行，
     * 同事的副武器永远不会开火，纯属摆设——如需真实装备需先给 bot 接 updateSubs */
  }
  G.latentBots = null;
}

/* ---------- 试用期杂鱼（办公室琐事） ---------- */
let mobGroupSeq = 0;
function spawnMob(type, x, y, isChild = false, month = 1) {
  const m = MOBS[type];
  const k = 1 + .25 * (month - 1);   // 琐事随月份升级：血量/伤害/经验同步爬坡
  const u = makeUnit(m.name, x, y, { hp: Math.ceil((isChild ? m.hp / 2 : m.hp) * k), spd: m.spd, shirt: '#9aa4b5' });
  u.isMob = true; u.mobType = type; u.isSplitChild = isChild;
  u.mobMonth = month;
  /* 个人追击偏移：不瞄准目标精确坐标而是身边一点 —— 群怪围成一圈而不是叠成一个点 */
  u.chaseOffX = rand(-20, 20); u.chaseOffY = rand(-20, 20);
  u.mobTouch = m.touch * (1 + .08 * (month - 1));
  u.mobXp = m.xp + (month - 1);
  u.spr = SPR[m.spr] || SPR.mob_email;   // 兜底：精灵未注册时用邮件占位，避免渲染崩溃
  u.sprKey = m.spr;   // render 层 PNG 高清覆盖用
  u.r = 3; u.level = 0; u.spdBase = m.spd * rand(.9, 1.1);
  if (m.shieldHp) { u.mobShieldHp = m.shieldHp * k; u.mobShieldBroken = false; u.mods.dmgTaken = .2; }
  if (m.dodgeOverride) u.mods.dodge = m.dodgeOverride;
  if (m.publicIncident) {
    u.publicIncident = true;
    u.incidentT = m.incidentLife || 24;
    u.incidentSpawnT = m.incidentSpawnCd || 5;
    u.r = 8;
  }
  G.units.push(u);
  return u;
}

/* v2.0 公共事故 spawn：在玩家附近合适距离生成一个事故公告牌 */
function spawnPublicIncident() {
  if (!PUBLIC_INCIDENTS.length || !G.player.alive) return;
  const type = PUBLIC_INCIDENTS[G.incidentSeq++ % PUBLIC_INCIDENTS.length];
  const a = rand(0, Math.PI * 2), rr = rand(230, 360);
  const x = clamp(G.player.x + Math.cos(a) * rr, 40, TUNE.world - 40);
  const y = clamp(G.player.y + Math.sin(a) * rr, 40, TUNE.world - 40);
  const u = spawnMob(type, x, y, false, Math.max(3, G.zone.phase + 3));
  addFeed(`公共事故爆发：${MOBS[type].publicIncident}，处理可抢 KPI`, true);
  warn(`🚨 公共事故：${MOBS[type].publicIncident}。不处理会涨锅值，处理成功拿 KPI。`);
  addFx({ type: 'boom', x: u.x, y: u.y, r: 120, color: '#ff4f4f', life: .5 });
  return u;
}
/* 临时工外包大军：6只一组刷出，共享一个存活计数对象，最后1只死亡额外结算奖励经验 */
function spawnMobGroup(type, x, y, month = 1) {
  const m = MOBS[type];
  const shared = { alive: m.groupSize };
  const out = [];
  for (let i = 0; i < m.groupSize; i++) {
    const a = rand(0, Math.PI * 2), rr = rand(0, 24);
    const u = spawnMob(type, x + Math.cos(a) * rr, y + Math.sin(a) * rr, false, month);
    u.mobGroup = shared;
    out.push(u);
  }
  return out;
}
function updateMob(u, dt) {
  const m = MOBS[u.mobType];
  /* v2.0 公共事故：周期召援兵；到期未击杀 → 玩家锅值 +potFail 并自爆消失 */
  if (m.publicIncident) {
    u.incidentT -= dt;
    u.incidentSpawnT -= dt;
    if (u.incidentSpawnT <= 0) {
      u.incidentSpawnT = m.incidentSpawnCd || 5;
      const helperType = m.incidentSpawn;
      if (helperType && MOBS[helperType]) {
        for (let i = 0; i < 2; i++) {
          const a = rand(0, Math.PI * 2), rr = rand(20, 60);
          spawnMob(helperType, u.x + Math.cos(a) * rr, u.y + Math.sin(a) * rr, false, u.mobMonth);
        }
      }
    }
    if (u.incidentT <= 0) {
      const pot = m.potFail || 18;
      G.player.pot = Math.min(100, (G.player.pot || 0) + pot);
      addFeed(`公共事故「${m.publicIncident}」失控：锅值 +${pot}`, true);
      addFx({ type: 'boom', x: u.x, y: u.y, r: 60, color: '#ff4f4f', life: .4 });
      addFloat(u.x, u.y - 22, `锅 +${pot}`, '#ff6a6a', 9, 1.2);
      /* 锅值爆表兑现——之前 pot 只涨不用，威胁纯属恐吓 */
      if (G.player.pot >= 100 && G.player.alive) {
        G.player.pot = 0;
        G.player.reportedT = Math.max(G.player.reportedT || 0, 6);
        G.player.vulnT = Math.max(G.player.vulnT || 0, 4);
        G.player.vulnBonus = Math.max(G.player.vulnBonus || 0, .15);
        warn('🧾 锅值爆表：季度审计立案——6 秒被全场举报 + 易伤');
        addFeed('锅值攒满 100：被立案审计', true);
        SFX.deny(); addShake(4);
      }
      u.alive = false; u.hp = 0;
    }
    return;
  }
  /* 深夜加班灯：静止环境怪，不追击，只在玩家进入光照范围时持续刷新易伤（复用 vulnT） */
  if (m.lampR) {
    if (dist2(u.x, u.y, G.player.x, G.player.y) < m.lampR * m.lampR) G.player.vulnT = Math.max(G.player.vulnT, .3);
    return;
  }
  /* v18：死线警报——站桩，周期性在玩家脚下画预警圈 1s 后爆炸（复用 explodeAt） */
  if (m.alarmR) {
    u.alarmT = (u.alarmT ?? m.alarmCd) - dt;
    if (u.alarmT <= 0) {
      u.alarmT = m.alarmCd;
      const px = G.player.x, py = G.player.y;
      addFx({ type: 'boom', x: px, y: py, r: m.alarmR, color: '#ffcf33', life: m.alarmDelay });
      delay(() => {
        if (u.alive) explodeAt(px, py, m.alarmR, m.alarmDmg, u, '#ff4f4f');
      }, m.alarmDelay);
    }
    return;   // 站桩不移动
  }
  /* v18：email 存在超 5s 自动升级为"加急版"——静态怪也有生前变化 */
  if (m.upgradeAfter) {
    u.elapsedT = (u.elapsedT || 0) + dt;
    if (u.elapsedT >= m.upgradeAfter && !u.upgraded) {
      u.upgraded = true;
      const newM = MOBS[m.upgradeTo];
      u.mobType = m.upgradeTo;
      u.spdBase = newM.spd * (u.spdBase / m.spd);   // 保持个体差异
      u.mobTouch = newM.touch * (u.mobTouch / m.touch);
      u.spr = SPR[newM.spr];
      u.sprKey = newM.spr;
      if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 12, '加急！', '#ff4f4f', 7, .8);
    }
  }
  /* v18：cc_bomb 生前每 3.5s 向四周发射低伤追踪弹（当玩家在 260px 范围内时） */
  if (m.fireCd && m.fireBulletCount) {
    u.mobFireCd = (u.mobFireCd ?? m.fireCd) - dt;
    const dPl = dist2(u.x, u.y, G.player.x, G.player.y);
    if (u.mobFireCd <= 0 && dPl < m.fireTriggerR * m.fireTriggerR) {
      u.mobFireCd = m.fireCd;
      for (let i = 0; i < m.fireBulletCount; i++) {
        const a = (i / m.fireBulletCount) * Math.PI * 2 + rand(-.15, .15);
        spawnBullet(u, a, { dmg: m.fireBulletDmg, spd: m.fireBulletSpd, range: m.fireBulletRange,
          shape: 'dot', r: 2, color: '#ff9440', homing: .5 });
      }
    }
  }
  /* v18：钓鱼邮件——保持距离 200-260px + 周期性发射钓鱼链接减速弹（只做保距+射，不接触伤害）
   * 钓鱼邮件保距射手：原条件 !u.trialSubWave 与它唯一的生成路径（试用期波次）互斥，
   * 远程射手机制从未在任何对局出现过。保距目标 230px 仍在玩家可打范围内，波次不会卡。
   * v2.2：PUA 大师复用本分支（fireBulletVuln 弹=画的饼，命中挂易伤） */
  if (m.keepDist && (m.fireBulletSlow || m.fireBulletVuln)) {
    u.mobFireCd = (u.mobFireCd ?? m.fireCd) - dt;
    const px = G.player.x, py = G.player.y;
    const dPl = Math.hypot(u.x - px, u.y - py);
    const optimalDist = m.keepDist;
    if (Math.abs(dPl - optimalDist) > m.keepDistTol) {
      const away = dPl < optimalDist;   // 太近就往外挪
      const a = Math.atan2(py - u.y, px - u.x) + (away ? Math.PI : 0);
      moveWithCollide(u, Math.cos(a), Math.sin(a), dt);
    } else {
      moveWithCollide(u, 0, 0, dt);
    }
    if (u.mobFireCd <= 0 && dPl < m.fireTriggerR) {
      u.mobFireCd = m.fireCd;
      const a = Math.atan2(py - u.y, px - u.x);
      spawnBullet(u, a, { dmg: m.fireBulletDmg, spd: m.fireBulletSpd, range: m.fireBulletRange,
        shape: 'dot', r: 3, color: m.fireBulletVuln ? '#ffcf33' : '#b665ff',
        curse: m.fireBulletVuln ? null : { id: 'overfit', dur: 2 }, vuln: m.fireBulletVuln || null });
    }
    return;   // 保距射手不走"追击撞击"路径
  }
  /* ---------- v2.2 新增行为品类 ---------- */
  /* KPI 气球：近身点燃引信（预警圈）→ 站定膨胀 → 自爆；死亡走 killUnit 保证波次计数 */
  if (m.kamikaze) {
    if (u.fuseT !== undefined) {
      u.fuseT -= dt;
      if (Math.random() < dt * 20) addParts(u.x, u.y - 6, '#ff6a6a', 1, 30, .25);
      if (u.fuseT <= 0) {
        explodeAt(u.x, u.y, m.kamikaze.r, m.kamikaze.dmg * (1 + .15 * ((u.mobMonth || 1) - 1)), u, '#ff6a6a');
        killUnit(u, null, 'explode');
        return;
      }
      moveWithCollide(u, 0, 0, dt);
      return;
    }
    if (G.player.alive && dist2(u.x, u.y, G.player.x, G.player.y) < 52 * 52) {
      u.fuseT = m.kamikaze.fuse;
      addFx({ type: 'ringwarn', x: u.x, y: u.y, r: m.kamikaze.r, color: '#ff6a6a', life: m.kamikaze.fuse });
      if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 12, 'KPI 要爆了！', '#ff6a6a', 7, .6);
    }
    /* 未点燃时落到普通追击路径 */
  }
  /* 狼性文化训练生：中距离蓄力（红线预警）→ 高速突进 → 冷却；其余时间普通追击 */
  if (m.charger) {
    const pl2 = G.player;
    if (u.dashPhase === 'wind') {
      u.phaseT -= dt; u.mobHitT -= dt;
      if (pl2.alive) u.aim = Math.atan2(pl2.y - u.y, pl2.x - u.x);
      moveWithCollide(u, 0, 0, dt);
      if (u.phaseT <= 0) { u.dashPhase = 'dash'; u.phaseT = m.charger.dashT; u.dashDir = u.aim; }
      return;
    }
    if (u.dashPhase === 'dash') {
      u.phaseT -= dt; u.mobHitT -= dt;
      const boost = m.charger.dashSpd / u.spdBase;
      moveWithCollide(u, Math.cos(u.dashDir) * boost, Math.sin(u.dashDir) * boost, dt);
      u.walkT += dt * 10;
      if (pl2.alive && u.mobHitT <= 0 && dist(u.x, u.y, pl2.x, pl2.y) < u.r + pl2.r + 4) {
        u.mobHitT = .8;
        applyDamage(pl2, u.mobTouch * 1.6, u, { stun: .12 });
      }
      if (u.phaseT <= 0) { u.dashPhase = null; u.chargeCd = m.charger.cd; }
      return;
    }
    u.chargeCd = (u.chargeCd ?? rand(.4, 1.4)) - dt;
    if (pl2.alive && u.chargeCd <= 0) {
      const dP = dist(u.x, u.y, pl2.x, pl2.y);
      if (dP < 230 && dP > 40) {
        u.dashPhase = 'wind'; u.phaseT = m.charger.windup;
        addFx({ type: 'beam', x1: u.x, y1: u.y, x2: pl2.x, y2: pl2.y, w: 2, color: '#ff6a6a', life: m.charger.windup });
        if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 12, '狼性冲锋！', '#ff6a6a', 7, .7);
        moveWithCollide(u, 0, 0, dt);
        return;
      }
    }
    /* 冷却/超距期间落到普通追击路径 */
  }
  /* 工资小偷：满场偷吃经验豆（吃进肚里），被玩家逼近就跑；死亡吐 1.5 倍（见 killUnit） */
  if (m.thief) {
    u.mobHitT -= dt;
    let bag = null, bd2 = 420 * 420;
    for (const p2 of G.pickups) {
      if (p2.dead || p2.type !== 'xp') continue;
      const d2v = dist2(u.x, u.y, p2.x, p2.y);
      if (d2v < bd2) { bd2 = d2v; bag = p2; }
    }
    const pl2 = G.player;
    if (bag) {
      const a = Math.atan2(bag.y - u.y, bag.x - u.x);
      u.aim = a; moveWithCollide(u, Math.cos(a), Math.sin(a), dt); u.walkT += dt * 8;
      if (bd2 < 9 * 9) {
        bag.dead = true;
        u.stolenXp = (u.stolenXp || 0) + (bag.amt || 1);
        if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 10, '¥ 到手', '#ffcf33', 6, .6);
      }
    } else if (pl2.alive && dist2(u.x, u.y, pl2.x, pl2.y) < 200 * 200) {
      const a = Math.atan2(u.y - pl2.y, u.x - pl2.x);   // 没豆可偷就避着玩家跑
      u.aim = a; moveWithCollide(u, Math.cos(a), Math.sin(a), dt); u.walkT += dt * 8;
    } else moveWithCollide(u, 0, 0, dt);
    return;
  }
  /* 全员会议黑洞：把范围内的玩家往自己身上吸（不打断行动，纯位移压力） */
  if (m.pullR && G.player.alive) {
    const pl2 = G.player;
    const dP2 = dist2(u.x, u.y, pl2.x, pl2.y);
    if (dP2 < m.pullR * m.pullR && dP2 > 24 * 24) {
      const a = Math.atan2(u.y - pl2.y, u.x - pl2.x);
      const pull = (m.pullPow || 40) * dt;
      pl2.x += Math.cos(a) * pull; pl2.y += Math.sin(a) * pull;
      if (Math.random() < dt * 6) addParts(pl2.x + rand(-6, 6), pl2.y + rand(-6, 6), '#b665ff', 1, 24, .3);
    }
  }
  /* 加班蜗牛：身后拖减速粘液带（复用燃烧区 slow 通道，只影响玩家阵营） */
  if (m.slowTrail) {
    u.trailT = (u.trailT ?? 0) - dt;
    if (u.trailT <= 0) {
      u.trailT = m.slowTrail.drop;
      G.burns.push({ x: u.x, y: u.y, r: m.slowTrail.r, dps: 0, slow: m.slowTrail.slow, life: m.slowTrail.life, t: 0, owner: u, color: '#38d3e8' });
    }
  }
  /* HR 实习生：周期呼叫支援（召唤物 trialSubWave 置空，不影响波次目标计数） */
  if (m.summon) {
    u.sumCd = (u.sumCd ?? m.summon.cd * rand(.4, .9)) - dt;
    if (u.sumCd <= 0) {
      u.sumCd = m.summon.cd;
      const kin = G.units.filter(x => x.alive && x.isMob && x.summonedBy === u).length;
      if (kin < m.summon.cap && G.player.alive && dist2(u.x, u.y, G.player.x, G.player.y) < 400 * 400) {
        for (let i = 0; i < m.summon.count; i++) {
          const s = spawnMob(m.summon.type, u.x + rand(-24, 24), u.y + rand(-24, 24), false, u.mobMonth);
          s.summonedBy = u; s.trialSubWave = null;
        }
        if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 12, '呼叫支援！', '#ff9edb', 7, .8);
      }
    }
  }
  /* 需求评审会：据点型不移动，给附近其它杂鱼持续刷新"评审通过"加速标记（speedOf 里读取），
     怪死亡后标记自然到期，不需要手动复位，避免"评审会死了但杂鱼还留有加速buff"的残留状态 */
  if (m.reviewR) {
    for (const o of G.units) if (o !== u && o.isMob && o.alive && dist2(u.x, u.y, o.x, o.y) < m.reviewR * m.reviewR) o.reviewBoostT = .6;
    return;
  }
  /* 深夜返工提醒：受伤攒"返工值"，攒够触发0.8秒高频冲刺，随后2秒虚弱期更好打——
     逼玩家瞬间爆发而非持续磨血，真实hp条全程如实反映伤害，不绕开 applyDamage 假设 */
  if (m.reworkThreshold) {
    if (u._lastHp === undefined) u._lastHp = u.hp;
    if (u.hp < u._lastHp) u.reworkMeter = (u.reworkMeter || 0) + (u._lastHp - u.hp);
    u._lastHp = u.hp;
    if (!u.reworkPhase && u.reworkMeter >= m.reworkThreshold) {
      u.reworkMeter = 0; u.reworkPhase = 'sprint'; u.reworkPhaseT = .8;
    } else if (u.reworkPhase === 'sprint') {
      u.reworkPhaseT -= dt;
      if (u.reworkPhaseT <= 0) { u.reworkPhase = 'exhausted'; u.reworkPhaseT = 2; u.mods.dmgTaken = 1.4; }
    } else if (u.reworkPhase === 'exhausted') {
      u.reworkPhaseT -= dt;
      if (u.reworkPhaseT <= 0) { u.reworkPhase = null; u.mods.dmgTaken = 1; }
    }
  }
  /* 加急会议提醒：无接触伤害，靠自身位置周期推送小范围减速+dot区（复用 G.burns 燃烧区结算，
     speedOf()/updateUnit() 里已有的 isFoe+dist2 判定天然生效，不需要新的伤害管线） */
  if (m.auraR) {
    u.auraPushT = (u.auraPushT || 0) - dt;
    if (u.auraPushT <= 0) {
      u.auraPushT = .3;
      G.burns.push({ x: u.x, y: u.y, r: m.auraR, dps: m.auraDot, slow: m.auraSlowPct, life: .45, t: 0, owner: u, color: '#ff9440' });
    }
  }
  /* 会议邀请：周期性"改期"消失+短暂无敌+就近重新出现，逼玩家不能对单只挂机磨 */
  if (m.vanishEvery) {
    u.vanishCd = (u.vanishCd === undefined ? m.vanishEvery : u.vanishCd) - dt;
    if (u.invulnT <= 0 && u.vanishCd <= 0) {
      u.invulnT = m.vanishDur;
      u.vanishCd = m.vanishEvery;
      const va = rand(0, Math.PI * 2);
      u.x = clamp(u.x + Math.cos(va) * 40, 30, TUNE.world - 30);
      u.y = clamp(u.y + Math.sin(va) * 40, 30, TUNE.world - 30);
    }
  }
  u.mobHitT -= dt;
  if (!u.mobTarget || !u.mobTarget.alive || u.mobTarget.hiddenT > 0 || Math.random() < .008) {
    /* 隐身（贴绿植/临时下线）与低仇恨（办公室小透明 aggro<1）现在对杂鱼也生效——
     * 原来只有同事 AI 看这两个字段，试用期整个隐身/仇恨体系对怪物无效 */
    u.mobTarget = nearestUnit(u.x, u.y, 600, t => isWorker(t) && t.alive && !t.isSummon && !(t.hiddenT > 0)
      && !(t.isPlayer && t.mods.aggro < 1 && dist2(u.x, u.y, t.x, t.y) > (600 * t.mods.aggro) * (600 * t.mods.aggro)));
  }
  const t = u.mobTarget;
  if (!t) { moveWithCollide(u, 0, 0, dt); return; }
  /* 门口寻路：目标和自己隔着房间墙（一内一外）时先冲门缺口，穿门后再直线追击——
     不然贴墙推死也进不来（滑动碰撞只能沿墙蹭，蹭不到门就卡死）
     （v2.1 无墙版 rooms 恒为空，这段零开销空转，留作房间体系复活时的保险） */
  let tx = t.x + u.chaseOffX, ty = t.y + u.chaseOffY;
  for (const R of G.rooms) {
    const uIn = u.x > R.x0 && u.x < R.x1 && u.y > R.y0 && u.y < R.y1;
    const tIn = t.x > R.x0 && t.x < R.x1 && t.y > R.y0 && t.y < R.y1;
    if (uIn !== tIn) {
      if (dist2(u.x, u.y, R.dx, R.dy) > 30 * 30) { tx = R.dx; ty = R.dy; }
      break;
    }
  }
  const a = Math.atan2(ty - u.y, tx - u.x) + (m.jig ? Math.sin(G.t * 5 + u.x * .1) * .6 : 0);
  u.aim = a;
  moveWithCollide(u, Math.cos(a), Math.sin(a), dt);
  if (u.mobHitT <= 0 && u.mobTouch > 0 && dist(u.x, u.y, t.x, t.y) < u.r + t.r + 2) {
    u.mobHitT = u.reworkPhase === 'sprint' ? .33 : 1;   // 深夜返工提醒冲刺期：触碰频率×3
    applyDamage(t, u.mobTouch || m.touch, u);
  }
}

/* ---------- AI 替身：亲手击杀小 Boss 后蒸馏出的召唤物 ---------- */
function spawnSummon(owner, bossType) {
  /* 同时只养一个：新替身上岗，旧替身优化下岗 */
  const old = G.units.find(u => u.isSummon && u.alive && u.allyOwner === owner);
  if (old) {
    old.alive = false;
    addParts(old.x, old.y, '#d9b3ff', 10, 70, .5);
    addFeed(`旧替身 ${old.name} 已被优化下岗`, false);
  }
  const e = ELITES[bossType];
  /* 近战型替身（卷王实习生）要冲脸，多给点血 */
  const s = makeUnit(`AI·${e.name}替身`, owner.x + rand(12, 20), owner.y + rand(-8, 8),
    { hp: bossType === 'intern' ? 100 : 60, spd: 150, shirt: ELITE_SKINS[bossType] || '#d9b3ff' });
  s.isSummon = true; s.summonType = bossType;
  addFx({ type: 'summonfx', x: s.x, y: s.y, r: 14, life: .45 });
  s.allyOwner = owner; s.allyUntil = Infinity;   // 替身不会离职（除非被打报废）
  s.r = 4; s.level = 3;
  G.units.push(s);
  addFeed(`你 部署了 ${s.name}（1 名同事已被 AI 替代）`, true);
  addParts(s.x, s.y, '#d9b3ff', 20, 100, .7);
  SFX.fuse();
}
function updateSummon(u, dt) {
  const owner = u.allyOwner;
  if (!owner || !owner.alive) { u.alive = false; return; }
  const dOwner = dist(u.x, u.y, owner.x, owner.y);
  let tgt = owner.opcFocusT > 0 && owner.opcFocusTarget && owner.opcFocusTarget.alive ? owner.opcFocusTarget
    : nearestUnit(u.x, u.y, u.opcSummon ? 260 : 190, t => isFoe(u, t));
  let mvx = 0, mvy = 0;
  if (u.opcSummon) {
    if (tgt && (dOwner < 250 || owner.opcFocusT > 0)) {
      const a = Math.atan2(tgt.y - u.y, tgt.x - u.x);
      u.aim = a;
      if (u.summonType === 'opc_wall' && dist2(u.x, u.y, tgt.x, tgt.y) > 22 * 22) {
        mvx = Math.cos(a); mvy = Math.sin(a);
      } else if (dOwner > 130) {
        const b = Math.atan2(owner.y - u.y, owner.x - u.x);
        mvx = Math.cos(b); mvy = Math.sin(b);
      }
    } else if (dOwner > 48) {
      const a = Math.atan2(owner.y - u.y, owner.x - u.x);
      mvx = Math.cos(a); mvy = Math.sin(a); u.aim = a;
    }
    moveWithCollide(u, mvx, mvy, dt);
    u.sumT -= dt;
    if (u.sumT > 0) return;
    if (!tgt) { u.sumT = .35; return; }
    if (u.summonType === 'opc_wall') {
      if (dist2(u.x, u.y, tgt.x, tgt.y) < (u.r + tgt.r + 12) * (u.r + tgt.r + 12)) {
        u.sumT = u.opcShotCd || .9;
        applyDamage(tgt, 8 * owner.mods.dmg * (1 + (owner.mods.summonDmg || 0)), u, { stun: .18 });
      } else u.sumT = .2;
    } else {
      u.sumT = (u.opcShotCd || .7) / Math.min(1.6, fireRateOf(owner));
      if (owner.mods.__evoOutsourceEmpire) {
        tgt.vulnT = Math.max(tgt.vulnT || 0, .5);
        tgt.vulnBonus = Math.max(tgt.vulnBonus || 0, .10);
      }
      spawnBullet(u, Math.atan2(tgt.y - u.y, tgt.x - u.x) + rand(-.05, .05),
        { dmg: Math.max(3, wpnDmg(owner) * (u.opcDmgMul || .35)), spd: 310, range: 250,
          shape: u.summonType === 'opc_clone' ? 'streak' : 'dot', color: u.opcSenior ? '#ffcf33' : '#9ad1ff',
          _echo: true, pierce: u.opcSenior || owner.mods.__evoOutsourceEmpire ? 1 : 0 });
    }
    return;
  }
  /* 跟随主人；卷王替身会主动扑向敌人 */
  if (u.summonType === 'intern' && tgt && dOwner < 220) {
    const a = Math.atan2(tgt.y - u.y, tgt.x - u.x);
    mvx = Math.cos(a); mvy = Math.sin(a);
    u.aim = a;
  } else if (dOwner > 42) {
    const a = Math.atan2(owner.y - u.y, owner.x - u.x);
    mvx = Math.cos(a); mvy = Math.sin(a);
    u.aim = a;
  } else if (tgt) u.aim = Math.atan2(tgt.y - u.y, tgt.x - u.x);
  moveWithCollide(u, mvx, mvy, dt);

  u.sumT -= dt;
  if (u.sumT > 0) return;
  const T = u.summonType;
  const om = owner.mods.dmg;   // 替身伤害随主人成长
  if (T === 'ppt') {
    if (!tgt) { u.sumT = .5; return; }
    u.sumT = 3;
    spawnBullet(u, Math.atan2(tgt.y - u.y, tgt.x - u.x), { dmg: 7 * om, spd: 210, range: 200, shape: 'slide', r: 3, color: '#e8e4d8', _echo: true });
  } else if (T === 'meeting') {
    if (!tgt) { u.sumT = .5; return; }
    u.sumT = 7;
    G.burns.push({ x: tgt.x, y: tgt.y, r: 30, dps: 2 * om, slow: .3, life: 3, t: 0, owner: u, color: '#6aa3ff' });
  } else if (T === 'snitch') {
    if (!tgt || tgt.isElite || tgt.isBoss || tgt.isHR || !tgt.bot) { u.sumT = 1; return; }
    u.sumT = 10;
    tgt.reportedT = 4;
    addFloat(tgt.x, tgt.y - 20, '已被替身举报', '#ff4f4f', 7, 1);
  } else if (T === 'upman') {
    u.sumT = 6;
    owner.empowerT = 2;
    owner.hp = Math.min(maxHp(owner), owner.hp + 4);
    if (owner.isPlayer) addFloat(owner.x, owner.y - 16, '替身赋能 +4HP', '#c9a227', 6, .7);
  } else if (T === 'intern') {
    if (!tgt || dist(u.x, u.y, tgt.x, tgt.y) > u.r + tgt.r + 4) { u.sumT = .2; return; }
    u.sumT = 1;
    applyDamage(tgt, 6 * om, u);
  } else if (T === 'attendance') {
    u.sumT = 8;
    let hitAny = false;
    for (const t2 of G.units) {
      if (!isFoe(u, t2) || dist2(u.x, u.y, t2.x, t2.y) > 80 * 80) continue;
      if (t2.standT > .45) { applyDamage(t2, 8 * om, u); hitAny = true; }
    }
    if (hitAny) addFx({ type: 'boom', x: u.x, y: u.y, r: 80, color: '#ffcf33', life: .25 });
  } else u.sumT = 1;
}

/* ---------- 老板反向蒸馏：随机复制玩家的技能/模组（不夺走） ---------- */
const BOSS_STEAL_LINES = ['你的方案不错，现在是我的了。', '这个思路很好，下次开会我来讲。', '年轻人的东西，我学得很快。'];
function bossDistill(boss) {
  const pl = G.player;
  const A = boss.bossAI, bb = A.buff;
  const pool = [
    ...Object.keys(pl.skills).map(id => ({ kind: 'skill', id })),
    ...Object.keys(pl.tech).map(id => ({ kind: 'tech', id })),
  ].filter(p => !A.distilledIds.includes(p.id));   // 同一能力只偷一次
  if (!pool.length) {
    addFloat(boss.x, boss.y - 34, '“你身上没什么可学的。”', '#d9b3ff', 8, 2);
    return;
  }
  const picked = pick(pool);
  A.distilledIds.push(picked.id);
  /* 能走通用单位系统的直接走（闪避/复活/光环/炮台/护盾都是真的） */
  const EFFECTS = {
    juanwang: () => { bb.dmg *= 1.2; return '弹幕伤害+20%'; },
    moyu_master: () => { boss.spdBase *= 1.15; return '移速+15%'; },
    desk_fengshui: () => { boss.hpBase += 250; boss.hp += 250; return '+250 血'; },
    resume_gilding: () => { boss.hpBase += 200; boss.hp += 200; return '+200 血'; },
    pua_immunity: () => { boss.mods.dmgTaken *= .85; return '受伤-15%'; },
    fubao_996: () => { bb.rate *= 1.2; return '攻速+20%'; },
    blame_master: () => { boss.mods.dodge = 1 - (1 - boss.mods.dodge) * .8; return '20%闪避'; },
    n_plus_one: () => { boss.mods.revive = 1; return '获得一次复活'; },
    quit_threat: () => { boss.mods.lowHpSpd += .3; return '残血加速'; },
    huabing: () => { boss.mods.killHeal += 30; return '击杀回血'; },
    toxic_aura: () => { boss.mods.auraDmg += 3; return '获得毒瘤光环'; },
    paid_toilet: () => { boss.mods.standRegen += 5; return '站定回血'; },
    temp: () => { boss.mods.crit += .2; return '20%暴击'; },
    quant: () => { bb.rate *= 1.15; return '攻速+15%'; },
    kvcache: () => { bb.rate *= 1.15; return '攻速+15%'; },
    fewshot: () => { bb.pies += 4; return '环形大饼+4'; },
    attention: () => { bb.homing = 2.2; return '大饼追踪'; },
    ctxwin: () => { bb.range *= 1.25; return '弹幕射程+25%'; },
    sysprompt: () => { boss.shield = 120; boss.shieldT = 9999; return '+120 护盾'; },
    rag: () => { boss.mods.rag = 2; return '召唤知识库炮台'; },
  };
  const skillDef = SKILLS.find(s => s.id === picked.id);
  const label = picked.kind === 'skill' ? (skillDef ? skillDef.name : picked.id) : TECH[picked.id].name;
  const fx = EFFECTS[picked.id];
  const effectDesc = fx ? fx() : (bb.dmg *= 1.08, boss.spdBase *= 1.05, '学了个皮毛');
  A.distilled.push(label);
  /* DPS 镜像：不管玩家靠什么系统变强，Boss 弹幕按其综合火力指数加成
   * v18 修正：原公式漏采样 crit/range/传说三大乘区（Ultra Temp 57% 暴击是玩家最大乘区），补齐；
   * bb.dmg 累计上限 3→4，单次 min(0.4)→min(0.6)、系数 0.08→0.06（放宽单次上限、放缓单位递增） */
  const pw = pl.mods.dmg
    * Math.min(4, pl.mods.fireRate)
    * (1 + pl.mods.multishot * pl.mods.echoMult * .7)
    * (1 + pl.mods.crit * 1.5)
    * pl.mods.range
    * (pl.weapon.leg ? 1.3 : 1);
  bb.dmg = Math.min(4, bb.dmg * (1 + Math.min(.6, .06 * pw)));
  addFx({ type: 'bolt', pts: [{ x: pl.x, y: pl.y - 6 }, { x: boss.x, y: boss.y - 10 }], color: '#b665ff', life: .5 });
  addFloat(boss.x, boss.y - 34, `“${pick(BOSS_STEAL_LINES)}”`, '#d9b3ff', 8, 2.2);
  addFeed(`老板 蒸馏了你的「${label}」（${effectDesc}）`, true);
  addShake(4);
  SFX.fuse();
}

function updateBoss(u, dt) {
  const A = u.bossAI, bb = A.buff;
  const tgt = nearestUnit(u.x, u.y, 99999, t => t.alive && !t.isBoss && !t.isHR && !t.isElite && !t.isMob);
  if (!tgt) return;
  const d = dist(u.x, u.y, tgt.x, tgt.y);
  const a = Math.atan2(tgt.y - u.y, tgt.x - u.x);
  u.aim = a;
  let mvx = 0, mvy = 0;
  if (d > 110) { mvx = Math.cos(a); mvy = Math.sin(a); }
  moveWithCollide(u, mvx, mvy, dt);
  u.walkT += dt * 6;

  /* v2.0 五阶段切换：按 hp% 触发，每次进入新阶段刷 buff + 一次特殊事件 */
  {
    const pct = u.hp / maxHp(u);
    let target = 0;
    for (let i = 0; i < FINAL_BOSS_PHASES.length; i++) {
      if (pct <= FINAL_BOSS_PHASES[i].hpFrom && pct > FINAL_BOSS_PHASES[i].hpTo) { target = i; break; }
      if (pct <= FINAL_BOSS_PHASES[i].hpTo) target = i;   // 掉到更下一阶段
    }
    if (target > A.phaseIdx) {
      A.phaseIdx = target;
      const ph = FINAL_BOSS_PHASES[target];
      bb.pies = (bb.pies || 0) + (ph.buff.pies || 0);
      bb.rate = Math.max(bb.rate || 1, ph.buff.rate || 1);
      bb.homing = Math.max(bb.homing || 0, ph.buff.homing || 0);
      bb.range = Math.max(bb.range || 1, ph.buff.range || 1);
      warn(ph.intro);
      addFeed(ph.intro, true);
      addShake(5); SFX.boss();
      /* P3 组织架构：全场同事随机传送 */
      if (ph.buff.teleport) {
        for (const other of G.units) {
          if (!other.alive || other.isBoss || other.isPlayer) continue;
          other.x = clamp(other.x + rand(-160, 160), 20, TUNE.world - 20);
          other.y = clamp(other.y + rand(-160, 160), 20, TUNE.world - 20);
          other.stunT = Math.max(other.stunT, 1);
        }
      }
    }
  }

  /* 反向蒸馏：开场 5 秒后第一次，之后每 18 秒（狂暴后上限 +1） */
  A.distillT -= dt;
  if (A.distillT <= 0 && A.distillCount < A.distillCap && G.player.alive) {
    A.distillT = 18;
    A.distillCount++;
    bossDistill(u);
  }
  /* 75% 血量狂暴前置 + 8 秒护盾 + 立即释放饼阵——让第二阶段真的存在，不再"触发即毕业"
   * v18 修正：阈值从 0.5 抬到 0.75；狂暴期 dmgTaken*=0.7；给自身 15%maxHp 8 秒盾；
   * 强制 pieT=0.3 立刻放一次饼阵，玩家能立刻看到"变形"而不是只听到警告音 */
  if (!A.enraged && u.hp < maxHp(u) * .75) {
    A.enraged = true;
    A.distillCap = 4; A.distillT = Math.min(A.distillT, 1);
    bb.rate *= 1.4; bb.pies += 6;
    u.mods.dmgTaken *= .7;
    u.shield = Math.max(u.shield, maxHp(u) * .15); u.shieldT = 8;
    A.pieT = Math.min(A.pieT, .3);
    warn('💢 老板进入狂暴："这季度谁都别想好过！"');
    addShake(6); SFX.boss();
    BGM.enrageBoss();
  }

  const r = bb.rate;
  A.pieT -= dt * r; A.burstT -= dt * r; A.summonT -= dt; A.shoutT -= dt; A.touchT -= dt;
  if (A.pieT <= 0) {
    A.pieT = 4;
    addFx({ type: 'bosspiefx', x: u.x, y: u.y - 10, r: 30, life: .9 });   // 画大饼演出
    for (let i = 0; i < 12 + bb.pies; i++)
      spawnBullet(u, i / (12 + bb.pies) * Math.PI * 2 + rand(-.05, .05),
        { dmg: 12 * bb.dmg, spd: 135, range: 330 * bb.range, shape: 'pie', r: 4, color: '#ffcf33', pierce: 0 });
    if (nearPlayer(u.x, u.y)) SFX.explo();
  }
  if (A.burstT <= 0 && d < 330) {
    A.burstT = 2.2;
    for (let i = -1; i <= 1; i++)
      spawnBullet(u, a + i * .18, { dmg: 10 * bb.dmg, spd: 220, range: 350 * bb.range, shape: 'pie', r: 3, color: '#ffcf33', homing: bb.homing });
  }
  if (A.summonT <= 0) {
    /* v18：召唤间隔随 Boss 血量线性缩短，Boss 越残召唤越勤（满血 18s → 0血 7.2s）
     * cap 4 → 6，配合 v18 无尽模式设计里的"HR 潮"节奏 */
    const hpRatio = u.hp / maxHp(u);
    A.summonT = 18 * (0.4 + 0.6 * hpRatio);
    if (G.units.filter(t => t.isHR && t.alive).length < 6) {
      addFx({ type: 'bossroarfx', x: u.x, y: u.y - 8, r: 26, life: .7 });   // 咆哮点名
      spawnHR(u.x - 24, u.y); spawnHR(u.x + 24, u.y);
      addFeed('老板 拉了两个 HR 进会', true);
    }
  }
  if (A.shoutT <= 0) {
    A.shoutT = 6;
    addFloat(u.x, u.y - 30, `“${pick(COPY.bossLines)}”`, '#d9b3ff', 8, 2.2);
    if (d < 140) {
      const push = Math.atan2(tgt.y - u.y, tgt.x - u.x);
      tgt.x += Math.cos(push) * 34; tgt.y += Math.sin(push) * 34;
      applyDamage(tgt, 5, u);
      addFx({ type: 'bossslamfx', x: u.x, y: u.y, r: 34, life: .55 });   // 拍桌冲击波
      addFx({ type: 'boom', x: u.x, y: u.y, r: 60, color: '#b665ff', life: .3 });
    }
  }
  if (A.touchT <= 0 && d < u.r + tgt.r + 4) {
    A.touchT = .8;
    applyDamage(tgt, 15 * bb.dmg, u);
    const push = Math.atan2(tgt.y - u.y, tgt.x - u.x);
    tgt.x += Math.cos(push) * 22; tgt.y += Math.sin(push) * 22;
  }
}

/* ---------- 精英野怪 ---------- */
const ELITE_SKINS = {
  hallu: null,               // 用幽灵精灵
  overfit: '#c0392b',
  injector: '#5b2f8e',
  align: '#7f8c9a',
  ppt: '#e8e4d8',            // 白衬衫路演装
  upman: '#c9a227',          // 金色马甲
  snitch: '#556677',
};
function spawnElite(type, near, hpMult = 1) {
  const e = ELITES[type] || DEPT_BOSSES[type];   // v2.0：部门 Boss 复用精英生成路径
  let pos;
  if (near) {
    /* 定向投放（月度考核：冲着你来） */
    const a = rand(0, Math.PI * 2);
    pos = { x: clamp(near.x + Math.cos(a) * 320, 40, TUNE.world - 40),
            y: clamp(near.y + Math.sin(a) * 320, 40, TUNE.world - 40) };
  } else {
    /* 取 20 个候选点中离所有活人最远的——终圈半径极小时退化为刷最远点而非随机贴脸 */
    pos = randPosInZone(G, .8);
    let bestD = -1;
    for (let tries = 0; tries < 20; tries++) {
      const cand = randPosInZone(G, .8);
      let minD = Infinity;
      for (const u of G.units) if (u.alive) minD = Math.min(minD, dist2(u.x, u.y, cand.x, cand.y));
      if (minD > bestD) { bestD = minD; pos = cand; }
      if (bestD > 160 * 160) break;
    }
  }
  const u = makeUnit(e.name, pos.x, pos.y, { hp: Math.round(e.hp * hpMult), spd: e.spd, shirt: ELITE_SKINS[type] || '#c9a0f5' });
  u.isElite = true; u.eliteType = type; u.eliteTier = e.tier; u.level = e.level; u.spdBase = e.spd;
  u.spr = type === 'hallu' ? SPR.ghost : workerSprite(ELITE_SKINS[type]);
  if (type === 'overfit') u.r = 7;
  if (e.tier === 2) u.r = 6;
  /* v2.0 · 16 精英词条：tier-2 精英 60% 概率挂 1 条词条；tier-1 30%；正式阶段 zone.phase>=2 提到 90/60 */
  if (ELITE_AFFIXES && G.zone) {
    const chance = e.tier === 2 ? (G.zone.phase >= 2 ? .9 : .6) : (G.zone.phase >= 2 ? .6 : .3);
    if (Math.random() < chance) {
      const affix = pick(ELITE_AFFIXES);
      u.eliteAffix = affix.id;
      u.name = `[${affix.name}] ${u.name}`;
      try { affix.apply(u); } catch (err) { /* 静默兜底，词条 apply 失败不阻塞刷怪 */ }
    }
  }
  G.units.push(u);
  if (e.tier === 2) { warn((u.eliteAffix ? `[${u.name.match(/\[(.+?)\]/)?.[1] || ''}] ` : '') + e.intro); SFX.zone(); }
  else addFeed(e.intro, false);
  return u;
}
/* =====================================================================
 * v2.3 小 Boss（tier2）博弈招式表：每种考核官一套「预警→爆发」的签名技
 * 全部走 delay() 游戏内队列；标记用 ringwarn/beam 预警，给玩家明确的躲闪窗口
 * ===================================================================== */
const T2_PATTERNS = {
  /* PPT 路演大魔王：三连激光横扫——预警线亮起后 0.6s 依次引爆，站位穿缝 */
  ppt: { dur: 1.9, cast(u, pl, b) {
    const base = Math.atan2(pl.y - u.y, pl.x - u.x);
    for (let i = 0; i < 3; i++) {
      const ang = base + (i - 1) * .55;
      const x2 = u.x + Math.cos(ang) * 240, y2 = u.y + Math.sin(ang) * 240;
      const wait = .6 + i * .35;
      addFx({ type: 'beam', x1: u.x, y1: u.y, x2, y2, w: 2, color: '#ffcf33', life: wait });
      delay(() => {
        if (!u.alive) return;
        addFx({ type: 'beam', x1: u.x, y1: u.y, x2, y2, w: 9, color: '#ff4f4f', life: .18 });
        for (const t of G.units) if (isFoe(u, t) && distToSeg(t.x, t.y, u.x, u.y, x2, y2) < 9 + t.r) applyDamage(t, b, u, { stun: .2 });
        if (nearPlayer(u.x, u.y)) SFX.laser();
      }, wait);
    }
  } },
  /* 向上管理大师：三连冲撞——标记你的落点连撞三下，走位拉开 */
  upman: { dur: 3.1, cast(u, pl, b) {
    for (let i = 0; i < 3; i++) {
      delay(() => {
        if (!u.alive || !pl.alive) return;
        const tx = pl.x, ty = pl.y;
        addFx({ type: 'ringwarn', x: tx, y: ty, r: 46, color: '#ffcf33', life: .55 });
        delay(() => {
          if (!u.alive) return;
          addFx({ type: 'teleportfx', x: u.x, y: u.y - 4, r: 14, life: .3 });
          u.x = tx; u.y = ty;
          addFx({ type: 'boom', x: tx, y: ty, r: 46, color: '#ffcf33', life: .3 });
          for (const t of G.units) if (isFoe(u, t) && dist2(tx, ty, t.x, t.y) < 46 * 46) applyDamage(t, b, u, { stun: .25 });
          addShake(3);
        }, .55);
      }, i * .85);
    }
  } },
  /* 小报告专家：沿你的走位轨迹连贴四张举报单，延迟引爆——别走直线 */
  snitch: { dur: 2.7, cast(u, pl, b) {
    for (let i = 0; i < 4; i++) {
      delay(() => {
        if (!u.alive || !pl.alive) return;
        const tx = pl.x + rand(-16, 16), ty = pl.y + rand(-16, 16);
        addFx({ type: 'ringwarn', x: tx, y: ty, r: 42, color: '#ff9edb', life: .7 });
        delay(() => { if (u.alive) explodeAt(tx, ty, 42, b * .85, u, '#ff9edb'); }, .7);
      }, i * .45);
    }
  } },
  /* 会议邀请官：三个大会议圈套向你，圈落地成减速水渍 */
  meeting: { dur: 2.6, cast(u, pl, b) {
    for (let i = 0; i < 3; i++) {
      delay(() => {
        if (!u.alive || !pl.alive) return;
        const tx = pl.x + rand(-30, 30), ty = pl.y + rand(-30, 30);
        addFx({ type: 'ringwarn', x: tx, y: ty, r: 64, color: '#6aa3ff', life: .8 });
        delay(() => {
          if (!u.alive) return;
          explodeAt(tx, ty, 64, b * .9, u, '#6aa3ff');
          G.burns.push({ x: tx, y: ty, r: 56, dps: 0, slow: .4, life: 2.6, t: 0, owner: u, color: '#6aa3ff' });
        }, .8);
      }, i * .6);
    }
  } },
  /* 卷王实习生：标记你的位置后飞扑重锤——看到圈就跑 */
  intern: { dur: 1.6, cast(u, pl, b) {
    const tx = pl.x, ty = pl.y;
    addFx({ type: 'ringwarn', x: tx, y: ty, r: 62, color: '#ff6a6a', life: .75 });
    delay(() => {
      if (!u.alive) return;
      addFx({ type: 'teleportfx', x: u.x, y: u.y - 4, r: 14, life: .3 });
      u.x = tx; u.y = ty;
      addFx({ type: 'boom', x: tx, y: ty, r: 62, color: '#ff6a6a', life: .35 });
      for (const t of G.units) if (isFoe(u, t) && dist2(tx, ty, t.x, t.y) < 62 * 62) applyDamage(t, b * 1.3, u, { stun: .3 });
      addShake(5); if (nearPlayer(tx, ty)) SFX.explo();
    }, .75);
  } },
  /* 考勤点名官：三点名圈围绕你展开——持续移动穿过空隙 */
  attendance: { dur: 2.4, cast(u, pl, b) {
    for (let i = 0; i < 3; i++) {
      const a = Math.PI * 2 / 3 * i + rand(0, 1);
      const tx = pl.x + Math.cos(a) * 40, ty = pl.y + Math.sin(a) * 40;
      addFx({ type: 'ringwarn', x: tx, y: ty, r: 55, color: '#ffcf33', life: .8 + i * .25 });
      delay(() => { if (u.alive) explodeAt(tx, ty, 55, b, u, '#ffcf33'); }, .8 + i * .25);
    }
  } },
};

function updateElite(u, dt) {
  const e = ELITES[u.eliteType] || DEPT_BOSSES[u.eliteType];
  /* v2.0：部门 Boss/试用期 Boss 用 e.ai 指向已实现的行为分支，绕开新增 AI 代码 */
  const beh = (e && e.ai) || u.eliteType;
  u.touchT -= dt;
  /* v2.3 小 Boss 博弈循环（tier2）：追击 → 签名技预警爆发 → 破绽窗口（易伤+减速，反打时机）
   * 原版小 Boss 只有平砍级的戳，毫无博弈感 */
  if (u.eliteTier === 2 && G.player.alive && T2_PATTERNS[beh]) {
    u.t2T = (u.t2T ?? rand(1.8, 3)) - dt;
    if (!u.t2State) u.t2State = 'chase';
    if (u.t2State === 'chase' && u.t2T <= 0 && dist(u.x, u.y, G.player.x, G.player.y) < 340) {
      const P = T2_PATTERNS[beh];
      const b = (13 + u.level * 1.1) * (u.mods.dmg || 1);
      P.cast(u, G.player, b);
      u.t2State = 'burst'; u.t2T = P.dur;
      u.oaSlowT = Math.max(u.oaSlowT, P.dur * .8);   // 施法期间放慢脚步，演出感
    } else if (u.t2State === 'burst' && u.t2T <= 0) {
      u.t2State = 'recover'; u.t2T = 1.6;
      u.vulnT = Math.max(u.vulnT || 0, 1.6);
      u.vulnBonus = Math.max(u.vulnBonus || 0, .35);
      u.oaSlowT = Math.max(u.oaSlowT, 1.6);
      if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 26, '💢 破绽！狠狠输出！', '#ffcf33', 9, 1.2);
    } else if (u.t2State === 'recover' && u.t2T <= 0) {
      u.t2State = 'chase'; u.t2T = rand(2.6, 3.8);
    }
  }
  /* 精英词条：临时OOO——周期性闪现+短无敌（原来是全工程无消费的空壳标记） */
  if (u._oooBlink) {
    u.oooT = (u.oooT ?? 6) - dt;
    if (u.oooT <= 0 && u.invulnT <= 0) {
      u.oooT = 6;
      u.invulnT = Math.max(u.invulnT, .8);
      const ba = rand(0, Math.PI * 2);
      u.x = clamp(u.x + Math.cos(ba) * 70, 30, TUNE.world - 30);
      u.y = clamp(u.y + Math.sin(ba) * 70, 30, TUNE.world - 30);
      if (nearPlayer(u.x, u.y)) addFloat(u.x, u.y - 18, 'OOO 中，勿 cue', '#38d3e8', 7, .8);
    }
  }

  /* PPT 大师的光锥爆发（预警到期即结算，独立于索敌） */
  if (beh === 'ppt' && u.coneWarnT > 0) {
    u.coneWarnT -= dt;
    if (u.coneWarnT <= 0) {
      addFx({ type: 'coneflash', x: u.x, y: u.y, ang: u.coneAng, spread: .55, len: 150, color: '#ffffff', life: .25 });
      for (const t of G.units) {
        if (!isFoe(u, t)) continue;
        const d2 = dist(u.x, u.y, t.x, t.y);
        if (d2 > 150) continue;
        let da = Math.atan2(t.y - u.y, t.x - u.x) - u.coneAng;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < .55) {
          applyDamage(t, 18 * u.mods.dmg, u, { stun: .8 });   // 精英增伤词条（值班/KPI/P0…）现在真实生效
          if (t.isPlayer) addFloat(t.x, t.y - 22, '被迫听完整场演示', '#e8e4d8', 7, 1);
        }
      }
      if (nearPlayer(u.x, u.y)) SFX.explo();
    }
  }

  const tgt = nearestUnit(u.x, u.y, 900, t => isFoe(u, t) && !t.isBoss && !t.isMob);
  if (!tgt) { moveWithCollide(u, 0, 0, dt); return; }
  const d = dist(u.x, u.y, tgt.x, tgt.y);
  const a = Math.atan2(tgt.y - u.y, tgt.x - u.x);
  if (!(beh === 'ppt' && u.coneWarnT > 0)) u.aim = a;   // 光锥预警期间锁定朝向
  let mvx = Math.cos(a), mvy = Math.sin(a);

  if (beh === 'hallu') {
    const ja = a + Math.sin(G.t * 7 + u.x * .1) * 1.2;
    mvx = Math.cos(ja); mvy = Math.sin(ja);
  } else if (beh === 'injector') {
    u.injT -= dt;
    if (d < 150) { mvx = -mvx; mvy = -mvy; }
    else if (d < 240) { const ta = a + Math.PI / 2; mvx = Math.cos(ta) * .7; mvy = Math.sin(ta) * .7; }
    if (u.injT <= 0 && d < 320) {
      u.injT = 1.6;
      spawnBullet(u, a + rand(-.06, .06),
        { dmg: 7 * u.mods.dmg, spd: 260, range: 340, shape: 'streak', color: '#c58fff',
          curse: { id: pick(['repeat', 'overflow']), dur: 5 } });
    }
  } else if (beh === 'ppt') {
    /* 保持中距离路演 */
    if (d < 120) { mvx = -mvx; mvy = -mvy; }
    else if (d < 220) { const ta = a + Math.PI / 2; mvx = Math.cos(ta) * .6; mvy = Math.sin(ta) * .6; }
    if (u.coneWarnT > 0) { mvx = 0; mvy = 0; }        // 演示中站定
    u.slideT -= dt;
    if (u.slideT <= 0 && d < 300 && u.coneWarnT <= 0) {
      u.slideT = 2.2;
      for (let i = -1; i <= 1; i++)
        spawnBullet(u, a + i * .25, { dmg: 9 * u.mods.dmg, spd: 200, range: 320, shape: 'slide', r: 3, color: '#e8e4d8' });
    }
    u.coneCd -= dt;
    if (u.coneCd <= 0 && d < 140 && u.coneWarnT <= 0) {
      u.coneCd = 8;
      u.coneWarnT = .8;                                 // 0.8 秒黄色预警
      u.coneAng = a;
      addFx({ type: 'cone', x: u.x, y: u.y, ang: a, spread: .55, len: 150, color: '#ffcf33', life: .8 });
      if (nearPlayer(u.x, u.y)) SFX.deny();
    }
  } else if (beh === 'upman') {
    /* 躲着人走，专心给牛马上 buff */
    if (d < 200) { mvx = -mvx; mvy = -mvy; }
    else { mvx *= .3; mvy *= .3; }
    u.auraTickT -= dt;
    if (u.auraTickT <= 0) {
      u.auraTickT = .5;
      for (const t of G.units) {
        if (!t.alive || !t.bot || t.isHR || t.allyOwner === G.player) continue;
        if (dist2(u.x, u.y, t.x, t.y) < 170 * 170) {
          t.empowerT = 1.0;                             // 攻速移速光环（见 wpnDmg/speedOf）
          if (t.hp < maxHp(t)) t.hp = Math.min(maxHp(t), t.hp + 1.5);
        }
      }
    }
    u.pokeT -= dt;
    if (u.pokeT <= 0 && d < 180) {
      u.pokeT = 1.8;
      spawnBullet(u, a, { dmg: 6 * u.mods.dmg, spd: 240, range: 200, shape: 'dot', color: '#c9a227' });
    }
  } else if (beh === 'snitch') {
    /* 远远放风筝，定期打小报告 */
    if (d < 200) { mvx = -mvx; mvy = -mvy; }
    else if (d < 300) { const ta = a + Math.PI / 2; mvx = Math.cos(ta) * .8; mvy = Math.sin(ta) * .8; }
    u.reportT -= dt;
    if (u.reportT <= 0) {
      u.reportT = 8;
      const victim = nearestUnit(u.x, u.y, 350, t => isFoe(u, t) && !t.isBoss && !t.isElite && !t.isHR);
      if (victim) {
        victim.reportedT = 6;
        addFloat(victim.x, victim.y - 24, victim.isPlayer ? '你被举报了！全场集火！' : '已被举报', '#ff4f4f', victim.isPlayer ? 9 : 7, 1.5);
        addFeed(`小报告专家 举报了 ${victim.name}`, victim.isPlayer);
        if (victim.isPlayer) { SFX.deny(); addShake(3); }
      }
    }
  } else if (beh === 'meeting') {
    /* 中距离风筝，扔"日历邀请"造会议圈 */
    if (d < 140) { mvx = -mvx; mvy = -mvy; }
    else if (d < 240) { const ta = a + Math.PI / 2; mvx = Math.cos(ta) * .6; mvy = Math.sin(ta) * .6; }
    if (u.invitePending) {
      u.invitePending.t -= dt;
      if (u.invitePending.t <= 0) {
        const ip = u.invitePending;
        u.invitePending = null;
        G.burns.push({ x: ip.x, y: ip.y, r: 45, dps: 3, slow: .4, life: 4, t: 0, owner: u, color: '#6aa3ff' });
        for (const t2 of G.units) {
          if (!isFoe(u, t2) || dist2(ip.x, ip.y, t2.x, t2.y) > 45 * 45) continue;
          applyDamage(t2, 6 * u.mods.dmg, u);
          if (t2.isPlayer) addFloat(t2.x, t2.y - 20, '被拉进会了', '#6aa3ff', 7, 1);
        }
      }
    } else {
      u.inviteT = (u.inviteT === undefined ? 3 : u.inviteT) - dt;
      if (u.inviteT <= 0 && d < 320) {
        u.inviteT = 6;
        u.invitePending = { x: tgt.x + rand(-20, 20), y: tgt.y + rand(-20, 20), t: .7 };
        addFx({ type: 'ringwarn', x: u.invitePending.x, y: u.invitePending.y, r: 45, color: '#6aa3ff', life: .7 });
      }
    }
  } else if (beh === 'intern') {
    /* 血越少越狼性：越跑越快（但封顶 145——必须留给玩家风筝空间） */
    const rage = 1 - u.hp / maxHp(u);
    const mult = Math.min(1 + rage * .9, 145 / u.spdBase);
    mvx *= mult; mvy *= mult;
  } else if (beh === 'attendance') {
    if (u.rollWarnT !== undefined) {
      /* 点名进行中：站定读秒，静止者按摸鱼处理 */
      u.rollWarnT -= dt;
      mvx = 0; mvy = 0;
      if (u.rollWarnT <= 0) {
        u.rollWarnT = undefined;
        addFx({ type: 'boom', x: u.x, y: u.y, r: 150, color: '#ffcf33', life: .3 });
        for (const t2 of G.units) {
          if (!isFoe(u, t2) || dist2(u.x, u.y, t2.x, t2.y) > 150 * 150) continue;
          if (t2.standT > .45) {
            applyDamage(t2, 15 * u.mods.dmg, u);
            addFloat(t2.x, t2.y - 20, '摸鱼被抓！', '#ffcf33', 7, 1);
          }
        }
      }
    } else {
      mvx *= .7; mvy *= .7;
      u.rollT = (u.rollT === undefined ? 4 : u.rollT) - dt;
      if (u.rollT <= 0 && d < 200) {
        u.rollT = 7;
        u.rollWarnT = .9;
        addFx({ type: 'ringwarn', x: u.x, y: u.y, r: 150, color: '#ffcf33', life: .9 });
        if (nearPlayer(u.x, u.y)) SFX.deny();
      }
    }
  }

  moveWithCollide(u, mvx, mvy, dt);
  u.walkT += dt * 6;
  if (e.touch && u.touchT <= 0 && d < u.r + tgt.r + 3) {
    u.touchT = beh === 'hallu' ? .9 : 1.1;
    const touchDmg = (e.touch + (beh === 'intern' ? (1 - u.hp / maxHp(u)) * 14 : 0)) * u.mods.dmg;   // 狼性成长 × 词条增伤
    applyDamage(tgt, touchDmg, u);
    if (e.curse) applyCurse(tgt, e.curse, e.curseDur);
    const push = Math.atan2(tgt.y - u.y, tgt.x - u.x);
    tgt.x += Math.cos(push) * 14; tgt.y += Math.sin(push) * 14;
  }
}

/* ---------- 子弹 ---------- */
function updateProjs(dt) {
  for (const p of G.projs) {
    if (p.dead) continue;
    if (p.homing) {
      const t = nearestUnit(p.x, p.y, 170, o => isFoe(p.owner, o));
      if (t) {
        const want = Math.atan2(t.y - p.y, t.x - p.x);
        const cur = Math.atan2(p.vy, p.vx);
        let diff = want - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turn = clamp(diff, -p.homing * dt, p.homing * dt);
        const na = cur + turn;
        p.vx = Math.cos(na) * p.spd; p.vy = Math.sin(na) * p.spd;
      }
    }
    if (p.boomerang && p.boomerang.phase === 1) {
      const o = p.owner;
      if (!o.alive) { p.dead = true; continue; }
      const a = Math.atan2(o.y - p.y, o.x - p.x);
      p.vx = Math.cos(a) * p.spd; p.vy = Math.sin(a) * p.spd;
      /* v2.0 职场嘴替：回程吸收敌方子弹，每吸 1 颗 +absorbDmg 到本回旋镖伤害 */
      if (p.absorb) {
        const r2 = p.absorb.r * p.absorb.r;
        for (const q of G.projs) {
          if (q === p || q.dead) continue;
          if (!isFoe(o, q.owner)) continue;
          if (dist2(p.x, p.y, q.x, q.y) < r2) {
            q.dead = true;
            p.dmg += p.absorb.dmg;
            p.absorb.count = (p.absorb.count || 0) + 1;
            if (p.absorb.count <= 3 && o.isPlayer) addFloat(p.x, p.y - 8, `吸弹 +${p.absorb.dmg}`, '#7ac8ff', 6, .5);
          }
        }
      }
      if (dist2(p.x, p.y, o.x, o.y) < 100) { p.dead = true; continue; }
    }
    if (p.zap) {
      p.zapT -= dt;
      if (p.zapT <= 0) {
        p.zapT = p.zap.cd;
        const t = nearestUnit(p.x, p.y, 120, o => isFoe(p.owner, o));
        if (t) {
          const mult = p.boomerang && p.boomerang.phase === 1 ? 2 : 1;
          chainZap(p.owner, p.x, p.y, t, p.zap.chains, p.zap.dmg * mult, .85, mult === 2 ? .5 : 0);
        }
      }
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.dist += p.spd * dt;

    /* Fix · 不可破坏墙（wall/safe）挡所有弹药类型：boomerang / pie / bigpie / homing / orb / pea
     *   房间墙就该是物理阻挡 —— design §5.1 里 T1/T2 是"掩体"（家具），indestructible 是"墙" */
    if (!p.dead) {
      for (const o of G.obstacles) {
        if (!o.indestructible || o.destroyed) continue;
        if (p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h) {
          p.dead = true;
          addParts(p.x, p.y, '#c9c4b4', 4, 40, .3);
          if (p.owner && p.owner.isPlayer) SFX.obstacleHit();
          break;
        }
      }
    }

    /* v2.0 掩体碰撞（严格按 design §5.1 counter 表）：
     *   直线弹药 vs T1 100% 挡 / T2 50% 挡
     *   shotgun 特殊：T1 60% 挡（散弹能钻缝，_shotgun 标签）
     *   homing 绕过一次（p.coverBypassed 记录状态）
     *   boss/player 弹药可破坏 obstacle；bot/mob 弹药不破坏（防 AI 秒破坏地图）
     *   indestructible obstacle (wall/safe wall 部分) 弹药挡但不掉血 */
    if (!p.dead && isDirectFireBullet(p.shape) && !p.boomerang) {
      const canBreak = p.owner && (p.owner.isPlayer || p.owner.isBoss);
      const isShotgun = p._shotgun;
      const isHoming = p.homing > 0;
      const checkArr = (arr, particleColor) => {
        for (const o of arr) {
          if (o.destroyed || o.cover === 'T3') continue;
          if (p.x < o.x || p.x > o.x + o.w || p.y < o.y || p.y > o.y + o.h) continue;
          if (o.cover === 'T1' && isShotgun && Math.random() < .4) continue;   // shotgun 40% 钻缝
          if (isHoming && !p.coverBypassed) { p.coverBypassed = true; continue; }
          if (o.cover === 'T2' && Math.random() > T2_BLOCK_CHANCE) continue;
          if (canBreak && !o.indestructible) {
            o.hp -= p.dmg;
            /* v2.0 §3.4 打印机卡纸：每次玩家命中 jammed=true 打印机累计 hits，第 3 次 30% 掉 tech */
            if (o.spr === 'printer' && o.jammed && p.owner && p.owner.isPlayer) {
              o.jamHits = (o.jamHits || 0) + 1;
              if (o.jamHits === 3) {
                o.jammed = false;
                if (Math.random() < .3) {
                  spawnTech(G, pickTechId(), o.x + o.w / 2, o.y + o.h / 2, rollTier(false));
                  addFloat(o.x + o.w / 2, o.y - 12, '📃 卡纸取出：藏着一张模组！', '#7ee08a', 9, 1.4);
                  SFX.pickup();
                } else addFloat(o.x + o.w / 2, o.y - 12, '📃 卡纸清理：只是空白', '#9aa4b5', 8, 1);
              }
            }
            if (o.hp <= 0 && !o.destroyed) { o.destroyed = true; o.destroyedT = DESTROY_FADE_T; onObstacleDestroyed(o); }
          }
          p.dead = true;
          addParts(p.x, p.y, particleColor, 4, 40, .3);
          if (p.owner && p.owner.isPlayer) SFX.obstacleHit();   // 清脆的叮命中反馈
          return true;
        }
        return false;
      };
      if (!checkArr(G.obstacles, '#8a6a4a')) checkArr(G.decor, '#c9c4b4');
      if (p.dead) continue;
    }

    for (const t of G.units) {
      if (!isFoe(p.owner, t) || p.hit.has(t)) continue;
      if (p.fromBoss && (t.isBoss || t.isHR)) continue;
      /* 试用期：同事的子弹直接穿过同事 */
      if (G.trial.active && isWorker(p.owner) && isWorker(t)) continue;
      const rr = p.r + t.r;
      if (dist2(p.x, p.y, t.x, t.y) < rr * rr) {
        /* 蒸馏被动「对齐立场·mini」：玩家 25% 概率挡下正面子弹 */
        if (t.isPlayer && t.distills && t.distills.align && Math.random() < .25) {
          const rel2 = Math.atan2(p.y - t.y, p.x - t.x);
          let dd2 = rel2 - t.aim;
          while (dd2 > Math.PI) dd2 -= Math.PI * 2;
          while (dd2 < -Math.PI) dd2 += Math.PI * 2;
          if (Math.abs(dd2) < 1.05) {
            addParts(p.x, p.y, '#c9d4e4', 3, 40, .3);
            addFloat(t.x, t.y - 18, '已对齐', '#9aa4b5', 6, .5);
            if (p.boom) { doBoom(p); break; }
            p.dead = true; break;
          }
        }
        /* 对齐守卫：正面挡下一切子弹 */
        if (t.eliteType === 'align') {
          const rel = Math.atan2(p.y - t.y, p.x - t.x);
          let dd = rel - t.aim;
          while (dd > Math.PI) dd -= Math.PI * 2;
          while (dd < -Math.PI) dd += Math.PI * 2;
          if (Math.abs(dd) < 1.2) {
            addParts(p.x, p.y, '#c9d4e4', 3, 40, .3);
            if (nearPlayer(p.x, p.y) && Math.random() < .35) addFloat(t.x, t.y - 18, '已对齐', '#9aa4b5', 6, .5);
            if (p.boom) { doBoom(p); break; }
            p.dead = true; break;
          }
        }
        p.hit.add(t);
        if (p.boom) { doBoom(p); break; }
        applyDamage(t, p.dmg, p.owner, { stun: p.stun });
        /* 命中火花帧动画（fx_spark 素材缺失时 render 层静默跳过，粒子反馈仍在） */
        if (nearPlayer(p.x, p.y)) addFx({ type: 'spark', x: p.x, y: p.y, r: 8, life: .26 });
        if (p.curse) applyCurse(t, p.curse.id, p.curse.dur);
        if (p.vuln) { t.vulnT = Math.max(t.vulnT || 0, p.vuln.t); t.vulnBonus = Math.max(t.vulnBonus || 0, p.vuln.bonus); }   // PUA 的饼：吃了更疼
        /* OA审批流公文包：命中后延迟引爆叠加伤害+减速 */
        if (p.onHitMark) {
          t.oaSlowT = p.onHitMark.slowT; t.oaBurstT = p.onHitMark.burstT;
          t.oaBurstDmg = p.onHitMark.burstDmg; t.oaBurstOwner = p.owner;
        }
        /* 价格屠夫补贴：命中攒层，为下一次开火加成 */
        if (p._peaSubsidy && p.owner && p.owner.weapon) {
          const legDef = wdef(p.owner);
          const cap = (legDef && legDef.maxSubsidy) || 10;
          p.owner.weapon.subsidy = Math.min(cap, (p.owner.weapon.subsidy || 0) + 1);
          p.owner.weapon._subsidyIdleT = 0;
        }
        if (p.hit.size > p.pierce) { p.dead = true; break; }
      }
    }
    if (p.dead) continue;
    if (p.dist >= p.maxDist) {
      if (p.boom) { doBoom(p); continue; }
      if (p.boomerang && p.boomerang.phase === 0) {
        p.boomerang.phase = 1; p.hit.clear(); p.dist = 0; p.maxDist = Infinity;
        continue;
      }
      p.dead = true; continue;
    }
    if (p.x < 4 || p.y < 4 || p.x > TUNE.world - 4 || p.y > TUNE.world - 4) {
      if (p.boom) doBoom(p);
      else if (p.boomerang && p.boomerang.phase === 0) {
        p.boomerang.phase = 1; p.hit.clear(); p.dist = 0; p.maxDist = Infinity;
        continue;
      }
      else p.dead = true;
    }
  }
  G.projs = G.projs.filter(p => !p.dead);
}
function doBoom(p) {
  p.dead = true;
  explodeAt(p.x, p.y, p.boom.r, p.boom.dmg, p.owner, p.color, p.boom.burn || null);
  /* 画饼成真的"护盾饼"：落地丢一个护盾拾取（heal 类型可复用现有拾取合并逻辑） */
  if (p.boom.dropShield && p.owner && p.owner.isPlayer) {
    /* P0 修复：必须带 amt——Bot 吃 heal 走 hp + p.amt，undefined 会把 Bot 血量变 NaN 成为打不死的僵尸 */
    G.pickups.push({ type: 'heal', x: p.x, y: p.y, bob: rand(0, 6), amt: 0, shield: p.boom.dropShield });
  }
}

/* ---------- 拾取 ---------- */
function updatePickups(dt) {
  const pl = G.player;
  G.hoverChip = null;
  let hoverBest = 18 * 18;
  for (const p of G.pickups) {
    if (p.dead) continue;   // 已被消耗的拾取物不得再次生效（换枪掉落的"幽灵芯片"曾借此刷级）
    p.bob += dt * 4;
    if ((p.type === 'xp' || p.type === 'heal') && pl.alive) {
      const d2 = dist2(p.x, p.y, pl.x, pl.y);
      if (d2 < 52 * 52 && (p.type === 'xp' || pl.hp < maxHp(pl))) {
        const a = Math.atan2(pl.y - p.y, pl.x - p.x);
        p.x += Math.cos(a) * 170 * dt; p.y += Math.sin(a) * 170 * dt;
      }
    }
    for (const u of G.units) {
      if (!u.alive || u.isBoss || u.isElite || u.isSummon || u.isMob) continue;   // 替身/杂鱼不抢补给
      const rr = u.r + 7;
      if (dist2(p.x, p.y, u.x, u.y) >= rr * rr) continue;
      if (p.type === 'sample') {
        if (!u.isPlayer) continue;   // AI 替身样本只有玩家能用
        p.dead = true;
        spawnSummon(u, p.boss);
        break;
      }
      if (p.type === 'tech') {
        if (u.isHR) continue;
        const t = TECH[p.id];
        if (!t.instant && (u.tech[p.id] || 0) >= t.max) continue;
        if (!u.isPlayer && PLAYER_ONLY_TECH.includes(p.id)) continue;
        p.dead = true;
        applyTechPickup(u, p.id, p.tier || 1);
        if (u.isPlayer) addFx({ type: 'pickupfx', x: p.x, y: p.y - 4, r: 11, life: .35 });
        break;
      }
      if (p.type === 'xp') {
        if (u.isHR) continue;   // HR 不配吃期权
        p.dead = true;
        gainXp(u, p.amt);
        if (u.isPlayer) { addFloat(p.x, p.y - 8, `+${p.amt}`, '#ffe27a', 6, .5); SFX.pickup(); }
        break;
      }
      if (p.type === 'heal') {
        /* 画饼护盾饼落地的护盾拾取：hp 满时也能吃（走护盾通道） */
        if (p.shield && u.isPlayer) {
          p.dead = true;
          u.shield = Math.min(maxHp(u), (u.shield || 0) + p.shield);
          u.shieldT = Math.max(u.shieldT || 0, 12);
          addFloat(p.x, p.y - 8, `护盾 +${p.shield}`, '#ffe270', 7, .7);
          break;
        }
        if (u.hp >= maxHp(u)) continue;   // 满血留给需要的人
        p.dead = true;
        u.hp = Math.min(maxHp(u), u.hp + (p.amt || 0));   // 防御：amt 缺失时不得产生 NaN
        if (u.isPlayer) {
          addFloat(p.x, p.y - 8, `+${p.amt || 0}`, '#7ee08a', 6, .5);
          addFx({ type: 'healfx', x: u.x, y: u.y - 4, r: 13, life: .38 });
        }
        break;
      }
      if (p.type === 'item') {
        if (u.isHR) continue;
        p.dead = true;
        useItem(u, p.id);
        break;
      }
      /* chip */
      if (u.isHR) continue;
      if (u.isPlayer) {
        if (!u.weapon.leg && p.id === u.weapon.id) {
          p.dead = true;
          if (u.weapon.lvl < 5) {
            u.weapon.lvl++;
            addFloat(u.x, u.y - 18, `${WEAPONS[p.id].name} → Lv.${u.weapon.lvl}${u.weapon.lvl === 5 ? '（满级！）' : ''}`, '#ffcf33', 8, 1);
            SFX.chip();
          } else {
            gainXp(u, 15);
            addFloat(u.x, u.y - 18, '重复芯片 → +15 经验', '#9aa4b5', 7, .8);
            SFX.pickup();
          }
        } else if (u.weapon2 && !u.weapon2.leg && p.id === u.weapon2.id) {
          /* v2.3 副手同款芯片：升级副手 */
          p.dead = true;
          if (u.weapon2.lvl < 5) {
            u.weapon2.lvl++;
            addFloat(u.x, u.y - 18, `副手 ${WEAPONS[p.id].name} → Lv.${u.weapon2.lvl}`, '#7ac8ff', 8, 1);
            SFX.chip();
          } else {
            gainXp(u, 15);
            addFloat(u.x, u.y - 18, '重复芯片 → +15 经验', '#9aa4b5', 7, .8);
          }
        } else if (u.weapon2Unlocked && !u.weapon2 && p.id !== u.weapon.id) {
          /* v2.3 双持已解锁且副手空：异款芯片自动装入副手 */
          p.dead = true;
          u.weapon2 = { id: p.id, lvl: p.lvl, leg: null, cd: 0, charge: 0, charging: false, pillarT: 3, droneAng: rand(0, 6), droneCds: [0, 0, 0, 0] };
          addFloat(u.x, u.y - 20, `🗡 副手武器上岗：${WEAPONS[p.id].name} Lv.${p.lvl}`, '#7ac8ff', 9, 1.2);
          SFX.swap();
        }
      } else {
        botChip(u, p);
      }
      break;
    }
  }
  if (pl.alive) {
    for (const p of G.pickups) {
      if (p.dead || p.type !== 'chip') continue;
      if (p.id === pl.weapon.id && !pl.weapon.leg) continue;
      if (pl.weapon2 && p.id === pl.weapon2.id && !pl.weapon2.leg) continue;   // 副手同款自动吸收，不进换枪悬停
      if (pl.weapon2Unlocked && !pl.weapon2) continue;                          // 副手空位时异款自动装备
      const d2 = dist2(p.x, p.y, pl.x, pl.y);
      if (d2 < hoverBest) { hoverBest = d2; G.hoverChip = p; }
    }
  }
  G.pickups = G.pickups.filter(p => !p.dead);
}
function botChip(u, p) {
  const w = u.weapon;
  if (w.leg) return;
  if (p.id === w.id) {
    if (w.lvl < 5) { w.lvl++; p.dead = true; }
    return;
  }
  if (w.lvl === 5) {
    const leg = findRecipe(w.id, p.id);
    if (leg) {
      p.dead = true;
      w.leg = leg;
      addFeed(`${u.name} 融合出了传说武器「${LEGENDS[leg].name}」！`, true);
      addParts(u.x, u.y, LEGENDS[leg].color, 24, 120, .8);
      if (nearPlayer(u.x, u.y)) SFX.fuse();
      return;
    }
  }
  if (p.lvl > w.lvl) {
    spawnChip(G, w.id, w.lvl, u.x, u.y);
    u.weapon = { ...w, id: p.id, lvl: p.lvl, leg: null, cd: 0, charge: 0, charging: false };
    p.dead = true;
  }
}

/* ---------- 玩家操作（供 React / 按键调用） ---------- */
export function playerSwap() {
  const p = G && G.hoverChip, pl = G && G.player;
  if (!p || !pl || !pl.alive) return;
  spawnChip(G, pl.weapon.id, pl.weapon.leg ? 5 : pl.weapon.lvl, pl.x + rand(-6, 6), pl.y + rand(-6, 6));
  pl.weapon = { id: p.id, lvl: p.lvl, leg: null, cd: 0, charge: 0, charging: false, pillarT: 3, droneAng: 0, droneCds: [0, 0, 0, 0] };
  p.dead = true;
  addFloat(pl.x, pl.y - 18, `换上 ${WEAPONS[p.id].name} Lv.${p.lvl}`, '#f2efe6', 8, .9);
  SFX.swap();
  bridge.notify();
}
export function playerFuse() {
  const p = G && G.hoverChip, pl = G && G.player;
  if (!p || !pl || !pl.alive || pl.weapon.leg || pl.weapon.lvl < 5) return SFX.deny();
  const leg = findRecipe(pl.weapon.id, p.id);
  if (!leg) return SFX.deny();
  p.dead = true;
  pl.weapon.leg = leg;
  pl.weapon.cd = 0;
  addFx({ type: 'fusionfx', x: pl.x, y: pl.y - 4, r: 26, life: 1 });   // 传说融合大爆发
  addFeed(`你 融合出了传说武器「${LEGENDS[leg].name}」！`, true);
  addFloat(pl.x, pl.y - 22, `「${LEGENDS[leg].name}」`, LEGENDS[leg].color, 10, 1.6);
  addParts(pl.x, pl.y, LEGENDS[leg].color, 34, 140, .9);
  addShake(5);
  SFX.fuse();
  bridge.notify();
}
export function playerDash() {
  const pl = G && G.player;
  if (!pl || !pl.alive || !pl.mods.dashCd || pl.dashT > 0) return;
  if (pl.curses.overfit > 0) { addFloat(pl.x, pl.y - 16, '陷入局部最优，动不了！', '#ff8f5a', 7, .7); return; }
  let mx = 0, my = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  if (touch.using && touch.active) { mx = touch.dx; my = touch.dy; }
  const m = Math.hypot(mx, my);
  if (!m) { mx = Math.cos(pl.aim); my = Math.sin(pl.aim); }
  else { mx /= m; my /= m; }
  pl.dashVx = mx * 330; pl.dashVy = my * 330;
  pl.dashDur = .16;
  addFx({ type: 'dashfx', x: pl.x, y: pl.y - 4, ang: Math.atan2(my, mx), r: 14, life: .3 });
  pl.dashT = pl.mods.dashCd;
  /* 冲刺 = 进攻位移：落地 0.5 秒射速 +40%（与保命向的瞬移形成互补） */
  pl.buffs.fireT = Math.max(pl.buffs.fireT, .5);
  pl.buffs.fireM = Math.max(pl.buffs.fireM, 1.4);
  addParts(pl.x, pl.y, '#f2efe6', 8, 60, .4);
  SFX.dash();
}

/* ---------- 终局判定 ---------- */
function endChecks(dt) {
  if (G.endT > 0) {
    G.endT -= dt;
    if (G.endT <= 0) {
      G.newBest = saveBest(G.playerRank, G.kills);
      if (G.newBest) SFX.levelup();
      setState('dead');
    }
    return;
  }
  if (!G.player.alive) return;
  /* Boss 双门槛：战斗时间 300s 或场上只剩 3 个牛马——保证多数对局都能见到老板 */
  if (!G.bossSpawned && !G.trial.active && (combatT() >= 300 || aliveWorkers() <= 3)) spawnBoss();
  if (G.winT === undefined && aliveWorkers() === 1 && G.bossSpawned && G.bossDead) {
    G.winT = 1.2;
    G.winLine = pick(COPY.winLines);
    G.pendingLevels = 0;
  }
  if (G.winT !== undefined) {
    G.winT -= dt;
    if (G.winT <= 0) {
      G.newBest = saveBest(1, G.kills);
      setState('win');
    }
  }
}

/* ---------- 升级三选一（混合卡池：白卡技能 / 蓝卡副武器 / 紫卡主动 / 金卡精修） ---------- */
let levelChoices = [];
export const getLevelChoices = () => levelChoices;
const PERSONA_LABELS = {
  optimizer: '首席降本增效官',
  slacker: '摸鱼表演艺术家',
  rlhf: '人肉 RLHF 训练员',
  revival: '万年活人矿·二次入职',
  opc: '一人公司 OPC',
};
const PERSONA_STARTER_SKILLS = [
  { persona: 'optimizer', skillId: 'office_politics' },
  { persona: 'slacker', skillId: 'mouse_jiggler' },
  { persona: 'rlhf', skillId: 'rlhf_piecework_labeling' },
  { persona: 'revival', skillId: 'revival_grind_body' },
  { persona: 'opc', skillId: 'opc_contract_worker' },
];
function personaLabel(id) { return PERSONA_LABELS[id] || id; }
/* ---------- 槽位容量修复：里程碑事件解锁副武器第4槽 ----------
 * 触发点：转正（spawnLateBots）或 0 个月试用期时 zone.phase>=2（两条路径互斥，各自覆盖对方
 * 无法触发的极端玩法，见设计文档 3.1 节）。解锁时弹出一次性"入职大礼包"：从未装备的副武器里
 * 保底抽 1 件，不占用常规三选一权重池。 */
function unlockSubSlot() {
  const pl = G.player;
  if (!pl || !pl.alive || pl.subSlotCount >= 4) return;   // 幂等：已解锁则不重复触发
  pl.subSlotCount = 4;
  warn('🎁 入职大礼包：副武器槽 +1，可以从没装备过的兵器里选一件了');
  const unowned = Object.keys(SUBS).filter(id => !pl.subs[id]);
  if (!unowned.length) return;   // 极端情况：已拥有全部副武器，无需额外弹窗
  levelChoices = shuffle(unowned).slice(0, 3).map(id => {
    const def = SUBS[id];
    return { kind: 'sub', id, name: `入职大礼包：${def.name}`, eff: def.eff[0], tag: def.tag, w: 1 };
  });
  G.pendingLevels = Math.max(1, G.pendingLevels + 1);   // 原来直接 =1 会吞掉已排队的升级抽卡
  setState('levelup');
}
function buildPersonaIntroChoices(pl) {
  const choices = [];
  for (const row of PERSONA_STARTER_SKILLS) {
    const s = SKILLS.find(x => x.id === row.skillId);
    if (!s || (pl.skills[s.id] || 0) >= s.max || (s.valid && !s.valid(pl))) continue;
    choices.push({
      kind: 'skill', id: s.id, ref: s, max: s.max, w: 1,
      personaIntro: true, persona: row.persona,
      name: `人设方向：${personaLabel(row.persona)}`,
      eff: `${s.name}：${s.eff}`,
      tag: s.tag,
    });
  }
  return choices.length >= 3 ? shuffle(choices) : [];
}
function pendingMilestoneLevel(pl) {
  if (!pl.persona && !pl.personaFree) return null;   // 纯随机流也享受里程碑（随机三条）
  const levels = TUNE.personaMilestoneLevels || [];
  pl.milestones = pl.milestones || {};
  return levels.find(lv => pl.level >= lv && !pl.milestones[lv]) || null;
}
function buildMilestoneChoices(pl) {
  const milestoneLevel = pendingMilestoneLevel(pl);
  if (!milestoneLevel) return [];
  /* 纯随机流：从全部人设的 15 条 track 里随机抽 3 条——整到啥用啥 */
  const tracks = pl.personaFree
    ? shuffle(Object.values(MILESTONE_TRACKS).flat()).slice(0, 3)
    : MILESTONE_TRACKS[pl.persona] || [];
  const tier = (TUNE.personaMilestoneLevels || []).indexOf(milestoneLevel) + 1;
  if (!tracks.length || tier <= 0) return [];
  return tracks.map(track => ({
    kind: 'milestone',
    id: track.id,
    milestoneLevel,
    tier,
    persona: pl.persona,
    name: `Lv.${milestoneLevel} 晋升：${track.name}`,
    eff: track.eff(tier),
    tag: track.tag,
    apply: track.apply,
    w: 1,
  }));
}
function applyMilestoneChoice(pl, choice) {
  pl.milestones = pl.milestones || {};
  pl.milestones[choice.milestoneLevel] = choice.id;
  const beforeMax = maxHp(pl);
  choice.apply(pl, choice.tier);
  const maxGain = Math.max(0, maxHp(pl) - beforeMax);
  const heal = 16 + choice.tier * 8 + Math.floor(maxGain * .5);
  const shield = 10 + choice.tier * 5;
  pl.hp = Math.min(maxHp(pl), pl.hp + heal);
  pl.shield = Math.max(pl.shield || 0, shield);
  pl.shieldT = Math.max(pl.shieldT || 0, 8 + choice.tier * 2);
  warn(`📈 人设晋升：${choice.name}，本次升级仍可继续选择普通奖励`);
  addFloat(pl.x, pl.y - 34, `晋升：${choice.name.replace(/^Lv\.\d+ 晋升：/, '')}`, '#ffcf33', 10, 1.5);
  SFX.fuse();
}
function buildDraftPool(pl) {
  const cards = [];
  /* v18: 玩家一旦选到第一张带 persona 的技能就锁定人设，此后同人设卡权重×2、异人设卡完全过滤，
   * 让紫橙质变技能的稀缺性不再被"抽到隔壁人设的卡"稀释。未选任何 persona 卡时对所有 persona 通吃 */
  const p = pl.persona;
  /* 「先不站队」的那一次抽卡：过滤全部人设卡，出纯通用池——否则混合池里随手一张人设卡就把人设锁了，按钮形同虚设 */
  const noPersonaThisDraft = !p && G.personaSnooze;
  for (const s of SKILLS) {
    if (p && s.persona && s.persona !== p) continue;
    if (noPersonaThisDraft && s.persona) continue;
    if ((pl.skills[s.id] || 0) < s.max && (!s.valid || s.valid(pl)))
      cards.push({ kind: 'skill', id: s.id, ref: s, name: s.name, eff: s.eff, tag: s.tag, max: s.max, persona: s.persona || null, w: (s.persona && s.persona === p) ? 2 : 1 });
  }
  const ownedSubs = Object.keys(pl.subs);
  for (const id in SUBS) {
    const def = SUBS[id], cur = pl.subs[id];
    if (p && def.persona && def.persona !== p) continue;
    if (noPersonaThisDraft && def.persona) continue;
    /* 决赛圈近战新卡打折（远程对枪环境近战难成型） */
    const meleeLate = ['keyboard', 'monitor', 'shredder'].includes(id) && G.zone.phase >= 2 ? .5 : 1;
    const personaBonus = (def.persona && def.persona === p) ? 2 : 1;
    if (cur) {
      if (cur.lv < def.maxLv)
        cards.push({ kind: 'sub', id, name: `${def.name} Lv.${cur.lv + 1}`, eff: def.eff[cur.lv], tag: def.tag, persona: def.persona || null, w: 1.6 * personaBonus });
    } else if (ownedSubs.length < (pl.subSlotCount || MAX_SUB_SLOTS)) {
      cards.push({ kind: 'sub', id, name: `新装备：${def.name}`, eff: def.eff[0], tag: def.tag, persona: def.persona || null, w: .8 * meleeLate * personaBonus });
    }
  }
  /* v2.0 双主动槽：Q/E 分开建池；已装备升级卡，未装备新装备卡 */
  const hasQ = pl.activeQ || pl.active;   // 兼容旧存档
  const hasE = pl.activeE;
  for (const id in ACTIVES) {
    const def = ACTIVES[id];
    if (p && def.persona && def.persona !== p) continue;
    if (noPersonaThisDraft && def.persona) continue;
    const personaBonus = (def.persona && def.persona === p) ? 2 : 1;
    const isE = def.slot === 'e';
    const cur = isE ? hasE : hasQ;
    if (cur && cur.id === id) {
      if (cur.lv < 3) {
        const label = isE ? 'E 键' : 'Q 键';
        cards.push({ kind: 'active', id, name: `${def.name} Lv.${cur.lv + 1}（${label}）`, eff: def.eff[cur.lv], tag: def.tag, persona: def.persona || null, w: 1.3 });
      }
    } else if (!cur) {
      const label = isE ? 'E 大招' : 'Q 战术';
      cards.push({ kind: 'active', id, name: `${label}：${def.name}`, eff: def.eff[0], tag: def.tag, persona: def.persona || null, w: .7 * personaBonus });
    }
  }
  /* v2.3 主武器进卡池：同款芯片速递（主/副手 +1 级）+ 双持工牌（解锁第二主武器槽） */
  if (!pl.weapon.leg && pl.weapon.lvl < 5) {
    cards.push({ kind: 'chipup', id: 'chipup_main', name: `同款芯片速递：${WEAPONS[pl.weapon.id].name}`,
      eff: `主武器 Lv.${pl.weapon.lvl} → Lv.${pl.weapon.lvl + 1}${pl.weapon.lvl + 1 >= 5 ? '（满级，可找搭档芯片融合）' : ''}`,
      tag: '行政把芯片直接送到工位，不用满地捡了。', w: .9 });
  } else if (pl.weapon2 && !pl.weapon2.leg && pl.weapon2.lvl < 5) {
    cards.push({ kind: 'chipup', id: 'chipup_off', name: `同款芯片速递：${WEAPONS[pl.weapon2.id].name}（副手）`,
      eff: `副手武器 Lv.${pl.weapon2.lvl} → Lv.${pl.weapon2.lvl + 1}`,
      tag: '副手也是手，行政一并配齐。', w: .9 });
  }
  if (!pl.weapon2Unlocked && pl.level >= 6) {
    cards.push({ kind: 'dual', id: 'dual_license', name: '🗡 双持工牌：第二主武器槽',
      eff: '解锁副手武器槽——拾取另一款芯片自动装备，与主武器同时开火（副手 55% 伤害，同款芯片可继续升它）',
      tag: '一个人干两个人的活，工资还是一份。', w: 1.15 });
  }
  return cards;
}
function rareEligible(card, pl) {
  return card.kind === 'skill' && !!card.ref && (pl.skills[card.id] || 0) + 1 < card.ref.max;
}
function openLevelup() {
  const pl = G.player;
  const personaIntro = !pl.persona && !pl.personaFree && !G.personaSnooze ? buildPersonaIntroChoices(pl) : [];
  if (personaIntro.length >= 3) {
    levelChoices = personaIntro;
    setState('levelup');
    return;
  }
  const milestoneChoices = buildMilestoneChoices(pl);
  if (milestoneChoices.length) {
    levelChoices = milestoneChoices;
    setState('levelup');
    return;
  }
  const cards = buildDraftPool(pl);
  /* 加权无放回抽 3 张 */
  const picked = [];
  while (picked.length < 3 && cards.length) {
    const total = cards.reduce((a, c) => a + c.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < cards.length; idx++) { r -= cards[idx].w; if (r <= 0) break; }
    picked.push(cards.splice(Math.min(idx, cards.length - 1), 1)[0]);
  }
  /* 软保底：连续 3 次三选一没出蓝/紫卡，则强制塞一张（构筑不再全靠脸） */
  const hasGear = picked.some(c => c.kind !== 'skill');
  if (!hasGear) {
    G.dryDrafts = (G.dryDrafts || 0) + 1;
    if (G.dryDrafts >= (TUNE.gearPityDrafts || 3)) {
      const gear = cards.filter(c => c.kind !== 'skill').sort((a, b) => b.w - a.w)[0];
      if (gear && picked.length) { picked[picked.length - 1] = { ...gear, _pity: true }; G.dryDrafts = 0; }
    }
  } else G.dryDrafts = 0;
  /* 人设锁定后的核心手感：每次升级至少出现 1 张本流派牌，避免新增人设被通用卡池稀释。
   * 只顶替通用技能卡；若没有可顶替的（比如末位是 pity 保底装备），宁可放弃本次保证也不吃掉 pity */
  if (pl.persona && picked.length && !picked.some(c => c.persona === pl.persona)) {
    const bestIdx = cards.reduce((best, c, i) => c.persona === pl.persona && (best < 0 || c.w > cards[best].w) ? i : best, -1);
    if (bestIdx >= 0) {
      let replaceIdx = picked.findIndex(c => !c.persona && c.kind === 'skill' && !c._pity);
      if (replaceIdx < 0 && !picked[picked.length - 1]._pity) replaceIdx = picked.length - 1;
      if (replaceIdx >= 0) picked[replaceIdx] = cards.splice(bestIdx, 1)[0];
    }
  }
  while (picked.length < 3) picked.push({ kind: 'skill', id: '_coffee' + picked.length, name: '茶水间补给', eff: '回复 50 HP，获得 15 护盾',
    tag: '没什么可学的了，喝口咖啡接着卷。', ref: null, w: 1 });
  /* 精修版只出现在有剩余层数、能真正双倍生效的技能上；关键等级保底提高一次质量感。 */
  const rareIdxs = picked.map((c, i) => rareEligible(c, pl) ? i : -1).filter(i => i >= 0);
  const milestoneEvery = TUNE.levelMilestoneRareEvery || 0;
  let forcedRare = -1;
  if (milestoneEvery && pl.level > 1 && pl.level % milestoneEvery === 0 && G.lastMilestoneRareLevel !== pl.level && rareIdxs.length) {
    forcedRare = pick(rareIdxs);
    G.lastMilestoneRareLevel = pl.level;
  }
  levelChoices = picked.map((c, i) => ({ ...c, rare: rareEligible(c, pl) && (i === forcedRare || Math.random() < (TUNE.levelRareChance ?? .1)) }));
  setState('levelup');
}
/* 人设 5 选 1 界面的「先不站队」：本次升级改看普通卡池，下次升级再问（下一次 pick 后复位） */
export function snoozePersonaIntro() {
  if (!G || state !== 'levelup') return;
  G.personaSnooze = true;
  openLevelup();
  bridge.notify();
}
/* 纯随机流：这一局彻底不要人设——永不锁定、全人设卡池混抽、里程碑随机三条，整到啥用啥 */
export function choosePersonaFree() {
  if (!G || state !== 'levelup') return;
  const pl = G.player;
  pl.personaFree = true;
  warn('🎲 纯随机流已开启：本局不锁人设，全部卡池混着来，抽到啥用啥');
  addFloat(pl.x, pl.y - 32, '纯随机流：听天由命', '#ffcf33', 10, 1.6);
  openLevelup();
  bridge.notify();
}
/* 简历刷新卡：三选一免费重抽 */
export function rerollLevelup() {
  if (state !== 'levelup' || !G || !(G.rerollCredits > 0)) return;
  G.rerollCredits--;
  SFX.swap();
  openLevelup();
}
export function pickLevelChoice(i) {
  const s = levelChoices[i];
  if (!s || state !== 'levelup') return;
  const pl = G.player;
  if (s.kind === 'milestone') {
    applyMilestoneChoice(pl, s);
    if (G.pendingLevels > 0) openLevelup();
    else setState('playing');
    return;
  }
  /* v18: 玩家选到第一张带 persona 的技能/副武器/主动时，锁定人设——此后卡池按人设过滤 */
  const personaOf = s.kind === 'skill' && s.ref ? s.ref.persona
    : s.kind === 'sub' ? SUBS[s.id].persona
    : s.kind === 'active' ? ACTIVES[s.id].persona
    : null;
  if (personaOf && !pl.persona && !pl.personaFree) {   // 纯随机流永不锁人设：抽到啥用啥
    pl.persona = personaOf;
    const label = personaLabel(personaOf);
    warn(`🎭 人设锁定：${label}——之后的卡池只出同人设卡`);
    addFloat(pl.x, pl.y - 32, `人设：${label}`, '#ffcf33', 10, 1.6);
  }
  if (s.kind === 'chipup') {
    /* v2.3 同款芯片速递：主/副手武器 +1 级 */
    const w = s.id === 'chipup_off' ? pl.weapon2 : pl.weapon;
    if (w && !w.leg && w.lvl < 5) {
      w.lvl++;
      addFloat(pl.x, pl.y - 22, `${WEAPONS[w.id].name} → Lv.${w.lvl}${w.lvl === 5 ? '（满级！）' : ''}`, '#ffcf33', 9, 1.1);
      SFX.chip();
    }
  } else if (s.kind === 'dual') {
    /* v2.3 双持工牌：解锁副手武器槽 */
    pl.weapon2Unlocked = true;
    warn('🗡 双持解锁：捡起另一款芯片会自动装进副手槽，与主武器同时开火');
    addFloat(pl.x, pl.y - 24, '双持工牌到手！', '#7ac8ff', 10, 1.4);
  } else if (s.kind === 'sub') {
    if (pl.subs[s.id]) pl.subs[s.id].lv++;
    else pl.subs[s.id] = { lv: 1, t: 0, ang: rand(0, 6) };
    addFloat(pl.x, pl.y - 22, `装备：${SUBS[s.id].name}`, '#6aa3ff', 8, 1);
  } else if (s.kind === 'active') {
    const def = ACTIVES[s.id];
    const isE = def.slot === 'e';
    const slotKey = isE ? 'activeE' : 'activeQ';
    const cdKey = isE ? 'activeECd' : 'activeQCd';
    if (pl[slotKey] && pl[slotKey].id === s.id) {
      pl[slotKey].lv++;
    } else if (!isE && pl.active && pl.active.id === s.id && !pl.activeQ) {
      /* 兼容 v18 旧存档：pl.active 保留升级 */
      pl.active.lv++;
    } else {
      pl[slotKey] = { id: s.id, lv: 1 };
      pl[cdKey] = 1;
      if (!isE) { pl.active = pl[slotKey]; pl.activeCd = 1; }   // Q 槽同时更新兼容别名
    }
    const label = isE ? '按 E' : '按 Q';
    addFloat(pl.x, pl.y - 22, `主动技能：${def.name}（${label}）`, '#b665ff', 8, 1.2);
  } else if (s.ref) {
    const before = pl.skills[s.id] || 0;
    applySkill(pl, s.ref);
    if (s.rare && before + 1 < s.ref.max) {
      applySkill(pl, s.ref);
      addFloat(pl.x, pl.y - 24, '精修版：双倍生效！', '#c9a227', 9, 1.3);
      SFX.fuse();
    }
  } else {
    pl.hp = Math.min(maxHp(pl), pl.hp + 50);
    pl.shield = Math.max(pl.shield || 0, 15);
    pl.shieldT = Math.max(pl.shieldT || 0, 8);
    addFloat(pl.x, pl.y - 20, '茶水间补给：+50 HP +15 盾', '#7ee08a', 8, 1.1);
  }
  G.pendingLevels--;
  G.personaSnooze = false;   // 本次升级选完普通卡，下次升级重新提供人设抽卡
  SFX.pickup();
  checkEvolutions(pl);
  if (G.pendingLevels > 0) openLevelup();
  else setState('playing');
}
/* ---------- 觉醒系统：技能满级+搭档融合成质变效果，统一收敛在这里判定 ---------- */
function checkEvolutions(pl) {
  pl.evolved = pl.evolved || {};
  for (const e of EVOLUTIONS) {
    if (pl.evolved[e.id]) continue;
    if ((pl.skills[e.needSkillId] || 0) < e.needSkillLv) continue;
    let hasPartner = false;
    if (e.needPartnerType === 'skill') hasPartner = (pl.skills[e.needPartnerId] || 0) >= (e.needPartnerLv || 1);
    else if (e.needPartnerType === 'sub') hasPartner = !!pl.subs[e.needPartnerId];
    else if (e.needPartnerType === 'active') hasPartner = !!(
      (pl.activeQ && pl.activeQ.id === e.needPartnerId) ||
      (pl.activeE && pl.activeE.id === e.needPartnerId) ||
      (pl.active && pl.active.id === e.needPartnerId)   // 兼容旧存档
    );
    if (!hasPartner) continue;
    pl.evolved[e.id] = true;
    addFx({ type: 'evolutionfx', x: pl.x, y: pl.y, r: 24, life: .9 });   // 觉醒紫色爆发
    /* 每个觉醒的具体效果是专属 mods 标记位，运行时在对应技能/副武器/主动的逻辑里读取 */
    if (e.id === 'evo_rlhf_nuke_dataset') { pl.mods.executionNukeEvery = 8; pl.mods.executeBlastChance += .25; }
    else if (e.id === 'evo_rlhf_last_feedback') pl.mods.__evoLastFeedback = true;
    else if (e.id === 'evo_revival_shift_change') pl.mods.__evoShiftChange = true;
    else if (e.id === 'evo_revival_fubao_field') pl.mods.__evoFubaoField = true;
    else if (e.id === 'evo_opc_outsource_empire') pl.mods.__evoOutsourceEmpire = true;
    else if (e.id === 'evo_opc_layoff_wave') pl.mods.__evoLayoffWave = true;
    else if (e.id === 'evo_blame_furnace') pl.mods.blameReflectPct = .8;
    else if (e.id === 'evo_dismissal_committee') pl.mods.__evoDismissalChain = true;
    else if (e.id === 'evo_online_offline') pl.mods.__evoOnlineOffline = true;
    else if (e.id === 'evo_pretend_not_seen') pl.mods.__evoFakeDiligenceUpgrade = true;
    warn(`✨ 觉醒：${e.name}！${e.desc}`);
    addFloat(pl.x, pl.y - 30, `觉醒：${e.name}`, '#ffcf33', 11, 1.6);
    SFX.fuse(); addShake(5);
  }
}

/* ---------- 状态机 / 全局操作 ---------- */
export function startGame() {
  initAudio();
  BGM.init();
  cancelPendingSfx();
  bridge.emit('feed-clear');
  let months = 3;
  try { months = parseInt(localStorage.getItem('niuma_trial') ?? '3', 10); } catch (e) { /* ignore */ }
  months = clamp(isNaN(months) ? 3 : months, 0, 6);
  G = newGame(months);
  /* 免试用期开局直面 19 个持枪同事：给一段开局护盾缓冲（实测全托管 15 秒暴毙，落地成盒劝退） */
  if (months === 0) { G.player.shield = 30; G.player.shieldT = 20; }
  setState('playing');
  warn(months > 0
    ? `HR：签到成功。试用期 ${months} 个月，期间同事互不伤害，先把琐事清了。`
    : 'HR：签到成功，欢迎参加本季度大逃杀（新人保护盾 20 秒）。');
}
export function backToMenu() { setState('menu'); }
export function togglePause() {
  if (state === 'playing') setState('paused');
  else if (state === 'paused') setState('playing');
}

export function handleKey(code) {
  if (code === 'KeyM') { bridge.emit('mute-toggle'); return; }
  if (state === 'playing') {
    /* v2.0：E 分流——踩在武器芯片上换武器，否则施放 E 主动技能 */
    if (code === 'KeyE') { if (G && G.hoverChip) playerSwap(); else castActive('e'); }
    else if (code === 'KeyF') playerFuse();
    else if (code === 'KeyQ') castActive('q');
    else if (code === 'KeyT') cycleFireMode();
    else if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'Space') playerDash();
    else if (code === 'Escape' || code === 'KeyP') togglePause();
  } else if (state === 'paused') {
    if (code === 'Escape' || code === 'KeyP') togglePause();
  } else if (state === 'levelup') {
    if (code === 'Digit1') pickLevelChoice(0);
    else if (code === 'Digit2') pickLevelChoice(1);
    else if (code === 'Digit3') pickLevelChoice(2);
    else if (code === 'Digit4') pickLevelChoice(3);
    else if (code === 'Digit5') pickLevelChoice(4);
  } else if (state === 'menu' || state === 'dead' || state === 'win') {
    if (code === 'Enter' && Date.now() - loadedAt > 500) startGame();
  }
}
handlers.onKeyPress = handleKey;
handlers.getState = getState;

/* ---------- 历史最佳战绩 ---------- */
export function loadBest() {
  try { return JSON.parse(localStorage.getItem('niuma_best') || 'null'); } catch (e) { return null; }
}
function saveBest(rank, kills) {
  try {
    const b = loadBest();
    if (!b || rank < b.rank || (rank === b.rank && kills > b.kills)) {
      localStorage.setItem('niuma_best', JSON.stringify({ rank, kills }));
      return !!b;   // 首局不算破纪录
    }
  } catch (e) { /* 无痕模式等 */ }
  return false;
}

/* ---------- 开发调试钩子 ---------- */
if (typeof window !== 'undefined') {
  window.__niuma = {
    getG, getState, update, startGame, backToMenu, togglePause, pickLevelChoice,
    cycleFireMode, getFireMode, castActive,
    playerSwap, playerFuse, playerDash,
    applyDamage, applyCurse, applyTechPickup, applySkill, gainXp, nearestUnit, isFoe,
    aliveWorkers, chipObtainable,
    keys, mouse, touch, cam,
  };
}
