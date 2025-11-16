import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { UserContext } from '../context/UserContext';
import '../auth.css';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!email) {
            setError('Email not found. Please sign up again.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                login(data.authToken);
                navigate('/');
            } else {
                setError(data.errors ? data.errors[0].msg : 'Verification failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
            }
            else {
                setError(data.errors ? data.errors[0].msg : 'Failed to resend OTP');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Verify Your Account">
            <form onSubmit={handleSubmit} className="auth-form">
                <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '20px' }}>
                    An OTP has been sent to <strong>{email}</strong>. Please enter it below.
                </p>
                <div>
                    <label>OTP Code</label>
                    <input
                        type="text"
                        name="otp"
                        placeholder="6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="error">{error}</p>}
                {successMessage && <p style={{ color: '#34d399', textAlign: 'center' }}>{successMessage}</p>}

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Proceed'}
                </button>
            </form>

            <p className="auth-link">
                Didn't receive the code?{" "}
                <button onClick={handleResendOtp} disabled={loading}>
                    Resend OTP
                </button>
            </p>
        </AuthCard>
    );
};

export default VerifyOtp;
