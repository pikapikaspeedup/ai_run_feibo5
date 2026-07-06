# Process

## 2026-07-05 - Game Review And Next Development

- Requested: review current game, choose the highest-priority next task from new system, balance tuning, more existing-content, or self-decided direction; then develop and test.
- Context read: absolute `/dcos/process.md` was unavailable because the root filesystem is read-only, so this project-local process file is used.
- Initial status: `agents.md` is untracked and contains the requested agent rules.
- Next steps: inspect game design/code, run the game, decide priority, implement, and verify.

### Review Decision

- Chosen priority: task 2, balance tuning so level-ups feel more rewarding.
- Reason: current game already has many systems and content layers (weapons, legendary fusion, skills, sub-weapons, active skills, elites, trial mobs, map events). The highest return is improving growth feedback and draft quality before adding more systems/content.

### Implemented

- Added baseline promotion rewards on every player level-up: small HP recovery and temporary shield.
- Increased level-up draft quality: gear/active soft pity triggers after 2 all-skill drafts instead of 3.
- Improved precision/rare skill behavior: rare cards only appear when they can actually double-apply, and milestone levels provide a steadier rare opportunity.
- Buffed fallback "茶水间补给" from 40 HP to 50 HP + 15 shield.
- Updated start-screen dex copy for the current 4th sub-weapon slot and Q/E active slots.

### Verification

- `npm run build` passed.
- Headless engine smoke passed: started a game, granted XP, entered `levelup`, confirmed HP/shield promotion rewards and 3 valid choices.
- Chrome headless screenshot passed: start screen rendered at `http://127.0.0.1:5173/` without blank canvas or obvious layout break.

## 2026-07-05 - Healing And Battle Royale Supplies

- Requested: keep the previous direction, but add more healing routes; touching/passing coffee machines should heal; battle royale supplies should be richer.
- Context read: this process file and current agent rules were read before development.

### Implemented

- Coffee machines now heal immediately on touch/near pass instead of requiring a 3s dwell.
- Each coffee machine has 4 servings and a 10s per-machine cooldown; the player has a short 0.8s coffee cooldown to prevent multi-machine same-frame consumption.
- Coffee heals 16 HP; overheal turns into a small 6 shield buffer.
- Initial item count increased from 16 to 20.
- Formal battle royale item spawns are denser: 9s interval and 18 item cap before the final circles.
- Final circles now keep low-frequency survival supplies instead of stopping all item restock.
- Formal battle royale supply rolls are weighted toward survival consumables.
- Delivery drops now include two consumables and a 35 HP heal pickup in addition to the existing chip and tech.

### Verification

- `npm run build` passed.
- Headless engine smoke passed: touching a coffee machine healed the player from 50 HP to 66 HP and consumed one coffee serving.
- Headless supply smoke passed: with `zone.phase = 3`, formal battle royale restock still generated survival supply.

## 2026-07-06 - Open Office Coffee Distribution And No Fire Rooms

- Requested: coffee machines should appear more often; current map no longer has a strong room concept; remove fire/danger rooms.
- Context read: this process file and current agent rules were read before development.

### Implemented

- Added coffee machines to every open-office template variant across cubicle islands, meeting islands, print corners, boss area, corridors, and existing break/supply points.
- Coffee is no longer concentrated in the former break-room concept; generated maps now have broadly distributed coffee points.
- Removed phase-based chunk closing from the zone update loop. Shrinking still works, but chunks no longer become red/damaging "closed rooms".
- Removed the closed-chunk damage tick and outdated "茶水间会关闭" tip.
- Renamed visible chunk labels away from strong room naming: e.g. `会议室` -> `会议岛`, `茶水间` -> `茶水补给点`, `打印复印室` -> `打印角`.

### Verification

- `npm run build` passed.
- Headless map smoke passed: generated map had 36 coffee machines.
- Headless zone smoke passed: after advancing through all 5 zone phases, closed/fire chunks remained 0.

## 2026-07-06 - Existing Mechanism Content Review

- Requested: review current game again, choose the highest-priority next task from new system, balance tuning, more existing-content, or self-decided direction; then develop and test.
- Context read: this process file and current agent rules were read before development.

### Review Decision

- Chosen priority: task 3, add content under existing mechanisms.
- Reason: the previous rounds already improved level-up rewards, recovery routes, open-office coffee distribution, and removed punishing fire/closed rooms. The next highest-return change is to make the existing ground-supply loop richer rather than adding a new system or continuing broad numeric tuning.

### Implemented

- Added 5 new consumables to the existing ground item system:
  - `工伤报销单`: heals based on missing HP; overflow becomes shield.
  - `带薪病假条`: heals and grants short invulnerability.
  - `降噪耳机`: clears reported/curse/slow/stun/vulnerability states and grants a speed boost.
  - `共享充电宝`: reduces Q/E active, dash, weapon, and sub-weapon cooldowns.
  - `行政补给袋`: opens into one survival item plus one heal pickup.
- Formal battle royale survival item weighting now includes the new survival tools.
- Fixed `重置卡` so it also clears the newer Q/E active cooldowns, matching its description.

### Verification

- `npm run build` passed.
- Headless consumable smoke passed: new items heal, shield, cleanse, reduce cooldowns, and spawn supplies as intended.
- Regression smoke passed: `重置卡` now clears Q/E active cooldowns in addition to the legacy active cooldown.

## 2026-07-06 - New Persona System Review

- Requested: review current game again, choose the highest-priority next task from new system, balance tuning, more existing-content, or self-decided direction; then develop and test.
- Context read: this process file and current agent rules were read before development.

### Review Decision

- Chosen priority: task 1, develop a new system to improve fun.
- Reason: recent rounds already improved level-up rewards, healing, coffee-machine distribution, no-fire-room map flow, and ground supplies. The largest remaining design gap is long-term build variety: only `optimizer` and `slacker` personas were playable while the design docs still identify three missing personas. Adding the next persona expands build identity more than another numeric/content pass.

### Implemented

- Added the third playable persona: `人肉 RLHF 训练员`.
- Added 8 RLHF passive cards focused on critical hits, execution thresholds, third-hit review, execution explosions, nuke counters, and last-stand burst.
- Added 2 RLHF sub-weapons:
  - `离职申请单发射器`: delayed accountability burst.
  - `年终奖支票·空头`: low-health target execution pressure.
- Added 2 RLHF actives:
  - Q `绩效末位淘汰`: targets the lowest-health enemy for execution or capped burst damage.
  - E `自爆式辞职信`: missing-HP-based AoE burst with short invulnerability.
- Added 2 RLHF evolution recipes:
  - `核弹级优化通知`: lowers execution nuke threshold and improves execution explosions.
  - `向死而生·最后反馈`: strengthens the last-stand burst.
- Updated combat hooks for execution checks, third-hit review marks, execution kill rewards, execution nuke counters, and last-stand survival.
- Updated persona UI labels so pause screen and lock-in warning show `人肉 RLHF 训练员`.

### Verification

- `npm run build` passed.
- Headless RLHF smoke passed: low-HP execution, third-hit execution, execution nuke reset, Q active, E active, last-stand survival, and both RLHF evolutions worked through the existing engine/state flow.

## 2026-07-06 - Persona Draft Balance Review

- Requested: review current game again, choose the highest-priority next task from new system, balance tuning, more existing-content, or self-decided direction; then develop and test.
- Context read: this process file and current agent rules were read before development.

### Review Decision

- Chosen priority: task 2, balance tuning so level-up choices feel more rewarding.
- Reason: the previous round added the RLHF persona, but the unlocked content could still be diluted by the larger shared draft pool. The highest-return next step is to make the upgrade flow reliably surface persona identity and keep later drafts aligned with the chosen build.

### Implemented

- Added a guaranteed first persona draft when the player has no persona locked:
  - `首席降本增效官`
  - `摸鱼表演艺术家`
  - `人肉 RLHF 训练员`
- Marked intro choices as `PERSONA` in the level-up card header.
- Added persona metadata to skill, sub-weapon, and active draft cards.
- Added a locked-persona draft guarantee: once a persona is chosen, each later upgrade draft tries to include at least one card from that persona.
- The guarantee prefers replacing a generic skill first, so existing gear pity is less likely to be lost.

### Verification

- `npm run build` passed.
- Headless draft smoke passed: first level-up showed all three persona choices, choosing RLHF locked `pl.persona = "rlhf"`, and 10 follow-up drafts each included at least one RLHF card with no optimizer/slacker leakage.

## 2026-07-06 - One Week Revival Persona System Review

- Requested: review current game, choose the highest-priority next task from new system, balance tuning, more existing-content, or self-decided direction; make it a one-week development task; then develop and test.
- Context read: this process file and current agent rules were read before development.

### Review Decision

- Chosen priority: task 1, develop a new system to improve fun.
- Reason: the game now has recovery supplies, richer ground items, no fire rooms, better persona draft guarantees, and three playable personas covering economy/control, mobility/evasion, and execution burst. The highest-return one-week task is a full fourth persona vertical slice that adds a missing durable low-HP/recovery archetype, instead of another small numeric pass.

### Implemented

- Added the fourth playable persona: `万年活人矿·二次入职`.
- Added 8 Revival passive cards focused on max HP, heavy-hit reduction, low-HP resistance, damage scars, damage-to-shield conversion, one-time second entry revive, blood-debt backwater bursts, and accumulated-damage nuke recovery.
- Added 2 Revival sub-weapons:
  - `止痛片压力瓶`: close-range pressure aura that slows/damages enemies and feeds sustain.
  - `工地劳保手套`: short-range counter-slash that grants shield on hits.
- Added 2 Revival actives:
  - Q `移动献血车`: short-duration healing field with a vulnerability tradeoff.
  - E `我不下班了`: HP-cost burst mode that defers part of incoming damage into wage debt, with kills reducing the debt.
- Added 2 Revival evolution recipes:
  - `诈尸交接班`: second-entry revive pulls, stuns, damages, and partially heals from nearby enemies.
  - `福报力场`: enhances blood-debt clearing and pressure-pills sustain field.
- Expanded the first persona draft from three to four choices and added keyboard support for `Digit4`.
- Updated level-up and pause UI labels for the new persona.
- Fixed the blood-debt state machine during testing so low-HP damage records debt immediately and recovery clears stored debt reliably even if the low-HP window only lasts one tick.

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Headless Revival system smoke passed: first draft showed 4 personas, Revival lock applied, all 8 passives worked, Q/E actives worked, both sub-weapons dealt damage/sustained, second-entry revive and both Revival evolutions triggered, blood debt cleared on recovery, and 996 nuke healed/damaged as expected.
- Browser smoke passed at `http://127.0.0.1:5174/`: start screen rendered, "免" trial selection and "签到进场" worked, the game canvas/HUD rendered, and a 30s full-auto run executed without frontend errors. The run ended in player death before naturally reaching level-up, so the level-up overlay was verified through the headless engine path above.

## 2026-07-06 - One Week OPC Persona System Review

- Requested: continue the recurring game development iteration in the current Codex thread; first read `agents.md` and this process file, review the current implementation, choose the highest-priority one-week task from new system, balance, existing-content expansion, or self-decided direction; then confirm requirements, plan, develop, test, and update this file.
- Context read: `agents.md`, this process file, the design pacing/build docs, current persona data, draft flow, active/subweapon/evolution data, and core combat/update loops were read before development.

### Review Decision

- Chosen priority: task 1, develop a new system to improve fun.
- Reason: after the previous rounds, the game already has stronger healing, richer supplies, no fire rooms, better draft guarantees, and four playable personas. The largest remaining build-variety gap is the missing summon/back-office archetype from the design notes. A full `一人公司 OPC` vertical slice is the highest-return one-week task because it adds a distinct playstyle rather than another small tuning pass.

### Requirements

- Add the fifth playable persona: `一人公司 OPC`.
- Deliver a complete one-week slice: 8 passives, 2 sub-weapons, 2 active skills, 2 evolution recipes, draft/UI integration, and runtime summon behavior.
- Keep it compatible with the existing draft, active, subweapon, evolution, damage, kill, and summon systems.
- Bound summon counts so the new archetype does not create runaway unit growth.

### Plan

- Use OPC as a summon/back-office build: the player manages contractors, digital clones, knowledge-base turrets, blame transfer, retirement value, and focused target calls.
- Put most mechanics into data-driven cards, but centralize shared runtime behavior in `core.js` helpers for OPC summon spawn, cap trimming, retirement recording, and severance-nuke triggering.
- Reuse existing projectile, turret, active, evolution, and level-up infrastructure instead of adding a parallel system.

### Implemented

- Added 8 OPC passive cards:
  - `外包合同工`: auto-spawns contractor summons.
  - `KPI外包`: increases OPC summon damage.
  - `云端待命`: reduces summon cadence and grants owner speed while summons are active.
  - `甩锅协议`: can transfer incoming player damage to an OPC summon.
  - `影子考勤`: retiring summons cache stronger future spawns.
  - `猎头挖角`: kill marks promote an active summon into a senior contractor.
  - `背锅侠矩阵`: 6+ OPC summons create a damage/evasion/focus-fire matrix.
  - `退休金核爆`: retired summons build severance points that trigger an AoE nuke.
- Added 2 OPC sub-weapons:
  - `知识库炮台矩阵`: deploys temporary auto-firing turrets.
  - `数字分身外包席`: spawns higher-output clone summons.
- Added 2 OPC active skills:
  - Q `一键甩锅群发`: marks a target for focused summon fire, vulnerability, and burst damage.
  - E `虚假繁忙`: grants brief invulnerability/fire-rate support and spawns temporary staff.
- Added 2 OPC evolutions:
  - `外包帝国`: upgrades knowledge-base turrets and shared summon information reuse.
  - `核爆式离职潮`: makes `裁员通知` retire current OPC summons into severance nuke waves.
- Added OPC runtime helpers and hooks:
  - Summon cap and cap trimming.
  - Contractor/clone/wall summon spawning.
  - Retirement recording for natural expiry and forced layoff.
  - Damage transfer to summons.
  - Kill credit from summons back to the player.
  - Senior summon promotion.
  - OPC matrix focus target and vulnerability logic.
  - Knowledge-base turret firing.
  - OPC summon AI for following, focusing, melee wall behavior, and ranged fire.
- Updated persona draft/UI integration:
  - First persona draft now supports 5 choices.
  - Level-up header shows dynamic choice count for persona intro drafts.
  - Keyboard level-up selection supports `Digit5`.
  - Pause/persona labels include `一人公司 OPC`.

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Headless OPC system smoke passed with clean exit code:
  - First draft showed 5 personas and OPC lock applied.
  - OPC had 8 passives, 2 sub-weapons, 2 actives, and 2 evolutions.
  - Auto-summon, summon damage scaling, damage transfer, retirement cache, severance points, headhunter promotion, fake-busy staffing, and matrix activation worked.
  - Knowledge-base turret fired, digital clone spawned, Q/E actives worked, and both OPC evolutions unlocked and triggered.

## 2026-07-06 - Persona Milestone Growth Balance Review

- Requested: continue the recurring game development iteration; first read `agents.md` and this process file, review current implementation, choose the highest-priority one-week task, confirm requirements and plan, develop, test, and update this file.
- Context read: `agents.md`, this process file, the design pacing/build docs, current level-up flow, persona data, active/subweapon/evolution data, HUD, level-up overlay, and pause overlay were read before development.
- Worktree note: the repository already contains many uncommitted changes from prior iterations; this round continued on top of them and did not revert unrelated work.

### Review Decision

- Chosen priority: task 2, balance/growth tuning so level-ups feel more rewarding.
- Reason: after adding the fifth persona, the main content gap is no longer raw persona count. The higher-impact one-week task is to improve the medium-term upgrade loop: five personas now have large card pools, but the player still mostly sees ordinary three-choice drafts with only rare-card and gear pity. Adding persona-specific milestone promotions gives stable mid-run goals and makes levels 4/8/12/16 feel meaningfully better without adding another full character system.

### Requirements

- Add a persona-locked milestone reward layer at key levels.
- Milestone rewards must be extra rewards and must not consume the normal level-up draft.
- Each persona needs three milestone tracks so different builds within the same persona can diverge.
- Effects should reuse existing modifier channels where possible and avoid a parallel combat framework.
- UI should clearly distinguish milestone cards from normal skill/gear/active cards and show acquired milestones in the pause profile.

### Plan

- Introduce a data-driven milestone table keyed by persona.
- At configured levels `[4, 8, 12, 16]`, if the player has a locked persona and has not claimed that level's milestone, show a three-choice `PROMO` draft before the normal draft.
- Applying a milestone records it on the player, grants a small heal/shield bump, applies the selected track effect, then immediately reopens the normal level-up choices while keeping `pendingLevels` intact.
- Add a generic active cooldown multiplier so milestone tracks can improve Q/E cadence without hardcoding individual actives.

### Implemented

- Added `src/game/data/milestones.js` with three milestone tracks for each of the five personas:
  - RLHF: execution precision, extreme crit dataset, final-feedback cooldown/low-HP pressure.
  - Revival: max-HP/heavy-hit durability, blood-debt shielding, kill-heal/active cadence.
  - OPC: summon procurement, shadow legal damage transfer, delivery project active cadence.
  - Optimizer: control-room punish, risk-office mitigation, KPI dashboard scaling.
  - Slacker: mobility/evasion, online-presence automation, escape-calendar active cadence.
- Added `TUNE.personaMilestoneLevels = [4, 8, 12, 16]`.
- Added player milestone state and milestone insertion in `openLevelup()`.
- Added milestone picking behavior that does not decrement `G.pendingLevels`, so the regular upgrade draft still follows.
- Added `mods.activeCdMul` and applied it in `castActive()` for Q/E cooldown tuning.
- Updated the level-up overlay:
  - Persona intro still shows dynamic `N选一`.
  - Milestone drafts show `晋升特批 · 三选一`.
  - Milestone cards are labeled `PROMO`.
- Updated the pause overlay to list acquired `晋升里程碑`.

### Verification

- `npm run build` passed.
- `git diff --check` passed.
- Headless milestone smoke passed:
  - All five personas offered exactly three Lv.4 milestone choices.
  - Choosing a milestone recorded it on the player.
  - Milestone selection did not consume the normal pending level reward.
  - The normal level-up draft appeared immediately after the milestone.
  - The `slacker_escape_calendar` milestone reduced Q active cooldown through `activeCdMul`.

## 2026-07-06 - Full Bug Audit（用户反馈：无趣 + 好多 bug）

- Requested: 用户反馈当前游戏很无趣、bug 多，要求全面识别（只识别，不修复）。
- Context read: agents.md 与本进程文件。
- Method: 4 路并行代码审查（core.js 前半 / core.js 后半 / 数据↔引擎交叉核对 / UI·渲染·输入层，每条发现均双向读码验证）+ 浏览器内直接驱动引擎的实机模拟（5 个人设完整构筑跑局、试用期与免试用期全托管对照实验、咖啡机/里程碑/暂停/5选1 界面实测）。
- Output: 完整报告见 `dcos/bug-review-2026-07-06.md`——1 个 P0（画饼护盾饼致 Bot NaN 血量不死、无法达成胜利条件）、约 20 个 P1、约 30 个 P2，外加平衡性诊断。
- Key systemic roots: ① `later()` 音效计时器被当逻辑调度器（退休金核爆等延迟爆炸被升级/暂停取消、升级音效必然无声、暂停时爆炸照常结算）；② 试用期改击杀驱动后 trialOffset 仍按时间预算 → 转正瞬间缩圈连跳；③ 25+ 处数据字段无引擎消费 → 空气卡；④ 喷淋/快递直接改 hp 绕过 killUnit → 负血僵尸。
- Balance evidence: 全托管自动挡免试用期 15s 死、3 月试用期 80~88s 死于第 1 波（两次独立实验）；里程碑/进化/第 4 槽等新内容大多数局摸不到。
- Note: 本轮未做任何修复；工作区未提交改动保持原样。

## 2026-07-06 - Bug Fix Round（50/58 项修复 + 提示注入重做）

- Requested: 修复上一轮审查的 bug；重做「提示注入」使其对小兵（试用期核心场景）与 Boss 都有价值。
- Context read: agents.md、本进程文件、dcos/bug-review-2026-07-06.md。
- Implemented (core.js/data 由主线完成，UI/渲染/输入层 11 项由并行子任务完成):
  - P0：护盾饼拾取补 `amt:0` + heal 分支防 NaN。
  - 基建：新增随 `G.t` 走的游戏内延迟队列 `delay()`，替换 later() 的全部逻辑用途（遣散费核爆波次/截图留痕/先拉个会/死线警报/蘑菇云/快递落地）；`setState` 只在回主菜单时取消延时音效（升职/晋升/新纪录音效恢复可闻）；喷淋/快递直接改 hp 改走 applyDamage；试用期结束记录 `trialEndT` 作为缩圈/Boss/仇恨时间轴锚点。
  - 机制接通：办公室政治引爆（updatePersonaSkills 对全体单位调用）、slowPower 消费、需求冻结阻止分裂/撤回复活、咖啡机回血光环（r 20→40）、上锁文件柜首个蒸馏、红线拉齐线伤、强制静音半径 4s 后还原、裁员委员会两两互指+沿链殉爆、订书机系炮台按 kind 过滤+自带伤害表、钓鱼邮件远程 AI 启用、16 精英词条全部生效（增伤乘区/甩锅反伤/抄送/红点/卡权限/Bug/临时OOO/被点名）、锅值 100 触发审计、KPI 100 兑现季度之星、摸鱼觉醒叠层不再回滚 mods.dmg、隐身与低仇恨对杂鱼生效、临时下线真隐身、在线徽章 Lv3 引爆伤害、待办地雷微伤、殉爆/心已离职/骨密度/在线感机器人按卡面对齐。
  - 状态泄漏：vulnBonus 随易伤到期归零、试用期喷淋减速解除、假勤奋与在线认证计时分离、N+1/2N 护盾取高、饮水机真 debuff 免疫、欠薪不可被无敌/闪避赖掉、复活减半档生效、召唤物到期静默回收、尸体清理含召唤物/精英、波次与外包大军计数搬出凶手分支（无凶手死亡不再卡波次）、pity 装备卡不被人设保底顶掉、unlockSubSlot 不吞 pendingLevels、机器人不再抽人设废卡。
  - 提示注入重做：同事策反 → Boss/T2 精英"系统提示词污染"（眩晕 1.5s+易伤 30%+减速4s，时长随模组档位）→ 策反 3-5 只小兵倒戈（转 OPC 近战召唤物、计入波次进度）→ 兜底 +25 经验。
  - 难度：第 1 月波量 24/30/38→16/21/26、月 2 微降、倾倒间隔月 1 放缓至 0.5s/团、清波 +12HP+10盾、免试用期开局 30 盾 20s。
  - UI/渲染（并行子任务）：停电改为正确的中心亮渐变+删双重相机偏移、decor 贴图偏移、渐变缓存、触屏 E 大招按钮、PROMO/人设界面隐藏重抽、升级层可滚动、按键说明更正、合成 mousemove 不再打断触控、重开不串 BGM、首局 HR 提示回放。
- Verification: `npm run build` 通过；浏览器引擎级回归——政治引爆✅ 无凶手死亡计入波次✅ 咖啡光环回血✅ 红线伤害✅ 注入转化小兵×4✅ 注入 Boss（眩晕1.5s/易伤30%/减速4s）✅ NaN 防御✅ 易伤归零✅ 延迟队列跨升级结算✅ 免试用期开局盾✅ 5 人设 2 分钟长跑全绿（无 NaN/空卡组/卡死，OPC 局 units 终值 6，修复前会涨到 64+）。
- Open: bug-review 文档头部所列 8 条未修项；难度最终手感需真人试玩校准（自动代理方差 17~87s 不可作人类基准）。

## 2026-07-06 - Mob Variety + AI Art Pipeline（v2.2：7 新怪 + 25 张 Codex 生成贴图）

- Requested: 用户反馈"怪物种类太少、建模太差"，并确认可用 Codex 生图（此前素材即 Codex imageGen 所出）。
- Implemented:
  - 新增 7 种新行为品类怪物（data/mobs.js + core.js updateMob 分支）：KPI 气球（自爆+预警圈）、狼性文化训练生（蓄力冲锋）、HR 实习生（呼叫邮件支援，召唤物不计波次目标）、加班蜗牛（拖减速粘液带）、全员会议黑洞（牵引玩家）、工资小偷（偷经验豆、死亡吐 1.5 倍）、PUA 大师（保距易伤弹，新增子弹 vuln 字段管线）。
  - 复活 2 种已实现但从未出场的怪：死线警报、需求评审会（编入月 4/5 波次）。
  - 波次重排：月 2-5 混编新怪；新增正赛"琐事骚扰潮"（转正后每 22s/34s 小撮刷新，BR_MOB_POOL 10 种，免试用期也能见到全部品类）。
  - 素材管线：render.js 新增 HIFI_MOBS drop-in 通道（import.meta.glob 扫 src/assets/generated/mob_*.png，可选 _b 第二帧 6fps 动画，缺图零开销回退字符画）；spawnMob 记录 sprKey 并对未注册精灵兜底。
  - AI 出图：用本机 `codex exec`（gpt-5.5 + imageGen）按 dcos/art-pipeline.md 规格分 4 批生成全部 25 张怪物贴图（48×48 RGBA 透明底、1px 描边、朝右、底部 2px 留白），已实机验收。
  - sprites.js 字符画全量重绘（回退层，并行子任务完成）。
- Verification: 7 新行为逐一引擎级断言通过（自爆/冲锋/召唤/拖尾/牵引/偷窃闭环/易伤命中）；波次与骚扰池引用完整性校验通过；免试用期 14s 出现首波骚扰潮；实机全家福截图确认 25 张贴图游戏内渲染正常。
- Note: art-pipeline.md 含完整出图规格与逐怪提示词，后续可随时用 codex exec 重生成/补 _b 动画帧。

## 2026-07-06 - HR Intern 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only for `mob_hrintern.png`; generate one raw 3x3 walk-and-call animation grid; do not slice, chroma-key, or resize.
- Context read: this process file, the pixel-animation-grid skill, the imagegen skill, and the 48x48 `src/assets/generated/mob_hrintern.png` reference sprite.
- Implemented: used built-in image_gen exactly once and copied the raw generated PNG to `src/assets/generated/frame_tests/mob_hrintern_anim_3x3_raw.png`.
- Verification: raw image is 1254x1254 sRGB PNG. No slicing, chroma-key removal, or resizing was performed. Visible drift noted: background green is not perfectly uniform #00ff00, and the intern's silhouette/pose/anchor varies between cells despite the requested sameness.

## 2026-07-06 - Ghost Reply 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_ghostreply.png`; generate one raw 3x3 image grid for a floating ghost loop, with no slicing, no chroma-key removal, and no resizing.
- Context read: this process file and `~/.codex/skills/pixel-animation-grid/SKILL.md`; also inspected the reference sprite at `src/assets/generated/mob_ghostreply.png`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_ghostreply_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: body shape/scale and face details vary slightly between cells, and the grid includes white gutters between green cells; no post-processing was performed.

## 2026-07-06 - Urgent Email 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_urgent_email.png`; generate one raw 3x3 image grid for a frantic fast-walk loop, with no slicing, no chroma-key removal, and no resizing.
- Context read: this process file and `~/.codex/skills/pixel-animation-grid/SKILL.md`; also inspected the reference sprite at `src/assets/generated/mob_urgent_email.png`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_urgent_email_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: envelope proportions, exact cell position, feet, and exclamation-mark placement vary between cells; the green background has visible gradient/noise. No post-processing was performed.

## 2026-07-06 - Meeting Calendar Monster 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_meeting.png`; generate one raw 3x3 image grid for a blink-teleport opacity loop with advancing clock hand, with no slicing, no chroma-key removal, and no resizing.
- Context read: this process file, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_meeting.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_meeting_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: monster anchor and silhouette are broadly consistent, but the green background has visible soft variation/haloing and the advancing clock hand is not consistently pure red. No post-processing was performed.

## 2026-07-06 - Recall Mob 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_recall.png`; generate one raw 3x3 image grid for a hover-orbit loop, with no slicing, no chroma-key removal, and no resizing.
- Context read: this process file, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_recall.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_recall_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: the green background has visible soft variation instead of a perfectly flat `#00ff00`; the bubble silhouette, legs, and face spacing drift slightly between cells, while the purple recall arrow does orbit through distinct positions. No post-processing was performed.

## 2026-07-06 - Snail 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_snail.png`; generate one raw 3x3 crawl-loop image grid with magenta chroma background because the subject uses green; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_snail.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_snail_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: magenta background has soft variation instead of perfectly uniform #ff00ff; shell/antenna/body anchor and silhouette vary slightly between cells. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Review Board 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_reviewboard.png`; generate one raw 3x3 idle-loop image grid with fixed meeting table, wobbling placard, and pulsing aura lines; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_reviewboard.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the announced raw output to `src/assets/generated/frame_tests/mob_reviewboard_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but not uniform pure #00ff00, the placard/table anchors shift slightly between cells, and the generated sprite is an approximate match rather than an exact pixel match to the 48x48 reference. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Blackhole 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_blackhole.png`; generate one raw 3x3 spin-loop image grid with purple-black vortex rotation and calendar shreds spiraling inward; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_blackhole.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_blackhole_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but has soft variation rather than uniform pure #00ff00; blackhole bodies are broadly consistent, but the outer silhouette/anchor and calendar-shred positions vary slightly between cells. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Desk Lamp 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_lamp.png`; generate one raw 3x3 idle-loop image grid with subtle lamp-head sway, two-level light-cone flicker, and drifting dust motes; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_lamp.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_lamp_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but has soft variation rather than uniform pure #00ff00; lamp anchor/scale and head/base silhouette drift between cells more than requested, while the light cone flicker and dust-mote movement are visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Sticky Note 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_sticky.png`; generate one raw 3x3 hop-scoot loop image grid with curled corner flap and landing squash; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_sticky.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_sticky_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but not uniform pure #00ff00; sprite anchor/leg shape/body proportions vary slightly between cells, especially the middle-left landing/airborne frame. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Urgent Alarm 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_urgent.png`; generate one raw 3x3 idle-pulse loop image grid with alarm-bell sway and expanding warning ring; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_urgent.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_urgent_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation and white gutters instead of uniform pure #00ff00; the generated alarm bell is more detailed/larger than the 48x48 reference, the subject reads more front-facing than right-facing, and the widest warning ring is clipped/near-clipped in the lower-left cell. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Army Worker 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_army.png`; generate one raw 3x3 scurry-loop image grid where the tiny worker takes rapid small steps and the oversized badge lanyard swings opposite to body lean; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_army.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_army_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: the green background has soft variation instead of uniform pure #00ff00; the worker shape/palette are broadly consistent, but leg positions, body anchor, and badge/lanyard placement vary slightly between cells. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Thief 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_thief.png`; generate one raw 3x3 sneak-run loop image grid with coin-mouth glints every third frame and a mid-loop look-back glance; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_thief.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_thief_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure #00ff00, and the thief's body height/leg positions/anchor vary noticeably between cells; coin glints are visible on frames 2, 5, and 8, and the center frame includes a look-back eye glance. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - CR Revision Sheet 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_cr.png`; generate one raw 3x3 wobbly walk-loop image grid with paper-sheet sway, stepping feet, and fluttering red revision marks; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_cr.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_cr_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but has soft variation instead of uniform pure #00ff00, small foot shadows are present, and the subject anchor drifts upward in later rows; the paper creature remains broadly consistent and the walk/mark flutter motion is visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - PUA Mob 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_pua.png`; generate one raw 3x3 idle-float/lecturing-loop image grid with mouth bob/open-close and golden painted-pie halo pulse; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_pua.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_pua_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure `#00ff00`; the generated mob is larger and more rendered than the 48x48 reference, with slight body/halo anchor and halo-shape drift between cells. Mouth open-close/bob and halo bright-dim animation are visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - CC Bomb 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_ccbomb.png`; generate one raw 3x3 walk-with-fuse-loop image grid with the envelope-bomb walking while the fuse spark climbs shorter each frame and then resets; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_ccbomb.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_ccbomb_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of perfectly uniform #00ff00; bomb/envelope anchor, body proportions, envelope details, and fuse length drift slightly between cells, and the generated sprite is more detailed/larger than the 48x48 reference. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Deadline Fan 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_deadline.png`; generate one raw 3x3 spin-loop image grid with red fan blades rotating through 9 evenly spaced angles and beacon light alternating on/off; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_deadline.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_deadline_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but has soft variation instead of uniform pure #00ff00; fan rotations are distinct and beacon alternates on/off, but the generated sprite is larger/more detailed than the 48x48 reference and the silhouette/anchor drifts slightly between cells. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Phishing Envelope 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_phishing.png`; generate one raw 3x3 hover-loop image grid where the envelope bobs on the fishing hook, hook line sways, and hook barb occasionally glints; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_phishing.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_phishing_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure #00ff00; the phishing envelope is broadly consistent, but envelope body anchor/scale, hook-line anchor, and lower feet positions drift slightly between cells. Hook-line sway, bobbing, and hook-barb glints are visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Moon Notification 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_rework.png`; generate one raw 3x3 prowl-loop image grid where the moon-notification stalks forward, the red eye blinks once mid-loop, and moon glow pulses; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_rework.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_rework_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. Visible drift: background is green but has soft variation instead of uniform pure `#00ff00`; the moon-notification sprite is broadly consistent and the center-frame eye blink is present, but the subject anchor drifts left by about 23px across columns and upward by about 23px across rows. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Read Reply Bubble 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_readreply.png`; generate one raw 3x3 hover-loop image grid where the gray chat bubble floats up/down and the two check marks blink in sequence; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_readreply.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_readreply_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure #00ff00; the generated bubble is much larger/more rendered than the 48x48 reference, with slight body/anchor/tail drift between cells. Hover motion and sequential check-mark blinking are visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Hunter Chart Hound 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_hunter.png`; generate one raw 3x3 gallop-loop image grid where the hound-shaped arrow chart runs a 4-beat gallop and its body chart line oscillates; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_hunter.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_hunter_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure #00ff00; the hunter shape/palette/angle are broadly consistent, but body anchor and leg footprint drift slightly between cells. Gallop leg poses and body chart-line oscillation are visible. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Wheel Gear 3x3 Raw Animation Grid Phase 1

- Requested: follow `pixel-animation-grid` Phase 1 only for `mob_wheel.png`; generate one raw 3x3 rolling-loop image grid where the wooden wheel/gear rotates through 9 evenly spaced angles and the blue shield arc shimmers; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, `~/.codex/skills/.system/imagegen/SKILL.md`, and the 48x48 `src/assets/generated/mob_wheel.png` reference sprite.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/mob_wheel_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: background is green but has soft variation instead of uniform pure #00ff00; the wheel rotation and blue shield shimmer are visible, but the subject anchor drifts left by about 19.5px across columns and upward by about 16px across rows, with a few small dark-brown protruding/stray blocks on some frames. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Mob 9-Frame Animations 汇总（pixel-animation-grid 全量落地）

- Requested: 用户指出应使用 `~/.codex/skills/pixel-animation-grid/SKILL.md`（网格多帧→切片）为素材做帧动画；试点 3 只验收后批准全部批量。
- Implemented:
  - 严格按 SKILL 两阶段流程：Phase 1 由 `codex exec` 生成 3×3 九帧绿幕网格 raw（每只按运动特征定制循环：走路/奔跑/悬浮/滚动九角度/漩涡旋转/待机脉冲等；绿色主体的加班蜗牛改用品红幕），上方 22 条 Phase 1 记录即各批次 codex 的自报条目；自检帧一致性后 Phase 2 切片。
  - 切片脚本修正 SKILL 示例的整除坑（1024÷3 余 1px 会多切出空白细条瓦片、帧序错位——先缩放到 1023 再切）。
  - render.js 支持帧序列：`mob_<key>_f0..fN.png` 自动识别；帧率随移动加快、静止怪保持待机动画、单位相位错开；回退链 帧序列 > _b 双帧 > 单帧 > 字符画。
- Verification: 25 只 × 9 帧 = 225 帧全部 128×128 透明底、零坏帧、帧数全齐；`npm run build` 通过；游戏内画布像素 hash 抽验（email/蜗牛/黑洞/小偷）帧变化 5/5 全不同；各批自报的绿幕软渐变/锚点漂移经切片+去绿幕后无可见影响（wheel 漂移折算 <2px）。
- Cost note: 网格法单帧成本约为逐帧单独生成的 1/15（SKILL 实测口径）。

## 2026-07-06 - 电梯修复 + 人设抽卡体验（呼叫式电梯 / 卡片换行 / 随机与先不站队）

- Requested: 用户反馈①电梯没人知道怎么开门且效果无法触发；②人设 5 选 1 卡片挤压变形；③希望人设可以不选/纯随机。
- Root cause（电梯）: 整段电梯逻辑（含 45s 开门倒计时）写在"玩家贴着障碍物才执行"的交互循环里——倒计时只在玩家站在电梯上时推进，等于要原地罚站 45 秒才开门。
- Implemented:
  - 电梯全局节拍挪到 propTick（不站人也走表，45s 自动到站开门 3s）；站上电梯 1.2s 即"呼叫"开门传送（浮字提示 呼叫中…/叮！），公告板提示文案同步更新。
  - #levelup-cards 允许换行（flex-wrap + min-width 158px）：窄窗 5 选 1 自动 2-3 张/行或单列，不再挤成竖条。
  - 人设 intro 新增两个入口：🎲 听天由命（随机 pickLevelChoice）；🫥 先不站队（snoozePersonaIntro：本次改出**纯通用卡池**——buildDraftPool 过滤全部人设卡，否则混合池随手一张人设卡就锁定，按钮形同虚设；下次升级重新提供 5 选 1）。
- Verification: 引擎断言——电梯全局走表（nextRing 44.8→43.8）、站上 71 帧开门、72 帧传送 883px 到另一台 ✅；先不站队全链路（5选1→3张纯通用→选卡不锁人设→下次升级重现5选1）✅；窄窗截图确认按钮与换行渲染 ✅；npm run build 通过。
