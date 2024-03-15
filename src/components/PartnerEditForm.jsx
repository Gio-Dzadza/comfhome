import React, { useEffect, useState } from 'react';
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

export default function PartnerEditForm({ partner, setPartnersList, setSelectedPartner, setUpdateList }) {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [nameLangs, setNameLangs] = useState('');
    const [descriptionLangs, setDescriptionLangs] = useState('');

    const [selectedFileName, setSelectedFileName] = useState('');

    const [image, setImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setName(partner.name);
        setNameLangs(partner.name_langs ? JSON.parse(partner.name_langs): '');
        setLink(partner.link);
        setImage(partner.image);
        setDescription(partner.description);
        setDescriptionLangs(partner.description_langs ? JSON.parse(partner.description_langs): '');
    },[partner]);

    const updatePartner= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/partners/partners/update/${id}`,
            {
                id: id, 
                name,
                nameLangs,
                description,
                descriptionLangs,
                link,
                image
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            setPartnersList(prevList =>
                prevList.map(par => {
                    if (par.id === id) {
                    return {...par, 
                        name,
                        nameLangs,
                        description,
                        descriptionLangs,
                        link,
                        image
                    };}
                    return par;
                })
            );
            setUpdateList(true);
            setSelectedPartner(null);
        } catch(error){
            console.error('Error updating partner:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedPartner(null);
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        setNameLangs({ "en": newValue });
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
        <Typography className='form-heading' variant="h5">პარტნიორის მონაცემების ცვლილება</Typography>
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
                <TextField
                label="ლინკი"
                variant="outlined"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
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
                value={descriptionLangs &&  descriptionLangs.en}
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
                    <Button type="submit" onClick={(e)=>{updatePartner(partner.id, e)}} variant="contained" color="primary">
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
