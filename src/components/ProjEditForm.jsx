import React, { useEffect, useState, useCallback } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import './ProjectRegisterForm.css';
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

export default function ProjEditForm({ project, setProjectsList, setSelectedProject, type, status, deps, userState, setUpdateList }) {

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
    
    const handleFileChange = (e) => {
        const files = e.target.files;
        setProjectDocs((prevDocs) => [...prevDocs, ...Array.from(files)]);
        setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    };

    const fetchFiles = useCallback(async () => {
        try {
        const response = await Axios.get(`http://localhost:3001/api/proj/${project.id}/files`);
        const fileNames = response.data.files;
    
        // Fetch the file data for each file name
        const filePromises = fileNames.map((fileName) =>
            Axios.get(`http://localhost:3001/api/proj/${project.id}/files/${fileName}`, {
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
        setProjectDocs((prevDocs) => [...Array.from(fileObjects)]);
        
        setSelectedFiles((prevSelectedFiles) => [...Array.from(fileNames)]);
        } catch (error) {
        console.error('Error fetching files:', error);
        }
    }, [project]); 

    useEffect(()=>{
        fetchFiles();

        setProjectTitle(project.title);
        setProjectDescription(project.project_description);
        setProjectAddress(project.project_address);

        setProjectTitleLangs(project.title_langs ? JSON.parse(project.title_langs) : '');
        setProjectDescriptionLangs(project.project_description_langs ? JSON.parse(project.project_description_langs) : '');
        setProjectAddressLangs(project.project_address_langs ? JSON.parse(project.project_address_langs) : '');

        type && type.forEach((typeofproject)=>{
                if(typeofproject.id === project.project_type_id){
                    setProjectType(typeofproject.project_type_name);
                }
            }
        );

        status && status.forEach((statusofproject)=>{
                if(statusofproject.id === project.project_status_id){
                    setProjectStatus(statusofproject.project_status_name);
                }
            }
        );

        deps && deps.forEach((dep)=>{
            if(dep.id === project.department_id){
                setDepartment(dep.name);
            }
        });

        const originalDate = new Date(project.started_at);
        const year = originalDate.getFullYear();
        const month = String(originalDate.getMonth() + 1).padStart(2, '0');
        const day = String(originalDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setStartedAt(formattedDate);

        const originalEndDate = new Date(project.ended_at);
        const yearEnd = originalEndDate.getFullYear();
        const monthEnd = String(originalEndDate.getMonth() + 1).padStart(2, '0');
        const dayEnd = String(originalEndDate.getDate()).padStart(2, '0');
        const formattedEndDate = `${yearEnd}-${monthEnd}-${dayEnd}`;
        setEndedAt(formattedEndDate);
    },[deps, status, type, project, fetchFiles]);

    useEffect(()=>{
        if(projectType){
            const selectedType = type.find((type) => type.project_type_name === projectType);
            setProjectTypeId(selectedType ? selectedType.id : '');
        };

        if(projectStatus){
            const selectedStatus = status.find((status) => status.project_status_name === projectStatus);
            setProjectStatusId(selectedStatus ? selectedStatus.id : '');
        };

        if(department){
            const selectedDepartment = deps.find((dep) => dep.name === department);
            setDepartmentId(selectedDepartment ? selectedDepartment.id : '');
        };

    },[department, projectType, projectStatus, status, type, deps ]);

    const updateProject = async (id, e)=>{
        e.preventDefault();
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
        try{
            const response = await Axios.put(`http://localhost:3001/api/projectapi/projects/update/${id}`, formData,
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            }
            );
            if(response.status === 200) {
                // console.log(response);
                setProjectsList(prevList =>
                    prevList.map(project => {
                        if (project.id === id) {
                        return {...project, 
                            projectTitle,
                            projectTypeId,
                            projectStatusId,
                            projectDocs,
                            startedAt,
                            endedAt,
                            departmentId,
                            projectDescription,
                            projectTitleLangs,
                            projectDescriptionLangs,
                            projectAddressLangs
                        };}
                        return project;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedProject(null);
        } catch(error){
            console.error('Error updating project:', error);
        }
    };

    const handleTypes = (e)=>{
        setProjectType(e.target.value);
        const selectedType = type.find((project_type) => project_type.project_type_name === e.target.value);
        setProjectTypeId(selectedType ? selectedType.id : '');
    };

    const handleStatus = (e)=>{
        setProjectStatus(e.target.value);
        const selectedStatus = status.find((project_status) => project_status.project_status_name === e.target.value);
        setProjectStatusId(selectedStatus ? selectedStatus.id : '');
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
        const newFiles = [...projectDocs];
        newFiles.splice(index, 1);
        setProjectDocs(newFiles);
    
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    };

    const deleteFile = async (file)=>{
        const encodedFilename = encodeURIComponent(file.trim());
        try{
            await Axios.delete(`http://localhost:3001/api/proj/delete/${project.id}/${encodedFilename}`);
            //console.log(response.data);
        } catch(error){
            console.error('Error fetching files:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedProject(null);
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
        <Typography className='form-heading' variant="h5">პროექტის მონაცემების ცვლილება</Typography>
        <form className='project-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროექტის სახელი"
                variant="outlined"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
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
                value={projectTitleLangs && projectTitleLangs.en}
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
                value={projectDescriptionLangs && projectDescriptionLangs.en}
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
                value={projectAddressLangs && projectAddressLangs.en}
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
                        type.map((type) => (
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
                        status.map((stat) => (
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
                        onChange={(e) => handleDep(e)}
                        label="dep"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {deps &&
                        deps.map((stat) => (
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
                                <span key={index} onClick={(event) => {removeSelectedFile(index, event, file)}}>
                                    {typeof(file) === 'string' ? file : file.name} &#10005;
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
                        <Button className='project-reg-btn' type="submit" onClick={(e)=>{updateProject(project.id, e)}} variant="contained" color="primary">
                            განახლება
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
