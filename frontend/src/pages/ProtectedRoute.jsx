import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({children,allowedRole}){
    const token=localStorage.getItem('access')
    const role=localStorage.getItem('role')

    if(!token) return <Navigate to='/' />
        if (allowedRole && role !==allowedRole) return  <Navigate to='/'/>

        return children
   
}