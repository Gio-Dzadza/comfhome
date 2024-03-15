import React, { useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
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
import './UsersList.css';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function UserRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:departments} = useFetch('http://localhost:3001/api/depapi/get/deps');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');
    const {data:type} = useFetch('http://localhost:3001/api/get/type');


    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');
    const [FirstNameLangs, setFirstNameLangs] = useState('');
    const [LastNameLangs, setLastNameLangs] = useState('');

    const [userType, setUserType] = useState('');
    const [userTypeId, setUserTypeId] = useState('');

    const [userDepartment, setUserDepartment] = useState('');
    const [userDepartmentId, setUserDepartmentId] = useState('');

    const [userStatus, setUserStatus] = useState('');
    const [userStatusId, setUserStatusId] = useState('');

    const [userImage, setUserImage] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        // setUserImage(e.target.files[0]);
        setUserImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedUser = {
            // id: Math.random()*10000,
            Email,
            Password,
            FirstName,
            FirstNameLangs,
            LastName,
            LastNameLangs,
            userStatusId,
            userDepartmentId,
            userTypeId,
            userImage
        };
        handleFormSubmit(updatedUser);

        try{
            const response = await Axios.post('http://localhost:3001/api/insert', updatedUser, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            // const data = await response.data;
            // console.log(response.data);
            handleFormSubmit(); 
            setEmail('');
            setPassword(''); 
            setFirstName('');
            setFirstNameLangs('');
            setLastName('');
            setUserStatusId('');
            setUserDepartmentId('');
            setUserTypeId('');
            setUserImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    const handleTypes = (e)=>{
        setUserType(e.target.value);
        const selectedType = type.find((user_type) => user_type.type_name === e.target.value);
        setUserTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setUserStatus(e.target.value);
        const selectedStatus = status.find((user_status) => user_status.status_name === e.target.value);
        setUserStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleDepartment = (e)=>{
        setUserDepartment(e.target.value);
        const selectedDepartment = departments.result.find((user_department) => user_department.name === e.target.value);
        setUserDepartmentId(selectedDepartment ? selectedDepartment.id : '');
    };

    const handleFormClose = ()=>{
        setShowRegForm(false);
    }

    const handleFirstNameChange = (e) => {
        const newValue = e.target.value;
        setFirstNameLangs({ "en": newValue });
    };
    const handleLastNameChange = (e) => {
        const newValue = e.target.value;
        setLastNameLangs({ "en": newValue });
    };


    return (
    <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">ახალი მომხმარებლის რეგისტრაცია</Typography>
        <form className='reg-form' onSubmit={handleSubmit}>
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
                label="სახელი en"
                variant="outlined"
                // value={FirstNameLangs}
                onChange={handleFirstNameChange}
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
                label="გვარი en"
                variant="outlined"
                // value={LastName}
                onChange={handleLastNameChange}
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
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                />
                <FormControl
                    className='user-type' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        ტიპი
                    </InputLabel>
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
                    დეპარტამენტი
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
                    departments.result.map((user_department) => (
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
                    სტატუსი
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
                    <Button type="submit" variant="contained" color="primary">
                        რეგისტრაცია
                    </Button>
                </div>
                <div className='close-btn-container'>
                    <Button className='close-btn' onClick={()=> handleFormClose()} variant="contained" color="primary">
                        ფორმის დახურვა
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
)
}
