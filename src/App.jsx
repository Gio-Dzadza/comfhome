//react-router
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';

//pages and components
// import Nav from './components/Nav';
import Login from './pages/login/Login';
// import Main from './pages/main/Main';
// import Users from './pages/users/Users';
import { useAuthContext } from './hooks/useAuthContext';
// import UserEdit from './pages/userSettings/UserEdit';
// import ListsManager from './pages/manage/ListsManager';
// import Departments from './pages/departments/Departments';
// import News from './pages/news/News';
// import Services from './pages/services/Services';
// import Project from './pages/projects/Project';
// import Teams from './pages/team/Teams';
// import Positions from './pages/positions/Positions';
// import Professions from './pages/professions/Professions';
// import Company from './pages/company/Company';
// import SocialResp from './pages/socresp/SocialResp';
// import Partners from './pages/partners/Partners';
import Header from './components/Header';
import Register from './pages/register/Register';
import PasswordResForm from './components/PasswordResForm';
import Main from './pages/main/Main';
import React from 'react';

function App() {
  const context = useAuthContext();
  // console.log(context.authIsReady)
  return (
    <div className="App">
      <Router>
        {/* <Main /> */}
        {/* {context.authIsReady ? <Header /> :''} */}
        <Header />
        <Routes className="Routes">
          <Route 
            exact path='/' 
            element={!context.authIsReady ? <Navigate to='/logini' /> : <Main /> } 
          />
          <Route exact path='/logini' element={context.authIsReady ? <Navigate to='/' /> : <Login /> } />
          {/* <Route path="/login" element={!currentUser ? <Login /> : <Navigate replace to="/main" />} /> */}
          <Route path="/register" element={<Register /> } />
          {/* <Route path="/register" element={!currentUser ? <Registration /> : <Navigate replace to="/main" />} /> ra logikaa current useris? */}
          <Route path="/resetPassword" element={<PasswordResForm/>} />
          {/* <Route path="/resetPassword" element={!currentUser ? <ForgetPasswordPage/> : <Navigate replace to="/main" />} /> */}
          
          {/* <Route exact path='/users' element={<Users /> } />
          <Route path='/departments' element={<Departments />} />
          <Route path='/partners' element={<Partners />} />
          <Route path='/company' element={<Company />} />
          <Route path='/socialResponsibility' element={<SocialResp />} />
          <Route path='/news' element={<News />} />
          <Route path='/services' element={<Services />} />
          <Route path='/project' element={<Project />} />
          <Route path='/teams' element={<Teams />} />
          <Route path='/positions' element={<Positions />} />
          <Route path='/professions' element={<Professions />} />
          <Route path='/userEdit' element={<UserEdit />} />
          <Route path='/manageLists' element={<ListsManager />} /> */}
        </Routes>
        {/* <Nav /> */}
      </Router>
    </div>
  );
}

export default React.memo(App);
