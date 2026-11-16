// ==UserScript==
// @name         집냥이 택배 배달 자동 점프 (Safari)
// @namespace    https://lifecycle.ohou.se/
// @version      1.0.0
// @description  집냥이 게임에서 자동 점프 시작/중지 버튼 제공
// @match        https://lifecycle.ohou.se/zipcat*
// @match        https://lifecycle.ohou.se/zipcat/*
// @run-at       document-idle
// @grant        none
// @inject-into   page
// ==/UserScript==

(() => {
  'use strict';
  if (window.__zipcatControlInstalled) return;
  window.__zipcatControlInstalled = true;

  const panel = document.createElement('div');
  panel.id = 'zipcat-user-control';
  panel.style.cssText = 'position:fixed;right:12px;bottom:calc(18px + env(safe-area-inset-bottom, 0px));z-index:2147483647;display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:12px;background:#18212ee8;color:#fff;font:13px system-ui,sans-serif;box-shadow:0 3px 18px #0005;max-width:180px';
  const btn = document.createElement('button');
  btn.textContent = '▶ 자동 점프 시작';
  btn.style.cssText = 'background:#65b5ff;color:#071a2b;border:0;border-radius:8px;padding:10px;font-weight:700;font-size:14px';
  const status = document.createElement('div');
  status.textContent = '연습/도전 대기 화면에서 시작';
  status.style.cssText = 'font-size:11px;line-height:1.3;max-width:160px';
  panel.append(btn, status);
  (document.body || document.documentElement).appendChild(panel);
  let enabled = false;
  function engineInThisWorld() {

  'use strict';

  const GOAL = 101;
  const CAT_X = 100;
  const WALL_WIDTH = 64;
  const TICK = 1 / 120;
  const STEP_TICKS = 4;
  const STEP = TICK * STEP_TICKS;
  const LOOKAHEAD = 35;
  const BEAM = 34;

  function wallCenter(wall, carried) {
    const topMargin = carried ? 25 + 14 * carried : 22;
    return (wall.top + topMargin + wall.bottom - 20) / 2;
  }

  // Coordinates and physics are in the game's 360 × 640 playfield.
  function chooseJump({ y, vy, carried, speed, walls, items }) {
    const g = 1200 * (1 + 0.1 * carried);
    const impulse = -380 * (1 - 0.06 * carried);
    let paths = [{ y, v: vy, cost: 0, jumpNow: false }];

    for (let step = 0; step < LOOKAHEAD; step += 1) {
      const x = CAT_X + speed * (step + 1) * STEP;
      const index = walls.findIndex(w => w.x + WALL_WIDTH + 22 >= x);
      const wall = walls[index];
      const nextWall = walls[index + 1];
      const distance = wall ? wall.x - x : Infinity;
      const crossing = distance <= 26;
      const low = crossing ? wall.top + 25 : 22;
      const high = crossing ? wall.bottom - 25 : 565;
      const stackLow = crossing && carried ? wall.top + 26 + 14 * carried : low;
      let center = wall ? wallCenter(wall, carried) : 297;
      if (crossing && nextWall) {
        const blend = Math.max(0, Math.min(0.55, (x - wall.x + 10) / 135));
        center += (wallCenter(nextWall, carried) - center) * blend;
        center = Math.min(high, Math.max(stackLow, center));
      }
      const item = items.find(i => Math.abs(i.x - x) < 27);
      const target = item ? Math.min(high, Math.max(low, item.y + 7 + 5 * carried)) : center;
      const gates = Array.from({ length: STEP_TICKS }, (_, tick) => {
        const at = x - speed * TICK * (STEP_TICKS - tick - 1);
        return walls.find(w => w.x - 22 <= at && w.x + WALL_WIDTH + 22 >= at);
      });
      const upcoming = walls.find(w => w.x - 22 > x);
      const secondsToGate = upcoming ? (upcoming.x - 22 - x) / speed : Infinity;
      const next = [];

      for (const path of paths) {
        for (let press = 0; press <= 1; press += 1) {
          let v = press ? impulse : path.v;
          let predicted = path.y;
          let danger = 0;
          const topLimit = carried ? 23 + 14 * carried : 17;
          for (let j = 0; j < STEP_TICKS; j += 1) {
            v = Math.min(600, v + g * TICK);
            predicted += v * TICK;
            if (predicted < topLimit) {
              predicted = topLimit;
              v = Math.max(0, v);
            }
            const gate = gates[j];
            danger = Math.max(danger, gate ? gate.top + 23 - predicted : 0,
              predicted - (gate ? gate.bottom - 23 : 569));
          }
          let unreachable = 0;
          if (secondsToGate < 0.65) {
            const accelerating = Math.min(secondsToGate, Math.max(0, (600 - v) / g));
            const drop = v * accelerating + g * accelerating ** 2 / 2
              + 600 * (secondsToGate - accelerating);
            const rise = impulse * secondsToGate * 0.90;
            unreachable = Math.max(0, upcoming.top + 25 - predicted - drop,
              predicted + rise - upcoming.bottom + 25);
          }
          const lostCargo = Math.max(0, stackLow - predicted);
          const miss = predicted - target;
          next.push({
            y: predicted,
            v,
            jumpNow: step === 0 ? Boolean(press) : path.jumpNow,
            cost: path.cost + danger ** 2 * 1700 + unreachable ** 2 * 140
              + lostCargo ** 2 * 10 + miss ** 2 * (item ? 8 : 0.7) + 130 * press,
          });
        }
      }

      next.sort((a, b) => a.cost - b.cost);
      const seen = new Set();
      paths = [];
      for (const path of next) {
        const key = Math.round(path.y / 2.5) * 1024 + Math.round(path.v / 14);
        if (seen.has(key)) continue;
        seen.add(key);
        paths.push(path);
        if (paths.length >= BEAM) break;
      }
    }
    return paths[0]?.jumpNow ?? false;
  }

  window.zipcatAutoJump?.stop();
  const game = document.querySelector('[role="application"][aria-label="집냥이 택배 배달 게임"]');
  const canvas = game?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  const roundMode = () => game?.parentElement?.querySelector('[role="status"][mode]')?.getAttribute('mode');

  if (!ctx || !['practice', 'challenge'].includes(roundMode())) {
    console.warn('연습 또는 도전의 대기 화면에서 이 코드를 실행해 주세요.');
    return;
  }

  const originalDraw = ctx.drawImage;
  const originalText = ctx.fillText;
  const spriteNames = new WeakMap();
  let picture;
  let wasLowrise = false;
  let previous;
  let speed = 150;
  let lastJump = -Infinity;
  let lastGoal = -1;
  let score = 0;

  // Read the coordinates that the page already sends to its canvas.
  function drawImage(image, ...args) {
    const result = Reflect.apply(originalDraw, this, [image, ...args]);
    if (!spriteNames.has(image)) {
      const filename = (image.currentSrc || image.src || '').split('/').pop() || '';
      spriteNames.set(image, filename.split('.')[0]);
    }

    const name = spriteNames.get(image);
    if (name === 'lowrise' && !wasLowrise) {
      picture = { base: ctx.getTransform(), walls: new Map(), items: [] };
    }
    wasLowrise = name === 'lowrise';
    if (!picture) return result;

    if (/^cat_(fly|carry_)/.test(name)) {
      const transform = ctx.getTransform();
      picture.y = (transform.f - picture.base.f) / picture.base.d;
      picture.vy = -Math.atan2(transform.b, transform.a) * 6000 / Math.PI;
      return result;
    }

    if (/^(bld_.*_(ceiling|terrace)|house_(awning|terrace)|parcel|star_\d+)$/.test(name)) {
      // Convert the sprite's draw origin to the pickup center or gap boundary.
      const [x, y] = args.slice(args.length === 8 ? 4 : 0);
      if (name === 'parcel' || name.startsWith('star_')) {
        const t = ctx.getTransform();
        const base = picture.base;
        const inWorld = Math.abs(t.b) < 1e-7 && Math.abs(t.c) < 1e-7
          && t.a === base.a && t.d === base.d && t.e === base.e && t.f === base.f;
        if (inWorld && args.length === 4) {
          picture.items.push(name === 'parcel'
            ? { x: x + 21.5, y: y + 14.5 }
            : { x: x + 17, y: y + 17.5 });
        }
      } else {
        const left = x + 26;
        const key = Math.round(left * 1000);
        const wall = picture.walls.get(key) || { x: left };
        if (name.endsWith('_terrace')) wall.bottom = y + 36.5;
        else wall.top = y + (name === 'house_awning' ? 43.5 : 23.5);
        picture.walls.set(key, wall);
      }
    }
    return result;
  }

  function advance(frame) {
    if (!frame || !Number.isFinite(frame.y) || document.hidden) return;
    if (!['practice', 'challenge'].includes(roundMode())) return;
    if (!game.querySelector('[data-kind="none"]')) return;

    const now = performance.now();
    const walls = [...frame.walls.values()]
      .filter(wall => Number.isFinite(wall.top) && Number.isFinite(wall.bottom))
      .sort((a, b) => a.x - b.x);
    const currentScore = frame.score ?? 0;
    if (previous && currentScore < previous.score) {
      previous = undefined;
      speed = 150;
    }
    if (previous && currentScore > previous.score + 1) speed = Math.min(240, speed + 8);

    const elapsed = previous ? now - previous.now : 0;
    let vy = frame.vy;
    if (vy >= 399 && elapsed > 3 && elapsed < 65) {
      vy = Math.min(600, Math.max(400, (frame.y - previous.y) * 1000 / elapsed));
    }
    previous = { score: currentScore, y: frame.y, now };
    score = currentScore;
    if (score >= GOAL) {
      if (lastGoal < GOAL) console.info(`집냥이 ${score}점 도달. 결과 화면을 기다려 주세요.`);
      lastGoal = score;
      return;
    }
    lastGoal = -1;

    if (now - lastJump < 27) return;
    const carried = frame.carried ?? 0;
    if (chooseJump({ y: frame.y, vy, speed, carried, walls, items: frame.items })) {
      lastJump = now;
      game.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true }));
    }
  }

  function fillText(value, ...args) {
    const result = Reflect.apply(originalText, this, [value, ...args]);
    if (!picture) return result;
    const text = String(value);
    if (/^\d+$/.test(text)) picture.score = Number(text);
    if (/^[0-5]\/5$/.test(text)) picture.carried = Number(text[0]);
    if (/^다음 집 \d+$/.test(text)) {
      const scene = picture;
      picture = undefined;
      queueMicrotask(() => {
        if (ctx.drawImage === drawImage) advance(scene);
      });
    }
    return result;
  }

  ctx.drawImage = drawImage;
  ctx.fillText = fillText;
  window.zipcatAutoJump = {
    stop() {
      if (ctx.drawImage === drawImage) ctx.drawImage = originalDraw;
      if (ctx.fillText === fillText) ctx.fillText = originalText;
      delete window.zipcatAutoJump;
    },
    score: () => score,
  };
  console.info('자동 점프 준비 완료. 게임에서 탭해서 시작을 누르세요.');

  }
  btn.addEventListener('click', () => {
    if (enabled) {
      window.zipcatAutoJump?.stop();
      enabled = false;
      btn.textContent = '▶ 자동 점프 시작';
      status.textContent = '중지됨';
      return;
    }
    const game = document.querySelector('[role="application"][aria-label="집냥이 택배 배달 게임"]');
    const ctx = game?.querySelector('canvas')?.getContext('2d');
    const mode = game?.parentElement?.querySelector('[role="status"][mode]')?.getAttribute('mode');
    if (!ctx || !['practice', 'challenge'].includes(mode)) {
      status.textContent = '게임의 연습 또는 도전 대기 화면에서 다시 눌러주세요.';
      return;
    }
    try {
      engineInThisWorld();
      enabled = Boolean(window.zipcatAutoJump);
      if (enabled) {
        btn.textContent = '■ 자동 점프 중지';
        status.textContent = '활성화됨 · 게임 시작을 누르세요';
      } else {
        status.textContent = '실행 실패 · 페이지를 새로고침해 보세요';
      }
    } catch (e) {
      console.error('[Zipcat]', e);
      status.textContent = '실행 오류 · 콘솔을 확인하세요';
    }
  });
})();