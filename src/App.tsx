import { useState, useEffect, useRef } from 'react';

import GameSetupModal from './components/GameSetupModal';
import RulesModal from './components/RulesModal';

import './styles/timer.css';
import './styles/setup.css';

const SUPPLY_TYPES = [
    { name: 'FOOD', cssClass: 'supply-food' },
    { name: 'ENTERTAINMENT', cssClass: 'supply-entertainment' },
    { name: 'WEAPON', cssClass: 'supply-weapon' },
    { name: 'TOOL', cssClass: 'supply-tool' }
];

const getRandomDuration = () => {
    return Math.floor(Math.random() * (180 - 120 + 1)) + 120;
};

export default function App() {
    const [roundDuration, setRoundDuration] = useState<number>(() => {
        const saved = localStorage.getItem('gameState_roundDuration');
        return saved ? parseInt(saved, 10) : getRandomDuration();
    });

    const [round, setRound] = useState<number>(() => {
        const saved = localStorage.getItem('gameState_currentRound');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        const saved = localStorage.getItem('gameState_totalSeconds');
        return saved ? parseInt(saved, 10) : roundDuration;
    });

    const [neededSupply, setNeededSupply] = useState<{ name: string; cssClass: string } | null>(() => {
        const saved = localStorage.getItem('gameState_neededSupply');
        return saved ? JSON.parse(saved) : null;
    });

    const [isActive, setIsActive] = useState<boolean>(false);
    const [numPlayers, setNumPlayers] = useState<number>(2);

    const [showSetupModal, setShowSetupModal] = useState<boolean>(() => {
        if (round === 0) return true;
        if (timeLeft === roundDuration) return true;
        return false;
    });

    const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

    const tickSound = useRef<HTMLAudioElement>(null);
    const roundEndSound = useRef<HTMLAudioElement>(null);
    const gameEndSound = useRef<HTMLAudioElement>(null);
    const startSound = useRef<HTMLAudioElement>(null);
    const savedSound = useRef<HTMLAudioElement>(null);
    const calculatingSound = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        localStorage.setItem('gameState_currentRound', round.toString());
        localStorage.setItem('gameState_totalSeconds', timeLeft.toString());
        localStorage.setItem('gameState_roundDuration', roundDuration.toString());

        if (neededSupply) {
            localStorage.setItem('gameState_neededSupply', JSON.stringify(neededSupply));
        } else {
            localStorage.removeItem('gameState_neededSupply');
        }
    }, [round, timeLeft, neededSupply, roundDuration]);

    useEffect(() => {
        let interval: any = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);

            if (round < 10) {
                if (roundEndSound.current) roundEndSound.current.play();
                const randomSupply = SUPPLY_TYPES[Math.floor(Math.random() * SUPPLY_TYPES.length)];
                setNeededSupply(randomSupply);
                setRound((prev) => prev + 1);
            } else {
                if (gameEndSound.current) gameEndSound.current.play();
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, round]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        let tickSpeed = 1000;
        if (timeLeft <= 10) tickSpeed = 200;
        else if (timeLeft <= 30) tickSpeed = 500;

        const soundInterval = setInterval(() => {
            if (tickSound.current) {
                tickSound.current.currentTime = 0;
                tickSound.current.play().catch(() => {});
            }
        }, tickSpeed);

        return () => clearInterval(soundInterval);
    }, [isActive, timeLeft]);

    const getProgressBarClass = () => {
        if (timeLeft <= 10) return 'progress-bar-critical';
        if (timeLeft <= 30) return 'progress-bar-urgent';
        return '';
    };

    const handleOpenRules = () => {
        if (isActive) setIsActive(false);
        setShowRulesModal(true);
    };

    const handleStartClick = () => {
        if (timeLeft < roundDuration && timeLeft > 0 && round > 0) {
            if (startSound.current) startSound.current.play();
            setIsActive(true);
        } else {
            const newDuration = getRandomDuration();
            setRoundDuration(newDuration);
            setTimeLeft(newDuration);
            setNeededSupply(null);
            setShowSetupModal(true);
        }
    };

    const handleStopTimer = () => {
        setIsActive(false);
    };

    const handleResetGame = () => {
        setIsActive(false);
        setRound(0);

        const newDuration = getRandomDuration();
        setRoundDuration(newDuration);
        setTimeLeft(newDuration);

        setNumPlayers(2);
        setNeededSupply(null);
        localStorage.clear();

        setShowSetupModal(true);
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleProceedToGame = () => {
        if (savedSound.current) savedSound.current.play();
        setShowSetupModal(false);
        if (round === 0) setRound(1);
        setIsActive(true);
        if (startSound.current) startSound.current.play();
    };

    const playCalcSound = () => {
        if (calculatingSound.current) calculatingSound.current.play();
    };

    const getStartButtonText = () => {
        if (timeLeft < roundDuration && timeLeft > 0 && round > 0) return 'RESUME GAME';
        if (round === 0) return 'START GAME';
        return `START DAY ${round}`;
    };

    return (
        <div className="home-container">
            <audio ref={tickSound} src="/sounds/tick.mp3" preload="auto"></audio>
            <audio ref={roundEndSound} src="/sounds/buzzer.mp3" preload="auto"></audio>
            <audio ref={gameEndSound} src="/sounds/game_over.mp3" preload="auto"></audio>
            <audio ref={startSound} src="/sounds/start_beep.mp3" preload="auto"></audio>
            <audio ref={savedSound} src="/sounds/game_saved.mp3" preload="auto"></audio>
            <audio ref={calculatingSound} src="/sounds/calculating.mp3" preload="auto"></audio>

            <div className="meta-controls">
                <button id="resetGameBtn" className="button reset-btn" onClick={handleResetGame}>
                    Reset Game
                </button>

                <button id="rulesButton" onClick={handleOpenRules}>
                    Guidebook
                </button>
            </div>

            <section>
                <h2>Countdown to Mayhem</h2>
                <p>Prepare for 10 rounds of intense survival.</p>

                <div className="timer-controls">
                    {!isActive && (
                        <button id="startTimer" className="button" onClick={handleStartClick}>
                            {getStartButtonText()}
                        </button>
                    )}

                    {isActive && (
                        <button id="stopTimer" className="button" onClick={handleStopTimer}>
                            PAUSE
                        </button>
                    )}
                </div>

                <div id="roundDisplay">
                    Round: {timeLeft === 0 && round > 1 ? round - 1 : round}/10
                </div>

                <div
                    id="progressBarContainer"
                    className={timeLeft <= 5 && isActive ? 'progress-bar-shaking' : ''}
                    style={{ display: isActive ? 'block' : 'none' }}
                >
                    <div
                        id="progressBar"
                        className={getProgressBarClass()}
                        style={{ width: `${(timeLeft / roundDuration) * 100}%` }}
                    ></div>
                </div>

                {neededSupply && timeLeft === 0 ? (
                    <div className="end-round-container">
                        <div className="day-complete-text">DAY COMPLETE!</div>
                        <div className="needed-supply-label">NEEDED SUPPLY:</div>
                        <div
                            className={`
                                supply-name-large
                                ${neededSupply.cssClass}
                                ${neededSupply.name.length > 8 ? 'text-long' : ''}
                            `}
                        >
                            {neededSupply.name}
                        </div>
                    </div>
                ) : (
                    <div id="timerDisplay" className={isActive ? '' : 'hidden-timer'} style={{ minHeight: '3rem' }} />
                )}
            </section>

            {showSetupModal && (
                <GameSetupModal
                    numPlayers={numPlayers}
                    setNumPlayers={setNumPlayers}
                    onProceed={handleProceedToGame}
                    playCalculateSound={playCalcSound}
                    round={round}
                />
            )}

            {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
        </div>
    );
}
