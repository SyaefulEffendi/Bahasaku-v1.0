import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('loginDuration'); // <-- 1. HAPUS ITEM BARU SAAT LOGOUT
        setUser(null);
        setToken(null);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        const storedTimestamp = localStorage.getItem('loginTimestamp');
        
        // --- 2. BACA DURASI YANG DISIMPAN (ATAU DEFAULT 1 HARI) ---
        const storedDuration = localStorage.getItem('loginDuration');
        const maxDuration = storedDuration ? parseInt(storedDuration) : (24 * 60 * 60 * 1000); // Default 1 hari

        if (storedToken && storedUser && storedTimestamp) {
            const loginTime = parseInt(storedTimestamp);

            // --- 3. GUNAKAN maxDuration (1 HARI ATAU 30 HARI) ---
            if ((Date.now() - loginTime) > maxDuration) { 
                logout();
            } else {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        }
    }, []); 

    // --- 4. UBAH FUNGSI LOGIN UNTUK MENERIMA "rememberMe" ---
    const login = (userData, authToken, rememberMe = false) => {
        
        // Tentukan durasi berdasarkan "rememberMe"
        const oneDay = 24 * 60 * 60 * 1000;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        const duration = rememberMe ? thirtyDays : oneDay;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        localStorage.setItem('loginTimestamp', Date.now().toString());
        localStorage.setItem('loginDuration', duration.toString()); // <-- 5. SIMPAN DURASI

        setUser(userData);
        setToken(authToken);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};