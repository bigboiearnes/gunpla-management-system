import './App.css';

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import NavBar from './components/NavBar';

const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const LogIn = lazy(() => import('./pages/LogIn'));
const Profile = lazy(() => import('./pages/Profile'));
const Database = lazy(() => import('./pages/Database'));
const Collection = lazy(() => import('./pages/Collection'));
const NoMatch = lazy(() => import('./pages/NoMatch'));

export default function App() {
  return (
      <AuthProvider>
          <NavBar />
          <Suspense fallback={<div className='container'>Loading...</div>}>
              <Routes>
                  <Route path="/" element={<Home />}/>
                  <Route path="/register" element={<Register />}/>
                  <Route path='/login' element={<LogIn/>}/>
                  <Route path='/profile/:username' element={<Profile/>}/>
                  <Route path='/database/:kitId' element={<Database />}/>
                  <Route path='collection/:username' element={<Collection />}/>
                  <Route path='*' element={<NoMatch />}/>
              </Routes>
          </Suspense>
      </AuthProvider>
  );
}
