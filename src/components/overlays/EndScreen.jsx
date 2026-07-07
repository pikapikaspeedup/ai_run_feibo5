import React, { useMemo, useState } from 'react';
import { TUNE } from '../../game/constants.js';
import { fmtTime, randi, pick } from '../../game/utils.js';
import { COPY } from '../../game/data/copy.js';
import { getG, startGame, backToMenu } from '../../game/core.js';
import { buildReport, shareCard, renderShareCard } from '../../game/sharecard.js';
import bossNative from '../../assets/boss_native.png';

export default function EndScreen({ win }) {
  const G = getG();
  const pl = G.player;
  const docNo = useMemo(() => randi(10000, 99999), []);
  const quote = win ? (G.winLine || pick(COPY.winLines)) : G.deathLine;
  /* v2.8.1 牛马人格判定（分享卡数据同源）；v2.8.2 可换版式预览 */
  const report = useMemo(() => { try { return buildReport(G); } catch (e) { return null; } }, [G]);
  const [shareState, setShareState] = useState('');
  const [cardUrl, setCardUrl] = useState(null);
  const [cardObj, setCardObj] = useState(null);
  const rerollCard = () => {
    try {
      const c = renderShareCard(G);
      setCardObj(c);
      setCardUrl(c.canvas.toDataURL('image/png'));
    } catch (e) { /* ignore */ }
  };
  const doShare = async () => {
    setShareState('生成中…');
    try {
      const r = await shareCard(G, cardObj);
      setShareState(r === 'shared' ? '已分享！' : r === 'downloaded' ? '已保存图片+复制文案' : '');
    } catch (e) { setShareState('生成失败'); }
  };

  return (
    <div className="overlay">
      <div className="overlay-body">
        <div className="paper">
          {win ? (
            <>
              <div className="doc-no">表彰文件 · 抄送全体（已离职）成员</div>
              <h2>优秀员工证书</h2>
              <div className="stamp" style={{ borderColor: '#c9a227', color: '#c9a227' }}>年度<br />卷王</div>
              <div className="sub">在本季度大逃杀中表现"卓越"，特发此证，以资鼓励。</div>
            </>
          ) : (
            <>
              <div className="doc-no">编号 HR-{docNo} · 即日生效</div>
              <h2>离 职 证 明</h2>
              <div className="stamp">已优化</div>
              <div className="sub">兹证明该牛马已完成本轮大逃杀的全部流程。</div>
            </>
          )}
          <hr />
          {/* v2.8.3 双主角大数字：排名 + 优化同事（击杀是这局的故事，武器/模组是库存不上桌） */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36, alignItems: 'flex-end', margin: '6px 0 2px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="rank-big" style={{ margin: 0 }}>#{win ? 1 : G.playerRank}<small> / {(G.botCount || 19) + 1}</small></div>
              <div style={{ fontSize: 11, color: '#8a8271', letterSpacing: 2 }}>最终排名</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="rank-big" style={{ margin: 0, color: '#d43a2f' }}>✂️{G.kills}<small> 人</small></div>
              <div style={{ fontSize: 11, color: '#8a8271', letterSpacing: 2 }}>优化同事</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#6b6455', marginBottom: 8 }}>
            为公司节省年薪 <b style={{ color: '#d43a2f' }}>¥{(G.kills * 8.5).toFixed(0)} 万</b> · 本次工龄 {fmtTime(G.t)} · 职级 LV.{pl.level}
          </div>
          <table className="stat-table"><tbody>
            {/* v2.8 付费上班结算彩蛋 */}
            <tr><td>本局账单</td><td style={{ fontSize: 11 }}>通勤+工作餐 -{200 + pl.level * 10} · 窝囊费 +{200 + pl.level * 10} · 净赚 0（白干）</td></tr>
          </tbody></table>
          {!win && G.deathInfo && (
            <div className="quote" style={{ borderLeftColor: 'var(--danger)' }}>
              致命一击：被 {G.deathInfo.killer}{G.deathInfo.weapon ? ` 用 ${G.deathInfo.weapon}` : ''} 优化。
              {G.deathInfo.remaining > 0 && G.deathInfo.remaining <= 3 ? ` 距离吃鸡只差 ${G.deathInfo.remaining} 人！` : ''}
              {G.deathInfo.bossPct != null && G.deathInfo.bossPct <= 40 ? ` 老板只剩 ${G.deathInfo.bossPct}% 血了！` : ''}
            </div>
          )}
          <div className="quote">{quote}</div>
          {/* v2.8.1 牛马人格判定 + 病毒句 */}
          {report && (
            <div className="quote" style={{ borderLeftColor: report.persona.color }}>
              本局人格鉴定：<b style={{ color: report.persona.color === '#dfe6f2' ? '#4a443a' : report.persona.color }}>「{report.persona.title}」</b>
              —— {report.persona.verdict}
              {report.stamp && <span style={{ color: '#d43a2f' }}>　🏅 亲历【{report.stamp.name}】（仅 {report.stamp.pct} 玩家见过）</span>}
            </div>
          )}
          {G.newBest && <div className="stamp newbest">新纪录<br />NEW</div>}
          {win && <div className="art-boss" style={{ backgroundImage: `url(${bossNative})` }} />}
          {/* v2.8.2 分享卡预览 + 换版式 */}
          {cardUrl && (
            <div style={{ textAlign: 'center', margin: '10px 0 4px' }}>
              <img src={cardUrl} alt="分享卡" style={{ width: 180, imageRendering: 'auto', border: '2px solid #14161d', boxShadow: '4px 4px 0 rgba(0,0,0,.35)' }} />
            </div>
          )}
          <div className="btn-row">
            <button className="btn" onClick={doShare} style={{ background: '#ffcf33' }}>
              📤 {shareState || '把这份考核发到群里'}
            </button>
            <button className="btn ghost" onClick={rerollCard}>{cardUrl ? '🎲 换个版式' : '👀 预览考核卡'}</button>
            <button className="btn ghost" onClick={startGame}>{win ? '再上一天班' : '重新入职'}</button>
            <button className="btn ghost" onClick={backToMenu}>回到大厅</button>
          </div>
        </div>
      </div>
    </div>
  );
}
