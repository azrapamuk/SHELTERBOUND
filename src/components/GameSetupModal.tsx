import { useState } from 'react';
import '../styles/setup.css';

interface GameSetupModalProps {
    numPlayers: number;
    setNumPlayers: (n: number) => void;
    onProceed: () => void;
    playCalculateSound: () => void;
    round: number;
}

export default function GameSetupModal({ 
    numPlayers, 
    setNumPlayers, 
    onProceed, 
    playCalculateSound,
    round
}: GameSetupModalProps) {
    
    const [recommendation, setRecommendation] = useState<string>('');
    const [showProceed, setShowProceed] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    // === POPRAVLJENA LOGIKA ZA TEKST ===
    const isNewGame = round === 0;

    const titleText = isNewGame 
        ? "Prepare for the Apocalypse!" 
        : "You Survived Another Night!";

    // Ako je nova igra, piše Setup. Ako nije, piše Day {round}. 
    // Ne dodajemo +1 jer je App.tsx već prebacio rundu na sledeći broj.
    const subTitleText = isNewGame 
        ? "Game Setup" 
        : `Day ${round} Setup`;

    const descText = isNewGame 
        ? "Before you dive into the chaos, let's set up your board." 
        : "The sun rises on a bleak world. Time to re-calculate the board tiles for the new day.";
    
    // Tekst na dugmetu
    const buttonText = isNewGame
        ? "Proceed to the Apocalypse!"
        : `Proceed to Day ${round}!`;
    // ===================================

    const [firstDay, setFirstDay] = useState<boolean>(() => {
        return localStorage.getItem('isFirstDay') !== 'false';
    });
    
    const [previousDayNumPlayers, setPreviousDayNumPlayers] = useState<number>(() => {
        return parseInt(localStorage.getItem('previousDayNumPlayers') || '0', 10);
    });

    const getRandomInt = (min: number, max: number) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const handleCalculate = () => {
        playCalculateSound();
        setErrorMsg('');
        setRecommendation('');
        setShowProceed(false);

        if (numPlayers < 2 || numPlayers > 5) {
            setErrorMsg("Please select between 2 and 5 survivors.");
            return;
        }

        let outputHTML = '';
        let totalTiles = 0;

        if (firstDay) {
            if (numPlayers === 2) totalTiles = getRandomInt(25, 31);
            else if (numPlayers === 3) totalTiles = getRandomInt(29, 35);
            else if (numPlayers === 4) totalTiles = getRandomInt(33, 38);
            else if (numPlayers === 5) totalTiles = getRandomInt(35, 41);

            const supplyRatio = 0.40, disasterRatio = 0.18, disasterBonusRatio = 0.15, bonusRatio = 0.10;
            const corePercentage = 0.75;
            const numCoreTiles = Math.floor(totalTiles * corePercentage);
            const numFlexTiles = totalTiles - numCoreTiles;

            let coreSupplies = Math.round(numCoreTiles * supplyRatio);
            let coreDisasters = Math.round(numCoreTiles * disasterRatio);
            let coreBonus = Math.round(numCoreTiles * bonusRatio);
            let coreDisBonus = Math.round(numCoreTiles * disasterBonusRatio);
            let coreEmpty = numCoreTiles - (coreSupplies + coreDisasters + coreDisBonus + coreBonus);

            let numSupplies = coreSupplies, numDisasters = coreDisasters, numBonus = coreBonus, numDisBonus = coreDisBonus, numEmpty = coreEmpty;

            for (let i = 0; i < numFlexTiles; i++) { 
                const rand = Math.random(); 
                if (rand < supplyRatio) numSupplies++; 
                else if (rand < supplyRatio + disasterRatio) numDisasters++; 
                else if (rand < supplyRatio + disasterRatio + bonusRatio) numBonus++; 
                else numEmpty++; 
            }

            if (numBonus <= 0 && totalTiles > 0) { 
                numBonus = 1; 
                if (numEmpty > 0) numEmpty--; else numSupplies--; 
            }

            localStorage.setItem('previousDayNumPlayers', numPlayers.toString());
            localStorage.setItem('isFirstDay', 'false');
            setFirstDay(false);
            setPreviousDayNumPlayers(numPlayers);

            outputHTML = `For <strong>${numPlayers} survivors</strong>, a balanced random setup is <strong>${totalTiles} total tiles</strong>: <ul style="list-style-position: inside; text-align: left; margin-top: 10px;"><li><strong>${numSupplies}</strong> Supply Tiles</li><li><strong>${numDisasters}</strong> Disaster Tiles</li><li><strong>${numDisBonus}</strong> Disaster / Bonus Tiles</li><li><strong>${numBonus}</strong> Bonus Tiles</li><li><strong>${numEmpty}</strong> Empty Tiles</li></ul>`;

        } else {
            let needToRemoveTiles = 0;
            const diff = previousDayNumPlayers - numPlayers;

            if (diff === 0) needToRemoveTiles = getRandomInt(1, 2);
            else if (diff === 1) needToRemoveTiles = getRandomInt(1, 2);
            else if (diff === 2) needToRemoveTiles = getRandomInt(0, 1);
            else if (diff === 3) needToRemoveTiles = getRandomInt(0, 1);
            else {
                setErrorMsg("Surivor count cannot be higher than yesterday.");
                return;
            }

            localStorage.setItem('previousDayNumPlayers', numPlayers.toString());
            setPreviousDayNumPlayers(numPlayers);

            outputHTML = `For <strong>${numPlayers} survivors</strong>, <strong>${needToRemoveTiles}</strong> random supply tiles need to be removed from the board.`;
        }

        setRecommendation(outputHTML);
        setShowProceed(true);
    };

    return (
        <div id="setupModal" className="modal-overlay">
            <div className="modal-content">
                
                <h2>{titleText}</h2>
                <h2 id="modalTitle" style={{fontSize: '1.5rem', marginTop: '0.5rem'}}>{subTitleText}</h2>
                <p>{descText}</p>
                
                <div className="game-setup-area">
                    <label style={{marginBottom: '10px', display: 'block'}}>
                        How many survivors are joining the apocalypse?
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        {[2, 3, 4, 5].map((count) => (
                            <button
                                key={count}
                                onClick={() => setNumPlayers(count)}
                                className="button"
                                style={{
                                    backgroundColor: numPlayers === count ? '#6c5ce7' : '#dfe6e9', 
                                    borderColor: numPlayers === count ? '#2d3436' : '#b2bec3',
                                    color: numPlayers === count ? 'white' : '#636e72',
                                    transform: numPlayers === count ? 'scale(1.1)' : 'scale(1)',
                                    minWidth: '50px',
                                    padding: '10px',
                                    boxShadow: numPlayers === count ? '0 4px 0 #2d3436' : '0 4px 0 #b2bec3'
                                }}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                    
                    {!showProceed && (
                        <button 
                            id="calculateTilesBtn" 
                            className="button" 
                            onClick={handleCalculate} 
                            style={{width: '100%'}}
                        >
                            Calculate Board Tiles
                        </button>
                    )}

                    {errorMsg && (
                        <p className="recommendation-text" style={{ color: '#d63031', borderColor: '#d63031', background: '#fab1a0', display: 'block' }}>
                            {errorMsg}
                        </p>
                    )}

                    {recommendation && !errorMsg && (
                        <div 
                            id="boardRecommendation" 
                            className="recommendation-text" 
                            style={{ display: 'block' }}
                            dangerouslySetInnerHTML={{ __html: recommendation }}
                        />
                    )}
                </div>

                {showProceed && !errorMsg && (
                    <button
                        id="proceedToGameBtn"
                        className="button"
                        style={{ marginTop: '20px' }}
                        onClick={onProceed}
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
}