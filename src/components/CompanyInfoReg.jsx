import React, { useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import {
    TextField,
    Button,
    Typography,
    Container,
    TextareaAutosize,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material';
import './DepList.css'

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function CompanyInfoReg({ handleFormSubmit, setShowRegForm }) {
    const {data:compstats} = useFetch('http://localhost:3001/api/compinfo/get/compStats');

    const [selectedFileName, setSelectedFileName] = useState('');

    const [name, setName] = useState('');
    const [about, setAbout] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [youtube, setYoutube] = useState('');

    const [nameLangs, setNameLangs] = useState('');
    const [aboutLangs, setAboutLangs] = useState('');
    const [addressLangs, setAddressLangs] = useState('');

    const [compStatus, setCompStatus] = useState('');
    const [compStatusId, setCompStatusId] = useState('');

    const [infoImage, setInfoImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setInfoImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedInfo = {
            id: Math.random()*10000,
            name,
            nameLangs,
            about,
            aboutLangs,
            compStatusId,
            address,
            addressLangs,
            phoneNumber,
            email,
            facebook,
            instagram,
            youtube,
            infoImage
        };
        handleFormSubmit(updatedInfo);

        try{
            const response = await Axios.post('http://localhost:3001/api/compinfo/comp/insert', updatedInfo, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setName(''); 
            setNameLangs('');
            setAbout('');
            setAddress('');
            setPhoneNumber('');
            setEmail('');
            setFacebook('');
            setInstagram('');
            setYoutube('');
            setAboutLangs('');
            setAddressLangs('');
            setInfoImage(null);
            setCompStatusId('');
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

    const handleStatus = (e)=>{
        setCompStatus(e.target.value);
        const selectedStatus = compstats.result.find((comstatitem) => comstatitem.name === e.target.value);
        setCompStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        setNameLangs({ "en": newValue });
    };
    
    const handleAboutChange = (e) => {
        const newValue = e.target.value;
        setAboutLangs({ "en": newValue });
    };

    const handleAddressChange = (e) => {
        const newValue = e.target.value;
        setAddressLangs({ "en": newValue });
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
            <Box sx={{ maxHeight: '600px', overflowY: 'scroll', padding:'20px' }}>
                <Typography className='form-heading' variant="h5">ინფორმაციის რეგისტრაცია</Typography>
                <form className='dep-reg-form' onSubmit={handleSubmit}>
                    <ThemeProvider theme={theme}> 
                        <TextField
                        label="სათაური"
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
                        label="სათაური en"
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
                                value={compStatus}
                                onChange={(e) => handleStatus(e)}
                                label="status"
                                required
                                className='select-label'
                            >
                                <MenuItem value="">
                                <em>None</em>
                                </MenuItem>
                                {compstats &&
                                compstats.result.map((stat) => (
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
                        <TextField
                        label="მისამართი"
                        variant="outlined"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
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
                        label="მისამართი en"
                        variant="outlined"
                        type="text"
                        // value={addressLangs}
                        onChange={handleAddressChange}
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
                        label="ტელეფონი"
                        variant="outlined"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                        label="მეილი"
                        variant="outlined"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        label="Facebook link"
                        variant="outlined"
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
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
                        label="Instagram link"
                        variant="outlined"
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
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
                        label="YouTube link"
                        variant="outlined"
                        type="text"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
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
                        placeholder="შესახებ"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        required
                        />
                        <TextareaAutosize
                        placeholder="შესახებ en"
                        style={textareaStyle}
                        // // value={descriptionLangs}
                        onChange={handleAboutChange}
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
            </Box>
    </Container>
)
}
