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
} from '@mui/material';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function PositionsRegisterForm({ handleFormSubmit, setShowRegForm }) {

    const {data:deps} = useFetch('http://localhost:3001/api/posapi/get/deps');

    const [positionName, setPositionName] = useState('');
    const [positionNameLangs, setPositionNameLangs] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const context = useAuthContext();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try{
            const response = await Axios.post('http://localhost:3001/api/posapi/pos/insert',
            {
                positionName: positionName,
                positionNameLangs: positionNameLangs,
                departmentId: departmentId
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            });
            console.log(response)
            if (response.status === 200) {
                const data = await response.data;
                console.log(data);
                handleFormSubmit(); 
                setPositionName('');
                setPositionNameLangs('');
                setDepartmentId('');
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

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };

    const handlePosNameChange = (e) => {
        const newValue = e.target.value;
        setPositionNameLangs({ "en": newValue });
    };

    return (
        <Container className='news-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">პოზიციის რეგისტრაცია</Typography>
        <form className='news-reg-form' onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პოზიცია"
                variant="outlined"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
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
                label="პოზიცია en"
                variant="outlined"
                // value={newsTitle}
                onChange={handlePosNameChange}
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
