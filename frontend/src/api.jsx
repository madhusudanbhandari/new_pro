const BASE_URL='http://127.0.0.1:8000/api';

const refreshAccessToken=async()=>{
    const refresh=localStorage.getItem('refresh')
    if(!refresh) return null;

    const response=await fetch (`${BASE_URL}/token/refresh/`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({refresh}),
    });
    if (response.ok){
        const data=await response.json()
        localStorage.setItem('access',data.access);
        if(data.refresh) localStorage.setItem('refresh',data.refresh);
        return data.access;

    }else{
        localStorage.clear();
        window.location.href='/';
        return null;
    }
};

export const apiFetch=async(endpoint,options={})=>{
    let token=localStorage.getItem('access');

    const makeRequest=(accessToken)=> fetch (`${BASE_URL}${endpoint}`,{
        ...options,
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${accessToken}`,
            ...options.headers,   
        },
    });
    let response=await makeRequest(token);

    if(response.status===401){
        const newToken=await refreshAccessToken();
        if(!newToken) return response;
        response=await makeRequest(newToken);
    }
    return response;
};