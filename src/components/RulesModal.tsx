import { useState } from 'react';

// === OVO JE KLJUČNO ===
// Ovde kažemo TypeScript-u: "Ova komponenta OČEKUJE funkciju onClose"
interface RulesModalProps {
    onClose: () => void;
}

export default function RulesModal({ onClose }: RulesModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        // Slide 0: Intro
        <section className="slide" key="0">
            <h2>Welcome, brave survivors! <br /> You’ve found yourself in a bizarre apocalyptic landscape...</h2>
            <p>Your mission? Outwit your fellow survivors, complete your secret goal, or simply be the last one standing.</p>
            <p>Time’s ticking, tiles are flipping, and your only goal is to not end up yelling, “Wait, what do you mean my shelter’s full of sinkholes?!”</p>
        </section>,

        // Slide 1: The Board
        <section className="slide" key="1">
            <p>You are the ones who will be in charge of setting up the board. Each tile hides something exciting:</p>
            <ul>
                <li>🍞 <strong>Supplies</strong> – Food, entertainment, tools...</li>
                <li>💥 <strong>Disasters</strong> – The universe laughs at your plans.</li>
                <li>🎁 <strong>Bonuses</strong> – Because sometimes the apocalypse gives back.</li>
                <li>🕳️ <strong>Empty Tiles</strong> – Just like your soul after drawing three disasters.</li>
            </ul>
        </section>,

        // Slide 2: The Players
        <section className="slide" key="2">
            <p>Each player starts with:</p>
            <ul>
                <li><strong>1 Shelter Card</strong> – With 6 cozy supply slots.</li>
                <li><strong>1 Pawn</strong> – Your tiny representative.</li>
                <li><strong>3 Hearts</strong> – Representing your dwindling vitality.</li>
                <li><strong>1 Secret Goal Card</strong> – Your ultimate objective.</li>
            </ul>
            <p>You can start only on an empty tile.</p>
        </section>,

        // Slide 3: Game Flow (Setup)
        <section className="slide" key="3">
            <h2>How the game should work</h2>
            <h3>Phase 1: Setup (Once per round)</h3>
            <ol>
                <li>Each player takes a certain amount of terrain cards.</li>
                <li>Players take turns placing one random terrain card to build a connected path.</li>
            </ol>
        </section>,

        // Slide 4: Game Flow (Day)
        <section className="slide" key="4">
            <h3>Phase 2: Day</h3>
            <ol>
                <li>Each player chooses an <i>empty</i> tile to start from.</li>
                <li>Players roll a die and move.</li>
                <li><strong>Resolve Tile:</strong>
                    <ul>
                        <li>🕳️ <strong>Empty</strong> – Do nothing.</li>
                        <li>🍞 <strong>Supply</strong> – Take it or leave it.</li>
                        <li>🎁 <strong>Bonus</strong> – Take a free bonus card.</li>
                        <li>💥 <strong>Disaster</strong> – Draw a disaster card!</li>
                    </ul>
                </li>
            </ol>
        </section>,

        // Slide 5: Game Flow (Night)
        <section className="slide" key="5">
            <h3>Phase 3: Night</h3>
            <ol>
                <li>A random supply type is announced.</li>
                <li>Each player must have <strong>that supply type</strong> AND <strong>at least one Food card</strong> (🍞).</li>
                <li>If not, you lose 1 Heart (❤️).</li>
            </ol>
        </section>,

        // Slide 6: How to Win
        <section className="slide" key="6">
            <h2>HOW TO WIN (Kinda)</h2>
            <ul>
                <li>✅ <strong>Complete Your Goal:</strong> Fulfill your secret Goal Card + have 2 Food, 1 Entertainment, 1 Weapon/Tool.</li>
                <li>⚔️ <strong>Last Man Standing:</strong> Be the only survivor with hearts left.</li>
            </ul>
        </section>,

        // Slide 7: Final Words
        <section className="slide final-words" key="7">
            <p>If you survive, congrats! You’re officially <strong><i>functionally prepared for the apocalypse</i></strong>.</p>
            <h2>Good luck, survivors.</h2>
            <button onClick={onClose} className="button">WE UNDERSTAND AND WE ARE READY TO NOT DIE</button>
        </section>
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            onClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="modal-overlay guidebook-modal"> 
            <div className="modal-content guidebook" style={{ position: 'relative' }}>
                
                {/* X DUGME */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: 'red',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        zIndex: 10
                    }}
                    title="Close Guidebook"
                >
                    X
                </button>

                <h1>THE VERY SUPER HELPFUL GUIDE <span className="subtitle">(probably)</span></h1>
                
                <div id="slides-container">
                    {slides[currentSlide]}
                </div>

                <div className="navigation">
                    <button 
                        id="prevBtn" 
                        className="button" 
                        onClick={prevSlide} 
                        disabled={currentSlide === 0}
                        style={{ opacity: currentSlide === 0 ? 0.5 : 1 }}
                    >
                        &laquo; Previous
                    </button>
                    
                    <span id="slideCounter"> {currentSlide + 1} / {slides.length} </span>
                    
                    <button id="nextBtn" className="button" onClick={nextSlide}>
                        {currentSlide === slides.length - 1 ? "Close &raquo;" : "Next &raquo;"}
                    </button>
                </div>
            </div>
        </div>
    );
}