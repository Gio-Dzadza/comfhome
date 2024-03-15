import React, { useEffect, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import UserDefault from  '../assets/userDefault.png';
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';

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
                'http://localhost:3001/api/get',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userAccessToken, // Include the token in the headers
                    },
                }
                ).then((response)=>{
                    // console.log(response)
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        if(context && context.user){
                            const sameComplex = response.data.result.filter(item => item.complex_id === context.user.complex_id);
                            const regularUser = sameComplex && sameComplex.filter(item => item.user_type_id === 2);
                            const notDeletedUsers = regularUser && regularUser.filter(item => item.deleted_at == null);
                            setUserList(notDeletedUsers);
                        };
                        // setComplexes(response.data.result);
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
            await Axios.delete(`http://localhost:3001/api/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }).then((response)=>{
                // console.log(response);
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    // Update the UI
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
        <div>
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
                    <ul>
                        {
                            userList && userList.map((item, index)=>(
                                <li key={index}>
                                    <p>{item.name ? item.name : 'No Name'}</p>
                                    <img src={item.avatar ? `http://localhost:3001/uploads/users/${item.id}/${item.avatar}` : UserDefault} alt="userAvatar" />
                                    <p>{item.phone}</p>
                                    <div onClick={()=>{handleEditing(item.phone, item.id)}}>Edit</div>
                                    <div onClick={()=>{handleDelete(item.id)}}>Delete</div>
                                </li>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    )
}
