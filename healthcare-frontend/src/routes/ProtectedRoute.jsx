import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, restoreSession } from '../redux/slices/authSlice.js';

function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user, loading, token, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    if (loading) return <p role="status" className="p-8 text-center">Checking your session...</p>;
    if (token && error && !isAuthenticated) {
        return <div className="p-8 text-center space-y-4">
            <p role="alert">{error}</p>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg" onClick={() => dispatch(restoreSession())}>Retry</button>
            <button className="ml-3 underline" onClick={() => dispatch(logout())}>Return to sign in</button>
        </div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;
