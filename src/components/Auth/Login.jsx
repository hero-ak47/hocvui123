// src/components/Auth/Login.jsx
import { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        // Demo login - trong thực tế sẽ gọi API
        const demoUsers = {
            'treem': '123456',
            'bemato': 'bemato',
            'guest': 'guest'
        };

        if (demoUsers[username] === password) {
            onLogin(username);
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">🎮 Toán Học Vui Nhộn</h1>
                    <p className="auth-subtitle">Đăng nhập để bắt đầu học toán!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">👤 Tên đăng nhập:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên của bé..."
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">🔒 Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                            className="form-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn-primary auth-btn">
                        🚀 Đăng nhập
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="demo-accounts">
                        <strong>Tài khoản demo:</strong><br />
                        treem / 123456<br />
                        bemato / bemato<br />
                        guest / guest
                    </p>

                    <button onClick={onRegister} className="btn btn-secondary">
                        📝 Đăng ký tài khoản mới
                    </button>
                </div>

                <div className="auth-decoration">
                    <div className="decoration-item">🧮</div>
                    <div className="decoration-item">🎯</div>
                    <div className="decoration-item">🌟</div>
                </div>
            </div>
        </div>
    );
};

export default Login;