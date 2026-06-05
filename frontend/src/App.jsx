import React from "react";
import {Routes, Route, BrowserRouter} from "react-router-dom"
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';

import DoctorDashboard  from './pages/DoctorDashboard'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard   from './pages/AdminDashboard'
import ProtectedRoute from "./pages/ProtectedRoute";
import BookAppointment from './pages/BookAppointment';

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="register/" element={<Register/>}/>
        <Route path="/doctordashboard" element={
          <ProtectedRoute allowedRole="doctor">
          <DoctorDashboard/>
          </ProtectedRoute>}/>
        <Route path="/patientdashboard" element={
          <ProtectedRoute allowedRole="patient">
          <PatientDashboard />
          </ProtectedRoute>} />
        <Route path="/admindashboard"   element={
          <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
          </ProtectedRoute>} />
        <Route path="/bookappointment" element={
          <ProtectedRoute allowedRole='patient'>
            <BookAppointment/>
          </ProtectedRoute>
        }/>

      </Routes>
    </BrowserRouter>
  )
}