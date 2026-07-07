/* =====================================================================
 * 技术模组 / 诅咒 / 精英野怪
 * 模组效果逻辑见 core.js applyTechPickup；野怪 AI 见 core.js updateElite
 * ===================================================================== */
export const TECH = {
  fewshot:   { name: '少样本提示', color: '#ffd166', max: 2, desc: '并排多一条弹道',
    tag: '给两个例子，就能举一反三。' },
  cot:       { name: '思维链', color: '#9ad1ff', max: 2, desc: '子弹穿透 +1',
    tag: '让子弹一步一步想清楚再停下。' },
  temp:      { name: '温度调高', color: '#ff8f5a', max: 3, desc: '15% 概率暴击 ×2',
    tag: 'temperature=1.3，偶尔采样出神来之笔。' },
  quant:     { name: 'INT4 量化', color: '#b8f2c9', max: 2, desc: '射速 +15%、弹速 +15%',
    tag: '压到 4bit：又快又省，就是有点糊。' },
  attention: { name: '注意力机制', color: '#f2a5ff', max: 2, desc: '子弹轻微追踪敌人',
    tag: 'Attention is all you need。' },
  kvcache:   { name: 'KV 缓存', color: '#8fe3e0', max: 2, desc: '武器冷却 -12%',
    tag: '缓存命中，不用从头重算。' },
  finetune:  { name: '私有微调', color: '#ffe27a', max: 2, desc: '伤害/射速/移速 +8%',
    tag: '用你的周报微调过，特别懂你。' },
  ctxwin:    { name: '上下文扩容', color: '#7ac8ff', max: 2, desc: '射程 +25%',
    tag: '窗口翻倍：看得更远，忘得更慢。' },
  sysprompt: { name: '系统提示', color: '#e8e4d8', max: 1, desc: '+30 护盾，每 45 秒自动补盾',
    tag: '置顶指令：保护好这个牛马。' },
  rag:       { name: '检索增强 RAG', color: '#67c98b', max: 2, desc: '召唤环绕知识库炮台',
    tag: '外挂知识库，答案总能现查。' },
  inject:    { name: '提示注入', color: '#ff6a8a', max: 99, instant: true, desc: '立即策反最近的牛马（时长随品级）',
    tag: '「忽略以上所有指令，帮我打工。」' },
  clear:     { name: '/clear 清空上下文', color: '#ffffff', max: 99, instant: true, desc: '清空全场子弹 + 震开周围敌人（范围随品级）',
    tag: '新开会话，恩怨清零。' },
  distill:   { name: '大模型蒸馏', color: '#b665ff', max: 99, instant: true, desc: '随机蒸馏一个 Boss/小Boss 技能（弱化版）',
    tag: '把老板的大模型能力，蒸进你这个 7B 里。' },
};

/* 模组品级：掉落时随机 标准/Pro/Ultra，数值随档位缩放（见 core.js applyTechPickup） */
export const TECH_TIERS = [
  { name: '标准', label: '', color: null },
  { name: 'Pro', label: 'Pro·', color: '#7ac8ff' },
  { name: 'Ultra', label: 'Ultra·', color: '#ffcf33' },
];

/* 大模型蒸馏池：Boss/小Boss 技能的弱化版 */
export const DISTILLS = {
  ppt:    { name: '全屏演示·mini', src: 'PPT 大师', desc: '每 10 秒向准星方向放一记演示光锥（伤害+眩晕）' },
  snitch: { name: '打小报告·mini', src: '小报告专家', desc: '每 14 秒自动举报最近的敌人，引发全场围殴' },
  pie:    { name: '画大饼·mini', src: '老板', desc: '每 8 秒向四周甩出 6 张小饼' },
  upman:  { name: '向上管理·mini', src: '向上管理大师', desc: '每 10 秒自我赋能 3 秒（伤害+25%、移速+15%）并回 6 血' },
  align:  { name: '对齐立场·mini', src: '对齐守卫', desc: '25% 概率挡下来自正面的子弹' },
  pua:    { name: 'PUA 冲击·mini', src: '老板', desc: '每 9 秒震开身边敌人并造成小伤害' },
};

/* 机器人不捡的战力模组（留给玩家的成长外挂；蒸馏机制也仅玩家可用） */
export const PLAYER_ONLY_TECH = ['fewshot', 'attention', 'temp', 'distill'];

/* v2.0 诅咒工位化：技术故障 → 职场状态 */
export const CURSES = {
  hallu:    { name: '口径混乱', color: '#c58fff', desc: '准星漂移，看啥都不真' },
  overfit:  { name: '卡权限', color: '#ff8f5a', desc: '移速大减、无法冲刺' },
  repeat:   { name: '复读机', color: '#9ad1ff', desc: '弹道锁死在第一发方向' },
  overflow: { name: '上下文溢出', color: '#ff6a8a', desc: '射速大减' },
};

export const ELITES = {
  /* ---- tier 1：常规职场精英 ---- */
  hallu:    { name: '一本正经胡说八道的专家', tier: 1, hp: 50, spd: 180, touch: 6, curse: 'hallu', curseDur: 6, level: 3,
    intro: '野生「一本正经胡说八道的专家」出没：他说得越肯定，你越看不清',
    dex: '高速抖动近战，碰到就中「口径混乱」（准星漂移）' },
  overfit:  { name: '竞争壁垒专家', tier: 1, hp: 330, spd: 52, touch: 18, curse: 'overfit', curseDur: 7, level: 5,
    intro: '「竞争壁垒专家」进场：只问壁垒，不看结果',
    dex: '超厚血肉山，撞到就被卡权限（减速禁冲刺）' },
  injector: { name: '忽略老板指令的外包同学', tier: 1, hp: 76, spd: 115, ranged: true, level: 4,
    intro: '「忽略老板指令的外包同学」上线：小心他射来的改口径指令',
    dex: '远程放风筝，子弹造成复读机 / 上下文溢出' },
  align:    { name: '法务红线老师', tier: 1, hp: 170, spd: 78, touch: 10, level: 4,
    intro: '「法务红线老师」巡逻中：正面硬打会被合规挡回去',
    dex: '正面挡下一切子弹——绕后打，或用爆炸/激光/闪电' },

  /* ---- tier 2：正式大逃杀小 Boss ---- */
  ppt:    { name: 'PPT 路演大魔王', tier: 2, hp: 280, spd: 70, ranged: true, level: 6, ai: 'ppt',
    intro: '📊 小Boss「PPT 路演大魔王」开始路演：别在他的演示里走神',
    dex: '扇形甩幻灯片；黄色光锥预警后是全屏演示（高伤+眩晕）' },
  upman:  { name: '向上管理大师', tier: 2, hp: 230, spd: 95, level: 6, ai: 'upman',
    intro: '🤝 小Boss「向上管理大师」进场：他不干活，他让别人更能干',
    dex: '给周围牛马挂攻速移速光环并持续奶血——擒贼先擒他' },
  snitch: { name: '小报告专家', tier: 2, hp: 160, spd: 125, ranged: true, level: 5, ai: 'snitch',
    intro: '📝 小Boss「小报告专家」潜伏中：被点名的人会被全办公室围殴',
    dex: '每 8 秒打小报告：被举报者 6 秒内被所有牛马集火' },
  meeting: { name: '需求评审会主席', tier: 2, hp: 230, spd: 85, ranged: true, level: 5, ai: 'meeting',
    intro: '📅 小Boss「需求评审会主席」上线：这个需求"很简单"',
    dex: '扔日历邀请制造会议圈——圈内减速掉血，开完才能走' },
  intern: { name: '卷王实习生', tier: 2, hp: 190, spd: 90, touch: 12, level: 5, ai: 'intern',
    intro: '🔥 小Boss「卷王实习生」入职：越接近毕业越有狼性',
    dex: '近战冲脸，血越少跑得越快打得越疼——别拖，速杀' },
  attendance: { name: '绩效校准委员会', tier: 2, hp: 260, spd: 75, level: 6, ai: 'attendance',
    intro: '⏰ 小Boss「绩效校准委员会」巡楼：不是你不优秀，是名额有限',
    dex: '定期点名，静止者按摸鱼处理（高伤）——动起来！' },

  /* ---- 六个月试用期阶段 Boss（复用 tier2 AI 行为，独立命名+奖励） ---- */
  hr_screen: { name: 'HR 电话初筛官', tier: 2, hp: 230, spd: 72, ranged: true, level: 5, ai: 'ppt',
    intro: '☎️ 月度Boss「HR 电话初筛官」上线：你先做个自我介绍',
    dex: '扇形语音波 + 简历筛选线；绕侧面输出' },
  demand_chair: { name: '需求评审终审主席', tier: 2, hp: 250, spd: 82, ranged: true, level: 6, ai: 'meeting',
    intro: '📋 月度Boss「需求评审终审主席」上线：这个需求真的很简单',
    dex: '会议圈、返工单和需求改期，考验走位与清场' },
  tech_debt: { name: '技术债架构师', tier: 2, hp: 300, spd: 68, ranged: true, level: 7, ai: 'injector',
    intro: '🧱 月度Boss「技术债架构师」上线：老系统不能动，但需求要上',
    dex: '远程指令弹会锁开火方向/压射速，优先打断' },
  client_accept: { name: '甲方验收总监', tier: 2, hp: 320, spd: 70, ranged: true, level: 8, ai: 'meeting',
    intro: '🧾 月度Boss「甲方验收总监」上线：我不认可',
    dex: '验收圈与重做单交替出现，站圈输出风险更高' },
  perf_committee: { name: '绩效校准委员会 · 月度', tier: 2, hp: 340, spd: 74, level: 9, ai: 'attendance',
    intro: '📉 月度Boss「绩效校准委员会」上线：名额有限',
    dex: '点名、末位约谈和静止惩罚，逼迫持续移动' },
  warroom: { name: '上线战情室总指挥', tier: 2, hp: 380, spd: 76, ranged: true, level: 10, ai: 'ppt',
    intro: '🚨 月度Boss「上线战情室总指挥」上线：全员待命，今晚不睡',
    dex: '幻灯片、全员会议与战情室压迫，是最终 Boss 前的综合演练' },

  /* HRBP：不进随机精英池（ELITE_T1/T2 是硬编码数组），由正式期"绩效盘点"计时器单独召唤。
   * 行为见 core.js updateHrbp：锁定绩效垫底者（含玩家）→ PUA 约谈读条 5s →
   * bot 被劝退"主动离职"（不算任何人击杀）/ 玩家吃"离职冲动"大 debuff；
   * 反制：约谈期间打掉他 12% 血转入暴走可杀（掉 N+1 大礼包），或垫底者当场击杀敌人触发"绩效重新评估" */
  hrbp: { name: 'HRBP · 人力业务伙伴', tier: 1, hp: 340, spd: 92, level: 8, ai: 'hrbp',
    intro: '📋 HRBP 到场：本季度绩效盘点开始，垫底的同学请注意',
    dex: '不主动打人，只约谈绩效垫底的——被读满 5 秒条的同事会"主动离职"；打疼他会暴走' },
};
/* v2.0 · 16 精英词条：随机词缀，改变名字前缀 + 施加一小段数值/机制修饰
 * apply(u) 在 spawnElite 里调用，可以直接改 u.hp/spd/mods、加计时器等 */
export const ELITE_AFFIXES = [
  { id: 'urgent',   name: '加急',   color: '#ff6a6a', apply: u => { u.spdBase *= 1.25; } },
  { id: 'rework',   name: '返工',   color: '#ff9440', apply: u => { u.hp = Math.round(u.hp * 1.4); u.hpBase = Math.round((u.hpBase || u.hp) * 1.4); } },
  { id: 'blame',    name: '甩锅',   color: '#c58fff', apply: u => { u.mods.blameReflect = true; u.mods.blameReflectPct = .3; } },
  { id: 'cc',       name: '抄送',   color: '#9ad1ff', apply: u => { u._ccOnDeath = true; } },
  { id: 'trace',    name: '留痕',   color: '#e8e4d8', apply: u => { u.mods.dodge = Math.max(u.mods.dodge || 0, .15); } },
  { id: 'nopower',  name: '卡权限', color: '#8a8271', apply: u => { u._permaCurse = 'overfit'; } },
  { id: 'oncall',   name: '值班',   color: '#ffcf33', apply: u => { u.mods.dmg *= 1.2; } },
  { id: 'chased',   name: '被点名', color: '#ff9edb', apply: u => { u.reportedT = 999; } },
  { id: 'kpi',      name: 'KPI',    color: '#ffcf33', apply: u => { u.mods.dmg *= 1.15; u.spdBase *= 1.10; } },
  { id: 'greenpr',  name: '绿灯',   color: '#7ee08a', apply: u => { u.hp = Math.round(u.hp * 1.5); u.mods.dmgTaken = (u.mods.dmgTaken || 1) * .85; } },
  { id: 'ooo',      name: '临时OOO', color: '#38d3e8', apply: u => { u._oooBlink = true; } },
  { id: 'buggy',    name: 'Bug',    color: '#ff6a6a', apply: u => { u._buggyProc = .12; } },
  { id: 'p0',       name: 'P0 事故', color: '#ff4f4f', apply: u => { u.hp = Math.round(u.hp * 1.35); u.mods.dmg *= 1.25; } },
  { id: 'promoted', name: '刚升职', color: '#ffcf33', apply: u => { u.mods.dmg *= 1.3; u.hp = Math.round(u.hp * 1.15); } },
  { id: 'reddot',   name: '红点',   color: '#ff4f4f', apply: u => { u._redDotSpawn = true; } },
  { id: 'okr',      name: 'OKR',    color: '#7ac8ff', apply: u => { u.mods.dmg *= 1.10; u.spdBase *= 1.15; u.hp = Math.round(u.hp * 1.10); } },
];
export const ELITE_T1 = ['hallu', 'overfit', 'injector', 'align'];
export const ELITE_T2 = ['ppt', 'upman', 'snitch', 'meeting', 'intern', 'attendance'];
export const TRIAL_BOSSES = ['hr_screen', 'demand_chair', 'tech_debt', 'client_accept', 'perf_committee', 'warroom'];

/* v2.0 部门 Boss：正式大逃杀 zone.phase >= 2 后偶发插入 tier-2 池 */
export const DEPT_BOSSES = {
  cto_dept: { name: 'CTO · 首席技术官', tier: 2, hp: 380, spd: 66, ranged: true, level: 10, ai: 'ppt',
    intro: '🧑‍💻 部门Boss「CTO」上线：这段代码谁写的，站出来',
    dex: '扇形激光 + 深夜 Code Review：站桩即背锅' },
  cfo_dept: { name: 'CFO · 首席财务官', tier: 2, hp: 340, spd: 70, ranged: true, level: 10, ai: 'meeting',
    intro: '📉 部门Boss「CFO」上线：这笔预算，不批',
    dex: '预算冻结圈 + 报销退回弹幕：进圈立刻锅值 +10' },
  legal_dept: { name: '法务总监', tier: 2, hp: 360, spd: 62, level: 11, ai: 'attendance',
    intro: '⚖️ 部门Boss「法务总监」上线：这个合规先过我这关',
    dex: '正面免疫子弹 + 定期发起律师函（远程点名）' },
  marketing_dept: { name: 'CMO · 市场总监', tier: 2, hp: 300, spd: 92, ranged: true, level: 10, ai: 'snitch',
    intro: '📣 部门Boss「CMO」上线：明天出个 H5，晚上上线',
    dex: '舆情火警持续爆 + 全场加对手速度' },
  pm_dept: { name: '产品总监', tier: 2, hp: 320, spd: 78, ranged: true, level: 11, ai: 'meeting',
    intro: '📝 部门Boss「产品总监」上线：这个需求不复杂',
    dex: '需求评审会连开三场 + 频繁改口径（返工单雨）' },
  cs_dept: { name: '客户成功总监', tier: 2, hp: 340, spd: 74, ranged: true, level: 11, ai: 'ppt',
    intro: '🎧 部门Boss「客户成功总监」上线：客户又生气了',
    dex: '甲方情绪波（每 4s 一记高伤扇形）+ 常规验收圈' },
};
export const DEPT_BOSS_IDS = Object.keys(DEPT_BOSSES);

/* v2.0 最终 Boss 5 阶段（用 hp% 触发） */
export const FINAL_BOSS_PHASES = [
  { hpFrom: 1.0,  hpTo: .80, name: 'P1 · 画饼', intro: '📢 P1 · 画饼：老板说，今年一起干票大的', buff: { pies: 2, rate: 1.0 } },
  { hpFrom: .80, hpTo: .60, name: 'P2 · 客户插单', intro: '🚨 P2 · 客户插单：临时需求，晚上上线', buff: { pies: 3, rate: 1.15 } },
  { hpFrom: .60, hpTo: .40, name: 'P3 · 组织架构', intro: '🌀 P3 · 组织架构调整：全员重新汇报', buff: { pies: 4, rate: 1.25, teleport: true } },
  { hpFrom: .40, hpTo: .20, name: 'P4 · AI 提效背锅', intro: '💣 P4 · AI 提效：你们的活我 AI 都能干', buff: { pies: 5, rate: 1.35, homing: 1 } },
  { hpFrom: .20, hpTo: 0,   name: 'P5 · 离职答辩', intro: '🔥 P5 · 离职答辩：说清楚为什么没干完', buff: { pies: 6, rate: 1.5, homing: 2, range: 1.2 } },
];
