import React, { useMemo } from 'react';
import { COPY } from '../../game/data/copy.js';
import { shuffle } from '../../game/utils.js';
import { getG, startGame, togglePause, wpnName, maxHp } from '../../game/core.js';
import { isMuted, toggleMuted } from '../../game/audio.js';
import { SKILLS } from '../../game/data/skills.js';
import { SUBS } from '../../game/data/subweapons.js';
import { ACTIVES } from '../../game/data/actives.js';
import { TECH, DISTILLS, CURSES } from '../../game/data/tech.js';
import { EVOLUTIONS } from '../../game/data/evolutions.js';
import { milestoneLabel } from '../../game/data/milestones.js';
import * as bridge from '../../game/bridge.js';
import { SUB_ICONS, ACTIVE_ICONS } from '../icons.js';

/* v2.4 人设头像 */
const PORTRAITS = {};
for (const [path, url] of Object.entries(import.meta.glob('../../assets/generated/portrait_*.png', { eager: true, import: 'default' }))) {
  PORTRAITS[path.split('/').pop().replace('.png', '').replace(/^portrait_/, '')] = url;
}

const RARITY_COLOR = { 白: '#f2efe6', 绿: '#7ee08a', 蓝: '#7ac8ff', 紫: '#b665ff', 橙: '#ff9440' };
const PERSONA_NAMES = { optimizer: '首席降本增效官', slacker: '摸鱼表演艺术家', rlhf: '人肉 RLHF 训练员', revival: '万年活人矿·二次入职', opc: '一人公司 OPC', hrbp: 'HRBP·编外人力伙伴', reporter: 'PPT 路演大师' };

function skillById(id) { return SKILLS.find(s => s.id === id); }

function PanelSection({ title, subtitle, children, count }) {
  return (
    <div className="pause-panel-section">
      <div className="pause-panel-header">
        <span>{title}</span>
        {count !== undefined && <span className="pause-panel-count">{count}</span>}
      </div>
      {subtitle && <div className="pause-panel-subtitle">{subtitle}</div>}
      <div className="pause-panel-body">{children}</div>
    </div>
  );
}

export default function PauseScreen() {
  const tips = useMemo(() => shuffle(COPY.tips).slice(0, 2), []);
  const G = getG();
  const pl = G && G.player;
  if (!pl) return null;

  const skillList = Object.entries(pl.skills || {})
    .map(([id, lv]) => ({ id, lv, def: skillById(id) }))
    .filter(x => x.def);
  const rarityOrder = { 橙: 0, 紫: 1, 蓝: 2, 绿: 3, 白: 4, undefined: 5 };
  skillList.sort((a, b) => (rarityOrder[a.def.rarity] ?? 5) - (rarityOrder[b.def.rarity] ?? 5));

  const subList = Object.entries(pl.subs || {})
    .map(([id, s]) => ({ id, lv: s.lv, def: SUBS[id] }))
    .filter(x => x.def);
  const activeQData = (pl.activeQ || pl.active)
    ? { id: (pl.activeQ || pl.active).id, lv: (pl.activeQ || pl.active).lv, def: ACTIVES[(pl.activeQ || pl.active).id], cd: pl.activeQCd > 0 ? pl.activeQCd : pl.activeCd }
    : null;
  const activeEData = pl.activeE ? { id: pl.activeE.id, lv: pl.activeE.lv, def: ACTIVES[pl.activeE.id], cd: pl.activeECd } : null;
  const techList = Object.entries(pl.tech || {})
    .map(([id, count]) => ({ id, count, def: TECH[id] }))
    .filter(x => x.def);
  const distillList = Object.keys(pl.distills || {}).map(id => ({ id, def: DISTILLS[id] })).filter(x => x.def);
  const activeCurses = Object.entries(pl.curses || {})
    .filter(([, t]) => t > 0)
    .map(([id, t]) => ({ id, t, def: CURSES[id] }));
  const evolutionList = Object.keys(pl.evolved || {}).map(id => EVOLUTIONS.find(e => e.id === id)).filter(Boolean);
  const milestoneList = Object.entries(pl.milestones || {})
    .map(([level, id]) => ({ level: Number(level), id, name: milestoneLabel(id) }))
    .sort((a, b) => a.level - b.level);
  const activeProcs = (() => {
    const p = pl.mods && pl.mods.procs;
    if (!p) return { onHit: 0, onCrit: 0, onKill: 0, onHurt: 0 };
    return { onHit: p.onHit.length, onCrit: p.onCrit.length, onKill: p.onKill.length, onHurt: p.onHurt.length };
  })();
  const totalProcCount = activeProcs.onHit + activeProcs.onCrit + activeProcs.onKill + activeProcs.onHurt;

  const hp = Math.round(pl.hp);
  const hpMax = Math.round(maxHp(pl));
  const persona = pl.personaFree ? '自由人 · 纯随机流' : pl.persona ? PERSONA_NAMES[pl.persona] || pl.persona : '未锁定';

  return (
    <div className="overlay">
      <div className="overlay-body">
        <div className="paper pause-paper">
          <div className="doc-no">带薪休息申请 · 审批中 · 员工档案速览</div>
          <h2>带薪休息中</h2>
          <div className="sub">工位还在，人先缓缓。</div>
          <hr />

          <div className="pause-stat-row">
            <div><span className="stat-lbl">等级</span><span className="stat-val">Lv.{pl.level}</span></div>
            <div><span className="stat-lbl">生命</span><span className="stat-val">{hp}/{hpMax}</span></div>
            {pl.shield > 0 && (
              <div><span className="stat-lbl">护盾</span><span className="stat-val" style={{ color: '#6aa3ff' }}>{Math.round(pl.shield)}</span></div>
            )}
            <div><span className="stat-lbl">击杀</span><span className="stat-val">{pl.kills || 0}</span></div>
            <div><span className="stat-lbl">人设</span><span className="stat-val" style={{ color: pl.persona ? '#ffcf33' : '#8a8271' }}>
              {pl.persona && PORTRAITS[pl.persona] && <img src={PORTRAITS[pl.persona]} alt="" style={{ width: 20, height: 20, imageRendering: 'pixelated', verticalAlign: 'middle', marginRight: 5 }} />}
              {persona}</span></div>
          </div>

          <div className="pause-grid">
            {/* 武器 */}
            <PanelSection title="主武器">
              <div className="pause-weapon-line">
                {wpnName(pl)}
                {pl.weapon.leg && <span className="pause-badge" style={{ color: '#ffcf33', border: '1px solid #ffcf33' }}>传说</span>}
              </div>
            </PanelSection>

            <PanelSection
              title="副武器"
              count={`${subList.length}/${pl.subSlotCount || 3}`}
            >
              {subList.length === 0 && <div className="pause-empty">未装备</div>}
              {subList.map(s => (
                <div className="pause-item" key={s.id}>
                  <span className="pause-name">
                    {SUB_ICONS[s.id]
                      ? <img src={SUB_ICONS[s.id]} alt="" style={{ width: 16, height: 16, imageRendering: 'pixelated', verticalAlign: 'text-bottom', marginRight: 4 }} />
                      : '🔧 '}
                    {s.def.name}</span>
                  <span className="pause-lv">Lv.{s.lv}</span>
                </div>
              ))}
            </PanelSection>

            {/* Q 槽主动 */}
            <PanelSection title="Q 战术">
              {!activeQData && <div className="pause-empty">未装备（升级时抽紫卡）</div>}
              {activeQData && (
                <div className="pause-item">
                  <span className="pause-name">
                    {ACTIVE_ICONS[activeQData.id]
                      ? <img src={ACTIVE_ICONS[activeQData.id]} alt="" style={{ width: 16, height: 16, imageRendering: 'pixelated', verticalAlign: 'text-bottom', marginRight: 4 }} />
                      : '⚡ '}
                    {activeQData.def.name}</span>
                  <span className="pause-lv">Lv.{activeQData.lv}</span>
                  <span className="pause-cd" style={{ color: activeQData.cd > 0 ? '#ff6a6a' : '#7ee08a' }}>
                    {activeQData.cd > 0 ? `冷却 ${activeQData.cd.toFixed(1)}s` : '就绪'}
                  </span>
                </div>
              )}
            </PanelSection>

            {/* E 槽主动 */}
            <PanelSection title="E 大招">
              {!activeEData && <div className="pause-empty">未装备（升级时抽紫卡）</div>}
              {activeEData && (
                <div className="pause-item">
                  <span className="pause-name" style={{ color: '#ffcf33' }}>
                    {ACTIVE_ICONS[activeEData.id]
                      ? <img src={ACTIVE_ICONS[activeEData.id]} alt="" style={{ width: 16, height: 16, imageRendering: 'pixelated', verticalAlign: 'text-bottom', marginRight: 4 }} />
                      : '🌟 '}
                    {activeEData.def.name}</span>
                  <span className="pause-lv">Lv.{activeEData.lv}</span>
                  <span className="pause-cd" style={{ color: activeEData.cd > 0 ? '#ff6a6a' : '#7ee08a' }}>
                    {activeEData.cd > 0 ? `冷却 ${activeEData.cd.toFixed(1)}s` : '就绪'}
                  </span>
                </div>
              )}
            </PanelSection>

            {/* 觉醒 */}
            {evolutionList.length > 0 && (
              <PanelSection title="觉醒" count={evolutionList.length}>
                {evolutionList.map(e => (
                  <div className="pause-item" key={e.id}>
                    <span className="pause-name" style={{ color: '#ffcf33' }}>✨ {e.name}</span>
                  </div>
                ))}
              </PanelSection>
            )}

            {milestoneList.length > 0 && (
              <PanelSection title="晋升里程碑" count={milestoneList.length}>
                {milestoneList.map(m => (
                  <div className="pause-item" key={`${m.level}-${m.id}`}>
                    <span className="pause-name" style={{ color: '#ffcf33' }}>Lv.{m.level} {m.name}</span>
                  </div>
                ))}
              </PanelSection>
            )}

            {/* 被动技能 */}
            <PanelSection title="被动技能" count={skillList.length}>
              {skillList.length === 0 && <div className="pause-empty">还没点</div>}
              {skillList.map(({ id, lv, def }) => (
                <div className="pause-item" key={id}>
                  <span className="pause-rarity-dot" style={{ background: RARITY_COLOR[def.rarity] || '#f2efe6' }}></span>
                  <span className="pause-name">{def.name}</span>
                  <span className="pause-lv">{lv}/{def.max}</span>
                </div>
              ))}
            </PanelSection>

            {/* 技术模组 */}
            <PanelSection title="技术模组" count={techList.reduce((a, x) => a + x.count, 0)}>
              {techList.length === 0 && <div className="pause-empty">还没捡</div>}
              {techList.map(({ id, count, def }) => (
                <div className="pause-item" key={id}>
                  <span className="pause-rarity-dot" style={{ background: def.color }}></span>
                  <span className="pause-name">{def.name}</span>
                  {count > 1 && <span className="pause-lv">×{count}</span>}
                </div>
              ))}
            </PanelSection>

            {/* 蒸馏 */}
            {distillList.length > 0 && (
              <PanelSection title="蒸馏池" count={distillList.length}>
                {distillList.map(d => (
                  <div className="pause-item" key={d.id}>
                    <span className="pause-name" style={{ color: '#b665ff' }}>🧪 {d.def.name}</span>
                  </div>
                ))}
              </PanelSection>
            )}

            {/* 附魔/proc（若有）*/}
            {totalProcCount > 0 && (
              <PanelSection title="附魔/触发 (proc)" count={totalProcCount}>
                <div className="pause-item">
                  <span className="pause-name">命中触发</span>
                  <span className="pause-lv">{activeProcs.onHit}</span>
                </div>
                <div className="pause-item">
                  <span className="pause-name">暴击触发</span>
                  <span className="pause-lv">{activeProcs.onCrit}</span>
                </div>
                <div className="pause-item">
                  <span className="pause-name">击杀触发</span>
                  <span className="pause-lv">{activeProcs.onKill}</span>
                </div>
                <div className="pause-item">
                  <span className="pause-name">受伤触发</span>
                  <span className="pause-lv">{activeProcs.onHurt}</span>
                </div>
              </PanelSection>
            )}

            {/* 诅咒 */}
            {activeCurses.length > 0 && (
              <PanelSection title="当前诅咒" count={activeCurses.length}>
                {activeCurses.map(c => (
                  <div className="pause-item" key={c.id}>
                    <span className="pause-name" style={{ color: c.def.color }}>☠️ {c.def.name}</span>
                    <span className="pause-lv">{c.t.toFixed(1)}s</span>
                  </div>
                ))}
              </PanelSection>
            )}
          </div>

          {tips.map((t, i) => <div className="tip-line" key={i}>{t}</div>)}
          <div className="btn-row">
            <button className="btn" onClick={togglePause}>回去搬砖</button>
            <button className="btn ghost" onClick={startGame}>重开一局</button>
            <button className="btn ghost" onClick={() => { toggleMuted(); bridge.notify(); }}>
              {isMuted() ? '开声音' : '静音'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
