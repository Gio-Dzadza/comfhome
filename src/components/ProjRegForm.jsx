import React, { useState } from 'react';
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import './ProjectRegisterForm.css';
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

export default function ProjRegForm({ handleFormSubmit, setShowRegForm }) {

    const {data:type} = useFetch('http://localhost:3001/api/projectapi/get/projecttypes');
    const {data:status} = useFetch('http://localhost:3001/api/projectapi/get/projectstat');
    const {data:dep} = useFetch('http://localhost:3001/api/projectapi/get/projdeps');

    const [projectTitle, setProjectTitle] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectAddress, setProjectAddress] = useState('');

    const [projectTitleLangs, setProjectTitleLangs] = useState('');
    const [projectDescriptionLangs, setProjectDescriptionLangs] = useState('');
    const [projectAddressLangs, setProjectAddressLangs] = useState('');

    const [startedAt, setStartedAt] = useState('');
    const [endedAt, setEndedAt] = useState('');

    const [projectStatus, setProjectStatus] = useState('');
    const [projectStatusId, setProjectStatusId] = useState('');

    const [projectType, setProjectType] = useState('');
    const [projectTypeId, setProjectTypeId] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [projectDocs, setProjectDocs] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const files = e.target.files;
        setProjectDocs([...projectDocs, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        var formData = new FormData();
        formData.append('projectTitle', projectTitle);
        formData.append('projectDescription', projectDescription);
        formData.append('projectAddress', projectAddress);
        formData.append('projectTitleLangs', JSON.stringify(projectTitleLangs));
        formData.append('projectDescriptionLangs', JSON.stringify(projectDescriptionLangs));
        formData.append('projectAddressLangs', JSON.stringify(projectAddressLangs));
        formData.append('startedAt', startedAt);
        formData.append('endedAt', endedAt);
        formData.append('projectTypeId', projectTypeId);
        formData.append('projectStatusId', projectStatusId);
        formData.append('departmentId', departmentId);
        for(var index = 0; index < projectDocs.length; index++){
            const file = projectDocs[index];
            formData.append('uploads', file);
        }
        handleFormSubmit(formData);
        try{
            const response = await Axios.post('http://localhost:3001/api/projectapi/projects/insert', formData, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
            console.log(response);
        if (response.status === 200) {
            const data = await response.data;
            console.log(data);
            handleFormSubmit(); 
            setProjectTitle('');
            setProjectDescription('');
            setProjectAddress('');
            setProjectTitleLangs('');
            setProjectDescriptionLangs('');
            setProjectAddressLangs('');
            setDepartmentId('');
            setStartedAt('');
            setEndedAt('');
            setDepartment('');
            setProjectTypeId('');
            setProjectStatusId('');
            setProjectDocs([]);
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering project:', error);
        }
    }

    const handleTypes = (e)=>{
        setProjectType(e.target.value);
        const selectedType = type && type.result.find((project_type) => project_type.project_type_name === e.target.value);
        setProjectTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setProjectStatus(e.target.value);
        const selectedStatus = status && status.result.find((project_status) => project_status.project_status_name === e.target.value);
        setProjectStatusId(selectedStatus ? selectedStatus.id : '');
    };

    const handleDeps = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = dep && dep.result.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const removeSelectedFile = (index, event) => {
        event.preventDefault();
        const newFiles = [...projectDocs];
        newFiles.splice(index, 1);
        setProjectDocs(newFiles);

        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handleTitleChange = (e) => {
        const newValue = e.target.value;
        setProjectTitleLangs({ "en": newValue });
    };
    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setProjectDescriptionLangs({ "en": newValue });
    };
    const handleAddressChange = (e) => {
        const newValue = e.target.value;
        setProjectAddressLangs({ "en": newValue });
    };

    const textareaStyle = {
        width: '97%',
        padding: '8px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        // resize: 'none',
        marginBottom: '10px',
        resize: 'both',
        overflow: 'auto',
    };

    return (
        <Container className='project-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">ახალი პროექტის რეგისტრაცია</Typography>
        <form className='project-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროექტის სახელი"
                variant="outlined"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                fullWidth
                margin="normal"
                className='proj-name'
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                }}
                />
                <TextField
                label="პროექტის სახელი en"
                variant="outlined"
                // value={projectTitle}
                onChange={handleTitleChange}
                required
                fullWidth
                margin="normal"
                className='proj-name'
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
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="აღწერა en"
                // value={projectDescription}
                onChange={handleDescriptionChange}
                required
                />
                <TextField
                label="მისამართი"
                variant="outlined"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
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
                label="მისამართი en"
                variant="outlined"
                // value={projectAddress}
                onChange={handleAddressChange}
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
                label="დაწყების თარიღი"
                variant="outlined"
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                    shrink: true, // This will remove the placeholder
                }}
                />
                <TextField
                label="დასრულების თარიღი"
                variant="outlined"
                type="date"
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
                required
                fullWidth
                margin="normal"
                InputProps={{
                    className: 'input-label',
                }}
                InputLabelProps={{
                    className:'input-label',
                    shrink: true, // This will remove the placeholder
                }}
                />
                <FormControl
                    className='proj-name' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        პროექტის ტიპი
                    </InputLabel>
                    <Select
                        value={projectType}
                        onChange={(e) => handleTypes(e)}
                        label="type"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {type &&
                        type.result.map((type) => (
                            <MenuItem
                            key={type.id}
                            value={type.project_type_name}
                            className='select-label'
                            >
                                {type.project_type_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl
                    className='proj-stat' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        პროექტის სტატუსი
                    </InputLabel>
                    <Select
                        value={projectStatus}
                        onChange={(e) => handleStatus(e)}
                        label="client"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {status &&
                        status.result.map((stat) => (
                            <MenuItem
                            key={stat.id}
                            value={stat.project_status_name}
                            className='select-label'
                            >
                                {stat.project_status_name}
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
                        {dep &&
                        dep.result.map((stat) => (
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
                <label className='project-docs-cont'>
                    <label className='docs-label'>ფაილები</label>
                    <div className="proj-spec-select-dropdown">
                        <div className="proj-selected-users">
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
                    <div className='project-reg-btn-cont'>
                        <Button className='project-reg-btn' type="submit" variant="contained" color="primary">
                            რეგისტრაცია
                        </Button>
                    </div>
                    <div className='proj-close-btn-cont' >
                        <Button className='proj-close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                            ფორმის დახურვა
                        </Button>
                    </div>
                </div>
            </ThemeProvider>
        </form>
    </Container>
)
}
