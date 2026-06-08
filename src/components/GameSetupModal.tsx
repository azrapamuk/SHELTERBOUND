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

    const isNewGame = round === 0;

    const titleText = isNewGame
        ? 'Prepare for the Apocalypse!'
        : 'You Survived Another Night!';

    const subTitleText = isNewGame
        ? 'Game Setup'
        : `Day ${round} Setup`;

    const descText = isNewGame
        ? "Before you dive into the chaos, let's set up your board."
        : 'The sun rises on a bleak world. Time to re-calculate the board tiles for the new day.';

    const buttonText = isNewGame
        ? 'Proceed to the Apocalypse!'
        : `Proceed to Day ${round}!`;

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

        if (numPlayers < 2 || numPlayers > 4) {
            setErrorMsg('Please select between 2 and 4 survivors.');
            setShowProceed(false);
            return;
        }

        if (!isNewGame && numPlayers > previousDayNumPlayers) {
            setErrorMsg('Survivor count cannot be higher than yesterday.');
            setShowProceed(false);
            return;
        }

        setShowProceed(true);

        let outputHTML = '';

        if (isNewGame) {
            // --- LOGIKA ZA PRVI DAN (Ostaje ista) ---
            let totalTiles = 0;
            let minRange = 0;
            let maxRange = 0;

            if (numPlayers === 2) { minRange = 40; maxRange = 48; }
            else if (numPlayers === 3) { minRange = 54; maxRange = 66; }
            else if (numPlayers === 4) { minRange = 72; maxRange = 84; }

            const possibleTotals: number[] = [];
            for (let i = minRange; i <= maxRange; i++) {
                if (i % numPlayers === 0) possibleTotals.push(i);
            }

            totalTiles = possibleTotals.length === 0 
                ? minRange - (minRange % numPlayers) + numPlayers 
                : possibleTotals[getRandomInt(0, possibleTotals.length - 1)];

            const supplyRatio = 0.45;
            const disasterRatio = 0.16;
            const disBonusRatio = 0.14;
            const bonusRatio = 0.10;

            let numSupplies = Math.round(totalTiles * supplyRatio);
            let numFood = Math.round(numSupplies * 0.4) + 3;
            let numEnt = Math.round(numSupplies * 0.2) + 3;
            let numWeapons = Math.round(numSupplies * 0.2) + 3;
            let numTools = Math.max(0, numSupplies - ((numFood - 3) + (numEnt - 3) + (numWeapons - 3))) + 3;

            numSupplies = numFood + numEnt + numWeapons + numTools;
            let numDisasters = Math.round(totalTiles * disasterRatio);
            let numDisBonus = Math.round(totalTiles * disBonusRatio);
            let numBonus = Math.round(totalTiles * bonusRatio);
            let numEmpty = totalTiles - (numSupplies + numDisasters + numDisBonus + numBonus);

            while (numEmpty < 4) {
                totalTiles += numPlayers;
                numEmpty = totalTiles - (numSupplies + numDisasters + numDisBonus + numBonus);
            }

            const tilesPerPlayer = totalTiles / numPlayers;
            localStorage.setItem('previousDayNumPlayers', numPlayers.toString());
            localStorage.setItem('isFirstDay', 'false');
            setPreviousDayNumPlayers(numPlayers);

            outputHTML = `
                <div style="margin-bottom: 15px;">
                    For <strong>${numPlayers} survivors</strong>, use <strong>${totalTiles} total tiles</strong> (${tilesPerPlayer} per player).
                </div>
                <ul style="list-style: none; padding: 0; line-height: 1.8; text-align: left;">
                    <li style="margin-bottom: 5px; border-bottom: 1px solid #dfe6e9; padding-bottom: 5px;">
                        <strong>SUPPLIES (${numSupplies}):</strong>
                        <ul style="list-style: none; padding-left: 15px;">
                            <li>🍞 <strong style="color: #e67e22">${numFood} FOOD</strong></li>
                            <li>🎤 <strong style="color: #9b59b6">${numEnt} ENTERTAINMENT</strong></li>
                            <li>⚔️ <strong style="color: #0984e3">${numWeapons} WEAPON</strong></li>
                            <li>🛠️ <strong style="color: #f1c40f">${numTools} TOOL</strong></li>
                        </ul>
                    </li>
                    <li>💥 <strong style="color: #d63031">${numDisasters} DISASTER</strong></li>
                    <li>⭐ <strong style="color: #0fb800ff">${numBonus} BONUS</strong></li>
                    <li>🎲 <strong style="background: linear-gradient(90deg, #d63031 50%, #0fb800ff 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">${numDisBonus} DISASTER / BONUS</strong></li>
                    <li>🕳️ <strong style="color: #636e72">${numEmpty} EMPTY</strong></li>
                </ul>
            `;
        } 
        else {
            // --- NOVA LOGIKA ZA NOĆ (Remove 2 supplies) ---
            const supplyTypes = [
                { name: 'FOOD', icon: '🍞', color: '#e67e22' },
                { name: 'ENTERTAINMENT', icon: '🎤', color: '#9b59b6' },
                { name: 'WEAPON', icon: '⚔️', color: '#0984e3' },
                { name: 'TOOL', icon: '🛠️', color: '#f1c40f' }
            ];

            // Hardkodirane sve moguće kombinacije 2 različita resursa (ukupno 6)
            const combinations = [
                [0, 1], [0, 2], [0, 3], // Food+Ent, Food+Wep, Food+Tool
                [1, 2], [1, 3],         // Ent+Wep, Ent+Tool
                [2, 3]                  // Wep+Tool
            ];

            const lastComboIndex = parseInt(localStorage.getItem('lastNightComboIndex') || '-1', 10);
            
            let newComboIndex;
            // Osiguraj da nova kombinacija nije ista kao prošla
            do {
                newComboIndex = getRandomInt(0, combinations.length - 1);
            } while (newComboIndex === lastComboIndex);

            // Spremi odabranu kombinaciju za iduću noć
            localStorage.setItem('lastNightComboIndex', newComboIndex.toString());
            localStorage.setItem('previousDayNumPlayers', numPlayers.toString());
            setPreviousDayNumPlayers(numPlayers);

            const combo = combinations[newComboIndex];
            const item1 = supplyTypes[combo[0]];
            const item2 = supplyTypes[combo[1]];

            outputHTML = `
                The night has taken its toll on your supplies.<br/><br/>
                You must remove <strong>2 DIFFERENT</strong> supply tiles:<br/><br/>
                <div style="font-size: 1.2em; margin-bottom: 10px;">
                    ${item1.icon} <strong style="color: ${item1.color}">${item1.name}</strong>
                </div>
                <div style="font-size: 1.2em;">
                    ${item2.icon} <strong style="color: ${item2.color}">${item2.name}</strong>
                </div>
                <br/>
                from the board before starting Day ${round}.
            `;
        }

        setRecommendation(outputHTML);
    };

    return (
        <div id="setupModal" className="modal-overlay">
            <div className="modal-content">
                <h2>{titleText}</h2>
                <h2 id="modalTitle" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>{subTitleText}</h2>
                <p>{descText}</p>

                <div className="game-setup-area">
                    {!showProceed && (
                        <>
                            <label style={{ marginBottom: '10px', display: 'block' }}>
                                How many survivors are joining the apocalypse?
                            </label>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                                {[2, 3, 4].map((count) => (
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
                            <button id="calculateTilesBtn" className="button" onClick={handleCalculate} style={{ width: '100%' }}>
                                Calculate Board Tiles
                            </button>
                        </>
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
                    <button id="proceedToGameBtn" className="button" style={{ marginTop: '20px' }} onClick={onProceed}>
                        {buttonText}
                    </button>
                )}
            </div>
        </div>
    );
}