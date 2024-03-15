import React, {useState} from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
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

export default function SocResRegForm({ handleFormSubmit, setShowRegForm }) {

    const {data:socresstat} = useFetch('http://localhost:3001/api/socresp/get/socrespStats');

    const [socResTitle, setSocResTitle] = useState('');
    const [socResDescription, setSocResDescription] = useState('');
    const [socResTitleLangs, setSocResTitleLangs] = useState('');
    const [socResDescriptionLangs, setSocResDescriptionLangs] = useState('');

    const [socResStatus, setSocResStatus] = useState('');
    const [socResStatusId, setSocResStatusId] = useState('');

    const [selectedFileName, setSelectedFileName] = useState('');
    const [socResImages, setSocResImages] = useState([]);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSocResImages(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedInfo = {
            id: Math.random()*10000,
            socResTitle,
            socResTitleLangs,
            socResDescription,
            socResDescriptionLangs,
            socResStatusId,
            socResImages
        };
        handleFormSubmit(updatedInfo);
        try{
            const response = await Axios.post('http://localhost:3001/api/socresp/socr/insert', updatedInfo, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
            console.log(response)
            if (response.status === 200) {
                const data = await response.data;
                console.log(data);
                handleFormSubmit(); 
                setSocResTitle('');
                setSocResTitleLangs('');
                setSocResDescription('');
                setSocResDescriptionLangs('');
                setSocResStatusId('');
                setSocResImages([]);
            } else {
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            }
        } catch (error) {
            console.error('Error registering news:', error);
        }
    }

    const handleStatus = (e)=>{
        setSocResStatus(e.target.value);
        const selectedStatus = socresstat.result.find((socresstatusitem) => socresstatusitem.name === e.target.value);
        setSocResStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
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
        <Typography className='form-heading' variant="h5">ინფორმაციის რეგისტრაცია</Typography>
        <form className='news-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სათაური"
                variant="outlined"
                value={socResTitle}
                onChange={(e) => setSocResTitle(e.target.value)}
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
                <TextField
                label="სათაური en"
                variant="outlined"
                // value={socResTitle}
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
                placeholder="აღწერა"
                value={socResDescription}
                onChange={(e) => setSocResDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="აღწერა en"
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
                        onChange={(e) => handleStatus(e)}
                        label="status"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {socresstat &&
                        socresstat.result.map((stat) => (
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
                        <Button className='news-reg-btn' type="submit" variant="contained" color="primary">
                            რეგისტრაცია
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
