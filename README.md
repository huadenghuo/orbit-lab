# 🪐 天体轨道实验室 · Orbit Lab

![tests](https://img.shields.io/badge/tests-node%20test.mjs%20·%2018%20assertions-brightgreen)
![zero-dep](https://img.shields.io/badge/zero--dependencies-%E2%9C%93-blue)
![single-file](https://img.shields.io/badge/single--file-HTML-orange)
![license](https://img.shields.io/badge/license-MIT-green)

> 零依赖、单文件 HTML 的交互式 **N 体轨道力学沙盒**：三套积分器同场对比、能量守恒误差实时曲线、三体混沌与引力弹弓。拖出一颗星，看它画出椭圆；摆下三体，看混沌撕碎一切。

**▶ 在线试玩**：https://huadenghuo.github.io/orbit-lab/

<!-- GIF 占位：上线前录制
![地月系统](assets/fig-earthmoon.gif)
![三体八字 + 误差曲线](assets/fig-figure8.gif)
![积分器对比：欧拉上扬，蛙跳贴底](assets/fig-integrator.gif)
-->

## ✨ 特性

- **即开即玩**：双击 `index.html`，无依赖、无安装、无网络请求
- **三套预设场景**：🌍 地月系统（椭圆轨道）· 🌀 三体八字解（Chenciner–Montgomery 经典周期轨道）· ☄️ 引力弹弓（双曲飞掠偏转）
- **🔬 积分器对比实验（核心卖点）**：半隐式欧拉 / 蛙跳 Leapfrog / RK4 一键切换，左下角**能量相对误差曲线**实时显示谁在「偷能量」
- **手搓天体**：拖住空白拉出速度箭头 → 松手发射，箭头长度即初速度
- **完整控制**：暂停 / 单步 / 0.1×–100× 时间缩放、G / dt / 拖尾滑杆、合并（非弹性）/ 穿透
- **视角自由**：拖拽平移、滚轮与双指缩放、点选天体查看 / 删除
- **诚实的失败反馈**：数值发散（NaN / 溢出）自动冻结 + 一键重置，并提示调小 dt 或换积分器
- **全端适配**：桌面 / 平板 / 手机响应式，DPR 上限 + 子步上限保护低端设备

## 🕹 快速上手

| 操作 | 效果 |
|:--|:--|
| 拖住空白处 | 拉出速度箭头，松手创建天体 |
| 点击天体 | 选中（虚线环），可删除 |
| 切「✋ 平移」/ 右键拖拽 | 平移视角 |
| 滚轮 / 双指捏合 | 缩放视角 |
| 空格 / S / R / Delete | 暂停 · 单步 · 重置 · 删除选中 |
| 🌍🌀☄️✨ 顶栏 | 切换 / 清空预设 |

## 🔬 积分器对比实验（为什么有意思）

| 积分器 | 阶数 | 辛结构 | 长期能量行为 |
|:--|:--:|:--:|:--|
| 半隐式欧拉 | 1 | ✓ | 能量缓慢注入 → 轨道螺旋发散（误差曲线上扬） |
| **蛙跳 Leapfrog（默认）** | 2 | ✓ | 能量误差有界振荡 → 曲线贴底（长期稳定） |
| RK4 | 4 | ✗ | 单步极准，长期能量缓慢漂移 |

**玩法**：先用默认蛙跳看曲线贴底 → 切到「半隐式欧拉」→ 曲线肉眼可见地爬升 → 切回来，立刻压平。同一场景同一 E₀ 基准，谁在作弊一目了然。

## 🧪 测试（18 断言全绿）

```bash
node test.mjs
```

测试直接抽取 `index.html` 里的**真实引擎代码**（无 DOM 环境）驱动：

| # | 断言 | 判据 |
|:--:|:--|:--|
| 1 | 能量守恒（蛙跳 1000 步） | 相对误差 < 1e-6 |
| 2 | 积分器对比 | 欧拉误差 > 蛙跳误差 |
| 3 | 角动量守恒（2000 步） | 相对漂移 < 1e-7 |
| 4 | 逃逸速度 v=√(2Gm/r) | 偏心率 e ≈ 1，持续外逸不发散 |
| 5 | 三体八字一周期回归 | T=6.3259 后位置误差 < 1e-4（实测 1.8e-5） |
| 6 | 合并守恒 + 防护 | 质量/动量守恒、动能不增、重合位置受力有限、NaN/越界检测 |
| + | 预设完整性 | 4 预设状态与能量全有限 |

## 📐 数学与约定

- 引力（软化 N 体）：`aᵢ = Σ G·mⱼ·d / (|d|² + ε²)^(3/2)` —— 软化因子 ε 防止零距离奇异
- 能量：`E = Σ½mv² − Σ G·mᵢmⱼ/√(r²+ε²)`；角动量：`L = Σ m(x·vy − y·vx)`
- 偏心率：`e = √(1 + 2·εₚ·L²/μ²)`（二体相对坐标）
- **归一化单位**：G=1、长度≈轨道半径、时间使主要周期≈6 个时间单位（决策②：不做真实天文单位）

## 🗂 项目结构

```
orbit-lab/
├── index.html      # 单文件：纯引擎（可无 DOM 引导，导出 OrbitCore）+ 应用层（Canvas/UI）
├── test.mjs        # 18 断言：抽取真实引擎代码驱动
├── README.md
├── 总设计案.md      # 权威设计（四态账本、First Playable 合同）
├── 项目实现步骤蓝图.md
├── NEXT.md         # 交接：当前事实、证据、下一道门
└── .gitignore
```

## 🗺 路线图

**首版验证后（Growth Tracks）**：开普勒 T²∝a³ 面板 → 洛希极限演示 → URL 场景分享 → CI 与模块化拆分 → Pages/EdgeOne 发布

**暂存（Parking Lot）**：Barnes-Hut 星系、相对论近日点进动、带电粒子+磁场、3D、Wisdom–Holman 显式辛积分

## 🌌 科学沙盒系列

| 项目 | 试玩 |
|:--|:--|
| 🧪 物理实验沙盒 | https://huadenghuo.github.io/physics-lab/ |
| ⚗️ 化学虚拟实验室 | https://huadenghuo.github.io/chemlab/ |
| 🦁 草原进化模拟器 | https://huadenghuo.github.io/evolution-sim/ |
| ⚡ 电路逻辑沙盒 | https://huadenghuo.github.io/logic-sandbox/ |

---

<details>
<summary>🌐 English</summary>

**Orbit Lab** — a zero-dependency, single-file interactive **N-body orbital mechanics sandbox**.

- Open `index.html` in any browser. No install, no network requests.
- **Three presets**: Earth–Moon ellipse · figure-8 choreography (Chenciner–Montgomery) · gravitational slingshot.
- **Integrator comparison experiment**: switch between semi-implicit Euler, symplectic Leapfrog, and RK4 while the live chart plots the relative energy error — watch Euler inject energy and the curve climb, while Leapfrog stays flat.
- Drag on empty space to launch a new body with a velocity arrow; pan/zoom; click to select and delete.
- Honest failure handling: divergence (NaN/overflow) freezes the sim with a one-click reset.

**Tests**: `node test.mjs` — 18 assertions driving the real engine extracted from the HTML (energy & angular-momentum conservation, eccentricity ≈ 1 at escape velocity, figure-8 return after one period, merge conservation, NaN guards).

License: MIT

</details>
