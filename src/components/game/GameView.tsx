import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import Icon from '@/components/ui/icon';

interface GameViewProps {
  onNavigate: (screen: string) => void;
  playerMoney: number;
  round: number;
  score: { ct: number; t: number };
}

export default function GameView({ onNavigate, playerMoney, round, score }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [locked, setLocked] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [screenRed, setScreenRed] = useState(0);
  const [playerY, setPlayerY] = useState(1.7);
  const [hp] = useState(100);
  const [ammo] = useState({ mag: 30, reserve: 90 });
  const [weapon] = useState('AK-47');

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine({
      canvas: canvasRef.current,
      onDeath: () => setIsDead(true),
    });
    engineRef.current = engine;
    engine.start();

    const ticker = setInterval(() => {
      setLocked(engine.isLocked());
      setScreenRed(engine.getScreenRed());
      setPlayerY(engine.getPlayerY());
    }, 50);

    return () => {
      clearInterval(ticker);
      engine.stop();
    };
  }, []);

  const handleRespawn = () => {
    engineRef.current?.respawn();
    setIsDead(false);
    setScreenRed(0);
  };

  // Height indicator: 0 = city ground (-178.3), 1 = rooftop (1.7)
  const ROOF_Y = 1.7;
  const CITY_Y = -178.3;
  const heightPct = Math.max(0, Math.min(1, (playerY - CITY_Y) / (ROOF_Y - CITY_Y)));
  const isFalling = playerY < -5;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Red vignette on damage / death */}
      {screenRed > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(180,0,0,${screenRed * 0.85}) 100%)`,
          }}
        />
      )}

      {/* Wind effect while falling */}
      {isFalling && !isDead && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-white/20"
              style={{
                left: `${5 + i * 8}%`,
                top: '-10%',
                height: '120%',
                transform: `rotate(${-2 + i * 0.5}deg)`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="font-oswald font-black text-4xl text-white/60 tracking-widest animate-pulse uppercase">
              ПАДЕНИЕ
            </div>
          </div>
        </div>
      )}

      {/* ── HUD (hidden when dead) ─────────────────────────────── */}
      {!isDead && (
        <>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4 py-3 pointer-events-none z-20">
            <div className="bg-black/60 backdrop-blur-sm border border-game-border px-3 py-1.5 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-sm" />
                <span className="font-oswald font-bold text-blue-300 text-lg leading-none">{score.ct}</span>
              </div>
              <div className="font-mono text-game-text-dim text-xs">R{round}</div>
              <div className="flex items-center gap-1.5">
                <span className="font-oswald font-bold text-game-orange text-lg leading-none">{score.t}</span>
                <div className="w-2 h-2 bg-game-orange rounded-sm" />
              </div>
            </div>

            <div className="bg-black/70 backdrop-blur-sm border border-game-border px-4 py-1 flex flex-col items-center">
              <span className="font-oswald font-black text-2xl text-game-text-bright leading-none">1:55</span>
              <span className="font-mono text-[9px] text-game-text-dim uppercase tracking-widest">РАУНД {round}</span>
            </div>

            <div className="bg-black/60 backdrop-blur-sm border border-game-border px-3 py-1.5 flex items-center gap-2">
              <Icon name="DollarSign" size={13} className="text-game-gold" />
              <span className="font-mono font-bold text-game-gold">${playerMoney.toLocaleString()}</span>
            </div>
          </div>

          {/* Crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="relative w-6 h-6">
              <div className="absolute top-1/2 left-0 w-[6px] h-[1.5px] bg-white/90 -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 w-[6px] h-[1.5px] bg-white/90 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 h-[6px] w-[1.5px] bg-white/90 -translate-x-1/2" />
              <div className="absolute left-1/2 bottom-0 h-[6px] w-[1.5px] bg-white/90 -translate-x-1/2" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[2px] h-[2px] bg-white/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Height indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center gap-1">
            <div className="font-mono text-[9px] text-white/50 uppercase tracking-widest mb-1">ВЫСОТА</div>
            <div className="w-2 h-40 bg-black/50 border border-white/20 relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-100"
                style={{
                  height: `${heightPct * 100}%`,
                  background: isFalling
                    ? 'linear-gradient(to top, #ef4444, #ff8800)'
                    : 'linear-gradient(to top, #22c55e, #86efac)',
                }}
              />
              {/* Roof marker */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/40" />
              {/* Ground marker */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-red-500/60" />
            </div>
            <div className={`font-mono text-[9px] mt-1 ${isFalling ? 'text-red-400 animate-pulse' : 'text-white/40'}`}>
              {isFalling ? '↓ ПАДЕНИЕ' : `${Math.max(0, Math.round(playerY + 180))}м`}
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-4 pointer-events-none z-20">
            <div className="flex items-center gap-3">
              <div className="bg-black/70 backdrop-blur-sm border border-game-border px-3 py-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Icon name="Heart" size={14} className="text-game-red" />
                  <span className="font-oswald font-bold text-xl text-white leading-none">{hp}</span>
                </div>
                <div className="w-px h-6 bg-game-border" />
                <div className="flex items-center gap-1.5">
                  <Icon name="Shield" size={14} className="text-blue-400" />
                  <span className="font-oswald font-bold text-xl text-blue-300 leading-none">85</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-1 w-24 bg-black/60 border border-game-border/50">
                  <div className="h-full bg-game-green" style={{ width: `${hp}%` }} />
                </div>
                <div className="h-1 w-24 bg-black/60 border border-game-border/50">
                  <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              {[
                { k: 'Ghost_7', v: 'RushB_King', w: 'AK-47', hs: true },
                { k: 'Venom_X', v: 'Flashpoint', w: 'AWP', hs: false },
              ].map((kf, i) => (
                <div key={i} className="bg-black/60 backdrop-blur-sm px-2 py-1 flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-game-orange font-bold">{kf.k}</span>
                  {kf.hs && <span className="text-[9px] bg-game-orange/30 px-0.5">HS</span>}
                  <Icon name="ArrowRight" size={8} className="text-game-text-dim" />
                  <span className="text-game-text-dim">{kf.v}</span>
                  <span className="text-game-text-dim ml-1 text-[9px]">{kf.w}</span>
                </div>
              ))}
            </div>

            <div className="bg-black/70 backdrop-blur-sm border border-game-border px-4 py-2 flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="font-oswald font-bold text-2xl text-white leading-none">{ammo.mag}</span>
                <span className="font-mono text-xs text-game-text-dim">{ammo.reserve}</span>
              </div>
              <div className="w-px h-8 bg-game-border" />
              <div>
                <div className="font-oswald font-semibold text-sm text-game-orange uppercase tracking-wide">{weapon}</div>
                <div className="font-mono text-[9px] text-game-text-dim uppercase">Основное</div>
              </div>
            </div>
          </div>

          {/* Mini-map */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-28 bg-black/70 backdrop-blur-sm border border-game-border/60 rounded overflow-hidden pointer-events-none z-20">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'linear-gradient(rgba(232,99,10,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,99,10,0.5) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
              />
              <div className="absolute bg-red-500/30 border border-red-500/50 text-[7px] font-mono text-red-400 flex items-center justify-center"
                style={{ left: '55%', top: '40%', width: 18, height: 18 }}>A</div>
              <div className="absolute bg-blue-500/30 border border-blue-500/50 text-[7px] font-mono text-blue-400 flex items-center justify-center"
                style={{ left: '25%', top: '45%', width: 18, height: 18 }}>B</div>
              <div className="absolute w-2.5 h-2.5 bg-game-orange border border-white rounded-full"
                style={{ left: '50%', top: `${100 - heightPct * 60 - 20}%`, transform: 'translate(-50%, -50%)' }} />
              <div className="absolute bottom-0.5 left-0 right-0 text-center font-mono text-[8px] text-game-text-dim">VERTIGO</div>
            </div>
          </div>
        </>
      )}

      {/* ── DEATH SCREEN ───────────────────────────────────────── */}
      {isDead && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative text-center animate-scale-in">
            <div className="font-oswald font-black text-7xl text-red-500 uppercase tracking-widest mb-2 drop-shadow-lg">
              ВЫ ПОГИБЛИ
            </div>
            <div className="font-mono text-white/60 text-sm mb-2">
              Упали с небоскрёба на высоте ~180м
            </div>
            <div className="font-mono text-red-400/80 text-xs mb-8 uppercase tracking-widest">
              💀 Смерть от падения
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRespawn}
                className="game-btn-primary px-8 py-3 flex items-center gap-2 pointer-events-auto"
              >
                <Icon name="RotateCcw" size={16} />
                Возродиться
              </button>
              <button
                onClick={() => onNavigate('menu')}
                className="game-btn-secondary px-6 py-3 flex items-center gap-2 pointer-events-auto"
              >
                <Icon name="Home" size={16} />
                В меню
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POINTER LOCK OVERLAY ─────────────────────────────── */}
      {!locked && !isDead && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-game-orange/20 border-2 border-game-orange flex items-center justify-center mx-auto mb-6">
              <Icon name="MousePointer" size={28} className="text-game-orange" />
            </div>
            <h2 className="font-oswald font-black text-3xl text-white uppercase tracking-widest mb-2">VERTIGO</h2>
            <p className="font-mono text-game-text-dim text-sm mb-1">Крыша небоскрёба · Живой город внизу</p>
            <p className="font-mono text-red-400/70 text-xs mb-6">⚠ Не подходи к краю — упадёшь в город</p>

            <div className="bg-black/60 border border-game-border p-4 mb-6 text-left max-w-xs mx-auto">
              <div className="game-label mb-3">Управление</div>
              {[
                ['W A S D', 'Движение'],
                ['Мышь', 'Обзор'],
                ['Пробел', 'Прыжок'],
                ['ESC', 'Пауза'],
              ].map(([key, action]) => (
                <div key={key} className="flex justify-between py-1 border-b border-game-border/40 last:border-0">
                  <span className="font-mono text-xs bg-game-panel border border-game-border px-1.5 text-game-orange">{key}</span>
                  <span className="font-rajdhani text-sm text-game-text">{action}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => canvasRef.current?.requestPointerLock()}
              className="game-btn-primary px-8 py-3 text-base flex items-center gap-3 mx-auto"
            >
              <Icon name="Play" size={18} />
              Нажми для входа в игру
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className="mt-3 font-mono text-xs text-game-text-dim hover:text-game-orange transition-colors block mx-auto"
            >
              ← Вернуться в меню
            </button>
          </div>
        </div>
      )}

      {locked && !isDead && (
        <div className="absolute top-1/2 left-4 pointer-events-none">
          <span className="font-mono text-[10px] text-white/20">ESC — пауза</span>
        </div>
      )}
    </div>
  );
}
