/* 视口与全局平衡数值
 * 移动端（粗指针）用更小的逻辑视口：同一块屏幕上单位/特效/文字都放大 33%，
 * 手机上不再是一堆小蚂蚁。MOBILE_ZOOM 供渲染端做例外缩放（Boss 保持原视觉大小）。 */
/* ?mobile=1 强制移动模式（桌面调试移动布局用） */
const COARSE = (typeof location !== 'undefined' && /[?&]mobile=1/.test(location.search)) ||
  (typeof matchMedia !== 'undefined' &&
    (matchMedia('(pointer: coarse)').matches || (typeof window !== 'undefined' && 'ontouchstart' in window)));
export const IS_COARSE = COARSE;
export const MOBILE_ZOOM = COARSE ? 4 / 3 : 1;
/* 移动端高度锁 270（= 640×360 放大 4/3），宽度按屏幕长宽比自适应（16:9 ~ 21:9 夹取）——
 * 手机全面屏不再有黑边，也不裁切/变形 */
const _aspect = (() => {
  if (!COARSE || typeof window === 'undefined') return 16 / 9;
  const l = Math.max(innerWidth, innerHeight), s = Math.min(innerWidth, innerHeight);
  return Math.min(21 / 9, Math.max(16 / 9, l / Math.max(1, s)));
})();
export const VIEW_H = COARSE ? 270 : 360;
export const VIEW_W = COARSE ? Math.round(270 * _aspect / 2) * 2 : 640;

export const TUNE = {
  playerHp: 100, playerSpeed: 130,
  botCount: 19, botHp: 80,
  /* v2.0 地图重设计 · 严格对齐 map-system-design §10：
   * 世界 3000×3000，6×6 chunk 网格，每 chunk 400×400 + 100px 走廊 = stride 500 */
  world: 3000, zoneR0: 1400, shrinkDur: 30,
  zonePhases: [
    { at: 60,  pct: .70, dps: 4 },
    { at: 150, pct: .45, dps: 9 },
    { at: 240, pct: .25, dps: 16 },
    { at: 330, pct: .12, dps: 28 },
    { at: 420, pct: .05, dps: 48 },
  ],
  xpPerKill: 12,
  levelHeal: 8,
  levelShield: 8,
  levelShieldT: 5,
  levelRareChance: .14,
  levelMilestoneRareEvery: 4,
  personaMilestoneLevels: [4, 8, 12, 16],
  gearPityDrafts: 2,
  initialItemCount: 20,
  battleItemInterval: 9,
  battleFinalItemInterval: 16,
  battleItemCap: 18,
  battleFinalItemCap: 10,
  battleHealDropChance: .45,
  coffeeMachineHeal: 16,
  coffeeMachineShield: 6,
  coffeeMachineCd: 10,
  coffeeMachineUses: 4,
  coffeePlayerCd: .8,
  /* v3.3：1.22→1.27。v3.0 割草密度×3 + 合豆磁吸把拾取率拉到近 100%，
   * 白板全托管实测 2 分钟 Lv8 / 5 分钟 Lv13，真实玩家滚雪球后失控（用户实况单局 2000+ 击杀）——
   * 指数底数是唯一能压住"越强杀越快"正反馈的杠杆 */
  levelNeed: lvl => Math.round(10 * Math.pow(1.27, lvl)),
  bossHp: 1500,          // 上限参考值；实际按登场时机与玩家等级插值，见 spawnBoss
  bossAt: 360,           // 插值基准；实际触发见 endChecks（t>=300 或存活<=3）
  /* 试用期月度时长：三段式结构（爆发/涓流/考核），考核秒数固定给足现有17秒击杀窗口+缓冲，
   * 爆发/涓流用减法瓜分剩余时间，保证逐月精确相加=trialWaveT，不再是近似百分比。见设计文档第1.1/1.2节 */
  trialWaveT: month => 60 + 10 * (month - 1),
  trialExamT: month => 18 + (month - 1),
};
