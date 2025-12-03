import React, { useState, useContext, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { UserContext } from '../context/UserContext';
import '../auth.css';

const VerifyOtp = () => {
    const OTP_LENGTH = 6;
    const [otpDigits, setOtpDigits] = useState(new Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const inputRefs = useRef([]);

    // Combine OTP digits for submission
    const currentOtp = otpDigits.join('');

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOtpChange = (e, index) => {
        const { value } = e.target;
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value.slice(-1); // Take only the last character for single input
        setOtpDigits(newOtpDigits);

        // Move focus to next input if a digit is entered
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move focus to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

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

        if (currentOtp.length !== OTP_LENGTH) {
            setError(`Please enter the full ${OTP_LENGTH}-digit OTP.`);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: currentOtp }),
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
        <div className="auth-wrapper">
            <AuthCard title="Verify Your Account">
                <form onSubmit={handleSubmit} className="auth-form">
                    <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '20px' }}>
                        An OTP has been sent to <strong>{email}</strong>. Please enter it below.
                    </p>
                    <div className="otp-input-group">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className="otp-box"
                                required
                            />
                        ))}
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
        </div>
    );
};

export default VerifyOtp;
