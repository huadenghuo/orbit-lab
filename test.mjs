// 天体轨道实验室 · 数值测试
// 策略：抽取 index.html 的真实引擎代码（无 DOM 环境）+ 直接驱动 OrbitCore
// 运行：node test.mjs

import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('✗ 未找到 <script> 块'); process.exit(1); }
(0, eval)(m[1]);                       // 间接 eval → 全局作用域，无 document 时只导出引擎
const C = globalThis.OrbitCore;
if (!C) { console.error('✗ OrbitCore 未导出'); process.exit(1); }

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
}
function relErr(a, b) { return Math.abs((a - b) / Math.max(Math.abs(b), 1e-12)); }

/* ---------- 1. 能量守恒：蛙跳 1000 步 ---------- */
console.log('1. 能量守恒（蛙跳 Leapfrog, 1000 步）');
{
  const p = C.makePreset('earthmoon');
  const h = 5e-4;
  const E0 = C.energyStats(p.bodies, p.G, p.eps).total;
  for (let i = 0; i < 1000; i++) C.INTEGRATORS.leapfrog(p.bodies, h, p.G, p.eps);
  const E1 = C.energyStats(p.bodies, p.G, p.eps).total;
  const err = relErr(E1, E0);
  check('蛙跳能量相对误差 < 1e-6', err < 1e-6, 'err=' + err.toExponential(2));
}

/* ---------- 2. 积分器对比：欧拉漂移 > 蛙跳 ---------- */
console.log('2. 积分器对比（同场景同步长，欧拉漂移应更大）');
{
  const h = 5e-4;
  const pa = C.makePreset('earthmoon');
  const pb = C.makePreset('earthmoon');
  const Ea0 = C.energyStats(pa.bodies, pa.G, pa.eps).total;
  const Eb0 = C.energyStats(pb.bodies, pb.G, pb.eps).total;
  for (let i = 0; i < 1000; i++) C.INTEGRATORS.euler(pa.bodies, h, pa.G, pa.eps);
  for (let i = 0; i < 1000; i++) C.INTEGRATORS.leapfrog(pb.bodies, h, pb.G, pb.eps);
  const errE = relErr(C.energyStats(pa.bodies, pa.G, pa.eps).total, Ea0);
  const errL = relErr(C.energyStats(pb.bodies, pb.G, pb.eps).total, Eb0);
  check('欧拉误差 > 蛙跳误差', errE > errL, 'euler=' + errE.toExponential(2) + ' leapfrog=' + errL.toExponential(2));
}

/* ---------- 3. 角动量守恒 ---------- */
console.log('3. 角动量守恒（蛙跳 2000 步）');
{
  const p = C.makePreset('earthmoon');
  const h = 5e-4;
  const L0 = C.angularMomentum(p.bodies);
  for (let i = 0; i < 2000; i++) C.INTEGRATORS.leapfrog(p.bodies, h, p.G, p.eps);
  const L1 = C.angularMomentum(p.bodies);
  const err = Math.abs(L1 - L0) / Math.max(Math.abs(L0), 1e-12);
  check('角动量相对漂移 < 1e-7', err < 1e-7, 'err=' + err.toExponential(2));
}

/* ---------- 4. 逃逸速度 → 抛物线 e≈1 ---------- */
console.log('4. 逃逸速度 v = sqrt(2Gm/r) → e ≈ 1');
{
  const G = 1, eps = 1e-4;
  const a = C.makeBody({ x: 0, y: 0, m: 1, r: 0.05 });
  const b = C.makeBody({ x: 1, y: 0, m: 0.001, r: 0.02 });
  b.vy = Math.sqrt(2 * G * (a.m + b.m) / 1);
  const el0 = C.orbitElements(a, b, G);
  check('初始偏心率 |e-1| < 1e-6', Math.abs(el0.e - 1) < 1e-6, 'e=' + el0.e);
  const bs = [a, b];
  const h = 5e-4;
  for (let i = 0; i < 4000; i++) C.INTEGRATORS.leapfrog(bs, h, G, eps);
  const el1 = C.orbitElements(a, b, G);
  const r0 = el0.r, r1 = el1.r;
  check('持续外逸 r 增大且不发散', r1 > 1.05 && isFinite(r1), 'r0=' + r0.toFixed(4) + ' r1=' + r1.toFixed(4));
  check('全程偏心率保持 e ≈ 1', Math.abs(el1.e - 1) < 1e-3, 'e=' + el1.e);
}

/* ---------- 5. 三体八字解一周期回归 ---------- */
console.log('5. 三体八字解：一个周期（T=6.3259）后回归初值');
{
  const p = C.makePreset('figure8');
  const h = 1e-4;
  const steps = Math.round(C.PERIOD8 / h);
  const x0 = p.bodies.map(b => [b.x, b.y]);
  for (let i = 0; i < steps; i++) C.INTEGRATORS.leapfrog(p.bodies, h, p.G, p.eps);
  let maxd = 0;
  for (let i = 0; i < p.bodies.length; i++) {
    const d = Math.hypot(p.bodies[i].x - x0[i][0], p.bodies[i].y - x0[i][1]);
    if (d > maxd) maxd = d;
  }
  check('一周期回归误差 < 1e-4（' + steps + ' 步）', maxd < 1e-4, 'maxd=' + maxd.toExponential(2));
}

/* ---------- 6. 合并守恒 + NaN 防护 ---------- */
console.log('6. 合并守恒 + NaN/发散防护');
{
  const a = C.makeBody({ x: -0.5, y: 0, vx: 1, vy: 0, m: 1, r: 0.05 });
  const b = C.makeBody({ x: 0.5, y: 0, vx: -1, vy: 0.5, m: 3, r: 0.06 });
  const p0 = a.m * a.vx + b.m * b.vx, q0 = a.m * a.vy + b.m * b.vy;
  const ke0 = 0.5 * a.m * (a.vx ** 2 + a.vy ** 2) + 0.5 * b.m * (b.vx ** 2 + b.vy ** 2);
  const n = C.mergeBodies(a, b);
  check('合并质量守恒', Math.abs(n.m - 4) < 1e-12, 'm=' + n.m);
  check('合并动量守恒', Math.hypot(n.m * n.vx - p0, n.m * n.vy - q0) < 1e-12);
  const ke1 = 0.5 * n.m * (n.vx ** 2 + n.vy ** 2);
  check('非弹性合并动能不增', ke1 <= ke0 + 1e-12, 'KE ' + ke0.toFixed(4) + ' → ' + ke1.toFixed(4));

  const c1 = C.makeBody({ x: 0, y: 0, m: 1 }), c2 = C.makeBody({ x: 0, y: 0, m: 1 });
  const f = C.forces([c1, c2], 1, 0.01);
  check('重合位置受力有限（软化生效）', isFinite(f.ax[0]) && isFinite(f.ay[0]) && isFinite(f.ax[1]));
  check('发散检测捕获 NaN', C.isDiverged([C.makeBody({ x: NaN, y: 0 })]));
  check('发散检测捕获位置越界', C.isDiverged([C.makeBody({ x: 1e6, y: 0 })]));
  check('正常预设不误报', !C.isDiverged(C.makePreset('slingshot').bodies));
}

/* ---------- 附加：预设完整性 ---------- */
console.log('附加. 预设完整性（状态与能量全有限）');
{
  for (const name of ['earthmoon', 'figure8', 'slingshot', 'empty']) {
    const p = C.makePreset(name);
    const finite = p.bodies.every(b => isFinite(b.x) && isFinite(b.y) && isFinite(b.vx) && isFinite(b.vy));
    const E = C.energyStats(p.bodies, p.G, p.eps).total;
    check('预设 ' + name + ' 状态与能量有限', finite && isFinite(E));
  }
}

console.log('\n结果：' + passed + ' 通过, ' + failed + ' 失败');
if (failed) process.exitCode = 1;
