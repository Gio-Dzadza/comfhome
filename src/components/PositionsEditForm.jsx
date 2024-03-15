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
} from '@mui/material';

import theme from './Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function PositionsEditForm({ position, setPositionsList, setSelectedPosition, deps, setUpdateList }) {

    const [positionName, setPositionName] = useState('');
    const [positionNameLangs, setPositionNameLangs] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const context = useAuthContext();

    useEffect(()=>{

        setPositionName(position.position_name);
        setPositionNameLangs(JSON.parse(position.position_name_langs));

        deps && deps.map((dep)=>{
                if(dep.id === position.department_id){
                    setDepartment(dep.name);
                }
            }
        );

    },[deps]);

    useEffect(()=>{

        if(department){
            const selectedDepartment = deps.find((dep) => dep.name === department);
            setDepartmentId(selectedDepartment ? selectedDepartment.id : '');
        };

    },[department]);

    const updatePositions = async (id, e)=>{
        e.preventDefault();

        try{
            const response = await Axios.put(`http://localhost:3001/api/posapi/pos/update/${id}`, 
            {
                positionName: positionName,
                positionNameLangs: positionNameLangs,
                departmentId: departmentId
            },
            {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }
            );
            if(response.status === 200) {
                // console.log(response);
                setPositionsList(prevList =>
                    prevList.map(pos => {
                        if (pos.id === id) {
                        return {...pos,
                            positionName,
                            positionNameLangs,
                            departmentId
                        };}
                        return pos;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedPosition(null);
        } catch(error){
            console.error('Error updating news:', error);
        }
    };

    const handleDep = (e)=>{
        setDepartment(e.target.value);
        const selectedDep = deps.find((dep) => dep.name === e.target.value);
        setDepartmentId(selectedDep ? selectedDep.id : '');
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedPosition(null);
    };

    const handlePosNameChange = (e) => {
        const newValue = e.target.value;
        setPositionNameLangs({ "en": newValue });
    };

    return (
        <Container className='news-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">პოზიციის მონაცემების ცვლილება</Typography>
        <form className='news-reg-form'>
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
                value={positionNameLangs && positionNameLangs.en}
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
                <div className='reg-close-btns-cont'>
                    <div className='news-reg-btn-cont'>
                        <Button className='news-reg-btn' type="submit" onClick={(e)=>{updatePositions(position.id, e)}} variant="contained" color="primary">
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
