import React, { useState } from 'react';
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

export default function NewsRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:newsstat} = useFetch('http://localhost:3001/api/newsapi/get/newstat');
    const {data:deps} = useFetch('http://localhost:3001/api/newsapi/get/newsdeps');

    const [newsTitle, setNewsTitle] = useState('');
    const [newsDescription, setNewsDescription] = useState('');
    const [newsTitleLangs, setNewsTitleLangs] = useState('');
    const [newsDescriptionLangs, setNewsDescriptionLangs] = useState('');

    const [videoLink, setVideoLink] = useState('');

    const [newsStatus, setNewsStatus] = useState('');
    const [newsStatusId, setNewsStatusId] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [newsImages, setNewsImages] = useState([]);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const files = e.target.files;
        setNewsImages([...newsImages, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        var formData = new FormData();
        formData.append('newsTitle', newsTitle);
        formData.append('newsDescription', newsDescription);
        formData.append('newsTitleLangs', JSON.stringify(newsTitleLangs));
        formData.append('newsDescriptionLangs', JSON.stringify(newsDescriptionLangs));
        formData.append('videoLink', videoLink);
        formData.append('departmentId', departmentId);
        formData.append('newsStatusId', newsStatusId);
        for(var index = 0; index < newsImages.length; index++){
            const file = newsImages[index];
            formData.append('uploads', file);
        }
        handleFormSubmit(formData);
        try{
            const response = await Axios.post('http://localhost:3001/api/newsapi/news/insert', formData, {
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
                setNewsTitle('');
                setNewsTitleLangs('');
                setNewsDescription('');
                setNewsDescriptionLangs('');
                setVideoLink('');
                setDepartmentId('');
                setNewsStatusId('');
                setNewsImages([]);
            } else {
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            }
        } catch (error) {
            console.error('Error registering news:', error);
        }
    }

    const handleDeps = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps.result.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const handleStatus = (e)=>{
        setNewsStatus(e.target.value);
        const selectedStatus = newsstat.result.find((newsstatusitem) => newsstatusitem.news_status_name === e.target.value);
        setNewsStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const removeSelectedFile = (index, event) => {
        event.preventDefault();
        const newFiles = [...newsImages];
        newFiles.splice(index, 1);
        setNewsImages(newFiles);

        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setNewsDescriptionLangs({ "en": newValue });
    };

    const handleTitleChange = (e) => {
        const newValue = e.target.value;
        setNewsTitleLangs({ "en": newValue });
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
        <Typography className='form-heading' variant="h5">სიახლის რეგისტრაცია</Typography>
        <form className='news-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სათაური"
                variant="outlined"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
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
                // value={newsTitle}
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
                value={newsDescription}
                onChange={(e) => setNewsDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="აღწერა en"
                onChange={handleDescriptionChange}
                required
                />
                <TextField
                label="ვიდეო ლინკი"
                variant="outlined"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                // required
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
                        value={newsStatus}
                        onChange={(e) => handleStatus(e)}
                        label="status"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {newsstat &&
                        newsstat.result.map((stat) => (
                            <MenuItem
                            key={stat.id}
                            value={stat.news_status_name}
                            className='select-label'
                            >
                                {stat.news_status_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                        deps.result.map((stat) => (
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
                <label className='news-docs-cont'>
                    <label className='docs-label'>მედია ფაილები</label>
                    <div className="news-spec-select-dropdown">
                        <div className="news-selected-users">
                            {selectedFiles.map((file, index) => (
                                <span key={index} onClick={(event) => removeSelectedFile(index, event)}>
                                    {file.name} &#10005;
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className='doc-add-btn-cont'>
                        <span >ფაილის დამატება: </span>
                        <input type="file" id="uploads" name="uploads" multiple onChange={handleFileChange}/>
                    </div>
                </label>
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
