import React, { useRef, useEffect } from 'react';
import { touch, IS_TOUCH, registerJoyEl } from '../game/input.js';
import { getG, getState, playerDash, playerSwap, playerFuse, togglePause, castActive } from '../game/core.js';
import { ACTIVES } from '../game/data/actives.js';
import { findRecipe } from '../game/data/weapons.js';

/* MOBA 式技能键：冷却用 conic-gradient 扫盘遮罩 + 秒数，就绪时高亮呼吸 */
function SkillBtn({ id, cls = '', cd = 0, total = 0, onPress, children, sub }) {
  const pct = total > 0 ? Math.max(0, Math.min(1, cd / total)) : 0;
  const press = e => {
    e.preventDefault();
    if (cd > 0) return;
    if (navigator.vibrate) navigator.vibrate(12);
    onPress();
  };
  return (
    <div className={`tbtn ${cls}${cd > 0 ? ' cd' : ''}`} id={id} style={{ display: 'flex' }} onTouchStart={press}>
      <div className="t-inner">
        {children}
        {sub && <span className="t-sub">{sub}</span>}
      </div>
      {pct > 0 && (
        <div className="t-cdmask" style={{ background: `conic-gradient(rgba(6,8,12,.82) ${pct * 360}deg, transparent 0deg)` }} />
      )}
      {cd > 0 && <span className="t-cdnum">{cd < 9.5 ? cd.toFixed(1) : Math.ceil(cd)}</span>}
    </div>
  );
}

export default function TouchControls() {
  const joyRef = useRef(null);
  useEffect(() => { registerJoyEl(joyRef.current); }, []);

  const G = getG();
  const state = getState();
  /* 真触屏设备开局即显示技能盘（老逻辑要先摸一下屏幕才出现） */
  const show = (IS_TOUCH || touch.using) && state === 'playing' && G;
  const pl = G && G.player;
  const hc = G && G.hoverChip;
  const canFuse = show && hc && pl.alive && !pl.weapon.leg && pl.weapon.lvl >= 5 && findRecipe(pl.weapon.id, hc.id);

  const aq = pl && (pl.activeQ || pl.active);
  const aqCd = pl ? (pl.activeQCd > 0 ? pl.activeQCd : pl.activeCd) : 0;
  const aqTotal = aq ? (ACTIVES[aq.id].cd[(aq.lv || 1) - 1] || 10) : 0;
  const ae = pl && pl.activeE;
  const aeTotal = ae ? (ACTIVES[ae.id].cd[(ae.lv || 1) - 1] || 20) : 0;

  return (
    <>
      {show && (
        <div id="touch-ui">
          <div className="tbtn" id="btn-pause-m" onTouchStart={e => { e.preventDefault(); togglePause(); }}>⏸</div>

          {/* 主位：冲刺（走位核心，MOBA 右下角大键） */}
          {pl && pl.mods.dashCd > 0 && (
            <SkillBtn id="btn-dash-m" cd={pl.dashT} total={pl.mods.dashCd}
              onPress={() => state === 'playing' && playerDash()}>⚡<span className="t-name">冲刺</span></SkillBtn>
          )}

          {/* Q 战术：主键左侧弧位 */}
          {aq && (
            <SkillBtn id="btn-active-m" cd={aqCd} total={aqTotal}
              onPress={() => state === 'playing' && castActive()}>
              <span className="t-name">{ACTIVES[aq.id].name.slice(0, 4)}</span><span className="t-key">Q</span>
            </SkillBtn>
          )}

          {/* E 大招：主键上方弧位 */}
          {ae && (
            <SkillBtn id="btn-active-e-m" cd={pl.activeECd} total={aeTotal}
              onPress={() => state === 'playing' && castActive('e')}>
              <span className="t-name">{ACTIVES[ae.id].name.slice(0, 4)}</span><span className="t-key">E</span>
            </SkillBtn>
          )}

          {/* 情境键：换枪 / 融合（踩到芯片才浮现） */}
          {hc && pl.alive && (
            <SkillBtn id="btn-interact-m" cls={canFuse ? 'fuse' : ''} cd={0} total={0}
              onPress={() => (canFuse ? playerFuse() : playerSwap())}>
              {canFuse ? '融合!' : '换枪'}
            </SkillBtn>
          )}
        </div>
      )}
      <div id="joy" ref={joyRef}>
        <div className="base" />
        <div className="knob" />
      </div>
    </>
  );
}
