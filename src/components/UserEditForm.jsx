import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import { useFetch } from '../hooks/useFetch';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Container,
} from '@mui/material';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function UserEditForm({ user, updateUserInState }) {
    const {data:type} = useFetch('http://localhost:3001/api/get/type');
    const {data:departments} = useFetch('http://localhost:3001/api/get/departments');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');

    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');

    const [userType, setUserType] = useState('');
    const [User_Type_id, setUserTypeId] = useState('');

    const [userDepartment, setUserDepartment] = useState('');
    const [User_Department_id, setUserDepartmentId] = useState('');

    const [userStatus, setUserStatus] = useState('');
    const [User_Status_id, setUserStatusId] = useState('');

    const [userImage, setUserImage] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUserImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setEmail(user && user.email);
        setFirstName(user && user.firstname);
        setLastName(user && user.lastname);
        setPassword('');
        setUserImage(user && user.image);
        type && type.forEach((typeofuser) => {
            if (typeofuser.id === user.type_id) {
                setUserType(typeofuser.type_name);
            }
        });
        departments && departments.forEach((departmentofuser)=>{
                if(departmentofuser.id === user.department_id){
                    setUserDepartment(departmentofuser.name);
                }
            }
        );
        status && status.forEach((statusofuser)=>{
                if(statusofuser.id === user.status_id){
                    setUserStatus(statusofuser.status_name);
                }
            }
        )
    },[user, type, status, departments]);

    useEffect(()=>{
        if(userType){
            const selectedType = type && type.find((user_type) => user_type.type_name === userType);
            setUserTypeId(selectedType ? selectedType.id : '');
        };
    
        if(userStatus){
            const selectedStatus = status && status.find((user_status) => user_status.status_name === userStatus);
            setUserStatusId(selectedStatus ? selectedStatus.id : '');
        };
    
        if(userDepartment){
            const selectedDepartment = departments && departments.find((user_department) =>user_department.name === userDepartment);
            setUserDepartmentId(selectedDepartment ? selectedDepartment.id : '');
        };
    },[userType, userStatus, userDepartment, type, status, departments]);

    const updateUser= async (id)=>{
        try{
            await Axios.put(`http://localhost:3001/api/updateUser/${id}`,
            {
                id: id, 
                Email,
                Password,
                FirstName,
                LastName,
                User_Status_id,
                User_Department_id,
                User_Type_id,
                userImage
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken,
                    'Content-Type': 'multipart/form-data',
                },
            }
            );
            updateUserInState({
                id: id,
                Email,
                Password,
                FirstName,
                LastName,
                User_Status_id,
                User_Department_id,
                User_Type_id,
                userImage
            });
        } catch(error){
            console.error('Error updating user:', error);
        }
    };

    const handleTypes = (e)=>{
        setUserType(e.target.value);
        const selectedType = type && type.find((user_type) => user_type.type_name === e.target.value);
        setUserTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setUserStatus(e.target.value);
        const selectedStatus = status && status.find((user_status) => user_status.status_name === e.target.value);
        setUserStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleDepartment = (e)=>{
        setUserDepartment(e.target.value);
        const selectedDepartment= departments && departments.find((user_department) => user_department.name === e.target.value);
        setUserDepartmentId(selectedDepartment ? selectedDepartment.id : '');
    };

    return (
        <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">მომხამრებლის მონაცემების ცვლილება</Typography>
        <form className='reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სახელი"
                variant="outlined"
                value={FirstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="გვარი"
                variant="outlined"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label', // Add a custom class for input text styling
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="მეილი"
                variant="outlined"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label', // Add a custom class for input text styling
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="პაროლი"
                variant="outlined"
                type="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                // required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                />
                <FormControl className='user-type' variant="outlined" fullWidth margin="normal">
                    <InputLabel className='input-label'>ტიპი</InputLabel>
                    <Select
                        value={userType}
                        onChange={(e) => handleTypes(e)}
                        label="User Type"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {type &&
                            type.map((user_type) => (
                                <MenuItem
                                    key={user_type.id}
                                    value={user_type.type_name}
                                    className='select-label'
                                >
                                    {user_type.type_name}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                <FormControl className='user-specialty' variant="outlined" fullWidth margin="normal">
                    <InputLabel 
                        className='input-label'
                    >
                        დეპრტამენტი
                    </InputLabel>
                    <Select
                        value={userDepartment}
                        onChange={(e) => handleDepartment(e)}
                        label="Department"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {departments &&
                        departments.map((user_department) => (
                            <MenuItem
                            key={user_department.id}
                            value={user_department.name}
                            className='select-label'
                            >
                            {user_department.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className='user-status' variant="outlined" fullWidth margin="normal">
                    <InputLabel
                        className='input-label'
                    >
                        მომხმარებლის სტატუსი
                    </InputLabel>
                    <Select
                        value={userStatus}
                        onChange={(e) => handleStatus(e)}
                        label="User Status"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {status &&
                        status.map((user_stat) => (
                            <MenuItem
                            key={user_stat.id}
                            value={user_stat.status_name}
                            className='select-label'
                            >
                            {user_stat.status_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div className='upreg-btn'>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }} // Hide the input element
                        id="fileInput"
                    />
                    <label htmlFor="fileInput">
                        <Button
                            className="upload-btn"
                            variant="outlined"
                            component="span"
                        >
                            სურათის ატვირთვა
                        </Button>
                    </label>
                    {selectedFileName && (
                        <div>{selectedFileName}</div>
                    )}
                    <Button type="button" onClick={()=>{updateUser(user.id)}} variant="contained" color="primary">
                        განახლება
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
    )
}
