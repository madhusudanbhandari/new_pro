import React from "react";
import {Routes, Route, BrowserRouter} from "react-router-dom"
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';

import DoctorDashboard  from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard   from './pages/AdminDashboard'


export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="register/" element={<Register/>}/>
        <Route path="/doctordashboard" element={<DoctorDashboard/>}></Route>
        <Route path="/patientdashboard" element={<PatientDashboard />} />
        <Route path="/admindashboard"   element={<AdminDashboard />} />

      </Routes>
    </BrowserRouter>
  )
}