// src/components/Auth/Register.jsx
import { useState } from 'react';
import './Auth.css';

const Register = ({ onRegister, onBack }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState('👦');
    const [error, setError] = useState('');

    const avatars = ['👦', '👧', '🐱', '🐶', '🐼', '🦊', '🐯', '🦁'];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        if (username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự!');
            return;
        }

        onRegister(username);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">🌟 Tạo Tài Khoản Mới</h1>
                    <p className="auth-subtitle">Chọn avatar và bắt đầu học toán!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-username">👤 Tên bé:</label>
                        <input
                            type="text"
                            id="reg-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tên của bé..."
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">🔒 Mật khẩu:</label>
                        <input
                            type="password"
                            id="reg-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Chọn mật khẩu..."
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">✓ Nhập lại mật khẩu:</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu..."
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>😊 Chọn avatar:</label>
                        <div className="avatar-selection">
                            {avatars.map((av) => (
                                <button
                                    key={av}
                                    type="button"
                                    className={`avatar-btn ${avatar === av ? 'selected' : ''}`}
                                    onClick={() => setAvatar(av)}
                                >
                                    <span className="avatar-icon">{av}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            🎉 Tạo tài khoản
                        </button>
                        <button type="button" onClick={onBack} className="btn btn-warning">
                            ↩️ Quay lại
                        </button>
                    </div>
                </form>

                <div className="registration-bonus">
                    <p>🎁 <strong>Đăng ký ngay nhận 100 xu!</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Register;