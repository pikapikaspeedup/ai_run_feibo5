/* =====================================================================
 * v2.0 Chunk 系统：把地图划成 7×7 网格，每格 400×400 一块 chunk
 * 6 种 chunk 类型，各自决定填充什么家具/装饰/密度
 * ===================================================================== */
export const CHUNK_SIZE = 400;           // chunk 内容区
export const CHUNK_STRIDE = 500;          // 走廊 100px（stride = size + 100）
export const GRID_N = 6;                  // 6×6 = 36 chunks · 严格对齐 design §10

/* Chunk 类型定义：每种给不同的 fill 策略 */
export const CHUNK_TYPES = {
  cubicles: { color: '#4a3a2a', label: '工位森林',
    /* 大量桌子成阵，中等 T2/T3 装饰 */
    obstacles: [{ spr: 'desk', count: 4, spacing: 100 }],
    decor: [
      { spr: 'chair', wt: 15 }, { spr: 'plant', wt: 10 },
      { spr: 'trash', wt: 8 }, { spr: 'printer', wt: 4 },
      { spr: 'drinks', wt: 4 }, { spr: 'coat_rack', wt: 3 },
    ],
    decorCount: 5, phaseClose: 4 },

  meeting: { color: '#2a4a6a', label: '会议室',
    /* 中央一张大桌（用 desk*2 表示）+ 白板 + 椅子围一圈 */
    obstacles: [
      { spr: 'desk', count: 2, spacing: 80 },
      { spr: 'whiteboard', count: 1 },
    ],
    decor: [
      { spr: 'chair', wt: 20 }, { spr: 'cabinet', wt: 6 },
    ],
    decorCount: 8, phaseClose: 3 },

  break: { color: '#3a6a3a', label: '茶水间',
    /* 咖啡机 / 微波炉 / 饮水机 / 水瓶 heal 集中 */
    obstacles: [
      { spr: 'microwave', count: 1 },
    ],
    decor: [
      { spr: 'cooler', wt: 25 }, { spr: 'drinks', wt: 15 },
      { spr: 'trash', wt: 8 }, { spr: 'plant', wt: 5 },
    ],
    decorCount: 6, phaseClose: 1 },

  print: { color: '#6a4a2a', label: '打印复印室',
    /* 打印机密集 + 文件柜富矿 + 稀疏椅子 */
    obstacles: [
      { spr: 'printer', count: 3, spacing: 80 },
      { spr: 'cabinet', count: 2, spacing: 120 },
    ],
    decor: [
      { spr: 'trash', wt: 15 }, { spr: 'chair', wt: 8 },
      { spr: 'plant', wt: 3 },
    ],
    decorCount: 4, phaseClose: 2 },

  boss: { color: '#7a5a1a', label: '老板办公室',
    /* 大办公桌 + 沙发 + 高级家具 + 保险柜 */
    obstacles: [
      { spr: 'desk', count: 1 },
      { spr: 'cabinet', count: 2, spacing: 60 },
    ],
    decor: [
      { spr: 'chair', wt: 10 }, { spr: 'plant', wt: 10 },
      { spr: 'coat_rack', wt: 5 }, { spr: 'drinks', wt: 5 },
    ],
    decorCount: 5, phaseClose: 99 },   // 永不关闭

  corridor: { color: '#3a3a3a', label: '走廊',
    /* 稀疏，只有零散绿植 */
    obstacles: [],
    decor: [
      { spr: 'plant', wt: 20 }, { spr: 'cooler', wt: 8 },
      { spr: 'coat_rack', wt: 4 },
    ],
    decorCount: 2, phaseClose: 0 },
};

/* 权重分布（不含强制填充位）*/
export const CHUNK_WEIGHTS = {
  cubicles: 30, meeting: 15, break: 12, print: 10, corridor: 25,
};

/* 邻接约束验证（design §4.2）:
 *   - 打印室不能连 3 块（横 or 竖）
 *   - 走廊必须至少连接一个非走廊 chunk
 *   - 每种 chunk 类型至少出现 2 次
 */
function validateGrid(grid) {
  /* 每种类型至少 2 */
  const counts = {};
  for (const row of grid) for (const t of row) counts[t] = (counts[t] || 0) + 1;
  for (const t of ['cubicles', 'meeting', 'break', 'print', 'corridor']) {
    if ((counts[t] || 0) < 2) return { ok: false, reason: `type ${t} < 2` };
  }
  /* 打印室不连 3（横）*/
  for (let y = 0; y < GRID_N; y++) {
    for (let x = 0; x < GRID_N - 2; x++) {
      if (grid[y][x] === 'print' && grid[y][x + 1] === 'print' && grid[y][x + 2] === 'print')
        return { ok: false, reason: `3 print horizontal at (${x},${y})` };
    }
  }
  /* 打印室不连 3（竖）*/
  for (let x = 0; x < GRID_N; x++) {
    for (let y = 0; y < GRID_N - 2; y++) {
      if (grid[y][x] === 'print' && grid[y + 1][x] === 'print' && grid[y + 2][x] === 'print')
        return { ok: false, reason: `3 print vertical at (${x},${y})` };
    }
  }
  /* 走廊必须至少连接一个非走廊邻居 */
  for (let y = 0; y < GRID_N; y++) {
    for (let x = 0; x < GRID_N; x++) {
      if (grid[y][x] !== 'corridor') continue;
      const nb = [];
      if (y > 0) nb.push(grid[y - 1][x]);
      if (y < GRID_N - 1) nb.push(grid[y + 1][x]);
      if (x > 0) nb.push(grid[y][x - 1]);
      if (x < GRID_N - 1) nb.push(grid[y][x + 1]);
      if (nb.every(t => t === 'corridor')) return { ok: false, reason: `isolated corridor at (${x},${y})` };
    }
  }
  return { ok: true };
}

/* 生成 6×6 chunk grid（design §4.2）
 * 强制填充：
 *   - 中心 (mid,mid) 老板办公室
 *   - 4 角茶水间
 *   - 其余按权重随机 + 邻接约束（最多重试 50 次）
 */
export function generateChunkGrid() {
  const pool = [];
  for (const [type, w] of Object.entries(CHUNK_WEIGHTS)) {
    for (let i = 0; i < w; i++) pool.push(type);
  }
  const mid = Math.floor(GRID_N / 2);
  for (let attempt = 0; attempt < 50; attempt++) {
    const grid = Array.from({ length: GRID_N }, () => Array(GRID_N).fill(null));
    grid[mid][mid] = 'boss';
    grid[0][0] = grid[0][GRID_N - 1] = grid[GRID_N - 1][0] = grid[GRID_N - 1][GRID_N - 1] = 'break';
    for (let y = 0; y < GRID_N; y++) {
      for (let x = 0; x < GRID_N; x++) {
        if (grid[y][x]) continue;
        grid[y][x] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
    const v = validateGrid(grid);
    if (v.ok) return grid;
  }
  /* 兜底：走 fixup —— 强制修复约束（少见）*/
  const grid = Array.from({ length: GRID_N }, () => Array(GRID_N).fill(null));
  grid[mid][mid] = 'boss';
  grid[0][0] = grid[0][GRID_N - 1] = grid[GRID_N - 1][0] = grid[GRID_N - 1][GRID_N - 1] = 'break';
  for (let y = 0; y < GRID_N; y++) for (let x = 0; x < GRID_N; x++) {
    if (!grid[y][x]) grid[y][x] = pool[Math.floor(Math.random() * pool.length)];
  }
  return grid;
}
