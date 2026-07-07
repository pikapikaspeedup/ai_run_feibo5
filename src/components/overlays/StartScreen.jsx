import React, { useRef, useEffect, useState, useMemo } from 'react';
import { WEAPONS, LEGENDS, RECIPES } from '../../game/data/weapons.js';
import { TECH, ELITES, DISTILLS } from '../../game/data/tech.js';
import { SUBS } from '../../game/data/subweapons.js';
import { ACTIVES } from '../../game/data/actives.js';
import { COPY } from '../../game/data/copy.js';
import { chipSprite } from '../../game/sprites.js';
import { IS_TOUCH } from '../../game/input.js';
import { startGame, loadBest } from '../../game/core.js';
import { pick } from '../../game/utils.js';
import workerNative from '../../assets/worker_native.png';

function DexIcon({ color }) {
  const ref = useRef(null);
  useEffect(() => {
    const g = ref.current.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(chipSprite(color), 0, 0);
  }, [color]);
  return <canvas ref={ref} width={9} height={8} />;
}

/* 移动端进场：借用户点击手势请求全屏 + 锁横屏（iOS 不支持则静默跳过，靠 PWA 安装获得全屏） */
function enterGame() {
  if (IS_TOUCH && !document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'))
      .catch(() => {});
  }
  startGame();
}

const IS_STANDALONE = typeof matchMedia !== 'undefined' &&
  (matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true);

export default function StartScreen() {
  const [dexOpen, setDexOpen] = useState(false);
  const [trial, setTrial] = useState(() => {
    try { const v = parseInt(localStorage.getItem('niuma_trial') ?? '3', 10); return isNaN(v) ? 3 : Math.min(6, Math.max(0, v)); }
    catch (e) { return 3; }
  });
  const pickTrial = m => {
    setTrial(m);
    try { localStorage.setItem('niuma_trial', String(m)); } catch (e) { /* ignore */ }
  };
  /* v2.8.1 公司规模：20 人小作坊 / 50 人大厂（bot 数 19/49） */
  const [botN, setBotN] = useState(() => {
    try { return parseInt(localStorage.getItem('niuma_botcount') || '19', 10) || 19; } catch (e) { return 19; }
  });
  const pickBotN = n => {
    setBotN(n);
    try { localStorage.setItem('niuma_botcount', String(n)); } catch (e) { /* ignore */ }
  };
  const tip = useMemo(() => pick(COPY.tips), []);
  const best = useMemo(() => loadBest(), []);
  const wRows = country => Object.entries(WEAPONS).filter(([, d]) => d.country === country);

  return (
    <div className="overlay">
      <div className="overlay-body">
        <div className="paper">
          <div className="doc-no">牛马发〔2026〕07号 · 全员必读 · 阅后即卷</div>
          {!dexOpen && <div className="art-worker" style={{ backgroundImage: `url(${workerNative})` }} />}
          <h1>{COPY.title}</h1>
          <div className="sub">{COPY.subtitle}</div>
          <div className="stamp">人事部<br />特批</div>
          <hr />
          <p>{COPY.intro}</p>
          <hr />
          {IS_TOUCH ? (
            <>
              <div className="kbd-row">
                <span><kbd>左半屏拖动</kbd> 移动</span><span><kbd>自动</kbd> 瞄准并开火</span>
                <span><kbd>右下技能盘</kbd> 冲刺 / Q / E / 换枪融合</span><span><kbd>⏸</kbd> 暂停</span>
              </div>
              {!IS_STANDALONE && (
                <div className="tip-line" style={{ color: '#8a8271' }}>
                  📲 浏览器菜单选「添加到主屏幕」安装后，全屏无地址栏，体验拉满。
                </div>
              )}
            </>
          ) : (
            <div className="kbd-row">
              <span><kbd>WASD</kbd> 移动</span><span><kbd>鼠标</kbd> 瞄准 / 按住开火</span>
              <span><kbd>T</kbd> 自动开火/全托管（触控板党救星）</span>
              <span><kbd>Q</kbd> 战术技能</span>
              <span><kbd>E</kbd> 大招（悬停芯片时=换武器）</span><span><kbd>F</kbd> 融合</span>
              <span><kbd>Shift</kbd> 冲刺（需技能）</span><span><kbd>ESC</kbd> 暂停</span>
            </div>
          )}
          {best && (
            <div className="tip-line" style={{ color: '#8a8271' }}>
              历史最佳：第 <b>{best.rank}</b> 名 · 优化 {best.kills} 人 —— 还能更卷。
            </div>
          )}
          <div className="trial-row">
            <span className="trial-label">试用期（每月一波琐事 + 月度考核 Boss，期间同事互不伤害）：</span>
            {[0, 1, 2, 3, 4, 5, 6].map(m => (
              <button key={m} className={'trial-btn' + (trial === m ? ' on' : '')} onClick={() => pickTrial(m)}>
                {m === 0 ? '免' : m}
              </button>
            ))}
            <span className="trial-note">
              {trial === 0 ? '空降老兵，直接开卷（硬核）'
                : trial <= 2 ? `${trial} 个月发育期（快节奏）`
                : trial <= 4 ? `${trial} 个月发育期（标准）`
                : `${trial} 个月发育期（充分发育，后期琐事凶猛；缩圈相应提前）`}
            </span>
          </div>
          <div className="trial-row">
            <span className="trial-label">公司规模（同层对手数量）：</span>
            <button className={'trial-btn' + (botN === 19 ? ' on' : '')} onClick={() => pickBotN(19)} style={{ width: 'auto', padding: '0 8px' }}>20 人小作坊</button>
            <button className={'trial-btn' + (botN === 49 ? ' on' : '')} onClick={() => pickBotN(49)} style={{ width: 'auto', padding: '0 8px' }}>50 人大厂</button>
            <span className="trial-note">{botN === 49 ? '49 个对手同层竞争，人挤人，刺激加倍' : '19 个对手，经典节奏'}</span>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={enterGame}>签到进场</button>
            <button className="btn ghost" onClick={() => setDexOpen(o => !o)}>武器图鉴 {dexOpen ? '▴' : '▾'}</button>
            <a className="btn ghost" href="https://github.com/pikapikaspeedup/ai_run_feibo5"
              target="_blank" rel="noopener noreferrer">★ GitHub 开源仓库</a>
          </div>
          {dexOpen && (
            <div id="dex">
              <div className="dex-sec">— 国产队 —</div>
              {wRows('CN').map(([id, d]) => (
                <div className="dex-row" key={id}>
                  <DexIcon color={d.color} /><span className="d-name d-cn">{d.name}</span><span className="d-pat">{d.pat}</span>
                </div>
              ))}
              <div className="dex-sec">— 硅谷队 —</div>
              {wRows('US').map(([id, d]) => (
                <div className="dex-row" key={id}>
                  <DexIcon color={d.color} /><span className="d-name d-us">{d.name}</span><span className="d-pat">{d.pat}</span>
                </div>
              ))}
              <div className="dex-sec">— 传说融合 —</div>
              {RECIPES.map(([a, b, leg]) => (
                <div className="dex-row" key={leg}>
                  <DexIcon color={LEGENDS[leg].color} />
                  <span className="d-name" style={{ color: 'var(--stamp)' }}>{LEGENDS[leg].name}</span>
                  <span className="d-pat">{WEAPONS[a].name} 满级 + {WEAPONS[b].name} 芯片 · {LEGENDS[leg].pat}</span>
                </div>
              ))}
              <div className="dex-sec">— 技术模组（随机 标准/Pro/Ultra 品级，踩上自动装备）—</div>
              {Object.values(TECH).map(t => (
                <div className="dex-row" key={t.name}>
                  <span className="d-name" style={{ color: t.color === '#ffffff' || t.color === '#e8e4d8' ? '#6b6455' : t.color }}>{t.name}</span>
                  <span className="d-pat">{t.desc} —— {t.tag}</span>
                </div>
              ))}
              <div className="dex-sec">— 副武器·办公室兵器（升级抽蓝卡，初始 3 件，转正/缩圈后 4 件，自动索敌）—</div>
              {Object.values(SUBS).map(s => (
                <div className="dex-row" key={s.name}>
                  <span className="d-name" style={{ color: '#2c6cd8' }}>{s.name}</span>
                  <span className="d-pat">{s.eff[0]} —— {s.tag}</span>
                </div>
              ))}
              <div className="dex-sec">— 主动技能（升级抽紫卡，Q 战术 + E 大招双槽）—</div>
              {Object.values(ACTIVES).map(a => (
                <div className="dex-row" key={a.name}>
                  <span className="d-name" style={{ color: '#8a3fd0' }}>{a.name}</span>
                  <span className="d-pat">{a.eff[0]} —— {a.tag}</span>
                </div>
              ))}
              <div className="dex-sec">— 蒸馏池（「大模型蒸馏」随机获得其一）—</div>
              {Object.values(DISTILLS).map(d => (
                <div className="dex-row" key={d.name}>
                  <span className="d-name" style={{ color: '#b665ff' }}>{d.name}</span>
                  <span className="d-pat">来自 {d.src} —— {d.desc}</span>
                </div>
              ))}
              <div className="dex-sec">— 精英野怪（击杀必掉模组）—</div>
              {Object.entries(ELITES).filter(([, e]) => e.tier === 1).map(([id, e]) => (
                <div className="dex-row" key={id}>
                  <span className="d-name" style={{ color: '#c58fff' }}>{e.name}</span>
                  <span className="d-pat">{e.dex}</span>
                </div>
              ))}
              <div className="dex-sec">— 职场怪物·小 Boss（稀有，掉双倍模组+补给）—</div>
              {Object.entries(ELITES).filter(([, e]) => e.tier === 2).map(([id, e]) => (
                <div className="dex-row" key={id}>
                  <span className="d-name" style={{ color: '#ff9440' }}>{e.name}</span>
                  <span className="d-pat">{e.dex}</span>
                </div>
              ))}
            </div>
          )}
          <div className="tip-line">{tip}</div>
        </div>
      </div>
    </div>
  );
}
