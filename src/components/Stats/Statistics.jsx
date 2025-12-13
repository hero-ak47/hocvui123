// src/components/Stats/Statistics.jsx
import './Stats.css';

const Statistics = ({ onBack, userData }) => {
    // Dữ liệu mẫu
    const stats = {
        gamesPlayed: 24,
        totalCoins: userData.coins,
        correctAnswers: 156,
        totalAnswers: 200,
        learningProgress: 80,
        currentStreak: 7,
        bestStreak: 12,
        achievements: [
            { id: 1, name: 'Học giỏi', icon: '⭐', unlocked: true, description: 'Trả lời đúng 50 câu' },
            { id: 2, name: 'Nhanh tay', icon: '⚡', unlocked: true, description: 'Trả lời trong 5 giây' },
            { id: 3, name: 'Toán thủ', icon: '🧮', unlocked: false, description: 'Hoàn thành 100 câu' },
            { id: 4, name: 'Master toán', icon: '👑', unlocked: false, description: 'Trả lời đúng 200 câu' },
            { id: 5, name: 'Chăm chỉ', icon: '💪', unlocked: true, description: 'Chơi 7 ngày liên tiếp' },
            { id: 6, name: 'Bàn tay vàng', icon: '✋', unlocked: true, description: 'Hoàn thành Toán tay' },
            { id: 7, name: 'Đua vô địch', icon: '🏆', unlocked: false, description: 'Thắng 10 trận đua' },
            { id: 8, name: 'Học số siêu tốc', icon: '🔢', unlocked: true, description: 'Học hết số 0-9' },
        ]
    };

    const accuracy = Math.round((stats.correctAnswers / stats.totalAnswers) * 100) || 0;

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
                                <div className="stat-value">{stats.totalCoins}</div>
                                <div className="stat-label">Tổng xu</div>
                            </div>
                        </div>

                        <div className="stat-card success">
                            <div className="stat-icon">🎮</div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.gamesPlayed}</div>
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
                                <div className="stat-value">{stats.currentStreak}</div>
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
                            <div className="progress-label">Học số 0-9</div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${stats.learningProgress}%` }}
                                ></div>
                            </div>
                            <div className="progress-value">{stats.learningProgress}%</div>
                        </div>

                        <div className="progress-item">
                            <div className="progress-label">Câu đúng / Tổng</div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${accuracy}%` }}
                                ></div>
                            </div>
                            <div className="progress-value">{stats.correctAnswers}/{stats.totalAnswers}</div>
                        </div>
                    </div>
                </div>

                <div className="stats-card">
                    <h3>🏆 Thành tích</h3>
                    <div className="achievements-grid">
                        {stats.achievements.map(achievement => (
                            <div
                                key={achievement.id}
                                className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-info">
                                    <div className="achievement-name">{achievement.name}</div>
                                    <div className="achievement-desc">{achievement.description}</div>
                                </div>
                                <div className="achievement-status">
                                    {achievement.unlocked ? '✓' : '🔒'}
                                </div>
                            </div>
                        ))}
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
                                <div className="reward-name">Chuỗi 10 ngày</div>
                                <div className="reward-desc">Chơi liên tiếp 10 ngày</div>
                            </div>
                            <div className="reward-amount">+200 xu</div>
                        </div>

                        <div className="reward-item upcoming">
                            <div className="reward-icon">⭐</div>
                            <div className="reward-info">
                                <div className="reward-name">Toán thủ</div>
                                <div className="reward-desc">Hoàn thành 100 câu</div>
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