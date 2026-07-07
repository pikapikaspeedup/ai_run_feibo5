/* =====================================================================
 * 人设晋升里程碑：人格锁定后，在关键等级额外弹出一次三选一。
 * 设计目标是提升升级获得感，不替代原本升级卡。
 * ===================================================================== */

export const MILESTONE_TRACKS = {
  rlhf: [
    {
      id: 'rlhf_precision_review',
      name: '标注组长',
      eff: tier => `处决阈值 +${3 + tier}% ，处决爆炸概率 +${8 + tier * 2}%`,
      tag: '样本越脏，审核越准。',
      apply: (pl, tier) => {
        pl.mods.executeThreshold += .03 + tier * .01;
        pl.mods.executeBlastChance += .08 + tier * .02;
      },
    },
    {
      id: 'rlhf_extreme_dataset',
      name: '极端样本库',
      eff: tier => `暴击率 +${5 + tier}% ，全局伤害 +${3 + tier}%`,
      tag: '普通样本训练不出怪物，极端样本可以。',
      apply: (pl, tier) => {
        pl.mods.crit += .05 + tier * .01;
        pl.mods.dmg *= 1.03 + tier * .01;
      },
    },
    {
      id: 'rlhf_final_feedback',
      name: '离职反馈预案',
      eff: tier => `低血追击伤害 +${10 + tier * 3}% ，Q/E 冷却 -${4 + tier}%`,
      tag: '最有价值的反馈，往往来自最后一天。',
      apply: (pl, tier) => {
        pl.mods.lowHpExecuteDmg += .10 + tier * .03;
        pl.mods.activeCdMul *= 1 - (.04 + tier * .01);
      },
    },
  ],
  revival: [
    {
      id: 'revival_old_bone',
      name: '老员工骨密度',
      eff: tier => `最大生命 +${18 + tier * 6}，重击减伤 +${5 + tier}%`,
      tag: '骨头不硬，工龄白混。',
      apply: (pl, tier) => {
        pl.mods.maxHpAdd += 18 + tier * 6;   // 只走 maxHpAdd 单通道，与面板一致（原来还偷偷加 hpBase，实际加血高于面板）
        pl.mods.heavyHitReduce += .05 + tier * .01;
      },
    },
    {
      id: 'revival_debt_accounting',
      name: '血债会计',
      eff: tier => `掉血转护盾 +${6 + tier * 2}% ，低血抗性 +${4 + tier}%`,
      tag: '每一滴血，都要进成本中心。',
      apply: (pl, tier) => {
        pl.mods.damageToShield += .06 + tier * .02;
        pl.mods.lowHpResist += .04 + tier * .01;
      },
    },
    {
      id: 'revival_shift_allowance',
      name: '返聘津贴',
      eff: tier => `击杀回血 +${3 + tier * 2}，Q/E 冷却 -${3 + tier}%`,
      tag: '工资可以打折，续命津贴不能少。',
      apply: (pl, tier) => {
        pl.mods.killHeal += 3 + tier * 2;
        pl.mods.activeCdMul *= 1 - (.03 + tier * .01);
      },
    },
  ],
  opc: [
    {
      id: 'opc_procurement_office',
      name: '外包采购权',
      eff: tier => `OPC 召唤物伤害 +${10 + tier * 3}% ，召唤冷却 -${3 + tier}%`,
      tag: '预算不多，供应商很多。',
      apply: (pl, tier) => {
        pl.mods.summonDmg += .10 + tier * .03;
        pl.mods.summonCdMul *= 1 - (.03 + tier * .01);
      },
    },
    {
      id: 'opc_shadow_legal',
      name: '影子法务',
      eff: tier => `伤害转嫁概率 +${5 + tier}% ，最大生命 +${10 + tier * 4}`,
      tag: '合同里写得很清楚：风险由乙方承担。',
      apply: (pl, tier) => {
        pl.mods.damageToSummon += .05 + tier * .01;
        pl.mods.maxHpAdd += 10 + tier * 4;
      },
    },
    {
      id: 'opc_delivery_pm',
      name: '交付项目群',
      eff: tier => `全局伤害 +${3 + tier}% ，Q/E 冷却 -${4 + tier}%`,
      tag: '群越多，事情越像有人在推进。',
      apply: (pl, tier) => {
        pl.mods.dmg *= 1.03 + tier * .01;
        pl.mods.activeCdMul *= 1 - (.04 + tier * .01);
      },
    },
  ],
  optimizer: [
    {
      id: 'optimizer_control_room',
      name: '战情会议室',
      eff: tier => `控制后易伤 +${7 + tier * 2}% ，眩晕传染概率 +${6 + tier}%`,
      tag: '只要会开得够久，所有人都会互相负责。',
      apply: (pl, tier) => {
        pl.mods.stunPunish += .07 + tier * .02;
        pl.mods.stunSpread = Math.min(.95, pl.mods.stunSpread + .06 + tier * .01);
      },
    },
    {
      id: 'optimizer_risk_office',
      name: '风控办公室',
      eff: tier => `受到伤害 -${5 + tier}% ，闪避 +${3 + tier}%`,
      tag: '出问题不是我扛，是流程扛。',
      apply: (pl, tier) => {
        pl.mods.dmgTaken *= 1 - (.05 + tier * .01);
        pl.mods.dodge = 1 - (1 - pl.mods.dodge) * (1 - (.03 + tier * .01));
      },
    },
    {
      id: 'optimizer_kpi_dashboard',
      name: 'KPI驾驶舱',
      eff: tier => `KPI 压力每层收益 +${1 + tier}% ，全局伤害 +${3 + tier}%`,
      tag: '图表一亮，责任自然下沉。',
      apply: (pl, tier) => {
        pl.mods.kpiPerLayer += .01 + tier * .01;
        pl.mods.dmg *= 1.03 + tier * .01;
      },
    },
  ],
  slacker: [
    {
      id: 'slacker_motion_blur',
      name: '动态摸鱼残影',
      eff: tier => `移动速度 +${4 + tier}% ，闪避 +${4 + tier}%`,
      tag: '看起来一直在路上，就没人知道你去哪了。',
      apply: (pl, tier) => {
        pl.mods.spd *= 1.04 + tier * .01;
        pl.mods.dodge = 1 - (1 - pl.mods.dodge) * (1 - (.04 + tier * .01));
      },
    },
    {
      id: 'slacker_presence_bot',
      name: '在线感机器人',
      eff: tier => `活跃认证收益 +${30 + tier * 10}% ，移速 +${2 + tier}%`,
      tag: '绿点常亮，是现代职场最朴素的护身符。',
      apply: (pl, tier) => {
        pl.mods.uptimeCertRate += .30 + tier * .10;
        /* 原来写 fakeBusy += 1 并宣称"触发更频繁"，但引擎只做真值判断，层数无消费——改为诚实的移速加成 */
        pl.mods.spd *= 1.02 + tier * .01;
      },
    },
    {
      id: 'slacker_escape_calendar',
      name: '逃会日历',
      eff: tier => `Q/E 冷却 -${5 + tier}% ，冲刺冷却进一步压缩`,
      tag: '日历看似排满，其实全是缓冲区。',
      apply: (pl, tier) => {
        pl.mods.activeCdMul *= 1 - (.05 + tier * .01);
        pl.mods.dashCd = pl.mods.dashCd ? pl.mods.dashCd * .85 : 2.8;
      },
    },
  ],
  hrbp: [
    {
      id: 'hrbp_bigger_room',
      name: '更大的会议室',
      eff: tier => `PUA 气场半径 +${20 + tier * 5}px ，气场减伤额外 +${2 + tier}%`,
      tag: '会议室越大，说出来的话越有分量。',
      apply: (pl, tier) => {
        pl.mods.puaAuraR = (pl.mods.puaAuraR || 0) + 20 + tier * 5;
        pl.mods.puaAura += .02 + tier * .01;
      },
    },
    {
      id: 'hrbp_express_letter',
      name: '加急挂号信',
      eff: tier => `裁员函频率 +${15 + tier * 5}% ，函件伤害 +${20 + tier * 5}%`,
      tag: '顺丰到付，签收即生效。',
      apply: (pl, tier) => {
        pl.mods.layoffLetterHaste = (pl.mods.layoffLetterHaste || 0) + .15 + tier * .05;
        pl.mods.layoffLetterDmg = (pl.mods.layoffLetterDmg || 0) + .20 + tier * .05;
      },
    },
    {
      id: 'hrbp_quota_bonus',
      name: '裁员指标超额',
      eff: tier => `处决阈值 +${3 + tier}% ，击杀回血额外 +${1 + tier}`,
      tag: '本季度超额完成，明年名额翻倍。',
      apply: (pl, tier) => {
        pl.mods.executeThreshold += .03 + tier * .01;
        pl.mods.hrbpKillHeal += 1 + tier;
      },
    },
  ],
  reporter: [
    {
      id: 'reporter_bigger_screen',
      name: '更大的投影幕',
      eff: tier => `路演光锥更长更宽，光锥伤害 +${15 + tier * 5}%`,
      tag: '幕布越大，问题越小。',
      apply: (pl, tier) => {
        pl.mods.coneShowLen = (pl.mods.coneShowLen || 0) + 25 + tier * 5;
        pl.mods.coneShowDmg = (pl.mods.coneShowDmg || 0) + .15 + tier * .05;
      },
    },
    {
      id: 'reporter_gold_pointer',
      name: '镀金激光笔',
      eff: tier => `暴击率 +${4 + tier}% ，暴击伤害 +${10 + tier * 3}%`,
      tag: '笔一亮出来，就知道是总监级汇报。',
      apply: (pl, tier) => {
        pl.mods.crit += .04 + tier * .01;
        pl.mods.critDmg = (pl.mods.critDmg || 1.5) + .10 + tier * .03;
      },
    },
    {
      id: 'reporter_standing_ovation',
      name: '全场起立鼓掌',
      eff: tier => `向上汇报 buff 时长 +${1 + tier * .5}s ，年终述职冷却 -${8 + tier * 2}%`,
      tag: '掌声持续的时间，就是你安全的时间。',
      apply: (pl, tier) => {
        pl.mods.uplevelDur = (pl.mods.uplevelDur || 0) + 1 + tier * .5;
        pl.mods.annualHaste = (pl.mods.annualHaste || 0) + .08 + tier * .02;
      },
    },
  ],
};

export function milestoneLabel(id) {
  for (const tracks of Object.values(MILESTONE_TRACKS)) {
    const hit = tracks.find(t => t.id === id);
    if (hit) return hit.name;
  }
  return id;
}
