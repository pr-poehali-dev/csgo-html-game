import Icon from '@/components/ui/icon';

interface MainMenuProps {
  onNavigate: (screen: string) => void;
  playerName: string;
  playerRank: string;
  playerLevel: number;
}

const MAP_IMAGE = "https://cdn.poehali.dev/projects/c3f9c6ae-1942-4ca8-b7cb-2baf15212703/files/22b3842c-5f88-4151-8750-cd864957a3dc.jpg";

export default function MainMenu({ onNavigate, playerName, playerRank, playerLevel }: MainMenuProps) {
  const menuItems = [
    { id: 'lobby', label: 'Играть', icon: 'Crosshair', accent: true },
    { id: 'shop', label: 'Магазин', icon: 'ShoppingBag', accent: false },
    { id: 'settings', label: 'Настройки', icon: 'Settings', accent: false },
  ];

  const stats = [
    { label: 'К/Д', value: '1.47' },
    { label: 'Побед', value: '284' },
    { label: 'Рейтинг', value: '#1,204' },
    { label: 'Часов', value: '847' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={MAP_IMAGE}
          alt="map"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-game-bg via-game-bg/90 to-game-bg/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-game-bg via-transparent to-game-bg/60" />
      </div>

      {/* Scan lines */}
      <div className="scan-line" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(232,99,10,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,99,10,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-game-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-game-orange flex items-center justify-center">
            <Icon name="Target" size={16} className="text-white" />
          </div>
          <span className="font-oswald font-bold text-xl text-game-text-bright tracking-[0.2em] uppercase">
            STRIKE
          </span>
          <span className="game-label ml-2">v2.1.4</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Icon name="Wifi" size={14} className="text-game-green" />
            <span className="font-mono text-xs text-game-green">32ms</span>
          </div>
          <div className="flex items-center gap-2 game-panel px-3 py-1.5">
            <div className="w-7 h-7 bg-game-orange/20 border border-game-orange/40 flex items-center justify-center">
              <span className="font-oswald font-bold text-xs text-game-orange">{playerLevel}</span>
            </div>
            <div>
              <div className="font-rajdhani font-semibold text-sm text-game-text-bright leading-tight">{playerName}</div>
              <div className="font-mono text-[10px] text-game-orange leading-tight">{playerRank}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center px-8 py-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-8 items-center">

            {/* Left — title + menu */}
            <div className="col-span-5 animate-fade-in">
              {/* Decorative label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-game-orange" />
                <span className="game-label">ТАКТИЧЕСКИЙ ШУТЕР</span>
              </div>

              {/* Title */}
              <h1 className="font-oswald font-black text-7xl text-game-text-bright leading-none mb-2 tracking-tight">
                STRIKE
              </h1>
              <h2 className="font-oswald font-light text-2xl text-game-orange tracking-[0.3em] mb-8 uppercase">
                Combat Online
              </h2>

              {/* Menu */}
              <nav className="flex flex-col gap-2">
                {menuItems.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      group flex items-center gap-4 px-5 py-3.5 text-left
                      border transition-all duration-200
                      ${item.accent
                        ? 'bg-game-orange border-game-orange text-white hover:bg-game-orange-light'
                        : 'bg-game-panel/80 border-game-border text-game-text hover:border-game-orange hover:text-game-orange-light'
                      }
                    `}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={item.accent ? 'text-white' : 'text-game-orange group-hover:text-game-orange-light'}
                    />
                    <span className="font-oswald font-semibold tracking-widest uppercase text-base">
                      {item.label}
                    </span>
                    <Icon
                      name="ChevronRight"
                      size={14}
                      className={`ml-auto transition-transform duration-200 group-hover:translate-x-1 ${item.accent ? 'text-white/70' : 'text-game-text-dim'}`}
                    />
                  </button>
                ))}
              </nav>
            </div>

            {/* Right — stats panel */}
            <div className="col-span-7 flex justify-end">
              <div className="w-full max-w-md animate-slide-in-right">
                {/* Active server */}
                <div className="game-panel p-4 mb-4 relative corner-bracket">
                  <div className="game-label mb-3">Активные серверы</div>
                  {[
                    { name: 'Dust II — Deathmatch', players: '12/16', ping: '28ms', status: 'hot' },
                    { name: 'Mirage — Competitive', players: '9/10', ping: '31ms', status: 'full' },
                    { name: 'Inferno — Casual', players: '6/16', ping: '19ms', status: 'open' },
                  ].map((server) => (
                    <div key={server.name} className="flex items-center justify-between py-2 border-b border-game-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          server.status === 'hot' ? 'bg-game-orange animate-pulse' :
                          server.status === 'full' ? 'bg-game-red' : 'bg-game-green'
                        }`} />
                        <span className="font-rajdhani text-sm text-game-text">{server.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-game-text-dim">{server.players}</span>
                        <span className="font-mono text-xs text-game-green">{server.ping}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {stats.map((stat) => (
                    <div key={stat.label} className="game-card p-3 text-center">
                      <div className="font-oswald font-bold text-xl text-game-orange">{stat.value}</div>
                      <div className="font-mono text-[10px] text-game-text-dim uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent match */}
                <div className="game-panel p-3 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-game-green/20 border border-game-green/40 flex items-center justify-center">
                      <Icon name="Trophy" size={14} className="text-game-green" />
                    </div>
                    <div>
                      <div className="font-rajdhani text-sm text-game-text-bright font-semibold">Последний матч: Победа</div>
                      <div className="font-mono text-[10px] text-game-text-dim">Mirage · 16:11 · 24/8/3</div>
                    </div>
                  </div>
                  <span className="font-oswald font-bold text-game-green text-sm">+42 ELO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="relative z-10 border-t border-game-border px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-mono text-xs text-game-text-dim">СЕРВЕРОВ ОНЛАЙН: <span className="text-game-green">847</span></span>
          <span className="font-mono text-xs text-game-text-dim">ИГРОКОВ: <span className="text-game-orange">124,332</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-game-green animate-pulse" />
          <span className="font-mono text-xs text-game-text-dim">СВЯЗЬ СТАБИЛЬНА</span>
        </div>
      </footer>
    </div>
  );
}
