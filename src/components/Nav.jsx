import Power from '../assets/icons/power.svg';
//style
import './Nav.css'
//router
import { Link } from 'react-router-dom';
//hooks
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext'; 

export default function Nav() {
    const { logout } = useLogout();
    const context = useAuthContext();

return (
    <nav className='nav-container custom-bg-color'>
        <ul className='nav custom-font'>
            {
                context.user && (
                    <>
                        <div className='list-items'>
                            <Link to={'/userEdit'} className='list-item'>მომხმარებლის მონაცემები</Link>
                        </div>
                        <div className='icons'>
                            <img src={Power} className='logout-btn' alt='pic' onClick={logout} />
                        </div>
                    </>
                )
            }
        </ul>
    </nav>
)
}
