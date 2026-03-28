import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const VLADIMIR_URL = 'https://functions.poehali.dev/e61d4170-0bc1-4ee3-93ee-25599d27518f';
const CAT_NAME = 'Мурзик';

// ── Upgrades config ──────────────────────────────────────────────────────────
const UPGRADES = [
  { id: 'yarn',       name: 'Клубок',         icon: '🧶', desc: '+1 к клику',        baseCost: 10,   cpcBonus: 1,  cpsBonus: 0,   maxLevel: 50 },
  { id: 'milk',       name: 'Миска молока',   icon: '🥛', desc: '+0.5 CPS',          baseCost: 50,   cpcBonus: 0,  cpsBonus: 0.5, maxLevel: 30 },
  { id: 'mouse',      name: 'Мышка',          icon: '🐭', desc: '+3 к клику',        baseCost: 120,  cpcBonus: 3,  cpsBonus: 0,   maxLevel: 40 },
  { id: 'pillow',     name: 'Подушка',        icon: '🛏️', desc: '+2 CPS',            baseCost: 300,  cpcBonus: 0,  cpsBonus: 2,   maxLevel: 25 },
  { id: 'laser',      name: 'Лазер',          icon: '🔴', desc: '+10 к клику',       baseCost: 800,  cpcBonus: 10, cpsBonus: 0,   maxLevel: 30 },
  { id: 'fishrod',    name: 'Удочка',         icon: '🎣', desc: '+8 CPS',            baseCost: 1500, cpcBonus: 0,  cpsBonus: 8,   maxLevel: 20 },
  { id: 'catnip',     name: 'Котовник',       icon: '🌿', desc: '+25 к клику',       baseCost: 4000, cpcBonus: 25, cpsBonus: 3,   maxLevel: 20 },
  { id: 'catcafe',    name: 'Кошачье кафе',   icon: '☕', desc: '+30 CPS',           baseCost: 10000,cpcBonus: 0,  cpsBonus: 30,  maxLevel: 15 },
  { id: 'catarmy',    name: 'Армия котов',    icon: '⚔️', desc: '+100 CPS',          baseCost: 50000,cpcBonus: 10, cpsBonus: 100, maxLevel: 10 },
  { id: 'catgalaxy',  name: 'Кот-галактика',  icon: '🌌', desc: '+500 CPS',          baseCost: 200000,cpcBonus:50, cpsBonus: 500, maxLevel: 5  },
];

// ── Achievements ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'first',     name: 'Первый клик',     icon: '👆', req: (c: number) => c >= 1 },
  { id: 'hundred',   name: '100 кликов',      icon: '💯', req: (c: number) => c >= 100 },
  { id: 'thousand',  name: '1 000 кликов',    icon: '🔥', req: (c: number) => c >= 1000 },
  { id: 'tenk',      name: '10 000 кликов',   icon: '💎', req: (c: number) => c >= 10000 },
  { id: 'hundredk',  name: '100 000 кликов',  icon: '👑', req: (c: number) => c >= 100000 },
  { id: 'million',   name: '1 000 000 кликов',icon: '🌟', req: (c: number) => c >= 1000000 },
];

interface UpgradeLevel { [id: string]: number }
interface FloatText { id: number; x: number; y: number; val: number }

function getCost(baseId: string, level: number): number {
  const up = UPGRADES.find(u => u.id === baseId)!;
  return Math.floor(up.baseCost * Math.pow(1.15, level));
}

function formatNum(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export default function CatClicker() {
  const [clicks, setClicks] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [levels, setLevels] = useState<UpgradeLevel>({});
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [catScale, setCatScale] = useState(1);
  const [catAnim, setCatAnim] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchiev, setNewAchiev] = useState<string | null>(null);
  const [tab, setTab] = useState<'upgrades' | 'achievements' | 'stats'>('upgrades');

  // Vladimir
  const [vladMsg, setVladMsg] = useState('Нажми на кота, чтобы я начал наблюдать...');
  const [vladMood, setVladMood] = useState<'neutral' | 'happy' | 'sad' | 'wise'>('neutral');
  const [vladThinking, setVladThinking] = useState(false);
  const [vladHistory, setVladHistory] = useState<string[]>([]);
  const vladTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatIdRef = useRef(0);
  const clicksSinceVlad = useRef(0);

  // Computed
  const cpc = UPGRADES.reduce((s, u) => s + (u.cpcBonus * (levels[u.id] || 0)), 1);
  const cps = UPGRADES.reduce((s, u) => s + (u.cpsBonus * (levels[u.id] || 0)), 0);

  // ── CPS auto-click ────────────────────────────────────────────
  useEffect(() => {
    if (cps <= 0) return;
    const interval = setInterval(() => {
      setClicks(c => c + cps / 20);
      setTotalClicks(c => c + cps / 20);
    }, 50);
    return () => clearInterval(interval);
  }, [cps]);

  // ── Achievements check ────────────────────────────────────────
  useEffect(() => {
    ACHIEVEMENTS.forEach(a => {
      if (!achievements.includes(a.id) && a.req(totalClicks)) {
        setAchievements(prev => [...prev, a.id]);
        setNewAchiev(a.id);
        setTimeout(() => setNewAchiev(null), 3000);
      }
    });
  }, [totalClicks, achievements]);

  // ── Vladimir init greeting ─────────────────────────────────────
  useEffect(() => {
    askVladimir('start', 0, 0, []);
  }, []);

  // ── Ask Vladimir ──────────────────────────────────────────────
  const askVladimir = useCallback(async (trigger: string, c: number, s: number, upgs: string[]) => {
    setVladThinking(true);
    try {
      const res = await fetch(VLADIMIR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger, clicks: Math.floor(c), cps: s, upgrades: upgs, catName: CAT_NAME }),
      });
      const data = await res.json();
      const msg = data.message || '...';
      setVladMsg(msg);
      setVladMood(data.mood || 'neutral');
      setVladHistory(h => [msg, ...h].slice(0, 8));
    } catch {
      setVladMsg('Связь с Владимиром прервана...');
    } finally {
      setVladThinking(false);
    }
  }, []);

  // ── Idle detection ────────────────────────────────────────────
  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      askVladimir('idle', totalClicks, cps, Object.keys(levels).filter(k => levels[k] > 0));
    }, 8000);
  }, [totalClicks, cps, levels, askVladimir]);

  // ── Main click ────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setClicks(c => c + cpc);
    setTotalClicks(c => c + cpc);
    setCatAnim(true);
    setTimeout(() => setCatAnim(false), 120);

    // Float text
    const rect = e.currentTarget.getBoundingClientRect();
    const id = floatIdRef.current++;
    const fx = e.clientX - rect.left + (Math.random() - 0.5) * 40;
    const fy = e.clientY - rect.top - 10;
    setFloats(f => [...f, { id, x: fx, y: fy, val: cpc }]);
    setTimeout(() => setFloats(f => f.filter(x => x.id !== id)), 900);

    // Vladimir every N clicks
    clicksSinceVlad.current++;
    if (clicksSinceVlad.current >= 20 + Math.floor(Math.random() * 30)) {
      clicksSinceVlad.current = 0;
      if (vladTimer.current) clearTimeout(vladTimer.current);
      vladTimer.current = setTimeout(() => {
        askVladimir('click', totalClicks + cpc, cps, Object.keys(levels).filter(k => levels[k] > 0));
      }, 300);
    }

    resetIdle();
  }, [cpc, totalClicks, cps, levels, askVladimir, resetIdle]);

  // ── Buy upgrade ───────────────────────────────────────────────
  const buyUpgrade = useCallback((id: string) => {
    const up = UPGRADES.find(u => u.id === id)!;
    const lvl = levels[id] || 0;
    if (lvl >= up.maxLevel) return;
    const cost = getCost(id, lvl);
    if (clicks < cost) return;
    setClicks(c => c - cost);
    setLevels(l => ({ ...l, [id]: lvl + 1 }));
    const upgs = Object.keys({ ...levels, [id]: lvl + 1 }).filter(k => ({ ...levels, [id]: lvl + 1 })[k] > 0);
    askVladimir('upgrade', totalClicks, cps, upgs);
    resetIdle();
  }, [clicks, levels, totalClicks, cps, askVladimir, resetIdle]);

  const moodFace = { neutral: '🧐', happy: '😄', sad: '😒', wise: '🧙' }[vladMood];
  const moodColor = { neutral: 'text-blue-300', happy: 'text-yellow-300', sad: 'text-red-400', wise: 'text-purple-300' }[vladMood];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f1a] via-[#111827] to-[#0a0c14] flex flex-col items-center font-rajdhani overflow-hidden">

      {/* Achievement toast */}
      {newAchiev && (() => {
        const a = ACHIEVEMENTS.find(x => x.id === newAchiev)!;
        return (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in bg-yellow-500/20 border border-yellow-500 px-6 py-3 flex items-center gap-3">
            <span className="text-2xl">{a.icon}</span>
            <div>
              <div className="font-oswald text-yellow-300 font-bold text-sm uppercase tracking-widest">Достижение!</div>
              <div className="font-rajdhani text-white text-sm">{a.name}</div>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <div className="w-full max-w-5xl px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="font-oswald font-black text-2xl text-white tracking-widest uppercase">КотКликер</span>
          <span className="font-mono text-xs text-white/30 ml-1">by Vladimir AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">за клик</div>
            <div className="font-oswald font-bold text-game-orange">{formatNum(cpc)}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">в секунду</div>
            <div className="font-oswald font-bold text-blue-400">{formatNum(cps)}</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">всего</div>
            <div className="font-oswald font-bold text-white">{formatNum(totalClicks)}</div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="w-full max-w-5xl px-6 flex gap-6 flex-1">

        {/* Left — clicker */}
        <div className="flex-1 flex flex-col items-center justify-center relative">

          {/* Coins display */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-3xl">🐾</span>
            <span className="font-oswald font-black text-4xl text-white">{formatNum(clicks)}</span>
            <span className="font-oswald text-lg text-white/40">мур</span>
          </div>

          {/* Cat button */}
          <button
            onClick={handleClick}
            className="relative w-52 h-52 rounded-full select-none focus:outline-none group"
            style={{
              transform: catAnim ? 'scale(0.93)' : 'scale(1)',
              transition: 'transform 0.1s ease',
              filter: 'drop-shadow(0 0 30px rgba(255,200,50,0.3))',
            }}
          >
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 group-hover:from-yellow-400/30 group-hover:to-orange-500/30 transition-all duration-200" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300/10 to-transparent" />

            {/* Cat face SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-40 h-40">
                {/* Body */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 shadow-xl" />
                {/* Ears */}
                <div className="absolute -top-4 left-6 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-orange-400" />
                <div className="absolute -top-4 right-6 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-orange-400" />
                {/* Inner ears */}
                <div className="absolute -top-2 left-8 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-pink-300" />
                <div className="absolute -top-2 right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-pink-300" />
                {/* Eyes */}
                <div className={`absolute top-10 left-8 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow ${catAnim ? 'scale-75' : 'scale-100'} transition-transform duration-100`}>
                  <div className="w-4 h-5 bg-green-800 rounded-full flex items-center justify-center">
                    <div className="w-2 h-3 bg-black rounded-full" />
                  </div>
                </div>
                <div className={`absolute top-10 right-8 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow ${catAnim ? 'scale-75' : 'scale-100'} transition-transform duration-100`}>
                  <div className="w-4 h-5 bg-green-800 rounded-full flex items-center justify-center">
                    <div className="w-2 h-3 bg-black rounded-full" />
                  </div>
                </div>
                {/* Nose */}
                <div className="absolute top-[82px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-pink-400" />
                {/* Mouth */}
                <div className="absolute top-[92px] left-[56px] w-6 h-3 border-b-2 border-l-2 border-gray-700 rounded-bl-full" style={{ borderRight: 'none', borderTop: 'none' }} />
                <div className="absolute top-[92px] right-[56px] w-6 h-3 border-b-2 border-r-2 border-gray-700 rounded-br-full" style={{ borderLeft: 'none', borderTop: 'none' }} />
                {/* Whiskers */}
                <div className="absolute top-[85px] left-0 flex flex-col gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="h-px w-10 bg-gray-600/60" />)}
                </div>
                <div className="absolute top-[85px] right-0 flex flex-col gap-1.5 items-end">
                  {[0,1,2].map(i => <div key={i} className="h-px w-10 bg-gray-600/60" />)}
                </div>
                {/* Stripes */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1 h-6 bg-orange-600/40 rounded" />)}
                </div>
              </div>
            </div>

            {/* Float texts */}
            {floats.map(f => (
              <div
                key={f.id}
                className="absolute pointer-events-none font-oswald font-black text-yellow-300 text-xl select-none"
                style={{
                  left: f.x,
                  top: f.y,
                  animation: 'floatUp 0.9s ease-out forwards',
                  textShadow: '0 0 8px rgba(255,200,0,0.8)',
                }}
              >
                +{formatNum(f.val)}
              </div>
            ))}
          </button>

          <div className="mt-4 font-mono text-white/30 text-xs uppercase tracking-widest">
            нажимай на {CAT_NAME}
          </div>

          {/* Progress to next milestone */}
          {(() => {
            const next = ACHIEVEMENTS.find(a => !achievements.includes(a.id));
            if (!next) return null;
            const prev = ACHIEVEMENTS[ACHIEVEMENTS.indexOf(next) - 1];
            const prevVal = prev ? (prev.req as (c: number) => boolean).toString().match(/\d+/)?.[0] || '0' : '0';
            const nextVal = (next.req as (c: number) => boolean).toString().match(/\d+/)?.[0] || '1';
            const pct = Math.min(1, totalClicks / parseInt(nextVal));
            return (
              <div className="mt-4 w-full max-w-xs">
                <div className="flex justify-between font-mono text-[10px] text-white/30 mb-1">
                  <span>{next.icon} {next.name}</span>
                  <span>{formatNum(totalClicks)} / {formatNum(parseInt(nextVal))}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300" style={{ width: `${pct * 100}%` }} />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right — Vladimir + Shop */}
        <div className="w-80 flex flex-col gap-3 py-4">

          {/* Vladimir panel */}
          <div className="bg-[#0d1526]/80 border border-blue-900/60 rounded p-4 relative">
            <div className="flex items-center gap-2 mb-3">
              <div className={`text-2xl ${vladThinking ? 'animate-pulse' : ''}`}>{moodFace}</div>
              <div>
                <div className="font-oswald font-bold text-white text-sm tracking-widest">ВЛАДИМИР</div>
                <div className="font-mono text-[9px] text-blue-400/70 uppercase tracking-widest">ИИ-советник</div>
              </div>
              {vladThinking && (
                <div className="ml-auto flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              )}
            </div>

            <div className={`font-rajdhani text-sm leading-snug min-h-[3rem] ${moodColor}`}>
              «{vladMsg}»
            </div>

            {vladHistory.length > 1 && (
              <div className="mt-3 border-t border-white/5 pt-2 space-y-1">
                {vladHistory.slice(1, 4).map((msg, i) => (
                  <div key={i} className="font-mono text-[9px] text-white/20 truncate">
                    {msg}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => askVladimir('click', totalClicks, cps, Object.keys(levels).filter(k => levels[k] > 0))}
              className="mt-3 w-full font-mono text-[10px] text-blue-400/50 hover:text-blue-300 transition-colors uppercase tracking-widest border border-blue-900/30 hover:border-blue-700/50 py-1"
            >
              спросить совета
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border border-white/10">
            {(['upgrades', 'achievements', 'stats'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 font-oswald text-xs uppercase tracking-widest transition-colors ${
                  tab === t ? 'bg-game-orange text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {t === 'upgrades' ? 'Апгрейды' : t === 'achievements' ? 'Ачивки' : 'Стата'}
              </button>
            ))}
          </div>

          {/* Upgrades tab */}
          {tab === 'upgrades' && (
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {UPGRADES.map(up => {
                const lvl = levels[up.id] || 0;
                const cost = getCost(up.id, lvl);
                const canBuy = clicks >= cost && lvl < up.maxLevel;
                const maxed = lvl >= up.maxLevel;
                return (
                  <button
                    key={up.id}
                    onClick={() => buyUpgrade(up.id)}
                    disabled={!canBuy}
                    className={`w-full text-left p-2.5 border transition-all duration-150 ${
                      maxed ? 'border-yellow-600/40 bg-yellow-900/10' :
                      canBuy ? 'border-game-orange/60 bg-game-orange/10 hover:bg-game-orange/20 cursor-pointer' :
                      'border-white/8 bg-white/3 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{up.icon}</span>
                        <div>
                          <div className="font-oswald text-xs text-white font-semibold uppercase tracking-wide flex items-center gap-1.5">
                            {up.name}
                            {lvl > 0 && <span className="bg-game-orange/30 text-game-orange text-[9px] px-1 font-mono">{lvl}</span>}
                            {maxed && <span className="text-yellow-500 text-[9px] font-mono">MAX</span>}
                          </div>
                          <div className="font-mono text-[9px] text-white/40">{up.desc}</div>
                        </div>
                      </div>
                      {!maxed && (
                        <div className={`font-oswald font-bold text-sm ${canBuy ? 'text-game-orange' : 'text-white/30'}`}>
                          {formatNum(cost)}🐾
                        </div>
                      )}
                    </div>
                    {lvl > 0 && lvl < up.maxLevel && (
                      <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-game-orange/60" style={{ width: `${(lvl / up.maxLevel) * 100}%` }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Achievements tab */}
          {tab === 'achievements' && (
            <div className="flex-1 space-y-1.5">
              {ACHIEVEMENTS.map(a => {
                const done = achievements.includes(a.id);
                return (
                  <div key={a.id} className={`flex items-center gap-3 p-2.5 border ${done ? 'border-yellow-600/40 bg-yellow-900/10' : 'border-white/8 opacity-40'}`}>
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <div className={`font-oswald text-xs uppercase tracking-wide ${done ? 'text-yellow-300' : 'text-white/50'}`}>{a.name}</div>
                      <div className="font-mono text-[9px] text-white/30">{done ? '✓ Выполнено' : 'Заблокировано'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats tab */}
          {tab === 'stats' && (
            <div className="flex-1 space-y-2">
              {[
                ['Всего кликов', formatNum(totalClicks)],
                ['Мур сейчас', formatNum(clicks)],
                ['За клик', formatNum(cpc)],
                ['В секунду', formatNum(cps)],
                ['В минуту', formatNum(cps * 60)],
                ['В час', formatNum(cps * 3600)],
                ['Апгрейдов куплено', Object.values(levels).reduce((a, b) => a + b, 0).toString()],
                ['Достижений', `${achievements.length} / ${ACHIEVEMENTS.length}`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="font-mono text-xs text-white/40">{label}</span>
                  <span className="font-oswald font-bold text-sm text-white">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
