import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface ShopProps {
  onNavigate: (screen: string) => void;
  playerMoney: number;
  onBuy: (cost: number, item: string) => void;
  isInRound?: boolean;
}

const WEAPONS = {
  rifles: [
    { id: 'ak47', name: 'AK-47', price: 2700, damage: 87, fireRate: 600, accuracy: 78, team: 'T', owned: false },
    { id: 'm4a4', name: 'M4A4', price: 3100, damage: 80, fireRate: 666, accuracy: 82, team: 'CT', owned: false },
    { id: 'awp', name: 'AWP', price: 4750, damage: 115, fireRate: 41, accuracy: 98, team: 'Все', owned: true },
    { id: 'famas', name: 'FAMAS', price: 2050, damage: 75, fireRate: 800, accuracy: 73, team: 'CT', owned: false },
    { id: 'galil', name: 'Galil AR', price: 1800, damage: 73, fireRate: 666, accuracy: 71, team: 'T', owned: false },
  ],
  pistols: [
    { id: 'deagle', name: 'Desert Eagle', price: 700, damage: 98, fireRate: 267, accuracy: 85, team: 'Все', owned: false },
    { id: 'glock', name: 'Glock-18', price: 200, damage: 48, fireRate: 400, accuracy: 72, team: 'T', owned: true },
    { id: 'usp', name: 'USP-S', price: 300, damage: 61, fireRate: 352, accuracy: 88, team: 'CT', owned: false },
    { id: 'p250', name: 'P250', price: 300, damage: 63, fireRate: 400, accuracy: 78, team: 'Все', owned: false },
  ],
  equipment: [
    { id: 'helmet', name: 'Шлем + Броня', price: 1000, damage: 0, fireRate: 0, accuracy: 0, team: 'Все', owned: false },
    { id: 'armor', name: 'Броня', price: 650, damage: 0, fireRate: 0, accuracy: 0, team: 'Все', owned: false },
    { id: 'flash', name: 'Флэш x2', price: 400, damage: 0, fireRate: 0, accuracy: 0, team: 'Все', owned: false },
    { id: 'grenade', name: 'Граната HE', price: 300, damage: 98, fireRate: 0, accuracy: 0, team: 'Все', owned: false },
    { id: 'smoke', name: 'Дымовая', price: 300, damage: 0, fireRate: 0, accuracy: 0, team: 'Все', owned: false },
    { id: 'kit', name: 'Набор сапёра', price: 400, damage: 0, fireRate: 0, accuracy: 0, team: 'CT', owned: false },
  ],
};

type Category = 'rifles' | 'pistols' | 'equipment';

export default function Shop({ onNavigate, playerMoney, onBuy, isInRound = false }: ShopProps) {
  const [category, setCategory] = useState<Category>('rifles');
  const [selected, setSelected] = useState<string | null>('awp');
  const [cart, setCart] = useState<string[]>([]);

  const items = WEAPONS[category];
  const selectedItem = [...WEAPONS.rifles, ...WEAPONS.pistols, ...WEAPONS.equipment].find(w => w.id === selected);
  const cartTotal = cart.reduce((sum, id) => {
    const item = [...WEAPONS.rifles, ...WEAPONS.pistols, ...WEAPONS.equipment].find(w => w.id === id);
    return sum + (item?.price || 0);
  }, 0);

  const addToCart = (id: string, price: number) => {
    if (cart.includes(id)) {
      setCart(cart.filter(c => c !== id));
    } else {
      setCart([...cart, id]);
    }
  };

  const handleBuyAll = () => {
    if (cartTotal <= playerMoney) {
      cart.forEach(id => {
        const item = [...WEAPONS.rifles, ...WEAPONS.pistols, ...WEAPONS.equipment].find(w => w.id === id);
        if (item) onBuy(item.price, item.name);
      });
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-game-border px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate(isInRound ? 'roundstart' : 'menu')}
          className="flex items-center gap-2 text-game-text-dim hover:text-game-orange transition-colors duration-200"
        >
          <Icon name="ArrowLeft" size={16} />
          <span className="font-oswald text-sm tracking-widest uppercase">
            {isInRound ? 'К раунду' : 'Меню'}
          </span>
        </button>

        <div className="flex items-center gap-3">
          {isInRound && (
            <div className="flex items-center gap-2 mr-2">
              <Icon name="Clock" size={14} className="text-game-orange" />
              <span className="font-mono font-bold text-game-orange">0:45</span>
            </div>
          )}
          <Icon name="ShoppingBag" size={16} className="text-game-orange" />
          <span className="font-oswald font-semibold tracking-widest uppercase text-game-text-bright">Магазин</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 game-panel px-3 py-1.5">
            <Icon name="DollarSign" size={14} className="text-game-gold" />
            <span className="font-mono font-bold text-game-gold">${playerMoney.toLocaleString()}</span>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2 bg-game-orange/20 border border-game-orange px-3 py-1.5">
              <Icon name="ShoppingCart" size={14} className="text-game-orange" />
              <span className="font-mono text-xs text-game-orange">{cart.length} | ${cartTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left — categories */}
        <div className="w-44 border-r border-game-border p-3 flex flex-col gap-1">
          <div className="game-label mb-2">Категории</div>
          {([
            { id: 'rifles', label: 'Винтовки', icon: 'Crosshair' },
            { id: 'pistols', label: 'Пистолеты', icon: 'Zap' },
            { id: 'equipment', label: 'Снаряжение', icon: 'Shield' },
          ] as const).map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                flex items-center gap-2.5 px-3 py-2.5 border text-left transition-all duration-150
                ${category === cat.id
                  ? 'border-game-orange bg-game-orange/10 text-game-orange'
                  : 'border-game-border text-game-text-dim hover:border-game-orange/40 hover:text-game-text'
                }
              `}
            >
              <Icon name={cat.icon} size={14} />
              <span className="font-oswald text-sm tracking-wide uppercase">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Center — items */}
        <div className="flex-1 p-4">
          <div className="game-label mb-3">{category === 'rifles' ? 'Винтовки' : category === 'pistols' ? 'Пистолеты' : 'Снаряжение'}</div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {items.map((item) => {
              const inCart = cart.includes(item.id);
              const canAfford = item.price <= playerMoney;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  onDoubleClick={() => addToCart(item.id, item.price)}
                  className={`
                    p-3 border text-left transition-all duration-150 relative
                    ${selected === item.id ? 'border-game-orange bg-game-orange/10' : 'border-game-border bg-game-card hover:border-game-orange/40'}
                    ${item.owned ? 'opacity-60' : ''}
                  `}
                >
                  {item.owned && (
                    <div className="absolute top-2 right-2">
                      <Icon name="CheckCircle" size={12} className="text-game-green" />
                    </div>
                  )}
                  {inCart && (
                    <div className="absolute top-2 right-2 bg-game-orange w-4 h-4 flex items-center justify-center">
                      <Icon name="Check" size={10} className="text-white" />
                    </div>
                  )}
                  <div className="font-oswald font-semibold text-sm text-game-text-bright uppercase tracking-wide mb-1">
                    {item.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-bold text-sm ${canAfford ? 'text-game-gold' : 'text-game-red'}`}>
                      ${item.price.toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-game-text-dim">{item.team}</span>
                  </div>
                  {category !== 'equipment' && (
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      {[
                        { label: 'URN', val: item.damage },
                        { label: 'СКС', val: item.fireRate },
                        { label: 'ТОЧ', val: item.accuracy },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="font-mono text-[8px] text-game-text-dim">{s.label}</div>
                          <div className="h-0.5 bg-game-border mt-0.5">
                            <div
                              className="h-full bg-game-orange transition-all duration-300"
                              style={{ width: `${Math.min(s.val, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-center">
            <span className="font-mono text-[10px] text-game-text-dim">Двойной клик — добавить в корзину</span>
          </div>
        </div>

        {/* Right — item detail */}
        <div className="w-64 border-l border-game-border p-4 flex flex-col">
          {selectedItem ? (
            <>
              <div className="game-label mb-3">Информация</div>
              <div className="game-card border p-4 flex-1">
                <div className="font-oswald font-bold text-xl text-game-text-bright uppercase tracking-wide mb-1">
                  {selectedItem.name}
                </div>
                <div className="font-mono text-[10px] text-game-text-dim mb-4">
                  Команда: {selectedItem.team}
                </div>

                <div className={`font-mono font-bold text-2xl mb-4 ${selectedItem.price <= playerMoney ? 'text-game-gold' : 'text-game-red'}`}>
                  ${selectedItem.price.toLocaleString()}
                </div>

                {category !== 'equipment' && (
                  <div className="space-y-3 mb-4">
                    {[
                      { label: 'Урон', value: selectedItem.damage, max: 120 },
                      { label: 'Скорострельность', value: selectedItem.fireRate, max: 900 },
                      { label: 'Точность', value: selectedItem.accuracy, max: 100 },
                    ].map(stat => (
                      <div key={stat.label}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[10px] text-game-text-dim uppercase">{stat.label}</span>
                          <span className="font-mono text-[10px] text-game-orange">{stat.value}</span>
                        </div>
                        <div className="h-1 bg-game-border">
                          <div
                            className="h-full bg-gradient-to-r from-game-orange to-game-orange-light transition-all duration-500"
                            style={{ width: `${(stat.value / stat.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  {!selectedItem.owned ? (
                    <>
                      <button
                        onClick={() => addToCart(selectedItem.id, selectedItem.price)}
                        disabled={!selectedItem.price || selectedItem.price > playerMoney}
                        className={`
                          w-full game-btn-secondary text-xs py-2.5 flex items-center justify-center gap-2
                          ${cart.includes(selectedItem.id) ? 'border-game-orange text-game-orange' : ''}
                          disabled:opacity-40 disabled:cursor-not-allowed
                        `}
                      >
                        <Icon name={cart.includes(selectedItem.id) ? "Minus" : "Plus"} size={12} />
                        {cart.includes(selectedItem.id) ? 'Убрать из корзины' : 'В корзину'}
                      </button>
                      <button
                        onClick={() => onBuy(selectedItem.price, selectedItem.name)}
                        disabled={selectedItem.price > playerMoney}
                        className="w-full game-btn-primary text-xs py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Icon name="Zap" size={12} />
                        Купить
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 border border-game-green/40 bg-game-green/10">
                      <Icon name="CheckCircle" size={14} className="text-game-green" />
                      <span className="font-oswald text-sm text-game-green uppercase tracking-wide">Уже куплено</span>
                    </div>
                  )}
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleBuyAll}
                  disabled={cartTotal > playerMoney}
                  className="mt-3 w-full game-btn-primary text-xs py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="ShoppingCart" size={12} />
                  Купить всё (${cartTotal.toLocaleString()})
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-game-text-dim">
              <div className="text-center">
                <Icon name="MousePointer" size={24} className="mx-auto mb-2" />
                <span className="font-mono text-xs">Выберите оружие</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
