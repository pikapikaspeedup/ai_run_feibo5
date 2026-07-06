/* =====================================================================
 * Canvas 渲染：世界 / 单位 / 子弹 / 特效 / 小地图
 * ===================================================================== */
import { VIEW_W, VIEW_H, TUNE } from './constants.js';
import { rand, dist, dist2, clamp } from './utils.js';
import { WEAPONS } from './data/weapons.js';
import { wdef } from './data/weapons.js';
import { CONSUMABLES } from './data/consumables.js';
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
import { PROP_VISUAL as PROP_SIZE } from './data/obstacles.js';

/* v2.2 怪物高清贴图 drop-in 管线：把 mob_<sprKey>.png（可选 mob_<sprKey>_b.png 第二帧）
 * 放进 src/assets/generated/ 即自动替换字符画精灵，无文件时零开销回退字符画。
 * 出图规格与提示词见 dcos/art-pipeline.md */
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

  /* 燃烧区 */
  for (const b of G.burns) {
    ctx.globalAlpha = .18 + .06 * Math.sin(b.t * 8);
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* 拾取物 */
  for (const p of G.pickups) {
    const by = Math.sin(p.bob) * 1.5;
    if (p.type === 'chip') {
      ctx.drawImage(chipSprite(WEAPONS[p.id].color), Math.round(p.x - 4), Math.round(p.y - 4 + by));
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
    } else if (p.type === 'heal') {
      /* 咖啡豆：小绿点 */
      ctx.fillStyle = '#14161d'; ctx.fillRect(Math.round(p.x - 2), Math.round(p.y - 2 + by), 5, 5);
      ctx.fillStyle = '#7ee08a'; ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1 + by), 3, 3);
    } else if (p.type === 'item') {
      const c = CONSUMABLES[p.id];
      const hifiSwap = HIFI.ready && (c.spr === 'coffee' ? HIFI.coffee : c.spr === 'bing' ? HIFI.bing : null);
      ctx.drawImage(hifiSwap || SPR[c.spr], Math.round(p.x - 5), Math.round(p.y - 6 + by));
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
      /* v2.0 §3.3 电梯：金属门，开门时中间发光 */
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(o.x - 2, o.y - 2, o.w + 4, o.h + 4);
      const opening = o._openT > 0;
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
    /* 掩体 hp 条：仅在受伤后显示 */
    if (!o.destroyed && o.hp < o.hpMax && o.hp > 0) {
      const bw = s ? s.dw - 4 : 40, bx = x + (s ? s.ox + 2 : 2), by = y + (s ? s.oy - 4 : -4);
      ctx.fillStyle = '#000'; ctx.fillRect(bx, by, bw, 3);
      ctx.fillStyle = o.cover === 'T1' ? '#ffcf33' : o.cover === 'T2' ? '#c9a227' : '#7ee08a';
      ctx.fillRect(bx, by, bw * (o.hp / o.hpMax), 3);
    }
  };
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
  let spr = u.spr, scale = u.isBoss ? 2 : u.eliteType === 'overfit' ? 1.5 : u.isSummon ? .75 : 1;
  if (HIFI.ready) {
    if (u.isBoss) {
      spr = HIFI.bossFrames[Math.floor(G.t * 2) % 2];
      scale = 1.5;
    } else if (u.eliteType !== 'hallu' && !u.isMob) {
      const frames = workerFrames(u.shirt);
      if (frames) {
        spr = u.standT > .12 ? frames[0] : frames[1 + Math.floor(u.walkT * 1.6) % 4];
        scale = u.eliteType === 'overfit' ? 1.3 : u.eliteTier === 2 ? 1.12 : u.isSummon ? .7 : .9;
      }
    }
  }
  /* v2.2 怪物 PNG 覆盖，三档：帧序列动画 > _b 双帧 > 单帧静态，归一化到 ~18px 高。
   * 帧序列节奏 = 走路里程(walkT) + 慢速全局钟（静止怪也保持呼吸感），chaseOffX 做单位间相位错开 */
  if (u.isMob && u.sprKey) {
    const anim = MOB_ANIM[u.sprKey];
    let hifiMob = null;
    if (anim && anim.length && anim.every(f => f)) {
      hifiMob = anim[Math.abs(Math.floor((u.walkT || 0) * 1.4 + G.t * 4 + (u.chaseOffX || 0))) % anim.length];
    } else {
      const alt = HIFI_MOBS[u.sprKey + '_b'];
      hifiMob = alt && Math.floor(G.t * 6) % 2 ? alt : HIFI_MOBS[u.sprKey];
    }
    if (hifiMob) { spr = hifiMob; scale = Math.min(1, 18 / hifiMob.height); }
  }
  const w = spr.width, h = spr.height;

  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(x - 4 * scale, y + 1, 8 * scale, 2);

  ctx.save();
  if (u.invulnT > 0) ctx.globalAlpha = .5 + .3 * Math.sin(G.t * 20);
  if (u.eliteType === 'hallu') ctx.globalAlpha = .55 + .35 * Math.sin(G.t * 17);
  ctx.translate(x, y + bob);
  ctx.scale(face, 1);
  ctx.drawImage(spr, Math.round(-w / 2 * scale), Math.round(-(h - 3) * scale), Math.round(w * scale), Math.round(h * scale));
  ctx.restore();

  /* 受击白闪 */
  if (u.hurtT > .06) {
    ctx.globalAlpha = .5;
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - w / 2 * scale, y - (h - 3) * scale + bob, w * scale, (h - 2) * scale);
    ctx.globalAlpha = 1;
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
    case 'mugp':
      ctx.drawImage(HIFI.ready && HIFI.coffee ? HIFI.coffee : SPR.coffee, x - 4, y - 5);
      break;
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
    ctx.strokeStyle = f.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * .6), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = k * .25;
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k * .6), 0, Math.PI * 2); ctx.fill();
  } else if (f.type === 'slash') {
    /* 键盘刀光：弧形斩击 */
    ctx.globalAlpha = k * .9;
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 6 * k + 1;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.75 + (1 - k) * .3), f.ang - f.spread, f.ang + f.spread); ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.75 + (1 - k) * .3), f.ang - f.spread * .6, f.ang + f.spread * .6); ctx.stroke();
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
