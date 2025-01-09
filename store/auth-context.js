import { createContext, useState } from "react";

export const AuthContext = createContext({
    token: "",
    isAuthenticated: false,
    authenticate: (token) => {},
    logout: () => {},
    isBooked: false,
    setBooked: () => {}
});

function AuthContextProvider({ children }) {
    const [authToken, setAuthToken] = useState();
    const [isBooked, setIsBooked] = useState();

    function authenticate(token) {
        setAuthToken(token);
    }

    function setBooked(isTrue) {
        setIsBooked(isTrue);
    }

    function logout() {
        setAuthToken(null);
    }

    const value = {
        token: authToken,
        isAuthenticated: !!authToken,
        authenticate: authenticate,
        logout: logout,
        isBooked: isBooked,
        setBooked: setBooked
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
