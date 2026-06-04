import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username:'',
        email:    '',
        password: '',
        role:     '',
       
        specialization:   '',
        license_number:   '',
        experience_years: '',
        hospital:         '',
      
        age:         '',
        gender:      '',
        blood_group: '',
        address:     '',
        
        department: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });

        
        if (e.target.name === 'role') {
            setRole(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.role) {
            setError('Please select a role.');
            return;
        }
        

        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(form),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/');
            } else {
              
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            }

        } catch (err) {
            setError('Network error. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Create Account
                </h2>

                {error && (
                    <p className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="username"
                            name="username"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                   
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Register As</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Select Role --</option>
                            <option value="doctor">Doctor</option>
                            <option value="patient">Patient</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {role === 'doctor' && (
                        <div className="space-y-4 border-t pt-4">
                            <p className="text-sm font-semibold text-blue-600">Doctor Information</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="e.g. Cardiology"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                <input
                                    type="text"
                                    name="license_number"
                                    placeholder="e.g. NMC-12345"
                                    value={form.license_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    name="experience_years"
                                    placeholder="e.g. 5"
                                    value={form.experience_years}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                                <input
                                    type="text"
                                    name="hospital"
                                    placeholder="e.g. City Hospital"
                                    value={form.hospital}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {role === 'patient' && (
                        <div className="space-y-4 border-t pt-4">
                            <p className="text-sm font-semibold text-green-600">Patient Information</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="e.g. 25"
                                    value={form.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">-- Select Gender --</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                                <select
                                    name="blood_group"
                                    value={form.blood_group}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">-- Select Blood Group --</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    placeholder="Enter your address"
                                    value={form.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {role === 'admin' && (
                        <div className="space-y-4 border-t pt-4">
                            <p className="text-sm font-semibold text-purple-600">Admin Information</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    placeholder="e.g. Hospital Management"
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                </form>

                <p className="text-sm text-center text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link to="/" className="text-blue-600 font-medium hover:underline">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}