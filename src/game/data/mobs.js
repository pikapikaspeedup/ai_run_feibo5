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
};

/* 每月波次：试用期同事未到岗，全部琐事都冲玩家来——月初爆发 + 持续涓流保证割草密度
 * 月份分层解锁新怪物（不做连续渐变权重，直接按月切换 types 数组）。
 * 机制多样性前移：第1月就有分裂(cc_bomb)+护盾硬直(reinvent_wheel)两种非纯数值怪物。 */
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
