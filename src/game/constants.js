/* 视口与全局平衡数值 */
export const VIEW_W = 640;
export const VIEW_H = 360;

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
  levelNeed: lvl => Math.round(10 * Math.pow(1.22, lvl)),   // v18：1.26→1.22 回到原设计值。之前把底数抬高+折扣加深是双重减配，让试用期玩家转正只到 Lv.10 而非设计假设的 Lv.13
  bossHp: 1500,          // 上限参考值；实际按登场时机与玩家等级插值，见 spawnBoss
  bossAt: 360,           // 插值基准；实际触发见 endChecks（t>=300 或存活<=3）
  /* 试用期月度时长：三段式结构（爆发/涓流/考核），考核秒数固定给足现有17秒击杀窗口+缓冲，
   * 爆发/涓流用减法瓜分剩余时间，保证逐月精确相加=trialWaveT，不再是近似百分比。见设计文档第1.1/1.2节 */
  trialWaveT: month => 60 + 10 * (month - 1),
  trialExamT: month => 18 + (month - 1),
};
