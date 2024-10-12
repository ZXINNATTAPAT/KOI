import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './auth/Login/Login'
import Home from './component/Home/Home';
import Register from './auth/Register/Register';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />}></Route>
            {/* <Route index element={<Home />} /> */}
              {/* <Route path="blogs" element={<Blogs />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NoPage />} /> */}
          
        </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
