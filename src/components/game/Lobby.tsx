import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface LobbyProps {
  onNavigate: (screen: string) => void;
  onStartRound: () => void;
  playerMoney: number;
}

const MAPS = [
  { id: 'dust2', name: 'Dust II', type: 'Bomb Defusal', difficulty: 'Стандарт', players: '5v5' },
  { id: 'mirage', name: 'Mirage', type: 'Bomb Defusal', difficulty: 'Средняя', players: '5v5' },
  { id: 'inferno', name: 'Inferno', type: 'Bomb Defusal', difficulty: 'Сложная', players: '5v5' },
  { id: 'nuke', name: 'Nuke', type: 'Bomb Defusal', difficulty: 'Эксперт', players: '5v5' },
];

const CT_TEAM = [
  { name: 'Ghost_7', rank: 'Орёл I', kd: '1.82', ready: true },
  { name: 'Sidewinder', rank: 'МЕ', kd: '1.23', ready: true },
  { name: 'Ф. Карпов', rank: 'Орёл II', kd: '0.98', ready: false },
  { name: 'Venom_X', rank: 'ДМ I', kd: '1.45', ready: true },
  { name: 'TacticalAce', rank: 'Орёл III', kd: '1.67', ready: true },
];

const T_TEAM = [
  { name: 'RushB_King', rank: 'Легенда', kd: '1.91', ready: true },
  { name: 'Flashpoint', rank: 'МЕ', kd: '1.55', ready: true },
  { name: 'NightCrawler', rank: 'ДМ III', kd: '1.12', ready: true },
  { name: 'Striker99', rank: 'Орёл I', kd: '1.38', ready: false },
  { name: 'М. Волков', rank: 'Орёл II', kd: '1.02', ready: true },
];

const RANK_COLORS: Record<string, string> = {
  'МЕ': 'text-yellow-400',
  'Легенда': 'text-purple-400',
  'ДМ I': 'text-blue-400',
  'ДМ II': 'text-blue-400',
  'ДМ III': 'text-blue-400',
  'Орёл I': 'text-game-orange',
  'Орёл II': 'text-game-orange',
  'Орёл III': 'text-game-orange',
};

export default function Lobby({ onNavigate, onStartRound, playerMoney }: LobbyProps) {
  const [selectedMap, setSelectedMap] = useState('dust2');
  const [gameMode, setGameMode] = useState('competitive');
  const [isReady, setIsReady] = useState(false);

  const readyCount = CT_TEAM.filter(p => p.ready).length + T_TEAM.filter(p => p.ready).length;
  const totalCount = CT_TEAM.length + T_TEAM.length;

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Top bar */}
      <div className="border-b border-game-border px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('menu')}
          className="flex items-center gap-2 text-game-text-dim hover:text-game-orange transition-colors duration-200"
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="font-oswald text-sm tracking-widest uppercase">Меню</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-game-orange rounded-full animate-pulse" />
          <span className="font-oswald font-semibold tracking-widest uppercase text-game-text-bright">
            Лобби — Поиск матча
          </span>
        </div>

        <div className="flex items-center gap-2 game-panel px-3 py-1.5">
          <Icon name="DollarSign" size={14} className="text-game-gold" />
          <span className="font-mono font-bold text-game-gold">${playerMoney.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Left — map select */}
        <div className="w-56 border-r border-game-border p-4 flex flex-col gap-3">
          <div className="game-label mb-1">Выбор карты</div>
          {MAPS.map((map) => (
            <button
              key={map.id}
              onClick={() => setSelectedMap(map.id)}
              className={`
                text-left p-3 border transition-all duration-150
                ${selectedMap === map.id
                  ? 'border-game-orange bg-game-orange/10 text-game-text-bright'
                  : 'border-game-border bg-game-card text-game-text hover:border-game-orange/50'
                }
              `}
            >
              <div className="font-oswald font-semibold text-sm uppercase tracking-wide">{map.name}</div>
              <div className="font-mono text-[10px] text-game-text-dim mt-0.5">{map.type}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-mono text-[10px] text-game-text-dim">{map.difficulty}</span>
                <span className="font-mono text-[10px] text-game-orange">{map.players}</span>
              </div>
            </button>
          ))}

          <div className="mt-2">
            <div className="game-label mb-2">Режим</div>
            {[
              { id: 'competitive', label: 'Соревновательный' },
              { id: 'deathmatch', label: 'Дезматч' },
              { id: 'casual', label: 'Казуальный' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setGameMode(mode.id)}
                className={`
                  w-full text-left px-3 py-2 mb-1 border transition-all duration-150 text-xs font-rajdhani font-semibold uppercase tracking-wide
                  ${gameMode === mode.id
                    ? 'border-game-orange bg-game-orange/10 text-game-orange'
                    : 'border-game-border text-game-text-dim hover:border-game-orange/40 hover:text-game-text'
                  }
                `}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center — teams */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="game-label">Состав команд</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-game-green" />
              <span className="font-mono text-xs text-game-text-dim">
                Готовы: <span className="text-game-green">{readyCount}/{totalCount}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CT Team */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-game-border">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="font-oswald font-semibold text-sm uppercase tracking-widest text-blue-400">
                  Контртеррористы
                </span>
              </div>
              {CT_TEAM.map((player, i) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between py-2.5 px-3 mb-1 game-card border"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${player.ready ? 'bg-game-green' : 'bg-game-text-dim'}`} />
                    <span className="font-rajdhani font-semibold text-sm text-game-text-bright">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] font-bold ${RANK_COLORS[player.rank] || 'text-game-text-dim'}`}>
                      {player.rank}
                    </span>
                    <span className="font-mono text-xs text-game-text-dim">К/Д {player.kd}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* T Team */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-game-border">
                <div className="w-3 h-3 bg-game-orange rounded-sm" />
                <span className="font-oswald font-semibold text-sm uppercase tracking-widest text-game-orange">
                  Террористы
                </span>
              </div>
              {T_TEAM.map((player, i) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between py-2.5 px-3 mb-1 game-card border"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${player.ready ? 'bg-game-green' : 'bg-game-text-dim'}`} />
                    <span className="font-rajdhani font-semibold text-sm text-game-text-bright">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[10px] font-bold ${RANK_COLORS[player.rank] || 'text-game-text-dim'}`}>
                      {player.rank}
                    </span>
                    <span className="font-mono text-xs text-game-text-dim">К/Д {player.kd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match info bar */}
          <div className="mt-4 game-panel p-4 flex items-center justify-between">
            <div className="flex gap-6">
              {[
                { label: 'Карта', value: MAPS.find(m => m.id === selectedMap)?.name || '' },
                { label: 'Режим', value: gameMode === 'competitive' ? 'Соревновательный' : gameMode === 'deathmatch' ? 'Дезматч' : 'Казуальный' },
                { label: 'Раунды', value: '30 мax' },
                { label: 'Время', value: '1:55 / раунд' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="game-label text-[10px]">{item.label}</div>
                  <div className="font-rajdhani font-semibold text-sm text-game-text-bright">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('shop')}
                className="game-btn-secondary text-xs px-4 py-2 flex items-center gap-2"
              >
                <Icon name="ShoppingBag" size={14} />
                Снаряжение
              </button>
              <button
                onClick={() => {
                  setIsReady(true);
                  onStartRound();
                }}
                className={`
                  font-oswald font-semibold tracking-widest uppercase text-sm px-6 py-2.5
                  border transition-all duration-200 flex items-center gap-2
                  ${isReady
                    ? 'bg-game-green/20 border-game-green text-game-green hover:bg-game-green/30'
                    : 'bg-game-orange border-game-orange text-white hover:bg-game-orange-light animate-pulse-orange'
                  }
                `}
              >
                <Icon name={isReady ? "CheckCircle" : "Play"} size={16} />
                {isReady ? 'Готов!' : 'Начать матч'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}