// src/components/Menu/MainMenu.jsx
import './Menu.css';

const MainMenu = ({ userData, onSelectScreen, onLogout }) => {
    const menuItems = [
        {
            id: 'learning',
            title: '🎓 Học Số Từ 0-9',
            description: 'Nhận biết chữ số, hình ảnh và âm thanh',
            color: '#4299e1',
            icon: '🔢'
        },
        {
            id: 'mathRace',
            title: '🏁 Đua Toán Học',
            description: 'Trả lời đúng để vượt lên trước chú mèo',
            color: '#48bb78',
            icon: '🐱'
        },
        {
            id: 'handMath',
            title: '✋ Toán Bằng Tay',
            description: 'Dùng ngón tay để trả lời câu hỏi',
            color: '#ed8936',
            icon: '🤚'
        },
        {
            id: 'stats',
            title: '📊 Thành Tích',
            description: 'Xem điểm số và phần thưởng của bé',
            color: '#9f7aea',
            icon: '🏆'
        }
    ];

    return (
        <div className="menu-container">
            <div className="user-info-card">
                <div className="user-avatar">
                    <span className="avatar-icon">{userData.avatar}</span>
                </div>
                <div className="user-details">
                    <h2 className="username">Xin chào {userData.username}!</h2>
                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-icon">💰</span>
                            <span className="stat-value">{userData.coins} xu</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-icon">⭐</span>
                            <span className="stat-value">Cấp {userData.level}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} className="logout-btn">
                    🚪
                </button>
            </div>

            <div className="welcome-message">
                <h1>Chào Mừng Đến Với Thế Giới Toán Học!</h1>
                <p>Chọn một trò chơi để bắt đầu học tập vui vẻ</p>
            </div>

            <div className="menu-grid">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className="menu-card"
                        onClick={() => onSelectScreen(item.id)}
                        style={{ '--card-color': item.color }}
                    >
                        <div className="menu-card-icon">{item.icon}</div>
                        <h3 className="menu-card-title">{item.title}</h3>
                        <p className="menu-card-description">{item.description}</p>
                        <div className="menu-card-hover">👉 Bắt đầu</div>
                    </button>
                ))}
            </div>

            <div className="daily-bonus">
                <h3>🎁 Phần Thưởng Hàng Ngày</h3>
                <div className="bonus-calendar">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="bonus-day">
                            <span className="day-number">Ngày {day}</span>
                            <span className="day-reward">{day * 10} xu</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="menu-footer">
                <p>🎮 Toán Học Vui Nhộn - Dành cho trẻ tiền tiểu học</p>
                <p className="footer-tip">💡 Mỗi ngày học 15 phút để nhận phần thưởng!</p>
            </div>
        </div>
    );
};

export default MainMenu;