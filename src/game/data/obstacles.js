/* =====================================================================
 * v2.0 掩体系统 · 障碍物/装饰品定义
 * cover: 'T1' 全掩体 阻挡直线弹药 + 有 HP    (desk / cabinet / whiteboard / microwave)
 * cover: 'T2' 半掩体 50% 概率挡弹 + 有 HP    (chair / printer / cooler / trash)
 * cover: 'T3' 隐蔽    不挡弹但玩家进入隐身 1.5s  (plant / coat_rack)
 * hp: 破坏所需伤害
 * regenerable: 破坏后是否 30s 重生
 * loot: 破坏后掉落表（Phase B 展开）
 * ===================================================================== */
export const OBSTACLE_DEFS = {
  /* T1 全掩体 */
  desk: { cover: 'T1', hp: 60, regenerable: true, w: 60, h: 40,
    loot: { chip: .05, tech: .10, heal: .05 } },
  cabinet: { cover: 'T1', hp: 60, regenerable: false, w: 34, h: 46,   // v2.0 align: 60 per design §3.2
    loot: { chip: .10, tech: .60, heal: .05, xp: .10 } },
  whiteboard: { cover: 'T1', hp: 35, regenerable: true, w: 40, h: 42,
    loot: { chip: .05, tech: .05, heal: 0, xp: .30, skillCard: .05 } },   // v2.0 align: 30% xp + 5% 技能卡
  microwave: { cover: 'T1', hp: 40, regenerable: false, w: 32, h: 30,
    loot: { chip: 0, tech: 0, heal: 0, special: 'explode' } },

  /* T2 半掩体 */
  chair: { cover: 'T2', hp: 20, regenerable: true, w: 22, h: 24,
    loot: { chip: 0, tech: .05, heal: .05 } },
  printer: { cover: 'T2', hp: 30, regenerable: false, w: 32, h: 30,
    loot: { chip: .20, tech: .40, heal: 0 } },
  cooler: { cover: 'T2', hp: 25, regenerable: false, w: 28, h: 38,
    loot: { chip: 0, tech: 0, heal: 0, special: 'slow_pool' } },
  trash: { cover: 'T2', hp: 15, regenerable: true, w: 22, h: 24,
    loot: { chip: 0, tech: .50, heal: 0, debuff: .15 } },   // v2.0 align: 15% 过期 debuff
  drinks: { cover: 'T2', hp: 12, regenerable: true, w: 26, h: 26,
    loot: { chip: 0, tech: 0, heal: .60 } },

  /* T3 隐蔽（不挡弹但玩家进入 T3 半径内隐身 1.5s） */
  plant: { cover: 'T3', hp: 15, regenerable: true, w: 30, h: 36,
    loot: { chip: 0, tech: .05, heal: .10, xp: .30 } },   // v2.0 align: +30% xp per design §3.2
  coat_rack: { cover: 'T3', hp: 20, regenerable: false, w: 26, h: 44,
    loot: { chip: 0, tech: .10, heal: 0 } },

  /* v2.0 特殊：墙壁（会议室 chokepoint） 不可破坏 */
  wall: { cover: 'T1', hp: 9999, regenerable: false, w: 8, h: 8,
    loot: { chip: 0, tech: 0, heal: 0 }, indestructible: true },
  /* v2.0 特殊：老板保险柜（boss chunk 专属），HP 200，破坏必掉传说 chip */
  safe: { cover: 'T1', hp: 200, regenerable: false, w: 36, h: 44,
    loot: { chip: 0, tech: 0, heal: 0, special: 'legendary' } },

  /* Design §3.2 补齐 4 件 */
  coffee_machine: { cover: 'T2', hp: 25, regenerable: false, w: 28, h: 32,
    loot: { chip: 0, tech: 0, heal: 0, special: 'heal_aura' } },
  sprinkler_head: { cover: 'T2', hp: 20, regenerable: false, w: 22, h: 22,
    loot: { chip: 0, tech: 0, heal: 0, special: 'fire_alarm' } },
  ppt_board: { cover: 'T1', hp: 50, regenerable: false, w: 34, h: 44,
    loot: { chip: 0, tech: 0, heal: 0, special: 'pie_aoe' } },
  desk_phone: { cover: 'T2', hp: 20, regenerable: true, w: 24, h: 22,
    loot: { chip: 0, tech: .10, heal: 0, special: 'harass_call' } },

  /* v2.0 §3.3 环境交互：电梯 45s 传送 / 公告板 tip */
  elevator: { cover: 'T1', hp: 200, regenerable: false, w: 40, h: 44,
    loot: { chip: 0, tech: 0, heal: 0 }, indestructible: true },
  bulletin_board: { cover: 'T2', hp: 25, regenerable: true, w: 30, h: 32,
    loot: { chip: 0, tech: .05, heal: 0 } },

  /* v2.0 §2.1 Chunk 内容补齐 · 沙发（老板办公室）+ 冰箱（茶水间）*/
  sofa: { cover: 'T2', hp: 35, regenerable: true, w: 44, h: 26,
    loot: { chip: 0, tech: .10, heal: .35 } },
  fridge: { cover: 'T1', hp: 50, regenerable: false, w: 28, h: 38,
    loot: { chip: 0, tech: 0, heal: .90 } },
  bookshelf: { cover: 'T1', hp: 45, regenerable: false, w: 34, h: 42,
    loot: { chip: .05, tech: .30, heal: 0, xp: .40 } },
  snack_cabinet: { cover: 'T2', hp: 25, regenerable: true, w: 28, h: 34,
    loot: { chip: 0, tech: 0, heal: .70 } },
};

/* v2.0 视觉/hitbox 共用尺寸（design 意图：hitbox = 视觉，看到什么就挡什么）
 *   dw/dh = 渲染尺寸；ox/oy = 相对 sx/sy 的偏移
 *   spawnProp 用这些字段生成 hitbox；render.js 用它绘制 */
export const PROP_VISUAL = {
  desk:           { dw: 68, dh: 52, ox: -8, oy: -14 },
  printer:        { dw: 34, dh: 34, ox: 0,  oy: -8 },
  cooler:         { dw: 30, dh: 40, ox: 0,  oy: -12 },
  plant:          { dw: 32, dh: 38, ox: 0,  oy: -10 },
  whiteboard:     { dw: 42, dh: 44, ox: -4, oy: -14 },
  chair:          { dw: 26, dh: 30, ox: 0,  oy: -6 },
  trash:          { dw: 24, dh: 28, ox: 0,  oy: -4 },
  cabinet:        { dw: 34, dh: 46, ox: 0,  oy: -18 },
  drinks:         { dw: 28, dh: 28, ox: 0,  oy: -6 },
  microwave:      { dw: 32, dh: 32, ox: 0,  oy: -8 },
  coat_rack:      { dw: 26, dh: 44, ox: 0,  oy: -12 },
  coffee_machine: { dw: 30, dh: 34, ox: 0,  oy: -8 },
  sprinkler_head: { dw: 24, dh: 22, ox: 0,  oy: -6 },
  ppt_board:      { dw: 34, dh: 44, ox: 0,  oy: -14 },
  desk_phone:     { dw: 26, dh: 22, ox: 0,  oy: -4 },
  sofa:           { dw: 46, dh: 26, ox: -2, oy: -6 },
  fridge:         { dw: 30, dh: 40, ox: 0,  oy: -12 },
  bookshelf:      { dw: 36, dh: 44, ox: -2, oy: -16 },
  snack_cabinet:  { dw: 30, dh: 36, ox: 0,  oy: -10 },
  safe:           { dw: 40, dh: 48, ox: -2, oy: -12 },
};

/* T3 隐蔽半径：玩家进入后隐身 hiddenDur 秒
 * v2.8.4 26→60：原来基本要踩进花盆才触发，现在是一小片"草丛"（LoL 式） */
export const T3_HIDE_RADIUS = 60;
export const T3_HIDE_DUR = 1.5;

/* T2 挡弹概率 */
export const T2_BLOCK_CHANCE = .5;

/* 破坏后消失延迟 */
export const DESTROY_FADE_T = 5;

/* 可再生物品重生 CD */
export const REGEN_CD = 30;

/* 检查一个 sprite id 是否是"直线弹药 vs 掩体"命中判定 */
export function isDirectFireBullet(shape, ownerKind) {
  /* 抛物线大饼 / 追踪 / 闪电 / 光环 / 光束 无视 T1 掩体 */
  if (shape === 'bigpie' || shape === 'pie') return false;
  if (shape === 'orb' || shape === 'pea') return false;   // homing 类
  return true;
}
