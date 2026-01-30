import React, { useEffect, useState } from 'react';

const BackgroundBubbles = () => {
    const [bubbles, setBubbles] = useState([]);

    useEffect(() => {
        const colors = [
            'rgba(0, 255, 255, 0.5)',   // Cyan
            'rgba(255, 0, 128, 0.5)',   // Pink
            'rgba(255, 165, 0, 0.5)',   // Orange
            'rgba(0, 255, 128, 0.5)',   // Green
            'rgba(138, 43, 226, 0.5)'   // Purple
        ];

        const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 100 + 50, // 50px to 150px
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: Math.random() * 10 + 10, // 10s to 20s
            delay: Math.random() * 5,
            floatX: Math.random() * 200 - 100 // -100px to 100px
        }));

        setBubbles(newBubbles);
    }, []);

    return (
        <div className="bubbles-container">
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    className="bubble"
                    style={{
                        left: `${bubble.left}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        '--bubble-color': bubble.color,
                        '--float-x': `${bubble.floatX}px`,
                        animationDuration: `${bubble.duration}s`,
                        animationDelay: `${bubble.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundBubbles;
