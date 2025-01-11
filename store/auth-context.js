import { createContext, useState } from "react";
import {BASE_URL} from "../assets/constant/ip";

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
        fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`, // Include token if required
            },
            body: JSON.stringify({}), // Adjust if API requires a specific body
        })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((text) => {
                        console.error('Logout Error:', text);
                        throw new Error('Failed to logout');
                    });
                }
                console.log('Successfully logged out');
            })
            .catch((error) => {
                console.error('Logout API Error:', error.message);
            })
            .finally(() => {
                // Clear the authentication token and perform local logout
                setAuthToken(null);
            });
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
