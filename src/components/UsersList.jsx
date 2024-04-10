import React, { useEffect, useState } from 'react'
import UserDefault from  '../assets/userDefault.png';
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'

export default function UsersList({updateList, setUpdateList, setEditing, setUserPhone, setUserId}) {
    const [authenticated, setAuthenticated] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const [userList, setUserList] = useState('');

    const context = useAuthContext();

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'https://admincomforthome.online/api/get',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userAccessToken, // Include the token in the headers
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        if(context && context.user){
                            const sameComplex = response.data.result.filter(item => item.complex_id === context.user.complex_id);
                            const regularUser = sameComplex && sameComplex.filter(item => item.user_type_id === 2);
                            const notDeletedUsers = regularUser && regularUser.filter(item => item.deleted_at == null);
                            setUserList(notDeletedUsers);
                        };
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    };
                });
                return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from users");
        };
    };

    useEffect(()=>{
        const controller = new AbortController();
        if(updateList){
            const signal = { signal: controller.signal }
            fetchData(signal);
            setUpdateList(false);
        } else {
            fetchData();
        };
        return ()=>{
            controller.abort();
        }
    },[context, updateList, setUpdateList]);

    const handleDelete = async (id)=>{
        try{
            await Axios.delete(`https://admincomforthome.online/api/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }).then((response)=>{
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    const updatedUsers = userList && userList.filter((user)=> user.id !== id);
                    setUserList(updatedUsers);
                    setAuthenticated(false);
                };
            });
        } catch(error){
            console.error('Error deleting user:', error);
        };
    };

    const handleEditing =(phoneNumber, id)=>{
        setEditing(true);
        setUserPhone(phoneNumber);
        setUserId(id);
    };

    return (
        <div className='container d-flex flex-column col-lg-4'>
            {isPending && <div>Loading users...</div>}
            {error && <div>{error}</div>}
            {
                authenticated && (
                    <div>
                        <h1>You are not permittied You need authentication</h1>
                    </div>
                )
            }
            {
                !authenticated && (
                    <ul className='usersList'>
                        {
                            userList && userList.map((item, index)=>(
                                <li 
                                    key={index} 
                                    className='d-flex align-items-center justify-content-between userItem'
                                >
                                    <div className='userImageContainer'>
                                        <img className='userImage'
                                            src={item.avatar ? `https://admincomforthome.online/uploads/users/${item.id}/${item.avatar}` : UserDefault} 
                                            alt="userAvatar" 
                                        />
                                    </div>
                                    <div style={{maxWidth:"141px", minWidth:"141px"}}>
                                        <p>{item.name ? item.name : 'No Name'}</p>
                                    </div>
                                    <div style={{maxWidth:"141px", minWidth:"78px"}}>
                                        <p>{item.phone}</p>
                                    </div>
                                    <div style={{maxWidth:"141px", minWidth:"auto"}}>
                                        <IconButton 
                                            className='userEdit' 
                                            onClick={()=>{handleEditing(item.phone, item.id)}}
                                            style={{padding:"0"}}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            className='userDelete' 
                                            onClick={()=>{handleDelete(item.id)}}
                                            style={{padding:"0"}}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    )
}
