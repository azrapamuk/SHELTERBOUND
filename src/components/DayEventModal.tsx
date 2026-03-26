import { useEffect } from 'react';
import '../styles/event.css';

export interface DayEvent {
    id: string;
    title: string;
    description: string;
    effectText: string;
    accentClass: string;
}

interface DayEventModalProps {
    event: DayEvent;
    onClose: () => void;
}

export default function DayEventModal({ event, onClose }: DayEventModalProps) {
    useEffect(() => {
        const audio = new Audio('/sounds/start_beep.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
    }, []);

    return (
        <div className="modal-overlay">
            <div className={`modal-content event-modal ${event.accentClass}`}>
                <div className="event-badge">MID-DAY EVENT</div>
                <h2 className="event-title">{event.title}</h2>
                <p className="event-description">{event.description}</p>

                <div className="event-effect-box">
                    <div className="event-effect-label">Effect</div>
                    <div className="event-effect-text">{event.effectText}</div>
                </div>

                <button className="button event-continue-btn" onClick={onClose}>
                    CONTINUE
                </button>
            </div>
        </div>
    );
}