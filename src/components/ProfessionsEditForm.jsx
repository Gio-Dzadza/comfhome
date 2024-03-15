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

export default function ProfessionsEditForm({ profession, setProfessionsList, setSelectedProfession, deps, setUpdateList }) {

    const [professionName, setProfessionName] = useState('');
    const [professionNameLangs, setProfessionNameLangs] = useState('');

    const [department, setDepartment] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    const context = useAuthContext();

    useEffect(()=>{

        setProfessionName(profession.profession_name);
        setProfessionNameLangs(JSON.parse(profession.profession_name_langs));

        deps && deps.map((dep)=>{
                if(dep.id === profession.department_id){
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

    const updateProfessions = async (id, e)=>{
        e.preventDefault();

        try{
            const response = await Axios.put(`http://localhost:3001/api/profapi/prof/update/${id}`, 
            {
                professionName: professionName,
                professionNameLangs: professionNameLangs,
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
                setProfessionsList(prevList =>
                    prevList.map(prof => {
                        if (prof.id === id) {
                        return {...prof,
                            professionName,
                            professionNameLangs,
                            departmentId
                        };}
                        return prof;
                    })
                );
                setUpdateList(true);
            } else{
                const error = await response.data;
                alert('Failed to authenticate: ' + error);
            };
            setSelectedProfession(null);
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
        setSelectedProfession(null);
    };

    const handleProfsNameChange = (e) => {
        const newValue = e.target.value;
        setProfessionNameLangs({ "en": newValue });
    };

    return (
        <Container className='news-reg-form-container' maxWidth="md">
        <Typography className='form-heading' variant="h5">პროფესიის მონაცემების ცვლილება</Typography>
        <form className='news-reg-form'>
            <ThemeProvider theme={theme}> 
                <TextField
                label="პროფესია"
                variant="outlined"
                value={professionName}
                onChange={(e) => setProfessionName(e.target.value)}
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
                label="პროფესია en"
                variant="outlined"
                value={professionNameLangs && professionNameLangs.en}
                onChange={handleProfsNameChange}
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
                        <Button className='news-reg-btn' type="submit" onClick={(e)=>{updateProfessions(profession.id, e)}} variant="contained" color="primary">
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
