import { useState, useEffect, useRef } from 'react';
import GameSetupModal from './components/GameSetupModal';
import RulesModal from './components/RulesModal';
import DayEventModal, { type DayEvent } from './components/DayEventModal';
import './styles/timer.css';
import './styles/setup.css';
import './styles/event.css';

const SUPPLY_TYPES = [
    { name: 'FOOD', cssClass: 'supply-food' },
    { name: 'ENTERTAINMENT', cssClass: 'supply-entertainment' },
    { name: 'WEAPON', cssClass: 'supply-weapon' },
    { name: 'TOOL', cssClass: 'supply-tool' }
];

const DAY_PHASE_EVENTS: DayEvent[] = [
    {
        id: 'panic_attack',
        title: 'PANIC ATTACK!',
        description: 'A wave of dread sweeps through the wasteland. Everyone freezes for a moment.',
        effectText: 'All players must stop immediately, take a breath, and then continue.',
        accentClass: 'event-danger'
    },
    {
        id: 'radio_interference',
        title: 'RADIO INTERFERENCE!',
        description: 'A burst of static and broken emergency broadcasts fills the air.',
        effectText: 'Players must stay silent until the turn returns to the first player.',
        accentClass: 'event-chaos'
    },
    {
        id: 'sudden_collapse',
        title: 'SUDDEN COLLAPSE!',
        description: 'Part of the ruined zone gives in with a horrible cracking sound.',
        effectText: 'Remove 1 random EMPTY tile from the board before continuing.',
        accentClass: 'event-warning'
    },
    {
        id: 'adrenaline_rush',
        title: 'ADRENALINE RUSH!',
        description: 'Your survival instincts kick in hard. For one brief moment, everyone moves faster.',
        effectText: 'Each player gains +1 movement on their next turn.',
        accentClass: 'event-bonus'
    },
    {
        id: 'toxic_dust',
        title: 'TOXIC DUST CLOUD!',
        description: 'A foul toxic haze rolls through the area and makes breathing harder.',
        effectText: 'Any player without FOOD or TOOL in their shelter loses 1 heart.',
        accentClass: 'event-danger'
    },
    {
        id: 'scavenger_frenzy',
        title: 'SCAVENGER FRENZY!',
        description: 'Everyone lunges for loot at once. The pace of survival just got uglier.',
        effectText: 'Until the end of the day, hesitation is penalised with -1 heart. Players should act immediately.',
        accentClass: 'event-chaos'
    },
    {
        id: 'critical_failure_day',
        title: 'CRITICAL FAILURE DAY!',
        description: 'The odds are stacked against you. Today, even the smallest mistake leads to catastrophe.',
        effectText: 'Any roll of 1 automatically triggers a Disaster Tile effect until the end of the day.',
        accentClass: 'event-danger'
    },
    {
        id: 'sandstorm_blind_move',
        title: 'SANDSTORM!',
        description: 'Blinding dust clouds engulf the wasteland. Visibility is zero!',
        effectText: 'Close your eyes, spin 3 times, and point at a random tile. Teleport there immediately.',
        accentClass: 'event-chaos'
    },
    {
        id: 'the_hunted',
        title: 'THE HUNTED!',
        description: 'Something massive is circling in the shadows. You can feel its breath on your neck.',
        effectText: 'If you do not possess a WEAPON by the end of the day, you lose 1 Heart.',
        accentClass: 'event-danger'
    },
    {
        id: 'toxic_gas_leak',
        title: 'TOXIC GAS LEAK!',
        description: 'A foul, radioactive cloud is passing through. Stay vocal to keep your lungs clear.',
        effectText: 'You must make a "fart noise" before every move until the end of the day. Failure to do so results in -1 Heart penalty.',
        accentClass: 'event-chaos'
    },
    {
        id: 'raiders_attack',
        title: 'RAIDERS ATTACK!',
        description: 'Savage scavengers are raiding everyone in sight. Protect your stash!',
        effectText: 'Any player holding more than 3 Supplies must immediately discard 1 random Supply item.',
        accentClass: 'event-danger'
    },
    {
        id: 'adrenaline_surge',
        title: 'ADRENALINE SURGE!',
        description: 'Panic sets in. There is no time to think, only to act. Move or die!',
        effectText: 'Players must take their turn within 5 seconds. If they fail, their turn is skipped.',
        accentClass: 'event-chaos'
    },
    {
        id: 'silent_wasteland',
        title: 'SILENT WASTELAND!',
        description: 'The desert echoes every sound. Even a whisper could give away your position.',
        effectText: 'Total silence required. Any player who speaks or laughs out loud loses 1 Heart.',
        accentClass: 'event-danger'
    },
    {
        id: 'mirage_madness',
        title: 'MIRAGE MADNESS!',
        description: 'The heat is melting your mind. Is that an oasis or just burning sand?',
        effectText: 'When moving, you must point to a tile other than the one you actually intend to move to.',
        accentClass: 'event-chaos'
    },
    {
        id: 'supply_drop',
        title: 'SUPPLY DROP!',
        description: 'A crate falls from a passing freighter. A rare stroke of luck in this hellhole.',
        effectText: 'Choose one: Take 1 random Supply item OR gain +2 movement immediately.',
        accentClass: 'event-bonus'
    },
    {
        id: 'time_distortion',
        title: 'TIME DISTORTION!',
        description: 'The fabric of reality is thinning. For a moment, time feels like it is bending.',
        effectText: 'Time glitch! All players immediately take two turns in a row.',
        accentClass: 'event-bonus'
    },
    {
        id: 'scorched_earth',
        title: 'THE FLOOR IS LAVA!',
        description: 'The ground is burning hot. Looking back is not an option.',
        effectText: 'Landing on a previously visited tile is forbidden until the end of the day. Penalty for doing so is -1 Heart.',
        accentClass: 'event-danger'
    },
    {
        id: 'overloaded_penalty',
        title: 'OVERLOADED!',
        description: 'Your backpack is heavy and your feet are tired. You cannot carry it all.',
        effectText: 'If your Shelter is at maximum capacity, you must immediately discard 1 item of your choice.',
        accentClass: 'event-danger'
    }
];

const getRandomDuration = () => {
    return Math.floor(Math.random() * (180 - 120 + 1)) + 120;
};

const getRandomInt = (min: number, max: number) => {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
};

const getRandomUniqueEventTimes = (duration: number) => {
    const eventCount = Math.random() < 0.5 ? 1 : 2;

    const chosenTimes: number[] = [];
    const lowerBound = Math.max(15, Math.floor(duration * 0.25));
    const upperBound = Math.max(lowerBound + 10, duration - 15);

    while (chosenTimes.length < eventCount) {
        const randomTime = getRandomInt(lowerBound, upperBound);
        const tooCloseToExisting = chosenTimes.some((time) => Math.abs(time - randomTime) < 15);

        if (!chosenTimes.includes(randomTime) && !tooCloseToExisting) {
            chosenTimes.push(randomTime);
        }
    }

    return chosenTimes.sort((a, b) => b - a);
};

const getRandomDayEvent = (excludeIds: string[] = []) => {
    const available = DAY_PHASE_EVENTS.filter((event) => !excludeIds.includes(event.id));
    if (available.length === 0) return DAY_PHASE_EVENTS[0];
    return available[Math.floor(Math.random() * available.length)];
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

    const [showNeededSupplyModal, setShowNeededSupplyModal] = useState<boolean>(false);

    const [isActive, setIsActive] = useState<boolean>(false);
    const [numPlayers, setNumPlayers] = useState<number>(2);

    const [showSetupModal, setShowSetupModal] = useState<boolean>(() => {
        if (round === 0) return true;
        if (timeLeft === roundDuration) return true;
        return false;
    });

    const [showRulesModal, setShowRulesModal] = useState<boolean>(true);

    const [showEventModal, setShowEventModal] = useState<boolean>(false);
    const [activeEvent, setActiveEvent] = useState<DayEvent | null>(null);
    const [scheduledEventTimes, setScheduledEventTimes] = useState<number[]>([]);
    const [triggeredEventTimes, setTriggeredEventTimes] = useState<number[]>([]);
    const [usedEventIdsThisRound, setUsedEventIdsThisRound] = useState<string[]>([]);

    const tickSound = useRef<HTMLAudioElement>(null);
    const roundEndSound = useRef<HTMLAudioElement>(null);
    const gameEndSound = useRef<HTMLAudioElement>(null);
    const startSound = useRef<HTMLAudioElement>(null);
    const roosterSound = useRef<HTMLAudioElement>(null);
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

        if (isActive && timeLeft > 0 && !showEventModal && !showNeededSupplyModal) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);

            if (round < 10) {
                if (roundEndSound.current) roundEndSound.current.play();
                setRound((prev) => prev + 1);
            } else {
                if (gameEndSound.current) gameEndSound.current.play();
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, round, showEventModal, showNeededSupplyModal]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0 || showEventModal || showNeededSupplyModal) return;

        const shouldTrigger = scheduledEventTimes.includes(timeLeft) && !triggeredEventTimes.includes(timeLeft);

        if (shouldTrigger) {
            const selectedEvent = getRandomDayEvent(usedEventIdsThisRound);

            setTriggeredEventTimes((prev) => [...prev, timeLeft]);
            setUsedEventIdsThisRound((prev) => [...prev, selectedEvent.id]);
            setActiveEvent(selectedEvent);
            setShowEventModal(true);
            setIsActive(false);
        }
    }, [
        timeLeft,
        isActive,
        scheduledEventTimes,
        triggeredEventTimes,
        usedEventIdsThisRound,
        showEventModal,
        showNeededSupplyModal
    ]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0 || showNeededSupplyModal) return;

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
    }, [isActive, timeLeft, showNeededSupplyModal]);

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

            setScheduledEventTimes(getRandomUniqueEventTimes(newDuration));
            setTriggeredEventTimes([]);
            setUsedEventIdsThisRound([]);
            setActiveEvent(null);
            setShowEventModal(false);
            setShowNeededSupplyModal(false);
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
        setScheduledEventTimes([]);
        setTriggeredEventTimes([]);
        setUsedEventIdsThisRound([]);
        setActiveEvent(null);
        setShowEventModal(false);
        setShowNeededSupplyModal(false);

        localStorage.clear();

        setShowSetupModal(true);

        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleProceedToGame = () => {
        if (savedSound.current) savedSound.current.play();

        if (scheduledEventTimes.length === 0) {
            setScheduledEventTimes(getRandomUniqueEventTimes(timeLeft));
        }

        setShowSetupModal(false);

        const randomSupply = SUPPLY_TYPES[Math.floor(Math.random() * SUPPLY_TYPES.length)];
        setNeededSupply(randomSupply);
        setShowNeededSupplyModal(true);

        if (round === 0) {
            setRound(1);
        }
    };

    const handleCloseNeededSupplyModal = () => {
        setShowNeededSupplyModal(false);
        setIsActive(true);

        if (roosterSound.current) roosterSound.current.play();
    };

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setActiveEvent(null);

        if (timeLeft > 0) {
            setIsActive(true);
        }
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
            <audio ref={roosterSound} src="/sounds/rooster.mp3" preload="auto"></audio>
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
                    {!isActive && !showEventModal && !showNeededSupplyModal && (
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

                        <div className="needed-supply-label">NEEDED SUPPLY WAS:</div>

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

            {showNeededSupplyModal && neededSupply && (
    <div className="needed-supply-overlay">
        <div id="neededSupplyModal">
            <h1>DAY {round === 0 ? 1 : round} REQUIRED SUPPLY</h1>

            <div className="needed-supply-area">
                <div className="needed-supply-label">
                    COLLECT THIS DURING THE ROUND:
                </div>

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

            <button
                id="continueNeededSupplyBtn"
                className="button"
                onClick={handleCloseNeededSupplyModal}
            >
                CONTINUE
            </button>
        </div>
    </div>
)}
            {showEventModal && activeEvent && (
                <DayEventModal
                    event={activeEvent}
                    onClose={handleCloseEventModal}
                />
            )}
        </div>
    );
}