import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';

export default function AuthSession({ children }) {
    const token = useSelector((state) => state.auth.token);
    const dispatch = useDispatch();
    useEffect(() => {
        const expire = () => dispatch(logout());
        window.addEventListener('auth:expired', expire);
        let timer;
        if (token) {
            try {
                const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                const { exp } = JSON.parse(atob(payload));
                if (!Number.isFinite(exp)) throw new Error('Missing expiry');
                timer = setTimeout(expire, Math.max(0, exp * 1000 - Date.now()));
            } catch { expire(); }
        }
        return () => {
            clearTimeout(timer);
            window.removeEventListener('auth:expired', expire);
        };
    }, [token, dispatch]);
    return children;
}
