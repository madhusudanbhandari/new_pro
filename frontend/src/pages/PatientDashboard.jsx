import React, {useEffect,useState} from "react";
import {useNavigate} from 'react-router-dom';

export default function Patient(){
    const[appointments, setAppointments]=useState([]);
    const[loading, setLoading]=useState(true);
    const navigate=useNavigate();
    const username=localStorage.getItem('username');
    const[queueInfo, setQueueInfo]=useState(null);
    const token=localStorage.getItem('access');

    useEffect(()=>{
        if(!token){
            navigate('/');
            return;
        }
        fetch('http://127.0.0.1:8000/api/queueposition/',{
            headers:{
                'Authorization':`Bearer ${token}`
            }
        })
        .then(res=>res.json())
        .then(data=>setQueueInfo(data));

        fetch('http://127.0.0.1:8000/api/appointments/',{
            headers:{
                'Authorization':`Bearer ${token}`,
                'Content-Type':'application/json',
            }
        })
        .then(response=>{
            if(response.status===401){
                localStorage.clear();
                navigate('/');
                return null;
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

    const handleCancel=async(id)=>{

        const response=await fetch(`http://127.0.0.1:8000/api/appointments/${id}/cancel/`,{
            method:'PATCH',
            headers:{'Authorization': `Bearer ${token}`},
        });
        if (response.ok){
            setAppointments(appointments.map(a=>
                a.id===id? {...a,status:'cancelled'}:a
            ));
        }
    };
    const handleLogout=()=>{
        localStorage.clear();
        navigate('/');
    }
    const statusColor = (status) => {
        if (status === 'pending')   return 'bg-yellow-100 text-yellow-700';
        if (status === 'confirmed') return 'bg-green-100  text-green-700';
        if (status === 'cancelled') return 'bg-red-100    text-red-700';
        if (status === 'completed') return 'bg-blue-100   text-blue-700';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome,{username}👋
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <button
                onClick={() => navigate('/bookappointment')}
                className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
                + Book New Appointment
            </button>

            {queueInfo?.position && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 text-center">
                    <p className="text-sm text-blue-500 font-medium">Your Queue Position</p>
                    <p className="text-5xl font-bold text-blue-600 my-2">#{queueInfo.position}</p>
                    <p className="text-gray-600">Token No: <span className="font-bold">{queueInfo.token_no}</span></p>
                    <p className="text-sm text-gray-500 mt-1">Dr. {queueInfo.doctor_name}</p>
                    {queueInfo.total_ahead === 0
                        ? <p className="text-green-600 font-semibold mt-2">🎉 You're next!</p>
                        : <p className="text-gray-500 mt-2">{queueInfo.total_ahead} patient(s) ahead of you</p>
                    }
                    </div>
                )}
                        <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">My Appointments</h2>

                {loading? (
                    <p className="text-gray-500">Loading...</p>
                ) : appointments.length === 0 ? (
                    <p className="text-gray-500">No appointments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {appointments
                        .filter(appt=>appt.status!=='cancelled')
                        .map(appt => (
                            
                            
                            <div key={appt.id} className="border rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">Dr. {appt.doctor_name}</p>
                                    <p className="text-sm text-gray-500">{appt.date} at {appt.time}</p>
                                    {appt.reason && <p className="text-sm text-gray-500">Reason: {appt.reason}</p>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                    {appt.token_no && (
                                    <p className="font-bold text-green-600">
                                        Token: {appt.token_no}
                                            </p>
                                        )}
                                    {appt.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancel(appt.id)}
                                            className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200"
                                        >
                                            Cancel
                                        </button>
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