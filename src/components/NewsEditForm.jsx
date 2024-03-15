import React, { useCallback, useEffect, useState } from 'react';
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

export default function NewsEditForm({ news, setNewsList, setSelectedNews, deps, newsStatuses, setUpdateList }) {

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
    
    const handleFileChange = (e) => {
        const files = e.target.files;
        setNewsImages((prevDocs) => [...prevDocs, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    };

    const fetchFiles = useCallback (async () => {
        try {
        const response = await Axios.get(`http://localhost:3001/api/news/${news.id}/files`);
        const fileNames = response.data.files;
    
        // Fetch the file data for each file name
        const filePromises = fileNames.map((fileName) =>
            Axios.get(`http://localhost:3001/api/news/${news.id}/files/${fileName}`, {
            responseType: 'blob', // Tell Axios to treat the response as a binary blob
            })
        );
        // Wait for all file data requests to complete
        const fileResponses = await Promise.all(filePromises);
        // Extract the file data and create File objects
        const fileObjects = fileResponses.map((fileResponse, index) => {
            const file = new File([fileResponse.data], fileNames[index]);
            return file;
        });
        setNewsImages((prevDocs) => [...Array.from(fileObjects)]);
        
        setSelectedFiles((prevSelectedFiles) => [...Array.from(fileNames)]);
        } catch (error) {
        console.error('Error fetching files:', error);
        }
    },[news]) 

    useEffect(()=>{
        fetchFiles();

        setNewsTitle(news.title);
        setNewsDescription(news.news_description);
        setNewsTitleLangs(JSON.parse(news.title_langs));
        setNewsDescriptionLangs(JSON.parse(news.news_description_langs));
        setVideoLink(news.video_link ? news.video_link : '');

        deps && deps.forEach((dep)=>{
                if(dep.id === news.department_id){
                    setDepartment(dep.name);
                }
            }
        );

        newsStatuses && newsStatuses.forEach((statusofnews)=>{
                if(statusofnews.id === news.news_status_id){
                    setNewsStatus(statusofnews.news_status_name);
                }
            }
        );

    },[deps, newsStatuses, fetchFiles, news]);

    useEffect(()=>{

        if(newsStatus){
            const selectedNewsStatus = newsStatuses.find((statitem) => statitem.news_status_name === newsStatus);
            setNewsStatusId(selectedNewsStatus ? selectedNewsStatus.id : '');
        };

        if(department){
            const selectedDepartment = deps.find((dep) => dep.name === department);
            setDepartmentId(selectedDepartment ? selectedDepartment.id : '');
        };

    },[department, newsStatus, newsStatuses, deps]);

    const updateNews = async (id, e)=>{
        e.preventDefault();
        var formData = new FormData();
        formData.append('newsTitle', newsTitle);
        formData.append('newsDescription', newsDescription);
        formData.append('newsTitleLangs', JSON.stringify(newsTitleLangs));
        formData.append('newsDescriptionLangs', JSON.stringify(newsDescriptionLangs));
        formData.append('videoLink', videoLink);
        formData.append('newsStatusId', newsStatusId);
        formData.append('departmentId', departmentId);
        for(var index = 0; index < newsImages.length; index++){
            const file = newsImages[index];
            formData.append('uploads', file);
        }

        try{
            const response = await Axios.put(`http://localhost:3001/api/newsapi/news/update/${id}`, formData,
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            if(response.status === 200) {
                setNewsList(prevList =>
                    prevList.map(news => {
                        if (news.id === id) {
                        return {...news,
                            newsTitle,
                            newsTitleLangs,
                            newsDescription,
                            newsDescriptionLangs,
                            videoLink,
                            newsStatusId,
                            departmentId
                        };}
                        return news;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedNews(null);
        } catch(error){
            console.error('Error updating news:', error);
        }
    };

    const handleStatus = (e)=>{
        setNewsStatus(e.target.value);
        const selectedStatus = newsStatuses && newsStatuses.find((news_statusitem) => news_statusitem.news_status_name === e.target.value);
        setNewsStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleDep = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const removeSelectedFile = (index, event, file) => {
        event.preventDefault();

        if(typeof(file) === 'string'){
            deleteFile(file);
        } else{
            console.log('not string');
        };

        // Rest of your code to update state and UI
        const newFiles = [...newsImages];
        newFiles.splice(index, 1);
        setNewsImages(newFiles);
    
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    };

    const deleteFile = async (file)=>{
        const encodedFilename = encodeURIComponent(file.trim());
        try{
            await Axios.delete(`http://localhost:3001/api/news/delete/${news.id}/${encodedFilename}`)
            //console.log(response.data);
        } catch(error){
            console.error('Error fetching files:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedNews(null);
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
        <Typography className='form-heading' variant="h5">სიახლის მონაცემების ცვლილება</Typography>
        <form className='news-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სათაური"
                variant="outlined"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
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
                value={newsTitleLangs && newsTitleLangs.en}
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
                value={newsDescription}
                onChange={(e) => setNewsDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                placeholder="შესახებ en"
                style={textareaStyle}
                value={newsDescriptionLangs && newsDescriptionLangs.en}
                onChange={handleDescriptionChange}
                required
                />
                <TextField
                label="ვიდეო ლინკი"
                variant="outlined"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
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
                        onChange={(e)=> handleStatus(e)}
                        label="client"
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {newsStatuses &&
                        newsStatuses.map((stat) => (
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
                        onChange={(e)=> handleDep(e)}
                        label="client"
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {deps &&
                        deps.map((dep) => (
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
                <label className='news-docs-cont'>
                    <label className='docs-label'>მედია ფაილები</label>
                    <div className="news-spec-select-dropdown">
                        <div className="news-selected-users">
                            {selectedFiles.map((file, index) => (
                                <span key={index} onClick={(event) => {removeSelectedFile(index, event, file)}}>
                                    {typeof(file) === 'string' ? file : file.name} &#10005;
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className='doc-add-btn-cont'>
                        <span >ფილის დამატება: </span>
                        <input type="file" id="uploads" name="uploads" multiple onChange={handleFileChange}/>
                    </div>
                </label>
                <div className='reg-close-btns-cont'>
                    <div className='news-reg-btn-cont'>
                        <Button className='news-reg-btn' type="submit" onClick={(e)=>{updateNews(news.id, e)}} variant="contained" color="primary">
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
