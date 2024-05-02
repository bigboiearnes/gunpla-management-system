import React, { useState } from "react";
import axios from 'axios';
import validator from 'validator';
import PasswordCheckList from 'react-password-checklist';
import { useNavigate } from "react-router-dom";
import './Register.css';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const biography = "This is a biography!"
    const navigate = useNavigate();


    const handleRegister = async () => {
        // Validate password and email, then register new user in database
        try {
            // Validate password
            if (validator.isStrongPassword(password, { 
                minLength: 8, minLowercase: 1, 
                minUppercase: 1, minNumbers: 1, minSymbols: 1 
            })) { 

                // Validate email
                if ((validator.isEmail(email))){

                    if (validator.isAlphanumeric(username) && (username.length < 20)) {
                        await axios.post('/api/register', { username, email, password, biography });
                        console.log('User registered successfully');
                        navigate('/login')
                    } else {
                        throw new Error('Username is invalid');
                    }
                    // Pass user details to API
                    
                } else {
                    throw new Error('Email is invalid');
                }
            } else {
                throw new Error('Password is invalid');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
              } else {
                alert('An error occurred during registration');
              }
              console.error('Registration error:', error);
            }
          };


    return (
        <div className="register-page-wrapper">
            <div className="register-head-wrapper">
                <h1 className="register-page-heading">Register</h1>
            </div>
            <div className="register-body-wrapper">
                <div className="register-form-wrapper">
                    <div className="register-inputs-wrapper">
                        <input className="register-username-input"
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        />
                        <br />
                        <input className="register-email-input"
                        type="text" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        />
                        <br />
                        <input className="register-password-input"
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                    <PasswordCheckList
                        rules={["maxLength"]}
                        maxLength={20}
                        value={username}
                        onChange={(isValid) => {}}
                        messages={{
                            maxLength: "Username is no longer than 20 characters"
                        }}
                    />
                    <PasswordCheckList
                        rules={["minLength", "specialChar", "number", "capital", "lowercase"]}
                        minLength={8}
                        value={password}
                        onChange={(isValid) => {}}
                    />
                    <div className="register-button-wrapper">
                        <button onClick={handleRegister}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
