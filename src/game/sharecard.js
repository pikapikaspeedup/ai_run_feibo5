/* =====================================================================
 * v2.8.1 自传播分享卡：结算 → 牛马人格判定 → 竖版像素风"年度考核报告"PNG
 * 设计原则（见对话 2026-07-07）：
 *   - 为"群里第三者的 3 秒钟"设计：看懂 → 笑 → 想玩
 *   - 病毒句替用户写好转发文案（消灭分享摩擦最大的一步）
 *   - 稀有章用真实概率背书炫耀（金色时刻/事件概率已知）
 * ===================================================================== */
import { COPY } from './data/copy.js';

/* 人格头像：优先玩家人设 portrait，回退通用牛马。
 * 模块加载即预热 Image（否则分享时 new Image 同步 drawImage 画不出——只剩空框） */
const PORTRAITS = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/generated/portrait_*.png', { eager: true, import: 'default' }))) {
  const img = new Image();
  img.src = url;
  PORTRAITS[path.split('/').pop().replace('.png', '').replace(/^portrait_/, '')] = img;
}

/* ---------- v2.8.2 文书类型（按结局先命中，分享卡多样性第一层） ---------- */
const DOC_TYPES = [
  { cond: s => s.win, title: '优秀员工证书', no: '表彰字〔2026〕', head: '表彰文件 · 抄送全体（已离职）成员', stamp: '年度卷王', stampColor: '#c9a227', paper: '#f6f0dc' },
  { cond: s => !s.win && s.time < 60, title: '试用期不合格通知书', no: '人事字〔2026〕', head: '入职未满一小时 · 特此通知', stamp: '查无此人', stampColor: '#d43a2f', paper: '#f2efe6' },
  { cond: s => s.hrbpTalked, title: '绩效改进计划（PIP）', no: 'HR-PIP〔2026〕', head: '绩效面谈记录 · 存档备查', stamp: 'PIP', stampColor: '#b665ff', paper: '#efe9f5' },
  { cond: s => s.deathCause === 'zone', title: '旷工处理决定书', no: '考勤字〔2026〕', head: '红线外滞留 · 按旷工处理', stamp: '旷工', stampColor: '#d43a2f', paper: '#f5ece4' },
  { cond: s => s.deathByBoss, title: '向上管理事故报告', no: '事故字〔2026〕', head: '直面老板 · 汇报失败 · 全程留痕', stamp: '汇报失败', stampColor: '#8a3fd0', paper: '#e9edf4' },
  { cond: s => s.killsAI >= 8, title: '人机对抗表彰令', no: '硅基字〔2026〕', head: '人类阵线 · 战功记录', stamp: '碳基之光', stampColor: '#2c6cd8', paper: '#e8f1f2' },
  { cond: s => s.rankPct <= .25, title: '季度考核评定表', no: '绩效字〔2026〕', head: '季度绩效评定 · 仅供内部传阅', stamp: '已评定', stampColor: '#4a7a4a', paper: '#ecf2e6' },
  { cond: () => true, title: '离 职 证 明', no: 'HR 字〔2026〕', head: '兹证明该牛马已完成本轮大逃杀全部流程', stamp: '已优化', stampColor: '#d43a2f', paper: '#f2efe6' },
];
const SIGN_OFFS = ['人力资源部', '牛马管理委员会', '降本增效办公室', '行政部（代）', '优化执行小组'];
const EXTRA_STAMPS = ['下次一定', '建议重开', '已阅', '不予受理', '再接再厉'];

/* ---------- 牛马人格判定表（从上到下先命中先得） ---------- */
const PERSONA_TABLE = [
  { id: 'last_niuma', cond: s => s.win,
    title: '最后的牛马', color: '#ffcf33',
    verdict: '全公司都被优化了，只有你活着走到了工位。',
    viral: '我是全公司最后的牛马。明天，我还得来上班。' },
  { id: 'juanwang', cond: s => s.maxStreak >= 15,
    title: '卷王之王', color: '#ff6a6a',
    verdict: `最高 ${'${maxStreak}'} 连杀——你卷起来的样子，连你自己都怕。`,
    viral: '刚才一口气优化了十几个同事，感觉自己升职了（并没有）。' },
  { id: 'luddite', cond: s => s.killsAI >= 8 && s.killsAI >= s.killsHuman * 2,
    title: '新卢德主义斗士', color: '#38d3e8',
    verdict: `亲手下架 ${'${killsAI}'} 台 AI 牛马——物理意义上的抵制 AI 抢饭碗。`,
    viral: '今天我把办公室的 AI 全下架了。人类的工位，人类自己卷。' },
  { id: 'infighter', cond: s => s.killsHuman >= 8 && s.killsHuman >= s.killsAI * 2,
    title: '窝里横冠军', color: '#ff9edb',
    verdict: `优化了 ${'${killsHuman}'} 个人类同事，AI 见了你都绕道走。`,
    viral: '对 AI 下不去手，对同事毫不留情——我可能真的很适合职场。' },
  { id: 'comeback', cond: s => s.hrbpTalked && s.rank <= 5,
    title: '绩效逆袭者', color: '#7ee08a',
    verdict: '被 HRBP 当众点名约谈，最后却活到了决赛圈。',
    viral: 'HRBP 约谈我的时候，没想到最后离职证明是我给别人开的。' },
  { id: 'pot_chef', cond: s => s.potCount >= 1,
    title: '一锅端大厨', color: '#ff9440',
    verdict: `${'${potCount}'} 次一锅端——公司食堂都想挖你。`,
    viral: '今天在公司表演了一手"一锅端"，锅是真的从天上掉下来的。' },
  { id: 'optimizer_exec', cond: s => s.execCount >= 8,
    title: '优化执行官', color: '#b665ff',
    verdict: `处决 ${'${execCount}'} 人——裁员名单执行效率全公司第一。`,
    viral: '别人裁员走流程，我裁员走位。' },
  { id: 'wool_master', cond: s => s.itemsUsed >= 12,
    title: '公司羊毛精', color: '#ffe27a',
    verdict: `一局薅了 ${'${itemsUsed}'} 件公司物资——道具用得比工资领得勤。`,
    viral: '工资不高，但公司的羊毛我一根没放过。' },
  { id: 'zen_master', cond: s => s.hasSlackSkill,
    title: '带薪禅修大师', color: '#9aa4b5',
    verdict: ['在大逃杀里点满摸鱼技能——是真躺平，不是战术。', '全公司都在卷生卷死，你在原地打坐回血。'],
    viral: ['别人在大逃杀里厮杀，我在大逃杀里带薪躺平。都是上班。', '我把摸鱼技能点满了，HR 都挑不出毛病。'] },
  { id: 'dream_crusher', cond: s => s.bucketKilled >= 1,
    title: '梦想粉碎机', color: '#c9a06a',
    verdict: '连提桶跑路的人都被你抓了回来——桶留下了。',
    viral: '同事提桶跑路，被我按在门口把桶留下了。梦想可以走，物资不行。' },
  { id: 'speedrun', cond: s => !s.win && s.time < 60,
    title: '速通离职选手', color: '#ff4f4f',
    verdict: [`工龄 ${'${timeStr}'}——公司上班最短纪录保持者。`, `${'${timeStr}'} 从入职到离职——HR 的合同还没打印完。`],
    viral: ['今天上班 1 分钟就被优化了，通勤时间比工龄长。', '我的工龄短到社保都没来得及交。', '入职即巅峰，巅峰即离职。'] },
  { id: 'boss_slayer', cond: s => s.bossKilled >= 3,
    title: '考核官克星', color: '#e8825a',
    verdict: `干掉了 ${'${bossKilled}'} 位考核官——领导见了你会主动汇报。`,
    viral: '今天把三个考核官都送走了，会议室终于安静了。' },
  { id: 'participant', cond: s => s.rankPct >= .5,
    title: '陪跑型牛马', color: '#8a8271',
    verdict: ['重在参与，窝囊费照领。', '排名靠后，但心态第一。', '你不是垫底，你是给别人当分母。'],
    viral: ['这局我主打一个陪伴——陪全公司的人先走一步。', '别人大逃杀，我大陪跑，窝囊费一分没少领。', '公司排名我垫底，但我下班最早（被迫的）。'] },
  { id: 'normal', cond: () => true,
    title: '普通型牛马', color: '#dfe6f2',
    verdict: ['平平无奇地来，平平无奇地被优化，明天继续。', '没有高光，没有低谷，像极了大多数周三。', '本局表现：正常发挥（贬义）。'],
    viral: ['今天也是平平无奇被优化的一天。', '打了一局大逃杀，最大的收获是确认自己很普通。', '同事问我战绩，我说重在参与，他说他也是。'] },
];

/* 稀有章：事件/时刻 → 展示名 + 概率背书 */
const RARE_STAMPS = {
  bianzhi_offer: { name: '编制降临', pct: '0.9%' },
  age35_alarm: { name: '35 岁警报', pct: '2.1%' },
  server_down: { name: '服务器崩了', pct: '4.7%' },
  wolf_training: { name: '狼性内斗', pct: '4.7%' },
  team_photo: { name: '团建合影', pct: '5.2%' },
  headhunt: { name: '猎头来电', pct: '3.8%' },
};

function fmtT(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

/* 行为数据 → 人格 + 梗化数据行 */
export function buildReport(G) {
  const st = G.stats || {};
  const pl = G.player;
  const win = G.winT !== undefined || (pl.alive && G.playerRank === 1);
  const total = (G.botCount || 19) + 1;
  const rank = win ? 1 : (G.playerRank || total);
  const s = {
    win, rank, rankPct: rank / total, time: G.t, timeStr: fmtT(G.t),
    maxStreak: st.maxStreak || 0, killsAI: st.killsAI || 0, killsHuman: st.killsHuman || 0,
    potCount: st.potCount || 0, execCount: st.execCount || 0, itemsUsed: st.itemsUsed || 0,
    hrbpTalked: !!st.hrbpTalked, bucketKilled: st.bucketKilled || 0, bossKilled: st.bossKilled || 0,
    hasSlackSkill: !!(pl.skills && (pl.skills.tactical_lie || pl.skills.mouse_jiggler)) || !!(pl.persona === 'slacker'),
    deathCause: G.deathInfo && G.deathInfo.byZone ? 'zone' : '',
    deathByBoss: !!(G.deathInfo && G.deathInfo.byBoss),
  };
  const P = PERSONA_TABLE.find(p => p.cond(s));
  const doc = DOC_TYPES.find(d => d.cond(s));
  const fill = str => str.replace(/\$\{(\w+)\}/g, (_, k) => s[k] ?? '');
  const pickOne = v => Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;
  /* 工龄百分位：伪 CDF（无后端，曲线合理即可——4 分钟 ≈ 63%） */
  const survivePct = Math.min(99, Math.round(100 * (1 - Math.exp(-G.t / 220))));
  /* 稀有章：本局遭遇的最稀有事件 */
  const stamp = (st.events || []).map(id => RARE_STAMPS[id]).filter(Boolean)
    .sort((a, b) => parseFloat(a.pct) - parseFloat(b.pct))[0] || null;
  return {
    doc: { ...doc, signOff: SIGN_OFFS[Math.floor(Math.random() * SIGN_OFFS.length)],
      extraStamp: Math.random() < .4 ? EXTRA_STAMPS[Math.floor(Math.random() * EXTRA_STAMPS.length)] : null },
    persona: { title: P.title, color: P.color, verdict: fill(pickOne(P.verdict)), viral: fill(pickOne(P.viral)) },
    lines: [
      `本次工龄 ${fmtT(G.t)} · 超过 ${survivePct}% 的牛马`,
      `优化同事 ${G.kills} 人 · 为公司节省年薪 ¥${(G.kills * 8.5).toFixed(0)} 万`,
      `最终排名 #${rank}/${total} · 职级 LV.${pl.level} · ${win ? '唯一在职' : '已被优化'}`,
    ],
    stamp,
    playerPersona: pl.persona,
  };
}

/* ---------- canvas 渲染竖版分享卡（540×720，3:4） ---------- */
export function renderShareCard(G) {
  const R = buildReport(G);
  const W = 540, H = 720;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  /* 底：深色办公室 + 网格 */
  ctx.fillStyle = '#14161d'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 27) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 27) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  /* 纸张主体（纸色随文书类型） */
  const px = 30, py = 34, pw = W - 60, ph = H - 92;
  ctx.fillStyle = R.doc.paper || '#f2efe6';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, ph);
  /* 红条纹眉头 */
  for (let x = px; x < px + pw; x += 22) { ctx.fillStyle = '#d43a2f'; ctx.fillRect(x, py, 14, 6); }

  const cx = W / 2;
  ctx.textAlign = 'center';
  /* 眉：文书编号 + 类型头 */
  ctx.fillStyle = '#8a8271'; ctx.font = '12px monospace';
  ctx.fillText(`${R.doc.no}${100 + Math.floor(Math.random() * 900)} 号 · ${R.doc.head}`, cx, py + 28);
  /* 文书名 */
  ctx.fillStyle = '#4a443a'; ctx.font = 'bold 20px "PingFang SC", sans-serif';
  ctx.fillText(`《 ${R.doc.title} 》`, cx, py + 54);
  /* 人格大标题 */
  ctx.fillStyle = '#14161d'; ctx.font = 'bold 38px "PingFang SC", sans-serif';
  ctx.fillText(R.persona.title, cx, py + 96);
  ctx.fillStyle = R.persona.color === '#dfe6f2' ? '#8a8271' : R.persona.color;
  ctx.fillRect(cx - 90, py + 106, 180, 5);
  /* 文书主印章（右上，随机角度） */
  ctx.save();
  ctx.translate(px + pw - 74, py + 88); ctx.rotate(-.12 + Math.random() * .24);
  ctx.strokeStyle = R.doc.stampColor; ctx.lineWidth = 3;
  ctx.globalAlpha = .85;
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = R.doc.stampColor;
  ctx.font = `bold ${R.doc.stamp.length > 3 ? 13 : 17}px "PingFang SC", sans-serif`;
  ctx.fillText(R.doc.stamp, 0, 6);
  ctx.restore();
  /* 随机装饰：回形针 / 咖啡渍 / 胶带（各 35% 独立） */
  if (Math.random() < .35) {   /* 回形针（左上） */
    ctx.save(); ctx.translate(px + 26, py + 16); ctx.rotate(.3);
    ctx.strokeStyle = '#8a94a8'; ctx.lineWidth = 3;
    ctx.strokeRect(-4, -12, 8, 30); ctx.strokeRect(-1, -6, 2, 18);
    ctx.restore();
  }
  if (Math.random() < .35) {   /* 咖啡渍（随机下角） */
    const sx = px + 40 + Math.random() * (pw - 80), sy = py + ph - 90 - Math.random() * 60;
    ctx.strokeStyle = 'rgba(140,100,60,.28)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(sx, sy, 22, .3, Math.PI * 1.7); ctx.stroke();
  }
  if (Math.random() < .35) {   /* 透明胶带（顶边） */
    ctx.fillStyle = 'rgba(220,214,190,.55)';
    ctx.save(); ctx.translate(cx + (Math.random() * 160 - 80), py + 4); ctx.rotate(-.06 + Math.random() * .12);
    ctx.fillRect(-34, -10, 68, 20);
    ctx.restore();
  }

  /* 头像（人设 portrait 或占位牛马 emoji）——预热的 Image 用 complete 判定就绪 */
  const av = R.playerPersona && PORTRAITS[R.playerPersona];
  if (av && av.complete && av.naturalWidth) {
    ctx.drawImage(av, cx - 60, py + 122, 116, 116);
    ctx.strokeStyle = '#14161d'; ctx.lineWidth = 3;
    ctx.strokeRect(cx - 60, py + 122, 116, 116);
  } else {
    ctx.font = '86px sans-serif';
    ctx.fillText('🐂', cx, py + 214);
  }

  /* 判词 */
  ctx.fillStyle = '#4a443a'; ctx.font = '16px "PingFang SC", sans-serif';
  wrapText(ctx, R.persona.verdict, cx, py + 276, pw - 80, 24);

  /* 分割线 */
  ctx.strokeStyle = '#b5ac97'; ctx.lineWidth = 1; ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.moveTo(px + 30, py + 320); ctx.lineTo(px + pw - 30, py + 320); ctx.stroke();
  ctx.setLineDash([]);

  /* 三条梗化数据 */
  ctx.font = '15px monospace'; ctx.fillStyle = '#14161d';
  R.lines.forEach((ln, i) => ctx.fillText(ln, cx, py + 356 + i * 32));

  /* 稀有章 */
  if (R.stamp) {
    ctx.save();
    ctx.translate(cx + 130, py + 452); ctx.rotate(-.16);
    ctx.strokeStyle = '#d43a2f'; ctx.lineWidth = 3;
    ctx.strokeRect(-74, -26, 148, 52);
    ctx.fillStyle = '#d43a2f';
    ctx.font = 'bold 16px "PingFang SC", sans-serif';
    ctx.fillText(`亲历【${R.stamp.name}】`, 0, -4);
    ctx.font = '11px monospace';
    ctx.fillText(`仅 ${R.stamp.pct} 玩家见过`, 0, 14);
    ctx.restore();
  }

  /* 病毒句（手写引用体） */
  ctx.fillStyle = '#6b6455'; ctx.font = 'italic 16px "PingFang SC", sans-serif';
  wrapText(ctx, `「${R.persona.viral}」`, cx, py + 508, pw - 90, 24);

  /* 落款（右下）+ 额外小章 */
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b6455'; ctx.font = '13px "PingFang SC", sans-serif';
  ctx.fillText(R.doc.signOff, px + pw - 34, py + ph - 92);
  ctx.fillText('2026 年 7 月 7 日', px + pw - 34, py + ph - 74);
  ctx.textAlign = 'center';
  if (R.doc.extraStamp) {
    ctx.save();
    ctx.translate(px + 78, py + ph - 96); ctx.rotate(.1 - Math.random() * .2);
    ctx.strokeStyle = '#8a8271'; ctx.lineWidth = 2; ctx.globalAlpha = .7;
    ctx.strokeRect(-46, -16, 92, 32);
    ctx.fillStyle = '#8a8271'; ctx.font = 'bold 15px "PingFang SC", sans-serif';
    ctx.fillText(R.doc.extraStamp, 0, 5);
    ctx.restore();
  }
  /* 挑战钩子 */
  ctx.fillStyle = '#14161d'; ctx.font = 'bold 18px "PingFang SC", sans-serif';
  ctx.fillText(`我是「${R.persona.title}」，你是什么牛马？`, cx, py + ph - 56);

  /* 底部游戏名 + URL */
  ctx.fillStyle = '#8a8271'; ctx.font = '13px monospace';
  ctx.fillText('🐂 牛马大逃杀 · 免费网页游戏', cx, py + ph - 28);
  ctx.fillStyle = '#2c6cd8';
  ctx.fillText(location.origin + location.pathname, cx, py + ph - 10);

  return { canvas: cv, report: R };
}

function wrapText(ctx, text, cx, y, maxW, lh) {
  const chars = [...text];
  let line = '', yy = y;
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxW) {
      ctx.fillText(line, cx, yy); line = ch; yy += lh;
    } else line += ch;
  }
  if (line) ctx.fillText(line, cx, yy);
}

/* 分享：Web Share API（移动端原生面板带图）→ 降级下载 */
export async function shareCard(G, pre = null) {
  const { canvas, report } = pre || renderShareCard(G);
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
  const file = new File([blob], 'niuma-report.png', { type: 'image/png' });
  const text = `${report.persona.viral} —— 我是「${report.persona.title}」，你是什么牛马？`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, title: '牛马大逃杀 · 年度考核' });
      return 'shared';
    } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  /* 降级：下载图片 + 复制文案 */
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'niuma-report.png';
  a.click();
  try { await navigator.clipboard.writeText(text + ' ' + location.href); } catch (e) { /* ignore */ }
  return 'downloaded';
}
