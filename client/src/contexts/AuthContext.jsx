import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('diario_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            authAPI.me()
                .then(u => { setUser(u); setLoading(false); })
                .catch(() => { logout(); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = useCallback(async (credentials) => {
        const { user: u, token: t } = await authAPI.login(credentials);
        localStorage.setItem('diario_token', t);
        localStorage.setItem('diario_user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    }, []);

    const register = useCallback(async (data) => {
        const { user: u, token: t } = await authAPI.register(data);
        localStorage.setItem('diario_token', t);
        localStorage.setItem('diario_user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('diario_token');
        localStorage.removeItem('diario_user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
