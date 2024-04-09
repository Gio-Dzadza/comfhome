import React, { useEffect, useState } from 'react';
import '../pages/register/RegisterPageStyles.css';
import { Link, useNavigate } from 'react-router-dom';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";
import { BackBtnIcon } from "../assets/BackBtnIcon";
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';

export default function RegisterForm() {
    const {data:complexesList} = useFetch('https://64.226.115.210/api/get/complexes');
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
                const response = await Axios.post('https://64.226.115.210/api/insert', admin, {
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
        <div className='container'>
            <div className='container d-flex flex-column logo-nav-wrapper'>
                <div className='container col-lg-3'>
                    <div className='LogoWrapper'>
                        <Link to="/">
                            <ComfortHomeLogo/>
                        </Link>
                    </div>
                    <Link to="/" className='d-flex align-items-end TitleWrapper'>
                        <div>
                            <BackBtnIcon/>
                        </div>
                        <div>
                            <h2 className='d-flex Title'>Registration</h2>
                        </div>
                    </Link>
                </div>
                <div className='container col-lg-3 d-flex flex-column form-wrapper'>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Email</span>
                        </div>
                        <input
                            className='InputStyles'
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your Mail"
                        />
                    </div>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Password</span>
                        </div>
                        <input
                            className='InputStyles'
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Repeat Password</span>
                        </div>
                        <input
                            className='InputStyles'
                            type="password"
                            value={repeatPassword}
                            placeholder="Repeat your password"
                            onChange={(e) => setRepeatPassword(e.target.value)}
                        />
                    </div>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Complex</span>
                        </div>
                        <div className='complexes'>
                            <label>
                                <select className='selectBox' required onChange={(e)=> {handleComplex(e)}} value={complex}>
                                    <option className=''></option>
                                    { complexesList && complexesList.result.map(item =>(
                                        <option className='' value={item.company} key={item.id}>{item.company}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Admin Name</span>
                        </div>
                        <input
                            className='InputStyles'
                            type="text"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <div className='d-flex flex-column inputWrapper'>
                        <div>
                            <span className='FormText'>Admin Phone</span>
                        </div>
                        <div className='RegisterPhoneNumberFormText'>
                            <span className="FormText">+995</span>
                            <input
                                type="text"
                                value={adminPhone}
                                onChange={(e) => setAdminPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                className='RegisterInputStylesPhone'
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
                    <div className='d-flex justify-content-center BtnContainer'>
                        <button onClick={(e)=>{handleSubmit(e)}} type="submit" className='RegisterBtn'>Register</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
