import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
    const location = useLocation();
    if (!isAuthenticated && location.pathname === "/shop/home") {
        return <>{children}</>;
    }
    if (!isAuthenticated && location.pathname === "/shop/listing") {
        return <>{children}</>;
    }
    if (!isAuthenticated && location.pathname === "/shop/search") {
        return <>{children}</>;
    }
    if (isAuthenticated && location.pathname === "/shop/checkout") {
        return <>{children}</>;
    }

    if (!isAuthenticated && !["/login", "/register"].some(path => location.pathname.includes(path))) {
        return <Navigate to="/auth/login" />;
    }

if(isAuthenticated && (location.pathname.includes("/login")||location.pathname.includes("/register") || location.pathname.includes("/shop/home")||location.pathname.includes("/register"))){
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