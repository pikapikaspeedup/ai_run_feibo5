# 怪物/素材 AI 出图管线 · 2026-07-06

游戏已支持「PNG 丢进目录即生效」的高清贴图覆盖，不用改任何代码。

## 用法

1. 用任意生图工具（即梦 / Midjourney / DALL·E / gpt-image-1 / Stable Diffusion……）按下方规格生成 PNG。
2. 文件命名为 `mob_<key>.png`，放进 `src/assets/generated/`。
3. 可选：再放一张 `mob_<key>_b.png` 作为第二帧，游戏会自动做 6fps 双帧动画。
4. 刷新页面即生效；没有 PNG 的怪自动回退到内置像素画（零开销）。

家具贴图沿用同目录既有命名（`desk.png`、`desk_damage_0..3.png` 等 4 态破损），工人/Boss 精灵表规格见 `src/assets/manifest.json`。

## 出图规格（怪物）

- **尺寸**：32×32 或 48×48，透明背景 PNG（游戏内归一化到约 18px 高，剪影必须粗壮清晰）
- **视角**：俯视 3/4（top-down 3/4），**朝右**站立（游戏靠水平翻转做朝向）
- **风格**：1px 深色描边（#14161d），扁平像素风，2~3 个主色 + 1 高光；脚底居中、底部留 2px
- **调色板锚点**（与全游戏统一，见 manifest.json）：纸白 #f2efe6 / 工牌黄 #ffcf33 / 裁员红 #ff4f4f / 屏幕青 #38b6d9 / 紫 #b665ff / 灰蓝 #454e63

**通用提示词模板（英文效果最好）**：
```
pixel art game sprite, 32x32, top-down 3/4 view, facing right, single character,
1px dark outline (#14161d), flat shading, transparent background, office satire theme,
crisp silhouette readable at 50% size, no anti-aliasing, no drop shadow
Subject: <见下表>
```

## 全部怪物 key 与出图主题

| key | 名称 | Subject 提示词 |
|---|---|---|
| mob_email | 未读邮件 | white envelope creature with a red unread-dot, tiny stub feet |
| mob_urgent_email | 加急邮件 | red envelope creature with bold exclamation mark, angry |
| mob_sticky | 待办便利贴 | yellow sticky note monster with curled corner and scribbles |
| mob_cr | 需求变更单 | white document with red revision marks, splitting in half |
| mob_ccbomb | 抄送轰炸 | envelope strapped to a small round bomb with lit fuse, @ symbol |
| mob_readreply | 已读不回 | gray chat bubble ghost with two blue check marks, hollow eyes |
| mob_wheel | 重复造轮子任务 | wooden wheel / gear creature with a blue shield arc |
| mob_meeting | 会议邀请 | calendar page monster with red clock, glitchy teleport vibe |
| mob_recall | 已发送-撤回中 | translucent chat bubble with recall arrow circling it |
| mob_urgent | 加急会议提醒 | red alarm bell with radiating warning ring |
| mob_army | 临时工外包大军 | tiny worker with oversized badge lanyard, swarm unit |
| mob_rework | 深夜返工提醒 | crescent-moon notification with bloodshot eye, feral |
| mob_hunter | KPI 追杀者 | hound-shaped arrow chart, sprinting, menacing |
| mob_ghostreply | 已读不回·终极形态 | pale ghost of a chat bubble, wispy, near-white |
| mob_reviewboard | 需求评审会 | meeting table totem with standing placard, aura lines |
| mob_lamp | 深夜加班灯 | desk lamp with light cone, static hazard |
| mob_deadline | 死线警报 | siren beacon with red fan blades, stationary |
| mob_phishing | 钓鱼邮件 | envelope dangling from a fishing hook, sly |
| mob_balloon | KPI 气球（新） | swollen red balloon with "KPI" feel and a thin string, about to pop |
| mob_wolf | 狼性文化训练生（新） | gray-blue suit trainee with wolf-ear headband, lunging pose |
| mob_hrintern | HR 实习生（新） | pink-badge intern with walkie-talkie, calling for backup |
| mob_snail | 加班蜗牛（新） | snail carrying a glowing monitor as its shell, slime trail |
| mob_blackhole | 全员会议黑洞（新） | purple-black swirling vortex sucking in calendar shreds |
| mob_thief | 工资小偷（新） | masked imp biting a gold coin, sneaky run |
| mob_pua | PUA 大师（新） | smug mouth with golden halo of a giant painted pie (huabing) |

## 帧动画（pixel-animation-grid 流程）

- **状态（2026-07-06）**：全部 25 只怪已各有 **9 帧动画**（`mob_<key>_f0..f8.png`，225 帧，128×128 透明底）✅。
- 生成流程（两阶段，见 `~/.codex/skills/pixel-animation-grid/SKILL.md`）：
  1. Phase 1：`codex exec --dangerously-bypass-approvals-and-sandbox "Follow ~/.codex/skills/pixel-animation-grid/SKILL.md Phase 1 ONLY ... 3x3 GRID ... save RAW to src/assets/generated/frame_tests/<key>_anim_3x3_raw.png"`——每只按运动特征给循环类型（走路/奔跑/悬浮/旋转/待机脉冲），绿色主体的怪（如蜗牛）改用 #ff00ff 品红幕。
  2. Phase 2：`bash slice_anim.sh <key> <raw> 3`（脚本已修正 SKILL 示例中 1024÷3 除不尽产生空白细条瓦片的坑：先缩放到 1023 再切）。
- 引擎帧选择（render.js）：`mob_<key>_f0..fN.png` 自动识别为帧序列；帧率 = 走路里程 + 慢速全局钟（静止怪保持待机动画），单位间相位错开；回退链 帧序列 > `_b` 双帧 > 单帧 > 字符画。

## 说明

- **状态（2026-07-06）**：上表 25 张单帧已全部用本机 `codex exec`（imageGen）生成并实机验收 ✅（现作为帧动画的兜底层）。内置字符画作为最终回退层保留（sprites.js）。
- 生成命令模板（无头驱动 Codex，铁律：只允许新增 `src/assets/generated/mob_*.png`）：
  `codex exec "按 dcos/art-pipeline.md 规格表为 <key 列表> 各生成一张 PNG，保存到 src/assets/generated/<key>.png，只新增这些文件，禁止碰其他任何文件"`
- 想要双帧动画：同一命令生成 `mob_<key>_b.png`（第二帧姿势微变），游戏自动 6fps 切换。
- 对某张不满意：删掉该 PNG 重跑上面命令（或临时回退字符画）。
