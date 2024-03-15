import React, { useEffect, useState } from 'react';
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

export default function ServiceEditForm({ service, setServiceList, setSelectedService, setUpdateList }) {

    const {data:deps} = useFetch('http://localhost:3001/api/servicesapi/get/servicedeps');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [nameLangs, setNameLangs] = useState('');
    const [descriptionLangs, setDescriptionLangs] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [selectedFileName, setSelectedFileName] = useState('');
    const [serviceImage, setServiceImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setServiceImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setName(service.name);
        setServiceImage(service.image);
        setDescription(service.description);

        setNameLangs(service.name_langs ? JSON.parse(service.name_langs) : '');
        setDescriptionLangs(service.description_langs ? JSON.parse(service.description_langs) : '');

        deps && deps.result.map((dep)=>{
            if(dep.id === service.department_id){
                setDepartment(dep.name);
            }
        });
    },[deps, service]);

    useEffect(()=>{

        if(department){
            const selectedDepartment = deps && deps.result.find((dep) => dep.name === department);
            setDepartmentId(selectedDepartment ? selectedDepartment.id : '');
        };

    },[department]);

    const updateDep= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/servicesapi/services/update/${id}`,
            {
                id: id, 
                name,
                nameLangs,
                description,
                descriptionLangs,
                departmentId,
                serviceImage
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            setServiceList(prevList =>
                prevList.map(service => {
                    if (service.id === id) {
                    return {...service, 
                        name,
                        nameLangs,
                        description,
                        descriptionLangs,
                        departmentId,
                        serviceImage
                    };}
                    return service;
                })
            );
            setUpdateList(true);
            setSelectedService(null);
        } catch(error){
            console.error('Error updating dep:', error);
        }
    };

    const handleDep = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps && deps.result.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedService(null);
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
        <Typography className='form-heading' variant="h5">სერვისის მონაცემების ცვლილება</Typography>
        <form className='dep-reg-form'>
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
                value={nameLangs && nameLangs.en}
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
                value={descriptionLangs && descriptionLangs.en}
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
                        onChange={(e)=> handleDep(e)}
                        label="client"
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
                    {selectedFileName && (
                        <div>{selectedFileName}</div>
                    )}
                    <Button type="submit" onClick={(e)=>{updateDep(service.id, e)}} variant="contained" color="primary">
                        განახლება
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
