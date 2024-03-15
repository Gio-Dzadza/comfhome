import React, { useState } from 'react';
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

export default function TeamRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:deps} = useFetch('http://localhost:3001/api/teamapi/get/teamdeps');
    const {data:professions} = useFetch('http://localhost:3001/api/teamapi/get/professions');
    const {data:positions} = useFetch('http://localhost:3001/api/teamapi/get/positions');

    const [selectedFileName, setSelectedFileName] = useState('');

    const [memberName, setMemberName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [experience, setExperience] = useState('');

    const [memberNameLangs, setMemberNameLangs] = useState('');
    const [jobDescriptionLangs, setJobDescriptionLangs] = useState('');
    const [experienceLangs, setExperienceLangs] = useState('');


    const [workFrom, setWorkFrom] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const [position, setPosition] = useState('');
    const [positionId, setPositionId] = useState('');

    const [profession, setProfession] = useState('');
    const [professionId, setProfessionId] = useState('');

    const [memberImage, setMemberImage] = useState(null);

    const context = useAuthContext();

    //fileupload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setMemberImage(file);
        setSelectedFileName(file ? file.name : '');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedService = {
            memberName,
            memberNameLangs,
            professionId,
            positionId,
            jobDescription,
            jobDescriptionLangs,
            experience,
            experienceLangs,
            workFrom,
            departmentId,
            memberImage
        };
        handleFormSubmit(updatedService);

        try{
            const response = await Axios.post('http://localhost:3001/api/teamapi/team/insert', updatedService, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                    'Content-Type': 'multipart/form-data', // Important for file uploads
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setMemberName(''); 
            setMemberNameLangs(''); 
            setJobDescription('');
            setJobDescriptionLangs('');
            setExperience('');
            setExperienceLangs('');
            setWorkFrom('');
            setDepartmentId('');
            setPositionId('');
            setProfessionId('');
            setMemberImage(null);
            setSelectedFileName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering dep:', error);
        }
    };

    const handleDeps = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps.result.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };
    const handlePositions = (e)=>{
        setPosition(e.target.value);
        const selectedPos = positions.result.find((pos) => pos.position_name === e.target.value);
        setPositionId(selectedPos ? selectedPos.id : '');
    };
    const handleProfessions = (e)=>{
        setProfession(e.target.value);
        const selectedProf = professions.result.find((prof) => prof.profession_name === e.target.value);
        setProfessionId(selectedProf ? selectedProf.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handleDescriptionChange = (e) => {
        const newValue = e.target.value;
        setJobDescriptionLangs({ "en": newValue });
    };

    const handleExperienceChange = (e) => {
        const newValue = e.target.value;
        setExperienceLangs({ "en": newValue });
    };

    const handleNameChange = (e) => {
        const newValue = e.target.value;
        setMemberNameLangs({ "en": newValue });
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
        <Typography className='form-heading' variant="h5">თანამშრომლის რეგისტრაცია</Typography>
        <form className='dep-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="სახელი"
                variant="outlined"
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
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
                // value={memberName}
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
                placeholder="სამუშაო აღწერილობა"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                />
                <TextareaAutosize
                style={textareaStyle}
                placeholder="სამუშაო აღწერილობა en"
                // value={jobDescription}
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
                        onChange={(e) => handleDeps(e)}
                        label="dep"
                        required
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
                <FormControl
                    className='news-stat' 
                    variant="outlined" 
                    fullWidth margin="normal"
                >
                    <InputLabel
                        className='input-label'
                    >
                        პოზიცია
                    </InputLabel>
                    <Select
                        value={position}
                        onChange={(e) => handlePositions(e)}
                        label="pos"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {positions &&
                        positions.result.map((pos) => (
                            <MenuItem
                            key={pos.id}
                            value={pos.position_name}
                            className='select-label'
                            >
                                {pos.position_name}
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
                        პროფესია
                    </InputLabel>
                    <Select
                        value={profession}
                        onChange={(e) => handleProfessions(e)}
                        label="prof"
                        required
                        className='select-label'
                    >
                        <MenuItem value="">
                        <em>None</em>
                        </MenuItem>
                        {professions &&
                        professions.result.map((prof) => (
                            <MenuItem
                            key={prof.id}
                            value={prof.profession_name}
                            className='select-label'
                            >
                                {prof.profession_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                label="გამოცდილება"
                variant="outlined"
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
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
                label="გამოცდილება en"
                variant="outlined"
                type="text"
                // value={experience}
                onChange={handleExperienceChange}
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
                label="დასაქმებულია -დან"
                variant="outlined"
                type="date"
                value={workFrom}
                onChange={(e) => setWorkFrom(e.target.value)}
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
