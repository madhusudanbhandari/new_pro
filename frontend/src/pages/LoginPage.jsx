import React from "react";
import {data, Link,useNavigate} from 'react-router-dom';
import { useState } from "react";

export default function Login(){
    const [form, setForm]=useState({
        'email':'',
        'password':''
    });
    const [error ,setError]=useState('');
    const [loading, setLoading]=useState(false);

    const navigate=useNavigate();

    const handleChange=(e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    };
    const handleSubmit=async(e)=>{
        e.preventDefault()
        setError('');
        setLoading(true);

        try{
            const response=await fetch('http://127.0.0.1:8000/api/login/',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(form),
            });
            const data=await response.json();

            if (response.ok){
                localStorage.setItem('access',data.access);
                localStorage.setItem('refresh',data.refresh);
                localStorage.setItem('role',data.role);
                localStorage.setItem('email',data.email);

                if (data.role==='doctor') navigate('/doctordashboard')
                else if (data.role==='patient' ) navigate('/patientdashboard')
                else if(data.role==='admin')  navigate('/admindashboard')

            }else{
                setError(data.non_field_errors?.[0] || 'Login failed. Check your credentials.');
            
            }
        }catch(err){
            setError("Network error. Make sure the server is running");

        }finally{
            setLoading(false);
        }
    };
     return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

                
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Login
                </h2>

                {error && (
                    <p className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                 
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                 
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                   
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

               
                <p className="text-sm text-center text-gray-600 mt-4">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );
}