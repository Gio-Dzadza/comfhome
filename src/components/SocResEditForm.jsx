import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import './NewsRegisterForm.css';
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

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function SocResEditForm({ socres, setSocResList, setSelectedSocRes, socResStatuses, setUpdateList }) {

    const [socResTitle, setSocResTitle] = useState('');
    const [socResDescription, setSocResDescription] = useState('');
    const [socResTitleLangs, setSocResTitleLangs] = useState('');
    const [socResDescriptionLangs, setSocResDescriptionLangs] = useState('');

    const [socResStatus, setSocResStatus] = useState('');
    const [socResStatusId, setSocResStatusId] = useState('');

    const [selectedFileName, setSelectedFileName] = useState('');
    const [socResImages, setSocResImages] = useState([]);

    const context = useAuthContext();
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSocResImages(file);
        setSelectedFileName(file ? file.name : '');
    };

    useEffect(()=>{
        setSocResTitle(socres.title);
        setSocResDescription(socres.description);
        setSocResTitleLangs(JSON.parse(socres.title_langs));
        setSocResDescriptionLangs(JSON.parse(socres.description_langs));

        socResStatuses && socResStatuses.forEach((statusofsocr)=>{
                if(statusofsocr.id === socres.status_id){
                    setSocResStatus(statusofsocr.name);
                }
            }
        );

    },[socResStatuses, socres]);

    useEffect(()=>{

        if(socResStatus){
            const selectedSocResStatus = socResStatuses.find((statitem) => statitem.name === socResStatus);
            setSocResStatusId(selectedSocResStatus ? selectedSocResStatus.id : '');
        };

    },[socResStatus, socResStatuses]);

    const updateSocRes = async (id, e)=>{
        e.preventDefault();
        try{
            const response = await Axios.put(`http://localhost:3001/api/socresp/socr/update/${id}`, 
            {
                id: id, 
                socResTitle,
                socResDescription,
                socResTitleLangs,
                socResDescriptionLangs,
                socResStatusId,
                socResImages
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            if(response.status === 200) {
                // console.log(response);
                setSocResList(prevList =>
                    prevList.map(socr => {
                        if (socr.id === id) {
                        return {...socr,
                            socResTitle,
                            socResTitleLangs,
                            socResDescription,
                            socResDescriptionLangs,
                            socResStatusId,
                            socResImages
                        };}
                        return socr;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedSocRes(null);
        } catch(error){
            console.error('Error updating info:', error);
        }
    };

    const handleStatus = (e)=>{
        setSocResStatus(e.target.value);
        const selectedStatus = socResStatus.find((socr_status) => socr_status.name === e.target.value);
        setSocResStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedSocRes(null);
    };

    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setSocResDescriptionLangs({ "en": newValue });
    };

    const handleTitleChange = (e) => {
        const newValue = e.target.value;
        setSocResTitleLangs({ "en": newValue });
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
        <Container className='news-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">მონაცემების ცვლილება</Typography>
        <form className='news-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სათაური"
                variant="outlined"
                value={socResTitle}
                onChange={(e) => setSocResTitle(e.target.value)}
                fullWidth
                margin="normal"
                className='news-name'
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
                value={socResTitleLangs && socResTitleLangs.en}
                onChange={handleTitleChange}
                required
                fullWidth
                margin="normal"
                className='news-name'
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="შესახებ"
                value={socResDescription}
                onChange={(e) => setSocResDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                placeholder="შესახებ en"
                style={textareaStyle}
                value={socResDescriptionLangs && socResDescriptionLangs.en}
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
                        სტატუსი
                    </InputLabel>
                    <Select
                        value={socResStatus}
                        onChange={(e)=> handleStatus(e)}
                        label="client"
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {socResStatuses &&
                        socResStatuses.map((stat) => (
                            <MenuItem
                            key={stat.id}
                            value={stat.name}
                            className='select-label'
                            >
                                {stat.name}
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
                </div>
                <div className='reg-close-btns-cont'>
                    <div className='news-reg-btn-cont'>
                        <Button className='news-reg-btn' type="submit" onClick={(e)=>{updateSocRes(socres.id, e)}} variant="contained" color="primary">
                            განახლება
                        </Button>
                    </div>
                    <div className='news-close-btn-cont' >
                        <Button className='news-close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                            ფორმის დახურვა
                        </Button>
                    </div>
                </div>
            </ThemeProvider>
        </form>
    </Container>
    )
}
