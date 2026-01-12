import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../redux/wishlistSlice';
import { fetchCart } from '../redux/cartSlice';
import Navbar from './navbar';
import Footer from './footer';

const MainLayout = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        if (currentUser?.id) {
            dispatch(fetchWishlist({ userId: currentUser.id }));
            dispatch(fetchCart({ userId: currentUser.id }));
        }
    }, [dispatch, currentUser]);

    return (
        <>
            <Navbar />
            <Outlet />
            <Footer />
        </>
    );
};

export default MainLayout;
