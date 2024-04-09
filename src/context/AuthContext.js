import { createContext, useReducer, useEffect, useState } from 'react';
import Axios from 'axios';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

export const authReducer = (state, action)=>{
    switch (action.type){
        case 'LOGIN':  
            return{ ...state, user: action.payload.user, userAccessToken: action.payload.accessToken, refreshToken: action.payload.refreshToken, authIsReady: true}
        case 'LOGOUT':
            return{ ...state, user: null, userAccessToken: null, refreshToken: null, authIsReady: false}
        case 'AUTH_IS_READY':
            return{ ...state, user: action.payload.user, userAccessToken: action.payload.accessToken, refreshToken: action.payload.refreshToken, authIsReady: true}
        case 'UPDATE_USER':
            return { ...state, user: action.payload.updatedUser }
        default:
            return state
    }
}

export const AuthContextProvider = ({ children }) =>{
    const [state, dispatch] = useReducer(authReducer,{
        user: null,
        userAccessToken: null,
        refreshToken: null,
        authIsReady: false
    })

    useEffect(()=>{
        Axios.get('https://64.226.115.210/api/login').then((response)=>{
            if(response.data.loggedIn){
                dispatch({
                    type: 'AUTH_IS_READY', 
                    payload: {
                        user: response.data.user[0],
                        accessToken: response.data.accessToken,
                        refreshToken: response.data.refreshToken
                    }
                })
                const accessToken = response.data.accessToken;
                const decodedToken = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000; 
                if (decodedToken.exp < currentTime) {
                    const refreshAccessToken = ()=>{
                        Axios.post('https://64.226.115.210/api/refresh-token', {
                            refreshToken: response.data.refreshToken,
                        })
                        .then((refreshResponse) => {
                            if (refreshResponse.data.auth) {
                                const newAccessToken = refreshResponse.data.accessToken;
                                dispatch({
                                type: 'AUTH_IS_READY',
                                payload: {
                                    user: response.data.user[0],
                                    accessToken: newAccessToken,
                                    refreshToken: response.data.refreshToken,
                                },
                                });
                            } else {
                                dispatch({ type: 'LOGOUT' });
                            }
                        })
                        .catch((error) => {
                            console.error('Error refreshing access token:', error);
                            dispatch({ type: 'LOGOUT' });
                        });
                    };
                    refreshAccessToken();
                    const refreshInterval = setInterval(refreshAccessToken, 600000);
                    return () => {
                        clearInterval(refreshInterval);
                    };
                } else {
                dispatch({
                    type: 'AUTH_IS_READY',
                    payload: {
                        user: response.data.user[0],
                        accessToken: accessToken,
                        refreshToken: response.data.refreshToken,
                    },
                });
                }
            } else{
                dispatch({
                    type: 'LOGOUT' 
                });
            };
        });
    }, [])

    return(
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}