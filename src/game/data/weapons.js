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
    kind: 'mg', cd: .11, dmg: 2.2, spd: 300, range: 220, spread: .07 },
  kimi: { name: 'Kimi（月之暗面）', country: 'CN', color: '#38d3e8',
    tagline: '长上下文专家，会议纪要一口吞',
    pat: '超长射程穿透狙击：射程跟上下文窗口一样长',
    kind: 'sniper', cd: 1.5, dmg: 19, spd: 620, range: 600, pierce: 99 },
  qwen: { name: '通义千问', country: 'CN', color: '#ff9440',
    tagline: '开源全家桶，型号多到你选择困难',
    pat: '5 发扇形霰弹：贴脸即蒸发',
    kind: 'shotgun', cd: 1.1, dmg: 7.5, spd: 260, range: 150, count: 5, spread: .65 },
  wenxin: { name: '文心一言', country: 'CN', color: '#ffcf33',
    tagline: '饼画得又大又圆，落地才知道有多响',
    pat: '抛物线大饼：落点爆炸，可越过办公桌',
    kind: 'lob', cd: 1.4, dmg: 17, spd: 190, range: 190, boomR: 42 },
  doubao: { name: '豆包', country: 'CN', color: '#ff9edb',
    tagline: '萌萌的豆子锁定你，甩都甩不掉',
    pat: '追踪豆：自动索敌，走位苦手救星',
    kind: 'homing', cd: .7, dmg: 13, spd: 185, range: 560, homing: 4.5 },
  glm: { name: '智谱 GLM', country: 'CN', color: '#7ac8ff',
    tagline: '知识图谱一拉通，全部门一起过电',
    pat: '链式闪电：弹跳 3 个敌人，打人堆收益爆炸',
    kind: 'chain', cd: 1.0, dmg: 12.5, range: 190, chains: 3, decay: .8 },

  /* ---- US 阵营 5 把 + MiniMax 补位（v2 精修池） ---- */
  chatgpt: { name: 'ChatGPT', country: 'US', color: '#4ec9a0',
    tagline: '地表最火，啥都会亿点，偶尔一本正经地胡编',
    pat: '标准单发步枪：六边形战士，闭眼能用',
    kind: 'single', cd: .5, dmg: 12, spd: 320, range: 260 },
  claude: { name: 'Claude', country: 'US', color: '#e8825a',
    tagline: '写代码一绝，就是动不动"用量上限"',
    pat: '蓄力激光：按住蓄力，松开一枪巨额伤害',
    kind: 'charge', cd: .5, dmg: 5, dmgMax: 15, chargeT: 1.2, range: 270, beamW: 8 },
  gemini: { name: 'Gemini', country: 'US', color: '#8f7bff',
    tagline: '双子座人格，上一枪天才下一枪天塌',
    pat: '双联平行弹道：弹幕量双倍，中间留缝',
    kind: 'twin', cd: .55, dmg: 9, spd: 320, range: 240 },
  midjourney: { name: 'Midjourney', country: 'US', color: '#e86ad0',
    tagline: '开火全靠抽卡，美是真美，手是真崩',
    pat: '抽卡弹道：四种弹型随机，伤害 0.5~3 倍浮动',
    kind: 'gacha', cd: .9, dmg: 8.5, spd: 300, range: 230 },
  grok: { name: 'Grok', country: 'US', color: '#e8e4d8',
    tagline: '阴阳怪气拉满，说出去的话迟早拐回来',
    pat: '回旋镖：去程回程各判一次，能打身后',
    kind: 'boomerang', cd: .95, dmg: 5.5, spd: 300, range: 140 },
  minimax: { name: 'MiniMax', country: 'CN', color: '#67c98b',
    tagline: '会议室多开，一人分饰多角',
    pat: '工位钉子户：部署固定炮台，最多 3 座同时驻场',
    /* v2.3 手感修复：射速 .75→.5、伤害 6→8、部署更勤、驻场更久——原版弹慢+无预判，对移动小怪十打九空 */
    kind: 'totem', cd: 2.2, dmg: 8, shotCd: .5, deployLife: 14, maxDeploy: 3, range: 220 },

  /* ---- v2.9 办公室武器科 4 把（近战割草线，country: 'OF'） ---- */
  keyboard: { name: '客制化机械键盘', country: 'OF', color: '#9fb3d1',
    tagline: '茶轴的声音，就是绩效的声音',
    pat: '近战弧形横扫：一梭子敲过去，像在回复"收到"；满级每三刀一次 Ctrl+A 全选旋风',
    kind: 'swing', cd: .55, dmg: 16, reach: 62, arc: 2.0, kb: 26, range: 70 },
  chairspin: { name: '人体工学椅', country: 'OF', color: '#4ec9a0',
    tagline: '公司唯一支持你的东西',
    pat: '环绕连击：椅子绕体旋转谁贴谁疼，站桩挂机型近战',
    kind: 'orbit', cd: .5, dmg: 6.5, orbs: 2, orbR: 34, orbSpd: 3.2, hitCd: .5, range: 50 },
  extinguisher: { name: '楼道灭火器', country: 'OF', color: '#ff5f5f',
    tagline: '平时没人看它一眼，出事第一个想起它',
    pat: '锥形持续喷射：贴脸压制+减速，满级持续喷会过热爆炸',
    kind: 'spray', cd: .09, dmg: 2.6, tickCd: .09, half: .42, range: 95 },
  stapler: { name: '红色订书机', country: 'OF', color: '#e8b23d',
    tagline: '全公司抢着用的那一台',
    pat: '高频短刺：穿透三连，把需求钉死在墙上；满级每第五发一枚眩晕大钉',
    kind: 'stab', cd: .18, dmg: 4.5, spd: 380, range: 78, pierce: 3 },
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
  /* ---- v2.9 办公室近战线传说 ×2 ---- */
  grinder: { name: '工位绞肉机', color: '#ff8a3d',
    tagline: '键盘是刀，转椅是引擎，工位就是绞肉机。',
    pat: '4 把巨型键盘刀环绕 + 每 2.2s 一次 360° 冲击波（伤害+击退清场）',
    kind: 'leg_grinder', cd: .5, dmg: 26, orbs: 4, orbR: 48, orbSpd: 4.2, hitCd: .35, range: 60,
    novaCd: 2.2, novaR: 95, novaDmg: 40, novaKb: 60 },
  safety_month: { name: '安全生产月', color: '#ff5f8a',
    tagline: '消防演习失控现场：泡沫管够，订书钉管饱。',
    pat: '超宽锥形喷射（强减速）+ 每 0.35s 沿准星射出穿透订书钉 + 持续铺泡沫地面',
    kind: 'leg_spray', cd: .08, dmg: 4, tickCd: .08, half: .6, range: 135,
    stapleCd: .35, stapleDmg: 18, staplePierce: 6 },
};

/* 融合配方：满级武器 + 另一品牌芯片 -> 传说。16 把全部 2-2 配对，无孤儿。 */
export const RECIPES = [
  ['deepseek', 'chatgpt', 'agi'],
  ['qwen', 'doubao', 'price_war'],
  ['claude', 'minimax', 'tenx'],           // v2：Copilot 下沉，MiniMax 补位
  ['wenxin', 'midjourney', 'pie_feast'],
  ['kimi', 'gemini', 'infinite_ctx'],
  ['glm', 'grok', 'mouthpiece'],
  /* v2.9 办公室近战线 */
  ['keyboard', 'chairspin', 'grinder'],
  ['extinguisher', 'stapler', 'safety_month'],
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
