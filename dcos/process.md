# Process

## 2026-07-07 - MiniMax Green Nail/Tack Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a green glowing nail/tack projectile with a three stacked-bar emblem, spinning drill-like while pointing right.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_minimax_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Verification: saved project copy is byte-identical to the generated source PNG.
- Visual/drift check: all 9 cells show the same right-facing green glowing nail/tack projectile with a clear three stacked-bar emblem and drill-like spin/highlight stages. Frame 8 is visually close to frame 0 for loop return. Estimated raw-cell foreground bbox center drift is about 15.5px horizontally and 45px vertically across 418px cells; foreground centroid drift is about 11.9px horizontally and 50.3px vertically, mainly because the bottom row sits higher than the top row. Background is visually green but not mathematically exact uniform `#00ff00`; 0 exact `#00ff00` pixels were detected, with sampled corner medians around `rgb(17-18,246-247,16-17)`.
- Status: complete.

## 2026-07-07 - Grok Silver Boomerang Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a pale silver boomerang blade projectile spinning through 9 evenly spaced rotation angles with motion blur arcs on the blade tips.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_grok_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same pale silver boomerang projectile with dark outline, rotating through evenly spaced spin stages with tip motion-blur arcs; frame 8 is close to frame 0 for loop return. Estimated raw-cell largest-component bbox center drift is about 71px horizontally and 44px vertically across 418px cells; largest-component centroid drift is about 63.8px horizontally and 27.8px vertically. Background is visually green in cells but the raw output includes white gutters/borders, and the green is not mathematically exact uniform `#00ff00`; only 2 exact `#00ff00` pixels were detected.
- Status: complete.

## 2026-07-07 - Elite Customer Success Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless idle-loop animation grid for a Customer Success Director boss with headset mic, oversized smiling mask held beside face, and satisfaction-survey clipboard.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/elite_cs_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Verification: saved project copy is byte-identical to the generated source PNG.
- Visual/drift check: all 9 cells show the same right-facing Customer Success Director boss with headset mic, oversized smiling mask, tired face, and satisfaction-survey clipboard. The mask rises and lowers while revealing the tired face, checkmarks tick onto the clipboard, and frame 8 returns close to frame 0 for looping. Estimated raw-cell full-foreground bbox center drift is about 23px horizontally and 7.5px vertically across 418px cells; foreground centroid drift is about 22.4px horizontally and 7.2px vertically; bottom-anchor drift is about 6px. Background is visually green but not mathematically exact uniform `#00ff00`; 0 exact `#00ff00` pixels were detected, with background-like median around `rgb(11,242,12)`.

## 2026-07-07 - Midjourney Magenta-Rainbow Card Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a magenta-rainbow shimmer card projectile cycling hue magenta→purple→pink while spinning slowly with a dreamy sparkle trail.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_midjourney_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing magenta-rainbow shimmer card projectile with dark outline, slow spin stages, hue cycling from magenta through purple/pink, and sparkle trail phases. Frame 8 is visually close in design to frame 0 but sits higher/left because the bottom row is vertically offset. Estimated raw-cell largest-card-component bbox center drift is about 55.5px horizontally and 28.5px vertically across 418px cells; card centroid drift is about 50.0px horizontally and 28.2px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; sampled edge values were roughly `rgb(8-32,236-248,9-28)`, with 0 exact `#00ff00` pixels detected.

## 2026-07-07 - Gemini Violet Twin-Star Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a violet twin-star projectile with two four-point stars orbiting each other.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_gemini_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same compact violet twin-star projectile with two four-point stars orbiting around a shared center. Frame 8 is close to frame 0 for a seamless loop. Estimated raw-cell foreground bbox center drift is about 33px horizontally and 28px vertically across 418px cells; foreground centroid drift is about 29.3px horizontally and 57.8px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; only 1 exact `#00ff00` pixel was detected in the raw PNG.

## 2026-07-07 - Chip Sheet Raw 4x4 Icon Grid

- Requested: use `~/.codex/skills/.system/imagegen/SKILL.md`; generate exactly one built-in `image_gen` image for a 4x4 grid of 16 different retro pixel-art rounded-square microchip icons on solid `#00ff00` cell backgrounds.
- Target raw path: `src/assets/generated/frame_tests/chip_sheet_raw.png`.
- Constraints: raw only; no slicing, chroma-key, resizing, or cleanup.
- Context read: project-local `dcos/process.md` and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in `image_gen` image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/chip_sheet_raw.png`.
- Actual dimensions: 1254x1254 PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Status: complete.

## 2026-07-07 - Elite Product Management Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless idle-loop animation grid for a Product Director boss with smart casual vest, giant roadmap scroll unrolled between hands, sticky notes orbiting, scroll unroll motion, sticky-note shuffle, and confident nod.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/elite_pm_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Verification: saved project copy is byte-identical to the generated source PNG.
- Visual/drift check: all 9 cells show the same right-facing Product Director boss concept with smart casual vest, giant roadmap scroll, and orbiting sticky notes. The scroll unroll/roll-back, sticky-note shuffle, and confident head-nod stages are visible; frame 8 is close to frame 0 for loop return. Estimated raw-cell full-foreground bbox center drift is about 41.5px horizontally and 13.5px vertically across 418px cells; largest character/scroll component center drift is about 41.0px horizontally and 13.5px vertically; bottom-anchor drift is about 9px. Background is visually green but not mathematically exact uniform `#00ff00`; sampled corner values were roughly `rgb(5-9,244-247,15-18)`, with 0 exact `#00ff00` pixels detected.

## 2026-07-07 - ChatGPT Teal Energy Orb Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a teal-green energy orb projectile with hexagonal knot core rotation and outer glow pulse.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_chatgpt_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same compact right-facing teal energy orb with dark outline, hexagonal knot core, rotating internal highlights, and pulsing outer glow. Frame 8 is visually close to frame 0 for a loop. Estimated raw-cell foreground bbox center drift is about 16.5px horizontally and 36.0px vertically across 418px cells; centroid drift is about 16.7px horizontally and 35.8px vertically, mainly because the bottom row sits higher than the top rows. Background is visually green but not mathematically exact uniform `#00ff00`; sampled edge values were roughly `rgb(14-35,238-247,10-26)`.

## 2026-07-07 - One-Person-Company Player Walk Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop walk animation grid for the One-Person-Company persona player character.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/player_opc_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing headset-and-business-vest OPC player character with three tiny overhead holographic app windows. Walk poses, arm swing, tie sway, and window flicker/orbit states are present, with frame 8 returning toward frame 0. Estimated raw-cell largest-character-component center drift is about 26.5px horizontally and 42px vertically across 418px cells; bottom-anchor drift is about 32px. Full foreground drift is affected by orbiting hologram windows/trails. Background is visually green but not mathematically exact uniform `#00ff00`; sampled edge background-like values ranged roughly `rgb(0-35,121-255,0-96)`, with 2 exact `#00ff00` pixels detected.

## 2026-07-07 - Boss Roar Sound-Wave Burst Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 one-shot animation grid for an angry boss roar sound-wave burst.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_bossroar_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Verification: saved project copy is byte-identical to the generated source PNG.
- Visual/drift check: frames progress from a small center shout spark through expanding jagged red arcs, maximum triple sound-wave burst with exclamation shards/spittle, thinning arcs, broken dashes, fading fragments, faint dots, and an empty final cell. Estimated raw-cell foreground bbox center drift across non-empty frames is about 6px horizontally and 27.5px vertically across 418px cells. Background is visually green but not mathematically exact uniform `#00ff00`; frame 8 is empty but its sampled green ranges roughly `rgb(9-32,243-250,7-20)`.

## 2026-07-07 - Boss Golden Pie Blessing Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 one-shot raw animation grid for a giant golden painted-pie descending blessing boss skill.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_bosspie_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames progress from a small high halo, descending pie silhouette, bright pie with rays, maximum radiant pie with falling crumbs, translucent fade/scatter, shrinking halo, falling crumb sparkles, two sparkles, and an empty final cell. The main pie design is consistent in the full-pie phases. Estimated raw-cell foreground bbox center drift across non-empty frames is about 10.5px horizontally and 131.5px vertically across 418px cells, driven by the deliberate descent/fade sequence; the full-pie F2-F4 strong-foreground center drift is about 6.5px horizontally and 3.5px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background values were roughly `rgb(3-8,245-249,1-10)`.

## 2026-07-07 - Doubao Pink Bean Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a cute pink bean projectile tumbling head-over-tail.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw byte-identical copy to `src/assets/generated/frame_tests/proj_doubao_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same cute pink bean projectile with determined face rotating head-over-tail through a coherent loop. Estimated raw-cell foreground bbox center drift is about 42.5px horizontally and 22.5px vertically across 418px cells; foreground centroid drift is about 38.4px horizontally and 20.9px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background-like pixels ranged roughly `rgb(1-72,151-255,0-74)` and no sampled pixels were exactly `#00ff00`.

## 2026-07-07 - Elite Marketing Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless idle-loop animation grid for a CMO marketing director boss with magenta blazer, megaphone, popping like/heart icons, sound arcs, and hair flip.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/elite_marketing_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing CMO marketing director boss with magenta blazer, megaphone, floating like/heart icons, sound arcs, and hair-flip stages. The sequence reads as a shout/pop/burst/recover idle loop, with frame 8 close to frame 0. Estimated full-foreground bbox center drift is about 30px horizontally and 22px vertically across 418px raw cells; largest character/megaphone component center drift is about 44px horizontally and 22px vertically; bottom-anchor drift is about 20px. Background is visually green but not mathematically exact uniform `#00ff00`; thresholded background-like pixels ranged roughly `rgb(0-109,141-255,0-109)` and no exact `#00ff00` pixels were detected.

## 2026-07-07 - Immortal Veteran Worker Player Walk Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop walk animation grid for the Immortal Veteran Worker persona player character.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/player_revival_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing Immortal Veteran Worker concept with yellow hard hat, cheek bandage, rolled sleeves, work pants, and dark boots. Heavy walk poses, lamp blink states, and dust puffs are present, with frame 8 reading as a loop-back pose toward frame 0. Estimated raw-cell largest-character-component center drift is about 85px horizontally and 32.5px vertically across 418px cells; bottom-anchor drift is about 31px. Including dust puffs, full foreground bbox center drift is about 117px horizontally and 32.5px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background values were roughly `rgb(10-13,238-242,9-13)`, with 0 exact `#00ff00` pixels detected.

## 2026-07-07 - Elite Legal Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless idle-loop animation grid for a Legal Director boss with black robe-like suit, giant red seal stamp, and contract scrolls.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/elite_legal_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing Legal Director boss concept with black robe-like suit, giant red seal stamp, and contract scrolls. The stamp raise/slam, red impact flash, and contract flutter stages are present, with frame 8 returning close to the idle pose. Estimated full-foreground bbox center drift is about 100px horizontally and 64px vertically across 418px raw cells, affected by the raised stamp, impact flash, and fluttering scrolls; darker lower-body/feet bottom-anchor drift is about 33px. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background values were roughly `rgb(4-22,239-248,3-15)`.

## 2026-07-07 - Fresh-Graduate Meat-Wall Summon Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless idle-loop animation grid for a fresh-graduate meat-wall summon: chubby determined intern in oversized suit holding a giant binder as shield.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/mob_opc_wall_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, cropping, or image cleanup was performed.
- Verification: saved project copy is byte-identical to the generated source PNG.
- Visual/drift check: all 9 cells show the same right-facing chubby intern in oversized suit with a giant binder shield. Binder height, sweat drop, and subtle foot-shuffle/bob stages are present; frame 8 is close to frame 0 for looping. Estimated raw-cell foreground bbox center drift is about 26.5px horizontally and 21.5px vertically across 418px cells; bottom-anchor drift is about 21px. Background is visually green but not mathematically exact uniform `#00ff00`; sampled corner colors were roughly `rgb(11-14,245-247,9-12)`.

## 2026-07-07 - Elite CFO Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 idle-loop animation grid for the CFO chief financial officer boss.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/elite_cfo_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing CFO boss concept with pinstripe suit, golden abacus, red budget-cut scissors, and falling coin sparkles. The abacus-flick, scissor-snip, and sparkle stages are present and the final frame returns close to the base pose. Estimated largest foreground-component center drift is about 36.5px horizontally and 16px vertically across 418px raw cells; bottom-anchor drift is about 16px. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background-like pixels were roughly `rgb(12-16,235-238,15-20)`.

## 2026-07-07 - Data Annotator Player Walk Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop walk animation grid for the Data Annotator persona player character.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/player_rlhf_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing Data Annotator player character with dark hoodie, headphones around the neck, tired determined face, and giant red marking pen held like a sword. Walk-cycle leg/arm changes, red pen-tip glow, and hoodie-string bounce are present. Estimated raw-cell foreground bbox center drift is about 30px horizontally and 21.5px vertically across 418px cells; bottom-anchor drift is about 23px, with the bottom row sitting higher than the top rows. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background values were roughly `rgb(14-17,242-245,14-17)`.

## 2026-07-07 - Wenxin Golden Pie Disc Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop animation grid for a golden glowing pie disc spinning like a coin with crumb sparkle trail.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_wenxin_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the 9 frames show a coherent golden pie-disc coin spin with crumb sparkles; frames 2 and 7 are edge-on, and frame 8 is an oval return phase into frame 0. Estimated largest-disc-component center drift is about 45px horizontally and 62.5px vertically across 418px raw cells, mainly because the bottom row sits higher than the top row. Including crumb sparkles, foreground bbox center drift is about 59px horizontally and 62.5px vertically. Background is visually green but not mathematically exact uniform `#00ff00`; edge samples were around `rgb(14-16,240-243,13-16)`.

## 2026-07-07 - Boss Desk-Slam Shockwave Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 one-shot animation grid for a boss desk-slam shockwave attack.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_bossslam_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames progress from two fists hitting the ground through expanding shockwave rings, floor cracks, paper sheets, coffee splash, settling dust, and an empty final cell. The fist design is consistent across non-empty frames, but the whole foreground envelope shifts because the maximum shockwave/paper burst is much wider/taller than the later fade frames. Estimated non-empty raw-cell bounding-box center drift is about 33px horizontally and 64.5px vertically across 418px cells. Background is visually green but not mathematically exact uniform `#00ff00`; sampled values had no exact `#00ff00` matches.

## 2026-07-07 - OPC Purple Digital Clone Worker Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless-loop walk animation grid for a purple digital clone worker summon with glitch jitter on frames 3 and 7.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/mob_opc_clone_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing purple digital clone office worker with consistent outfit, neon outline, and walk-cycle leg/arm stages. Frames 3 and 7 include the requested displaced pixel glitch artifacts. Estimated raw-cell foreground bbox center drift is about 52.5px horizontally and 23.5px vertically across 418px cells; bottom-anchor drift is about 25px, with the bottom row sitting slightly higher. Background is visually green but not mathematically exact uniform `#00ff00`; sampled corner colors were roughly `rgb(7-10,240-242,5-8)`.

## 2026-07-07 - Qwen Shotgun Pellet Cluster Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 seamless loop animation grid for a compact orange shotgun pellet cluster.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_qwen_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same compact three-bean orange pellet cluster tumbling through a loop. Estimated raw-cell foreground bounding-box center drift is about 20px horizontally and 37px vertically across 418px cells; bottom-row frames sit higher than top-row frames. Background is visually green but not mathematically exact uniform `#00ff00`; sampled background values ranged roughly `rgb(12-15,247-249,11-15)`.

## 2026-07-07 - Legendary Weapon Fusion Burst Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 animation grid for a legendary weapon fusion burst one-shot VFX.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_fusion_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the sequence reads as a gold-purple legendary weapon fusion burst, with rings, maximum starburst, weapon silhouette, sparkle shower, sparse sparkles, and an empty final cell. The main F1-F5 foreground bbox center drift is about 15px horizontally and 12.5px vertically across 418px raw cells; all non-empty frames drift about 16px horizontally and 22.5px vertically. F0 is less ideal because the two incoming chips are not both clearly contained as a pair in the same cell. Background is visually green but not exact uniform `#00ff00`; sampled corners were around `rgb(17-23,236-242,12-16)` and F8 center was `rgb(4,247,6)`.

## 2026-07-07 - Slacker Artist Player Walk Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for the slacker artist persona player walk cycle.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/player_slacker_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing relaxed slacker artist with Hawaiian shirt, sunglasses on head, one hand in pocket, and phone in the other hand. Lazy walk poses, shirt sway, and phone-screen flicker are present, and frame 8 reads as a loop-back pose toward frame 0. Estimated raw-cell foreground bbox center drift is about 30px horizontally and 15px vertically across 418px cells; bottom/feet anchor drift is about 17px. Background is visually solid green but not mathematically exact `#00ff00`; sampled background corners ranged roughly `rgb(9-14,244-248,11-16)`.

## 2026-07-07 - Elite CTO Department Boss Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one raw 3x3 idle-loop animation grid for the CTO chief technology officer boss.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/elite_cto_dept_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254 RGB PNG.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 cells show the same right-facing CTO boss concept with gray hoodie, glasses, keyboard shield, and floating code windows. The typing highlights, code scroll, and glasses glint vary across frames as requested. The background is visually green but not mathematically uniform `#00ff00` (only one sampled pixel matched exactly). Estimated raw-cell foreground bbox center drift is about 16.5px horizontally and 6.5px vertically across 418px cells; frame 8 is close to the base pose but sits slightly left/lower versus frame 0.

## 2026-07-07 - OPC Contractor Hologram Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a right-facing translucent light-blue hologram contractor worker walk loop.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/mob_opc_contractor_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the 9 frames show the same right-facing light-blue hologram contractor worker with hardhat, badge lanyard, scanlines, and walk-loop leg/arm changes. Estimated raw-cell cyan/outline bounding-box center drift is about 27px horizontally and 13px vertically across 418px cells; bottom-anchor drift is about 15px, with the bottom row sitting slightly higher. Background is visually green but not mathematically exact uniform `#00ff00`; sampled edge values were roughly `rgb(11-14,236-240,5-8)`.

## 2026-07-07 - Kimi Cyan Light-Arrow Sniper Bolt Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only; generate one raw 3x3 animation grid for a long cyan right-facing light-arrow sniper bolt with front-to-back rippling afterglow loop.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_kimi_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the 9 frames show a consistent right-facing cyan light-arrow sniper bolt with the glow ripple moving front-to-back and returning toward the front for the loop. Estimated raw-cell foreground bounding-box center drift is about 8.5px horizontally and 29.5px vertically across 418px cells, with lower-row frames sitting slightly higher than the top row. Background is visually green but not mathematically exact uniform `#00ff00`; sampled corner colors ranged roughly `rgb(3-5,247-249,2-5)`.

## 2026-07-07 - HR Enforcer Minion Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for an idle-loop HR Enforcer minion.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/elite_hr_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the 9 frames show the same HR enforcer with clipboard, pen, badge, blazer, and right-facing stance. Pen tap, badge glint, collar-adjust, and side-glance stages are present. Estimated raw-cell bounding-box center drift is about 13.5px horizontally and 11px vertically across 418px cells; bottom-anchor drift is about 11px. Background is visually green but not mathematically exact uniform `#00ff00`; sampled edge values were roughly `rgb(2-27,238-252,1-17)`.

## 2026-07-07 - Persona Portrait/Card Icon 3x3 Raw Sheet

- Requested: use `~/.codex/skills/.system/imagegen/SKILL.md`; generate one raw 3x3 grid of 9 different retro pixel-art game icons/subjects; save raw only to `src/assets/generated/frame_tests/portrait_sheet_raw.png`; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/portrait_sheet_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, resizing, or image cleanup was performed. Note: the generation prompt requested a 1024x1024 canvas, but the built-in tool returned 1254x1254; the raw output was preserved as generated.

## 2026-07-07 - Deepseek Energy Bullet Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a tiny deep-blue energy bullet with a whale-tail wisp, pulsing bright-dim as a seamless machine-gun projectile loop.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_deepseek_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all 9 frames show the same right-facing blue bullet/wisp design with a clear bright-dim-bright pulse. Foreground x-position is very stable; measured raw-cell bounding-box center drift is about 2px horizontally and 26px vertically across 418px cells, with the bottom row shifted upward relative to the first two rows. Background is visually green but not mathematically exact uniform `#00ff00`; sampled corner colors ranged roughly `rgb(7-11,245-249,6-12)`.

## 2026-07-07 - Cost-Cutting Executive Player Walk Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for the cost-cutting executive persona player walk cycle.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/player_optimizer_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: all nine cells show the same right-facing cost-cutting executive design with black suit, red tie, slick hair, and red KPI tablet. Walk poses alternate legs, tie sway, and tablet glow; the loop reads as a coherent strut. Background is visually green but not exact uniform `#00ff00`; sampled corners are around `#08f507` to `#1aef12`, with no sampled pixels exactly `#00ff00`. Estimated raw-cell drift: foreground bounding-box centers range about 34px horizontally and 27.5px vertically across 418px cells; bottom/feet anchor ranges about 30px.

## 2026-07-07 - Status Icon 3x3 Raw Sheet

- Requested: use `~/.codex/skills/.system/imagegen/SKILL.md`; generate one raw 3x3 grid of 9 different retro pixel-art status icons; save raw only to `src/assets/generated/frame_tests/status_sheet_raw.png`; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/status_sheet_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, resizing, or image cleanup was performed. Note: the generation prompt requested a 1024x1024 canvas, but the built-in tool returned 1254x1254; the raw output was preserved as generated.

## 2026-07-06 - Spinning Paper Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for an A4 document sheet spinning like a thrown shuriken projectile.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_paper_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames show a white paper sheet rotating through the loop, with edge-on frames at F2 and F7. The middle-center frame appears more like a doubled/stacked sheet than a single clean sheet. Background is visually green but not exact uniform `#00ff00`; sampled background-like pixels ranged roughly `rgb(0-95,135-255,0-79)` and no sampled pixels were exactly `#00ff00`. Estimated raw-cell drift: foreground bounding-box centers range about 38px horizontally and 21.5px vertically across 418px cells.

## 2026-07-06 - Revival Burst VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a golden revival burst / N+1 comeback VFX.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_revive_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames progress from golden seed to unfolding wings, wide wings with halo, maximum halo/pillar, dissolving feathers, scattered feathers, faint sparkles, and an empty final cell. Estimated raw-cell foreground center drift across non-empty frames is about 18.5px horizontally and 130px vertically; the more relevant bottom-anchor drift is about 23.5px horizontally and 58.5px vertically across 418px cells. The final cell is empty. Background is visually green but not exact uniform `#00ff00`; sampled F8 values range roughly `rgb(1,245,1)` to `rgb(17,251,11)`.

## 2026-07-06 - Thrown Coffee Mug Projectile Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a looping coffee mug thrown-projectile tumble.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/proj_mug_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: the sequence reads as a white mug with red heart and coffee/droplet pixels rotating through the loop. Background is visually green but not exact uniform `#00ff00` (corner samples around `#22ee1b` to `#26ee21`). Estimated drift: foreground bounding-box centers range about 62.5px horizontally and 55.5px vertically; foreground centroids range about 57.3px horizontally and 47.0px vertically, with lower-row frames sitting visibly higher in their cells.

## 2026-07-06 - Awakening Evolution Burst VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a purple awakening evolution burst VFX.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_evolution_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames progress from rune circle to vertical beam, white-core pillar, maximum purple pillar with shards, ribbons, sparkles, faint afterglow ring, and empty final cell. The base/ring anchor is horizontally close but shifts left in the wider beam/sparkle frames by roughly 24 raw pixels across 418px cells; the full effect envelope shifts vertically about 154 raw pixels because beam height and sparkle spread change by frame. The final cell is empty. The background is visually green but not exact uniform `#00ff00`; sampled empty-cell values are mostly around `rgb(12,248,5)`.

## 2026-07-06 - Coffee Steam Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a coffee machine steam loop VFX with no cup/machine.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_coffee_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/drift check: frames show the requested steam puff progression, but the background is generated green rather than exact uniform `#00ff00` (sampled colors around `rgb(6-8,248-249,6-7)`). Estimated raw-cell drift: bottom-origin horizontal drift about 13px; bottom-origin vertical drift about 36px, with F8 visibly higher than F0, so the loop is close in shape but not perfectly seamless.

## 2026-07-06 - Critical Hit VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a critical-hit star burst VFX.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_crit_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, or resizing was performed.
- Visual/drift check: frames progress from red-orange dot to 4-point flare, larger outlined star, maximum 8-point burst, rotated shrink, 4 diagonal shards, fading trails, two faint sparks, and empty final cell. The effect remains horizontally stable; non-empty frame bounding-box centers drift about 12px horizontally and 17.5px vertically within raw 418px cells, with the overall anchor consistently about 12-29px above the mathematical cell center. The background appears visually uniform green, but sampled pixels are not exact `#00ff00` and are mostly around `rgb(12,244,13)`.

## 2026-07-06 - Pickup Glint VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a loot pickup glint VFX.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_pickup_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, or resizing was performed.
- Visual/drift check: frames progress from tiny dot, 4-point twinkle, cyan-ring maximum, expanding/thinning ring, rising sparkles, fading sparkles, to empty final cell. Non-empty frame bounding-box centers range about 13.5px horizontally and 81.5px vertically across raw 418px cells; the large vertical range is mainly the intended rising-sparkle tail in F5-F7. Main early frames F0-F4 stay within about 10px horizontally and 24.5px vertically. The final cell is empty. Background is green but not mathematically exact uniform `#00ff00`; sampled background-like pixels range R 0-74, G 209-255, B 0-79.

## 2026-07-06 - Summon Flash Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a blue summon-arrival flash VFX.
- Context read: this process file plus the pixel-animation-grid and imagegen skill instructions were read before generation.
- Generated with one built-in image_gen call only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_summon_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, resizing, or image cleanup was performed.
- Visual/check notes: the 9 stages are present and F8 is empty. Background is green but not exact uniform `#00ff00` (dominant values are around `rgb(16-17,246-247,17-19)`). Estimated frame drift: F2 and F5 are about 20px left of the earlier ring centers; later ring/spark frames also sit visibly higher than F0.

## 2026-07-06 - Nuke VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a huge pixel mushroom-cloud explosion VFX.
- Context read: this process file plus the `pixel-animation-grid` and `imagegen` skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_nuke_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, or resizing was performed.
- Visual/drift check: frames progress from flash to fireball, mushroom cap, smoke, sparse embers, and wisps; backgrounds appear uniformly green. Pixel bounds show base drift around 26.5px horizontally and 22px vertically across the raw 418px cells, with the dissipating smoke/wisp frames drifting right-to-left more visibly than the main blast frames.

## 2026-07-06 - Dash VFX Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for a right-pointing horizontal speed-dash streak burst.
- Context read: this process file and the pixel-animation-grid/imagegen skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/fx_dash_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, or resizing was performed.
- Visual check: the sequence reads correctly from thin start lines through maximum cyan/white burst, fragmentation, fading wisps, and an empty final cell. Vertical centerline is mostly stable; late wisps sit slightly higher by roughly 7-14 raw pixels. Early/final short wisps are horizontally left-biased compared with the maximum burst, while the wide non-empty frames remain flat and right-pointing. The green background appears mostly solid but has mild generated shading/variation rather than perfectly mathematical #00ff00.

## 2026-07-06 - Boss Idle Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only, and generate one 3x3 raw animation grid for the final boss `老板`.
- Context read: this process file and the pixel-animation-grid/imagegen skill instructions were read before generation.
- Generated one built-in image_gen image only.
- Saved raw copy to `src/assets/generated/frame_tests/boss_idle_anim_3x3_raw.png`.
- Actual dimensions: 1254x1254.
- No slicing, chroma-key removal, or resizing was performed.
- Visual check: the boss remains broadly consistent across the 9 cells, with intended mug sip, phone glow, foot tap, and tie-adjust actions. Minor drift remains in limb pose/width and phone/mug offsets; the background appears visually uniform green.

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

## 2026-07-06 - Explosion FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a one-shot retro pixel-art explosion VFX; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/fx_explosion_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: frame progression reads correctly from spark to dissipating smoke, but the green background is not exact uniform `#00ff00` (dominant colors around `#08f20c`), and the non-green bounding-box centers drift up to about 22.5px horizontally and 24.5px vertically across cells.

## 2026-07-06 - Bullet Impact Spark 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a compact bullet-impact spark one-shot burst; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/fx_spark_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: burst center is broadly stable across cells, but the green background has soft variation instead of perfectly uniform pure `#00ff00`; no slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - Slash Arc 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a same-center melee crescent slash-arc one-shot sweep; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/fx_slash_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. Visible drift: large crescent frames 2-5 are broadly aligned, but the full sequence does not perfectly preserve one locked center/radius; frame 6 shifts lower, and frames 0-1/7-8 are sparse/fading segments with visibly different local placement. Background is green but has soft variation instead of perfectly uniform pure `#00ff00`. No slicing, chroma-key removal, or resizing was performed.

## 2026-07-06 - 纯随机流重定义 + 武器特效帧动画（fx_explosion / fx_spark / fx_slash）

- Requested: ①"纯随机"应指彻底不要人设——不锁定、全卡池混抽、整到啥用啥（上一版的"随机分配一个人设"理解有误）；②武器/技能视觉效果不佳，希望用 pixel-animation-grid 做动态特效。
- Implemented:
  - 纯随机流（personaFree）：人设 5 选 1 界面的 🎲 按钮改为开启本局纯随机——永不锁人设（pickLevelChoice 锁定门加 !personaFree）、intro 不再弹出、全人设卡池混抽、里程碑改为从全部 15 条 track 随机抽 3 条；暂停档案显示「自由人 · 纯随机流」。
  - 特效帧动画：按 pixel-animation-grid 两阶段流程生成 3 组 9 帧 VFX——fx_explosion（火花→火球→空心环→烟散，接管全部 boom 类爆炸并保留原技能色细环）、fx_spark（子弹命中火花，updateProjs 命中处新增 spark fx，nearPlayer 限流）、fx_slash（月牙挥砍轨迹，按挥击角旋转，接管键盘/手套 slash）。render.js 新增 FX_ANIM 加载器 + fxFrame(进度取帧)，素材缺失时逐绘制点回退原程序化图形。
- Verification: 纯随机流全链路引擎断言 ✅（专挑人设卡连抽 10 次不锁、五系卡混出、里程碑随机三条 revival+rlhf+optimizer 混排、intro 不再现）；27 帧 VFX 切片零坏帧（spark 首尾帧近全透明为设计使然）；画布采样确认爆炸帧实际绘制（白核 83 + 暖色 263 像素）；真实 UI 截图确认两个新按钮渲染；npm run build 通过；控制台零 error。
- Note: 特效素材同走 generated/ drop-in 管线（fx_<name>_f0..f8），后续可按同法补枪口焰/受击闪/治疗光环等。

## 2026-07-06 - Elite Hallu Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「一本正经胡说八道的专家」, a pale-purple ghost consultant boss idle loop with smoke sway, wispy tail undulation, glitching nonsense report chart, and independently drifting eyes; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/elite_hallu_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: the character design, colors, right-facing angle, suit, report, and eye/report/tail animation are broadly consistent, but the green background has soft variation instead of perfectly uniform `#00ff00`; non-green bbox centers drift by about 54px horizontally and 13px vertically across cells, with the layout trending leftward in later columns.

## 2026-07-06 - Muzzle Flash FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a tiny right-pointing gun muzzle-flash one-shot VFX; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/fx_muzzle_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: sequence reads from pinprick to cross, cone, sparks, smoke, fading pixels, and empty final frame; background is green but has soft variation instead of exact uniform `#00ff00`; flame-source frames F0-F4 have about 9px left-edge drift and 7.5px vertical-center drift, while all non-empty frame bbox centers span about 120.5px horizontally and 22px vertically because the cone and sparks intentionally move rightward.

## 2026-07-06 - Shield Break FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a blue energy shield shattering one-shot VFX; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` after absolute `/dcos/process.md` was unavailable, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/fx_shieldbreak_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: shield-break progression reads correctly from intact bubble to empty frame; frame 8 has no detected foreground; green background is not exact uniform `#00ff00` (corner samples around `(10, 241, 15)`), and detected foreground centers drift about 14.3px horizontally and 24.7px vertically across non-empty frames.

## 2026-07-06 - Elite PPT Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for `PPT 路演大魔王`, a white-suit showman executive boss with floating presentation slide and laser pointer; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the correct raw output byte-identically to `src/assets/generated/frame_tests/elite_ppt_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: idle loop reads as pointer click, chart flip, laser sweep, pose, and glow pulse; green background has soft variation instead of perfectly uniform pure `#00ff00`; character and slide are broadly consistent, but pose/anchor/slide bbox centers drift about 14.5px horizontally and 33.5px vertically across cells.

## 2026-07-06 - Execution Slash FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a dramatic red execution slash mark VFX, from thin diagonal flash through red X impact to empty final frame; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/fx_execute_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible drift: frame progression reads correctly from thin slash to bold white-core red X, dim outlines, center glow, faint afterimage, and empty final frame; green background has visible soft variation instead of perfectly uniform pure `#00ff00`; X/slash anchors are broadly stable in frames 2-5, while the bottom-row center-glow/afterimage frames sit slightly above the nominal cell center.

## 2026-07-06 - Heal Sparkle FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a pure healing sparkle burst VFX, from a tiny green cross through rising crosses/ring/sparkles to an empty final frame; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/fx_heal_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: sequence reads from tiny cross to multi-cross glow ring, fading sparkles, and empty final frame; effect x-center stays within about 12.5px across non-empty cells, while bbox y-center changes by about 184px as expected for the rising one-shot. Background is green but has soft variation instead of perfectly uniform pure `#00ff00`.

## 2026-07-06 - Elite Upman Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「向上管理大师」, a right-facing slick middle-manager boss with a golden UP arrow, badge-polish, thumbs-up sparkle, and hair-shine idle loop; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output to `src/assets/generated/frame_tests/elite_upman_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: character design, right-facing angle, suit, smile, thumbs-up, badge, and golden arrow are broadly consistent, but background green has soft variation instead of exact pure `#00ff00`; full non-green bbox centers drift about 36.5px horizontally and 37.5px vertically across cells, partly from intended arrow bob/glow and sparkle/hair highlights.

## 2026-07-06 - Elite Overfit Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「竞争壁垒专家」, a massive binder-armored bureaucrat boss idle loop with heavy breathing, binder-plate clinks, and fist-pound dust; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_overfit_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: brick-wall bureaucrat design, binder armor, badge, cyan chest panel, red layoff stamp, and fist-pound beat are broadly consistent; background green has soft variation instead of exact pure `#00ff00` with corner samples around `(20, 241, 13)`; foreground bbox centers drift about 23.0px horizontally and 17.5px vertically across cells.

## 2026-07-06 - Elite Snitch Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「小报告专家」, a right-facing sneaky thin clerk boss in a trench coat clutching report memos, with shifty eyes, whisper hand, speech-bubble pulse, memo shuffle, and coat-collar twitch; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_snitch_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: boss design, right-facing angle, trench coat, memo stack, whisper hand, eye darting, and speech-bubble animation are broadly consistent, but background green is close to pure green rather than exact `#00ff00` (corner means around `(4, 248, 4)`); full non-green bbox centers drift about 91.5px horizontally and 25px vertically across cells, partly from the appearing speech bubble and shuffled memo stack, with visible anchor differences between columns/rows.

## 2026-07-06 - Teleport Swirl FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a pure cyan teleport swirl VFX from small dot ring through vortex, implosion flash, fading pixels, and empty final frame; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/fx_teleport_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: frame progression reads correctly from dot/ring to expanded ring, spiral buildup, maximum vortex, collapse, implosion flash, two remnant pixels, and empty final frame; background green has soft variation instead of exact pure `#00ff00` (corner samples around `(17, 247, 20)`); non-green bbox centers drift about 10.0px horizontally and 27.5px vertically across non-empty frames, with the compact flash/remnant frames sitting slightly higher than the main vortex frames.

## 2026-07-06 - Level-Up Promotion Burst FX 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for a pure golden promotion/level-up burst VFX, from thin center-bottom beam through max white-core gold pillar, rising stars/confetti, and final single sparkle; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/fx_levelup_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: the sequence reads correctly from thin beam to full beam, wide white-core/gold-edge pillar, rising stars/confetti, fading stars, and final sparkle; background green is not exact uniform `#00ff00` (corner samples around `(17, 240, 15)` and `(18, 243, 13)`); detected foreground bbox centers span about 41px horizontally across cells, with vertical center changes dominated by the intended rising/fading one-shot stages.

## 2026-07-06 - Elite Injector Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「忽略老板指令的外包同学」, a hooded freelancer boss with a chest laptop, sideways typing, purple code flashes, glance/hood sway, and syringe-shaped USB lanyard; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the correct reported raw output byte-identically to `src/assets/generated/frame_tests/elite_injector_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: character design, purple hoodie, chest laptop, typing poses, right-facing angle, and syringe USB lanyard are broadly consistent; background green is not exact uniform `#00ff00` (corner samples around `(26, 238, 17)` and `(26, 242, 15)`, exact pure green about 0.0001%); foreground bbox centers drift about 34.5px horizontally and 11px vertically across cells, partly from lanyard/USB swing and typing pose; feet clear the raw cell bottom by about 21-32px rather than the requested 2px.

## 2026-07-06 - Office Item 4x4 Raw Icon Sheet

- Requested: use `~/.codex/skills/.system/imagegen/SKILL.md`; generate one raw 4x4 grid of 16 different retro pixel-art office-satire item icons; save raw only to `src/assets/generated/frame_tests/item_sheet_4x4_raw.png`; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and saved a raw copy to `src/assets/generated/frame_tests/item_sheet_4x4_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB. No slicing, chroma-key removal, or resizing was performed. Note: the generation prompt requested a 1024x1024 canvas, but the built-in tool returned 1254x1254; the raw output was preserved as generated.

## 2026-07-06 - Elite Meeting Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「会议邀请官」, a calendar-headed officer boss holding glowing meeting invites, with page flip, invite hover, red-circle pulse, and gentle body-rock idle loop; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_meeting_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible drift: calendar-officer design, right-facing angle, suit, badge, invite stack, page flip, invite hover, and red-circle pulse are broadly consistent; background green has soft variation instead of exact uniform `#00ff00`; character anchor/pose drifts slightly between cells, and page-flip/invite-glow shapes vary beyond pure pixel-pose changes.

## 2026-07-06 - Elite Intern Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「卷王实习生」, a fired-up intern boss with red exercise headband, binder-stack dumbbells, eye flames, flying sweat, and swinging badge idle loop; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_intern_anim_3x3_raw.png`.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: character design, right-facing angle, headband, binder dumbbells, badge, pumping pose, eye-flame flicker, and sweat-drop motion are broadly consistent; background green has soft variation instead of exact uniform `#00ff00` (corner means around `(10-12, 246-247, 9-10)`, exact pure green about 0.0003%); detected foreground bbox centers drift about 32.5px horizontally and 21.0px vertically across cells; feet clear the raw cell bottom by about 26-46px rather than the requested 2px.

## 2026-07-06 - Elite Legal Red-Line Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「法务红线老师」, a stern right-facing legal officer holding a glowing red tape barrier, with tape vibration/glow pulses, weight shift, glasses glint sweep, and snap-taut idle loop; do not slice, chroma-key, or resize.
- Context read: attempted absolute `/dcos/process.md` first but it was unavailable, then read project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_align_anim_3x3_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: legal-officer design, right-facing angle, suit, badge, glasses, and red tape barrier are broadly consistent; animation reads as tape vibration/glow pulse plus glasses sweep; background green has soft variation instead of exact uniform pure `#00ff00` with corner samples around `(6, 248, 6)`; foreground bbox centers drift about 14px horizontally and 18.5px vertically across cells; feet clear the raw cell bottom by about 36-53px rather than the requested 2px.

## 2026-07-06 - Elite Attendance Boss 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md` Phase 1 only; generate one raw 3x3 image grid for 「考勤点名官」, a strict right-facing proctor boss with clipboard, chest stopwatch, pen tap, glare glint, and occasional clipboard raise; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/elite_attendance_anim_3x3_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: character design, suit palette, stopwatch, pen, stern glare, and right-facing angle are broadly consistent and the stopwatch hand visibly ticks, but background green has soft variation instead of exact uniform pure `#00ff00` (corner mean around `(12.4, 246.3, 10.0)`, exact pure green about 0.0004%); the clipboard disappears in a couple of cells instead of staying identical; detected foreground bbox centers drift about 33.5px horizontally and 26.5px vertically across cells; feet clear the raw cell bottom by about 19-46px rather than the requested 2px.

## 2026-07-06 - 素材大扩充（特效 ×6 / 精英立绘 ×10 / 老板待机 / 道具图标 ×15）

- Requested: 用户批准"丰富素材，不要怕浪费 Token"。
- Implemented（18 个生成任务，4 路并行 codex exec，全走 pixel-animation-grid 两阶段管线）：
  - 新特效 6 组九帧：fx_muzzle 枪口火焰（开火时沿准星方向）、fx_heal 治疗绿光（回血豆/咖啡机）、fx_levelup 升职金柱星星、fx_shieldbreak 破盾六角碎裂、fx_execute 处决红 X、fx_teleport 传送漩涡（闪现/电梯两端）；drawFx 新增对应分支，core.js 在开火/回血/升级/破盾/处决/传送处发射，素材缺失静默回退。
  - 精英专属立绘 10 只 ×9 帧待机动画（原来全是换色工人）：PPT 路演大魔王/向上管理大师/小报告专家/会议邀请官/卷王实习生/考勤点名官/一本正经胡说八道的专家/竞争壁垒专家/忽略老板指令的外包同学/法务红线老师；render.js ELITE_ANIM 覆盖（tier2 30px、overfit 34px、tier1 24px）。
  - 老板九帧待机（喝咖啡/看手机/整理领带微动作循环），boss_idle 覆盖 HIFI 双帧。
  - 消耗品专属图标 15 张（4×4 库图一次生成后按 id 切片重命名 item_<id>.png）：冰美式/红牛/期权/N+1/奶茶/画的饼/双倍卡/重置卡/2N/简历刷新/工伤单/病假条/降噪耳机/充电宝/补给袋；pickups 渲染优先用图标。
  - fx_heal 生成的消散偏早（f5 起全空），发射端 life 0.5→0.38 匹配。
- Verification: 195 个新文件全部落盘（fx 81 帧 + elite 90 帧 + boss 9 帧 + item 15 图标），透明校验仅特效首尾"空帧"符合一次性动画设计；npm run build 通过；游戏内放大镜实拍确认：PPT 大魔王/向上管理/小报告立绘 + 升职金柱最大帧 + 画的饼与 N+1 图标同屏渲染 ✅；控制台零 error。
- Debug note: 展台摆拍时假单位缺 spdBase 导致 speedOf NaN 坐标飞失——真实单位不受影响（spawnElite/spawnMob 均设置 spdBase）。

## 2026-07-06 - Office Floor Decal 3x3 Raw Sheet

- Requested: use `~/.codex/skills/.system/imagegen/SKILL.md`; generate one raw 3x3 grid of 9 different muted retro pixel-art floor decals for an office-satire top-down game; save raw only to `src/assets/generated/frame_tests/decal_sheet_3x3_raw.png`; do not slice, chroma-key, or resize.
- Context read: project-local `dcos/process.md` and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Plan: use built-in `image_gen` exactly once, then copy the raw generated PNG byte-for-byte to the requested workspace path and report actual dimensions.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/decal_sheet_3x3_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Note: the generation prompt requested a 1024x1024 canvas, but the built-in tool returned 1254x1254; the raw output was preserved as generated.

## 2026-07-06 - Hurt Splash 3x3 Raw Animation Grid Phase 1

- Requested: follow `~/.codex/skills/pixel-animation-grid/SKILL.md`, Phase 1 only; generate one raw 3x3 image grid for a one-shot player-damage red impact splash VFX; save raw only to `src/assets/generated/frame_tests/fx_hurt_anim_3x3_raw.png`; do not slice, chroma-key, or resize.
- Context read: attempted absolute `/dcos/process.md` first but it was unavailable, then read project-local `dcos/process.md`, `~/.codex/skills/pixel-animation-grid/SKILL.md`, and `~/.codex/skills/.system/imagegen/SKILL.md`.
- Implemented: used built-in `image_gen` exactly once and copied the raw output byte-identically to `src/assets/generated/frame_tests/fx_hurt_anim_3x3_raw.png`, leaving the default generated original in place.
- Verification: saved PNG is 1254x1254 RGB and byte-identical to the generated raw output. No slicing, chroma-key removal, or resizing was performed. Visible/measured drift: F0-F3 main impact bbox centers drift about 7.0px horizontally and 10.5px vertically within raw 418px cells; all non-empty frame bbox centers drift about 22.0px horizontally and 95.0px vertically, mostly from the requested falling droplets in F4-F7. F8 is empty. Background is green but has generated variation instead of exact uniform pure `#00ff00` (sampled green average around `(12.1, 248.5, 15.2)`).

## 2026-07-06 - HR 击杀反馈 / 受击闪光重做 / 素材第三轮 / 武器平衡基准

- Requested: ①击杀老板小兵似乎没统计；②老板受击的透明浮层难看；③继续加大特效素材；④武器平衡不佳。
- Implemented:
  - HR 击杀：实测确认引擎一直在计数（G.kills 0→1 ✅），根因是击杀播报把 isHR 完全排除、毫无反馈——补「✂️ 优化了老板的走狗 xxx」高亮播报。
  - 受击闪光重做：原是整张贴图矩形半透明白块（128px 帧素材上是一大块白浮层），改为 ctx.filter='brightness(0) invert(1)' 按精灵剪影闪白。
  - 素材第三轮（12 个生成任务）：fx_nuke 蘑菇云（四种核爆共用）、fx_crit 暴击星芒、fx_hurt 玩家受击溅射、fx_dash 冲刺残影（按方向旋转拖尾）、fx_pickup 拾取闪光（chip/模组）、fx_evolution 觉醒紫柱、fx_revive 复活金翼（三处复活共用）、fx_summon 召唤上岗蓝圈（OPC+AI 替身）、fx_coffee 咖啡机蒸汽循环（有存货才冒气）、proj_mug/proj_paper 九帧旋转弹道贴图（马克杯/文件类子弹）、decal×9 地面贴花（咖啡渍/散落文件/线缆等，每局撒 46 个）。发射点 12+ 处、drawFx 查表分支、drawProj/drawProp 贴图钩子、newGame 贴花生成。
  - 武器平衡：搭建满级 DPS 基准（6 厚血靶串糖葫芦、120px 瞄准、12 秒、蓄力兼容压枪节奏；排坑：靶偏轴 ±14px 时直线弹道全脱靶导致首轮五把误测为 0）。基准前带宽 12~385（32 倍）：Claude 385 超模、通义 12 崩底。调参 10 处（claude dmgMax 42→18/cd .45→.5、grok 10→7、glm 17→14、gemini 6→10、qwen 4.6→7.5+聚拢+射程 150、doubao 12.5→16、deepseek 2.3→2.9、chatgpt 10→12），调后 39~198（约 5 倍，且贴脸霰弹在此基准天然低估）：Claude 198 / Grok 130 / Midjourney 128 / GLM 118 / Kimi 114 / 文心 111 / MiniMax 76 / ChatGPT 69 / 豆包 61 / DeepSeek 57 / Gemini 50 / 通义 39。
- Verification: HR 计数实测 ✅；核爆 4817 亮 px、复活金翼 790、暴击星芒 50、咖啡蒸汽开关对照差值 59 ✅；贴花 46/局 ✅；两轮全武器基准复测 ✅；npm run build 通过；控制台零 error。generated/ 累计 652 个素材文件、57 组帧动画。

## 2026-07-06 - 自瞄预判 + 工位炮台手感修复

- Requested: 全自动模式好几把武器打不到人；工位钉子户（MiniMax）射速慢打不到小怪最垃圾。
- Root cause: ①全托管自瞄与全部炮台（工位/交付节点/知识库/订书机/僚机）都瞄目标**当前位置**，慢弹对移动怪几何上不可能命中（110px/s 横移 × 0.47s 弹道 = 51px 偏移 vs 5.5px 命中窗）；②抛物线武器（文心）的落点在桌面全托管下取**鼠标位置**距离（等于随机落点）；③MiniMax 本体数值孱弱（弹速 320、射速 .75、伤害 6）。
- Implemented:
  - updateUnit 每帧记录单位速度（_vx/_vy），新增 leadAim() 预判助手（按弹速与距离计算提前量，上限 0.9s）。
  - 接入 6 个开火点：全托管主武器自瞄、工位炮台（弹速 320→430、射程 ×1.2）、十倍交付机节点、知识库炮台、订书机/脚本终端、武器僚机 drone。
  - 抛物线落点：全托管下改用自瞄目标距离（复用 touch.aimTarget 通道）。
  - MiniMax 数值：cd 2.5→2.2、dmg 6→8、shotCd .75→.5、deployLife 12→14、range 190→220。
- Verification: 移动靶（110px/s 折返、150px 距离、全托管）——ChatGPT 直线弹 0→17 DPS（无预判时几何不可命中）、Gemini 29、Claude 蓄力 31、文心抛物线（旧：随机落点）→45、MiniMax 44；全托管完整试用期 3 局：修复前 52~88s 必死 → 修复后 2/3 局存活满 240s 模拟窗；npm run build 通过；控制台零 error。

## 2026-07-06 - 小 Boss 博弈重做 + 武器识别度/主武器抽卡/双持系统

- Requested: ①小 Boss 技能设计没有博弈感；②武器芯片识别度差、难攒同款升级、主武器应能被抽到、希望能双持 2-3 把主武器。
- Implemented:
  - 小 Boss 博弈循环（tier2 全部 6 种考核官）：追击 → 签名技预警（ringwarn/beam 明确标记，0.55~0.8s 躲闪窗）→ 爆发 → **破绽窗口**（1.6s 易伤 35% + 减速，飘字"破绽！狠狠输出！"）→ 循环。签名技各具身份：PPT 三连激光横扫（穿缝）、向上管理三连冲撞（拉开落点）、小报告轨迹四连爆（别走直线）、会议邀请三大圈+减速水渍、卷王实习生标记飞扑重锤、考勤官三点名圈（穿空隙）。全部走 delay() 游戏内队列。
  - 武器芯片识别度：CHIP_ICONS drop-in 通道（chip_<id>.png，12 品牌徽记式芯片图标生成中）+ **攒芯片指示圈**：同款可升级=金圈脉冲、可进副手空槽=青圈——一眼锁定该捡哪块。
  - 主武器进卡池：「同款芯片速递」（主武器 +1 级，满级后转副手；权重 .9）——难攒同款的问题由地面金圈 + 卡池双通道解决。
  - 双持系统：Lv6+ 卡池出现「🗡 双持工牌」（权重 1.15）解锁第二主武器槽；异款芯片自动装入副手、同款芯片/速递卡可继续升级副手；副手与主武器同角度同时开火，55% 伤害（wpnDmg._offhand）；换枪/融合仍作用于主手；HUD 显示副手状态；机器人不享受双持。
- Verification: 双持全链路 ✅（抽卡解锁→异款自动装备 deepseek Lv2→同款升 Lv3→主副双色弹幕同屏）；速递卡出现率 6/60 轮、双持卡 7/60 轮、选中主武器 +1 ✅；博弈循环状态机 chase→burst（预警特效 115 帧）→recover（易伤 0.35）→chase 实测运转 ✅；npm run build 通过。

## 2026-07-07 - 素材第四轮（角色/弹道/部门Boss/图标全家桶）+ 人设头像 UI 接线

- Requested: 在"还缺哪些素材"清单（7 类）中用户勾选了战斗优先（状态图标/全武器弹道/融合与Boss技能特效）+ 角色优先（人设皮肤+头像/部门Boss与HR与OPC召唤立绘/芯片图标）——即除环境细节外全部补齐。
- Implemented（34 个生成任务，5 条 codex lane 并行 + 1 条补漏 lane）：
  - 人设：5 套玩家走路循环 `player_<persona>_f0..8`（降本增效官/摸鱼艺术家/RLHF/活人矿/OPC）+ 5 张头像 `portrait_<persona>` + 4 张卡类图标 `cardicon_*`（库图 3×3 切）。
  - 弹道：12 种主武器专属弹 `proj_<id>_f0..8`（DeepSeek 鲸鱼弹/Kimi 月牙/Claude 星芒橙珠/Gemini 双子星…）；发现 proj_glm、proj_claude 漏排任务，补 FIX lane 重排。
  - 部门 Boss：6 个 `elite_<id>_dept` 待机动画——键名与 data/tech.js 的 DEPT_BOSSES 精确对齐，drop-in 零改动生效。
  - HR 制服兵 `elite_hr`、OPC 召唤物三件套 `mob_opc_clone/contractor/wall`（走 v2.4 sprKey 通道）。
  - Boss 技能特效：`fx_bosspie`（画大饼）/`fx_bossroar`（咆哮点名）/`fx_bossslam`（拍桌冲击波）/`fx_fusion`（传说融合爆发）。
  - 图标：9 个头顶状态图标 `status_*`（幻觉/过拟合/复读/举报/易伤/无敌/减速/眩晕；burn 备用未接——引擎暂无单体灼烧状态）+ 12 个品牌芯片 `chip_<id>`（4×4 库图）。
  - UI 接线：LevelUpScreen 人设卡右上 34px 头像、PauseScreen 员工档案行 20px 头像（import.meta.glob eager）。
- 排坑: zsh 数组下标从 1 起导致 chip 库图切片整体错位一格（chip_deepseek 变月亮）——全部删除按 0 起重切并逐格目检；proj_chatgpt/doubao raw 到货未切补切；切片脚本对 4×4 库图先缩放 1024 再 crop 256。
- Verification（引擎驱动 + 像素 hash 对照 + DOM）: 人设 5 选 1 卡头像 5/5 张 128px 加载 ✅；锁定人设后玩家皮肤像素 hash 变化 ✅；暂停档案头像 portrait_slacker 128px ✅；全自动开火弹丸 sprKey=proj_chatgpt ✅；状态图标行（眩晕+易伤+减速）头顶像素变化 ✅；部门 Boss cfo/cto/legal 三皮肤像素对照 ✅；OPC 三召唤物贴图 ✅；4 个 Boss 技能 fx 中段帧采样 ✅；npm run build 通过；控制台零 error。generated/ 累计 925 个素材文件、84 组九帧动画。

## 2026-07-07 - PWA 全屏支持 + 移动端 MOBA 化操控 + 世界放大（Boss 例外）

- Requested: ①移动端浏览器不能全屏，做 PWA；②移动端要 MOBA 式操作体验；③移动端所有东西都放大，除了 Boss。
- Implemented:
  - **PWA 四件套**：`public/manifest.webmanifest`（display fullscreen + 锁横屏 + maskable 图标）、`public/sw.js`（导航 network-first 保更新，静态资源 stale-while-revalidate——925 个素材边玩边缓存，二次进入秒开可离线）、`index.html` iOS/安卓全套 meta（apple-touch-icon/black-translucent/theme-color）、`main.jsx` 仅生产注册 SW（dev 防缓存干扰 HMR）。图标用 portrait_slacker 摸鱼艺术家生成 192/512/maskable/180 四规格。
  - **进场即全屏**：签到进场按钮借用户手势 requestFullscreen + screen.orientation.lock('landscape')（iOS 网页不支持则静默跳过，靠 PWA 安装达成）；StartScreen 移动端加"添加到主屏幕"提示（standalone 模式下自动隐藏）。
  - **世界放大 4/3（Boss 例外）**：移动端逻辑视口 640×360→高度锁 270、宽度按屏幕长宽比 16:9~21:9 自适应（如 iPhone 14 横屏=584×270），全面屏无黑边无裁切；单位/特效/飘字全部视觉放大 33%；drawUnit 三处 Boss scale ÷ MOBILE_ZOOM 保持原视觉大小。cam clamp 从硬编码 320/640/180/360 参数化为 VIEW_W/H。
  - **MOBA 技能盘**：右下拇指弧区重排——冲刺主键 80px 右下角、Q 战术 60px 左弧、E 大招 68px 上弧（就绪时金光呼吸）、换枪/融合情境键外弧、暂停右上；冷却 conic-gradient 扫盘遮罩 + 秒数 + 按压缩放反馈 + navigator.vibrate 震动；真触屏设备开局即显示（老逻辑要先摸屏幕才出现）；摇杆 96→124px、行程 44→54。
  - **HUD 放大**：pointer:coarse 下四角锚定 scale 1.22（血条/波次/小地图/击杀播报），不动布局流。
  - **调试通道**：`?mobile=1` 强制移动模式（IS_COARSE 统一判定源，input.js IS_TOUCH 改为 re-export）。
- Verification: `?mobile=1` + 844×390 视口——逻辑视口 584×270 按屏比自适应、canvas 铺满 843×390、zoom=4/3、manifest display=fullscreen、sw.js 可达 ✅；技能盘四键落位精确（80/60/68/42px + 弧形坐标）、摇杆 124px ✅；Q 冷却扫盘渲染 ✅；Boss 变身渲染冒烟 ✅；桌面无参数回归 640×360/zoom=1 ✅；npm run build 通过；控制台零 error。真机全屏/安装/震动需手机实测。

## 2026-07-07 - 移动端 HUD 减遮挡重做（横批/武器说明收纳）

- Requested: 移动端界面仍不好——顶部横批文字、底部武器说明等 HUD 元素遮挡地图/战场。
- Root cause: 桌面 HUD 布局直接硬塞进手机横屏（顶部中央两行大 tag、底部中央 220px 武器卡带整句说明、左上技术模组长文字串、Q/E 芯片与触屏技能盘信息重复），上一轮的 HUD scale 1.22 放大进一步加剧。
- Implemented:
  - 顶部横批：两行（存活牛马 X/20 + 试用期波次长句）压成**单行 10px 小字**「👥20 · 1/6月 · 第 1/3 波 · 9/16」；ZoneWarn 同步缩小。
  - 底部武器卡：去掉整句 wpn-hint 说明与 min-width 220，只留 图标+名字+等级点，从底部中央**挪到左下角**（156×33，原 220×52）；双持副手用 8px 迷你徽标表达。
  - 信息去重：移动端隐藏 Q/E 芯片条（右下技能盘已带冷却）、技术模组长串（暂停页可查）、开火模式 tag；killfeed 限 2 条 9px。
  - 回滚上一轮 HUD scale 1.22/1.15 放大（遮挡元凶）；小地图 84px；暂停键挪至小地图左侧（原先重叠）。
  - 判定源统一：触屏样式从 @media (pointer: coarse) 全部迁到 **body.is-touch**（main.jsx 按 IS_COARSE 打 class），?mobile=1 调试通道下 JS/CSS 行为完全一致；rotate-hint 同步迁移。
- Verification: ?mobile=1 + 844×390——顶部单行 21px 高（原两行 ~50px）、武器卡左下 156×33、暂停键与小地图无重叠、Q/E 条与 tech-tag 不渲染、战场中央整屏干净（截图确认）；桌面无参数回归：双行横批/武器说明/Q/E 条全部恢复 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 对手物种二分（人卷人+人卷AI）+ HRBP 裁员官

- Requested: ①对局不该只有"人和 AI 卷"——要人与人卷、人与 AI 卷；②设计 HRBP 角色：主打裁员，盯绩效排名垫底的（绩效 C），有 PUA 技能和"劝主动离职"技能。
- Implemented:
  - **物种二分**：19 个 bot 拆成 9 名人类同事（botNames 人名池；人格偏"人情世故"：摸鱼×3/老油条×2/向上管理/关系户/普通×2）+ 10 台 AI 牛马（新增 aiNames 池 20 个："降本增效Bot·丙""幻觉严重的GPT实习生""天天OOM的大模型"…；人格偏"机械内卷"：卷王×5/外包×3/救火/普通；命中更准 aimErr×.75）。u.species 挂单位；latentBots 转正空降同步携带。
  - **物种化播报**：AI 被"下架（算力已释放）/越界运行被红线下架回收"，人类同事沿用"优化"；开场 intro 重写点明"人卷人、人卷 AI、AI 也卷 AI"+ HRBP 预警。
  - **AI 徽标**：render 头顶青色 AI 角标（无标=人类），一眼分物种。
  - **HRBP · 人力业务伙伴**（ELITES.hrbp，不进随机精英池）：转正后绩效盘点计时（首次 50s，之后 70-95s）登场，场上限 1 位、决赛圈（存活≤3）不来。行为树 updateHrbp：
    - 锁定绩效垫底者（存活牛马按 kills→level 升序，**含玩家**）→ 贴脸 58px 内开始 **5s PUA 约谈读条**：目标减速被按在工位上、每 1.2s 心理伤害 2.5 + 飘 PUA 语录（hrbpLines 10 条："公司是平台，你要感恩""这次绩效 C 不是针对你"…）。
    - 读满条：bot「主动离职」（killUnit cause='resign'，不算任何人击杀，掉落照常）；玩家吃心理暴击 22 + 幻觉诅咒 6s + 减速 3s。裁掉 2 个完成季度指标，深藏功与名离场（走出地图边静默消失）。
    - **反制①**：约谈期间打掉他 12% 血 → 摘工牌暴走（裁员函三连弹幕，沾幻觉），转为可杀精英；**反制②**：被约谈者当场击杀任意敌人 →「绩效重新评估」换目标。
    - 击杀掉 N+1 大礼包：+2 高品模组 + n1_package 消耗品 + 25 xp。
  - **约谈可视化**：HRBP 头顶粉色读条"约谈中" + 到目标的虚线连线 + 目标脚下脉动警圈。
  - 素材：elite_hrbp 待机动画（藏青正装+工牌+离职文件夹+假笑）codex 生成中，drop-in 通道（elite_<type>）到货即生效；字符画兜底已有（ELITE_SKINS.hrbp 藏青）。
- 排坑: `u.talkT` 初值 undefined，`undefined <= 0 === false` 跳过初始化 → NaN 读条永不启动，改 `!(u.talkT > 0)`；死亡函数名是 killUnit 不是 die；spawnElite 随机词条会给 HRBP 上"留痕"（15% 闪避）——验证时一发没打死是词条生效非 bug。
- Verification（引擎驱动）: 物种 9 human/10 ai 名字人格分池 ✅；HRBP 50s 登场并锁定 0 杀的玩家（真实垫底）✅；约谈读条+心理伤害 13.5 ✅；玩家全托管火力打疼 → 暴走+幻觉弹幕（反制①天然触发）✅；远端 bot 被读满 5s 条「主动离职」存活 19→18、quota=1 ✅；第二目标读条 1s 时 kills+1 → 读条清零+换目标（反制②）✅；击杀 HRBP 掉 3 模组+1 道具 ✅；渲染冒烟无报错；npm run build 通过；控制台零 error。

## 2026-07-07 - 玩家职业路线扩展：HRBP 人设 + PPT 路演大师人设

- Requested: 敌人有 HRBP、PPT 大师，玩家的职业路线里也应该能走这两条（"我自己也可以成为 HRBP / 汇报专家"）。
- 与已有系统的关系: v2.5 已有「职位工牌」系统（击杀 HRBP/PPT 大魔王掉工牌习得对应 E 大招，"干掉他，成为他"）；本轮补的是**从 Lv2 就能选的完整职业成长线**（人设第 6/7 号），两者可叠成完整 build：走 HRBP 人设 + 杀 HRBP 精英拿工牌 E。
- Implemented:
  - **人设六 HRBP·编外人力伙伴**（PUA 控制/裁员流）：PUA 气场（周围敌人伤害 -6%/层，实测 100→58）、优化提成（击杀回血）、裁员函速递（周期自动寄函：伤害+致幻）、责任转移（受击甩锅致幻攻击者）、劝退话术（紫·处决 35% 概率改为策反 8s，30 次采样 8 次转化）、季度大裁员（橙·每 40s 集体约谈屏内 3 个最低血敌人）+ Q「绩效约谈」（点名重伤+眩晕+易伤，Lv2 实测 70 伤）+ 里程碑（更大的会议室/加急挂号信/裁员指标超额）。
  - **人设七 PPT 路演大师**（汇报光锥/爆发流）：激光笔（暴击）、对齐颗粒度（站定攻速）、路演光锥（周期扇形+眩晕，复用敌方 PPT 大魔王 coneflash 结算）、画大饼（受击致幻+灼伤攻击者）、向上汇报（杀精英获伤害 buff）、年终述职（橙·每 55s 全屏冲击+自身 buff，实测屏内 22 伤+眩晕）+ Q「现场演示」（三连光锥，delay 队列 0.25s 间隔）+ 里程碑（更大的投影幕/镀金激光笔/全场起立鼓掌）。
  - 接线：PERSONA_LABELS/STARTER_SKILLS/PauseScreen PERSONA_NAMES 注册；defaultMods 16 个新字段；结算点——applyDamage 入口（PUA 减伤 clamp 65%）、killUnit（击杀回血/向上汇报）、fireProcs 新 case（hrbpBlame/bigPie）、tryExecuteTarget（劝退策反+25% 血"赔偿"防秒杀）、updatePersonaSkills（气场/裁员函/大裁员/光锥/述职/颗粒度 6 段运行时）、castActive 两分支、castPlayerCone helper。
  - 素材：player_hrbp/player_reporter 走路循环 + portrait_sheet2（两张头像 3×3 库图）codex 生成中，drop-in 通道到货即生效。
- 顺手修: ELITES.meeting 与 demand_chair 同名「需求评审会主席」导致开始界面图鉴 React key 冲突（54 条控制台警告）——月度版改名「需求评审终审主席」+ 图鉴 key 从 name 换成条目 id。
- Verification（引擎驱动）: 人设 intro 7 选 1 含两新人设 ✅；锁定 hrbp 后 PUA 气场 foe.puaWeakPct=.30、实测承伤 100→58.2 ✅；裁员函自动发射（带 hallu 弹）✅；击杀回血 ✅；Q 绩效约谈 70 伤+眩晕+易伤+CD 11s ✅；处决劝退 27%/35% 采样吻合 ✅；Q 现场演示三连锥 ✅；年终述职全屏 22 伤+buff ✅；两组里程碑 track 与 milestoneLabel ✅；npm run build 通过。

## 2026-07-07 - 梗系可视化被动 8 连发（轻数值、重演出）

- Requested: 主动技能不宜再多（认可现状），但要更多梗和整活元素——考虑大量被动技能，不只是数值增加，要有视觉效果。
- 设计原则: 每个被动都"看得见"——飘字/粒子/常驻绘制/召唤演出，数值只做轻佐料；全部复用现有演出管线（addFloat/addParts/addFx/ONESHOT_FX/OPC 召唤通道），零新增资产依赖。
- Implemented（通用池 +8，全员可抽）:
  - 🪷 **电子木鱼**（绿）：击杀敲木鱼攒功德（每 5 杀飘计数），30 功德自动兑一次免死（"功德护体"金光，revivefx 复用，可反复攒）——排在一次性免死手段之前结算。
  - 🎓 **恭喜毕业**（白×2）：击杀精英/处决时三色彩带+横幅"恭喜毕业！"+2s 加速——"他的工位，现在是你的了"。
  - 🪑 **办公椅漂移**（白×2）：冲刺拖出办公椅残影+轮子火花，冲刺 CD -12%/层；2 层双椅残影。
  - 🔔 **下班闹钟**（蓝）：每 45s 准点响铃横幅"到点了！假装要下班"，8s 移速+25%/射速+15%+下班速度线粒子。
  - ✓✓ **已读不回**（绿×2）：被举报/点名 40%/层 概率直接掰掉标记（弹"已读 ✓✓"）——上升沿统一拦截全部 6 处施加源。
  - 💬 **精神股东**（蓝）：Boss 登场自动喊话"这个季度我不看好你"，Boss 对你伤害 -15%（心理建设完毕）。
  - 🧭 **工位风水阵**（紫）：站定 1.2s 展开旋转罗盘（双层反向虚线圈+吉福旺禄四方位字，渐显渐隐），圈内每秒回 2 HP+闪避 +10%，移动即散。
  - 📋 **Ctrl+C/Ctrl+V**（紫）：击杀 8% 概率原地粘贴半透明分身帮打 6s（复用 OPC clone 召唤+专属立绘）。
- 排坑: Ctrl+CV 初版挂在 killer.kills++ 之后——杂鱼击杀在这之前就 return，割草时永远不触发 → 挪到 isMob return 之前与木鱼同段；假 Boss 测试单位缺 mods 字段导致 applyDamage 崩（测试脚本问题非产品）；HMR 双实例再次坑截图（reload 后 eval 裸 import 与页面 ?t= 实例分家，React overlay 不消失——重启 server 后正常，产品无碍）。
- Verification（引擎驱动）: 40 杀=40 功德+计数飘字 ✅；merit 30 时受致死伤触发功德护体（-30 功德复活）✅；已读不回 9/10 拦截（p=.8）✅；下班闹钟 8s buff（spdM 1.25）+横幅 ✅；恭喜毕业彩带+spdM 1.24（2 层）✅；精神股东 Boss 100 伤→85 精确 -15% ✅；风水阵渐显 alpha 1+回血+金色像素 36 个（罗盘可见）✅；Ctrl+V 分身粘贴+飘字 ✅；办公椅 🪑 残影 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 梗密度 P0：同事嘴替 + 办公室随机事件 + 连杀高光

- Requested: 提升梗的密集度与惊喜感——先形成完整设计文档，再按优先级开发。
- Design doc: **dcos/meme-density-design.md**（三时间尺度惊喜节奏理论 / 5 大系统 / 16 个随机事件 / 9 组嘴替语料 / 7 个金色时刻 / 连杀档位表 / 防刷屏三原则 / P0-P2 排期）。
- Implemented（P0 三系统）:
  - **同事嘴替（秒级）**：bubble() 气泡管线——按物种抽语料（human/ai 双池 9 组 60+ 句）、局内同一单位不重复同句、防刷屏三闸（单位 8s 冷却/全局 1s≤2 条/屏幕外不发）。钩子 8 处：被打抱怨（25%）、残血逃跑宣言（30% 血一次性，"我先去个厕所"/"电量不足请充电"）、bot 击杀 worker 感言（50%，跨物种嘲讽优先："机器抢什么工作！"/"碳基效率太低了"）、升级感言（40%）、摸鱼碎嘴（4s 抽屏内一只 30%）、被 HRBP 锁定惊呼、决赛圈全场感言（一次性）、工资到账齐呼。
  - **办公室随机事件（局级）**：转正后每 45~75s 抽一个（排除上一个+条件过滤），📋 横幅+演出+规则改变+收尾播报。P0 八件套：💼老板巡楼（全员减速 3s）、🖥️服务器崩了（全场 AI 眩晕 2.5s——物种系统联动，人类复仇窗口）、🧋下午茶（治疗道具雨）、📸团建合影（全场敌人拉到一点停格 1.2s）、💰工资到账（经验球雨+bot 齐呼"到账了！"）、🫓老板画饼（全场敌人致幻 3s 玩家免疫）、🔍行政查工位（8s 全场物资磁吸向玩家）、⚡双倍配额（全场含玩家射速 +40% 6s）。
  - **连杀高光（波级）**：2.5s 窗口任何击杀都算——5 杀"卷出水平了"、10 杀横幅"这位更是重量级"+震屏、15 杀"卷王之王"+全场 bot 冒"卷不过卷不过"、20 杀"建议公司直接上市"+金粒雨；单帧 ≥5 杀"🍲 一锅端！"；处决三连"裁员名单又划掉三行"。
- Verification（引擎驱动）: 嘴替 hurt 气泡实弹"💬我要投诉"✅、flee 上升沿 ✅；连杀 10 杀=飘字(5)+横幅(10) ✅；事件引擎 30 轮抽取 8/8 事件全触发零报错（double_quota 射速 buff 精确 1.4）✅；npm run build 通过；控制台零 error。
- 未做（按排期）: P1=事件 9~16（消防演习/大瓜降临/网络故障/空调坏了/电梯故障/静音会议/猎头来电/周报时间）+ 金色时刻 7 项；P2=环境彩蛋。

## 2026-07-07 - 梗密度 P1：事件补全 16 件套 + 金色时刻 + 字号放大

- Requested: 三系统再丰富一些；气泡/飘字字太小怕看不到。
- Implemented:
  - **字号放大**：气泡 7→9px 加亮（#dfe6f2）停留 1.9s；连杀"卷出水平"10→12、"一锅端"12→14、"裁员名单"9→11、恭喜毕业 10→12、功德 7→8.5、Ctrl+V 9→10。
  - **事件 9~16 上线（引擎共 16 个）**：🚨消防演习（站定>1s 持续掉血 8s）、🍉大瓜降临（随机 bot 复用"被举报全场集火"6s+头顶大瓜）、📶网络故障（在飞子弹半速+4s 窗口）、🥵空调坏了（G.evtHeatT→speedOf 全场×.85+热降频碎嘴）、🛗电梯故障（3 个敌人被塞进电梯又吐出来+teleportfx）、🤫静音会议（敌方 muteFireT 闭麦 2.5s——updateWeapon 整段 return，不能只压 wantFire：蓄力武器"松开即发射"会被反向触发）、📱猎头来电（残血 bot 冒"涨薪 50%？马上到"1.4s 后 killUnit cause='headhunt' 光速跑路）、📝周报时间（站定缓回血 6s 全场休战+"在写了在写了"）。
  - **金色时刻 7 项**：🏆年度优秀员工（击杀 1%：横幅+金彩带+双倍掉落）、☕隐藏菜单（咖啡机 5%：三倍恢复"店长请你"）、✨镀金芯片（spawnChip 2%：+2 级+金光柱，实测 5/200=2.5%）、🧋电梯惊喜（开门 3%：滚出 3 杯奶茶）、🪑开局风水（1%：全属性+5%）、🧧这单免费（useItem 2%：效果翻倍）、📅幸运周五（开局 5%：掉落+15% 横幅"今天周五（并不是）"）。
  - **语料扩充**：crossKill/salary 各+1，新增 witness（目睹死亡）/heat（空调）/weekly（周报）三池；连杀补 30 杀档"卷到 CEO 当场退位"；无伤 60s"带薪站桩大师"称号（noHitT 复用，一次性/局）。
- 排坑: 静音会议初版只压 wantFire=false——蓄力武器走"松开发射"分支反而开火，改为 updateWeapon 头部整段 return（cd 不走，闭麦结束立刻能打，更符合直觉）；bot 开火有"打打停停"正弦节律，验证对照组需强制 bot.target+长 decideT。
- Verification（引擎驱动）: 16/16 事件全量触发零报错（含 4 个条件事件）；空调减速 speedOf 比值精确 0.85；闭麦对照组 未闭麦 1 发 vs 闭麦 0 发；镀金芯片 200 采样 2.5%（设定 2%）；npm run build 通过；控制台零 error。

## 2026-07-07 - HRBP 刷屏事故修复（粉色瀑布/[Bug]前缀/自证循环）

- Requested: 实机截图出现大面积粉色文字瀑布刷屏 + HRBP 显示为"[Bug]HRBP·编外人力伙伴"，要避免这类问题。
- Root causes（三个独立问题叠加）:
  1. **粉色瀑布**：updateHrbp 追人/约谈用同一个 58px 距离阈值——玩家在阈值边界移动时每两帧穿越一次，"别跑，就聊五分钟"无冷却地每次穿越都 addFloat，几秒堆出数百条粉字瀑布。
  2. **[Bug] 前缀**：HRBP 走 spawnElite 通用路径被随机精英词条附身，抽到"Bug"词条后名字变"[Bug]HRBP"——玩家视角像真的 bug 标签；"留痕"（闪避）等词条还干扰约谈博弈。
  3. **自证死循环**（隐性）：割草玩家 kills 持续增长 → 反制②"当场击杀自证"每次触发都中断约谈 → 重选目标仍是垫底的玩家 → 立刻重新开始 →"开始约谈/自证"两条 feed 每秒多次刷屏；且反制②只认 killer.kills（不含杂鱼），割杂鱼根本自证不了。
- Implemented:
  - 距离阈值**滞回**：开始约谈 <58px、中断需 >78px（边界抖动物理上不可能反复穿越）；"别跑"语录加 4s 冷却（u.quipCd）。
  - HRBP **禁入词条池**（spawnElite 排除 type==='hrbp'）。
  - **自证豁免**：自证成功目标获 8s 约谈豁免（hrbpImmuneT），被完整 PUA 后 10s 豁免；hrbpPickTarget 跳过豁免期目标（全豁免则 HRBP 深藏功与名离场）；"开始约谈"feed 加 3s 冷却兜底。
  - **anyKills 全量击杀计数**（含杂鱼，连杀/木鱼同段维护）：自证判定改用它——清琐事也是绩效。
  - **addFloat 全局上限 120 条**（超出丢最老）：任何未来路径失控刷字都不会再堆成瀑布，一票否决式兜底。
- Verification（引擎驱动，重现原事故场景）: 玩家在 50↔70px 边界抖动 300 帧——"别跑"0 条（旧代码约 150 条）、floats 总量 5 ✅；HRBP 生成 20 次无词条前缀 ✅；锁血读条中杀杂鱼 → 豁免生效 + HRBP 转头锁别的 bot（retarget=other-bot）✅；玩家全托管火力打疼 HRBP → 暴走（反制①）路径顺带复验 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 默认静音

- Requested: 默认静音。
- Implemented: audio.js muted 初始 true（摸鱼场景第一原则），toggleMuted 持久化到 localStorage('niuma_muted')——用户手动开过声则跨局记住偏好；BGM 复用同一 isMuted() 无需改动。
- Verification: 无记录首载 isMuted=true ✅；toggle 开声→存 '0'、再关→存 '1' ✅；build 通过。

## 2026-07-07 - 试用期卡波死循环修复（54/56）+ 逃避型怪收尾机制

- Requested: 玩家反馈试用期 3/3 月第 3 波卡死在 54/56 永远无法转正；另有怪物一直保持距离躲到墙角，体验差。
- Root cause: 两问题同源——**逃避型 AI 没有收尾机制**。第 2-5 月波次混编含"工资小偷"（玩家靠近 200px 即反向逃跑、永不退场）与 keepDist 风筝怪（后撤撞墙后缩在墙角）：尾波剩最后几只时变成全图躲猫猫，追不上/找不到 = 波次计数永达不到 target。
- Implemented（波次收尾三保险 + 贴墙修复）:
  - ①**清场狂暴**：pool 空且剩 ≤5 只（或卡波 25s）→ 全部标记 waveRush——小偷/风筝怪放弃逃避 AI 走通用追击（"快下班了：剩余琐事主动找上门"），并画绿色边缘箭头指位。
  - ②**对账兜底**：每 2s 审计 `killed + 存活波次怪 < target` → 直接补账——任何"怪凭空消失不走 killUnit"的未知路径全部自愈，波次物理上不可能再卡死。
  - ③计时器随波重置（startTrialSubWave）。
  - ④**keepDist 贴墙切向绕行**：后撤位移≈0（撞墙/地图边）→ 沿墙切向滑动，两边都堵死换向——不再缩在墙角扭动。
- Verification（构造原事故现场）: 伪造 54/56 + pool 空 + 场上仅剩 2 只波次怪 → 2.5s 内残怪获 waveRush 标记；将 2 只直接 alive=false 蒸发（模拟最恶劣的漏计数）→ 对账补齐、**波次成功推进到第 2 波**（waveAdvanced=true）✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 武器平衡评估 v2（成长质变专项）

- Requested: 玩家实测"回旋镖升满级也只有一个镖太垃圾"，要求重新评估武器平衡并出报告。
- Delivered: **dcos/weapon-balance-review-v2.md**——双轴评估（满级 DPS 实测 × 升级质变审计）。
- 核心发现: 12 把武器仅 2 把升级有质变（通义 Lv3/5 +弹、MiniMax Lv3 +炮台），其余 10 把 Lv1→Lv5 纯 ×1.3/级数值——与 6 把传说"每把独立机制"的设计标准严重不一致；DPS 带宽（场景修正后）51~196 约 4 倍，下位圈豆包/Gemini/DeepSeek/ChatGPT 又弱又无聊（四象限左下重灾区）。
- 改造建议已入报告: 每把一条"看得见"的质变线（Lv3 小质变/Lv5 大质变）——回旋镖 Lv3 双镖 Lv5 三镖、豆包 2/3 豆、Gemini 三/四联装、DeepSeek 双/三管、ChatGPT 会心弹、Kimi 灼痕+缓存命中、Claude 快蓄宽束、GLM 4/5 链+末端爆、文心大饼半径+燃烧饼、Midjourney 出金弹型；多弹武器底伤微降防超模。待用户拍板后实施。

## 2026-07-07 - 武器每级质变全面落地（v2.7）

- Requested: 评估报告方案"Lv3/Lv5 两节点"仍不够——要更好的武器升级效果。
- Implemented: 12 把武器全部改为 **Lv2/3/4/5 每级都有可见质变**（详表见 weapon-balance-review-v2.md §六）：机枪双管→三管、狙击缓存返CD+自动补射、回旋镖双镖→三镖、豆包 2→3 豆、Gemini 三联→四联+周期5联扇、ChatGPT 金色会心弹、Midjourney"出金"弹型+垫刀保底、文心燃烧饼+双饼、GLM 5链+末端爆、Claude 快蓄宽束+满蓄背刺束、MiniMax 部署提速+台寿命+台射速、通义聚拢+射程；弹丸尺寸随级微增（Lv5≈+24%）纯视觉练度感。底伤 9 把同步下调防多弹超模。
- 排坑: chainZap 第 8 参被 stun 占用，endBoom 挪第 9 参；explodeAt burn 字段名是 t 不是 life；gacha 概率级联误改原四型等概率分布（改回 randi 保底）；Kimi Lv3 stun .3 会形成硬控链 → 降 .15；Kimi 返 CD 放 anyKills 段（杂鱼击杀也算）。
- Verification: 全 12 把 Lv5+Lv1 双基准（6 靶串列 10s）——deepseek 64→144、gemini 51→113 下位翻身；kimi 420→303（压 stun/补射/底伤三刀）、wenxin 244→213；场景修正带宽 ≈2.8×；Lv1 全场 6~57 早期梯度健康；npm run build 通过；控制台零 error。

## 2026-07-07 - 素材第五轮启动（v2.7 演出欠账 + 图标全家桶）+ 环境彩蛋 P2 实装

- Requested: 继续用 codex 生成所有需要的素材（含动画帧）。
- 生成任务（15 个，3 lane 并行, enrich4_batch.sh N/O/P）:
  - Lane N（战斗演出 5）: fx_pot 一锅端天降大锅、fx_confetti 彩带（毕业/年度优秀共用）、fx_woodenfish 木鱼功德、fx_goldstar 出金/会心金星、fx_flash 合影闪光灯——全部 oneshot 九帧。
  - Lane O（场景 5）: fx_burnpie 燃烧大饼 loop、proj_gold 金色会心弹 loop、fx_alarm 警报灯 loop、fx_paperrain A4 纸雨、fx_waterspill 水花——文心 Lv4 燃烧饼/ChatGPT 会心/MJ 出金/消防演习/环境彩蛋配套。
  - Lane P（图标库图 5 张 4×4）: sub_sheet1/2（22 件副武器全量图标）、active_sheet1/2（32 个 Q/E 主动技能图标）。
- 代码接线（生成期间同步完成）:
  - render: ONESHOT_FX +8 项、fxLoop() 循环取帧 helper、G.burns 支持 spr 帧贴图（燃烧饼）。
  - core 发射点: 一锅端 potfx、恭喜毕业/年度优秀 confettifx、功德每5声 woodenfishfx、出金/会心 goldstarfx+proj_gold sprKey、团建合影 flashfx（替换 nukefx 占位）、消防演习 alarmfx（life 8 慢放）、文心燃烧饼 spr 标记。
  - **环境彩蛋 P2 实装**（onObstacleDestroyed）: 打印机→A4 纸雨+「又卡纸了」；饮水机/饮料柜→水花+水渍滑区（burns slow .35 4s，owner=玩家只滑敌人，speedOf 现成消费）+「小心地滑」；绿萝→「我做错了什么」；咖啡机→「终于能休息了」。
  - UI 图标: src/components/icons.js（SUB_ICONS/ACTIVE_ICONS glob）→ LevelUpScreen GEAR/ACTIVE 卡 30px 图标、PauseScreen 副武器/Q/E 列表 16px 图标（缺图回退 emoji）。
- 待唤醒收货: anim×10 切片、sheet×4 按键名语义切片（0 基索引防 zsh 坑）、build、fx/图标验证、报告。

## 2026-07-07 - 环境特效层（素材 lane Q + 程序氛围全套）

- Requested: 环境特效缺很多，很糟糕——办公室是"死棚子"：战斗不留痕、设施是静物、没有光没有空气。
- 素材 lane Q（6 任务, enrich4_laneQ.sh）: env_decal_sheet（3×3 战斗残留贴花：大/小焦痕、墨渍溅/点、碎纸堆、工牌残骸、裂地砖、封条、灰堆→切 decal_f9..f17 并入贴花池）、fx_lightpool 顶灯光晕 loop、fx_acflow 空调飘带 loop、fx_printeridle 打印机吐纸 loop、fx_coolerbubble 饮水机气泡 loop、elevator_doors 电梯开门九帧 oneshot（gap#7 欠账）。
- 程序接线（立即生效）:
  - **战场记忆**: addBattleDecal()——爆炸留焦痕（大爆大痕 i9/小 i10）、牛马/精英倒下留墨渍 i11、杂鱼 25% 小渍 i12；上限 90 丢最老。实测杀 6 人 +6 渍 ✅。
  - **环境点位**: newGame 生成 36 盏顶灯（每 chunk 中心）+ 18 个空调风口（隔行 chunk 顶边），render 用 fxLoop 画（素材未到货静默跳过）。
  - **设施 idle**: 打印机吐纸抖动、饮水机气泡（复刻咖啡机蒸汽模式）；电梯门帧动画（开 0.5s 播帧/关前倒放，程序绘制回退）。
  - **空气颗粒感**: 屏内低频漂浮尘埃（2.2/s 慢速灰粒，parts 管线复用，稳态 ~6 颗）实测 ✅。
- Verification: lightSpots 36/acVents 18 ✅；动态 decal 6/6 ✅；尘埃粒子 ✅；渲染冒烟（fxLoop null 安全）✅；npm run build 通过。素材到货后（wakeup 收 N/O/P/Q 四 lane）：Q lane 切片——env_decal_sheet 用 slice_lib3.sh 命名 decal_f9..f17，4 个 loop + elevator_doors 用 slice_anim.sh。

## 2026-07-07 - 素材第五轮收货验证（20/20 全量落地）

- 收货: 四 lane 21 任务全部到货——战斗演出 fx×5（pot/confetti/woodenfish/goldstar/flash）、场景 fx×5（burnpie/proj_gold/alarm/paperrain/waterspill）、图标 sheet×4（22 副武器 sub_* + 32 主动技能 active_*）、环境 lane×6（env_decal_sheet→decal_f9..17、lightpool/acflow/printeridle/coolerbubble loop、elevator_doors 九帧）。generated/ 累计 1109 个 PNG。
- 排坑: FX_ANIM glob 只收 fx_* 前缀——elevator_doors_f* 永远进不了容器（电梯门帧动画装死），合并第二个 glob 修复；验证脚本挪玩家后未跑 update 导致相机不跟随、屏幕中心采样全偏（waterspill/电梯门两项假阴性），挪人后 update 一帧即真阳。
- Verification: fx 冒烟 10/10（含 burnpie 贴图燃烧区、lightpool 呼吸、alarmfx 慢放）✅；proj_gold 与 proj_chatgpt 会心混流 ✅；UI 图标三处上屏（升级 GEAR 卡 sub_laserpen/ACTIVE 卡 active_blink、暂停页 16px 图标）✅；环境彩蛋实弹（机枪打爆打印机→纸雨+「又卡纸了」、饮水机→水花+「小心地滑」+滑区 burns）✅；电梯门开合帧、打印机吐纸 idle、顶灯光晕呼吸 ✅；目检 fx_pot 铁锅砸地/sub_stapler 红订书机/active_talk_invite 约谈桌/decal_f9 焦痕/elevator_doors_f4 半开门/coolerbubble 水桶 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - v2.8 全量落地：小 Boss 重做 + 梗怪二期 14 只 + 梗事件/技能/道具/文案（设计文档全案实施）

- Requested: "都整，不要担心时间，好好整上，好玩就好！"——miniboss-mobs-design-v2.8.md P0~P3 全量开发。
- **P0 小 Boss 重做**（6 考核官+6 部门 Boss 继承）:
  - 通用框架: 登场亮相（1s 定格+开场台词+震屏）、**半血红温**（怒吼击退波+提速 15%+体型+10%+红色剪影脉动 tint）、全程嘴替（BOSS_QUIPS 12 Boss×5 时机 60+ 句台词，3s 冷却局内不重复）、死亡演出（遗言+0.25s 顿帧+离职播报）。
  - 六套二阶段 cast2: PPT**掀真桌子**砸人（家具从场上消失）+五连激光；向上管理**偷玩家 buff** 穿身上（击杀加息 1.3× 归还）；小报告**举报信雷阵**（可被子弹引爆拆除）+匿名疾跑半透明；会议主宰**闭门会议结界**（r140 出圈掉血+散会超长破绽）；卷王实习生**吞地面芯片自我升级**（死亡连本带利吐出+1 块）；考勤官**全员打卡**（3 根光柱 3.5s 内碰任一→Boss 破绽 2.5s，超时旷工重罚）。
  - render: 红温剪影滤镜、结界旋转虚线圈、打卡机金色呼吸柱。
- **F1/F5 文案**: 窝囊费到账播报（xp 拾取 3s 节流）、灵活就业死亡文案×2、面试黑话 tips×4、耗材文案、付费上班结算彩蛋（EndScreen 账单行）、开工全场齐呼"早安打工人"、死亡遗言池（human/ai 分池含"在我电脑上是好的"）、flee 池+创业/idle 池+社畜。
- **P1 事件 6**: 🏛️编制降临（金 offer 落地全场怪抢着上岸，玩家先到大奖/怪碰到作废——实测可抢）、🎂35 岁警报（随机在场精英被系统当场优化，白给掉落——实测真裁）、📅调休通知（BR 怪潮+“调休已到账 0.5 天”）、🐺狼性培训（敌人互咬 6s）、📉组织扁平化（全场精英降级 5s）、🚇早高峰（12 只减速怪四边涌入）。
- **P1 技能 3 + 道具 2**: 战术性躺平（站定 2s 躺倒贴图旋转 90°+索敌减半，接 aggro 消费点）、就地摆烂 Q（坐下无敌不能动"爱咋咋地"）、精神离职（<30% 血攻速+20%移速+10%）；毕业大礼包（HRBP 劝退掉落+开 2 件）、创业计划书（60% 全属性+15% / 40% 天使轮跳票扣血）。
- **P1+P2 梗怪 14 只**（16 组九帧立绘全到货切片）: 复印机成精（吐纸人+死亡全场纸人碎屑雨）、A4 纸人、人体工学椅（台球反弹+3 撞喘气——实测反弹中）、提桶跑路侠（30s 抓不到挥手跑路/被抓桶=毕业礼包+道具）、咖啡因狂人（布朗运动+每 6s 自撞晕 2s）、裁员纸箱人（**纸箱传承**：死后箱子留 8s 其他怪捡走+20% 血转世）、楼道抽烟怪（烟雾遮罩+15% 闪避）、干电池人（电量打空瘫痪 3s 补刀窗口否则满血复活——实测瘫痪）、KPI 曲线蛇（8 节链式跟随+断口重生新头——spawnMob 挂链）、需求文档塔（5 层血掉层变矮变快+死亡纸张雪崩）、年会主持人（把杂鱼编 4 列方阵推进+死亡方阵散伙逃 3s）、HR 磁铁（吸 2s 推 2s 循环——实测相位运转）、00后整顿人（**中立怪专打精英/Boss**）、精神内耗小人（原地自斗掉血+被打短暂反击）、屎山代码巨兽（大体型减速拖尾）；波次编排入月 2~5 + BR 池 6 只。
- 素材: 4 lane 20 任务全到货（16 mob + fx_paperburst/avalanche/smokezone/offer），目检复印机/00后卫衣/屎山面团全在线。
- Verification: tier2 亮相→半血红温→cast2 全链路（attendance 抽验）✅；事件 6/6 全触发（编制可抢+35 岁真裁）✅；椅子反弹/电池瘫痪/磁铁相位/躺平/摆烂锁定+无敌/精神离职爆发 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 自传播分享卡系统 + 50 人大厂模式 + Claude 全托管修复（v2.8.1）

- Requested: ①构建用户自传播链条（结算分享内容）；②50 人对局可选；③Claude 武器升级后全托管无法开火。
- **Claude bug 根因**: v2.7 给蓄力加了 Lv2/3 缩短（实际上限 effT < def.chargeT），但全托管三处"蓄满松手"判定仍比较旧 def.chargeT——蓄力永远充不到旧上限、判定永远"没蓄满"、永不发射（Lv1 时两值相等所以正常）。修复：chargeCapOf() 统一 helper，updateWeapon 与三处自瞄判定同源。实测 Lv3 全托管 240 帧 30 个光束帧 ✅。
- **50 人模式**: newGame(trialMonths, botCount) 参数化、G.botCount 动态显示（HUD/EndScreen）、StartScreen「公司规模」选项（20 人小作坊/50 人大厂，localStorage 持久化）、aiNames 扩池 20→25（49 bot = 24 人类 + 25 AI 全不重名）。实测 49 bot 双物种配比 ✅。
- **自传播分享卡**（sharecard.js，全前端零后端）:
  - 设计哲学：为"群里第三者的 3 秒钟"设计——身份表达>炫耀>测试邀请>乐子；病毒句替用户写好转发文案，消灭分享摩擦。
  - **牛马人格判定**（14 种，先命中先得）：最后的牛马（吃鸡金卡）/卷王之王（15 连杀）/新卢德主义斗士（专杀 AI）/窝里横冠军（专杀人类）/绩效逆袭者（被 HRBP 约谈还进决赛圈）/一锅端大厨/优化执行官/公司羊毛精/带薪禅修大师/梦想粉碎机（抓提桶侠）/速通离职选手（<60s 死）/考核官克星/陪跑型牛马/普通型牛马——每种带判词+专属病毒句。
  - 行为埋点 G.stats：killsHuman/killsAI/maxStreak/potCount/execCount/itemsUsed/hrbpTalked/bucketKilled/bossKilled/events（8 处采集）。
  - **数据梗化**：工龄+存活百分位（伪 CDF）、击杀→"为公司节省年薪 ¥N 万"、排名+在职状态。
  - **稀有章**：本局遭遇的最稀有事件盖章+真实概率背书（"亲历【编制降临】，仅 0.9% 玩家见过"）。
  - **竖版 540×720 像素风考核报告**：红条纹眉头+人格大标题+人设头像（模块级预热 Image，修复同步 drawImage 空框）+判词+三条梗化数据+稀有章+病毒句+挑战钩子（"我是 XX，你是什么牛马？"）+游戏名/URL。
  - 分享通道：Web Share API 原生面板带图 → 降级下载 PNG+剪贴板复制文案；EndScreen 主位金色按钮「把这份考核发到群里」+人格判词行内预览。
- Verification: Claude Lv3 全托管开火 ✅；49 bot 不重名双物种 ✅；死亡结算人格判定「一锅端大厨」精准命中（potCount=1）✅；分享卡 canvas 内容/头像/判词/病毒句/钩子目检 ✅；npm run build 通过；控制台零 error。
- 后续（P1/P2 已在方案中）: 局内高光埋点提示、复仇钩子伪联机（?avenge= 参数）。

## 2026-07-07 - 分享卡多样性（v2.8.2）

- Requested: 离职证明（分享卡）要有多样性——同版式重复分享无新鲜感。
- Implemented（四层随机）:
  - **文书类型 8 种**（按结局先命中）: 吃鸡《优秀员工证书》金纸"年度卷王"章 / <60s 死《试用期不合格通知书》"查无此人"章 / 被 HRBP 谈过《绩效改进计划 PIP》淡紫纸 / 红线死《旷工处理决定书》/ 被 Boss 杀《向上管理事故报告》/ 杀 AI≥8《人机对抗表彰令》"碳基之光"章 / 前 25%《季度考核评定表》/ 默认《离职证明》——各配专属编号前缀、眉头文案、印章文字/颜色、纸色。
  - **视觉随机**: 主印章角度抖动、35% 概率回形针/咖啡渍/透明胶带装饰、40% 概率额外小章（下次一定/建议重开/已阅/不予受理/再接再厉）、落款单位 5 选 1（人力资源部/牛马管理委员会/降本增效办公室…）。
  - **文案轮换**: 高频人格（普通/陪跑/速通/禅修）verdict×2-3 + viral×2-3 数组随机。
  - **🎲 换个版式按钮**: EndScreen 预览缩略图 + 重摇——不满意当场换一张，摇卡成为结算页玩法；分享发送的是预览选中的那张。
- Verification: 4 种死法 → 4 种不同文书 ✅；同局连摇 10 次落款 5 种/病毒句 3 种/杂章 5 种 ✅；双卡目检（速通红章卡 vs PIP 淡紫卡+回形针）差异明显 ✅；预览→换版式→再换 src 均变化 ✅；npm run build 通过；控制台零 error。

## 2026-07-07 - 结算页信息重排（v2.8.3）

- Requested: 结算静态数据"物料感"重——随身武器/装备模组两行去掉，凸显干掉同事。
- Implemented: 双主角大数字并排（#排名/总人数 + ✂️击杀数红色大字），副标一行梗化（为公司节省年薪 ¥N 万 · 本次工龄 · 职级）；删除随身武器/装备模组行（库存信息不上结算桌）；表格仅留本局账单彩蛋。
- Verification: 实机截图——✂️7 人红色大数字视觉主角确认；build 通过；控制台零 error。

## 2026-07-07 - 自查修复三处（v2.8.3b）

- 自查发现: ①《向上管理事故报告》永不触发——文书判定用正则猜死因文本（/老板|考核官|Boss/），而小 Boss 实名"PPT 路演大魔王/绩效校准委员会"等全都匹配不上 → deathInfo 加结构化 byBoss/byZone 字段（killer.isBoss || eliteTier===2），buildReport 弃用字符串猜测；②win 判定 playerRank<=1 在初始 0 时活人误判金卡 → 收紧为 ===1；③结算双大数字窄屏加 flexWrap 保险。
- Verification: 被"绩效校准委员会"击杀 → byBoss=true →《向上管理事故报告》正确出具 ✅；活人 rank0 不再金卡 ✅；build 通过；控制台零 error。

## 2026-07-08 - 隐身体验三连修（v2.8.4）

- 用户反馈：①隐身没有透明/不可见效果 ②绿植范围太小 ③隐身还会自动攻击。
- 修复：①render 只处理了 sneakT 漏了 hiddenT——现在隐身画成半透明幽灵态（alpha≈.3 微脉动），入隐飘字"🌿 隐身了"；②T3_HIDE_RADIUS 26→60（原来要踩进花盆），绿植脚下加虚线范围圈（靠近浮现/站进加亮），公告板提示同步改写；③隐身纪律：自动/全托管扳机在隐身时保持沉默（蓄力武器保持蓄力不松手），手动开火=主动暴露并 1.2s 内不可再隐（hideLockT）。
- 顺手揪出老 bug：T3 刷新外层循环用 pl.hiddenT>0 当"已找到"哨兵，残留隐身也>0，decor 数组里的绿植会被整个跳过 → 改显式 inBush 标记，隐身时间从锯齿衰减变持续刷新。
- Verification: preview_eval——站圈内 1s 后 hiddenT 恒 1.5、离开残留衰减归零；全托管隐身 60 帧 0 发弹、手动开火 1 发且 hiddenT 立即 0/lock 0.72；截图确认虚线圈+半透明；控制台零 error；build 通过。
- 坑复盘：vite 对 HMR 失效过的模块用 ?t= 时间戳 URL，裸 URL dynamic import 会拿到第二个模块实例（getG()=null）——重启 vite 后再验才同源。

## 2026-07-08 - 震屏加距离门槛（v2.8.5）

- 用户反馈：屏幕经常疯狂震动，影响体验。
- 根因：addShake() 一直是全局无条件生效——explodeAt/explodeAtNoRecurse（几乎所有 AOE/投掷物爆炸都走这两个共享函数）、掩体被击破、快递空投落地、人设觉醒大招（年终述职/996核爆/业绩展示/全员大会核爆）、小Boss登场亮相/半血红温，全都不看距离直接震屏。50 人大逃杀里全图随时在互殴，玩家在角落也会被离屏几百像素外的爆炸/处决刷到最大震屏——这就是"疯狂震动"的来源。
- 修复：addShake(v, x, y) 加可选坐标，传坐标时用已有的 nearPlayer()（300px）门槛过滤，不传坐标视为玩家自身动作照旧全局（融合/技能/受击等本来就在玩家脚下发生）。逐个梳理 48 处调用点：14 处补上坐标门槛，其余确认本来就限定在玩家/单一Boss身上或已被 <340px 施法距离间接保护，不用动。
- Verification: 单测 addShake(v,farXY)=0、addShake(v,nearXY)=v、addShake(v)=v（无坐标兜底）全部通过；49 人塞到玩家 1500px 外互殴 5 秒游戏时间（33 人阵亡，密集触发 explode/kill 事件）maxShake 全程为 0；build 通过；控制台零 error。

## 2026-07-08 - v2.9 爽感大版本：多武器原生化 + 办公室近战线 + 割草/技能数值重做

- 用户反馈：还是不好玩不够爽——技能不爽、割草不爽、武器种类少、多武器不该靠技能解锁、要近战武器。
- 诊断（dcos/shuang-design-v2.9.md）：①双持槽卡在 Lv6 抽卡里，80% 游戏时间单枪；②副手 55% 像装饰；③转正后涓流 22s/3-6只/cap14，割草循环在正赛直接消失；④12 把全远程，近战爽点空缺；⑤E 大招 26-35s CD 一局按不了几次。
- 多武器：双持开局原生解锁（删双持工牌卡）、副手 55%→70%；新增三号位 Lv9 进度自动解锁（独立自瞄=随身炮台，50% 伤害）；芯片拾取自动填空槽/升对应槽，升级卡池补三号位速递。
- 新武器（OF 办公室武器科，4 把近战 + 2 传说）：客制化机械键盘(swing 弧形横扫/击退/Lv5 旋风)、人体工学椅(orbit 环绕连击)、楼道灭火器(spray 锥喷减速/Lv5 过热爆)、红色订书机(stab 高频穿刺)；键盘+椅→「工位绞肉机」(4 键盘刀环绕+2.2s 360°冲击波)、灭火器+订书机→「安全生产月」(超宽喷+穿透订书钉+泡沫)。RECIPES 8 对无孤儿。
- 数值：涓流 9s/8-14只/cap36（终圈 16s/16）；蜂群杂鱼 touch 下调（email2.5→2 等 8 项）；actives 全表 Q CD-15%伤+30%、E CD-20~25%伤+35%（裁员通知 55/80/110、领导拍板 130/190/260 等 26 条）。
- 渲染：slash 弧光扇形 fx、orbit 椅子/键盘刀实体绘制+拖影、spray 泡沫粒子走 parts；图鉴新增办公分区；HUD 国别"办公"标签+近战操作提示+三槽状态。
- Verification: preview 引擎测试——双持开局解锁✅；键盘 2s 清贴身 10 只+slash fx✅；灭火器 8/8、绞肉机 8/8、安全生产月 6/6 清场✅；订书机 6 杀 4✅；Lv9 三号位解锁+异款芯片自动装入+150px 外独立命中（主武器近战够不到，伤害只能来自三号位）✅；20s 野怪存量 12（旧版同期 ≤6）✅；截图确认环绕椅子+武器卡文案；build 通过；控制台零 error。

## 2026-07-08 - v2.9.1 多武器改抽卡博弈（用户否掉开局白送）

- 用户反馈：不要开局解锁双持——多武器应该是升级时的选择项，宽（多枪）vs 深（单枪到顶）+ 随机性才是博弈。
- 改动：①删开局 weapon2Unlocked=true 与 Lv9 三号位自动解锁；②升级卡池新增「🗡 双持上岗」（无副手时进池，卡上随机滚一把未持有武器，每次升级重掷）与「📎 编外枪位」（有副手且 Lv8+，同样随机滚，独立自瞄 50%）；③地面异款芯片不再自动开槽——同款升已有槽/主武器悬停换枪，回归纯运气位；④HUD 删"槽空缺"提示。
- 保底调参：初测武器卡 w=1.15 在大卡池里 10 连抽 0 出场（博弈被藏没）→ 权重提到 4/3 + 连续 2 次未上桌强制顶替一张通用技能卡（不吃 pity/人设保证位）。
- Verification: 受控探针——开局无双持✅ 地面异款芯片不开槽但可悬停换枪✅；9 次常规抽卡双持卡出现 4 次、最大间隔 1✅ 卡面武器随机重掷✅；拿卡后副手=卡面武器（deepseek）✅；有副手+Lv8 后三号位卡出现并生效（extinguisher 独立自瞄）✅；build 通过；控制台零 error。
- 教训：新增卡进大池必须同时设计"出场保障"（权重+干旱保底），否则等于没做。

## 2026-07-08 - v2.9.2 多武器定稿：VS 模式四槽（用户第二次纠偏）

- 用户反馈：①最多允许 4 把武器；②武器就是升级抽卡里的普通卡——选已有=升级、选新的=多一把，不要"双持卡/Lv8 编外枪位"这种哪个游戏都没有的奇怪门槛。
- 改动：删 dualweapon/thirdweapon 两张门槛卡与 chipup 三连卡，统一为两张卡：「武器升级」（随机挑一把已持有未满级 +1 级，w1.5）+「新武器上岗」（有空槽时随机滚未持有武器，装进下一个空槽，w2.2）；新增 weapon4 槽（独立自瞄 50%，与 weapon3 同管线 for-of 复用）；伤害系数 100/70/50/50；地面芯片四槽同款均可升级；保底谓词改 wpn_up|wpn_new；HUD 四号位显示；render 环绕武器数组加 weapon4。
- Verification: 受控探针——10 连抽武器卡最大干旱间隔 1（保底生效）；连拿 3 张新武器卡按序填满 w2/w3/w4 且与卡面一致；4 槽满后「新武器上岗」不再出现；「武器升级」卡对应槽 +1 级；四枪齐发 1.5s 内 18 发玩家弹药；build 通过；控制台零 error。
