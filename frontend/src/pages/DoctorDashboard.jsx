import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export default function DoctorDashboard(){
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const username = localStorage.getItem('username');
    const [availability, setAvailability] = useState([]);
    const [form, setForm] = useState({
        day: 'monday',
        start_time: '',
        end_time: '',
        slot_duration: 30,
    });
    const [message, setMessage] = useState('');

    // Fetch appointments
    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        apiFetch('/appointments/')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    setAppointments(data);
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    }, []);

    // Fetch availability
    useEffect(() => {
        apiFetch('/availability/')
            .then(res => res.json())
            .then(data => setAvailability(data));
    }, []);

    const updateStatus = async (id, status) => {
        const response = await apiFetch(`/appointments/${id}/status/`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        if (response.ok) {
            setAppointments(prev => prev.map(a =>
                a.id === id ? { ...a, status } : a
            ));
        }
    };

    const handleSubmit = async () => {
        if (!form.start_time || !form.end_time) {
            setMessage('Please fill all fields');
            return;
        }
        const response = await apiFetch('/availability/', {
            method: 'POST',
            body: JSON.stringify(form),
        });
        const data = await response.json();
        if (response.ok) {
            setMessage('Availability saved!');
            setAvailability(prev => {
                const exists = prev.find(a => a.day === form.day);
                if (exists) return prev.map(a => a.day === form.day ? data : a);
                return [...prev, data];
            });
        } else {
            setMessage('Failed to save');
        }
    };

    const handleDelete = async (id) => {
        const response = await apiFetch(`/availability/${id}/delete/`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setAvailability(prev => prev.filter(a => a.id !== id));
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const statusColor = (status) => {
        if (status === 'pending')   return 'bg-yellow-100 text-yellow-700';
        if (status === 'confirmed') return 'bg-green-100  text-green-700';
        if (status === 'cancelled') return 'bg-red-100    text-red-700';
        if (status === 'completed') return 'bg-blue-100   text-blue-700';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            {/* Header */}
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

            {/* Stats */}
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

            {/* Availability Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">My Availability</h2>

                {message && (
                    <p className="text-sm text-blue-600 mb-3">{message}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="text-sm text-gray-600">Day</label>
                        <select
                            value={form.day}
                            onChange={e => setForm({ ...form, day: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 mt-1 capitalize"
                        >
                            {DAYS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Slot Duration (mins)</label>
                        <select
                            value={form.slot_duration}
                            onChange={e => setForm({ ...form, slot_duration: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>60 minutes</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">Start Time</label>
                        <input
                            type="time"
                            value={form.start_time}
                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600">End Time</label>
                        <input
                            type="time"
                            value={form.end_time}
                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mb-6"
                >
                    Save Availability
                </button>

                <h3 className="text-md font-semibold text-gray-600 mb-3">Current Schedule</h3>
                {availability.length === 0 ? (
                    <p className="text-gray-400">No availability set yet.</p>
                ) : (
                    <div className="space-y-2">
                        {availability.map(a => (
                            <div key={a.id} className="flex justify-between items-center border rounded-lg px-4 py-2">
                                <p className="capitalize font-medium text-gray-700">{a.day}</p>
                                <p className="text-sm text-gray-500">
                                    {a.start_time} → {a.end_time} ({a.slot_duration} min slots)
                                </p>
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Appointments Section */}
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
                                    {appt.reason && (
                                        <p className="text-sm text-gray-500">Reason: {appt.reason}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(appt.status)}`}>
                                        {appt.status}
                                    </span>
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
                                        Token: {appt.token_no ?? 'Not Assigned'}
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