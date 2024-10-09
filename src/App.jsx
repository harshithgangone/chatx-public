import React, { useContext, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Chat from './pages/Chat/Chat';
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { AppContext } from './context/AppContext';


const App = () => {
  const navigate = useNavigate(); 
  const {loadUserData} = useContext(AppContext)

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load user data and handle navigation inside loadUserData
        await loadUserData(user.uid);
      } else {
        navigate('/');  // Redirect to login if user is not authenticated
      }
    });
  }, []);
  
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/profile' element={<ProfileUpdate/>}/>
      </Routes>
    </>
  );
}

export default App;