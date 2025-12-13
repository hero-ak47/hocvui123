import { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import "./HandMath.css";

export default function HandMathGame({ onBack, addCoins }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Game state
    const [gameState, setGameState] = useState('setup'); // setup, playing, finished
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [showInstructions, setShowInstructions] = useState(true);
    const [cameraReady, setCameraReady] = useState(false);

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

    // Toán học state - CHỈ TỪ 0-10
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const [operator, setOperator] = useState("+");
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);

    // Tạo câu hỏi mới - CHỈ TỪ 0-10
    const generateQuestion = () => {
        const operators = ["+", "-"];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let x, y, answer;

        if (op === "+") {
            do {
                x = Math.floor(Math.random() * 11);
                y = Math.floor(Math.random() * 11);
                answer = x + y;
            } while (answer > 10);
        } else {
            do {
                x = Math.floor(Math.random() * 11);
                y = Math.floor(Math.random() * 11);
            } while (x < y);
            answer = x - y;
        }

        setA(x);
        setB(y);
        setOperator(op);
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
    };

    // Phát hiện số ngón tay
    const detectFingers = (landmarks) => {
        if (!landmarks || landmarks.length < 21) {
            return 0;
        }

        const fingerTips = [4, 8, 12, 16, 20];
        const fingerPips = [3, 6, 10, 14, 18];

        let fingerCount = 0;

        for (let i = 1; i <= 4; i++) {
            const tipIndex = fingerTips[i];
            const pipIndex = fingerPips[i];

            if (landmarks[tipIndex].y < landmarks[pipIndex].y - 0.05) {
                fingerCount++;
            }
        }

        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const indexMCP = landmarks[5];

        const vectorX = thumbTip.x - indexMCP.x;
        const vectorY = thumbTip.y - indexMCP.y;

        if (Math.abs(vectorX) > 0.1 || thumbTip.y < thumbIP.y - 0.05) {
            fingerCount++;
        }

        return Math.min(fingerCount, 5);
    };

    const determineRealHand = (landmarks) => {
        if (!landmarks || landmarks.length < 21) return "unknown";

        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];

        if (thumbTip.x < pinkyTip.x) {
            return "right";
        } else {
            return "left";
        }
    };

    // Bắt đầu trò chơi
    const startGame = () => {
        setGameState('playing');
        setGameStarted(true);
        setScore(0);
        setQuestionCount(0);
        generateQuestion();
        setShowInstructions(false);
    };

    // Kết thúc game
    const finishGame = () => {
        setGameState('finished');
        setGameStarted(false);

        // Thưởng dựa trên số câu đúng
        if (addCoins) {
            addCoins(score); // Mỗi câu đúng = 1 xu
        }
    };

    // Xử lý timer suy nghĩ
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && !isAnswerLocked) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (stableAnswer !== null) {
                            checkAnswer(stableAnswer);
                        } else {
                            setFeedback("⏰ Hết thời gian! Không có đáp án");
                            setIsCorrect(false);
                            setShowResult(true);
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

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [gameState, timeLeft, isAnswerLocked, stableAnswer]);

    // Xử lý timer giữ ổn định
    useEffect(() => {
        let stabilityInterval;

        if (gameState === 'playing' && !isAnswerLocked && lastStableTotal !== null) {
            stabilityInterval = setInterval(() => {
                setStabilityTimer(prev => {
                    if (prev >= 4) {
                        setStableAnswer(lastStableTotal);
                        setIsAnswerLocked(true);
                        checkAnswer(lastStableTotal);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            setStabilityTimer(0);
        }

        return () => {
            if (stabilityInterval) clearInterval(stabilityInterval);
        };
    }, [gameState, isAnswerLocked, lastStableTotal]);

    // Kiểm tra đáp án
    const checkAnswer = (answer) => {
        if (answer === correctAnswer) {
            setScore(prev => prev + 1); // Mỗi câu đúng = 1 điểm
            setFeedback(`✅ Chính xác! ${a} ${operator} ${b} = ${answer} (+1 điểm)`);
            setIsCorrect(true);
        } else {
            setFeedback(`❌ Sai rồi! ${a} ${operator} ${b} = ${correctAnswer}`);
            setIsCorrect(false);
        }

        setShowResult(true);

        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    // Chuyển câu hỏi tiếp theo
    const nextQuestion = () => {
        if (questionCount + 1 >= totalQuestions) {
            finishGame();
        } else {
            setQuestionCount(prev => prev + 1);
            generateQuestion();
        }
    };

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

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults((results) => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (results.image) {
                        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
                    }

                    let total = 0;
                    let handsCount = 0;
                    let leftFingers = 0;
                    let rightFingers = 0;

                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        handsCount = results.multiHandLandmarks.length;

                        const leftHandColor = "#FF6B6B";
                        const rightHandColor = "#4ECDC4";

                        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                            const landmarks = results.multiHandLandmarks[i];
                            const fingers = detectFingers(landmarks);
                            const handType = determineRealHand(landmarks);

                            if (handType === "left") {
                                leftFingers = fingers;
                            } else if (handType === "right") {
                                rightFingers = fingers;
                            }

                            const color = handType === "left" ? leftHandColor : rightHandColor;

                            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                                color: color,
                                lineWidth: 3
                            });

                            drawLandmarks(ctx, landmarks, {
                                color: color,
                                lineWidth: 1,
                                radius: 4
                            });

                            ctx.fillStyle = color;
                            ctx.font = "bold 16px Arial";
                            const wristX = landmarks[0].x * canvas.width;
                            const wristY = landmarks[0].y * canvas.height;
                            const handLabel = handType === "left" ? "Tay TRÁI" : "Tay PHẢI";
                            ctx.fillText(`${handLabel}: ${fingers}`, wristX - 40, wristY - 15);
                        }

                        total = leftFingers + rightFingers;
                    }

                    setDetectedHands(handsCount);
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
                    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
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
                console.error("Lỗi khởi tạo camera:", error);
                setFeedback("❌ Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
            }
        };

        if (gameState === 'playing') {
            initializeCamera();
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (hands) {
                hands.close();
            }
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [gameState]);

    return (
        <div className="app-container">
            <div className="game-header">
                <button onClick={onBack} className="back-to-menu-btn">
                    ↩️ Quay về Menu
                </button>
                <h1 className="title">✋ Toán Học Từ 0 Đến 10</h1>
            </div>

            {gameState === 'setup' && (
                <div className="setup-screen">
                    <div className="setup-card">
                        <h2>⚙️ Thiết Lập Trò Chơi</h2>

                        <div className="setup-options">
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

                            <div className="rules-info">
                                <h3>📝 Luật chơi:</h3>
                                <ul>
                                    <li>✅ Mỗi câu đúng: <strong>+1 điểm/xu</strong></li>
                                    <li>⏱️ Thời gian mỗi câu: <strong>15 giây</strong></li>
                                    <li>⏳ Giữ yên đáp án: <strong>5 giây</strong></li>
                                    <li>🎯 Phạm vi: <strong>0 đến 10</strong></li>
                                    <li>🏆 Hoàn thành tất cả câu để nhận thưởng!</li>
                                </ul>
                            </div>

                            <button onClick={startGame} className="start-game-btn">
                                🎮 Bắt đầu chơi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="main-content">
                    <div className="control-panel">
                        <div className="game-info">
                            <div className="info-card">
                                <h3>📊 THỐNG KÊ</h3>
                                <div className="stats">
                                    <div className="stat">
                                        <span className="stat-label">Câu hỏi</span>
                                        <span className="stat-value">{questionCount + 1}/{totalQuestions}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Điểm số</span>
                                        <span className="stat-value">{score}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Thời gian</span>
                                        <span className={`stat-value ${timeLeft <= 5 ? 'time-warning' : ''}`}>
                                            {timeLeft}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="question-card">
                                <h3>❓ CÂU HỎI #{questionCount + 1} (0-10)</h3>
                                <div className="math-question">
                                    <span className="number">{a}</span>
                                    <span className="operator">{operator}</span>
                                    <span className="number">{b}</span>
                                    <span className="equals">=</span>
                                    <span className="answer">{totalFingers}</span>
                                </div>

                                <div className="hands-breakdown">
                                    <div className={`hand-display ${leftHandFingers > 0 ? 'active' : 'inactive'}`}>
                                        <span className="hand-icon">✋</span>
                                        <span className="hand-label">Tay TRÁI:</span>
                                        <span className="hand-count">{leftHandFingers}</span>
                                    </div>
                                    <div className="plus-sign">+</div>
                                    <div className={`hand-display ${rightHandFingers > 0 ? 'active' : 'inactive'}`}>
                                        <span className="hand-icon">✋</span>
                                        <span className="hand-label">Tay PHẢI:</span>
                                        <span className="hand-count">{rightHandFingers}</span>
                                    </div>
                                    <div className="equals-sign">=</div>
                                    <div className="total-display">
                                        <span className="total-label">Tổng:</span>
                                        <span className="total-count">{totalFingers}</span>
                                    </div>
                                </div>

                                <div className="stability-info">
                                    <div className="stability-bar">
                                        <div
                                            className="stability-progress"
                                            style={{ width: `${(stabilityTimer / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="stability-text">
                                        {isAnswerLocked ? (
                                            <span className="locked">🔒 Đã chốt: {stableAnswer}</span>
                                        ) : stabilityTimer > 0 ? (
                                            <span className="counting">
                                                ⏳ Giữ {totalFingers} ngón: {stabilityTimer}/5s
                                            </span>
                                        ) : (
                                            <span className="waiting">👆 Giơ ngón tay và giữ yên</span>
                                        )}
                                    </div>
                                </div>

                                {showResult && feedback && (
                                    <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        {feedback}
                                    </div>
                                )}
                            </div>

                            <div className="controls">
                                <button
                                    className="skip-btn"
                                    onClick={nextQuestion}
                                    disabled={isAnswerLocked}
                                >
                                    {isAnswerLocked ? '⏳ Đang chấm...' : '⏭️ Bỏ qua câu này'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="camera-section">
                        <div className="camera-container">
                            <video
                                ref={videoRef}
                                style={{ display: 'none' }}
                                playsInline
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

                            <div className="finger-overlay">
                                <div className="finger-count">
                                    <span className="finger-label">TỔNG NGÓN TAY:</span>
                                    <span className="finger-number">{totalFingers}</span>
                                </div>
                                <div className="hands-detail">
                                    <div className="hand-detail">
                                        <span className="hand-name">Tay phải:</span>
                                        <span className="hand-fingers">{leftHandFingers}</span>
                                    </div>
                                    <div className="hand-detail">
                                        <span className="hand-name">Tay trái:</span>
                                        <span className="hand-fingers">{rightHandFingers}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="timer-overlay">
                                <div className="timer-circle">
                                    <span className="timer-text">{timeLeft}s</span>
                                    <div
                                        className="timer-progress"
                                        style={{
                                            transform: `rotate(${(1 - timeLeft / 15) * 360}deg)`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="finger-guide">
                            <h4>🎯 HƯỚNG DẪN</h4>
                            <div className="scoring-guide">
                                <div className="score-example">
                                    <div className="example">
                                        <span className="example-icon">💰</span>
                                        <span className="example-text">Mỗi câu đúng: <strong>+1 xu</strong></span>
                                    </div>
                                    <div className="example">
                                        <span className="example-icon">🎯</span>
                                        <span className="example-text">Phạm vi: <strong>0-10</strong></span>
                                    </div>
                                    <div className="example">
                                        <span className="example-icon">🏆</span>
                                        <span className="example-text">Tổng xu: <strong>{score}</strong></span>
                                    </div>
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
                            {score === totalQuestions ? '🏆' :
                                score >= totalQuestions * 0.7 ? '🎉' :
                                    '💪'}
                        </div>

                        <h2 className="result-title">
                            {score === totalQuestions ? 'Xuất sắc!' :
                                score >= totalQuestions * 0.7 ? 'Rất tốt!' :
                                    'Cố gắng hơn nhé!'}
                        </h2>

                        <div className="final-stats">
                            <div className="final-stat">
                                <span className="stat-label">Số câu:</span>
                                <span className="stat-value">{totalQuestions}</span>
                            </div>
                            <div className="final-stat">
                                <span className="stat-label">Điểm số:</span>
                                <span className="stat-value">{score - 1}/{totalQuestions}</span>
                            </div>
                            <div className="final-stat">
                                <span className="stat-label">Xu nhận được:</span>
                                <span className="stat-value">{score - 1} xu</span>
                            </div>
                        </div>

                        <div className="reward-message">
                            🎁 Bạn nhận được <strong>{score} xu</strong>!
                        </div>

                        <div className="result-actions">
                            <button onClick={() => setGameState('setup')} className="play-again-btn">
                                🔄 Chơi lại
                            </button>
                            <button onClick={onBack} className="menu-btn">
                                🏠 Về Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="footer">
                <p>🎮 TOÁN HỌC 0-10 - Dùng ngón tay để tính toán</p>
                <p className="footer-note">
                    Mỗi câu đúng = 1 xu • Tối đa 2 bàn tay • Tự động nhận diện ngón tay
                </p>
            </footer>
        </div>
    );

}