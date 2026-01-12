import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    currentUser: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    isAuthenticated: !!localStorage.getItem('user'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.currentUser = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.currentUser = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
        },
        updateUser: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.currentUser));
        }
    },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
