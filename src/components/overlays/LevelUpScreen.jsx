import React from 'react';
import { getG, getLevelChoices, pickLevelChoice, rerollLevelup, snoozePersonaIntro, choosePersonaFree } from '../../game/core.js';
import { SUB_ICONS, ACTIVE_ICONS, WPN_ICONS } from '../icons.js';

/* v2.4 人设头像（portrait_<persona>.png，AI 生成切片） */
const PORTRAITS = {};
for (const [path, url] of Object.entries(import.meta.glob('../../assets/generated/portrait_*.png', { eager: true, import: 'default' }))) {
  PORTRAITS[path.split('/').pop().replace('.png', '').replace(/^portrait_/, '')] = url;
}

export default function LevelUpScreen() {
  const G = getG();
  const pl = G.player;
  const choices = getLevelChoices();
  const isPersonaIntro = choices.some(s => s.personaIntro);
  const isMilestone = choices.some(s => s.kind === 'milestone');
  const choiceLabel = isPersonaIntro ? `${choices.length}选一` : isMilestone ? '晋升特批 · 三选一' : '三选一';
  const subtitle = isPersonaIntro
    ? '恭喜升职！请选择一项"个人发展方向"（选错概不负责）'
    : isMilestone
      ? '人设成长达标，本次升级额外批一项晋升权益，选完继续领普通奖励。'
      : '恭喜升职！请选择一项"个人发展方向"（选错概不负责）';

  return (
    <div className="overlay">
      <div className="overlay-body">
        <div className="paper">
          <div className="doc-no">内部晋升 · 第 {pl.level} 级 · {choiceLabel}，过时不候</div>
          <h2>晋升审批单</h2>
          <div className="sub">{subtitle}</div>
          {/* 人设 5 选 1 / 里程碑 PROMO 是确定性卡组，重抽只会原样重建，白烧一次次数——隐藏 */}
          {G.rerollCredits > 0 && !isPersonaIntro && !isMilestone && (
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={rerollLevelup}>
              🔄 简历刷新：免费重抽（剩 {G.rerollCredits} 次）
            </button>
          )}
          {isPersonaIntro && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn ghost" onClick={choosePersonaFree}>
                🎲 纯随机流：不要人设，整到啥用啥（本局生效）
              </button>
              <button className="btn ghost" onClick={snoozePersonaIntro}>
                🫥 先不站队（这次看普通卡，下次再问）
              </button>
            </div>
          )}
          <div id="levelup-cards">
            {choices.map((s, i) => (
              <div className={'skill-card' + (s.rare ? ' rare' : s.kind === 'sub' ? ' sub' : s.kind === 'active' ? ' act' : '')}
                key={s.kind + s.id + (s.milestoneLevel || '')} tabIndex={0}
                onClick={() => pickLevelChoice(i)}
                onKeyDown={e => e.key === 'Enter' && pickLevelChoice(i)}>
                <div className="k-no">{s.personaIntro ? 'PERSONA' : s.kind === 'milestone' ? 'PROMO' : s.kind === 'sub' ? 'GEAR' : s.kind === 'active' ? 'ACTIVE' : 'SKILL'}-{String(s.id).toUpperCase().slice(0, 12)}</div>
                {s.kind === 'skill' && pl.skills[s.id] ? <div className="k-stack">已持有 {pl.skills[s.id]}/{s.max}</div> : null}
                {s.persona && PORTRAITS[s.persona] && (
                  <img src={PORTRAITS[s.persona]} alt="" style={{ width: 34, height: 34, imageRendering: 'pixelated', float: 'right', marginLeft: 6 }} />
                )}
                {/* v2.7 副武器/主动技能像素图标（缺图回退 emoji 前缀） */}
                {s.kind === 'sub' && SUB_ICONS[s.id] && (
                  <img src={SUB_ICONS[s.id]} alt="" style={{ width: 30, height: 30, imageRendering: 'pixelated', float: 'right', marginLeft: 6 }} />
                )}
                {s.kind === 'active' && ACTIVE_ICONS[s.id] && (
                  <img src={ACTIVE_ICONS[s.id]} alt="" style={{ width: 30, height: 30, imageRendering: 'pixelated', float: 'right', marginLeft: 6 }} />
                )}
                {/* v3.2 武器卡图标（wpn_new 用卡面滚的武器 wid；wpn_up 用对应槽武器 id） */}
                {(s.kind === 'wpn_new' || s.kind === 'wpn_up') && (() => {
                  const wid = s.wid || (s.slotKey && pl[s.slotKey] && pl[s.slotKey].id);
                  return wid && WPN_ICONS[wid]
                    ? <img src={WPN_ICONS[wid]} alt="" style={{ width: 30, height: 30, imageRendering: 'pixelated', float: 'right', marginLeft: 6 }} />
                    : null;
                })()}
                <div className="k-name">{s.rare ? '✨ ' : s.kind === 'sub' ? '🔧 ' : s.kind === 'active' ? '⚡ ' : ''}{s.name}</div>
                <div className="k-eff">{s.eff}</div>
                {s.rare && <div className="k-eff" style={{ color: '#c9a227' }}>★ 精修版：效果双倍</div>}
                <div className="k-tag">{s.tag}</div>
                <div className="k-key">{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
