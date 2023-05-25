import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { BrowserRouter }
    from 'react-router-dom';
import Stickynavbar from './components/navbar/Sticknavbar';
// import AppRouter from './AppRouter';
import Availabledoc from './components/pages/Availabledoc';
import Home from './components/pages/Home';
import Makeappointment from './components/pages/Makeappointment';
// import Home from './components/pages/Home';
// import Makeappointment from './components/pages/Makeappointment';



function App() {
  return (
    <>
    <BrowserRouter>
    <div className="relative z-0">
      <div>
      <Stickynavbar/>
      <Home/>
      </div>
      <div className="bg-about bg-cover bg-center bg-no-repeat">
          <Availabledoc />
        </div>
        <div className="relative z-0">
          <Makeappointment />
        </div>
    </div>
    </BrowserRouter>
  
  {/* <AppRouter/> */}
    </>
  );
}

export default App;
