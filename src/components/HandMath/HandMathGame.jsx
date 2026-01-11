import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { useGameStats } from '/src/Stores/useGameStats';
import "./HandMath.css";

export default function HandMathGame({ onBack, addCoins }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const {
        incrementGamesPlayed,
        recordAnswer,
        updateStreak,
        addCoins: addCoinsToStats,
        recordHandMathGame
    } = useGameStats();

    // Game state
    const [gameState, setGameState] = useState('setup');
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [cameraReady, setCameraReady] = useState(false);

    // Cài đặt trò chơi mới
    const [gameMode, setGameMode] = useState('both'); // 'addition', 'subtraction', 'both'
    const [numberRange, setNumberRange] = useState('0-5'); // '0-5', '6-10', '0-10'

    // Hand tracking
    const [detectedHands, setDetectedHands] = useState(0);
    const [leftHandFingers, setLeftHandFingers] = useState(0);
    const [rightHandFingers, setRightHandFingers] = useState(0);
    const [totalFingers, setTotalFingers] = useState(0);

    // Answer stability tracking
    const [stableAnswer, setStableAnswer] = useState(null);
    const [stabilityTimer, setStabilityTimer] = useState(0);
    const [isAnswerLocked, setIsAnswerLocked] = useState(false);
    const [lastStableTotal, setLastStableTotal] = useState(null);

    // Toán học state
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const [operator, setOperator] = useState("+");
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // Thêm ref để theo dõi đã chấm điểm chưa
    const hasScoredRef = useRef(false);

    // Lấy phạm vi số dựa trên cài đặt
    const getNumberRangeValues = () => {
        switch (numberRange) {
            case '0-5':
                return { min: 0, max: 5 };
            case '6-10':
                return { min: 6, max: 10 };
            case '0-10':
            default:
                return { min: 0, max: 10 };
        }
    };

    // Tạo câu hỏi mới dựa trên chế độ và phạm vi
    const generateQuestion = () => {
        const { min, max } = getNumberRangeValues();
        let x, y, answer;
        let selectedOperator = operator;

        // Xác định toán tử dựa trên chế độ
        if (gameMode === 'addition') {
            selectedOperator = '+';
        } else if (gameMode === 'subtraction') {
            selectedOperator = '-';
        } else if (gameMode === 'both') {
            const operators = ["+", "-"];
            selectedOperator = operators[Math.floor(Math.random() * operators.length)];
        }

        if (selectedOperator === "+") {
            do {
                x = Math.floor(Math.random() * (max - min + 1)) + min;
                y = Math.floor(Math.random() * (max - min + 1)) + min;
                answer = x + y;
            } while (answer < min || answer > max); // Kết quả phải nằm trong phạm vi
        } else {
            do {
                x = Math.floor(Math.random() * (max - min + 1)) + min;
                y = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (x - y < min || x - y > max || x < y); // Kết quả phải nằm trong phạm vi và không âm
            answer = x - y;
        }

        setA(x);
        setB(y);
        setOperator(selectedOperator);
        setCorrectAnswer(answer);
        setTotalFingers(0);
        setLeftHandFingers(0);
        setRightHandFingers(0);
        setStableAnswer(null);
        setStabilityTimer(0);
        setIsAnswerLocked(false);
        setLastStableTotal(null);
        setFeedback("");
        setIsCorrect(null);
        setShowResult(false);
        setTimeLeft(15);

        // Reset ref khi tạo câu hỏi mới
        hasScoredRef.current = false;
    };

    // Phát hiện số ngón tay - LOGIC CHÍNH XÁC HƠN
    const detectFingers = (landmarks, handType) => {
        if (!landmarks || landmarks.length < 21) return 0;

        // Chỉ số các điểm landmark
        const fingerTips = [4, 8, 12, 16, 20];      // Ngón cái, trỏ, giữa, áp út, út
        const fingerPips = [3, 6, 10, 14, 18];      // Khớp thứ hai
        const fingerMCPs = [2, 5, 9, 13, 17];       // Khớp thứ ba

        let fingerCount = 0;

        // Kiểm tra 4 ngón tay: trỏ, giữa, áp út, út (chỉ số từ 1 đến 4)
        for (let i = 1; i <= 4; i++) {
            const tip = landmarks[fingerTips[i]];
            const pip = landmarks[fingerPips[i]];
            const mcp = landmarks[fingerMCPs[i]];

            // Ngón tay duỗi thẳng khi tip thấp hơn pip và pip thấp hơn mcp (trong hệ tọa độ y tăng xuống dưới)
            const isExtended = tip.y < pip.y && pip.y < mcp.y;

            // Thêm ngưỡng để tránh false positive
            const extensionAmount = pip.y - tip.y;
            if (isExtended && extensionAmount > 0.02) {
                fingerCount++;
            }
        }

        // Kiểm tra ngón cái (chỉ số 0)
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const thumbMCP = landmarks[2];
        const indexMCP = landmarks[5];

        // Tính góc hoặc vị trí ngón cái
        const thumbExtended = thumbTip.y < thumbIP.y;
        const thumbAwayFromHand = Math.abs(thumbTip.x - indexMCP.x) > 0.1;

        if (thumbExtended || thumbAwayFromHand) {
            fingerCount++;
        }

        return Math.min(fingerCount, 5);
    };

    // Xác định tay thực tế
    const determineRealHand = (landmarks) => {
        if (!landmarks || landmarks.length < 21) return "unknown";

        // Dựa vào vị trí tương đối của ngón cái và ngón út
        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];

        // Trong hệ tọa độ ảnh gương
        return thumbTip.x < pinkyTip.x ? "left" : "right";
    };

    // Bắt đầu trò chơi
    const startGame = () => {
        incrementGamesPlayed();
        updateStreak();
        setGameState('playing');
        setScore(0);
        setCurrentQuestion(0);
        generateQuestion();
    };

    // Kết thúc game
    const finishGame = () => {
        setGameState('finished');
        const coinsWon = score;

        if (addCoins && coinsWon > 0) {
            addCoins(coinsWon);
            addCoinsToStats(coinsWon);
        }

        recordHandMathGame(totalQuestions, score, coinsWon);

        // Đảm bảo reset ref khi kết thúc game
        hasScoredRef.current = false;
    };

    // Kiểm tra đáp án
    const checkAnswer = (answer) => {
        // Kiểm tra xem đã chấm điểm cho câu này chưa
        if (hasScoredRef.current) {
            return;
        }

        // Đánh dấu đã chấm điểm
        hasScoredRef.current = true;

        const isAnswerCorrect = answer === correctAnswer;
        recordAnswer(isAnswerCorrect);

        if (isAnswerCorrect) {
            setScore(prev => prev + 1);
            setFeedback(`✅ Chính xác! ${a} ${operator} ${b} = ${answer}`);
            setIsCorrect(true);
        } else {
            setFeedback(`❌ Sai rồi! ${a} ${operator} ${b} = ${correctAnswer}`);
            setIsCorrect(false);
        }

        setShowResult(true);

        // Reset sau 2 giây trước khi chuyển câu tiếp theo
        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    // Chuyển câu hỏi tiếp theo
    const nextQuestion = () => {
        // Đảm bảo reset ref trước khi chuyển câu
        hasScoredRef.current = false;

        if (currentQuestion + 1 >= totalQuestions) {
            finishGame();
        } else {
            setCurrentQuestion(prev => prev + 1);
            generateQuestion();
        }
    };

    // Xử lý timer suy nghĩ
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && !isAnswerLocked) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (stableAnswer !== null && !hasScoredRef.current) {
                            checkAnswer(stableAnswer);
                        } else if (!hasScoredRef.current) {
                            // Nếu chưa có câu trả lời và chưa chấm điểm
                            recordAnswer(false);
                            setFeedback("⏰ Hết thời gian!");
                            setIsCorrect(false);
                            setShowResult(true);
                            hasScoredRef.current = true;
                            setTimeout(() => {
                                nextQuestion();
                            }, 2000);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => timer && clearInterval(timer);
    }, [gameState, timeLeft, isAnswerLocked, stableAnswer]);

    // Xử lý timer giữ ổn định
    useEffect(() => {
        let stabilityInterval;
        if (gameState === 'playing' && !isAnswerLocked && lastStableTotal !== null) {
            stabilityInterval = setInterval(() => {
                setStabilityTimer(prev => {
                    if (prev >= 4) {
                        // Chỉ gọi nếu chưa chấm điểm
                        if (!hasScoredRef.current) {
                            setStableAnswer(lastStableTotal);
                            setIsAnswerLocked(true);
                            checkAnswer(lastStableTotal);
                        }
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            setStabilityTimer(0);
        }
        return () => stabilityInterval && clearInterval(stabilityInterval);
    }, [gameState, isAnswerLocked, lastStableTotal]);

    // Theo dõi sự ổn định
    useEffect(() => {
        if (gameState === 'playing' && totalFingers !== null && !isAnswerLocked) {
            if (lastStableTotal !== totalFingers) {
                setLastStableTotal(totalFingers);
                setStabilityTimer(0);
            }
        }
    }, [gameState, totalFingers, isAnswerLocked]);

    // Khởi tạo MediaPipe Hands
    useEffect(() => {
        let hands;
        let animationFrameId;

        const initializeCamera = async () => {
            try {
                hands = new Hands({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                // Cài đặt để tăng độ chính xác
                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults((results) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Lưu trạng thái transform
                    ctx.save();

                    // Áp dụng chế độ gương cho canvas
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);

                    if (results.image) {
                        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
                    }

                    let total = 0;
                    let leftFingers = 0;
                    let rightFingers = 0;

                    if (results.multiHandLandmarks?.length > 0) {
                        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                            const landmarks = results.multiHandLandmarks[i];
                            const handType = determineRealHand(landmarks);
                            const fingers = detectFingers(landmarks, handType);

                            // Trong chế độ gương, đảo ngược hiển thị
                            const displayHandType = handType === "left" ? "right" : "left";
                            const color = displayHandType === "left" ? "#FF6B6B" : "#4ECDC4";

                            if (displayHandType === "left") {
                                leftFingers = fingers;
                            } else if (displayHandType === "right") {
                                rightFingers = fingers;
                            }

                            // Vẽ skeleton của bàn tay
                            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                                color: color,
                                lineWidth: 4
                            });

                            // Vẽ các điểm landmark
                            drawLandmarks(ctx, landmarks, {
                                color: color,
                                lineWidth: 2,
                                radius: 5
                            });

                            // Hiển thị thông tin tay
                            ctx.restore();
                            ctx.save();
                            ctx.translate(canvas.width, 0);
                            ctx.scale(-1, 1);

                            ctx.fillStyle = color;
                            ctx.font = "bold 16px 'Arial', sans-serif";
                            const wristX = landmarks[0].x * canvas.width;
                            const wristY = landmarks[0].y * canvas.height - 20;

                            // Hiển thị thông tin tay
                            ctx.fillText(
                                `${displayHandType === "left" ? "Trái" : "Phải"}: ${fingers} ngón`,
                                wristX - 30,
                                wristY
                            );
                        }
                        total = leftFingers + rightFingers;
                    }

                    // Khôi phục transform
                    ctx.restore();

                    setDetectedHands(results.multiHandLandmarks?.length || 0);
                    setLeftHandFingers(leftFingers);
                    setRightHandFingers(rightFingers);
                    setTotalFingers(total);

                    if (gameState === 'playing' && !isAnswerLocked) {
                        setLastStableTotal(total);
                    }
                });

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    },
                    audio: false
                });

                videoRef.current.srcObject = stream;
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setCameraReady(true);
                        resolve();
                    };
                });

                const sendFrame = async () => {
                    if (videoRef.current?.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        try {
                            await hands.send({ image: videoRef.current });
                        } catch (error) {
                            console.log("Lỗi gửi frame:", error);
                        }
                    }
                    animationFrameId = requestAnimationFrame(sendFrame);
                };

                sendFrame();

            } catch (error) {
                console.error("Lỗi camera:", error);
                setFeedback("❌ Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
            }
        };

        if (gameState === 'playing') {
            initializeCamera();
        }

        return () => {
            animationFrameId && cancelAnimationFrame(animationFrameId);
            hands?.close();
            videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
        };
    }, [gameState]);

    // Lấy tên hiển thị cho chế độ
    const getGameModeName = (mode) => {
        switch (mode) {
            case 'addition': return 'Chỉ phép CỘNG';
            case 'subtraction': return 'Chỉ phép TRỪ';
            case 'both': return 'Cả CỘNG và TRỪ';
            default: return mode;
        }
    };

    // Lấy tên hiển thị cho phạm vi
    const getRangeName = (range) => {
        switch (range) {
            case '0-5': return 'Kết quả 0-5';
            case '6-10': return 'Kết quả 6-10';
            case '0-10': return 'Kết quả 0-10';
            default: return range;
        }
    };

    return (
        <div className="app-container">
            <div className="game-header">
                <button onClick={onBack} className="back-to-menu-btn">
                    ↩️ Quay về Menu
                </button>
                <h1 className="title">✋ Toán Học Bằng Tay</h1>
            </div>

            {gameState === 'setup' && (
                <div className="setup-screen">
                    <div className="setup-card">
                        <h2>⚙️ Thiết Lập Trò Chơi</h2>
                        <div className="setup-options">
                            <div className="option-group">
                                <h3>Chọn chế độ toán học:</h3>
                                <div className="mode-selector">
                                    {[
                                        { id: 'addition', name: 'Chỉ phép CỘNG', icon: '➕' },
                                        { id: 'subtraction', name: 'Chỉ phép TRỪ', icon: '➖' },
                                        { id: 'both', name: 'Cả CỘNG và TRỪ', icon: '➕➖' }
                                    ].map(mode => (
                                        <button
                                            key={mode.id}
                                            className={`mode-option ${gameMode === mode.id ? 'selected' : ''}`}
                                            onClick={() => setGameMode(mode.id)}
                                        >
                                            <span className="mode-icon">{mode.icon}</span>
                                            <span className="mode-name">{mode.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="option-group">
                                <h3>Chọn phạm vi kết quả:</h3>
                                <div className="range-selector">
                                    {[
                                        { id: '0-5', name: 'Kết quả 0-5', desc: 'Dễ' },
                                        { id: '6-10', name: 'Kết quả 6-10', desc: 'Trung bình' },
                                        { id: '0-10', name: 'Kết quả 0-10', desc: 'Khó' }
                                    ].map(range => (
                                        <button
                                            key={range.id}
                                            className={`range-option ${numberRange === range.id ? 'selected' : ''}`}
                                            onClick={() => setNumberRange(range.id)}
                                        >
                                            <span className="range-name">{range.name}</span>
                                            <span className="range-desc">{range.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="option-group">
                                <h3>Chọn số câu hỏi:</h3>
                                <div className="question-selector">
                                    {[3, 5, 7, 10].map(num => (
                                        <button
                                            key={num}
                                            className={`question-option ${totalQuestions === num ? 'selected' : ''}`}
                                            onClick={() => setTotalQuestions(num)}
                                        >
                                            {num} câu
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="game-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Chế độ:</span>
                                    <span className="summary-value">{getGameModeName(gameMode)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Kết quả:</span>
                                    <span className="summary-value">{getRangeName(numberRange)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Tổng câu:</span>
                                    <span className="summary-value">{totalQuestions} câu</span>
                                </div>
                            </div>

                            <button onClick={startGame} className="start-game-btn">
                                🎮 Bắt đầu chơi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="playing-container">
                    <div className="left-panel">
                        <div className="question-section">
                            <div className="question-header">
                                <h3>CÂU HỎI #{currentQuestion + 1}</h3>
                                <div className="mode-indicator">
                                    <span className="mode-tag">{getGameModeName(gameMode)}</span>
                                    <span className="range-tag">{getRangeName(numberRange)}</span>
                                </div>
                            </div>

                            <div className="math-display">
                                <div className="equation">
                                    <div className="number-box">{a}</div>
                                    <div className="operator-box">{operator}</div>
                                    <div className="number-box">{b}</div>
                                    <div className="equals-box">=</div>
                                    <div className="answer-box">{totalFingers}</div>
                                </div>

                                <div className="hands-display">
                                    <div className="hand-info">
                                        <div className={`hand-card left ${leftHandFingers > 0 ? 'active' : ''}`}>
                                            <div className="hand-icon">✋</div>
                                            <div className="hand-details">
                                                <div className="hand-label">Tay TRÁI</div>
                                                <div className="hand-count">{leftHandFingers} ngón</div>
                                            </div>
                                        </div>
                                        <div className="plus-operator">+</div>
                                        <div className={`hand-card right ${rightHandFingers > 0 ? 'active' : ''}`}>
                                            <div className="hand-icon">✋</div>
                                            <div className="hand-details">
                                                <div className="hand-label">Tay PHẢI</div>
                                                <div className="hand-count">{rightHandFingers} ngón</div>
                                            </div>
                                        </div>
                                        <div className="equals-operator">=</div>
                                        <div className="total-card">
                                            <div className="total-label">TỔNG</div>
                                            <div className="total-count">{totalFingers} ngón</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="stats-section">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-label">Câu hỏi</div>
                                    <div className="stat-value">{currentQuestion + 1}/{totalQuestions}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Điểm số</div>
                                    <div className="stat-value">{score}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Thời gian</div>
                                    <div className={`stat-value ${timeLeft <= 5 ? 'time-warning' : ''}`}>
                                        {timeLeft}s
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="feedback-section">
                            <div className="stability-indicator">
                                <div className="stability-header">
                                    <span>⏳ Ổn định câu trả lời:</span>
                                    <span className="stability-timer">{stabilityTimer}/5s</span>
                                </div>
                                <div className="stability-bar-container">
                                    <div
                                        className="stability-bar-fill"
                                        style={{ width: `${(stabilityTimer / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="stability-status">
                                    {isAnswerLocked ? (
                                        <span className="locked">🔒 Đã chốt: {stableAnswer}</span>
                                    ) : stabilityTimer > 0 ? (
                                        <span className="counting">Giữ {totalFingers} ngón...</span>
                                    ) : (
                                        <span className="waiting">👆 Giơ ngón tay và giữ yên</span>
                                    )}
                                </div>
                            </div>

                            {showResult && feedback && (
                                <div className={`result-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    {feedback}
                                </div>
                            )}

                            <button
                                className="skip-button"
                                onClick={nextQuestion}
                                disabled={isAnswerLocked}
                            >
                                {isAnswerLocked ? '⏳ Đang chấm...' : '⏭️ Bỏ qua câu này'}
                            </button>
                        </div>
                    </div>

                    <div className="camera-panel">
                        <div className="camera-wrapper">
                            <div className="camera-header">
                                <h4>🎥 Camera nhận diện</h4>
                                <div className={`camera-status ${cameraReady ? 'ready' : 'loading'}`}>
                                    {cameraReady ? '✅ Đã sẵn sàng' : '🔄 Đang khởi động...'}
                                </div>
                            </div>

                            <div className="camera-view">
                                <video
                                    ref={videoRef}
                                    style={{ display: 'none' }}
                                    playsInline
                                    className="camera-video"
                                />
                                <canvas
                                    ref={canvasRef}
                                    width="640"
                                    height="480"
                                    className="camera-canvas"
                                />

                                {!cameraReady && (
                                    <div className="camera-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Đang khởi động camera...</p>
                                    </div>
                                )}

                                <div className="camera-overlay">
                                    <div className="overlay-finger-count">
                                        <div className="overlay-label">TỔNG NGÓN TAY</div>
                                        <div className="overlay-number">{totalFingers}</div>
                                    </div>

                                    <div className="timer-display">
                                        <div className="timer-circle">
                                            <div className="timer-text">{timeLeft}</div>
                                            <div className="timer-label">giây</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="camera-info">
                                <div className="hand-breakdown">
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Tay phải:</span>
                                        <span className="breakdown-value">{leftHandFingers} ngón</span>
                                    </div>
                                    <div className="breakdown-item">
                                        <span className="breakdown-label">Tay trái:</span>
                                        <span className="breakdown-value">{rightHandFingers} ngón</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="instructions-box">
                            <h4>📋 Hướng dẫn nhanh</h4>
                            <div className="instructions-list">
                                <div className="instruction-item">
                                    <span className="instruction-icon">👆</span>
                                    <span className="instruction-text">Giơ ngón tay tương ứng với đáp án</span>
                                </div>
                                <div className="instruction-item">
                                    <span className="instruction-icon">⏱️</span>
                                    <span className="instruction-text">Giữ yên 5 giây để chốt đáp án</span>
                                </div>
                                <div className="instruction-item">
                                    <span className="instruction-icon">💰</span>
                                    <span className="instruction-text">Mỗi câu đúng: <strong>+1 xu</strong></span>
                                </div>
                                <div className="instruction-item">
                                    <span className="instruction-icon">💡</span>
                                    <span className="instruction-text">Đặt tay rõ ràng trước camera</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="result-screen">
                    <div className="result-card">
                        <div className="result-icon">
                            {score === totalQuestions ? '🏆' : score >= totalQuestions * 0.7 ? '🎉' : '💪'}
                        </div>
                        <h2 className="result-title">
                            {score === totalQuestions ? 'Xuất sắc!' : score >= totalQuestions * 0.7 ? 'Rất tốt!' : 'Cố gắng hơn nhé!'}
                        </h2>
                        <div className="game-mode-display">
                            <span className="mode-badge">{getGameModeName(gameMode)}</span>
                            <span className="range-badge">{getRangeName(numberRange)}</span>
                        </div>
                        <div className="final-stats">
                            <div className="final-stat">
                                <span className="stat-label">Tổng câu:</span>
                                <span className="stat-value">{totalQuestions}</span>
                            </div>
                            <div className="final-stat">
                                <span className="stat-label">Câu đúng:</span>
                                <span className="stat-value">{score}/{totalQuestions}</span>
                            </div>
                            <div className="final-stat">
                                <span className="stat-label">Xu nhận được:</span>
                                <span className="stat-value">{score} xu</span>
                            </div>
                        </div>
                        <div className="reward-message">🎁 Bạn nhận được <strong>{score} xu</strong>!</div>
                        <div className="result-actions">
                            <button onClick={() => { setGameState('setup'); setScore(0); setCurrentQuestion(0); }} className="play-again-btn">
                                🔄 Chơi lại
                            </button>
                            <button onClick={onBack} className="menu-btn">🏠 Về Menu</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="footer">
                <p>🎮 TOÁN HỌC BẰNG TAY - Dùng ngón tay để tính toán</p>
                <p className="footer-note">Chế độ: {getGameModeName(gameMode)} • Kết quả: {getRangeName(numberRange)} • Tự động nhận diện ngón tay</p>
            </footer>
        </div>
    );
}