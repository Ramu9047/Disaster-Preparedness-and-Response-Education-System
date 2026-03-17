import { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
    ADMIN: 'ADMIN',
    OFFICER: 'OFFICER',
    RESCUE: 'RESCUE',
    CITIZEN: 'CITIZEN',
    VOLUNTEER: 'VOLUNTEER',
};

export const DEMO_USERS = [
    { id: 'u1', username: 'collector@ndma.gov', password: 'admin123', role: ROLES.ADMIN, name: 'Dist. Collector Sharma', avatar: 'S', district: 'Chennai District', badge: 'IAS-2019' },
    { id: 'u2', username: 'officer@ndma.gov', password: 'officer123', role: ROLES.OFFICER, name: 'Dy. Collector Priya', avatar: 'P', district: 'Chennai District', badge: 'OFC-007' },
    { id: 'u3', username: 'rescue@ndrf.gov', password: 'rescue123', role: ROLES.RESCUE, name: 'NDRF Lt. Arjun Singh', avatar: 'A', district: 'Chennai District', badge: 'NDRF-042' },
    { id: 'u4', username: 'citizen@gmail.com', password: 'user123', role: ROLES.CITIZEN, name: 'Ravi Kumar', avatar: 'R', district: 'Chennai', badge: null },
    { id: 'u5', username: 'volunteer@nss.org', password: 'vol123', role: ROLES.VOLUNTEER, name: 'Meena Devi', avatar: 'M', district: 'Chennai', badge: 'VOL-NSS' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('og_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = (username, password) => {
        const found = DEMO_USERS.find(u => u.username === username && u.password === password);
        if (found) {
            const { password: _, ...safeUser } = found;
            setUser(safeUser);
            localStorage.setItem('og_user', JSON.stringify(safeUser));
            return { success: true, user: safeUser };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('og_user');
    };

    const hasRole = (...roles) => user && roles.includes(user.role);

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole, ROLES }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
