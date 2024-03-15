import React, { useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import {
    TextField,
    Button,
    Typography,
    Container,
    TextareaAutosize
} from '@mui/material';
import './DepList.css'

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function DepartmentRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const [selectedFileName, setSelectedFileName] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [nameLangs, setNameLangs] = useState('');
    const [descriptionLangs, setDescriptionLangs] = useState('');
    const [titleLangs, setTitleLangs] = useState('');

    const [depImage, setDepImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setDepImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedDep = {
            id: Math.random()*10000,
            name,
            nameLangs,
            description,
            descriptionLangs,
            title,
            titleLangs,
            depImage
        };
        handleFormSubmit(updatedDep);

        try{
            const response = await Axios.post('http://localhost:3001/api/depapi/deps/insert', updatedDep, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            handleFormSubmit(); 
            setName(''); 
            setNameLangs('');
            setDescription('');
            setDescriptionLangs('');
            setTitle('');
            setTitleLangs('');
            setDepImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering dep:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        setNameLangs({ "en": newValue });
    };

    const handleTitleChange = (e) => {
        const newValue = e.target.value;
        setTitleLangs({ "en": newValue });
    };
    
    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setDescriptionLangs({ "en": newValue });
    };

    const textareaStyle = {
        width: '97%',
        padding: '8px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
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
                // value={nameLangs}
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
                <TextField
                label="სათაური"
                variant="outlined"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                label="სათაური en"
                variant="outlined"
                type="text"
                // value={titleLangs}
                onChange={handleTitleChange}
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
                // value={descriptionLangs}
                onChange={handleDescriptionChange}
                required
                />
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
