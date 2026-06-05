import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BookAppointment(){
    const[doctor, setDoctor]=useState([]);
    const[error, setError]=useState('');
    const[success, setSuccess]=useState('');
    const[loading,setLoading]=useState('');
    const navigate=useNavigate();

    const[form, setForm]=useState({
        doctor:'',
        date:'',
        time:'',
        reason:'',

    });
    const token=localStorage.getItem('access')
     useEffect(() => {
        fetch('http://127.0.0.1:8000/api/doctors/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(() => setError('Failed to load doctors.'));
    }, []);
    
    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    };
    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try{
            const response=await fetch('http://127/0.0.1:8000/api/appointments/book/',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`,
                },
                body:JSON.stringify(form),

            });
            const data=await response.json();

            if (response.ok){
                setSuccess('Appointment Booked Successfully');
                setForm({doctor:'',date:'',time:'',reason:''});

            }else{
                const firstError=Object.values(data)[0];
                setError(Array.isArray(firstError)?firstError[0]:firstError);

            }
        }catch(err){
            setError("Network error");
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Book Appointment
                </h2>

                {error   && <p className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</p>}
                {success && <p className="bg-green-100 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">

                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                        <select
                            name="doctor"
                            value={form.doctor}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Select a Doctor --</option>
                            {doctor.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                    Dr. {doc.username} — {doc.doctor_profile?.specialization || 'General'} — {doc.doctor_profile?.hospital || ''}
                                </option>
                            ))}
                        </select>
                    </div>

                   
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}  // no past dates
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                            type="time"
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Describe your symptoms or reason for visit"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>

                </form>

                <button
                    onClick={() => navigate('/patientdashboard')}
                    className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
}