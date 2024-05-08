import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'
import './Login.css';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('/api/login', { username, password });
            const { token } = response.data;
            login(token);
            navigate('/')
            window.location.reload();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className='login-page-wrapper'>
            <div className='login-head-wrapper'>
                <h1 className='login-page-heading'>Login</h1>
            </div>
            <div className='login-body-wrapper'>
                <div className='login-form-wrapper'>
                    <div className='login-inputs-wrapper'>
                        <input className='login-username-input'
                            type="text"
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            />
                            <br />
                        <input className='login-password-input'
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            />
                    </div>
                    <div className='login-button-wrapper'>
                        <button onClick={handleLogin}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
};