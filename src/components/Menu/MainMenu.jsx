// src/components/Menu/MainMenu.jsx
import './Menu.css';

const MainMenu = ({ userData, onSelectScreen, onLogout, onOpenAbout }) => {
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
            {/* Thanh công cụ trên cùng */}
            <div className="menu-toolbar">
                <div className="toolbar-left">
                    <button className="toolbar-btn" onClick={onOpenAbout}>
                        <span className="toolbar-icon">👤</span>
                        <span className="toolbar-text">Về Tôi</span>
                    </button>

                </div>
                <div className="toolbar-center">
                    <h1 className="app-title">🎮 Toán Học Vui Nhộn</h1>
                </div>
                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={onLogout}>
                        <span className="toolbar-icon">🚪</span>
                        <span className="toolbar-text">Đăng Xuất</span>
                    </button>
                    <div className="toolbar-user">
                        <span className="user-avatar-small">{userData.avatar}</span>
                        <span className="user-name-small">{userData.username}</span>
                    </div>
                </div>
            </div>

            {/* Thông tin người dùng */}
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
                        <div className="stat-item">
                            <span className="stat-icon">🎯</span>
                            <span className="stat-value">{userData.streak || 0} ngày liên tiếp</span>
                        </div>
                    </div>
                </div>
                <button onClick={onOpenAbout} className="about-btn" title="Về Tôi">
                    ℹ️
                </button>
            </div>

            {/* Thông điệp chào mừng */}
            <div className="welcome-message">
                <h1>Chào Mừng Đến Với Thế Giới Toán Học!</h1>
                <p>Chọn một trò chơi để bắt đầu học tập vui vẻ</p>
            </div>

            {/* Lưới menu */}
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

            {/* Phần thưởng hàng ngày */}
            <div className="daily-bonus">
                <div className="bonus-header">
                    <h3>🎁 Phần Thưởng Hàng Ngày</h3>
                    <button className="bonus-info-btn" onClick={() => alert('Nhận xu mỗi ngày bạn đăng nhập!')}>
                        ℹ️
                    </button>
                </div>
                <div className="bonus-calendar">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div
                            key={day}
                            className={`bonus-day ${day <= (userData.currentDay || 1) ? 'active' : ''}`}
                        >
                            <span className="day-number">Ngày {day}</span>
                            <span className="day-reward">{day * 10} xu</span>
                            {day <= (userData.currentDay || 1) && <div className="day-check">✓</div>}
                        </div>
                    ))}
                </div>
                <button className="claim-bonus-btn" onClick={() => alert('Nhận 10 xu hôm nay!')}>
                    Nhận Phần Thưởng Hôm Nay
                </button>
            </div>



            <div className="menu-footer">
                <p>🎮 Toán Học Vui Nhộn - Dành cho trẻ tiền tiểu học</p>
                <p className="footer-tip">💡 Mỗi ngày học 15 phút để nhận phần thưởng!</p>
            </div>
        </div>
    );
};

export default MainMenu;