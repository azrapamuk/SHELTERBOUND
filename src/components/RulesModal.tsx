import { useState, useRef, useEffect } from 'react';
import '../styles/rules.css';

interface RulesModalProps {
    onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const sections = [
        {
            title: "Intro",
            content: (
                <>
                    <h2>Welcome, Brave Survivors!</h2>
                    <p>You’ve found yourself in a bizarre apocalyptic landscape where cunning, resourcefulness, and a little luck are the keys to existence.</p>
                    <p>Your mission? Outwit your fellow survivors, complete your secret goal, or simply be the last one standing.</p>
                    <p>Time’s ticking, tiles are flipping, and your only goal is to not end up yelling, “Wait, what do you mean my shelter’s full of sinkholes?!”</p>
                </>
            )
        },
        {
            title: "The Board",
            content: (
                <>
                    <h2>The Board Tiles</h2>
                    <p>Each tile hides something. Here is the color code:</p>
                    <ul style={{ lineHeight: '1.8' }}>
                        <li>🍞 <strong style={{ color: '#e67e22' }}>FOOD</strong> – Essential for survival.</li>
                        <li>🎤 <strong style={{ color: '#9b59b6' }}>ENTERTAINMENT</strong> – Keeps you sane.</li>
                        <li>⚔️ <strong style={{ color: '#0984e3' }}>WEAPON</strong> – Defense gear.</li>
                        <li>🛠️ <strong style={{ color: '#f1c40f' }}>TOOL</strong> – Useful utility.</li>

                        <hr style={{ border: '1px dashed #dfe6e9', margin: '10px 0' }} />

                        <li>💥 <strong style={{ color: '#d63031' }}>DISASTER</strong> – Bad things happen.</li>
                        <li>⭐ <strong style={{ color: '#0fb800ff' }}>BONUS</strong> – Good things happen.</li>

                        <li>
                            🎲 <strong style={{
                                background: 'linear-gradient(90deg, #d63031 50%, #0fb800ff 50%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block'
                            }}>DISASTER / BONUS</strong>
                            <div style={{ fontSize: '0.85em', color: '#636e72', marginLeft: '1.5rem', lineHeight: '1.4' }}>
                                Roll a die to decide fate:<br />
                                <strong>Even</strong> = <span style={{ color: '#d63031' }}>Disaster</span> <br />
                                <strong>Odd</strong> = <span style={{ color: '#0fb800ff' }}>Bonus</span>
                            </div>
                        </li>

                        <hr style={{ border: '1px dashed #dfe6e9', margin: '10px 0' }} />

                        <li>🕳️ <strong style={{ color: '#636e72' }}>EMPTY</strong> – Just dust and echoes.</li>
                    </ul>
                </>
            )
        },
        {
            title: "Players",
            content: (
                <>
                    <h2>Player Stats</h2>
                    <p>Each player starts the apocalypse with:</p>
                    <ul>
                        <li>🏠 <strong>1 Shelter Card</strong> – With 6 supply slots.</li>
                        <li>♟️ <strong>1 Pawn</strong> – Your tiny representative.</li>
                        <li>❤️ <strong>5 Hearts</strong> – Your vitality. Lose them all, and you're out.</li>
                        <li>🤫 <strong>1 Secret Goal Card</strong> – Your hidden path to victory.</li>
                    </ul>

                    <h3>Starting Position</h3>
                    <p>Place your pawn on any <strong>EDGE tile</strong> (outer border of the board).</p>
                    <ul style={{ fontSize: '0.9em', color: '#636e72' }}>
                        <li>Priority: Choose an <strong>Empty</strong> edge tile if available.</li>
                        <li>Fallback: If no empty edge tiles exist, choose <strong>any</strong> edge tile.</li>
                        <li><strong>Safe Start:</strong> Tile effects do NOT trigger on the starting turn (even if you start on a Disaster).</li>
                    </ul>
                </>
            )
        },
        {
            title: "Game Overview",
            content: (
                <>
                    <h2>How to Play</h2>
                    <p>The game is played in a series of <strong>Rounds (Days)</strong>. Each round consists of three phases:</p>
                    <ol>
                        <li><strong>Setup / Decay:</strong> Building the board (Day 1) or removing rotting supplies (Day 2+).</li>
                        <li><strong>Day Phase:</strong> Moving, looting, and dealing with disasters while the timer ticks.</li>
                        <li><strong>Night Phase:</strong> Surviving the random event displayed on the screen.</li>
                    </ol>
                    <p>Survive all 10 days (or be the last one standing) to win.</p>
                </>
            )
        },
        {
            title: "Phase 1: Setup",
            content: (
                <>
                    <h2>Setup & Decay</h2>
                    <h3>First Day (Game Start)</h3>
                    <p>Distribute all tiles among players. Take turns placing one tile at a time to build a connected map.</p>
                    <h3>Daily Decay (Day 2+)</h3>
                    <p>Before starting a new day, resources begin to rot. The app will decide the type of tile that needs to be removed.</p>
                    <p><strong>Removal Rules:</strong></p>
                    <ul>
                        <li>Players take turns removing the specified type of supply tile from the board.</li>
                        <li><strong>Fairness Rule:</strong> Removals must be distributed evenly. No player can remove a 2nd tile until everyone has removed at least one.</li>
                    </ul>
                </>
            )
        },
        {
            title: "Phase 2: Day",
            content: (
                <>
                    <h2>The Day (Scavenge)</h2>
                    <p>While the app timer is running:</p>
                    <ol>
                        <li><strong>Roll:</strong> Roll the die.</li>
                        <li><strong>Move:</strong> Move your pawn that many spaces (no diagonal moves).</li>
                        <li>
                            <strong>Act:</strong> Resolve the tile you landed on:
                            <ul style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                                <li>🍞 <strong>Supply:</strong> Keep it (if you have space).</li>
                                <li>🎁 <strong>Bonus:</strong> Draw a card.</li>
                                <li>⭐ <strong>Disaster:</strong> Draw a card & cry.</li>
                                <li>🎲 <strong>Hybrid:</strong> Roll for outcome.</li>
                            </ul>
                        </li>
                    </ol>
                    <p>⚠️ Cards can be used and discarded <strong>only during the Day phase</strong>.</p>
                    <p>Turns continue clockwise until the timer hits zero.</p>
                </>
            )
        },
        {
            title: "Phase 3: Night",
            content: (
                <>
                    <h2>The Night (Survive)</h2>
                    <p>When the timer hits <strong>00:00</strong>, the Day ends instantly. Look at the screen!</p>
                    <div style={{ background: '#f1f2f6', padding: '10px', borderLeft: '4px solid #6c5ce7', margin: '10px 0', fontSize: '1.2rem' }}>
                        ONE specific supply will be needed. (e.g. <span style={{ color: '#e67e22' }}>FOOD</span>).
                    </div>
                    <ol>
                        <li><strong>Check your Shelter:</strong> Do you possess that specific item?</li>
                        <li><strong>Survive or Suffer:</strong>
                            <ul>
                                <li>✅ <strong>HAVE IT:</strong> You are safe.</li>
                                <li>❌ <strong>DON'T HAVE IT:</strong> Lose <strong>1 Heart</strong> ❤️.</li>
                            </ul>
                        </li>
                    </ol>
                </>
            )
        },
        {
            title: "Winning",
            content: (
                <>
                    <h2>Victory Conditions</h2>
                    <p>There are two distinct paths to conquering the apocalypse:</p>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3>Path A: The Master Plan</h3>
                        <p>Reveal your <strong>Secret Goal Card</strong> at any time if you fulfill its specific requirements.</p>
                        <p><strong>HOWEVER</strong>, you must ALSO possess a "Basic Survival Kit" in your shelter to claim the win:</p>
                        <ul style={{ background: '#f1f2f6', padding: '10px 10px 10px 25px', borderRadius: '8px', border: '2px solid #dfe6e9' }}>
                            <li>2x <strong style={{ color: '#e67e22' }}>FOOD</strong> 🍞</li>
                            <li>1x <strong style={{ color: '#9b59b6' }}>ENTERTAINMENT</strong> 🎭</li>
                            <li>1x <strong style={{ color: '#0984e3' }}>WEAPON</strong> ⚔️ <em>- OR -</em> <strong style={{ color: '#f1c40f' }}>TOOL</strong> 🛠️</li>
                        </ul>
                    </div>
                    <div>
                        <h3>Path B: The Sole Survivor</h3>
                        <p>If all other players lose all their Hearts ❤️ and are eliminated, you win by default.</p>
                        <p style={{ fontSize: '1.5rem', color: '#636e72' }}>Congratulations on being the least dead person.</p>
                    </div>
                </>
            )
        },
        {
            title: "Good Luck",
            content: (
                <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                    <h2>Final Advice</h2>
                    <p style={{ fontSize: '2rem' }}>Trust no one.<br />Hoard everything.<br />Don't die.</p>
                    <p style={{ marginTop: '2rem' }}>If you survive all 10 days, congrats! You’re officially <strong>functionally prepared for the apocalypse</strong>.</p>
                    <button
                        onClick={onClose}
                        className="button"
                        style={{
                            marginTop: '2rem',
                            backgroundColor: '#00b894',
                            borderColor: '#006266',
                            fontSize: '1.1rem',
                            padding: '1rem 2rem',
                            boxShadow: '0 6px 0 #006266'
                        }}
                    >
                        ENTER THE WASTELAND
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeIndex]);

    const nextSlide = () => {
        if (activeIndex < sections.length - 1) {
            setActiveIndex(activeIndex + 1);
        } else {
            onClose();
        }
    };

    const prevSlide = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content guidebook" style={{ position: 'relative', width: '95%', maxWidth: '900px' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ff7675',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    X
                </button>

                <h1 style={{ marginBottom: '1rem', borderBottom: 'none' }}>VERY SUPER HELPFUL <br />GUIDE ON HOW TO SURVIVE</h1>

                <div className="rules-layout">
                    <div className="rules-sidebar">
                        {sections.map((section, index) => (
                            <button
                                key={index}
                                className={`nav-item ${activeIndex === index ? 'active' : ''}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                {section.title}
                            </button>
                        ))}
                    </div>
                    <div className="rules-content-area" ref={contentRef}>
                        {sections[activeIndex].content}
                    </div>
                </div>

                <div className="bottom-navigation">
                    <button
                        className="button"
                        onClick={prevSlide}
                        disabled={activeIndex === 0}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', margin: 0 }}
                    >
                        &laquo; Prev
                    </button>

                    <span id="slideCounter"> {activeIndex + 1} / {sections.length} </span>

                    <button
                        className="button"
                        onClick={nextSlide}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.8rem',
                            margin: 0,
                            visibility: activeIndex === sections.length - 1 ? 'hidden' : 'visible'
                        }}
                    >
                        Next &raquo;
                    </button>
                </div>
            </div>
        </div>
    );
}
