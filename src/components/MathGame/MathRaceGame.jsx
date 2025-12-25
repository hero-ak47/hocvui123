// src/components/MathGame/MathRaceGame.jsx
import { useState, useEffect } from 'react';
import './MathRace.css';
import { useGameStats } from '/src/Stores/useGameStats'; // Thêm import store

const MathRaceGame = ({ onBack, addCoins, userData }) => {
    // Thêm các action từ store
    const {
        incrementGamesPlayed,
        recordAnswer,
        updateStreak,
        addRaceWin,
        addCoins: addCoinsToStats,
        recordMathRaceGame  // THÊM
    } = useGameStats();

    const [gameState, setGameState] = useState('setup');
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [playerPosition, setPlayerPosition] = useState(0);
    const [catPosition, setCatPosition] = useState(0);
    const [question, setQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameResult, setGameResult] = useState(null);

    const generateQuestion = () => {
        const operators = ['+', '-'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let a, b, correctAnswer;

        if (operator === '+') {
            a = Math.floor(Math.random() * 11);
            b = Math.floor(Math.random() * (11 - a));
            correctAnswer = a + b;
        } else {
            a = Math.floor(Math.random() * 11);
            b = Math.floor(Math.random() * (a + 1));
            correctAnswer = a - b;
        }

        const answers = [correctAnswer];
        while (answers.length < 4) {
            const wrongAnswer = Math.floor(Math.random() * 11);
            if (!answers.includes(wrongAnswer) && wrongAnswer >= 0) {
                answers.push(wrongAnswer);
            }
        }

        const shuffledAnswers = answers.sort(() => Math.random() - 0.5);

        setQuestion({
            text: `${a} ${operator} ${b} = ?`,
            correctAnswer,
            answers: shuffledAnswers,
            a,
            b,
            operator
        });
    };

    const startGame = () => {
        // Cập nhật thống kê khi bắt đầu game
        incrementGamesPlayed();
        updateStreak();

        setGameState('playing');
        setCurrentQuestion(0);
        setScore(0);
        setPlayerPosition(0);
        setCatPosition(0);
        setSelectedAnswer(null);
        setGameResult(null);
        generateQuestion();
    };

    const handleAnswerSelect = (answer) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answer);

        setTimeout(() => {
            const isCorrect = answer === question.correctAnswer;

            // Ghi nhận kết quả vào store
            recordAnswer(isCorrect);

            if (isCorrect) {
                setScore(prev => prev + 1);
                setPlayerPosition(prev => prev + 1);
                // Cập nhật cả props và store
                addCoins(10);
                addCoinsToStats(10);
            } else {
                setCatPosition(prev => prev + 1);
            }

            if (currentQuestion + 1 >= totalQuestions) {
                finishGame();
            } else {
                setCurrentQuestion(prev => prev + 1);
                setSelectedAnswer(null);
                setTimeLeft(15);
                generateQuestion();
            }
        }, 1500);
    };

    const finishGame = () => {
        setGameState('finished');

        let result = '';
        let coinsWon = 0;

        if (playerPosition > catPosition) {
            result = 'win';
            coinsWon = 50;
            // Ghi nhận chiến thắng trận đua
            addRaceWin();
        } else if (playerPosition < catPosition) {
            result = 'lose';
            coinsWon = 0;
        } else {
            result = 'draw';
            coinsWon = 20;
        }

        // Cập nhật xu thưởng
        if (coinsWon > 0) {
            addCoins(coinsWon);
            addCoinsToStats(coinsWon);
        }

        recordMathRaceGame(result, totalQuestions, score, coinsWon);

        setGameResult(result);
    };

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && selectedAnswer === null) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Hết thời gian, mèo tiến lên
                        setCatPosition(prev => prev + 1);

                        // Ghi nhận câu trả lời sai
                        recordAnswer(false);

                        if (currentQuestion + 1 >= totalQuestions) {
                            finishGame();
                        } else {
                            setCurrentQuestion(prev => prev + 1);
                            setSelectedAnswer(null);
                            setTimeLeft(15);
                            generateQuestion();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [gameState, timeLeft, selectedAnswer, currentQuestion]);

    const raceTrackLength = 10;

    return (
        <div className="math-race-container">
            <div className="race-header">
                <button onClick={onBack} className="back-btn">
                    ↩️ Quay về Menu
                </button>
                <h1>🐱 Đua Toán Học Với Mèo</h1>
                <div className="game-stats">
                    <div className="stat">
                        <span className="stat-label">Câu:</span>
                        <span className="stat-value">{currentQuestion + 1}/{totalQuestions}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Điểm:</span>
                        <span className="stat-value">{score}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Thời gian:</span>
                        <span className={`stat-value ${timeLeft <= 5 ? 'time-warning' : ''}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>
            </div>

            {gameState === 'setup' && (
                <div className="setup-screen">
                    <div className="setup-card">
                        <h2>🏁 Thiết Lập Trận Đua</h2>
                        <div className="setup-options">
                            <div className="option-group">
                                <label>Số câu hỏi:</label>
                                <div className="number-selector">
                                    {[3, 5, 7, 10].map(num => (
                                        <button
                                            key={num}
                                            className={`number-option ${totalQuestions === num ? 'selected' : ''}`}
                                            onClick={() => setTotalQuestions(num)}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="instructions">
                                <h3>📝 Luật chơi:</h3>
                                <ul>
                                    <li>Trả lời đúng: Bạn tiến 1 bước</li>
                                    <li>Trả lời sai hoặc hết giờ: Mèo tiến 1 bước</li>
                                    <li>Sau tất cả câu hỏi, ai đi xa hơn sẽ thắng</li>
                                    <li>Đúng: +10 xu, Thắng: +50 xu</li>
                                </ul>
                            </div>

                            <button onClick={startGame} className="start-race-btn">
                                🏁 Bắt đầu đua!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="game-screen">
                    <div className="race-track">
                        <div className="track">
                            {Array.from({ length: raceTrackLength }).map((_, index) => (
                                <div key={index} className="track-segment">
                                    {index + 1}
                                </div>
                            ))}
                        </div>

                        <div className="racers">
                            <div
                                className="player"
                                style={{ left: `${(playerPosition / totalQuestions) * 90}%` }}
                            >
                                <span className="racer-icon">{userData.avatar}</span>
                                <span className="racer-name">Bạn</span>
                            </div>

                            <div
                                className="cat"
                                style={{ left: `${(catPosition / totalQuestions) * 90}%` }}
                            >
                                <span className="racer-icon">🐱</span>
                                <span className="racer-name">Mèo</span>
                            </div>
                        </div>
                    </div>

                    <div className="question-section">
                        <div className="question-card">
                            <h3>Câu hỏi {currentQuestion + 1}</h3>
                            <div className="question-text">{question?.text}</div>

                            <div className="answers-grid">
                                {question?.answers.map((answer, index) => {
                                    let answerClass = 'answer-btn';

                                    if (selectedAnswer !== null) {
                                        if (answer === question.correctAnswer) {
                                            answerClass += ' correct';
                                        } else if (answer === selectedAnswer && answer !== question.correctAnswer) {
                                            answerClass += ' wrong';
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            className={answerClass}
                                            onClick={() => handleAnswerSelect(answer)}
                                            disabled={selectedAnswer !== null}
                                        >
                                            {answer}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visual aid mới - KHÔNG HIỂN THỊ ĐÁP ÁN TRƯỚC */}
                        <div className="visual-aid">
                            <div className="visual-explanation">
                                <div className="visual-row">
                                    <div className="visual-group">
                                        <span className="visual-label">Số thứ nhất:</span>
                                        <div className="visual-items">
                                            {question && Array.from({ length: question.a }).map((_, i) => (
                                                <span key={`a-${i}`} className="visual-item">🍎</span>
                                            ))}
                                        </div>
                                        <span className="visual-count">({question?.a})</span>
                                    </div>

                                    <div className="visual-operator">{question?.operator}</div>

                                    <div className="visual-group">
                                        <span className="visual-label">Số thứ hai:</span>
                                        <div className="visual-items">
                                            {question && Array.from({ length: question.b }).map((_, i) => (
                                                <span key={`b-${i}`} className="visual-item">🍎</span>
                                            ))}
                                        </div>
                                        <span className="visual-count">({question?.b})</span>
                                    </div>

                                    <div className="visual-equals">=</div>

                                    <div className="visual-group">
                                        <span className="visual-label">Kết quả:</span>
                                        <div className="visual-result-placeholder">
                                            {selectedAnswer !== null ? (
                                                <span className="visual-result-correct">
                                                    {question?.correctAnswer}
                                                </span>
                                            ) : (
                                                <span className="visual-result-question">
                                                    ?
                                                    <span className="hint-text">(chọn đáp án)</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {question && (
                                    <div className="visual-tip">
                                        {question.operator === '+'
                                            ? `Cộng ${question.a} và ${question.b} lại với nhau`
                                            : `Lấy ${question.a} trừ đi ${question.b}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {gameState === 'finished' && (
                <div className="result-screen">
                    <div className="result-card">
                        <div className={`result-icon ${gameResult}`}>
                            {gameResult === 'win' ? '🏆' :
                                gameResult === 'lose' ? '😿' : '🤝'}
                        </div>

                        <h2 className="result-title">
                            {gameResult === 'win' ? 'CHÚC MỪNG BẠN THẮNG!' :
                                gameResult === 'lose' ? 'CHÚC BẠN MAY MẮN LẦN SAU!' :
                                    'HÒA RỒI!'}
                        </h2>

                        <div className="final-stats">
                            <div className="final-stat">
                                <span className="stat-label">Điểm của bạn:</span>
                                <span className="stat-value">{score}/{totalQuestions}</span>
                            </div>
                            <div className="final-stat">
                                <span className="stat-label">Bước đi:</span>
                                <span className="stat-value">{playerPosition} - {catPosition}</span>
                            </div>
                        </div>

                        <div className="reward-message">
                            {gameResult === 'win' && '🎉 Bạn nhận được 50 xu thưởng!'}
                            {gameResult === 'draw' && '🎁 Bạn nhận được 20 xu thưởng!'}
                            {gameResult === 'lose' && '💪 Cố gắng lần sau nhé!'}
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
        </div>
    );
};

export default MathRaceGame;