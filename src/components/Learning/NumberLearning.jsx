// src/components/Learning/NumberLearning.jsx
import { useState, useEffect, useRef } from 'react';
import './Learning.css';
// 1. Import tất cả file âm thanh
import sound0 from '/assets/sounds/0.mp3';
import sound1 from '/assets/sounds/1.mp3';
import sound2 from '/assets/sounds/2.mp3';
import sound3 from '/assets/sounds/3.mp3';
import sound4 from '/assets/sounds/4.mp3';
import sound5 from '/assets/sounds/5.mp3';
import sound6 from '/assets/sounds/6.mp3';
import sound7 from '/assets/sounds/7.mp3';
import sound8 from '/assets/sounds/8.mp3';
import sound9 from '/assets/sounds/9.mp3';


const NumberLearning = ({ onBack, addCoins }) => {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [learnedNumbers, setLearnedNumbers] = useState([]);
    const audioRef = useRef(null);

    const numbers = [
        { number: 0, name: "KHÔNG", image: "🍩", color: "#718096", audio: sound0 },
        { number: 1, name: "MỘT", image: "🌞", color: "#f6ad55", audio: sound1 },
        { number: 2, name: "HAI", image: "🐦🐦", color: "#68d391", audio: sound2 },
        { number: 3, name: "BA", image: "🚗🚗🚗", color: "#4fd1c7", audio: sound3 },
        { number: 4, name: "BỐN", image: "🍀🍀🍀🍀", color: "#63b3ed", audio: sound4 },
        { number: 5, name: "NĂM", image: "⭐⭐⭐⭐⭐", color: "#b794f4", audio: sound5 },
        { number: 6, name: "SÁU", image: "🐝🐝🐝🐝🐝🐝", color: "#f687b3", audio: sound6 },
        { number: 7, name: "BẢY", image: "🌈🌈🌈🌈🌈🌈🌈", color: "#f6ad55", audio: sound7 },
        { number: 8, name: "TÁM", image: "🐙🐙🐙🐙🐙🐙🐙🐙", color: "#68d391", audio: sound8 },
        { number: 9, name: "CHÍN", image: "🎈🎈🎈🎈🎈🎈🎈🎈🎈", color: "#4299e1", audio: sound9 }
    ];

    const playNumberSound = () => {
        if (isPlayingSound) return;

        setIsPlayingSound(true);

        // Dừng âm thanh cũ nếu đang phát
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Tạo audio element mới
        const audio = new Audio(numbers[currentNumber].audio);
        audioRef.current = audio;

        // Sự kiện khi phát xong
        audio.onended = () => {
            setIsPlayingSound(false);
        };

        // Sự kiện khi có lỗi
        audio.onerror = () => {
            console.error("Không thể phát âm thanh cho số", currentNumber);
            setIsPlayingSound(false);

            // Fallback: Sử dụng Web Audio API nếu file âm thanh không tải được
            playFallbackSound();
        };

        // Thử phát âm thanh
        audio.play().catch(error => {
            console.error("Lỗi phát âm thanh:", error);
            setIsPlayingSound(false);
            playFallbackSound();
        });

        // Thêm vào danh sách đã học
        if (!learnedNumbers.includes(currentNumber)) {
            setLearnedNumbers(prev => [...prev, currentNumber]);
            if (learnedNumbers.length === 9) {
                addCoins(50); // Hoàn thành tất cả số
            }
        }
    };

    // Fallback sử dụng Web Audio API
    const playFallbackSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Tần số khác nhau cho mỗi số
        const baseFrequency = 440;
        oscillator.frequency.value = baseFrequency + (currentNumber * 40);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);

        setTimeout(() => setIsPlayingSound(false), 800);
    };

    const nextNumber = () => {
        setCurrentNumber(prev => (prev + 1) % 10);
    };

    const prevNumber = () => {
        setCurrentNumber(prev => (prev - 1 + 10) % 10);
    };

    const selectNumber = (num) => {
        setCurrentNumber(num);
    };

    useEffect(() => {
        // Dừng âm thanh khi component unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    useEffect(() => {
        // Auto-play sound when number changes
        const timer = setTimeout(playNumberSound, 300);
        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [currentNumber]);

    const currentNumData = numbers[currentNumber];

    return (
        <div className="learning-container">
            <div className="learning-header">
                <button onClick={onBack} className="back-btn">
                    ↩️ Quay về Menu
                </button>
                <h1>🎓 Học Số Từ 0 Đến 9</h1>
                <div className="progress-indicator">
                    <span>Đã học: {learnedNumbers.length}/10 số</span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(learnedNumbers.length / 10) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="learning-content">
                <div className="number-display" style={{ backgroundColor: `${currentNumData.color}20` }}>
                    <div className="big-number">{currentNumber}</div>
                    <div className="number-name">{currentNumData.name}</div>
                    <div className="number-image">{currentNumData.image}</div>

                    {/* Hiển thị trạng thái âm thanh */}
                    <div className="sound-status">
                        {isPlayingSound ? '🔊 Đang phát âm thanh...' : '👆 Nhấn nút bên dưới để nghe'}
                    </div>
                </div>

                <div className="number-grid">
                    {numbers.map((num) => (
                        <button
                            key={num.number}
                            className={`number-btn ${currentNumber === num.number ? 'active' : ''} ${learnedNumbers.includes(num.number) ? 'learned' : ''}`}
                            onClick={() => selectNumber(num.number)}
                            style={{ '--btn-color': num.color }}
                        >
                            <span className="btn-number">{num.number}</span>
                            <span className="btn-emoji">{num.image}</span>
                            {learnedNumbers.includes(num.number) && (
                                <span className="learned-badge">✓</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="learning-controls">
                    <button onClick={prevNumber} className="control-btn prev-btn">
                        ◀️ Số trước
                    </button>

                    <button
                        onClick={playNumberSound}
                        className={`control-btn sound-btn ${isPlayingSound ? 'playing' : ''}`}
                        disabled={isPlayingSound}
                    >
                        {isPlayingSound ? '⏸️ Đang phát...' : '🔊 Nghe số ' + currentNumber}
                    </button>

                    <button onClick={nextNumber} className="control-btn next-btn">
                        Số tiếp theo ▶️
                    </button>
                </div>


            </div>

            <div className="achievements">
                <h3>🏆 Thành tích:</h3>
                <div className="achievement-list">
                    {numbers.map((num) => (
                        <div
                            key={num.number}
                            className={`achievement-item ${learnedNumbers.includes(num.number) ? 'unlocked' : 'locked'}`}
                            onClick={() => selectNumber(num.number)}
                        >
                            <span className="achievement-number">{num.number}</span>
                            <span className="achievement-status">
                                {learnedNumbers.includes(num.number) ? '✓ Đã học' : '🔒 Chưa học'}
                            </span>
                            <span className="achievement-emoji">{num.image}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NumberLearning;