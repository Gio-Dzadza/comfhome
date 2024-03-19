import React, { useState } from 'react';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";
import { BackBtnIcon } from "../assets/BackBtnIcon";
import { Link } from 'react-router-dom';
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
        <div className='container'>
            <div className='container d-flex flex-column logo-nav-wrapper'>
                <div className='container col-lg-3'>
                    <div className='LogoWrapper'>
                        <Link to="/">
                            <ComfortHomeLogo />
                        </Link>
                    </div>
                    <Link to="/" className='d-flex align-items-end TitleWrapper'>
                        <div>
                            <BackBtnIcon/>
                        </div>
                        <div>
                            <h2 className='d-flex Title'>Reset Your Password</h2>
                        </div>
                    </Link>
                </div>
                <div className='container col-lg-3 d-flex flex-column form-wrapper'>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Enter your email address</span>
                        </div>
                        <form>
                            <input
                            className='InputStyles'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                        </form>
                    </div>
                    <div className='d-flex justify-content-center BtnContainer'>
                        <button onClick={(e)=>{handleSubmit(e)}} type="submit" className='RegisterBtn'>Send Reset Link</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
