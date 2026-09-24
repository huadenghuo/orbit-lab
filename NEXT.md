---
handoff_schema: tavernweave/next/v1
project_id: orbit-lab
status: automated-evidence
updated: 2026-09-24
---

# NEXT · 天体轨道实验室 Orbit Lab

## 当前权威

- 总设计案：`总设计案.md`（驾驶员已确认：「按蓝图开跑第一版」，决策①②按推荐冻结）
- 活动蓝图：`项目实现步骤蓝图.md`（BP-ROOT · active，P1–P3 已完成，停在 P4）
- 执行期持久权威蓝图预算：`0`
- 临时问题支线：无（构建期的语法/断言修复属正常步骤检查单，未开支线）

## 已确认事实

- 设计确认门已过：驾驶员回「按蓝图开跑第一版」；决策①（引擎层三积分器 + UI 切换 + 误差曲线）、决策②（归一化单位）按推荐冻结。
- P1 完成：`index.html`（纯引擎 + 应用层，703 行，OrbitCore 无 DOM 可引导）+ `test.mjs`（18 断言）。
- P2 完成：桌面控制台默认展开、移动端收起；静态冒烟 7/7。
- P3 完成：`README.md`（中英 + badges + GIF 占位）、`.gitignore`、权威链回填。
- 构建期共修复 3 处：RK4 死代码、if 未闭合导致 IIFE 解析失败、测试第 4 组隐式赋值（严格模式报错）。

## 最近证据

- **automated（2026-09-24）**：`node test.mjs` → **18/18 全绿**：
  ①蛙跳 1000 步能量相对误差 < 1e-6；②欧拉误差 > 蛙跳（对比断言）；③角动量 2000 步漂移 < 1e-7；
  ④逃逸速度 e≈1 且持续外逸；⑤三体八字一周期回归 1.80e-5 < 1e-4（h=1e-4，63259 步；收敛实验显示 O(h²)，地板 1.8e-5 来自 8 位初值精度）；
  ⑥合并质量/动量守恒、动能不增、重合位置受力有限、NaN/越界检测、预设不误报；附加 4 预设完整性全绿。
- **static-preview（2026-09-24）**：7/7 —— 单 script 块、脚本引用的 30 个 DOM id 全部命中、预设按钮结构存在、0 外部网络请求、favicon 为 data URI、无 DOM 可引导导出 OrbitCore、引擎导出齐全。
- **权威验证**：`validate-project-authority.mjs --automation` → Project authority valid（回填后复验通过）。
- **real-host**：未执行（待驾驶员真机：桌面 Chrome + 375px 触屏）。
- **driver**：pending —— 未验收。

**发布证据（2026-09-24 · G5 · 驾驶员授权「还可以发布吧」）**：
- 仓库：https://github.com/huadenghuo/orbit-lab（公开，8 文件，远端首个内容提交 2b781f5）
- Pages：https://huadenghuo.github.io/orbit-lab/ —— HTTP 200（第 2 次探测，29316 字符，含页面标题）✅
- 主页：5/5 仓库 Website 字段已填；个人主页 README 第五行已写入并 raw 验证 ✅
- 管线修复：gh_sync 支持 `<仓库名>-files.txt` 清单（绕过沙箱 spawn EPERM，保留 execSync 回退）；gh_profile 更新 README 已带 sha
- **注：发布 ≠ 验收**——acceptance 保持 realHost=pending、driver=pending，state=automated-evidence

## 开放风险

1. real-host 门未过：浏览器真实渲染、拖拽手势、触屏缩放尚未在真机验证（自动化不能替代）。
2. 时间缩放高挡受每帧 800 子步上限约束（保护低端设备的取舍，README 已注明）。
3. 八字解回归触底 1.8e-5（初值精度地板）：若未来要更紧阈值，需换更高精度初始条件。
4. `assets/*.gif` 仍为占位：录制三张 GIF 后 README 首屏才完整（不阻塞试用）。
5. **GH_TOKEN 已在对话内交付**（classic PAT，repo scope）——发布动作已全部完成，请到 https://github.com/settings/tokens 撤销该 token。
6. 本地 git 与远端历史不同步属既定设计（发布走 GitHub API 管线，本地仓库只作文件清单与工作副本），不影响后续 `gh_sync`。

## 下一道门

**P4 · 驾驶员真机试用门**：双击 `index.html` → 依次试 3 个预设 + 拖拽发射 + 切积分器看误差曲线 → 提出第 1 次修改 → 完成后再次试用 → 明确验收（之后才可将 state 置为 driver-accepted，并另行授权发布/Git 动作）。

## 一句续接

读取总设计案、项目实现步骤蓝图和本文件，从下一道门继续，不重开项目。
