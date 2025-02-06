import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
    const location = useLocation();
   
    

    if (!isAuthenticated && !["/login", "/register"].some(path => location.pathname.includes(path))) {
        return <Navigate to="/auth/login" />;
    }

if(isAuthenticated && (location.pathname.includes("/login")||location.pathname.includes("/register") || location.pathname.includes("/shop/home")    )){
    if(user?.role==="admin"){
return <Navigate to ="/admin/dashboard"/>
    }else{
        return <Navigate to="/shop/home"/>
    }
}    
if(isAuthenticated && user?.role!=="admin" && location.pathname.includes("admin")){
    return <Navigate to="/unauth-page"/>
}
if(isAuthenticated && user?.role==="user" && location.pathname.includes("shop")){
    return <Navigate to ="/admin/dashboard"/>
}
return <>{children}</>
}

export default CheckAuth;