import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // Not authenticated at all
    if (!isAuthenticated || !user) {
        return <Navigate to="/auth" replace />;
    }

    // Requires admin but user is not admin
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/products" replace />;
    }

    return children;
};

export default ProtectedRoute;
