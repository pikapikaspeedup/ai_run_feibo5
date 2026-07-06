import React from 'react';
import { getG, getLevelChoices, pickLevelChoice, rerollLevelup, snoozePersonaIntro } from '../../game/core.js';

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
              <button className="btn ghost" onClick={() => pickLevelChoice(Math.floor(Math.random() * choices.length))}>
                🎲 听天由命（随机分配人设）
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
