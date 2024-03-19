import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';

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
                console.log(response.data)
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
        <div className='container col-lg-4 d-flex justify-content-between align-items-center userAddFormWrapper'>
            <div style={{width:"103px"}}>
                <button className='userAddBtn' onClick={(e)=>{editing ? handleEdit(e): handleSubmit(e)}}>{editing ? 'Edit User' : 'Add User'}</button>
            </div>
            <div className=''>
                <div className='d-flex flex-column'>
                    <div className='RegisterUserPhoneNumberFormText'>
                        <span className='FormText'>+995</span>
                        <input 
                            type="text" 
                            value={phone}
                            onChange={(e)=>{setPhone(e.target.value)}}
                            className='userRegisterInputStylesPhone'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
