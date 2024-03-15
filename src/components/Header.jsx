import React from 'react';
import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import Power from '../assets/icons/power.svg';
import { useAuthContext } from '../hooks/useAuthContext';

export default function Header() {
    const { logout } = useLogout();
    const context = useAuthContext();
    return (
        <header style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem 0', }}>
            {/* <Link to="/main" style={{ textDecoration: 'none', color: 'inherit' }}>Users</Link>
            <Link to="/deviceSetMain" style={{ textDecoration: 'none', color: 'inherit' }}>Devices</Link>
            <Link to="/settingsPage" style={{ textDecoration: 'none', color: 'inherit' }}>Settings</Link> */}
            {
                context.user && (
                    <div className='icons'>
                        <img src={Power} className='logout-btn' alt='pic' onClick={logout} />
                    </div>
                )
            }
        </header>
    )
}
