/* =====================================================================
 * 试用期杂鱼（办公室琐事拟人化）——只给经验，不掉装备
 * 每月一波 + 一个月度考核小 Boss（复用 tier2 职场怪物）
 * 数值参照 docs/design-pacing-and-builds.md 第1.3节（审核修正版）
 * 玩家反馈"早期怪物太少、机制单一"后，把机制多样性前移到第1-2月，
 * 不再让新机制怪物全部堆到后期才出现。
 * ===================================================================== */
/* 铁律：基础怪必须比玩家（130 移速）慢，否则无法风筝、成群必死 */
export const MOBS = {
  /* v18: email 存在超 5s 自动升级成加急版（spd+25% touch+50%）——静态怪也有生前变化 */
  email:  { name: '未读邮件', hp: 11, spd: 105, touch: 2.5, xp: 1.6, jig: false, spr: 'mob_email',
    upgradeAfter: 5, upgradeTo: 'urgent_email' },
  urgent_email: { name: '加急邮件', hp: 13, spd: 130, touch: 3.7, xp: 2.0, jig: false, spr: 'mob_urgent_email' },
  sticky: { name: '待办便利贴', hp: 20, spd: 60, touch: 4, xp: 2.2, jig: false, spr: 'mob_sticky' },
  cr:     { name: '需求变更单', hp: 14, spd: 95, touch: 3, xp: 1.6, jig: true, split: true, spr: 'mob_cr' },
  /* 抄送轰炸：v18 生前每 3.5s 向四周投掷 3 颗低伤追踪弹（弹伤=1.2，触发范围 260px）+ 死亡分裂
   * ——从"纯追杀撞人型"变成"追杀+远程"双威胁，月1机制多样性 */
  cc_bomb: { name: '抄送轰炸', hp: 8, spd: 130, touch: 2, xp: 1.5, jig: false,
    split: true, splitChance: .35, splitCount: 1, splitInto: 'read_reply', spr: 'mob_ccbomb',
    fireCd: 3.5, fireBulletDmg: 1.2, fireBulletSpd: 130, fireBulletRange: 300, fireBulletCount: 3, fireTriggerR: 260 },
  /* 已读不回：只作为抄送轰炸的分裂产物出现，不进常规刷怪池 */
  read_reply: { name: '已读不回', hp: 3, spd: 160, touch: 1.5, xp: 1, jig: false, spr: 'mob_readreply' },
  /* 重复造轮子任务：自带独立护盾，破盾前减伤80%，破盾后短暂硬直吃满伤害——教玩家集火而非漫射，第1月登场
   * 护盾计数器与真实hp消耗同一份折算后伤害，必须显著低于hp才能在死亡前触发破防（否则怪会在破盾前就先死） */
  reinvent_wheel: { name: '重复造轮子任务', hp: 12, spd: 55, touch: 3, xp: 2.5, jig: false,
    shieldHp: 5, spr: 'mob_wheel' },
  /* 会议邀请：周期性"改期"消失+短暂无敌，逼玩家不能对单只挂机磨 */
  meeting_invite: { name: '会议邀请', hp: 22, spd: 50, touch: 3.5, xp: 2.5, jig: false,
    vanishEvery: 8, vanishDur: 1.5, spr: 'mob_meeting' },
  /* 已发送-撤回中：死亡50%概率原地复活一次，纯节奏/心理设计怪 */
  message_recall: { name: '已发送-撤回中', hp: 12, spd: 100, touch: 2.5, xp: 2, jig: false,
    recallChance: .5, spr: 'mob_recall' },
  /* 加急会议提醒：无接触伤害，靠近玩家的持续小范围光圈 dot+减速（复用 G.burns 燃烧区机制） */
  urgent_meeting: { name: '加急会议提醒', hp: 16, spd: 45, touch: 0, xp: 3, jig: false,
    auraR: 70, auraDot: 2, auraSlowPct: .4, spr: 'mob_urgent' },
  /* 临时工外包大军：6只一组刷出，全组最后1只死亡额外结算奖励经验；AI主动散开合围而非直冲 */
  outsourced_army: { name: '临时工外包大军', hp: 5, spd: 140, touch: 1.5, xp: .8, jig: false,
    groupSize: 6, groupBonusXp: 6, spr: 'mob_army' },
  /* 深夜返工提醒：受伤攒"返工值"，攒够后短暂高频冲刺，随后进入虚弱期更好打——逼玩家瞬间爆发而非持续磨血 */
  overtime_rework: { name: '深夜返工提醒', hp: 24, spd: 85, touch: 3.5, xp: 3.5, jig: false,
    reworkThreshold: 20, spr: 'mob_rework' },
  /* KPI 追杀者：中间层，直线追击不绕路，填补杂鱼到小Boss的难度断层，独立生成不进常规trickle池 */
  kpi_hunter: { name: 'KPI 追杀者', hp: 60, spd: 118, touch: 6, xp: 8, jig: false, spr: 'mob_hunter' },
  /* 已读不回·终极形态：极高闪避+全场最快，专治全自动挂机流（简化自"脱离索敌判定"，用高闪避等效实现） */
  read_no_reply_ultimate: { name: '已读不回·终极形态', hp: 45, spd: 170, touch: 2, xp: 6, jig: false,
    dodgeOverride: .85, spr: 'mob_ghostreply' },
  /* 需求评审会：据点型不移动，给附近其它杂鱼临时加速光环，逼玩家主动跑过去点名清掉 */
  req_review_board: { name: '需求评审会', hp: 45, spd: 0, touch: 0, xp: 6, jig: false,
    reviewR: 110, spr: 'mob_reviewboard' },
  /* 深夜加班灯：静止环境怪，玩家进入光照范围中易伤（复用 vulnT），易碎、经验较高 */
  night_lamp: { name: '深夜加班灯', hp: 8, spd: 0, touch: 0, xp: 5, jig: false,
    lampR: 80, spr: 'mob_lamp' },
  /* v18 新增：钓鱼邮件——远程射手，保持 200-260px 距离，周期性发射钓鱼链接减速弹
   * 引入"远程射手"行为品类，玩家不能纯站桩 */
  phishing_mail: { name: '钓鱼邮件', hp: 14, spd: 90, touch: 1.5, xp: 3, jig: false,
    spr: 'mob_phishing', keepDist: 230, keepDistTol: 40,
    fireCd: 2.5, fireBulletDmg: 3, fireBulletSpd: 200, fireBulletRange: 320, fireBulletSlow: .3, fireTriggerR: 320 },
  /* v18 新增：死线警报——站桩，周期性在玩家脚下画预警圈 1s 后爆炸
   * 引入"固定预警型"行为品类，玩家不能纯走 A 键静态位移 */
  deadline_alarm: { name: '死线警报', hp: 16, spd: 0, touch: 0, xp: 4, jig: false,
    spr: 'mob_deadline', alarmCd: 5, alarmDelay: 1, alarmR: 55, alarmDmg: 12 },

  /* =====================================================================
   * v2.2 新增行为品类 · 7 种（自爆/冲锋/召唤/拖尾坦克/牵引/偷窃/易伤射手）
   * 行为实现见 core.js updateMob 对应分支
   * ===================================================================== */
  /* KPI 气球：加速贴脸，近身点燃引信后自爆（有预警圈）；不接触伤害，全部威胁在爆炸 */
  kpi_balloon: { name: 'KPI 气球', hp: 10, spd: 118, touch: 0, xp: 3, jig: false, spr: 'mob_balloon',
    kamikaze: { r: 46, dmg: 16, fuse: .55 } },
  /* 狼性文化训练生：中距离蓄力（红线预警）后高速突进，撞上挨大口；平时走普通追击 */
  wolf_culture: { name: '狼性文化训练生', hp: 26, spd: 78, touch: 4, xp: 4, jig: false, spr: 'mob_wolf',
    charger: { windup: .55, dashSpd: 300, dashT: .45, cd: 2.4 } },
  /* HR 实习生：站得远远的周期呼叫邮件支援（召唤物不计入波次目标） */
  hr_intern: { name: 'HR 实习生', hp: 30, spd: 55, touch: 2, xp: 5, jig: false, spr: 'mob_hrintern',
    summon: { type: 'email', count: 2, cd: 6, cap: 6 } },
  /* 加班蜗牛：厚血慢速坦克，身后拖减速粘液带，逼玩家绕路 */
  overtime_snail: { name: '加班蜗牛', hp: 55, spd: 34, touch: 5, xp: 6, jig: false, spr: 'mob_snail',
    slowTrail: { r: 26, slow: .35, life: 2.2, drop: .5 } },
  /* 全员会议黑洞：缓慢逼近，把范围内的玩家往自己身上吸（位移压力型） */
  meeting_blackhole: { name: '全员会议黑洞', hp: 34, spd: 22, touch: 3, xp: 6, jig: false, spr: 'mob_blackhole',
    pullR: 130, pullPow: 44 },
  /* 工资小偷：满场偷吃经验豆，杀掉吐 1.5 倍——不打它就亏，纯机会成本怪 */
  salary_thief: { name: '工资小偷', hp: 18, spd: 150, touch: 1.5, xp: 2, jig: true, spr: 'mob_thief',
    thief: true },
  /* PUA 大师：保距嘴炮，"画的饼"命中挂易伤（吃了这张饼你更疼） */
  pua_master: { name: 'PUA 大师', hp: 22, spd: 80, touch: 2, xp: 5, jig: false, spr: 'mob_pua',
    keepDist: 210, keepDistTol: 40, fireCd: 3.2, fireBulletDmg: 2, fireBulletSpd: 150,
    fireBulletRange: 300, fireTriggerR: 300, fireBulletVuln: { t: 2.5, bonus: .2 } },

  /* ===== v2.8 梗怪二期（画面梗优先，行为见 core updateMob 对应分支，设计 dcos/miniboss-mobs-design-v2.8.md） ===== */
  copier_mother: { name: '复印机成精', hp: 90, spd: 42, touch: 5, xp: 12, jig: false, spr: 'mob_copier',
    spawner: { type: 'paper_minion', cd: 2.5, cap: 5 } },
  paper_minion: { name: 'A4 纸人', hp: 1, spd: 150, touch: 1.5, xp: .5, jig: true, spr: 'mob_paperman' },
  chair_crazy: { name: '人体工学椅暴走', hp: 26, spd: 0, touch: 0, xp: 6, jig: false, spr: 'mob_chairdrift',
    bounce: { spd: 240, dmg: 14, rest: 1.2, restEvery: 3 } },
  bucket_runner: { name: '提桶跑路侠', hp: 30, spd: 124, touch: 0, xp: 8, jig: false, spr: 'mob_bucket',
    fleeOnly: { ttl: 30 } },
  caffeine_maniac: { name: '咖啡因过载狂人', hp: 18, spd: 170, touch: 4, xp: 5, jig: true, spr: 'mob_caffeine',
    brownian: { crashEvery: 6, stunDur: 2 } },
  box_walker: { name: '裁员纸箱人', hp: 24, spd: 88, touch: 4, xp: 4, jig: false, spr: 'mob_boxman',
    boxLegacy: true },
  smoker: { name: '楼道抽烟怪', hp: 40, spd: 0, touch: 5, xp: 6, jig: false, spr: 'mob_smoker',
    smokeZone: 80, dodgeOverride: .15 },
  battery_man: { name: '干电池人', hp: 30, spd: 92, touch: 4.5, xp: 7, jig: false, spr: 'mob_battery',
    battery: { paralyzeDur: 3 } },
  kpi_snake_head: { name: 'KPI 曲线蛇', hp: 30, spd: 118, touch: 5, xp: 8, jig: false, spr: 'mob_snakehead',
    snakeHead: { segs: 8 } },
  kpi_snake_body: { name: '季度指标节点', hp: 14, spd: 118, touch: 3, xp: 2, jig: false, spr: 'mob_snakebody',
    snakeBody: true },
  doc_tower: { name: '需求文档塔', hp: 150, spd: 30, touch: 8, xp: 16, jig: false, spr: 'mob_doctower',
    tower: { layers: 5, spdStep: .3, sizeStep: .15, avalancheR: 70, avalancheDmg: 24 } },
  party_host: { name: '年会主持人', hp: 55, spd: 66, touch: 3, xp: 12, jig: false, spr: 'mob_host',
    formation: { r: 300, cols: 4, gap: 18 } },
  hr_magnet: { name: 'HR 磁铁', hp: 45, spd: 58, touch: 5, xp: 9, jig: false, spr: 'mob_magnet',
    magnet: { r: 130, pull: 62, phase: 2 } },
  gen_z: { name: '00后整顿人', hp: 60, spd: 105, touch: 0, xp: 14, jig: false, spr: 'mob_genz',
    vigilante: { dmg: 12, cd: 1.1 } },
  neihao_twins: { name: '精神内耗小人', hp: 55, spd: 70, touch: 3, xp: 7, jig: false, spr: 'mob_neihao',
    selfFight: { dps: .02, counterT: 3 } },
  shit_mountain: { name: '屎山代码巨兽', hp: 260, spd: 26, touch: 10, xp: 30, jig: false, spr: 'mob_shitmount',
    slowTrail: { r: 26, slow: .3, life: 2.5 } },

  /* v2.0 公共事故：正式大逃杀阶段周期出现；处理成功给 KPI，失败涨锅值 */
  incident_outage: { name: '线上故障公告牌', hp: 86, spd: 0, touch: 0, xp: 14, jig: false, spr: 'mob_deadline',
    publicIncident: '线上故障', incidentLife: 24, incidentSpawn: 'message_recall', incidentSpawnCd: 4, potFail: 18, kpiReward: 24 },
  incident_client_rework: { name: '甲方临时改口径', hp: 92, spd: 35, touch: 0, xp: 16, jig: true, spr: 'mob_cr',
    publicIncident: '甲方临时改', incidentLife: 26, incidentSpawn: 'cr', incidentSpawnCd: 5, potFail: 22, kpiReward: 28 },
  incident_pr_fire: { name: '舆情火警公关', hp: 74, spd: 0, touch: 0, xp: 15, jig: false, spr: 'mob_urgent',
    publicIncident: '舆情火警', incidentLife: 22, incidentSpawn: 'cc_bomb', incidentSpawnCd: 4.5, potFail: 20, kpiReward: 26 },
  incident_acceptance: { name: '客户验收签字圈', hp: 100, spd: 0, touch: 0, xp: 18, jig: false, spr: 'mob_reviewboard',
    publicIncident: '客户验收', incidentLife: 28, incidentSpawn: 'urgent_meeting', incidentSpawnCd: 5.5, potFail: 24, kpiReward: 32 },
  /* Phase 3 补齐至 10 种 */
  incident_budget_cut: { name: '预算砍半通知', hp: 88, spd: 0, touch: 0, xp: 15, jig: false, spr: 'mob_deadline',
    publicIncident: '预算砍半', incidentLife: 25, incidentSpawn: 'sticky', incidentSpawnCd: 4.5, potFail: 20, kpiReward: 26 },
  incident_okr_align: { name: 'OKR 对齐会议', hp: 82, spd: 0, touch: 0, xp: 14, jig: false, spr: 'mob_meeting',
    publicIncident: 'OKR 对齐', incidentLife: 24, incidentSpawn: 'meeting_invite', incidentSpawnCd: 5, potFail: 18, kpiReward: 25 },
  incident_year_end: { name: '年终述职会', hp: 110, spd: 0, touch: 0, xp: 20, jig: false, spr: 'mob_reviewboard',
    publicIncident: '年终述职', incidentLife: 30, incidentSpawn: 'urgent_meeting', incidentSpawnCd: 6, potFail: 26, kpiReward: 36 },
  incident_throttle: { name: '中台限流公告', hp: 78, spd: 0, touch: 0, xp: 15, jig: false, spr: 'mob_urgent',
    publicIncident: '中台限流', incidentLife: 22, incidentSpawn: 'read_reply', incidentSpawnCd: 3.5, potFail: 20, kpiReward: 26 },
  incident_competitor: { name: '竞品报告发布', hp: 96, spd: 30, touch: 0, xp: 17, jig: true, spr: 'mob_hunter',
    publicIncident: '竞品报告', incidentLife: 24, incidentSpawn: 'kpi_hunter', incidentSpawnCd: 8, potFail: 22, kpiReward: 30 },
  incident_req_review: { name: '需求评审公告', hp: 90, spd: 0, touch: 0, xp: 16, jig: false, spr: 'mob_reviewboard',
    publicIncident: '需求评审', incidentLife: 26, incidentSpawn: 'cr', incidentSpawnCd: 5, potFail: 22, kpiReward: 28 },
};

/* v2.0 公共事故池 · 10 种 */
export const PUBLIC_INCIDENTS = [
  'incident_outage', 'incident_client_rework', 'incident_pr_fire', 'incident_acceptance',
  'incident_budget_cut', 'incident_okr_align', 'incident_year_end', 'incident_throttle',
  'incident_competitor', 'incident_req_review',
];

/* 每月波次：试用期同事未到岗，全部琐事都冲玩家来——月初爆发 + 持续涓流保证割草密度
 * 月份分层解锁新怪物（不做连续渐变权重，直接按月切换 types 数组）。
 * 机制多样性前移：第1月就有分裂(cc_bomb)+护盾硬直(reinvent_wheel)两种非纯数值怪物。 */
/* v2.0 试用期 3 波结构 · 每月 3 波敌人 + 月度考核 Boss
 *   每波：明确的敌人类型 + 数量 → 全部击杀才进入下一波
 *   打完第 3 波 → 月度小 Boss 登场 → 击杀 Boss → 通关本月
 *   Boss 击杀 → 立即进入下一月（不再靠时间等）
 *   同时敌人会一直追杀玩家（现有 mobTarget 已实现）*/
export function subWaves(month) {
  /* 每波 [{ type, count }] · 波内敌人必须全部会追击玩家（spd>0）
   *   deadline_alarm/req_review_board 是站桩型，玩家不追它们波次永远不会推进，禁止入池
   * v2.1 割草化：数量按"同屏 30-60 只"标定（原 7-14 只/波太空，无割草感）
   *   波内递增（w1<w2<w3），跨月递增；主力永远是低血 email 系，机制怪做点缀不做主食 */
  if (month <= 1) return [
    /* 月 1 · 16/21/26（原 24/30/38：实测第 1 波就淹死全托管/新手，玩家死在所有成长内容之前）*/
    [{ type: 'email', count: 12 }, { type: 'cc_bomb', count: 4 }],
    [{ type: 'email', count: 10 }, { type: 'reinvent_wheel', count: 4 }, { type: 'cc_bomb', count: 7 }],
    [{ type: 'email', count: 12 }, { type: 'phishing_mail', count: 3 }, { type: 'cc_bomb', count: 8 }],
  ];
  if (month === 2) return [
    /* 26/34/42（原 30/38/46，微降平滑难度曲线）；v2.2 引入冲锋/自爆两种新行为 */
    [{ type: 'email', count: 19 }, { type: 'sticky', count: 7 }, { type: 'chair_crazy', count: 2 }],
    [{ type: 'email', count: 12 }, { type: 'cc_bomb', count: 10 }, { type: 'wolf_culture', count: 4 }, { type: 'meeting_invite', count: 8 }],
    [{ type: 'email', count: 16 }, { type: 'message_recall', count: 11 }, { type: 'phishing_mail', count: 9 }, { type: 'kpi_balloon', count: 6 }, { type: 'box_walker', count: 4 }],
  ];
  if (month === 3) return [
    /* 44/48/56；v2.2 引入召唤/牵引/偷窃 */
    [{ type: 'email', count: 22 }, { type: 'sticky', count: 10 }, { type: 'cc_bomb', count: 10 }, { type: 'hr_intern', count: 2 }, { type: 'copier_mother', count: 1 }, { type: 'caffeine_maniac', count: 3 }],
    [{ type: 'email', count: 18 }, { type: 'meeting_invite', count: 10 }, { type: 'message_recall', count: 12 }, { type: 'meeting_blackhole', count: 2 }, { type: 'urgent_meeting', count: 6 }],
    [{ type: 'email', count: 14 }, { type: 'phishing_mail', count: 10 }, { type: 'cc_bomb', count: 12 }, { type: 'wolf_culture', count: 6 }, { type: 'salary_thief', count: 2 }, { type: 'outsourced_army', count: 2 }, { type: 'hr_magnet', count: 2 }],
  ];
  if (month === 4) return [
    /* 50/56/62；v2.2 引入拖尾坦克/易伤射手/站桩死线警报 */
    [{ type: 'email', count: 24 }, { type: 'cr', count: 12 }, { type: 'sticky', count: 10 }, { type: 'overtime_snail', count: 3 }, { type: 'deadline_alarm', count: 2 }, { type: 'doc_tower', count: 1 }],
    [{ type: 'email', count: 16 }, { type: 'cc_bomb', count: 14 }, { type: 'meeting_invite', count: 10 }, { type: 'pua_master', count: 4 }, { type: 'kpi_balloon', count: 8 }, { type: 'urgent_meeting', count: 4 }, { type: 'battery_man', count: 4 }, { type: 'neihao_twins', count: 2 }],
    [{ type: 'email', count: 20 }, { type: 'outsourced_army', count: 3 }, { type: 'overtime_rework', count: 10 }, { type: 'phishing_mail', count: 8 }, { type: 'wolf_culture', count: 6 }, { type: 'hr_intern', count: 2 }, { type: 'copier_mother', count: 1 }, { type: 'caffeine_maniac', count: 3 }],
  ];
  /* 月 5+ · 60/68/80 全料（v2.2 全行为品类混编 + 需求评审会据点） */
  return [
    [{ type: 'email', count: 24 }, { type: 'cr', count: 12 }, { type: 'cc_bomb', count: 12 }, { type: 'kpi_balloon', count: 8 }, { type: 'salary_thief', count: 3 }, { type: 'req_review_board', count: 2 }, { type: 'copier_mother', count: 1 }, { type: 'gen_z', count: 1 }, { type: 'chair_crazy', count: 3 }],
    [{ type: 'email', count: 20 }, { type: 'meeting_invite', count: 12 }, { type: 'urgent_meeting', count: 8 }, { type: 'wolf_culture', count: 8 }, { type: 'overtime_snail', count: 4 }, { type: 'meeting_blackhole', count: 3 }, { type: 'outsourced_army', count: 3 }, { type: 'shit_mountain', count: 1 }, { type: 'battery_man', count: 5 }],
    [{ type: 'email', count: 22 }, { type: 'overtime_rework', count: 12 }, { type: 'read_no_reply_ultimate', count: 6 }, { type: 'phishing_mail', count: 10 }, { type: 'pua_master', count: 6 }, { type: 'hr_intern', count: 3 }, { type: 'deadline_alarm', count: 3 }, { type: 'cc_bomb', count: 12 }, { type: 'kpi_snake_head', count: 1 }, { type: 'party_host', count: 1 }, { type: 'hr_magnet', count: 3 }],
  ];
}

/* v2.2 正式大逃杀"琐事骚扰潮"抽取池：转正后低频小撮刷新，维持割草密度与行为多样性 */
export const BR_MOB_POOL = [
  'email', 'cc_bomb', 'kpi_balloon', 'wolf_culture', 'salary_thief',
  'pua_master', 'overtime_snail', 'meeting_blackhole', 'phishing_mail', 'deadline_alarm',
  /* v2.8 梗怪二期 */
  'chair_crazy', 'caffeine_maniac', 'box_walker', 'battery_man', 'hr_magnet', 'neihao_twins',
];

export function waveComp(month) {
  const burst = 12 + 5 * (month - 1);        // 月初爆发波
  const cap = 10 + 2 * month;                 // 场上存活上限（涓流补到这个数）
  /* v18: 早期怪物 AI 差异化——月1 从 3 种(邮件/抄送轰炸/护盾任务)扩到 5 种(+钓鱼邮件远程射手+死线警报站桩爆炸圈)
   * 玩家 60 秒内会同时遭遇:直线追杀+分裂+带远程弹幕的追杀者+远程狙击+固定爆炸区，4-5 种行为品类同时呈现 */
  const types = month <= 1 ? ['email', 'cc_bomb', 'reinvent_wheel', 'phishing_mail', 'deadline_alarm']
    : month === 2 ? ['email', 'sticky', 'cc_bomb', 'reinvent_wheel', 'meeting_invite', 'message_recall', 'phishing_mail', 'deadline_alarm']
    : month === 3 ? ['email', 'sticky', 'cc_bomb', 'meeting_invite', 'message_recall', 'urgent_meeting', 'outsourced_army', 'phishing_mail']
    : month === 4 ? ['email', 'sticky', 'cr', 'cc_bomb', 'meeting_invite', 'urgent_meeting', 'outsourced_army', 'overtime_rework', 'req_review_board']
    : ['email', 'sticky', 'cr', 'cc_bomb', 'meeting_invite', 'urgent_meeting', 'outsourced_army', 'overtime_rework', 'req_review_board', 'read_no_reply_ultimate'];
  return { burst, cap, types };
}
