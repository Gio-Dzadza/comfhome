import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Login from './pages/login/Login';
import { useAuthContext } from './hooks/useAuthContext';
import Header from './components/Header';
import Register from './pages/register/Register';
import PasswordResForm from './components/PasswordResForm';
import Main from './pages/main/Main';
import React from 'react';

function App() {
  const context = useAuthContext();
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes className="Routes">
          <Route 
            exact path='/' 
            element={!context.authIsReady ? <Navigate to='/logini' /> : <Main /> } 
          />
          <Route exact path='/logini' element={context.authIsReady ? <Navigate to='/' /> : <Login /> } />
          <Route path="/register" element={<Register /> } />
          <Route path="/resetPassword" element={<PasswordResForm/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default React.memo(App);
