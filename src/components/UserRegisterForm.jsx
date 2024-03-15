import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';
import { Button } from '@mui/material';

export default function UserRegisterForm({ handleFormSubmit, editing, setEditing, userPhone, setUserPhone, userId, setUserId }) {
    const [phone, setPhone] = useState('');
    const [complexId, setComplexId] = useState('');
    const [userTypeId, setUserTypeId] = useState('');

    const context = useAuthContext();

    useEffect(()=>{
        const unsub = ()=>{
            if(context && context.user){
                setComplexId(context.user.complex_id);
                setUserTypeId(2);
            }
        };
        unsub();
        return ()=>{
            unsub();
        };
    },[context]);

    useEffect(()=>{
        const unsub = ()=>{
            if(editing){
                setPhone(userPhone);
            }else{
                setPhone('');
            }
        };
        unsub();
        return ()=>{
            unsub();
        };
    },[editing, userPhone]);

    const handleSubmit = async(e)=>{
        e.preventDefault();
        const userInfo = {
            phone,
            complexId,
            userTypeId
        };
        handleFormSubmit(userInfo);
        try{
            const response = await Axios.post('http://localhost:3001/api/insertPhone', userInfo, {
                headers: {
                    "x-access-token": context.userAccessToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                handleFormSubmit(); 
                setPhone('');
            } else {
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            }
        } catch(error){
            console.error('Error registering user:', error);
        };
    };
    const handleEdit = async(e)=>{
        e.preventDefault();
        const userInfo = {
            phone
        };
        handleFormSubmit(userInfo);
        try{
            const response = await Axios.put(`http://localhost:3001/api/updatePhone/${userId}`, userInfo, {
                headers: {
                    "x-access-token": context.userAccessToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                handleFormSubmit(); 
                setPhone('');
                setEditing(false);
                setUserPhone('');
                setUserId('');
            } else {
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            }
        } catch(error){
            console.error('Error registering user:', error);
        };
    };

    return (
        <div>
            <div className='grid-parent-add-btn-container'>
                <Button className='grid-parent-add-btn' onClick={(e)=>{editing ? handleEdit(e): handleSubmit(e)}}>{editing ? 'Edit User' : 'Add User'}</Button>
            </div>
            <div>
                <span>+995</span>
                <input 
                    type="text" 
                    value={phone}
                    onChange={(e)=>{setPhone(e.target.value)}}
                />
            </div>
        </div>
    )
}
