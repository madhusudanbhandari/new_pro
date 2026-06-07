import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function BookAppointment() {
    const [doctor, setDoctor] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [noSlots, setNoSlots] = useState('');
    const navigate = useNavigate();

    const [form, setForm] = useState({
        doctor: '',
        date: '',
        time: '',
        reason: '',
    });

    // Bug 1 Fix: fetch doctors ONCE on mount, separate useEffect
    useEffect(() => {
        apiFetch('/doctors/')
            .then(res => res.json())
            .then(data => setDoctor(data))
            .catch(() => setError('Failed to load doctors'));
    }, []);  // ← empty dependency, runs once

    // Fetch slots only when BOTH doctor and date are selected
    useEffect(() => {
        if (!form.doctor || !form.date) return;  // guard

        setSlotsLoading(true);
        setSlots([]);
        setNoSlots('');
        setForm(prev => ({ ...prev, time: '' }));  // reset selected time

        apiFetch(`/slots/${form.doctor}/?date=${form.date}`)
            .then(res => res.json())
            .then(data => {
                setSlotsLoading(false);
                if (!data.slots || data.slots.length === 0) {
                    setNoSlots(data.message || 'No slots available for this day');
                } else {
                    setSlots(data.slots);
                }
            })
            .catch(() => {
                setSlotsLoading(false);
                setNoSlots('Failed to load slots');
            });
    }, [form.doctor, form.date]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Bug 2 Fix: use apiFetch instead of raw fetch
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.time) {
            setError('Please select a time slot');
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/appointments/book/', {
                method: 'POST',
                body: JSON.stringify(form),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccess('Appointment Booked Successfully');
                setForm({ doctor: '', date: '', time: '', reason: '' });
                setSlots([]);
            } else {
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            }
        } catch (err) {
            setError('Network error');
        } finally {
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
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot</label>
                        {!form.doctor || !form.date
                            ? <p className="text-sm text-gray-400">Select a doctor and date first</p>
                            : slotsLoading
                            ? <p className="text-sm text-gray-400">Loading slots...</p>
                            : noSlots
                            ? <p className="text-sm text-red-500">{noSlots}</p>
                            : (
                                <div className="grid grid-cols-4 gap-2 mt-1">
                                    {slots.map(slot => (
                                        <button
                                            type="button"
                                            key={slot}
                                            onClick={() => setForm({ ...form, time: slot })}
                                            className={`py-2 rounded-lg text-sm border transition
                                                ${form.time === slot
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            )
                        }
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