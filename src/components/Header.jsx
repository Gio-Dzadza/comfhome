import React from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import Power from '../assets/icons/power.svg';
import { useAuthContext } from '../hooks/useAuthContext';
import { ComfortHomeLogo } from "../assets/ComfortHomeSvgLogo";

export default function Header() {
    const { logout } = useLogout();
    const context = useAuthContext();
    return (
        <header className='container col-lg-4 d-flex'>
            <div className='container d-flex justify-content-around' style={{padding:"31px 0px"}}>
                {
                    context.user && (
                        <>
                            <div className='LogoWrapper'>
                                <Link to="/">
                                    <ComfortHomeLogo/>
                                </Link>
                            </div>
                            <div className='icons'>
                                <img src={Power} className='logout-btn' alt='pic' onClick={logout} />
                            </div>
                        </>
                    )
                }
            </div>
        </header>
    )
}
