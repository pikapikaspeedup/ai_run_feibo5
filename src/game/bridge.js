/* =====================================================================
 * 游戏引擎 <-> React 桥接
 * - 事件：feed / warn / feed-clear（引擎发，React 订阅）
 * - 版本号订阅：引擎状态变化或节流 tick 时 bump，React 用
 *   useSyncExternalStore 感知后直接读引擎数据渲染
 * ===================================================================== */
const listeners = new Map();   // event -> Set<fn>
const versionSubs = new Set();
let version = 0;

/* 'warn' 兜底缓存：首局 startGame 发开场 HR 提示时 Hud（内含订阅 warn 的
 * ZoneWarn）还没挂载（menu 状态不渲染 Hud），事件无人接收会被丢弃。
 * emit 时若无订阅者则缓存最近一条 payload+时间戳；新订阅者到来且缓存
 * 未超过 3 秒时立即回放并标记已消费（已正常送达过的不缓存，避免重播）。 */
const WARN_REPLAY_MS = 3000;
let pendingWarn = null;   // { payload, at }

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  if (event === 'warn' && pendingWarn) {
    const { payload, at } = pendingWarn;
    pendingWarn = null;   // 无论是否超时都只消费一次
    if (Date.now() - at < WARN_REPLAY_MS) fn(payload);
  }
  return () => listeners.get(event).delete(fn);
}
export function emit(event, payload) {
  const set = listeners.get(event);
  if (event === 'warn') pendingWarn = (set && set.size) ? null : { payload, at: Date.now() };
  if (set) for (const fn of set) fn(payload);
}

export function subscribe(fn) {
  versionSubs.add(fn);
  return () => versionSubs.delete(fn);
}
export const getVersion = () => version;
export function notify() {
  version++;
  for (const fn of versionSubs) fn();
}
