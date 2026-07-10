/* v2.7 素材第五轮：副武器/主动技能像素图标（AI 生成 4×4 库图切片）
 * 命名约定：sub_<id>.png / active_<id>.png——切片脚本按 SUBS/ACTIVES 键名语义重命名。
 * 缺图时组件应回退到原 emoji/文字，不做硬依赖。 */
export const SUB_ICONS = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/generated/sub_*.png', { eager: true, import: 'default' }))) {
  SUB_ICONS[path.split('/').pop().replace('.png', '').replace(/^sub_/, '')] = url;
}
export const ACTIVE_ICONS = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/generated/active_*.png', { eager: true, import: 'default' }))) {
  ACTIVE_ICONS[path.split('/').pop().replace('.png', '').replace(/^active_/, '')] = url;
}
/* v3.2 武器芯片图标（chip_<武器id>.png）：升级卡「武器升级/新武器上岗」+ 图鉴共用 */
export const WPN_ICONS = {};
for (const [path, url] of Object.entries(import.meta.glob('../assets/generated/chip_*.png', { eager: true, import: 'default' }))) {
  WPN_ICONS[path.split('/').pop().replace('.png', '').replace(/^chip_/, '')] = url;
}
