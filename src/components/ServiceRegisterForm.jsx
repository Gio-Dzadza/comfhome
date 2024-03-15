import React, { useState } from 'react';
import Axios from 'axios';
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
    TextareaAutosize
} from '@mui/material';
import './DepList.css'

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';
import { useFetch } from '../hooks/useFetch';

export default function ServiceRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:deps} = useFetch('http://localhost:3001/api/servicesapi/get/servicedeps');

    const [selectedFileName, setSelectedFileName] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [nameLangs, setNameLangs] = useState('');
    const [descriptionLangs, setDescriptionLangs] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [serviceImage, setServiceImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setServiceImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedService = {
            // id: Math.random()*10000,
            name,
            nameLangs,
            description,
            descriptionLangs,
            departmentId,
            serviceImage
        };
        handleFormSubmit(updatedService);

        try{
            const response = await Axios.post('http://localhost:3001/api/servicesapi/services/insert', updatedService, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setName(''); 
            setNameLangs(''); 
            setDescription('');
            setDescriptionLangs('');
            setDepartmentId('');
            setServiceImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering dep:', error);
        }
    };

    const handleDeps = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps.result.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setDescriptionLangs({ "en": newValue });
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        setNameLangs({ "en": newValue });
    };

    const textareaStyle = {
        width: '97%',
        padding: '8px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'none',
        marginBottom: '10px',
        resize: 'both',
        overflow: 'auto',
    };

    return (
        <Container maxWidth="sm">
        <Typography className='form-heading' variant="h5">ახალი დეპარტამენტის რეგისტრაცია</Typography>
        <form className='dep-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სახელი"
                variant="outlined"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                InputProps={{
                    className: 'input-label',
                }}
                />
                <TextField
                label="სახელი en"
                variant="outlined"
                type="text"
                // value={name}
                onChange={handleNameChange}
                required
                fullWidth
                margin="normal"
                InputLabelProps={{
                    style: {
                        fontFamily: 'FiraGO, sans-serif',
                    },
                }}
                InputProps={{
                    className: 'input-label',
                }}
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="აღწერა"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="აღწერა en"
                // value={description}
                onChange={handleDescriptionChange}
                required
                />
                <FormControl
                    className='news-stat' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        დეპარტამენტი
                    </InputLabel>
                    <Select
                        value={department}
                        onChange={(e) => handleDeps(e)}
                        label="dep"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {deps &&
                        deps.result.map((dep) => (
                            <MenuItem
                            key={dep.id}
                            value={dep.name}
                            className='select-label'
                            >
                                {dep.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div className='dep-upreg-btn'>
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
                    {/* Display the selected filename */}
                    {selectedFileName && (
                        <div>{selectedFileName}</div>
                    )}
                    <Button type="submit" variant="contained" color="primary">
                        რეგისტრაცია
                    </Button>
                </div>
                <div className='dep-close-btn-container'>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        ფორმის დახურვა
                    </Button>
                </div>
            </ThemeProvider>
        </form>
    </Container>
)
}
