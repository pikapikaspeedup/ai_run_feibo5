/* =====================================================================
 * Canvas 渲染：世界 / 单位 / 子弹 / 特效 / 小地图
 * ===================================================================== */
import { VIEW_W, VIEW_H, TUNE, MOBILE_ZOOM } from './constants.js';
import { rand, dist, dist2, clamp } from './utils.js';
import { WEAPONS, LEGENDS } from './data/weapons.js';
import { wdef } from './data/weapons.js';
import { CONSUMABLES } from './data/consumables.js';
import { MOBS } from './data/mobs.js';
import { TECH, TECH_TIERS } from './data/tech.js';
import { SPR, chipSprite, techSprite, FLOOR_TILES } from './sprites.js';
import { mouse, touch } from './input.js';
import { getG, getState, cam, maxHp, droneCount, getFireMode } from './core.js';
import { HIFI, workerFrames } from './hifi.js';
import deskHiFi from '../assets/generated/desk_test.png';
import printerHiFi from '../assets/generated/printer.png';
import coolerHiFi from '../assets/generated/cooler.png';
import plantHiFi from '../assets/generated/plant.png';
import whiteboardHiFi from '../assets/generated/whiteboard.png';
import chairHiFi from '../assets/generated/chair.png';
import trashHiFi from '../assets/generated/trash.png';
import cabinetHiFi from '../assets/generated/cabinet.png';
import drinksHiFi from '../assets/generated/drinks.png';
import coffeeHiFi from '../assets/generated/coffee_machine.png';
import sprinklerHiFi from '../assets/generated/sprinkler_head.png';
import pptHiFi from '../assets/generated/ppt_board.png';
import phoneHiFi from '../assets/generated/desk_phone.png';
import sofaHiFi from '../assets/generated/sofa.png';
import fridgeHiFi from '../assets/generated/fridge.png';
import bookshelfHiFi from '../assets/generated/bookshelf.png';
import snackHiFi from '../assets/generated/snack_cabinet.png';
import printerJammed from '../assets/generated/printer_jammed.png';
import cabinetLocked from '../assets/generated/cabinet_locked.png';
const _VARIANT_IMGS = { printer_jammed: null, cabinet_locked: null };
for (const [key, src] of Object.entries({ printer_jammed: printerJammed, cabinet_locked: cabinetLocked })) {
  const img = new Image(); img.onload = () => { _VARIANT_IMGS[key] = img; }; img.src = src;
}
import deskDmg0 from '../assets/generated/desk_damage_0.png';
import deskDmg1 from '../assets/generated/desk_damage_1.png';
import deskDmg2 from '../assets/generated/desk_damage_2.png';
import deskDmg3 from '../assets/generated/desk_damage_3.png';
import cabDmg0 from '../assets/generated/cabinet_damage_0.png';
import cabDmg1 from '../assets/generated/cabinet_damage_1.png';
import cabDmg2 from '../assets/generated/cabinet_damage_2.png';
import cabDmg3 from '../assets/generated/cabinet_damage_3.png';
import prDmg0 from '../assets/generated/printer_damage_0.png';
import prDmg1 from '../assets/generated/printer_damage_1.png';
import prDmg2 from '../assets/generated/printer_damage_2.png';
import prDmg3 from '../assets/generated/printer_damage_3.png';
import wbDmg0 from '../assets/generated/whiteboard_damage_0.png';
import wbDmg1 from '../assets/generated/whiteboard_damage_1.png';
import wbDmg2 from '../assets/generated/whiteboard_damage_2.png';
import wbDmg3 from '../assets/generated/whiteboard_damage_3.png';
import clDmg0 from '../assets/generated/cooler_damage_0.png';
import clDmg1 from '../assets/generated/cooler_damage_1.png';
import clDmg2 from '../assets/generated/cooler_damage_2.png';
import clDmg3 from '../assets/generated/cooler_damage_3.png';
import mwDmg0 from '../assets/generated/microwave_damage_0.png';
import mwDmg1 from '../assets/generated/microwave_damage_1.png';
import mwDmg2 from '../assets/generated/microwave_damage_2.png';
import mwDmg3 from '../assets/generated/microwave_damage_3.png';
/* v2.0 6 件家具各 4 破损状态：desk/cabinet/printer/whiteboard/cooler/microwave */
const DAMAGE_SETS = {};
const _loadSet = (name, srcs) => {
  DAMAGE_SETS[name] = [null, null, null, null];
  srcs.forEach((src, i) => {
    const img = new Image(); img.onload = () => { DAMAGE_SETS[name][i] = img; }; img.src = src;
  });
};
_loadSet('desk',       [deskDmg0, deskDmg1, deskDmg2, deskDmg3]);
_loadSet('cabinet',    [cabDmg0, cabDmg1, cabDmg2, cabDmg3]);
_loadSet('printer',    [prDmg0, prDmg1, prDmg2, prDmg3]);
_loadSet('whiteboard', [wbDmg0, wbDmg1, wbDmg2, wbDmg3]);
_loadSet('cooler',     [clDmg0, clDmg1, clDmg2, clDmg3]);
_loadSet('microwave',  [mwDmg0, mwDmg1, mwDmg2, mwDmg3]);
/* v2.0 Batch 5: 5 more items damage states */
import chDmg0 from '../assets/generated/chair_damage_0.png';
import chDmg1 from '../assets/generated/chair_damage_1.png';
import chDmg2 from '../assets/generated/chair_damage_2.png';
import chDmg3 from '../assets/generated/chair_damage_3.png';
import trDmg0 from '../assets/generated/trash_damage_0.png';
import trDmg1 from '../assets/generated/trash_damage_1.png';
import trDmg2 from '../assets/generated/trash_damage_2.png';
import trDmg3 from '../assets/generated/trash_damage_3.png';
import plDmg0 from '../assets/generated/plant_damage_0.png';
import plDmg1 from '../assets/generated/plant_damage_1.png';
import plDmg2 from '../assets/generated/plant_damage_2.png';
import plDmg3 from '../assets/generated/plant_damage_3.png';
import drDmg0 from '../assets/generated/drinks_damage_0.png';
import drDmg1 from '../assets/generated/drinks_damage_1.png';
import drDmg2 from '../assets/generated/drinks_damage_2.png';
import drDmg3 from '../assets/generated/drinks_damage_3.png';
import crDmg0 from '../assets/generated/coat_rack_damage_0.png';
import crDmg1 from '../assets/generated/coat_rack_damage_1.png';
import crDmg2 from '../assets/generated/coat_rack_damage_2.png';
import crDmg3 from '../assets/generated/coat_rack_damage_3.png';
_loadSet('chair',      [chDmg0, chDmg1, chDmg2, chDmg3]);
_loadSet('trash',      [trDmg0, trDmg1, trDmg2, trDmg3]);
_loadSet('plant',      [plDmg0, plDmg1, plDmg2, plDmg3]);
_loadSet('drinks',     [drDmg0, drDmg1, drDmg2, drDmg3]);
_loadSet('coat_rack',  [crDmg0, crDmg1, crDmg2, crDmg3]);
/* v2.0 Batch 6: 4 more items damage states (coffee/sprinkler/ppt/phone) */
import cmDmg0 from '../assets/generated/coffee_machine_damage_0.png';
import cmDmg1 from '../assets/generated/coffee_machine_damage_1.png';
import cmDmg2 from '../assets/generated/coffee_machine_damage_2.png';
import cmDmg3 from '../assets/generated/coffee_machine_damage_3.png';
import shDmg0 from '../assets/generated/sprinkler_head_damage_0.png';
import shDmg1 from '../assets/generated/sprinkler_head_damage_1.png';
import shDmg2 from '../assets/generated/sprinkler_head_damage_2.png';
import shDmg3 from '../assets/generated/sprinkler_head_damage_3.png';
import ppDmg0 from '../assets/generated/ppt_board_damage_0.png';
import ppDmg1 from '../assets/generated/ppt_board_damage_1.png';
import ppDmg2 from '../assets/generated/ppt_board_damage_2.png';
import ppDmg3 from '../assets/generated/ppt_board_damage_3.png';
import dpDmg0 from '../assets/generated/desk_phone_damage_0.png';
import dpDmg1 from '../assets/generated/desk_phone_damage_1.png';
import dpDmg2 from '../assets/generated/desk_phone_damage_2.png';
import dpDmg3 from '../assets/generated/desk_phone_damage_3.png';
_loadSet('coffee_machine', [cmDmg0, cmDmg1, cmDmg2, cmDmg3]);
_loadSet('sprinkler_head', [shDmg0, shDmg1, shDmg2, shDmg3]);
_loadSet('ppt_board',      [ppDmg0, ppDmg1, ppDmg2, ppDmg3]);
_loadSet('desk_phone',     [dpDmg0, dpDmg1, dpDmg2, dpDmg3]);
/* v2.0 Phase C 完整版：sofa/fridge/bookshelf/snack_cabinet damage states */
import sfDmg0 from '../assets/generated/sofa_damage_0.png';
import sfDmg1 from '../assets/generated/sofa_damage_1.png';
import sfDmg2 from '../assets/generated/sofa_damage_2.png';
import sfDmg3 from '../assets/generated/sofa_damage_3.png';
import frDmg0 from '../assets/generated/fridge_damage_0.png';
import frDmg1 from '../assets/generated/fridge_damage_1.png';
import frDmg2 from '../assets/generated/fridge_damage_2.png';
import frDmg3 from '../assets/generated/fridge_damage_3.png';
import bkDmg0 from '../assets/generated/bookshelf_damage_0.png';
import bkDmg1 from '../assets/generated/bookshelf_damage_1.png';
import bkDmg2 from '../assets/generated/bookshelf_damage_2.png';
import bkDmg3 from '../assets/generated/bookshelf_damage_3.png';
import snDmg0 from '../assets/generated/snack_cabinet_damage_0.png';
import snDmg1 from '../assets/generated/snack_cabinet_damage_1.png';
import snDmg2 from '../assets/generated/snack_cabinet_damage_2.png';
import snDmg3 from '../assets/generated/snack_cabinet_damage_3.png';
_loadSet('sofa',          [sfDmg0, sfDmg1, sfDmg2, sfDmg3]);
_loadSet('fridge',        [frDmg0, frDmg1, frDmg2, frDmg3]);
_loadSet('bookshelf',     [bkDmg0, bkDmg1, bkDmg2, bkDmg3]);
_loadSet('snack_cabinet', [snDmg0, snDmg1, snDmg2, snDmg3]);
/* v2.0 §8.18 保险柜 HiFi damage states */
import svDmg0 from '../assets/generated/safe_damage_0.png';
import svDmg1 from '../assets/generated/safe_damage_1.png';
import svDmg2 from '../assets/generated/safe_damage_2.png';
import svDmg3 from '../assets/generated/safe_damage_3.png';
_loadSet('safe', [svDmg0, svDmg1, svDmg2, svDmg3]);

/* v2.0 高清家具素材（Codex imagegen 生成，128×128 透明 PNG） */
const HIFI_PROPS = { desk: null, printer: null, cooler: null, plant: null, whiteboard: null,
  chair: null, trash: null, cabinet: null, drinks: null,
  coffee_machine: null, sprinkler_head: null, ppt_board: null, desk_phone: null,
  sofa: null, fridge: null, bookshelf: null, snack_cabinet: null };
for (const [key, src] of Object.entries({
  desk: deskHiFi, printer: printerHiFi, cooler: coolerHiFi, plant: plantHiFi, whiteboard: whiteboardHiFi,
  chair: chairHiFi, trash: trashHiFi, cabinet: cabinetHiFi, drinks: drinksHiFi,
  coffee_machine: coffeeHiFi, sprinkler_head: sprinklerHiFi, ppt_board: pptHiFi, desk_phone: phoneHiFi,
  sofa: sofaHiFi, fridge: fridgeHiFi, bookshelf: bookshelfHiFi, snack_cabinet: snackHiFi,
})) {
  const img = new Image();
  img.onload = () => { HIFI_PROPS[key] = img; };
  img.src = src;
}
/* v2.0 视觉/hitbox 共享自 data/obstacles.js（source of truth）*/
import { PROP_VISUAL as PROP_SIZE, T3_HIDE_RADIUS } from './data/obstacles.js';

/* v2.2 怪物高清贴图 drop-in 管线：把 mob_<sprKey>.png（可选 mob_<sprKey>_b.png 第二帧）
 * 放进 src/assets/generated/ 即自动替换字符画精灵，无文件时零开销回退字符画。
 * 出图规格与提示词见 dcos/art-pipeline.md */
/* v2.2 特效帧动画：fx_<name>_f0..fN.png（pixel-animation-grid 产物）——爆炸/命中火花/挥砍轨迹。
 * 一次性播放（按 fx 生命进度取帧），素材缺失时各绘制点回退原有程序化图形 */
const FX_ANIM = {};
/* v2.7：电梯门等非 fx_ 前缀的帧动画并入同一容器 */
const _fxGlob = { ...import.meta.glob('../assets/generated/fx_*.png', { eager: true, import: 'default' }),
  ...import.meta.glob('../assets/generated/elevator_doors_*.png', { eager: true, import: 'default' }) };
for (const [path, src] of Object.entries(_fxGlob)) {
  const key = path.split('/').pop().replace('.png', '');
  const fm = key.match(/^(.+)_f(\d+)$/);
  if (!fm) continue;
  const img = new Image();
  img.onload = () => { (FX_ANIM[fm[1]] = FX_ANIM[fm[1]] || [])[+fm[2]] = img; };
  img.src = src;
}
function fxFrame(name, progress) {
  const a = FX_ANIM[name];
  if (!a || !a.length || !a.every(f => f)) return null;
  return a[Math.min(a.length - 1, Math.max(0, Math.floor(progress * a.length)))];
}
/* v2.7 循环取帧（fx_ 前缀的 loop 素材：燃烧饼/警报灯等持续演出） */
function fxLoop(name, t) {
  const a = FX_ANIM[name];
  if (!a || !a.length || !a.every(f => f)) return null;
  return a[Math.abs(Math.floor(t)) % a.length];
}
/* 一次性特效查表：type → [帧集名, 尺寸倍率, 垂直锚(0.5=居中, 越大越靠上)] */
const ONESHOT_FX = {
  nukefx: ['fx_nuke', 2.8, .8], critfx: ['fx_crit', 2.4, .5], hurtfx: ['fx_hurt', 2.4, .5],
  pickupfx: ['fx_pickup', 2.2, .5], evolutionfx: ['fx_evolution', 2.6, .8],
  revivefx: ['fx_revive', 2.6, .75], summonfx: ['fx_summon', 2.4, .7],
  fusionfx: ['fx_fusion', 2.8, .6], bossslamfx: ['fx_bossslam', 2.6, .6],
  bosspiefx: ['fx_bosspie', 2.6, .85], bossroarfx: ['fx_bossroar', 2.6, .6],
  /* v2.7 素材第五轮：演出欠账补齐 */
  potfx: ['fx_pot', 3.0, .7],           // 一锅端天降大锅
  confettifx: ['fx_confetti', 2.8, .7], // 恭喜毕业/年度优秀员工彩带
  woodenfishfx: ['fx_woodenfish', 2.2, .6], // 电子木鱼功德
  goldstarfx: ['fx_goldstar', 2.4, .5], // 出金/会心金星
  flashfx: ['fx_flash', 3.2, .55],      // 团建合影闪光灯
  paperrainfx: ['fx_paperrain', 2.8, .6], // 打印机卡纸 A4 雨
  waterspillfx: ['fx_waterspill', 2.6, .55], // 饮水机爆裂水花
  alarmfx: ['fx_alarm', 2.2, .6],       // 消防演习警报灯（life 拉长慢放）
  offerfx: ['fx_offer', 2.6, .7],       // 编制降临金光柱
  avalanchefx: ['fx_avalanche', 2.4, .6], // 文档塔雪崩
  paperburstfx: ['fx_paperburst', 2.6, .6], // 纸屑清屏雨(复印机)
};
/* 地面贴花（decal_f0..8：咖啡渍/文件/线缆等，切自 decal_sheet） */
const DECAL_IMGS = [];
const _decalGlob = import.meta.glob('../assets/generated/decal_*.png', { eager: true, import: 'default' });
for (const [path, src] of Object.entries(_decalGlob)) {
  const fm = path.match(/decal_f(\d+)\.png$/);
  if (!fm) continue;
  const img = new Image();
  img.onload = () => { DECAL_IMGS[+fm[1]] = img; };
  img.src = src;
}

/* 精英/老板专属立绘动画（elite_<eliteType>_f*.png / boss_idle_f*.png）——原来精英全是换色工人 */
const ELITE_ANIM = {};
const _eliteGlob = { ...import.meta.glob('../assets/generated/elite_*.png', { eager: true, import: 'default' }),
  ...import.meta.glob('../assets/generated/boss_idle_*.png', { eager: true, import: 'default' }),
  ...import.meta.glob('../assets/generated/player_*.png', { eager: true, import: 'default' }),   // v2.4 人设皮肤
  ...import.meta.glob('../assets/generated/proj_*.png', { eager: true, import: 'default' }) };   // v2.4 弹道贴图
for (const [path, src] of Object.entries(_eliteGlob)) {
  const key = path.split('/').pop().replace('.png', '');
  const fm = key.match(/^(.+)_f(\d+)$/);
  if (!fm) continue;
  const img = new Image();
  img.onload = () => { (ELITE_ANIM[fm[1]] = ELITE_ANIM[fm[1]] || [])[+fm[2]] = img; };
  img.src = src;
}
function eliteFrame(name, t) {
  const a = ELITE_ANIM[name];
  if (!a || !a.length || !a.every(f => f)) return null;
  return a[Math.abs(Math.floor(t)) % a.length];
}
/* v2.4 头顶状态图标（status_<key>.png）：诅咒/举报/易伤/无敌/减速/灼烧/眩晕——原来只有飘字，持续状态不可见 */
const STATUS_ICONS = {};
const _statusGlob = import.meta.glob('../assets/generated/status_*.png', { eager: true, import: 'default' });
for (const [path, src] of Object.entries(_statusGlob)) {
  const key = path.split('/').pop().replace('.png', '').replace(/^status_/, '');
  const img = new Image();
  img.onload = () => { STATUS_ICONS[key] = img; };
  img.src = src;
}
/* 武器芯片专属图标（chip_<id>.png）——原来所有芯片同一张图，只靠名字颜色区分，识别度极差 */
const CHIP_ICONS = {};
const _chipGlob = import.meta.glob('../assets/generated/chip_*.png', { eager: true, import: 'default' });
for (const [path, src] of Object.entries(_chipGlob)) {
  const key = path.split('/').pop().replace('.png', '').replace(/^chip_/, '');
  const img = new Image();
  img.onload = () => { CHIP_ICONS[key] = img; };
  img.src = src;
}
/* 消耗品专属图标（item_<id>.png）——原来 15 种道具共用 6 个小图 */
const ITEM_ICONS = {};
const _itemGlob = import.meta.glob('../assets/generated/item_*.png', { eager: true, import: 'default' });
for (const [path, src] of Object.entries(_itemGlob)) {
  const key = path.split('/').pop().replace('.png', '').replace(/^item_/, '');
  const img = new Image();
  img.onload = () => { ITEM_ICONS[key] = img; };
  img.src = src;
}

const HIFI_MOBS = {};
const MOB_ANIM = {};   // 帧动画：mob_<key>_f0..fN.png（pixel-animation-grid skill 切片产物）→ MOB_ANIM['mob_<key>'] = [帧...]
const _mobGlob = import.meta.glob('../assets/generated/mob_*.png', { eager: true, import: 'default' });
for (const [path, src] of Object.entries(_mobGlob)) {
  const key = path.split('/').pop().replace('.png', '');
  const fm = key.match(/^(.+)_f(\d+)$/);
  const img = new Image();
  img.onload = () => {
    if (fm) (MOB_ANIM[fm[1]] = MOB_ANIM[fm[1]] || [])[+fm[2]] = img;
    else HIFI_MOBS[key] = img;
  };
  img.src = src;
}

/* 屏幕空间径向渐变缓存：参数逐帧恒定（低血/圈外/受伤红晕 1 个 + 停电 5 个），
 * 避免每帧 createRadialGradient；渐变按满 alpha 构建，绘制时用 globalAlpha 调制强度。
 * VIEW_W/H 目前是常量，但仍带尺寸守卫：万一画布内部分辨率变化自动失效重建 */
let _grads = null;
function screenGrads(ctx) {
  if (_grads && _grads.w === VIEW_W && _grads.h === VIEW_H) return _grads;
  const mk = (x, y, r0, r1, c0, c1) => {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    return g;
  };
  const cornerPts = [[0, 0], [VIEW_W, 0], [0, VIEW_H], [VIEW_W, VIEW_H]];
  _grads = {
    w: VIEW_W, h: VIEW_H,
    /* 停电视野圈：以原点为中心构建，绘制时 translate 到玩家屏幕坐标 */
    vision: mk(0, 0, 40, 100, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.75)'),
    /* 停电四角警灯红光 */
    cornerPts,
    corners: cornerPts.map(([x, y]) => mk(x, y, 0, 90, 'rgba(255,30,30,1)', 'rgba(255,30,30,0)')),
    /* 低血/圈外/受伤红晕 */
    vignette: mk(VIEW_W / 2, VIEW_H / 2, VIEW_H * .42, VIEW_H * .72, 'rgba(255,50,50,0)', 'rgba(255,50,50,1)'),
  };
  return _grads;
}

export function render(ctx) {
  const G = getG(), state = getState();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#12151c';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (!G) return;

  ctx.save();
  const shx = cam.shake ? rand(-cam.shake, cam.shake) : 0;
  const shy = cam.shake ? rand(-cam.shake, cam.shake) : 0;
  const ox = Math.round(cam.x + shx), oy = Math.round(cam.y + shy);
  ctx.translate(-ox, -oy);

  /* 地板 */
  const tx0 = Math.floor(ox / 32), ty0 = Math.floor(oy / 32);
  for (let ty = ty0; ty <= ty0 + Math.ceil(VIEW_H / 32); ty++) {
    for (let tx = tx0; tx <= tx0 + Math.ceil(VIEW_W / 32); tx++) {
      if (tx < 0 || ty < 0 || tx * 32 >= TUNE.world || ty * 32 >= TUNE.world) continue;
      ctx.drawImage(FLOOR_TILES[(tx * 7 + ty * 13) % 3], tx * 32, ty * 32);
    }
  }
  ctx.strokeStyle = '#0b0d12'; ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, TUNE.world - 6, TUNE.world - 6);

  /* v2.7 顶灯光晕：画在地板之上、贴花之下——办公室终于有"光"了（素材未到货前静默跳过） */
  if (G.lightSpots) {
    for (const L of G.lightSpots) {
      if (L.x < ox - 90 || L.x > ox + VIEW_W + 90 || L.y < oy - 90 || L.y > oy + VIEW_H + 90) continue;
      const lf = fxLoop('fx_lightpool', G.t * 3 + L.x * .01);
      if (!lf) break;
      ctx.globalAlpha = .22;
      ctx.drawImage(lf, L.x - 60, L.y - 42, 120, 84);
      ctx.globalAlpha = 1;
    }
  }
  /* v2.8 抽烟怪烟雾区：灰雾圆（有贴图用贴图 loop，否则程序渐变雾） */
  for (const u of G.units) {
    if (!u.alive || !u.mobType || !MOBS[u.mobType] || !MOBS[u.mobType].smokeZone) continue;
    const r = MOBS[u.mobType].smokeZone;
    const sf = fxLoop('fx_smokezone', G.t * 3 + u.x * .02);
    if (sf) {
      ctx.globalAlpha = .5;
      ctx.drawImage(sf, u.x - r, u.y - r * .8, r * 2, r * 1.6);
      ctx.globalAlpha = 1;
    } else {
      const g2 = ctx.createRadialGradient(u.x, u.y - 6, 6, u.x, u.y - 6, r);
      g2.addColorStop(0, 'rgba(160,160,170,.4)');
      g2.addColorStop(1, 'rgba(160,160,170,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(u.x, u.y - 6, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  /* v2.8 会议室结界圈：蓝色双环 + 旋转虚线（出圈掉血警示） */
  if (G.arena) {
    const A = G.arena;
    ctx.save();
    ctx.strokeStyle = '#6aa3ff'; ctx.lineWidth = 3;
    ctx.globalAlpha = .7 + .2 * Math.sin(G.t * 6);
    ctx.setLineDash([12, 8]); ctx.lineDashOffset = -G.t * 30;
    ctx.beginPath(); ctx.arc(A.x, A.y, A.r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = .12;
    ctx.fillStyle = '#6aa3ff';
    ctx.beginPath(); ctx.arc(A.x, A.y, A.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  /* v2.8 打卡机光柱：金色呼吸柱 + 底座 */
  if (G.punchClocks) {
    for (const pc of G.punchClocks) {
      const a = .5 + .35 * Math.sin(G.t * 8 + pc.x);
      ctx.save();
      ctx.globalAlpha = a * .5;
      ctx.fillStyle = '#ffcf33';
      ctx.fillRect(pc.x - 7, pc.y - 62, 14, 62);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffe27a';
      ctx.fillRect(pc.x - 3, pc.y - 62, 6, 62);
      ctx.fillStyle = '#14161d';
      ctx.fillRect(pc.x - 9, pc.y - 6, 18, 8);
      ctx.fillStyle = '#ffcf33';
      ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('打卡', pc.x, pc.y - 66);
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }
  /* v2.7 空调风口飘带（挂在 chunk 顶边，环境在动的信号） */
  if (G.acVents) {
    for (const V of G.acVents) {
      if (V.x < ox - 40 || V.x > ox + VIEW_W + 40 || V.y < oy - 40 || V.y > oy + VIEW_H + 40) continue;
      const vf = fxLoop('fx_acflow', G.t * 5 + V.x * .03);
      if (!vf) break;
      ctx.globalAlpha = .8;
      ctx.drawImage(vf, V.x - 11, V.y - 8, 22, 18);
      ctx.globalAlpha = 1;
    }
  }
  /* v2.3 地面贴花：咖啡渍/散落文件/线缆等（画在地板上、单位之下，屏外由 canvas 自动裁剪） */
  if (G.decals && DECAL_IMGS.length) {
    for (const d of G.decals) {
      const img = DECAL_IMGS[d.i % DECAL_IMGS.length];
      if (!img) continue;
      if (d.x < ox - 40 || d.x > ox + VIEW_W + 40 || d.y < oy - 40 || d.y > oy + VIEW_H + 40) continue;
      ctx.save();
      ctx.globalAlpha = .45;
      ctx.translate(d.x, d.y);
      ctx.rotate(d.a);
      ctx.drawImage(img, -15, -15, 30, 30);
      ctx.restore();
    }
  }

  /* v2.0 Phase F Gap 4 · 关闭 chunk 世界视图叠加：半透明红色蒙层 + "禁"字警告 */
  if (G.chunkClosed && G.chunkGrid) {
    const CHUNK_STRIDE_W = 500;
    for (let cy = 0; cy < G.chunkClosed.length; cy++) {
      for (let cx = 0; cx < G.chunkClosed[cy].length; cx++) {
        if (!G.chunkClosed[cy][cx]) continue;
        const wx = cx * CHUNK_STRIDE_W, wy = cy * CHUNK_STRIDE_W;
        /* 红色半透明蒙层，脉动闪烁 */
        const alpha = 0.18 + 0.08 * Math.sin(G.t * 3);
        ctx.fillStyle = `rgba(255, 79, 79, ${alpha})`;
        ctx.fillRect(wx, wy, 400, 400);
        /* 边缘虚线 "禁入" */
        ctx.strokeStyle = '#ff4f4f'; ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(wx + 4, wy + 4, 392, 392);
        ctx.setLineDash([]);
        /* 中央"禁"字 */
        ctx.fillStyle = 'rgba(255, 79, 79, 0.55)';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('禁', wx + 200, wy + 200);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      }
    }
  }

  /* 燃烧区（v2.7：带 spr 的用帧动画贴图循环——文心燃烧大饼等） */
  for (const b of G.burns) {
    const bf = b.spr && fxLoop(b.spr, G.t * 8 + b.x * .05);
    if (bf) {
      ctx.globalAlpha = .85;
      const s = b.r * 2.4 / bf.width;
      ctx.drawImage(bf, b.x - bf.width * s / 2, b.y - bf.height * s / 2, bf.width * s, bf.height * s);
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.globalAlpha = .18 + .06 * Math.sin(b.t * 8);
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* 拾取物 */
  for (const p of G.pickups) {
    const by = Math.sin(p.bob) * 1.5;
    if (p.type === 'chip') {
      /* v2.3 攒芯片指示圈：同款（可升级）金圈脉冲 / 可进副手槽青圈——一眼锁定该捡哪块 */
      const plw = G.player.alive ? G.player : null;
      if (plw) {
        const matchMain = !plw.weapon.leg && p.id === plw.weapon.id && plw.weapon.lvl < 5;
        const matchOff = plw.weapon2 && !plw.weapon2.leg && p.id === plw.weapon2.id && plw.weapon2.lvl < 5;
        const slotOff = plw.weapon2Unlocked && !plw.weapon2 && p.id !== plw.weapon.id;
        if (matchMain || matchOff || slotOff) {
          ctx.globalAlpha = .55 + .35 * Math.sin(G.t * 6 + p.bob);
          ctx.strokeStyle = slotOff ? '#7ac8ff' : '#ffcf33';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(p.x, p.y + by, 8.5, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      const cIcon = CHIP_ICONS[p.id];
      if (cIcon) ctx.drawImage(cIcon, Math.round(p.x - 7), Math.round(p.y - 7 + by), 14, 14);
      else ctx.drawImage(chipSprite(WEAPONS[p.id].color), Math.round(p.x - 4), Math.round(p.y - 4 + by));
      if (p.lvl > 1) {
        ctx.font = '6px monospace'; ctx.fillStyle = '#ffcf33';
        ctx.fillText('Lv' + p.lvl, p.x - 5, p.y - 7 + by);
      }
      if (G.player.alive && dist2(p.x, p.y, G.player.x, G.player.y) < 70 * 70) {
        ctx.font = '7px monospace';
        const nm = WEAPONS[p.id].name;
        ctx.fillStyle = '#000'; ctx.fillText(nm, p.x - nm.length * 3.5 + 1, p.y + 13 + by);
        ctx.fillStyle = WEAPONS[p.id].color; ctx.fillText(nm, p.x - nm.length * 3.5, p.y + 12 + by);
      }
    } else if (p.type === 'tech') {
      const t = TECH[p.id];
      const tierInfo = TECH_TIERS[(p.tier || 1) - 1];
      ctx.drawImage(techSprite(t.color), Math.round(p.x - 4), Math.round(p.y - 4 + by));
      /* 高品级微光 */
      if ((p.tier || 1) >= 2) {
        ctx.globalAlpha = .35 + .2 * Math.sin(p.bob * 2);
        ctx.strokeStyle = tierInfo.color;
        ctx.beginPath(); ctx.arc(p.x, p.y + by, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (G.player.alive && dist2(p.x, p.y, G.player.x, G.player.y) < 70 * 70) {
        const nm = tierInfo.label + t.name;
        ctx.font = '7px monospace';
        ctx.fillStyle = '#000'; ctx.fillText(nm, p.x - nm.length * 3.5 + 1, p.y + 13 + by);
        ctx.fillStyle = tierInfo.color || t.color; ctx.fillText(nm, p.x - nm.length * 3.5, p.y + 12 + by);
      }
    } else if (p.type === 'sample') {
      ctx.drawImage(SPR.flask, Math.round(p.x - 3), Math.round(p.y - 5 + by));
      if (G.player.alive && dist2(p.x, p.y, G.player.x, G.player.y) < 90 * 90) {
        const nm = 'AI替身样本';
        ctx.font = '7px monospace';
        ctx.fillStyle = '#000'; ctx.fillText(nm, p.x - nm.length * 3.5 + 1, p.y + 13 + by);
        ctx.fillStyle = '#d9b3ff'; ctx.fillText(nm, p.x - nm.length * 3.5, p.y + 12 + by);
      }
    } else if (p.type === 'box') {
      /* v2.8 裁员纸箱：等待有缘怪捡走传承 */
      ctx.fillStyle = '#8a6a4a'; ctx.fillRect(p.x - 6, p.y - 6 + by, 12, 10);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(p.x - 6, p.y - 6 + by, 12, 3);
      ctx.fillStyle = '#f2efe6'; ctx.font = '5px monospace'; ctx.textAlign = 'center';
      ctx.fillText('没事', p.x, p.y + 2 + by);
      ctx.textAlign = 'left';
    } else if (p.type === 'badge') {
      /* v2.5 职位工牌：金框挂绳工牌，粉杠 = HRBP、黄杠 = 大魔王翻页笔 */
      const px = Math.round(p.x), py = Math.round(p.y + by);
      const glow = .5 + .3 * Math.sin(G.t * 5);
      ctx.globalAlpha = glow; ctx.strokeStyle = '#ffcf33';
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#14161d'; ctx.fillRect(px - 4, py - 6, 8, 11);
      ctx.fillStyle = '#f2efe6'; ctx.fillRect(px - 3, py - 5, 6, 9);
      ctx.fillStyle = p.badge === 'hrbp_talk' ? '#ff9edb' : '#ffcf33';
      ctx.fillRect(px - 3, py - 5, 6, 3);
      ctx.fillStyle = '#8a8271'; ctx.fillRect(px - 1, py - 8, 2, 2);   // 挂绳扣
      if (G.player.alive && dist2(p.x, p.y, G.player.x, G.player.y) < 110 * 110) {
        const nm = p.badge === 'hrbp_talk' ? 'HRBP工牌·E槽' : '大魔王翻页笔·E槽';
        ctx.font = '7px monospace';
        ctx.fillStyle = '#000'; ctx.fillText(nm, p.x - nm.length * 3.5 + 1, p.y + 15 + by);
        ctx.fillStyle = '#ffcf33'; ctx.fillText(nm, p.x - nm.length * 3.5, p.y + 14 + by);
      }
    } else if (p.type === 'heal') {
      /* 咖啡豆：小绿点 */
      ctx.fillStyle = '#14161d'; ctx.fillRect(Math.round(p.x - 2), Math.round(p.y - 2 + by), 5, 5);
      ctx.fillStyle = '#7ee08a'; ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1 + by), 3, 3);
    } else if (p.type === 'item') {
      const c = CONSUMABLES[p.id];
      const icon = ITEM_ICONS[p.id];
      if (icon) {
        ctx.drawImage(icon, Math.round(p.x - 7), Math.round(p.y - 9 + by), 14, 14);   // 专属图标（128→14px）
      } else {
        const hifiSwap = HIFI.ready && (c.spr === 'coffee' ? HIFI.coffee : c.spr === 'bing' ? HIFI.bing : null);
        ctx.drawImage(hifiSwap || SPR[c.spr], Math.round(p.x - 5), Math.round(p.y - 6 + by));
      }
    } else {
      ctx.drawImage(SPR.xp, Math.round(p.x - 3), Math.round(p.y - 3 + by));
    }
  }

  /* 订书机炮台 */
  for (const tr of G.turrets) {
    const tx = Math.round(tr.x), ty = Math.round(tr.y);
    ctx.fillStyle = '#14161d'; ctx.fillRect(tx - 4, ty - 4, 9, 7);
    ctx.fillStyle = tr.life < 2 && Math.sin(G.t * 10) > 0 ? '#8d5a5a' : '#8d9dbb';
    ctx.fillRect(tx - 3, ty - 3, 7, 5);
    ctx.fillStyle = '#c9c4b4'; ctx.fillRect(tx + 3, ty - 2, 3, 2);   // 出钉口
  }

  /* 单位 + 家具（按 y 排序） */
  const drawables = [];
  /* 生成贴图统一走内缩采样：imagegen grid 裁切在部分帧边缘留了 1-2px 亮线残留，
   * 源矩形四边各内缩 2px 即可全部剔除（对以后重新生成的贴图同样免疫） */
  const drawSprInset = (img, dx, dy, dw, dh) => {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    if (iw > 12 && ih > 12) ctx.drawImage(img, 2, 2, iw - 4, ih - 4, dx, dy, dw, dh);
    else ctx.drawImage(img, dx, dy, dw, dh);
  };
  /* v2.0 掩体渲染：破坏后半透明淡出 + 血条随伤害显示；桌子按 hp% 切换 4 状态贴图
   * 特殊 spr: wall = 会议室墙壁（灰色实体），safe = 老板保险柜（金色金属） */
  const drawProp = (o, x, y) => {
    if (o.destroyed) {
      ctx.globalAlpha = Math.max(0, o.destroyedT / 5);
    }
    if (o.spr === 'wall') {
      ctx.fillStyle = '#5a5654';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#3a3634';
      ctx.fillRect(o.x, o.y, o.w, 2);
      ctx.globalAlpha = 1;
      return;
    }
    if (o.spr === 'elevator') {
      /* v2.7 电梯门帧动画（elevator_doors_f0 关 → f8 全开）：开门 0.5s 内播开、关门前 0.5s 倒放 */
      const T = o._openT || 0;
      const df = (() => {
        if (!FX_ANIM.elevator_doors || !FX_ANIM.elevator_doors[8]) return null;
        const idx = T <= 0 ? 0 : T > 2.5 ? Math.round((3 - T) / .5 * 8) : T < .5 ? Math.round(T / .5 * 8) : 8;
        return FX_ANIM.elevator_doors[Math.max(0, Math.min(8, idx))];
      })();
      if (df) {
        ctx.drawImage(df, o.x - 2, o.y - 2, o.w + 4, o.h + 4);
        ctx.globalAlpha = 1;
        return;
      }
      /* 素材未到货回退：v2.0 §3.3 金属门程序绘制 */
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);
      const opening = T > 0;
      ctx.fillStyle = opening ? '#38d3e8' : '#6a6a6a';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(o.x + o.w / 2 - 1, o.y + 4, 2, o.h - 8);
      ctx.fillStyle = '#c9c4b4';
      ctx.font = '8px monospace';
      ctx.fillText(opening ? '开' : '关', o.x + o.w / 2 - 4, o.y - 2);
      ctx.globalAlpha = 1;
      return;
    }
    if (o.spr === 'bulletin_board') {
      /* v2.0 §3.3 公告板：软木色板 + 白纸 */
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(o.x - 1, o.y - 1, o.w + 2, o.h + 2);
      ctx.fillStyle = '#8a6a4a';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      /* 三张随机白纸 */
      ctx.fillStyle = '#f2efe6';
      ctx.fillRect(o.x + 4, o.y + 4, 8, 10);
      ctx.fillRect(o.x + 16, o.y + 6, 8, 12);
      ctx.fillRect(o.x + 8, o.y + 18, 12, 8);
      ctx.globalAlpha = 1;
      return;
    }
    /* v2.0 §8.18 保险柜：走 DAMAGE_SETS 通道（HiFi 4 状态），血条另绘 */
    if (o.spr === 'safe' && DAMAGE_SETS.safe && DAMAGE_SETS.safe[0]) {
      const pct = o.destroyed ? 0 : (o.hp / o.hpMax);
      const idx = o.destroyed ? 3 : pct > .75 ? 0 : pct > .50 ? 1 : pct > .25 ? 2 : 3;
      const s = PROP_SIZE.safe;
      drawSprInset(DAMAGE_SETS.safe[idx] || DAMAGE_SETS.safe[0], x + s.ox, y + s.oy, s.dw, s.dh);
      if (!o.destroyed && o.hp < o.hpMax) {
        ctx.fillStyle = '#000';
        ctx.fillRect(o.x, o.y - 6, o.w, 3);
        ctx.fillStyle = '#ffcf33';
        ctx.fillRect(o.x, o.y - 6, o.w * (o.hp / o.hpMax), 3);
      }
      ctx.globalAlpha = 1;
      return;
    }
    const s = PROP_SIZE[o.spr];
    /* v2.0 §3.4 · 隐藏内容 视觉标识：卡纸打印机 / 上锁文件柜（贴图切换到 variant） */
    if (o.spr === 'printer' && o.jammed && !o._resumeUsed && _VARIANT_IMGS.printer_jammed) {
      const s = PROP_SIZE.printer;
      if (s) { drawSprInset(_VARIANT_IMGS.printer_jammed, x + s.ox, y + s.oy, s.dw, s.dh); ctx.globalAlpha = 1; return; }
    }
    if (o.spr === 'cabinet' && o.locked && _VARIANT_IMGS.cabinet_locked) {
      const s = PROP_SIZE.cabinet;
      if (s) { drawSprInset(_VARIANT_IMGS.cabinet_locked, x + s.ox, y + s.oy, s.dw, s.dh); ctx.globalAlpha = 1; return; }
    }
    /* 4 状态破损贴图：hp% ≥ 75 完好 / 50 轻 / 25 重 / 0 碎（桌子/文件柜）*/
    const damage4 = DAMAGE_SETS[o.spr];
    if (damage4 && damage4[0]) {
      const pct = o.destroyed ? 0 : (o.hp / o.hpMax);
      const idx = o.destroyed ? 3 : pct > .75 ? 0 : pct > .50 ? 1 : pct > .25 ? 2 : 3;
      const img = damage4[idx] || damage4[0];
      if (s) drawSprInset(img, x + s.ox, y + s.oy, s.dw, s.dh);
      /* v2.0 已搜刮标识：右上角小圆点绿勾徽章，不遮盖桌面主体 */
      if (o.searched && !o.destroyed && s) {
        const bx = x + s.ox + s.dw - 6, by = y + s.oy + 6;
        ctx.fillStyle = 'rgba(20,30,20,.75)';
        ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#7ee08a';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bx - 2.5, by); ctx.lineTo(bx - 0.5, by + 2); ctx.lineTo(bx + 2.5, by - 2);
        ctx.stroke();
      }
    } else {
      const hifi = HIFI_PROPS[o.spr];
      if (hifi && s) drawSprInset(hifi, x + s.ox, y + s.oy, s.dw, s.dh);
      else if (SPR[o.spr]) ctx.drawImage(SPR[o.spr], x, y, 52, 32);
    }
    ctx.globalAlpha = 1;
    /* v2.3 咖啡机蒸汽循环（还有存货才冒气） */
    if (o.spr === 'coffee_machine' && !o.destroyed && (o._coffeeUses || 0) < 4) {
      const sf = fxFrame('fx_coffee', ((G.t * 5 + o.x * .07) % 9) / 9);
      if (sf) {
        ctx.globalAlpha = .8;
        ctx.drawImage(sf, x + (s ? s.ox + s.dw / 2 : 16) - 9, y + (s ? s.oy : 0) - 16, 18, 18);
        ctx.globalAlpha = 1;
      }
    }
    /* v2.7 设施 idle：打印机吐纸抖动 / 饮水机气泡——办公室开始"呼吸" */
    if (o.spr === 'printer' && !o.destroyed) {
      const pf = fxLoop('fx_printeridle', G.t * 4 + o.x * .05);
      if (pf) { ctx.drawImage(pf, x + (s ? s.ox : 0), y + (s ? s.oy - 2 : -2), s ? s.dw : 26, s ? s.dh : 22); }
    }
    if ((o.spr === 'cooler' || o.spr === 'drinks') && !o.destroyed) {
      const cf = fxLoop('fx_coolerbubble', G.t * 3 + o.x * .04);
      if (cf) {
        ctx.globalAlpha = .9;
        ctx.drawImage(cf, x + (s ? s.ox : 0), y + (s ? s.oy - 4 : -4), s ? s.dw : 20, s ? s.dh : 26);
        ctx.globalAlpha = 1;
      }
    }
    /* 掩体 hp 条：仅在受伤后显示 */
    if (!o.destroyed && o.hp < o.hpMax && o.hp > 0) {
      const bw = s ? s.dw - 4 : 40, bx = x + (s ? s.ox + 2 : 2), by = y + (s ? s.oy - 4 : -4);
      ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, 3);
      ctx.fillStyle = o.cover === 'T1' ? '#ffcf33' : o.cover === 'T2' ? '#c9a227' : '#7ee08a';
      ctx.fillRect(bx, by, bw * (o.hp / o.hpMax), 3);
    }
  };
  /* v2.8.4 绿植隐身范围提示圈（地面层）：玩家靠近浮现虚线圈，站进去加亮——范围可读才有人用 */
  if (G.player && G.player.alive) {
    const pl = G.player;
    ctx.save();
    ctx.strokeStyle = '#7ee08a';
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -G.t * 12;
    for (const arr of [G.obstacles, G.decor]) {
      for (const o of arr) {
        if (o.destroyed || o.cover !== 'T3') continue;
        const px = o.sx + o.w / 2, py = o.sy + o.h / 2;
        const d2 = (pl.x - px) * (pl.x - px) + (pl.y - py) * (pl.y - py);
        if (d2 > 180 * 180) continue;
        const inside = d2 < T3_HIDE_RADIUS * T3_HIDE_RADIUS;
        ctx.globalAlpha = inside ? .55 : .2;
        ctx.lineWidth = inside ? 2 : 1;
        ctx.beginPath(); ctx.arc(px, py, T3_HIDE_RADIUS, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
  }
  for (const o of G.obstacles) if (!o.destroyed || o.destroyedT > 0) drawables.push({ y: o.sy + 14, draw: () => drawProp(o, o.sx, o.sy) });
  /* decor 与 obstacles 同走 spawnProp，须传原始锚点 sx/sy——
   * d.x/d.y 是已加过 PROP_VISUAL ox/oy 的 hitbox 坐标，drawProp 内部会再加一次导致贴图偏移 */
  for (const d of G.decor) if (!d.destroyed || d.destroyedT > 0) drawables.push({ y: d.y + 12, draw: () => drawProp(d, d.sx, d.sy) });
  for (const u of G.units) if (u.alive) drawables.push({ y: u.y + 3, draw: () => drawUnit(ctx, G, u) });
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  for (const p of G.projs) drawProj(ctx, G, p);
  for (const f of G.fx) drawFx(ctx, f);

  /* v2.0 §8.20 快递箱视觉：从 y-140 掉到落地点，最后 0.15s 阴影铺开 */
  if (G.crates) {
    for (const c of G.crates) {
      const p = 1 - c.fallT / .8;   // 0 → 1（下落进度）
      const startY = c.y - 140;
      const curY = startY + (c.y - startY) * Math.min(1, p * p);   // easeIn 加速下落
      /* 落点阴影（越靠近越大越深）*/
      const shadowW = 26 + 22 * p;
      const shadowA = 0.15 + 0.35 * p;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowA})`;
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 4, shadowW, shadowW * .35, 0, 0, Math.PI * 2); ctx.fill();
      if (curY < c.y - 4) {
        /* 箱子本体 */
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(c.x - 12, curY - 10, 24, 20);
        ctx.fillStyle = '#a06a3a';
        ctx.fillRect(c.x - 12, curY - 10, 24, 3);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(c.x - 12, curY + 8, 24, 2);
        /* 十字胶带 */
        ctx.fillStyle = '#c9a227';
        ctx.fillRect(c.x - 1.5, curY - 10, 3, 20);
        ctx.fillRect(c.x - 12, curY - 1.5, 24, 3);
        /* 掉落轨迹速度线 */
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
        ctx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(c.x + i * 4, curY - 22);
          ctx.lineTo(c.x + i * 4, curY - 12);
          ctx.stroke();
        }
      }
    }
  }

  /* v2.0 §3.5 停电事件：屏幕暗化 + 玩家周围可见圆 + §8.20 警灯（四角红闪 + 中央旋转警灯）*/
  if (G.blackoutActiveT > 0) {
    const gr = screenGrads(ctx);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (G.player.alive) {
      /* 「中心透明→边缘黑」径向渐变一次铺满全屏：视野圈内亮、圈外暗。
       * 不能用 destination-out 挖洞——那会把已绘制的世界连同遮罩一起擦掉 */
      const pl = G.player;
      const px = pl.x - cam.x, py = pl.y - cam.y;
      ctx.translate(px, py);
      ctx.fillStyle = gr.vision;
      ctx.fillRect(-px, -py, VIEW_W, VIEW_H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    /* §8.20 警灯：四角闪红（2Hz 脉动）+ 顶部中央旋转警灯 icon */
    const pulse = 0.4 + 0.4 * Math.sin(G.t * 8);
    const cornerR = 90;
    /* 四个角径向渐变（缓存渐变 + globalAlpha 调制脉动强度）*/
    ctx.globalAlpha = pulse * 0.7;
    for (let i = 0; i < 4; i++) {
      const [cx, cy] = gr.cornerPts[i];
      ctx.fillStyle = gr.corners[i];
      ctx.beginPath(); ctx.arc(cx, cy, cornerR, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    /* 顶部中央旋转警灯 icon（红圆 + 旋转扫光）*/
    const iconX = VIEW_W / 2, iconY = 34;
    const rot = G.t * 4;
    /* 底盘 */
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.arc(iconX, iconY, 14, 0, Math.PI * 2); ctx.fill();
    /* 灯罩 */
    ctx.fillStyle = `rgba(255, 30, 30, ${0.4 + pulse * 0.6})`;
    ctx.beginPath(); ctx.arc(iconX, iconY, 10, 0, Math.PI * 2); ctx.fill();
    /* 旋转扫光 */
    ctx.save();
    ctx.translate(iconX, iconY);
    ctx.rotate(rot);
    ctx.fillStyle = `rgba(255, 200, 100, ${pulse * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(38, -8);
    ctx.lineTo(38, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();   // 结束旋转扫光局部变换
    /* 下面这个 restore 已回到外层世界坐标系 translate(-ox,-oy)，
     * 不能再补 translate(-cam.x,-cam.y)——否则其后的粒子/红线圈/飘字被双重偏移 */
    ctx.restore();
  }

  for (const p of G.parts) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  /* 裁员红线 */
  const z = G.zone;
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox - 20, oy - 20, VIEW_W + 40, VIEW_H + 40);
  ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2, true);
  ctx.fillStyle = 'rgba(255, 60, 60, .13)';
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#ff4f4f';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.arc(z.cx, z.cy, z.r, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  if (z.shrinking) {
    ctx.strokeStyle = 'rgba(242,239,230,.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(z.toCx, z.toCy, z.toR, 0, Math.PI * 2); ctx.stroke();
  }

  /* 飘字 */
  for (const f of G.floats) {
    ctx.globalAlpha = Math.min(1, 2 - 2 * f.t / f.life);
    ctx.font = `bold ${f.size}px "PingFang SC", monospace`;
    ctx.fillStyle = '#000';
    ctx.fillText(f.text, f.x - f.text.length * f.size * .28 + 1, f.y + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x - f.text.length * f.size * .28, f.y);
  }
  ctx.globalAlpha = 1;

  /* 自动瞄准框（触屏 / 全托管模式） */
  if ((touch.using || getFireMode() === 2) && state === 'playing' && touch.aimTarget && touch.aimTarget.alive) {
    const t = touch.aimTarget;
    const bx = Math.round(t.x), by2 = Math.round(t.y - 6), r = 9;
    ctx.strokeStyle = '#ffcf33';
    ctx.lineWidth = 1;
    for (const [sx2, sy2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      ctx.beginPath();
      ctx.moveTo(bx + sx2 * r, by2 + sy2 * r - sy2 * 4);
      ctx.lineTo(bx + sx2 * r, by2 + sy2 * r);
      ctx.lineTo(bx + sx2 * r - sx2 * 4, by2 + sy2 * r);
      ctx.stroke();
    }
  }
  ctx.restore();

  /* 屏幕边缘指示箭头：圈外指路 / Boss / 小Boss / 开局指芯片 */
  if (state === 'playing' && G.player.alive) {
    if (!G.trial.active && dist(G.player.x, G.player.y, z.cx, z.cy) > z.r) edgeArrow(ctx, G, z.cx, z.cy, '#ff4f4f');
    if (G.boss && G.boss.alive) edgeArrow(ctx, G, G.boss.x, G.boss.y, '#b665ff');
    for (const u of G.units) if (u.alive && u.eliteTier === 2) edgeArrow(ctx, G, u.x, u.y, '#ff9440');
    /* v2.6.2 波次收尾指示：尾波残余怪（waveRush）画绿色边缘箭头——躲猫猫的最后几只一眼可寻 */
    for (const u of G.units) if (u.alive && u.waveRush) edgeArrow(ctx, G, u.x, u.y, '#7ee08a');
    if (G.t < 25 && G.player.weapon.lvl === 1 && !G.player.weapon.leg) {
      let pc = null, pd = Infinity;
      for (const p of G.pickups) {
        if (p.type !== 'chip') continue;
        const d2 = dist2(p.x, p.y, G.player.x, G.player.y);
        if (d2 < pd) { pd = d2; pc = p; }
      }
      if (pc) edgeArrow(ctx, G, pc.x, pc.y, '#ffcf33');
    }
  }

  /* 准星（键鼠模式） */
  if (state === 'playing' && G.player.alive && !touch.using) {
    ctx.strokeStyle = 'rgba(255,207,51,.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mouse.x - 5, mouse.y); ctx.lineTo(mouse.x - 2, mouse.y);
    ctx.moveTo(mouse.x + 2, mouse.y); ctx.lineTo(mouse.x + 5, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 5); ctx.lineTo(mouse.x, mouse.y - 2);
    ctx.moveTo(mouse.x, mouse.y + 2); ctx.lineTo(mouse.x, mouse.y + 5);
    ctx.stroke();
  }

  /* 受伤红晕 / 圈外警告 / 幻觉滤镜 */
  const pl = G.player;
  if (pl.alive) {
    const low = pl.hp < maxHp(pl) * .3;
    const outside = dist(pl.x, pl.y, z.cx, z.cy) > z.r;
    if (low || outside || pl.hurtT > 0) {
      const a = Math.max(low ? .22 : 0, outside ? .18 + .08 * Math.sin(G.t * 6) : 0, pl.hurtT > 0 ? .3 : 0);
      /* 缓存的满 alpha 渐变 × globalAlpha=a，等价于每帧重建 0→a 渐变 */
      ctx.globalAlpha = a;
      ctx.fillStyle = screenGrads(ctx).vignette;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.globalAlpha = 1;
    }
    if (pl.curses.hallu > 0) {
      ctx.fillStyle = `rgba(182,101,255,${.06 + .04 * Math.sin(G.t * 5)})`;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }
  }
}

function drawUnit(ctx, G, u) {
  const x = Math.round(u.x), y = Math.round(u.y);
  const bob = u.walkT ? Math.round(Math.sin(u.walkT) * 1) : 0;
  const face = Math.cos(u.aim) >= 0 ? 1 : -1;

  /* 高清帧（加载完成后启用）：走路循环 + 衬衫换色 */
  /* 移动端全局放大 4/3 的例外：Boss 除以 MOBILE_ZOOM 保持原视觉大小（用户点名"都要大，除了 Boss"） */
  let spr = u.spr, scale = u.isBoss ? 2 / MOBILE_ZOOM : u.eliteType === 'overfit' ? 1.5 : u.isSummon ? .75 : 1;
  if (HIFI.ready) {
    if (u.isBoss) {
      spr = HIFI.bossFrames[Math.floor(G.t * 2) % 2];
      scale = 1.5 / MOBILE_ZOOM;
      const bf = eliteFrame('boss_idle', G.t * 5);
      if (bf) { spr = bf; scale = 44 / MOBILE_ZOOM / bf.height; }   // 九帧待机：喝咖啡/看手机/整理领带
    } else if (u.eliteType !== 'hallu' && !u.isMob) {
      const frames = workerFrames(u.shirt);
      if (frames) {
        spr = u.standT > .12 ? frames[0] : frames[1 + Math.floor(u.walkT * 1.6) % 4];
        scale = u.eliteType === 'overfit' ? 1.3 : u.eliteTier === 2 ? 1.12 : u.isSummon ? .7 : .9;
      }
    }
  }
  /* v2.4 玩家人设皮肤：锁定人设后换专属立绘（player_<persona>_f0..8 走路循环） */
  if (u.isPlayer && u.persona) {
    const pf = eliteFrame('player_' + u.persona, (u.walkT || 0) * 1.4 + G.t * 2);
    if (pf) { spr = pf; scale = 26 / pf.height; }
  }
  /* v2.4 HR 制服小兵专属立绘 */
  if (u.isHR) {
    const hf = eliteFrame('elite_hr', G.t * 5 + u.x * .05);
    if (hf) { spr = hf; scale = 22 / hf.height; }
  }
  /* v2.2 精英专属立绘：elite_<type>_f0..8 待机动画（tier2 大一号，竞争壁垒专家再大一号）
   * v2.8：红温模式体型再 +10%（配合下方红色剪影叠加） */
  if (u.isElite && !u.isBoss && u.eliteType) {
    const ef = eliteFrame('elite_' + u.eliteType, G.t * 5 + (u.x * .03));
    if (ef) {
      spr = ef;
      const targetH = (u.eliteType === 'overfit' ? 34 : u.eliteTier === 2 ? 30 : 24) * (u.rageMode ? 1.1 : 1);
      scale = targetH / ef.height;
    }
  }
  /* v2.2 怪物 PNG 覆盖，三档：帧序列动画 > _b 双帧 > 单帧静态，归一化到 ~18px 高。
   * 帧序列节奏 = 走路里程(walkT) + 慢速全局钟（静止怪也保持呼吸感），chaseOffX 做单位间相位错开 */
  if ((u.isMob || u.isSummon) && u.sprKey) {   // v2.4 放宽到召唤物（OPC 外包幻影/数字分身/炮灰墙专属立绘）
    const anim = MOB_ANIM[u.sprKey];
    let hifiMob = null;
    if (anim && anim.length && anim.every(f => f)) {
      hifiMob = anim[Math.abs(Math.floor((u.walkT || 0) * 1.4 + G.t * 4 + (u.chaseOffX || 0))) % anim.length];
    } else {
      const alt = HIFI_MOBS[u.sprKey + '_b'];
      hifiMob = alt && Math.floor(G.t * 6) % 2 ? alt : HIFI_MOBS[u.sprKey];
    }
    if (hifiMob) { spr = hifiMob; scale = Math.min(1, 18 / hifiMob.height) * (u.sizeMul || 1); }
    /* v2.8 文档塔是大块头（sizeMul 随掉层缩小）、屎山巨兽也大一号 */
    if (hifiMob && (u.mobType === 'doc_tower' || u.mobType === 'shit_mountain')) scale = Math.min(1, 30 / hifiMob.height) * (u.sizeMul || 1);
  }
  const w = spr.width, h = spr.height;

  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(x - 4 * scale, y + 1, 8 * scale, 2);

  ctx.save();
  if (u.invulnT > 0) ctx.globalAlpha = .5 + .3 * Math.sin(G.t * 20);
  if (u.eliteType === 'hallu') ctx.globalAlpha = .55 + .35 * Math.sin(G.t * 17);
  if (u.sneakT > 0) ctx.globalAlpha = .38;   // v2.8 小报告匿名疾跑
  if (u.hiddenT > 0) ctx.globalAlpha = .28 + .07 * Math.sin(G.t * 7);   // v2.8.4 贴绿植/临时下线隐身：半透明幽灵态
  ctx.translate(x, y + bob);
  ctx.scale(face, 1);
  if (u.isPlayer && (u.lieFlat || u.baiLanT > 0)) ctx.rotate(Math.PI / 2);   // v2.8 躺平/摆烂：整个人放倒
  ctx.drawImage(spr, Math.round(-w / 2 * scale), Math.round(-(h - 3) * scale), Math.round(w * scale), Math.round(h * scale));
  ctx.restore();

  /* 受击白闪：按精灵剪影闪白——原来是整张贴图的半透明白矩形，
   * 在 128px 帧素材（老板/精英/怪物）上会盖出一大块白色浮层 */
  if (u.hurtT > .06) {
    ctx.save();
    ctx.globalAlpha = .55;
    ctx.filter = 'brightness(0) invert(1)';
    ctx.translate(x, y + bob);
    ctx.scale(face, 1);
    ctx.drawImage(spr, Math.round(-w / 2 * scale), Math.round(-(h - 3) * scale), Math.round(w * scale), Math.round(h * scale));
    ctx.filter = 'none';
    ctx.restore();
  }
  /* v2.8 红温模式：持续红色剪影脉动叠加（技术同受击闪白，sepia+hue 调成红） */
  if (u.rageMode && u.alive) {
    ctx.save();
    ctx.globalAlpha = .22 + .1 * Math.sin(G.t * 9);
    ctx.filter = 'brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(-40deg)';
    ctx.translate(x, y + bob);
    ctx.scale(face, 1);
    ctx.drawImage(spr, Math.round(-w / 2 * scale), Math.round(-(h - 3) * scale), Math.round(w * scale), Math.round(h * scale));
    ctx.filter = 'none';
    ctx.restore();
  }
  /* 对齐守卫的正面护盾弧 */
  if (u.eliteType === 'align') {
    ctx.strokeStyle = '#c9d4e4'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y - 5, 10, u.aim - 1.1, u.aim + 1.1); ctx.stroke();
  }
  /* 被策反的盟友标记 */
  if (u.allyOwner) {
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(x - 1, y - 21 + bob, 3, 3);
    ctx.fillRect(x, y - 19 + bob, 1, 2);
  }
  /* v2.4 头顶状态图标行：诅咒/易伤/无敌/减速/眩晕一目了然（素材缺失时静默跳过，原有程序化标记保留兜底） */
  {
    const st = [];
    if (u.curses) {
      if (u.curses.hallu > 0) st.push('hallu');
      if (u.curses.overfit > 0) st.push('overfit');
      if (u.curses.repeat > 0) st.push('repeat');
    }
    if (u.reportedT > 0) st.push('reported');
    if (u.vulnT > 0) st.push('vuln');
    if (u.invulnT > .25) st.push('invuln');
    if (u.oaSlowT > 0) st.push('slow');
    if (u.stunT > 0) st.push('stun');
    if (st.length) {
      let drawn = 0;
      const w0 = Math.min(st.length, 5) * 8;
      for (const k of st) {
        const img = STATUS_ICONS[k];
        if (!img || drawn >= 5) continue;
        ctx.drawImage(img, Math.round(x - w0 / 2 + drawn * 8), Math.round(y - 31 + bob), 7, 7);
        drawn++;
      }
    }
  }
  /* 被举报标记：闪烁红色感叹号 */
  if (u.reportedT > 0 && Math.sin(G.t * 12) > -0.3) {
    ctx.fillStyle = '#ff4f4f';
    ctx.fillRect(x - 1, y - 26 + bob, 2, 5);
    ctx.fillRect(x - 1, y - 19 + bob, 2, 2);
  }
  /* 向上管理光环标记：金色上箭头 */
  if (u.empowerT > 0) {
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(x + 6, y - 16 + bob, 1, 3);
    ctx.fillRect(x + 5, y - 15 + bob, 3, 1);
  }
  /* v2.5 AI 牛马物种徽标：头顶青色 AI 角标（无标=人类同事） */
  if (u.species === 'ai' && !u.isPlayer && u.alive) {
    ctx.fillStyle = 'rgba(10,14,18,.75)';
    ctx.fillRect(x + 5, y - 26 + bob, 11, 7);
    ctx.fillStyle = '#38d3e8';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('AI', x + 7, y - 20 + bob);
  }
  /* v2.5 HRBP 约谈可视化：头顶读条 + 到被约谈者的粉色连线 + 目标脚下警圈 */
  if (u.eliteType === 'hrbp' && u.talkT > 0 && u.hrbpTarget && u.hrbpTarget.alive) {
    const t = u.hrbpTarget, p = Math.min(1, u.talkT / 5);
    ctx.save();
    ctx.globalAlpha = .55;
    ctx.strokeStyle = '#ff9edb'; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(t.x, t.y - 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(t.x, t.y + 1, 13 + Math.sin(G.t * 8) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#000'; ctx.fillRect(x - 15, y - 34, 30, 5);
    ctx.fillStyle = '#ff9edb'; ctx.fillRect(x - 14, y - 33, 28 * p, 3);
    ctx.fillStyle = '#ffd9ef'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
    ctx.fillText('约谈中', x, y - 37);
    ctx.textAlign = 'left';
  }
  /* v2.9 环绕近战可视化：人体工学椅 / 工位绞肉机键盘刀（任意武器槽持有都画） */
  if (u.alive) {
    for (const slot of [u.weapon, u.weapon2, u.weapon3, u.weapon4]) {
      if (!slot) continue;
      const sd = slot.leg ? LEGENDS[slot.leg] : WEAPONS[slot.id];
      if (!sd || (sd.kind !== 'orbit' && sd.kind !== 'leg_grinder')) continue;
      const leg = sd.kind === 'leg_grinder';
      const n = leg ? sd.orbs : sd.orbs + (slot.lvl >= 2 ? 1 : 0) + (slot.lvl >= 4 ? 1 : 0);
      const R = (sd.orbR + (!leg && slot.lvl >= 3 ? 10 : 0)) * (u.mods ? u.mods.range : 1);
      for (let i = 0; i < n; i++) {
        const oa = (slot.orbAng || 0) + i * Math.PI * 2 / n;
        const ox = x + Math.cos(oa) * R, oy = y - 4 + Math.sin(oa) * R;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(oa + Math.PI / 2);
        if (leg) {
          /* 键盘刀：灰蓝板 + 键帽点 + 白刃 */
          ctx.fillStyle = '#2a2e38'; ctx.fillRect(-6, -4, 12, 8);
          ctx.fillStyle = '#9fb3d1'; ctx.fillRect(-5, -3, 10, 6);
          ctx.fillStyle = '#e8ecf4';
          for (let kx = -4; kx <= 3; kx += 2) for (let ky = -2; ky <= 1; ky += 2) ctx.fillRect(kx, ky, 1, 1);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(-6, -5, 12, 1);
        } else {
          /* 人体工学椅：座+靠背+滚轮 */
          ctx.fillStyle = '#1d5f46'; ctx.fillRect(-4, -3, 8, 6);
          ctx.fillStyle = '#4ec9a0'; ctx.fillRect(-3, -2, 6, 4);
          ctx.fillStyle = '#2a7a5a'; ctx.fillRect(-4, -5, 8, 2);
          ctx.fillStyle = '#14161d'; ctx.fillRect(-3, 3, 2, 1); ctx.fillRect(1, 3, 2, 1);
        }
        ctx.restore();
      }
      /* 转动拖影 */
      if (Math.random() < .3) {
        ctx.globalAlpha = .25;
        ctx.strokeStyle = sd.color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y - 4, R, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
  /* 副武器可视化：显示器回旋盾 / 碎纸机光环 */
  if (u.isPlayer && u.subs.monitor) {
    const s = u.subs.monitor;
    const n = [1, 2, 2][s.lv - 1];
    for (let i = 0; i < n; i++) {
      const da = (s.ang || 0) + i * Math.PI * 2 / n;
      const mx = x + Math.cos(da) * 34, my = y - 4 + Math.sin(da) * 34;
      ctx.fillStyle = '#14161d'; ctx.fillRect(mx - 4, my - 3, 8, 7);
      ctx.fillStyle = '#38b6d9'; ctx.fillRect(mx - 3, my - 2, 6, 4);
    }
  }
  /* v2.5 工位风水阵：站定展开的旋转罗盘圈（渐显渐隐 fengshuiT 0..1） */
  if (u.isPlayer && u.fengshuiT > 0) {
    const fr = 30, a0 = G.t * .8;
    ctx.save();
    ctx.globalAlpha = .5 * u.fengshuiT;
    ctx.strokeStyle = '#ffe27a';
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.arc(x, y - 2, fr, a0, a0 + Math.PI * 2); ctx.stroke();
    ctx.setLineDash([2, 5]);
    ctx.beginPath(); ctx.arc(x, y - 2, fr - 7, -a0, -a0 + Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = .75 * u.fengshuiT;
    ctx.fillStyle = '#ffe27a';
    ctx.font = '7px monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < 4; i++) {
      const da = a0 + i * Math.PI / 2;
      ctx.fillText('吉福旺禄'[i], x + Math.cos(da) * fr, y - 2 + Math.sin(da) * fr + 2);
    }
    ctx.textAlign = 'left';
    ctx.restore();
  }
  if (u.isPlayer && u.subs.shredder) {
    const r = [42, 48, 56][u.subs.shredder.lv - 1];
    ctx.globalAlpha = .12 + .05 * Math.sin(G.t * 6);
    ctx.strokeStyle = '#c9d4e4';
    ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.arc(x, y - 4, r, G.t, G.t + Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  /* RAG 知识库炮台 */
  if (u.mods.rag) {
    for (let i = 0; i < u.mods.rag; i++) {
      const da = u.ragAng + i * Math.PI;
      const dx = x + Math.cos(da) * 27, dy = y - 5 + Math.sin(da) * 27;
      ctx.fillStyle = '#14161d'; ctx.fillRect(dx - 2, dy - 2, 5, 5);
      ctx.fillStyle = '#67c98b'; ctx.fillRect(dx - 1, dy - 1, 3, 3);
    }
  }
  if (u.shield > 0) {
    ctx.strokeStyle = 'rgba(106,163,255,.7)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y - 5, 9 * scale, 0, Math.PI * 2); ctx.stroke();
  }
  /* 僚机 */
  const def = wdef(u);
  if (def.kind === 'drone' || def.kind === 'leg_drone') {
    const n = droneCount(u, def);
    for (let i = 0; i < n; i++) {
      const da = u.weapon.droneAng + i * Math.PI * 2 / n;
      const dx = x + Math.cos(da) * 20, dy = y - 6 + Math.sin(da) * 20;
      ctx.fillStyle = '#14161d'; ctx.fillRect(dx - 2, dy - 2, 5, 5);
      ctx.fillStyle = def.color; ctx.fillRect(dx - 1, dy - 1, 3, 3);
    }
  }
  /* 蓄力弧 */
  if (def.kind === 'charge' && u.weapon.charging) {
    const p = u.weapon.charge / def.chargeT;
    ctx.strokeStyle = p >= 1 ? '#ffcf33' : def.color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y - 5, 11, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
  }
  if (u.isMob) return;   // 杂鱼不画血条/名字/标记

  /* 血条（锚点随精灵实际高度自适应） */
  const mh = maxHp(u), pct = clamp(u.hp / mh, 0, 1);
  const bw = u.isBoss ? 26 : 14;
  const byy = y - Math.round((h - 3) * scale) - 3 + bob;
  ctx.fillStyle = '#000';
  ctx.fillRect(x - bw / 2 - 1, byy - 1, bw + 2, 4);
  ctx.fillStyle = u.isPlayer ? '#7ee08a' : u.isBoss ? '#b665ff' : u.isElite ? '#c58fff' : u.isHR ? '#9aa4b5' : u.allyOwner ? '#ffcf33' : '#ff7a5a';
  ctx.fillRect(x - bw / 2, byy, Math.round(bw * pct), 2);
  /* 名字 */
  if (!u.isPlayer && G.player.alive && dist2(u.x, u.y, G.player.x, G.player.y) < 150 * 150) {
    ctx.font = '7px "PingFang SC", monospace';
    const nm = u.name;
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillText(nm, x - nm.length * 3.2 + 1, byy - 3 + 1);
    ctx.fillStyle = u.isBoss ? '#d9b3ff' : '#c9c4b4';
    ctx.fillText(nm, x - nm.length * 3.2, byy - 3);
  }
  if (u.isPlayer && u.mods.dashCd && u.dashT <= 0) {
    ctx.fillStyle = '#ffcf33';
    ctx.fillRect(x - 3, y + 4, 6, 1);
  }
}

function drawProj(ctx, G, p) {
  const x = Math.round(p.x), y = Math.round(p.y);
  /* v2.4 武器专属弹道贴图（proj_<武器id>_f0..8）：帧随时间推进，整体沿速度方向旋转 */
  if (p.sprKey) {
    const fr = eliteFrame(p.sprKey, G.t * 12 + (p.x + p.y) * .03);
    if (fr) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      const s = p.shape === 'bigboom' || p.shape === 'bigpie' ? 18 : 12;
      ctx.drawImage(fr, -s / 2, -s / 2, s, s);
      ctx.restore();
      return;
    }
  }
  ctx.fillStyle = p.color;
  switch (p.shape) {
    case 'diamond':
      ctx.fillRect(x - 1, y - 2, 2, 4); ctx.fillRect(x - 2, y - 1, 4, 2);
      break;
    case 'streak': {
      const a = Math.atan2(p.vy, p.vx);
      ctx.strokeStyle = p.color; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(a) * 10, y - Math.sin(a) * 10);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillRect(x - 1, y - 1, 3, 3);
      break;
    }
    case 'orb':
      ctx.beginPath(); ctx.arc(x, y, p.r + .5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, y - 1, 1, 1);
      break;
    case 'star':
      ctx.fillRect(x - 2, y, 5, 1); ctx.fillRect(x, y - 2, 1, 5);
      ctx.fillRect(x - 1, y - 1, 3, 3);
      break;
    case 'pea':
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y - 1, 1, 1);
      break;
    case 'slide':   // PPT 幻灯片
      ctx.fillStyle = '#e8e4d8';
      ctx.fillRect(x - 3, y - 2, 6, 5);
      ctx.fillStyle = '#14161d';
      ctx.fillRect(x - 2, y - 1, 4, 1);
      ctx.fillRect(x - 2, y + 1, 3, 1);
      break;
    case 'mugp': {
      /* 九帧翻滚马克杯（素材未载回退咖啡图标） */
      const mf = fxFrame('proj_mug', ((G.t * 14 + p.x * .11) % 9) / 9);
      if (mf) ctx.drawImage(mf, x - 7, y - 8, 14, 14);
      else ctx.drawImage(HIFI.ready && HIFI.coffee ? HIFI.coffee : SPR.coffee, x - 4, y - 5);
      break;
    }
    case 'doc': {
      /* 九帧旋转文件（离职申请单等） */
      const df = fxFrame('proj_paper', ((G.t * 14 + p.x * .13) % 9) / 9);
      if (df) { ctx.drawImage(df, x - 6, y - 7, 13, 13); break; }
      ctx.fillStyle = '#f2efe6'; ctx.fillRect(x - 3, y - 4, 6, 7);
      ctx.fillStyle = '#ff4f4f'; ctx.fillRect(x + 1, y + 1, 2, 2);
      break;
    }
    case 'pie':
      ctx.drawImage(HIFI.ready ? HIFI.bing : SPR.bing, x - 5, y - 5);
      break;
    case 'bigpie':
      ctx.drawImage(HIFI.ready ? HIFI.bing : SPR.bing, x - 8, y - 8, 16, 16);
      break;
    case 'boomerang':
    case 'bigboom': {
      const s = p.shape === 'bigboom' ? 2 : 1;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(G.t * 12);
      ctx.fillStyle = p.shape === 'bigboom' ? '#7ac8ff' : p.color;
      ctx.fillRect(-4 * s, -1 * s, 8 * s, 2 * s);
      ctx.fillRect(-1 * s, -4 * s, 2 * s, 8 * s);
      ctx.restore();
      break;
    }
    default:
      ctx.fillRect(x - p.r, y - p.r, p.r * 2, p.r * 2);
  }
}

/* 屏幕边缘方向箭头 */
function edgeArrow(ctx, G, wx, wy, color) {
  const sx = wx - cam.x, sy = wy - cam.y;
  if (sx > 12 && sx < VIEW_W - 12 && sy > 12 && sy < VIEW_H - 12) return;
  const cx = VIEW_W / 2, cy = VIEW_H / 2;
  let dx = sx - cx, dy = sy - cy;
  const m = Math.hypot(dx, dy);
  if (!m) return;
  dx /= m; dy /= m;
  let k = Infinity;
  if (dx) k = Math.min(k, ((dx > 0 ? VIEW_W - 16 : 16) - cx) / dx);
  if (dy) k = Math.min(k, ((dy > 0 ? VIEW_H - 16 : 16) - cy) / dy);
  const px = cx + dx * k, py = cy + dy * k;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(Math.atan2(dy, dx));
  ctx.globalAlpha = .6 + .35 * Math.sin(G.t * 6);
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.moveTo(9, 1); ctx.lineTo(-4, -5); ctx.lineTo(-4, 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-4, -5); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawFx(ctx, f) {
  const k = 1 - f.t / f.life;
  ctx.globalAlpha = k;
  if (f.type === 'beam') {
    ctx.strokeStyle = f.color; ctx.lineWidth = f.w;
    ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, f.w / 3);
    ctx.beginPath(); ctx.moveTo(f.x1, f.y1); ctx.lineTo(f.x2, f.y2); ctx.stroke();
  } else if (f.type === 'bolt') {
    ctx.strokeStyle = f.color; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let i = 1; i < f.pts.length; i++) {
      const a = f.pts[i - 1], b = f.pts[i];
      ctx.lineTo((a.x + b.x) / 2 + rand(-4, 4), (a.y + b.y) / 2 + rand(-4, 4));
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  } else if (f.type === 'boom') {
    const fr = fxFrame('fx_explosion', 1 - k);
    if (fr) {
      /* 九帧爆炸 + 底层原色细环保留技能色语义 */
      ctx.globalAlpha = Math.min(1, k * 1.6);
      const s = f.r * 2.4;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.round(s), Math.round(s));
      ctx.globalAlpha = k * .45;
      ctx.strokeStyle = f.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * .6), 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * .6), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = k * .25;
      ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * .6), 0, Math.PI * 2); ctx.fill();
    }
  } else if (f.type === 'slash') {
    /* v2.9 近战弧光：扇形楔从窄到全弧展开，边缘亮线拖白 */
    const sweep = Math.min(1, (1 - k) * 2.5);   // 前 40% 时间完成展开
    const a0 = f.ang - f.arc / 2, a1 = a0 + f.arc * sweep;
    ctx.globalAlpha = k * .38;
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.r, a0, a1); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = k * .9;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r - 1, Math.max(a0, a1 - .5), a1); ctx.stroke();
    ctx.globalAlpha = k * .6;
    ctx.strokeStyle = f.color; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * .7, a0, a1); ctx.stroke();
  } else if (f.type === 'spark') {
    /* 子弹命中火花（素材未加载时静默跳过——命中粒子仍在） */
    const fr = fxFrame('fx_spark', 1 - k);
    if (fr) {
      ctx.globalAlpha = 1;
      const s = (f.r || 9) * 2.6;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'muzzle') {
    /* 枪口火焰：素材左锚朝右，按开火方向旋转，焰体在枪口前方 */
    const fr = fxFrame('fx_muzzle', 1 - k);
    if (fr) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.3);
      ctx.translate(f.x, f.y);
      ctx.rotate(f.ang || 0);
      const s = (f.r || 10) * 2.4;
      ctx.drawImage(fr, Math.round(-s * .25), Math.round(-s / 2), Math.round(s), Math.round(s));
      ctx.restore();
    }
  } else if (f.type === 'healfx') {
    const fr = fxFrame('fx_heal', 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.4);
      const s = (f.r || 14) * 2.2;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s * .7), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'levelupfx') {
    const fr = fxFrame('fx_levelup', 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.3);
      const s = (f.r || 20) * 2.4;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s * .8), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'shieldbreak') {
    const fr = fxFrame('fx_shieldbreak', 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.4);
      const s = (f.r || 14) * 2.4;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'executefx') {
    const fr = fxFrame('fx_execute', 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.4);
      const s = (f.r || 16) * 2.4;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'teleportfx') {
    const fr = fxFrame('fx_teleport', 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.3);
      const s = (f.r || 16) * 2.4;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s / 2), Math.round(s), Math.round(s));
    }
  } else if (ONESHOT_FX[f.type]) {
    /* v2.3 通用一次性特效：核爆/暴击/受击/拾取/觉醒/复活/召唤 */
    const [name, mul, yAnchor] = ONESHOT_FX[f.type];
    const fr = fxFrame(name, 1 - k);
    if (fr) {
      ctx.globalAlpha = Math.min(1, k * 1.4);
      const s = (f.r || 14) * mul;
      ctx.drawImage(fr, Math.round(f.x - s / 2), Math.round(f.y - s * yAnchor), Math.round(s), Math.round(s));
    }
  } else if (f.type === 'dashfx') {
    /* 冲刺残影：素材横向朝右，按冲刺方向旋转 */
    const fr = fxFrame('fx_dash', 1 - k);
    if (fr) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.2);
      ctx.translate(f.x, f.y);
      ctx.rotate((f.ang || 0) + Math.PI);   /* 残影拖在身后 */
      const s = (f.r || 14) * 2.6;
      ctx.drawImage(fr, Math.round(-s * .7), Math.round(-s / 2), Math.round(s), Math.round(s));
      ctx.restore();
    }
  } else if (f.type === 'slash') {
    const sfr = fxFrame('fx_slash', 1 - k);
    if (sfr) {
      /* 九帧月牙挥砍：素材开口朝右，按挥击方向旋转 */
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.translate(f.x, f.y);
      ctx.rotate(f.ang);
      const s = f.r * 2.2;
      ctx.drawImage(sfr, Math.round(-s / 2), Math.round(-s / 2), Math.round(s), Math.round(s));
      ctx.restore();
    } else {
      /* 键盘刀光：弧形斩击 */
      ctx.globalAlpha = k * .9;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 6 * k + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.75 + (1 - k) * .3), f.ang - f.spread, f.ang + f.spread); ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.75 + (1 - k) * .3), f.ang - f.spread * .6, f.ang + f.spread * .6); ctx.stroke();
    }
  } else if (f.type === 'ringwarn') {
    /* 预警圈：考勤点名 / 会议邀请 */
    ctx.globalAlpha = .45 + .3 * Math.sin(f.t * 22);
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = k * .12;
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  } else if (f.type === 'cone' || f.type === 'coneflash') {
    /* PPT 全屏演示：扇形预警 / 爆发闪光 */
    ctx.globalAlpha = f.type === 'cone' ? k * .3 + .1 * Math.sin(f.t * 25) : k * .6;
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.arc(f.x, f.y, f.len, f.ang - f.spread, f.ang + f.spread);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = k * .8;
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (f.type === 'pillar') {
    ctx.fillStyle = f.color;
    ctx.globalAlpha = k * .8;
    ctx.fillRect(f.x - f.r * .25, f.y - 400, f.r * .5, 400);
    ctx.globalAlpha = k * .4;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* 小地图 */
export function drawMinimap(mmCtx) {
  const G = getG();
  if (!G) return;
  const s = 54 / TUNE.world;
  mmCtx.fillStyle = '#0c0e13';
  mmCtx.fillRect(0, 0, 54, 54);
  /* v2.0 Chunk 系统 minimap 色块：显示 6×6 分区类型 + 关闭 chunk 红叉 */
  if (G.chunkGrid) {
    const CS = TUNE.world / 6 * s;   // 每 chunk 在 minimap 上的边长（world 3000 / 6 grid）
    const COLORS = {
      cubicles: '#4a3a2a', meeting: '#2a4a6a', break: '#3a6a3a',
      print: '#6a4a2a', boss: '#7a5a1a', corridor: '#3a3a3a',
    };
    for (let cy = 0; cy < 6; cy++) for (let cx = 0; cx < 6; cx++) {
      const type = G.chunkGrid[cy][cx];
      mmCtx.fillStyle = COLORS[type] || '#3a3a3a';
      mmCtx.globalAlpha = .55;
      mmCtx.fillRect(cx * CS, cy * CS, CS + .5, CS + .5);
      mmCtx.globalAlpha = 1;
      if (G.chunkClosed && G.chunkClosed[cy][cx]) {
        mmCtx.strokeStyle = '#ff4f4f';
        mmCtx.beginPath();
        mmCtx.moveTo(cx * CS, cy * CS); mmCtx.lineTo((cx + 1) * CS, (cy + 1) * CS);
        mmCtx.moveTo((cx + 1) * CS, cy * CS); mmCtx.lineTo(cx * CS, (cy + 1) * CS);
        mmCtx.stroke();
      }
    }
  }
  const z = G.zone;
  mmCtx.strokeStyle = '#ff4f4f';
  mmCtx.lineWidth = 1;
  mmCtx.beginPath(); mmCtx.arc(z.cx * s, z.cy * s, z.r * s, 0, Math.PI * 2); mmCtx.stroke();
  if (z.shrinking) {
    mmCtx.strokeStyle = 'rgba(242,239,230,.5)';
    mmCtx.beginPath(); mmCtx.arc(z.toCx * s, z.toCy * s, z.toR * s, 0, Math.PI * 2); mmCtx.stroke();
  }
  const pl = G.player;
  for (const u of G.units) {
    if (!u.alive || u.isPlayer) continue;
    const big = u.isBoss || u.eliteTier === 2;
    mmCtx.fillStyle = u.isBoss ? '#b665ff' : u.eliteTier === 2 ? '#ff9440' : u.isElite ? '#c58fff' : u.allyOwner === pl ? '#ffcf33' : 'rgba(200,120,120,.8)';
    mmCtx.fillRect(u.x * s - (big ? 1.5 : .5), u.y * s - (big ? 1.5 : .5), big ? 3 : 1.5, big ? 3 : 1.5);
  }
  if (pl.alive) {
    mmCtx.fillStyle = '#ffcf33';
    mmCtx.fillRect(pl.x * s - 1, pl.y * s - 1, 2.5, 2.5);
  }
}
