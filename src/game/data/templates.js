/* =====================================================================
 * v2.1 Chunk Template 库：主题家具岛（开放式大平层，无墙）
 *
 * 设计原则（解决"家具杂乱"）：
 *   1. 每个 chunk 只放 1 个紧凑的主题岛（工位岛/会议岛/茶水角/打印角），四周大留白
 *   2. 所有坐标落在 20px 网格上，成排/对称，一眼可读
 *   3. 生成时不做位置抖动、不做随机换皮、不撒惊喜物 —— 整齐即高级
 *   4. 岛内家具可以互相贴合（如两张桌拼成会议长桌）
 * 每个 template 里的 dx/dy 是相对 chunk 原点 (0, 0) 的偏移；CHUNK_SIZE = 400
 * ===================================================================== */
import { CHUNK_SIZE } from './chunks.js';

/* v2.1：墙壁概念已移除（开放式办公室），保留字段兼容 spawn 代码 */
const NO_WALLS = [];

/* ---------- 工位森林：桌椅成阵的工位岛 ---------- */
const CUBICLES_A = {   // 2×2 工位岛（桌+椅成对），右上一盆绿植收尾
  obstacles: [
    { spr: 'desk', dx: 120, dy: 120 }, { spr: 'desk', dx: 240, dy: 120 },
    { spr: 'desk', dx: 120, dy: 260 }, { spr: 'desk', dx: 240, dy: 260 },
  ],
  decor: [
    { spr: 'chair', dx: 140, dy: 180 }, { spr: 'chair', dx: 260, dy: 180 },
    { spr: 'chair', dx: 140, dy: 320 }, { spr: 'chair', dx: 260, dy: 320 },
    { spr: 'plant', dx: 340, dy: 120 }, { spr: 'coffee_machine', dx: 40, dy: 300 },
  ],
  walls: NO_WALLS,
};
const CUBICLES_B = {   // 一横排 3 工位，右侧垃圾桶收尾
  obstacles: [
    { spr: 'desk', dx: 80,  dy: 160 }, { spr: 'desk', dx: 200, dy: 160 },
    { spr: 'desk', dx: 320, dy: 160 },
  ],
  decor: [
    { spr: 'chair', dx: 100, dy: 220 }, { spr: 'chair', dx: 220, dy: 220 },
    { spr: 'chair', dx: 340, dy: 220 },
    { spr: 'trash', dx: 40,  dy: 160 }, { spr: 'coffee_machine', dx: 40, dy: 240 },
  ],
  walls: NO_WALLS,
};
const CUBICLES_C = {   // 竖排 2×2 紧凑岛 + 白板（组内公告）
  obstacles: [
    { spr: 'desk', dx: 140, dy: 100 }, { spr: 'desk', dx: 260, dy: 100 },
    { spr: 'desk', dx: 140, dy: 240 }, { spr: 'desk', dx: 260, dy: 240 },
    { spr: 'whiteboard', dx: 60, dy: 100 },
  ],
  decor: [
    { spr: 'chair', dx: 160, dy: 160 }, { spr: 'chair', dx: 280, dy: 160 },
    { spr: 'chair', dx: 160, dy: 300 }, { spr: 'chair', dx: 280, dy: 300 },
    { spr: 'coffee_machine', dx: 60, dy: 240 },
  ],
  walls: NO_WALLS,
};

/* ---------- 会议室：拼合长桌 + 围椅 + 白板，一个紧凑会议岛 ---------- */
const MEETING_A = {   // 横向长桌（两桌拼合）+ 6 椅围坐 + 白板在上
  obstacles: [
    { spr: 'desk', dx: 140, dy: 180 }, { spr: 'desk', dx: 208, dy: 180 },
    { spr: 'whiteboard', dx: 180, dy: 80 },
  ],
  decor: [
    { spr: 'chair', dx: 150, dy: 140 }, { spr: 'chair', dx: 220, dy: 140 },
    { spr: 'chair', dx: 150, dy: 240 }, { spr: 'chair', dx: 220, dy: 240 },
    { spr: 'chair', dx: 90,  dy: 190 }, { spr: 'chair', dx: 290, dy: 190 },
    { spr: 'coffee_machine', dx: 320, dy: 260 },
  ],
  walls: NO_WALLS,
};
const MEETING_B = {   // 竖向长桌 + PPT 展板 + 座机（打断汇报的道具都在会议室）
  obstacles: [
    { spr: 'desk', dx: 180, dy: 140 }, { spr: 'desk', dx: 180, dy: 192 },
    { spr: 'ppt_board', dx: 100, dy: 80 }, { spr: 'desk_phone', dx: 280, dy: 140 },
  ],
  decor: [
    { spr: 'chair', dx: 140, dy: 150 }, { spr: 'chair', dx: 260, dy: 150 },
    { spr: 'chair', dx: 140, dy: 210 }, { spr: 'chair', dx: 260, dy: 210 },
    { spr: 'coffee_machine', dx: 320, dy: 260 },
  ],
  walls: NO_WALLS,
};
const MEETING_C = {   // 剧场式：白板讲台 + 两排听众椅（全员大会现场）
  obstacles: [
    { spr: 'whiteboard', dx: 180, dy: 80 }, { spr: 'ppt_board', dx: 260, dy: 80 },
  ],
  decor: [
    { spr: 'chair', dx: 140, dy: 180 }, { spr: 'chair', dx: 200, dy: 180 }, { spr: 'chair', dx: 260, dy: 180 },
    { spr: 'chair', dx: 140, dy: 240 }, { spr: 'chair', dx: 200, dy: 240 }, { spr: 'chair', dx: 260, dy: 240 },
    { spr: 'coffee_machine', dx: 80, dy: 240 },
  ],
  walls: NO_WALLS,
};

/* ---------- 茶水间：一条厨电操作台 + 补给点 ---------- */
const BREAK_A = {   // 厨电一字排开（冰箱→咖啡机→微波炉→零食柜），下方饮水补给
  obstacles: [
    { spr: 'fridge', dx: 100, dy: 120 }, { spr: 'coffee_machine', dx: 160, dy: 120 },
    { spr: 'microwave', dx: 220, dy: 120 }, { spr: 'snack_cabinet', dx: 280, dy: 120 },
  ],
  decor: [
    { spr: 'cooler', dx: 160, dy: 220 }, { spr: 'drinks', dx: 220, dy: 220 },
    { spr: 'trash', dx: 340, dy: 120 },
  ],
  walls: NO_WALLS,
};
const BREAK_B = {   // L 形茶水角 + 摸鱼沙发
  obstacles: [
    { spr: 'fridge', dx: 100, dy: 100 }, { spr: 'coffee_machine', dx: 160, dy: 100 },
    { spr: 'microwave', dx: 220, dy: 100 },
  ],
  decor: [
    { spr: 'cooler', dx: 100, dy: 180 }, { spr: 'drinks', dx: 100, dy: 240 },
    { spr: 'sofa', dx: 220, dy: 220 }, { spr: 'plant', dx: 300, dy: 100 },
  ],
  walls: NO_WALLS,
};
const BREAK_C = {   // 迷你补给站：咖啡机 + 饮水机对排
  obstacles: [
    { spr: 'coffee_machine', dx: 180, dy: 140 }, { spr: 'sprinkler_head', dx: 240, dy: 140 },
  ],
  decor: [
    { spr: 'cooler', dx: 300, dy: 140 }, { spr: 'drinks', dx: 180, dy: 220 },
    { spr: 'drinks', dx: 240, dy: 220 }, { spr: 'plant', dx: 120, dy: 140 },
  ],
  walls: NO_WALLS,
};

/* ---------- 打印复印室：打印机排 + 文件柜富矿 ---------- */
const PRINT_A = {   // 双打印机 + 两侧文件柜对称
  obstacles: [
    { spr: 'cabinet', dx: 100, dy: 132 }, { spr: 'printer', dx: 160, dy: 140 },
    { spr: 'printer', dx: 220, dy: 140 }, { spr: 'cabinet', dx: 280, dy: 132 },
  ],
  decor: [
    { spr: 'trash', dx: 160, dy: 220 }, { spr: 'trash', dx: 220, dy: 220 },
    { spr: 'coffee_machine', dx: 320, dy: 220 },
  ],
  walls: NO_WALLS,
};
const PRINT_B = {   // 打印机一横排 3 台，下方文件柜对
  obstacles: [
    { spr: 'printer', dx: 140, dy: 140 }, { spr: 'printer', dx: 200, dy: 140 },
    { spr: 'printer', dx: 260, dy: 140 },
    { spr: 'cabinet', dx: 160, dy: 232 }, { spr: 'cabinet', dx: 240, dy: 232 },
  ],
  decor: [
    { spr: 'trash', dx: 100, dy: 140 }, { spr: 'coffee_machine', dx: 320, dy: 220 },
  ],
  walls: NO_WALLS,
};
const PRINT_C = {   // 档案区：文件柜排 + 双打印机
  obstacles: [
    { spr: 'cabinet', dx: 120, dy: 132 }, { spr: 'cabinet', dx: 180, dy: 132 },
    { spr: 'cabinet', dx: 240, dy: 132 },
    { spr: 'printer', dx: 150, dy: 240 }, { spr: 'printer', dx: 210, dy: 240 },
  ],
  decor: [
    { spr: 'trash', dx: 300, dy: 140 }, { spr: 'coffee_machine', dx: 300, dy: 240 },
  ],
  walls: NO_WALLS,
};

/* ---------- 老板办公室：大班台 + 保险柜 + 书墙 ---------- */
const BOSS_A = {
  obstacles: [
    { spr: 'bookshelf', dx: 140, dy: 80 }, { spr: 'bookshelf', dx: 200, dy: 80 },
    { spr: 'desk', dx: 160, dy: 180 },
  ],
  decor: [
    { spr: 'chair', dx: 190, dy: 140 }, { spr: 'sofa', dx: 100, dy: 280 },
    { spr: 'plant', dx: 80, dy: 80 }, { spr: 'plant', dx: 280, dy: 80 },
    { spr: 'coffee_machine', dx: 300, dy: 260 },
  ],
  walls: NO_WALLS,
  safe: { dx: 260, dy: 172 },   // 保险柜贴着班台右侧
};
const BOSS_B = {
  obstacles: [
    { spr: 'bookshelf', dx: 100, dy: 100 }, { spr: 'desk', dx: 160, dy: 200 },
  ],
  decor: [
    { spr: 'chair', dx: 190, dy: 160 }, { spr: 'sofa', dx: 260, dy: 300 },
    { spr: 'coat_rack', dx: 280, dy: 100 }, { spr: 'plant', dx: 60, dy: 300 },
    { spr: 'coffee_machine', dx: 60, dy: 220 },
  ],
  walls: NO_WALLS,
  safe: { dx: 180, dy: 100 },   // 保险柜藏书架旁
};
const BOSS_C = {
  obstacles: [
    { spr: 'desk', dx: 160, dy: 140 },
    { spr: 'bookshelf', dx: 280, dy: 132 },
  ],
  decor: [
    { spr: 'chair', dx: 190, dy: 100 }, { spr: 'sofa', dx: 120, dy: 260 },
    { spr: 'plant', dx: 80, dy: 140 }, { spr: 'drinks', dx: 240, dy: 260 },
    { spr: 'coffee_machine', dx: 300, dy: 260 },
  ],
  walls: NO_WALLS,
  safe: { dx: 200, dy: 252 },
};

/* ---------- 走廊：电梯/公告板地标 + 极简绿植，大片可跑空间 ---------- */
const CORRIDOR_A = {
  obstacles: [
    { spr: 'elevator', dx: 60, dy: 180 },
    { spr: 'bulletin_board', dx: 300, dy: 80 },
  ],
  decor: [
    { spr: 'plant', dx: 200, dy: 300 }, { spr: 'coffee_machine', dx: 300, dy: 260 },
  ],
  walls: NO_WALLS,
};
const CORRIDOR_B = {
  obstacles: [
    { spr: 'elevator', dx: 340, dy: 180 },
  ],
  decor: [
    { spr: 'plant', dx: 100, dy: 120 }, { spr: 'plant', dx: 100, dy: 280 },
    { spr: 'coffee_machine', dx: 260, dy: 220 },
  ],
  walls: NO_WALLS,
};
const CORRIDOR_C = {
  obstacles: [
    { spr: 'elevator', dx: 180, dy: 80 },
    { spr: 'bulletin_board', dx: 180, dy: 300 },
  ],
  decor: [
    { spr: 'plant', dx: 80, dy: 200 }, { spr: 'plant', dx: 320, dy: 200 },
    { spr: 'coffee_machine', dx: 320, dy: 300 },
  ],
  walls: NO_WALLS,
};

export const CHUNK_TEMPLATES = {
  cubicles: [CUBICLES_A, CUBICLES_B, CUBICLES_C],
  meeting:  [MEETING_A, MEETING_B, MEETING_C],
  break:    [BREAK_A, BREAK_B, BREAK_C],
  print:    [PRINT_A, PRINT_B, PRINT_C],
  boss:     [BOSS_A, BOSS_B, BOSS_C],
  corridor: [CORRIDOR_A, CORRIDOR_B, CORRIDOR_C],
};

/* 从 chunk 类型抽取一个 template（3 选 1 + 25% 旋转 90°）
 * 旋转保留 —— 它变的是"岛的朝向"而不是"岛的整齐度" */
export function pickTemplate(type) {
  const arr = CHUNK_TEMPLATES[type];
  if (!arr || !arr.length) return null;
  const base = arr[Math.floor(Math.random() * arr.length)];
  const rot = Math.random() < .25 ? 1 : 0;
  if (!rot) return base;
  const rotate = (item) => ({ ...item, dx: CHUNK_SIZE - item.dy - (item.h || 32), dy: item.dx });
  return {
    obstacles: base.obstacles.map(rotate),
    decor: base.decor.map(rotate),
    walls: NO_WALLS,
    safe: base.safe ? rotate(base.safe) : null,
    _rotated: true,
  };
}

/* v2.1：抖动归零 —— 家具岛靠对齐取胜（保留导出兼容旧引用） */
export const JITTER = 0;
