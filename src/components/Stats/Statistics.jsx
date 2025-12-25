// src/components/Stats/Statistics.jsx
import './Stats.css';
import { useGameStats } from '/src/Stores/useGameStats';

const Statistics = ({ onBack, userData }) => {
    // Lấy dữ liệu từ store
    const {
        stats,
        gameSpecificStats,
        getHandMathProgress,
        getMathRaceWinRate
    } = useGameStats();

    // Tính toán độ chính xác từ dữ liệu thực
    const accuracy = stats.totalAnswers > 0
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
        : 0;

    // Thành tích dựa trên dữ liệu thực từ game
    const achievements = [
        {
            id: 1,
            name: 'Học giỏi',
            icon: '⭐',
            unlocked: stats.correctAnswers >= 50,
            description: `Trả lời đúng ${stats.correctAnswers}/50 câu`
        },
        {
            id: 2,
            name: 'Nhanh tay',
            icon: '⚡',
            unlocked: false,
            description: 'Trả lời trong 5 giây'
        },
        {
            id: 3,
            name: 'Toán thủ',
            icon: '🧮',
            unlocked: stats.correctAnswers >= 100,
            description: `Hoàn thành ${stats.correctAnswers}/100 câu đúng`
        },
        {
            id: 4,
            name: 'Master toán',
            icon: '👑',
            unlocked: stats.correctAnswers >= 200,
            description: `Trả lời đúng ${stats.correctAnswers}/200 câu`
        },
        {
            id: 5,
            name: 'Chăm chỉ',
            icon: '💪',
            unlocked: stats.currentStreak >= 7,
            description: `Chơi ${stats.currentStreak}/7 ngày liên tiếp`
        },
        {
            id: 6,
            name: 'Bàn tay vàng',
            icon: '✋',
            unlocked: gameSpecificStats?.handMath?.correctAnswers >= 50,
            description: `Hoàn thành ${gameSpecificStats?.handMath?.correctAnswers || 0}/50 câu toán tay`
        },
        {
            id: 7,
            name: 'Đua vô địch',
            icon: '🏆',
            unlocked: gameSpecificStats?.mathRace?.wins >= 10,
            description: `Thắng ${gameSpecificStats?.mathRace?.wins || 0}/10 trận đua`
        },
    ];

    return (
        <div className="stats-container">
            <div className="stats-header">
                <button onClick={onBack} className="back-btn">
                    ↩️ Quay về Menu
                </button>
                <h1>📊 Thành Tích Của Bé</h1>
                <div className="user-badge">
                    <span className="user-avatar">{userData.avatar}</span>
                    <span className="user-name">{userData.username}</span>
                    <span className="user-level">Cấp {userData.level}</span>
                </div>
            </div>

            <div className="stats-overview">
                <div className="overview-card">
                    <h2>Tổng quan</h2>
                    <div className="overview-grid">
                        <div className="stat-card primary">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <div className="stat-value">{userData.coins || 0}</div>
                                <div className="stat-label">Tổng xu</div>
                            </div>
                        </div>

                        <div className="stat-card success">
                            <div className="stat-icon">🎮</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.gamesPlayed || 0}</div>
                                <div className="stat-label">Lần chơi</div>
                            </div>
                        </div>

                        <div className="stat-card warning">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-content">
                                <div className="stat-value">{accuracy}%</div>
                                <div className="stat-label">Độ chính xác</div>
                            </div>
                        </div>

                        <div className="stat-card info">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.currentStreak || 0}</div>
                                <div className="stat-label">Chuỗi ngày</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detailed-stats">


                <div className="stats-card">
                    <h3>📈 Tiến độ học tập</h3>
                    <div className="progress-stats">
                        <div className="progress-item">
                            <div className="progress-label">
                                <span className="progress-icon">🎯</span>
                                Độ chính xác tổng
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${accuracy}%`,
                                        background: 'linear-gradient(90deg, #667eea, #764ba2)'
                                    }}
                                ></div>
                            </div>
                            <div className="progress-value">{accuracy}%</div>
                        </div>

                        <div className="progress-item">
                            <div className="progress-label">
                                <span className="progress-icon">✋</span>
                                Toán tay chính xác
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${getHandMathProgress()}%`,
                                        background: 'linear-gradient(90deg, #4ECDC4, #44A08D)'
                                    }}
                                ></div>
                            </div>
                            <div className="progress-value">{getHandMathProgress()}%</div>
                        </div>

                        <div className="progress-item">
                            <div className="progress-label">
                                <span className="progress-icon">🐱</span>
                                Tỷ lệ thắng Math Race
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${getMathRaceWinRate()}%`,
                                        background: 'linear-gradient(90deg, #FF6B6B, #EE5A52)'
                                    }}
                                ></div>
                            </div>
                            <div className="progress-value">{getMathRaceWinRate()}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHI TIẾT TỪNG GAME */}
            <div className="game-details">
                <div className="stats-card">
                    <h3>🎮 Chi tiết từng game</h3>
                    <div className="game-stats-grid">
                        {/* Math Race */}
                        <div className="game-stat-item">
                            <h4>🐱 Math Race</h4>
                            <div className="game-stat-details">
                                <div><strong>Trận đã chơi:</strong> {gameSpecificStats?.mathRace?.gamesPlayed || 0}</div>
                                <div><strong>Thắng:</strong> {gameSpecificStats?.mathRace?.wins || 0}</div>
                                <div><strong>Thua:</strong> {gameSpecificStats?.mathRace?.losses || 0}</div>
                                <div><strong>Hòa:</strong> {gameSpecificStats?.mathRace?.draws || 0}</div>
                                <div><strong>Tỷ lệ thắng:</strong> {getMathRaceWinRate()}%</div>
                                <div><strong>Xu kiếm được:</strong> {gameSpecificStats?.mathRace?.totalCoinsEarned || 0}</div>
                            </div>
                        </div>

                        {/* Hand Math */}
                        <div className="game-stat-item">
                            <h4>✋ Toán tay</h4>
                            <div className="game-stat-details">
                                <div><strong>Lần chơi:</strong> {gameSpecificStats?.handMath?.gamesPlayed || 0}</div>
                                <div><strong>Câu đúng:</strong> {gameSpecificStats?.handMath?.correctAnswers || 0}/{gameSpecificStats?.handMath?.totalQuestions || 0}</div>
                                <div><strong>Độ chính xác:</strong> {getHandMathProgress()}%</div>
                                <div><strong>Điểm cao nhất:</strong> {gameSpecificStats?.handMath?.bestScore || 0}</div>
                                <div><strong>Xu kiếm được:</strong> {gameSpecificStats?.handMath?.totalCoinsEarned || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rewards-section">
                <div className="stats-card">
                    <h3>🎁 Phần thưởng sắp tới</h3>
                    <div className="rewards-list">
                        <div className="reward-item upcoming">
                            <div className="reward-icon">💰</div>
                            <div className="reward-info">
                                <div className="reward-name">Level {userData.level + 1}</div>
                                <div className="reward-desc">Mở khóa level mới</div>
                            </div>
                            <div className="reward-amount">+100 xu</div>
                        </div>

                        <div className="reward-item upcoming">
                            <div className="reward-icon">🏆</div>
                            <div className="reward-info">
                                <div className="reward-name">Chuỗi {stats.currentStreak + 1} ngày</div>
                                <div className="reward-desc">Chơi liên tiếp {stats.currentStreak + 1} ngày</div>
                            </div>
                            <div className="reward-amount">+200 xu</div>
                        </div>

                        <div className="reward-item upcoming">
                            <div className="reward-icon">⭐</div>
                            <div className="reward-info">
                                <div className="reward-name">Toán thủ</div>
                                <div className="reward-desc">Hoàn thành {Math.max(0, 100 - (stats.correctAnswers || 0))} câu nữa</div>
                            </div>
                            <div className="reward-amount">+500 xu</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="stats-footer">
                <p>🎮 Tiếp tục học tập để mở khóa thêm thành tích!</p>
                <p className="footer-tip">💡 Mỗi ngày chơi 15 phút để duy trì chuỗi ngày</p>
            </div>
        </div>
    );
};

export default Statistics;