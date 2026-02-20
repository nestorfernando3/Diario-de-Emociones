import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncAPI } from '../services/syncAPI';

const AuthContext = createContext(null);

const STORAGE_KEY_PROFILE = 'diario_profile';

function loadProfile() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initialize() {
            setLoading(true);
            const syncKey = localStorage.getItem('diario_sync_key');
            if (syncKey) {
                try {
                    // Descarga silenciosa en segundo plano al iniciar
                    await syncAPI.download(syncKey);
                } catch (e) {
                    console.error("Error auto-syncing on boot", e);
                }
            }

            const profile = loadProfile();
            if (profile) {
                localStorage.setItem('diario_current_user_id', profile.id);
                setUser(profile);
            }
            setLoading(false);
        }
        initialize();
    }, []);

    // "login" now just means: save a local profile name (no password)
    const login = useCallback(async ({ displayName }) => {
        const profile = {
            id: 'local-user',
            username: displayName || 'Usuario',
            displayName: displayName || 'Usuario',
            createdAt: new Date().toISOString()
        };
        saveProfile(profile);
        localStorage.setItem('diario_current_user_id', profile.id);
        const users = JSON.parse(localStorage.getItem('diario_users') || '[]');
        if (!users.find(u => u.id === profile.id)) {
            users.push(profile);
            localStorage.setItem('diario_users', JSON.stringify(users));
        }
        setUser(profile);
        return profile;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_PROFILE);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
