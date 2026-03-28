import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface SettingsProps {
  onNavigate: (screen: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('controls');
  const [sensitivity, setSensitivity] = useState(2.5);
  const [dpi, setDpi] = useState(800);
  const [volume, setVolume] = useState(75);
  const [sfxVolume, setSfxVolume] = useState(90);
  const [brightness, setBrightness] = useState(60);
  const [resolution, setResolution] = useState('1920x1080');
  const [fov, setFov] = useState(90);
  const [crosshair, setCrosshair] = useState('default');
  const [graphicsPreset, setGraphicsPreset] = useState('high');

  const keybinds = [
    { action: 'Двигаться вперёд', key: 'W' },
    { action: 'Двигаться назад', key: 'S' },
    { action: 'Влево', key: 'A' },
    { action: 'Вправо', key: 'D' },
    { action: 'Прыжок', key: 'ПРОБЕЛ' },
    { action: 'Присесть', key: 'CTRL' },
    { action: 'Идти тихо', key: 'SHIFT' },
    { action: 'Осн. оружие', key: '1' },
    { action: 'Пистолет', key: '2' },
    { action: 'Граната', key: '4' },
    { action: 'Магазин', key: 'B' },
    { action: 'Сменить команду', key: 'TAB' },
  ];

  const tabs = [
    { id: 'controls', label: 'Управление', icon: 'Gamepad2' },
    { id: 'audio', label: 'Звук', icon: 'Volume2' },
    { id: 'graphics', label: 'Графика', icon: 'Monitor' },
    { id: 'crosshair', label: 'Прицел', icon: 'Crosshair' },
  ];

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-game-border px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('menu')}
          className="flex items-center gap-2 text-game-text-dim hover:text-game-orange transition-colors duration-200"
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="font-oswald text-sm tracking-widest uppercase">Меню</span>
        </button>
        <div className="flex items-center gap-3">
          <Icon name="Settings" size={16} className="text-game-orange" />
          <span className="font-oswald font-semibold tracking-widest uppercase text-game-text-bright">Настройки</span>
        </div>
        <button className="game-btn-primary text-xs px-4 py-2 flex items-center gap-2">
          <Icon name="Save" size={12} />
          Сохранить
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar tabs */}
        <div className="w-48 border-r border-game-border p-3 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-3 px-3 py-3 border text-left transition-all duration-150
                ${activeTab === tab.id
                  ? 'border-game-orange bg-game-orange/10 text-game-orange'
                  : 'border-transparent text-game-text-dim hover:text-game-text hover:border-game-border'
                }
              `}
            >
              <Icon name={tab.icon} size={15} />
              <span className="font-oswald text-sm tracking-wide uppercase">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-2xl">
          {activeTab === 'controls' && (
            <div className="animate-fade-in">
              <div className="game-label mb-4">Мышь</div>
              <div className="space-y-4 mb-6">
                <div className="game-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-rajdhani font-semibold text-game-text">Чувствительность</span>
                    <span className="font-mono text-game-orange font-bold">{sensitivity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range" min="0.1" max="10" step="0.1"
                    value={sensitivity}
                    onChange={e => setSensitivity(parseFloat(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="font-mono text-[10px] text-game-text-dim">0.1</span>
                    <span className="font-mono text-[10px] text-game-text-dim">10.0</span>
                  </div>
                </div>

                <div className="game-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-rajdhani font-semibold text-game-text">DPI мыши</span>
                    <span className="font-mono text-game-orange font-bold">{dpi}</span>
                  </div>
                  <input
                    type="range" min="200" max="3200" step="100"
                    value={dpi}
                    onChange={e => setDpi(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              </div>

              <div className="game-label mb-3">Клавиши управления</div>
              <div className="game-panel">
                {keybinds.map((bind, i) => (
                  <div
                    key={bind.action}
                    className={`flex items-center justify-between px-4 py-2.5 ${i < keybinds.length - 1 ? 'border-b border-game-border' : ''}`}
                  >
                    <span className="font-rajdhani text-sm text-game-text">{bind.action}</span>
                    <button className="font-mono text-xs bg-game-card border border-game-border hover:border-game-orange text-game-text-bright px-3 py-1 transition-colors duration-150 min-w-[60px] text-center">
                      {bind.key}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="animate-fade-in space-y-4">
              <div className="game-label mb-2">Звук</div>
              {[
                { label: 'Общая громкость', value: volume, set: setVolume },
                { label: 'Звуковые эффекты', value: sfxVolume, set: setSfxVolume },
              ].map(({ label, value, set }) => (
                <div key={label} className="game-panel p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-rajdhani font-semibold text-game-text">{label}</span>
                    <span className="font-mono text-game-orange font-bold">{value}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={value}
                    onChange={e => set(parseInt(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
              ))}

              <div className="game-label mt-4 mb-2">Аудио опции</div>
              <div className="game-panel p-4 space-y-3">
                {[
                  'Звук шагов',
                  'Звуки перестрелок',
                  'Голосовой чат',
                  'Звук попаданий',
                ].map(opt => (
                  <div key={opt} className="flex items-center justify-between">
                    <span className="font-rajdhani text-sm text-game-text">{opt}</span>
                    <div className="w-10 h-5 bg-game-orange/30 border border-game-orange rounded-full flex items-center px-0.5 cursor-pointer">
                      <div className="w-4 h-4 bg-game-orange rounded-full ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'graphics' && (
            <div className="animate-fade-in space-y-4">
              <div className="game-label mb-2">Графика</div>
              <div className="game-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-rajdhani font-semibold text-game-text">Яркость</span>
                  <span className="font-mono text-game-orange font-bold">{brightness}%</span>
                </div>
                <input
                  type="range" min="20" max="100" step="1"
                  value={brightness}
                  onChange={e => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="game-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-rajdhani font-semibold text-game-text">Поле зрения (FOV)</span>
                  <span className="font-mono text-game-orange font-bold">{fov}°</span>
                </div>
                <input
                  type="range" min="60" max="120" step="1"
                  value={fov}
                  onChange={e => setFov(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="game-panel p-4">
                <div className="font-rajdhani font-semibold text-game-text mb-3">Разрешение</div>
                <div className="grid grid-cols-3 gap-2">
                  {['1280x720', '1920x1080', '2560x1440'].map(res => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`font-mono text-xs py-2 border transition-all duration-150 ${resolution === res ? 'border-game-orange bg-game-orange/10 text-game-orange' : 'border-game-border text-game-text-dim hover:border-game-orange/40'}`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="game-panel p-4">
                <div className="font-rajdhani font-semibold text-game-text mb-3">Качество графики</div>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'ultra'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setGraphicsPreset(preset)}
                      className={`font-oswald text-xs py-2 uppercase tracking-wider border transition-all duration-150 ${graphicsPreset === preset ? 'border-game-orange bg-game-orange/10 text-game-orange' : 'border-game-border text-game-text-dim hover:border-game-orange/40'}`}
                    >
                      {preset === 'low' ? 'Низкое' : preset === 'medium' ? 'Среднее' : preset === 'high' ? 'Высокое' : 'Ультра'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crosshair' && (
            <div className="animate-fade-in">
              <div className="game-label mb-4">Прицел</div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'default', label: 'Стандарт' },
                  { id: 'dot', label: 'Точка' },
                  { id: 'cross', label: 'Крест' },
                  { id: 'cross-gap', label: 'Крест с разрывом' },
                  { id: 'circle', label: 'Окружность' },
                  { id: 'custom', label: 'Свой' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setCrosshair(type.id)}
                    className={`
                      p-4 border transition-all duration-150 flex flex-col items-center gap-2
                      ${crosshair === type.id ? 'border-game-orange bg-game-orange/10' : 'border-game-border bg-game-card hover:border-game-orange/40'}
                    `}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      {type.id === 'dot' && <div className="w-2 h-2 bg-game-orange rounded-full" />}
                      {type.id === 'cross' && (
                        <div className="relative w-6 h-6">
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-game-orange" />
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-game-orange" />
                        </div>
                      )}
                      {(type.id === 'default' || type.id === 'cross-gap') && (
                        <div className="relative w-6 h-6">
                          <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-game-orange -translate-y-1/2" />
                          <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-game-orange -translate-y-1/2" />
                          <div className="absolute left-1/2 top-0 h-2 w-0.5 bg-game-orange -translate-x-1/2" />
                          <div className="absolute left-1/2 bottom-0 h-2 w-0.5 bg-game-orange -translate-x-1/2" />
                        </div>
                      )}
                      {type.id === 'circle' && <div className="w-6 h-6 rounded-full border-2 border-game-orange" />}
                      {type.id === 'custom' && <Icon name="Plus" size={18} className="text-game-text-dim" />}
                    </div>
                    <span className="font-mono text-[10px] text-game-text-dim uppercase">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="game-panel p-4">
                <div className="font-rajdhani font-semibold text-game-text mb-3">Цвет прицела</div>
                <div className="flex gap-3">
                  {[
                    { color: '#e8630a', label: 'Оранжевый' },
                    { color: '#2dba4e', label: 'Зелёный' },
                    { color: '#ffffff', label: 'Белый' },
                    { color: '#ffff00', label: 'Жёлтый' },
                    { color: '#00ffff', label: 'Циан' },
                  ].map(c => (
                    <button
                      key={c.color}
                      className="w-8 h-8 border-2 border-game-border hover:border-white transition-colors duration-150"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
