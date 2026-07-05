/* =====================================================================
 * v2.0：12 把精修 AI 主武器 + 6 把 2-2 配对传说
 * 命名回归"AI 工具"层：真实职场灾难由敌人、事故、Boss 承载
 * 相对 v18 移除：Copilot / Meta Llama / 月之暗面 / 智谱清言 / 百川智能
 *   （Copilot 下沉到副武器；aura/mine/summon/field 特殊 kind 保留代码，仅当前无武器占用）
 * ===================================================================== */
export const WEAPONS = {
  /* ---- CN 阵营 6 把 ---- */
  deepseek: { name: 'DeepSeek', country: 'CN', color: '#3d6bff',
    tagline: '性价比之王，量大管饱，偶尔"服务器繁忙"',
    pat: '高射速机枪：子弹跟 token 一样不要钱',
    kind: 'mg', cd: .11, dmg: 2.3, spd: 300, range: 220, spread: .07 },
  kimi: { name: 'Kimi（月之暗面）', country: 'CN', color: '#38d3e8',
    tagline: '长上下文专家，会议纪要一口吞',
    pat: '超长射程穿透狙击：射程跟上下文窗口一样长',
    kind: 'sniper', cd: 1.5, dmg: 30, spd: 620, range: 600, pierce: 99 },
  qwen: { name: '通义千问', country: 'CN', color: '#ff9440',
    tagline: '开源全家桶，型号多到你选择困难',
    pat: '5 发扇形霰弹：贴脸即蒸发',
    kind: 'shotgun', cd: 1.1, dmg: 4.6, spd: 260, range: 125, count: 5, spread: 1.0 },
  wenxin: { name: '文心一言', country: 'CN', color: '#ffcf33',
    tagline: '饼画得又大又圆，落地才知道有多响',
    pat: '抛物线大饼：落点爆炸，可越过办公桌',
    kind: 'lob', cd: 1.4, dmg: 26, spd: 190, range: 190, boomR: 42 },
  doubao: { name: '豆包', country: 'CN', color: '#ff9edb',
    tagline: '萌萌的豆子锁定你，甩都甩不掉',
    pat: '追踪豆：自动索敌，走位苦手救星',
    kind: 'homing', cd: .7, dmg: 12.5, spd: 185, range: 560, homing: 4.5 },
  glm: { name: '智谱 GLM', country: 'CN', color: '#7ac8ff',
    tagline: '知识图谱一拉通，全部门一起过电',
    pat: '链式闪电：弹跳 3 个敌人，打人堆收益爆炸',
    kind: 'chain', cd: 1.0, dmg: 17, range: 190, chains: 3, decay: .8 },

  /* ---- US 阵营 5 把 + MiniMax 补位（v2 精修池） ---- */
  chatgpt: { name: 'ChatGPT', country: 'US', color: '#4ec9a0',
    tagline: '地表最火，啥都会亿点，偶尔一本正经地胡编',
    pat: '标准单发步枪：六边形战士，闭眼能用',
    kind: 'single', cd: .5, dmg: 10, spd: 320, range: 260 },
  claude: { name: 'Claude', country: 'US', color: '#e8825a',
    tagline: '写代码一绝，就是动不动"用量上限"',
    pat: '蓄力激光：按住蓄力，松开一枪巨额伤害',
    kind: 'charge', cd: .45, dmg: 8, dmgMax: 42, chargeT: 1.2, range: 270, beamW: 8 },
  gemini: { name: 'Gemini', country: 'US', color: '#8f7bff',
    tagline: '双子座人格，上一枪天才下一枪天塌',
    pat: '双联平行弹道：弹幕量双倍，中间留缝',
    kind: 'twin', cd: .55, dmg: 6, spd: 320, range: 240 },
  midjourney: { name: 'Midjourney', country: 'US', color: '#e86ad0',
    tagline: '开火全靠抽卡，美是真美，手是真崩',
    pat: '抽卡弹道：四种弹型随机，伤害 0.5~3 倍浮动',
    kind: 'gacha', cd: .9, dmg: 10, spd: 300, range: 230 },
  grok: { name: 'Grok', country: 'US', color: '#e8e4d8',
    tagline: '阴阳怪气拉满，说出去的话迟早拐回来',
    pat: '回旋镖：去程回程各判一次，能打身后',
    kind: 'boomerang', cd: .95, dmg: 10, spd: 300, range: 140 },
  minimax: { name: 'MiniMax', country: 'CN', color: '#67c98b',
    tagline: '会议室多开，一人分饰多角',
    pat: '工位钉子户：部署固定炮台，最多 3 座同时驻场',
    kind: 'totem', cd: 2.5, dmg: 6, shotCd: .75, deployLife: 12, maxDeploy: 3, range: 190 },
};

export const LEGENDS = {
  /* v2.0 规则重写：每把传说都有独立机制，不只是数值放大 */
  agi: { name: 'AGI 降临', color: '#ffffff',
    tagline: '通用、便宜、高频，最后自动接管战场。',
    pat: '高频追踪弹 + 周期"对齐审判"：站在审判柱附近可额外放大光柱',
    kind: 'leg_agi', cd: .14, dmg: 7.2, spd: 340, range: 330, homing: 3.2,
    pillarCd: 4, pillarDmg: 90, pillarR: 54, nearBonusR: 160, nearBonusMult: 1.5 },
  price_war: { name: '百模大战·价格屠夫', color: '#ff9edb',
    tagline: '越打越便宜，越便宜越能打，乱打就预算赤字。',
    pat: '18 发扇形追踪豆 + 补贴滚雪球（最多 10 层，空窗 2 秒掉 1 层）',
    kind: 'leg_pea', cd: .52, dmg: 3.4, spd: 255, range: 300, count: 18, spread: 1.45, homing: 2.9,
    maxSubsidy: 10, subsidyStep: .035, subsidyDecayT: 2 },
  tenx: { name: '十倍交付机', color: '#e8825a',
    tagline: '不召唤实习生，只部署自动化节点：一个人撑起流水线。',
    pat: '蓄力光束 + 3 个自动化节点；节点齐全时三角形成流水线燃烧场',
    kind: 'leg_delivery', cd: .78, dmg: 34, dmgMax: 34, chargeT: .8, range: 330, beamW: 7,
    nodeCd: 3.2, nodeLife: 14, nodeMax: 3, nodeDmg: 11, nodeRange: 260, nodeShotCd: .6, lineDps: 12 },
  pie_feast: { name: '画饼成真', color: '#ffcf33',
    tagline: '以前只是画饼，现在饼真的能烧、能挡、能续命。',
    pat: '连抛 3 张巨型大饼，随机 4 种类型（爆炸/纯燃烧/护盾/弹跳）',
    kind: 'leg_pie', cd: 1.45, dmg: 38, spd: 210, range: 230, boomR: 58, burnR: 54, burnDps: 11, burnT: 5.5 },
  infinite_ctx: { name: '无限上下文', color: '#38d3e8',
    tagline: '把全场写进上下文，松手统一摘要处决。',
    pat: '按住收集目标（最多 30 个），松开触发"摘要处决"造成 36 单体伤害',
    kind: 'leg_beam', cd: .09, dmg: 4.2, range: 9999, summaryDmg: 36, ctxCap: 30 },
  mouthpiece: { name: '职场嘴替', color: '#7ac8ff',
    tagline: '你不敢说的话，它替你说；敌人弹幕也会变成素材。',
    pat: '巨型带电 X 回旋镖，回程吸收敌弹后额外反怼',
    kind: 'leg_boom', cd: 1.25, dmg: 30, spd: 285, range: 210, zapCd: .23, zapDmg: 9.5, chains: 4,
    absorbR: 42, absorbDmg: 7 },
};

/* 融合配方：满级武器 + 另一品牌芯片 -> 传说。12 把全部 2-2 配对，无孤儿。 */
export const RECIPES = [
  ['deepseek', 'chatgpt', 'agi'],
  ['qwen', 'doubao', 'price_war'],
  ['claude', 'minimax', 'tenx'],           // v2：Copilot 下沉，MiniMax 补位
  ['wenxin', 'midjourney', 'pie_feast'],
  ['kimi', 'gemini', 'infinite_ctx'],
  ['glm', 'grok', 'mouthpiece'],
];

export function findRecipe(a, b) {
  for (const [x, y, leg] of RECIPES) if ((a === x && b === y) || (a === y && b === x)) return leg;
  return null;
}
export function recipePartner(id) {
  for (const [x, y, leg] of RECIPES) {
    if (id === x) return { partner: y, leg };
    if (id === y) return { partner: x, leg };
  }
  return null;
}
/* 当前武器定义（普通或传说） */
export const wdef = u => (u.weapon.leg ? LEGENDS[u.weapon.leg] : WEAPONS[u.weapon.id]);
