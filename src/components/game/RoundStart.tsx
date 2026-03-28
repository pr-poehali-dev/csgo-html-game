import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface RoundStartProps {
  onNavigate: (screen: string) => void;
  playerMoney: number;
  round: number;
  score: { ct: number; t: number };
}

export default function RoundStart({ onNavigate, playerMoney, round, score }: RoundStartProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [phase, setPhase] = useState<'buy' | 'active' | 'end'>('buy');
  const [hp, setHp] = useState(100);
  const [armor, setArmor] = useState(0);
  const [hasHelmet, setHasHelmet] = useState(false);
  const [showKillFeed, setShowKillFeed] = useState(true);

  useEffect(() => {
    if (phase !== 'buy') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPhase('active');
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const killFeed = [
    { killer: 'Ghost_7', victim: 'RushB_King', weapon: 'AK-47', headshot: true },
    { killer: 'Venom_X', victim: 'Flashpoint', weapon: 'AWP', headshot: false },
    { killer: 'NightCrawler', victim: 'Sidewinder', weapon: 'Deagle', headshot: true },
  ];

  const roundPlayers = [
    { name: 'Ghost_7', hp: 87, team: 'ct', armor: true },
    { name: 'Sidewinder', hp: 0, team: 'ct', armor: false },
    { name: 'Ф. Карпов', hp: 65, team: 'ct', armor: true },
    { name: 'Venom_X', hp: 100, team: 'ct', armor: true },
    { name: 'TacticalAce', hp: 42, team: 'ct', armor: false },
  ];

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* HUD Top bar */}
      <div className="border-b border-game-border px-6 py-2 flex items-center justify-between">
        {/* Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            <span className="font-oswald font-bold text-blue-400 text-lg">{score.ct}</span>
          </div>
          <span className="font-mono text-game-text-dim text-sm">—</span>
          <div className="flex items-center gap-2">
            <span className="font-oswald font-bold text-game-orange text-lg">{score.t}</span>
            <div className="w-2 h-2 bg-game-orange rounded-sm" />
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div className={`font-oswald font-black text-3xl tracking-widest ${
            phase === 'buy' ? 'text-game-gold' : timeLeft < 30 ? 'text-game-red' : 'text-game-text-bright'
          }`}>
            {phase === 'buy'
              ? `0:${String(timeLeft).padStart(2, '0')}`
              : '1:55'
            }
          </div>
          <div className="font-mono text-[10px] text-game-text-dim uppercase tracking-widest">
            {phase === 'buy' ? '— ФАЗА ПОКУПКИ —' : `РАУНД ${round}`}
          </div>
        </div>

        {/* Player info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 game-panel px-3 py-1">
            <Icon name="DollarSign" size={13} className="text-game-gold" />
            <span className="font-mono text-sm font-bold text-game-gold">${playerMoney.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="Heart" size={13} className="text-game-red" />
            <span className="font-oswald font-bold text-sm text-game-text-bright">{hp}</span>
          </div>
          {armor > 0 && (
            <div className="flex items-center gap-1">
              <Icon name="Shield" size={13} className="text-blue-400" />
              <span className="font-oswald font-bold text-sm text-blue-400">{armor}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left — team list */}
        <div className="w-52 border-r border-game-border p-3">
          <div className="game-label mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            Контртеррористы
          </div>
          {roundPlayers.map(player => (
            <div
              key={player.name}
              className={`flex items-center justify-between py-2 px-2 mb-0.5 ${player.hp === 0 ? 'opacity-30' : ''}`}
            >
              <div className="flex items-center gap-2">
                {player.hp === 0
                  ? <Icon name="Skull" size={12} className="text-game-text-dim" />
                  : <div className="w-1.5 h-1.5 rounded-full bg-game-green" />
                }
                <span className="font-rajdhani text-sm text-game-text">{player.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {player.armor && <Icon name="Shield" size={10} className="text-blue-400" />}
                <span className={`font-mono text-xs font-bold ${
                  player.hp > 70 ? 'text-game-green' :
                  player.hp > 30 ? 'text-game-gold' : 'text-game-red'
                }`}>
                  {player.hp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Center */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
          {/* Map overview placeholder */}
          <div className="w-full max-w-lg aspect-square bg-game-panel border border-game-border relative flex items-center justify-center mb-4">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(232,99,10,0.3) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(45deg, #1e2530 25%, transparent 25%),
                  linear-gradient(-45deg, #1e2530 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #1e2530 75%),
                  linear-gradient(-45deg, transparent 75%, #1e2530 75%)`,
                backgroundSize: '20px 20px',
              }}
            />
            <div className="text-center">
              <div className="game-label mb-2">Dust II — мини-карта</div>
              {/* CT positions */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full border border-white animate-pulse" title="Ghost_7" />
              <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-blue-500 rounded-full border border-white" title="Ф. Карпов" />
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 border-2 border-game-orange rounded-full" title="Ты" />
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full border border-white" title="Venom_X" />
              <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-blue-500 rounded-full border border-white opacity-30" title="Sidewinder (мёртв)" />
              {/* T positions */}
              <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-game-orange rounded-full opacity-50" />
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-game-orange rounded-full opacity-50" />
              <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-game-orange rounded-full opacity-50" />
            </div>
          </div>

          {/* Buy phase overlay */}
          {phase === 'buy' && (
            <div className="text-center animate-fade-in">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon name="ShoppingBag" size={16} className="text-game-gold" />
                <span className="font-oswald font-semibold text-game-gold tracking-widest uppercase text-sm">
                  Фаза покупки
                </span>
              </div>
              <div className="font-oswald font-black text-5xl text-game-gold mb-2">
                0:{String(timeLeft).padStart(2, '0')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onNavigate('shop-round')}
                  className="game-btn-primary flex items-center gap-2"
                >
                  <Icon name="ShoppingBag" size={15} />
                  Открыть магазин (B)
                </button>
                <button
                  onClick={() => setPhase('active')}
                  className="game-btn-secondary flex items-center gap-2"
                >
                  <Icon name="Play" size={15} />
                  Пропустить
                </button>
              </div>
            </div>
          )}

          {phase === 'active' && (
            <div className="text-center animate-scale-in">
              <div className="font-oswald font-black text-2xl text-game-text-bright mb-2 uppercase tracking-widest">
                Раунд {round} начался!
              </div>
              <div className="game-label">Миссия: Обезвредить бомбу</div>
            </div>
          )}
        </div>

        {/* Right — kill feed + actions */}
        <div className="w-64 border-l border-game-border p-3 flex flex-col">
          <div className="game-label mb-2">Kill Feed</div>
          {showKillFeed && killFeed.map((kill, i) => (
            <div key={i} className="flex items-center gap-1.5 py-1.5 border-b border-game-border/50 last:border-0 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
              <span className="font-mono text-xs text-game-orange font-bold truncate max-w-[70px]">{kill.killer}</span>
              {kill.headshot && <div className="w-3 h-3 bg-game-orange/30 flex items-center justify-center text-[8px]">💀</div>}
              <Icon name="ArrowRight" size={10} className="text-game-text-dim shrink-0" />
              <span className="font-mono text-xs text-game-text-dim truncate max-w-[70px]">{kill.victim}</span>
              <span className="font-mono text-[9px] text-game-text-dim ml-auto shrink-0">{kill.weapon}</span>
            </div>
          ))}

          <div className="mt-auto space-y-2">
            <div className="game-label mb-2 mt-4">Действия</div>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full game-btn-secondary text-xs py-2 flex items-center justify-center gap-2"
            >
              <Icon name="LogOut" size={12} />
              Покинуть матч
            </button>
            <button
              onClick={() => onNavigate('lobby')}
              className="w-full game-btn-secondary text-xs py-2 flex items-center justify-center gap-2"
            >
              <Icon name="RotateCcw" size={12} />
              Новый матч
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
