import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function DoctorDashboard(){
    const[appointments,setAppointments]=useState([]);
    const [loading, setLoading]=useState(true);
    const navigate=useNavigate();
    const token=localStorage.getItem('access');
    const username=localStorage.getItem('username');

    
        useEffect(()=>{
            // const token=localStorage.getItem('access');
            if(!token){
                navigate('/');
                return;
            }
            // fetch('http://127.0.0.1:8000/api/appointments',{
            //     headers:{
            //         'Authorization':`Bearer ${token}`,
            //         'Content-Type':'application/json',
            //     }
            // })
            apiFetch('/appointments/')
            .then(response=>{
                if(response.status===401){
                    localStorage.clear();
                    navigate('/');
                    return;
                }
                return response.json();
            })
            .then(data=>{
                if(data){
                    setAppointments(data);
                    setLoading(false);
                }
            })
            .catch(()=>setLoading(false));
        },[]);
   
    const updateStatus=async(id,status)=>{
        const response=await apiFetchfetch(`/appointments/${id}/status/`,{
            method:'PATCH',
            body:JSON.stringify({status}),

        });
        if(response.ok){
            setAppointments(appointments.map(a=>
                a.id===id?{...a, status}:a
            ));
        }
    };
    const handleLogout=()=>{
        localStorage.clear();
        navigate('/');

    };
    const statusColor=(status)=>{
        if (status === 'pending')   return 'bg-yellow-100 text-yellow-700';
        if (status === 'confirmed') return 'bg-green-100  text-green-700';
        if (status === 'cancelled') return 'bg-red-100    text-red-700';
        if (status === 'completed') return 'bg-blue-100   text-blue-700';
    }

     return (
        <div className="min-h-screen bg-gray-100 p-6">

            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dr. {username}'s Dashboard 🩺
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                    <div key={s} className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                            {appointments.filter(a => a.status === s).length}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{s}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">All Appointments</h2>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="border rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">Patient: {appt.patient_name}</p>
                                    <p className="text-sm text-gray-500">{appt.date} at {appt.time}</p>
                                    {appt.reason && <p className="text-sm text-gray-500">Reason: {appt.reason}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>

                                    {/* {appt.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(appt.id, 'confirmed')}
                                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
                                        >
                                            Confirm
                                        </button>
                                    )} */}
                                    {appt.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateStatus(appt.id, 'completed')}
                                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200"
                                        >
                                            Complete
                                        </button>
                                    )}
                                    {appt.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(appt.id, 'cancelled')}
                                            className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200"
                                        >
                                            Cancel
                                        </button>
                                    
                                    )}
                                    
                                    <p className="font-bold text-blue-600">
                                        Token:{appt.token_no ?? 'Not assigned'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}