import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainMenu from './components/game/MainMenu';
import Lobby from './components/game/Lobby';
import Shop from './components/game/Shop';
import Settings from './components/game/Settings';
import RoundStart from './components/game/RoundStart';

type Screen = 'menu' | 'lobby' | 'shop' | 'settings' | 'roundstart' | 'shop-round';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerMoney, setPlayerMoney] = useState(3000);
  const [round] = useState(1);
  const [score] = useState({ ct: 0, t: 0 });

  const handleBuy = (cost: number) => {
    setPlayerMoney(prev => Math.max(0, prev - cost));
  };

  const handleStartRound = () => {
    setScreen('roundstart');
  };

  const navigate = (s: string) => {
    setScreen(s as Screen);
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-game-bg">
        {screen === 'menu' && (
          <MainMenu
            onNavigate={navigate}
            playerName="М. Волков"
            playerRank="Орёл II"
            playerLevel={32}
          />
        )}
        {screen === 'lobby' && (
          <Lobby
            onNavigate={navigate}
            onStartRound={handleStartRound}
            playerMoney={playerMoney}
          />
        )}
        {screen === 'shop' && (
          <Shop
            onNavigate={navigate}
            playerMoney={playerMoney}
            onBuy={handleBuy}
            isInRound={false}
          />
        )}
        {screen === 'shop-round' && (
          <Shop
            onNavigate={navigate}
            playerMoney={playerMoney}
            onBuy={handleBuy}
            isInRound={true}
          />
        )}
        {screen === 'settings' && (
          <Settings onNavigate={navigate} />
        )}
        {screen === 'roundstart' && (
          <RoundStart
            onNavigate={navigate}
            playerMoney={playerMoney}
            round={round}
            score={score}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
