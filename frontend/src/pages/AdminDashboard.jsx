import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard(){
    const[appointments,setAppointments]=useState([]);
    const [loading, setLoading]=useState(true);
    const navigate=useNavigate();
    const token=localStorage.getItem('access');
    const username=localStorage.getItem('username');
    const[tokens,setTokens]=useState({});
    
        useEffect(()=>{
            // const token=localStorage.getItem('access');
            if(!token){
                navigate('/');
                return;
            }
            fetch('http://127.0.0.1:8000/api/appointments',{
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type':'application/json',
                }
            })
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
   
    const assignToken=async(id)=>{
        const response=await fetch(`http://127.0.0.1:8000/api/settoken/`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`,
            },
            body:JSON.stringify({
                appointment_id:id,
                token_no:tokens[id]
            })
         });
            if (response.ok){
                setTokens(prev => ({ ...prev, [id]: '' }));

            }
           


        // if(response.ok){
        //     setAppointments(appointments.map(a=>
        //         a.id===id?{...a, status}:a
        //     ));
        // }
    };
    const handleLogout=()=>{
        localStorage.clear();
        navigate('/');

    };


     return (
        <div className="min-h-screen bg-gray-100 p-6">

            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Admin Dashboard 
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
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
                                   
                                    {appt.status === 'pending' && (
                                        <button
                                            onClick={() => assignToken(appt.id)}
                                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200"
                                        >
                                            Assign Token
                                        </button>
                                        
                                      
                                    )}
                                    <p className="font-bold">
                                        Token: {appt.token_no || 'Not Assigned'}
                                    </p>
                                    {!appt.token_no &&(
                                     <input type="number"
                                        placeholder="Token no"
                                        value={tokens[appt.id] || ''}
                                        onChange={(e)=>
                                            setTokens(prev => ({ ...prev, [appt.id]: e.target.value }))
                                        } />
                                    )}
                           
                                        
                                </div>
                            </div>
                        ))}
                         
                    </div>
                )}
            </div>
        </div>
    );
}