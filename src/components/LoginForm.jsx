import { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import '../pages/login/LoginPageStyles.css';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";
import { BackBtnIcon } from "../../src/assets/BackBtnIcon";
import { Link, useNavigate } from "react-router-dom";

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    let navigate = useNavigate();

    const emailInputRef = useRef(null);

    const [loggedUserName, setLoggedUserName]=useState('');

    const context = useAuthContext();


    Axios.defaults.withCredentials = true;

    const login = ()=>{
        setEmail('');
        setPassword('');
        Axios.post('http://localhost:3001/api/login', {
            email,
            password
        }).then((response)=>{
            if(response.data.auth){
                setLoggedUserName(response.data.result[0].name);
                context.dispatch({
                    type: 'LOGIN', 
                    payload: {
                        user: response.data.result[0],
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken
                    }
                });
                setEmail('');
                setPassword('');
            } else{
                setLoggedUserName(response.data.message);
            };
        }).catch((error) => {
            setLoggedUserName('An error occurred. Please try again later.');
            console.error('Login error:', error);
        });
    };


    useEffect(()=>{
        Axios.defaults.withCredentials = true;
        Axios.get('http://localhost:3001/api/login').then((response)=>{
            if(response.data.loggedIn){
                setLoggedUserName('');
            } else{
                // setLoggedUserName('გთხოვთ შეიყვანეთ თქვენი მონაცემები');
                emailInputRef.current.focus();
            }
        });
    },[context]);

return (
    <div className='LoginPageWrapper'>
        <div className='LoginPageLogoWrapper'>
            <Link to="/">
                <ComfortHomeLogo/>
            </Link>
        </div> 
        <Link to="/" className='LoginPageTitleWrapper'>
            <div>
                <BackBtnIcon/>
            </div>
            <div>
                <h2 className='LoginPageTitle'>Login</h2>
            </div>
        </Link>
        <div className='LoginPageFormWrapper'>
            <div>
                <span className='LoginPageFormText'>Email</span>
            </div>
            <input
                ref={emailInputRef}
                className='LoginPageInputStyles'
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
        </div>
        <div className='LoginPageFormWrapper'>
            <div>
                <span className='LoginPageFormText'>Password</span>
            </div>
            <input
                className='LoginPageInputStyles'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <div className='LoginResult'>
            {loggedUserName}
        </div>
        <div  className="LoginButtonsContainer">
            <div>
                <button className="LoginButtonStyles" onClick={login}>Login</button>
                </div>
            <div>
                <button className="LoginButtonStyles" onClick={() => navigate('/register')}>Registration</button> 
            </div>
            <div>
                <button className="LoginButtonStyles" onClick={() => navigate("/resetPassword")}>Forget Password</button>
            </div>
        </div>
    </div>
)
}
