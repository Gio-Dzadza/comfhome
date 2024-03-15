import React, { useEffect, useState } from 'react';
import '../pages/register/RegisterPageStyles.css';
import { Link, useNavigate } from 'react-router-dom';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";
import { BackBtnIcon } from "../assets/BackBtnIcon";
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';

export default function RegisterForm() {
    const {data:complexesList} = useFetch('http://localhost:3001/api/get/complexes');
    const context = useAuthContext();
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [adminName, setAdminName] = useState("");
    const [email, setEmail] = useState("");
    const [adminPhone, setAdminPhone] = useState("");
    const [complex, setComplex] = useState("");
    const [complexId, setComplexId] = useState("");
    const [userTypeId, setUserTypeId] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        const unsub = ()=>{
            if(complexesList && complexesList.result){
                setComplex(complexesList.result);
            };
            setUserTypeId(1);
        };
        unsub();
        return()=>{
            unsub();
        };
    },[complexesList]);

    useEffect(()=>{
        let timeoutId;
        const unsub = ()=>{
            if(success){
                timeoutId = setTimeout(() => {
                    navigate('/');
                }, 2000);
            };
        };
        unsub();
        return ()=>{
            clearTimeout(timeoutId);
            unsub();
        }
    },[success]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(password === repeatPassword){
            const admin = {
                email,
                password,
                adminName,
                adminPhone,
                complexId,
                userTypeId
            };
            try{
                const response = await Axios.post('http://localhost:3001/api/insert', admin, {
                    headers: {
                        "x-access-token": context.userAccessToken,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.status === 200) {
                    setEmail('');
                    setPassword(''); 
                    setAdminName('');
                    setAdminPhone('');
                    setComplexId('');
                    setComplex('');
                    setRepeatPassword('');
                    setSuccessMsg("Registration completed successfully");
                    setSuccess(true);
                    setPasswordMatch(false);
                } else {
                    const error = await response.data;
                    alert('Failed to authenticate: ' + error);
                }
            } catch (error) {
                console.error('Error registering user:', error);
            };
        } else{
            setPasswordMsg("Passwords do not match");
            setPasswordMatch(true);
        }
    };

    const handleComplex = (e)=>{
        setComplex(e.target.value);
        const selectedComplex = complexesList && complexesList.result.find((item) => item.company === e.target.value);
        setComplexId(selectedComplex ? selectedComplex.id : '');
    };

    return (
        <div className='RegisterPageWrapper'>
            <div className='RegisterLogoWrapper'>
                <Link to="/">
                    <ComfortHomeLogo/>
                </Link>
            </div>
            <Link to="/" className='RegisterTitleWrapper'>
                <div>
                    <BackBtnIcon/>
                </div>
                <div>
                    <h2 className='RegisterTitle'>Registration</h2>
                </div>
            </Link>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Email</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Mail"
                />
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Password</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                />
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Repeat Password</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="password"
                    value={repeatPassword}
                    placeholder="Repeat your password"
                    onChange={(e) => setRepeatPassword(e.target.value)}
                />
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Complex</span>
                </div>
                <div className='district'>
                    <label>
                        <select className='selectBox' required onChange={(e)=> {handleComplex(e)}} value={complex}>
                            <option className='optionItem'></option>
                            { complexesList && complexesList.result.map(item =>(
                                <option className='optionItem' value={item.company} key={item.id}>{item.company}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Admin Name</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Enter your name"
                />
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Admin Phone</span>
                </div>
                <div className='RegisterPhoneNumberFormText'>
                    <span className="isdStyles">+995</span>
                    <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className='RegisterPhoneInputStyles'
                    />
                </div>
            </div>
            {
                success && (
                    <div>
                        {successMsg}
                    </div>
                )
            }
            {
                passwordMatch && (
                    <div>
                        {passwordMsg}
                    </div>
                )
            }
            <div className='RegisterBtnContainer'>
                <button onClick={(e)=>{handleSubmit(e)}} type="submit" className='RegisterBtn'>Register</button>
            </div>
        </div>
    )
}
