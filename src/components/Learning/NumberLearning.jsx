// src/components/Learning/NumberShapeLearning.jsx
import { useState, useEffect, useRef } from 'react';
import { useGameStats } from '/src/Stores/useGameStats';
import './Learning.css';

// Import âm thanh cho số
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

// Import âm thanh cho hình học
import shapeCircleSound from '/assets/sounds/circle.mp3';
import shapeSquareSound from '/assets/sounds/square.mp3';
import shapeTriangleSound from '/assets/sounds/triangle.mp3';
import shapeRectangleSound from '/assets/sounds/rectangle.mp3';
import shapeStarSound from '/assets/sounds/star.mp3';
import shapeHeartSound from '/assets/sounds/heart.mp3';

// Component SVG cho hình học
const ShapeIcon = ({ type, size = 120, color = "#000000" }) => {
    const getShapeSVG = () => {
        const strokeWidth = Math.max(8, size / 15);

        switch (type) {
            case 'circle':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth={strokeWidth} fill="none" />
                    </svg>
                );
            case 'square':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <rect x="10" y="10" width="80" height="80" stroke={color} strokeWidth={strokeWidth} fill="none" />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon points="50,10 90,90 10,90" stroke={color} strokeWidth={strokeWidth} fill="none" />
                    </svg>
                );
            case 'rectangle':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <rect x="15" y="25" width="70" height="50" stroke={color} strokeWidth={strokeWidth} fill="none" />
                    </svg>
                );
            case 'star':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <polygon
                            points="50,10 61,35 88,35 66,52 72,78 50,62 28,78 34,52 12,35 39,35"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                    </svg>
                );
            case 'heart':
                return (
                    <svg width={size} height={size} viewBox="0 0 100 100">
                        <path
                            d="M50,90 C30,70 10,50 10,30 C10,15 25,10 40,15 C50,20 50,30 50,30 C50,30 50,20 60,15 C75,10 90,15 90,30 C90,50 70,70 50,90 Z"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    return getShapeSVG();
};

// Component nhỏ cho button
const SmallShapeIcon = ({ type, size = 40, color = "#000000" }) => {
    return <ShapeIcon type={type} size={size} color={color} />;
};

const NumberShapeLearning = ({ onBack, addCoins }) => {
    const { incrementGamesPlayed } = useGameStats();

    const [learningMode, setLearningMode] = useState('select'); // 'select', 'numbers-04', 'numbers-59', 'shapes'
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [learnedItems, setLearnedItems] = useState([]);
    const audioRef = useRef(null);

    // Dữ liệu cho các chế độ học
    const learningModes = [
        {
            id: 'numbers-04',
            name: 'Học Số 0-4',
            description: 'Học các số nhỏ từ 0 đến 4',
            icon: '0️⃣4️⃣',
            color: '#4299e1'
        },
        {
            id: 'numbers-59',
            name: 'Học Số 5-9',
            description: 'Học các số lớn từ 5 đến 9',
            icon: '5️⃣9️⃣',
            color: '#48bb78'
        },
        {
            id: 'shapes',
            name: 'Học Hình Học',
            description: 'Học các hình dạng cơ bản',
            icon: '🔺🔵',
            color: '#ed8936'
        }
    ];

    // Dữ liệu cho số từ 0-4
    const numbers04 = [
        { number: 0, name: "KHÔNG", image: "🍩", color: "#718096", audio: sound0 },
        { number: 1, name: "MỘT", image: "🌞", color: "#f6ad55", audio: sound1 },
        { number: 2, name: "HAI", image: "🐦🐦", color: "#68d391", audio: sound2 },
        { number: 3, name: "BA", image: "🚗🚗🚗", color: "#4fd1c7", audio: sound3 },
        { number: 4, name: "BỐN", image: "🍀🍀🍀🍀", color: "#63b3ed", audio: sound4 }
    ];

    // Dữ liệu cho số từ 5-9
    const numbers59 = [
        {
            number: 5,
            name: "NĂM",
            image: "⭐⭐⭐⭐⭐",
            color: "#b794f4",
            audio: sound5
        },
        {
            number: 6,
            name: "SÁU",
            image: "🐝🐝🐝\n🐝🐝🐝",
            color: "#f687b3",
            audio: sound6
        },
        {
            number: 7,
            name: "BẢY",
            image: "🌈🌈🌈\n🌈🌈🌈🌈",
            color: "#f6ad55",
            audio: sound7
        },
        {
            number: 8,
            name: "TÁM",
            image: "🐙🐙🐙🐙\n🐙🐙🐙🐙",
            color: "#68d391",
            audio: sound8
        },
        {
            number: 9,
            name: "CHÍN",
            image: "🎈🎈🎈🎈🎈\n🎈🎈🎈🎈",
            color: "#4299e1",
            audio: sound9
        }
    ];

    // Dữ liệu cho hình học với màu sắc tương phản
    const shapes = [
        {
            id: 'circle',
            name: "HÌNH TRÒN",
            color: "#DC2626", // Đỏ đậm
            audio: shapeCircleSound,
            description: "Hình tròn là hình không có góc cạnh",
            example: " 🍪 "
        },
        {
            id: 'square',
            name: "HÌNH VUÔNG",
            color: "#2563EB", // Xanh dương đậm
            audio: shapeSquareSound,
            description: "Hình vuông có 4 cạnh bằng nhau và 4 góc vuông",
            example: "🎁 📦 🪟"
        },
        {
            id: 'triangle',
            name: "HÌNH TAM GIÁC",
            color: "#059669", // Xanh lá đậm
            audio: shapeTriangleSound,
            description: "Hình tam giác có 3 cạnh và 3 góc",
            example: "⛰️ 🎄 "
        },
        {
            id: 'rectangle',
            name: "HÌNH CHỮ NHẬT",
            color: "#7C3AED", // Tím đậm
            audio: shapeRectangleSound,
            description: "Hình chữ nhật có 2 cạnh dài và 2 cạnh ngắn, 4 góc vuông",
            example: "📱 📖 🚪"
        },
        {
            id: 'star',
            name: "HÌNH NGÔI SAO",
            color: "#D97706", // Cam đậm
            audio: shapeStarSound,
            description: "Hình ngôi sao có nhiều cạnh nhọn",
            example: "🌟 ⭐ ✨"
        },
        {
            id: 'heart',
            name: "HÌNH TRÁI TIM",
            color: "#DB2777", // Hồng đậm
            audio: shapeHeartSound,
            description: "Hình trái tim biểu tượng của tình yêu",
            example: "💖 ❤️ 💗",
        }
    ];

    // Lấy dữ liệu hiện tại dựa trên chế độ
    const getCurrentItems = () => {
        switch (learningMode) {
            case 'numbers-04': return numbers04;
            case 'numbers-59': return numbers59;
            case 'shapes': return shapes;
            default: return [];
        }
    };

    const getCurrentItem = () => {
        const items = getCurrentItems();
        return items[currentItemIndex] || items[0];
    };

    const playItemSound = () => {
        if (isPlayingSound) return;

        setIsPlayingSound(true);
        const currentItem = getCurrentItem();

        // Dừng âm thanh cũ nếu đang phát
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Tạo audio element mới
        const audio = new Audio(currentItem.audio);
        audioRef.current = audio;

        // Sự kiện khi phát xong
        audio.onended = () => {
            setIsPlayingSound(false);
        };

        // Sự kiện khi có lỗi
        audio.onerror = () => {
            console.error("Không thể phát âm thanh");
            setIsPlayingSound(false);
            playFallbackSound();
        };

        // Thử phát âm thanh
        audio.play().catch(error => {
            console.error("Lỗi phát âm thanh:", error);
            setIsPlayingSound(false);
            playFallbackSound();
        });

        // Thêm vào danh sách đã học
        const itemKey = `${learningMode}-${currentItem.id || currentItem.number}`;
        if (!learnedItems.includes(itemKey)) {
            setLearnedItems(prev => [...prev, itemKey]);

            // Tính toán phần thưởng
            const totalItems = getCurrentItems().length;
            const learnedInMode = learnedItems.filter(item => item.startsWith(learningMode)).length + 1;

            // Thưởng khi học hết một chế độ
            if (learnedInMode === totalItems) {
                let reward = 0;
                switch (learningMode) {
                    case 'numbers-04': reward = 30; break;
                    case 'numbers-59': reward = 30; break;
                    case 'shapes': reward = 50; break;
                }
                if (reward > 0 && addCoins) {
                    addCoins(reward);
                }
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

        // Tần số khác nhau cho mỗi item
        const baseFrequency = 440;
        oscillator.frequency.value = baseFrequency + (currentItemIndex * 50);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);

        setTimeout(() => setIsPlayingSound(false), 800);
    };

    const nextItem = () => {
        const items = getCurrentItems();
        setCurrentItemIndex(prev => (prev + 1) % items.length);
    };

    const prevItem = () => {
        const items = getCurrentItems();
        setCurrentItemIndex(prev => (prev - 1 + items.length) % items.length);
    };

    const selectItem = (index) => {
        setCurrentItemIndex(index);
    };

    const startLearningMode = (mode) => {
        setLearningMode(mode);
        setCurrentItemIndex(0);
        incrementGamesPlayed();
    };

    const backToSelection = () => {
        setLearningMode('select');
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
        if (learningMode !== 'select') {
            const timer = setTimeout(playItemSound, 300);
            return () => {
                clearTimeout(timer);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            };
        }
    }, [currentItemIndex, learningMode]);

    const currentItem = getCurrentItem();
    const currentItems = getCurrentItems();
    const learnedInCurrentMode = learnedItems.filter(item => item.startsWith(learningMode)).length;

    return (
        <div className="learning-container">
            {learningMode === 'select' ? (
                <div className="learning-select-screen">
                    <div className="learning-header">
                        <button onClick={onBack} className="back-btn">
                            ↩️ Quay về Menu
                        </button>
                        <h1>🎓 HỌC CHỮ SỐ VÀ HÌNH HỌC</h1>
                        <div className="progress-summary">
                            <span>Tổng đã học: {learnedItems.length}/{numbers04.length + numbers59.length + shapes.length}</span>
                        </div>
                    </div>

                    <div className="mode-selection">
                        <h2>Chọn chế độ học tập:</h2>
                        <div className="mode-grid">
                            {learningModes.map(mode => {
                                const itemsInMode = mode.id === 'numbers-04' ? numbers04.length :
                                    mode.id === 'numbers-59' ? numbers59.length :
                                        shapes.length;
                                const learnedInMode = learnedItems.filter(item => item.startsWith(mode.id)).length;

                                return (
                                    <button
                                        key={mode.id}
                                        className="mode-card"
                                        onClick={() => startLearningMode(mode.id)}
                                        style={{ '--card-color': mode.color }}
                                    >
                                        <div className="mode-icon">{mode.icon}</div>
                                        <div className="mode-name">{mode.name}</div>
                                        <div className="mode-description">{mode.description}</div>
                                        <div className="mode-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${(learnedInMode / itemsInMode) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">{learnedInMode}/{itemsInMode}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="achievements-overview">
                            <h3>🏆 Tổng quan thành tích:</h3>
                            <div className="overview-grid">
                                <div className="overview-item">
                                    <div className="overview-label">Số 0-4</div>
                                    <div className="overview-count">
                                        {learnedItems.filter(item => item.startsWith('numbers-04')).length}/{numbers04.length}
                                    </div>
                                </div>
                                <div className="overview-item">
                                    <div className="overview-label">Số 5-9</div>
                                    <div className="overview-count">
                                        {learnedItems.filter(item => item.startsWith('numbers-59')).length}/{numbers59.length}
                                    </div>
                                </div>
                                <div className="overview-item">
                                    <div className="overview-label">Hình học</div>
                                    <div className="overview-count">
                                        {learnedItems.filter(item => item.startsWith('shapes')).length}/{shapes.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="learning-content-screen">
                    <div className="learning-header">
                        <button onClick={backToSelection} className="back-btn">
                            ↩️ Quay về Lựa chọn
                        </button>

                        <div className="mode-info">
                            <h1>
                                {learningMode === 'numbers-04' && '🔢 HỌC SỐ 0-4'}
                                {learningMode === 'numbers-59' && '🔢 HỌC SỐ 5-9'}
                                {learningMode === 'shapes' && '🔺 HỌC HÌNH HỌC'}
                            </h1>
                            <div className="progress-indicator">
                                <span>Đã học: {learnedInCurrentMode}/{currentItems.length}</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(learnedInCurrentMode / currentItems.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="learning-content">
                        <div className="item-display" style={{
                            backgroundColor: `${currentItem.color}15`,
                            borderColor: currentItem.color
                        }}>
                            {learningMode === 'shapes' ? (
                                // Hiển thị hình học với SVG lớn
                                <>
                                    <div className="shape-display">
                                        <ShapeIcon type={currentItem.id} size={180} color={currentItem.color} />
                                    </div>
                                    <div className="item-name" style={{ color: currentItem.color }}>
                                        {currentItem.name}
                                    </div>
                                    <div className="shape-description">
                                        {currentItem.description}
                                    </div>
                                    <div className="shape-examples">
                                        {currentItem.example}
                                    </div>
                                </>
                            ) : (
                                // Hiển thị số
                                <>
                                    <div className="big-number" style={{ color: currentItem.color }}>
                                        {currentItem.number}
                                    </div>
                                    <div className="item-name" style={{ color: currentItem.color }}>
                                        {currentItem.name}
                                    </div>
                                    <div className="number-image">{currentItem.image}</div>
                                </>
                            )}

                            <div className="sound-status">
                                {isPlayingSound ? '🔊 Đang phát âm thanh...' : '👆 Nhấn nút để nghe'}
                            </div>
                        </div>

                        <div className={`item-grid ${learningMode === 'shapes' ? 'shapes-grid' : 'numbers-grid'}`}>
                            {currentItems.map((item, index) => {
                                const itemKey = `${learningMode}-${item.id || item.number}`;
                                const isLearned = learnedItems.includes(itemKey);

                                return (
                                    <button
                                        key={item.id || item.number}
                                        className={`item-btn ${currentItemIndex === index ? 'active' : ''} ${isLearned ? 'learned' : ''}`}
                                        onClick={() => selectItem(index)}
                                        style={{
                                            '--btn-color': item.color,
                                            borderColor: item.color
                                        }}
                                    >
                                        {learningMode === 'shapes' ? (
                                            <>
                                                <div className="shape-btn-icon">
                                                    <SmallShapeIcon type={item.id} size={50} color={item.color} />
                                                </div>
                                                <span className="btn-shape-name">{item.name.split(' ')[1]}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="btn-number" style={{ color: item.color }}>
                                                    {item.number}
                                                </span>
                                                <span className="btn-emoji">{item.image}</span>
                                            </>
                                        )}
                                        {isLearned && (
                                            <span className="learned-badge">✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="learning-controls">
                            <button onClick={prevItem} className="control-btn prev-btn">
                                ◀️ Trước
                            </button>

                            <button
                                onClick={playItemSound}
                                className={`control-btn sound-btn ${isPlayingSound ? 'playing' : ''}`}
                                disabled={isPlayingSound}
                                style={{ backgroundColor: currentItem.color }}
                            >
                                {isPlayingSound ? '⏸️ Đang phát...' : '🔊 Nghe ' + currentItem.name.toLowerCase()}
                            </button>

                            <button onClick={nextItem} className="control-btn next-btn">
                                Sau ▶️
                            </button>
                        </div>
                    </div>

                    <div className="achievements">
                        <h3>🏆 Danh sách đã học trong chế độ này:</h3>
                        <div className="achievement-list">
                            {currentItems.map((item, index) => {
                                const itemKey = `${learningMode}-${item.id || item.number}`;
                                const isLearned = learnedItems.includes(itemKey);

                                return (
                                    <div
                                        key={item.id || item.number}
                                        className={`achievement-item ${isLearned ? 'unlocked' : 'locked'} ${currentItemIndex === index ? 'current' : ''}`}
                                        onClick={() => selectItem(index)}
                                        style={{ borderColor: item.color }}
                                    >
                                        {learningMode === 'shapes' ? (
                                            <>
                                                <div className="achievement-shape-icon">
                                                    <SmallShapeIcon type={item.id} size={35} color={item.color} />
                                                </div>
                                                <span className="achievement-name">{item.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="achievement-number" style={{ color: item.color }}>
                                                    {item.number}
                                                </span>
                                                <span className="achievement-name">{item.name}</span>
                                            </>
                                        )}
                                        <span className="achievement-status">
                                            {isLearned ? '✓ Đã học' : '🔒 Chưa học'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NumberShapeLearning;