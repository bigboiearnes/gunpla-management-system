import './App.css';

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './components/AuthContext';
import NavBar from './components/NavBar';

const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const LogIn = lazy(() => import('./pages/LogIn'));
const Database = lazy(() => import('./pages/Database'));
const NoMatch = lazy(() => import('./pages/NoMatch'));

function App() {
  return (
      <AuthProvider>
          <NavBar />
          <Suspense fallback={<div className='container'>Loading...</div>}>
              <Routes>
                  <Route path="/" element={<Home />}/>
                  <Route path="/register" element={<Register />}/>
                  <Route path='/login' element={<LogIn/>}/>
                  <Route path="/database/:kitId" element={<Database />}/>
                  <Route path='*' element={<NoMatch />}/>
              </Routes>
          </Suspense>
      </AuthProvider>
  );
}

export default App;
