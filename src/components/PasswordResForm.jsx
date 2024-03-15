import React, { useState } from 'react';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";
import { BackBtnIcon } from "../assets/BackBtnIcon";
import { Link } from 'react-router-dom';
import './ForgetPasswordStyles.css';
import Axios from 'axios';


export default function PasswordResForm() {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e)=>{
        e.preventDefault();

        const admin = {
            email,
        };

        try{
            const response = await Axios.post('http://localhost:3001/api/passres', admin);
            if(response && response.status === 200){
                if(response.data.result.length === 0){
                    alert('No admin found with this email.')
                }else{
                    alert('Password reset email sent! Check your inbox.')
                }
            }
        } catch (error){
            console.log("Error reseting password: " + error);
        }
    };

    return (
        <div className='ForgetPasswordPageWrapper'>
            <div className='ForgetPasswordLogoWrapper'>
                <Link to="/">
                    <ComfortHomeLogo />
                </Link>
            </div>
            <Link to="/" className='ForgetPasswordTitleWrapper'>
                <div>
                    <BackBtnIcon/>
                </div>
                <div>
                    <h2 className='ForgetPasswordTitle'>Reset Your Password</h2>
                </div>
            </Link>
            <div className='ForgetPasswordFormWrapper'>
                <div>
                    <span className='ForgetPasswordFormText'>Enter your email address</span>
                </div>
                <form>
                    <input
                    className='ForgetPasswordInputStyles'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                </form>
            </div>
            <div className='ForgetPasswordBtnContainer'>
                <button onClick={(e)=>{handleSubmit(e)}} type="submit" className='ForgetPasswordBtn'>Send Reset Link</button>
            </div>
        </div>
    )
}
