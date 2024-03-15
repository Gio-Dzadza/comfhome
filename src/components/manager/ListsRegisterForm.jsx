import React, { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import Axios from 'axios';
import {
    TextField,
    Button,
    Typography,
} from '@mui/material';
import theme from '../Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function ListsRegisterForm({ handleFormSubmit, tableName, setShowRegForm }) {
    const [itemName, setItemName] = useState('');
    const context = useAuthContext();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedItem = {
            name: itemName,
            tableName
        };
        handleFormSubmit(updatedItem);

        try{
            const response = await Axios.post('http://localhost:3001/api/adminapi/lists/insert', updatedItem, {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            handleFormSubmit(); 
            setItemName('');
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    }

    const handleClose = (e) => {
        e.preventDefault();
        setShowRegForm(false);
    };
    return (
        <div style={{
            marginBottom: '10px'
        }}>
            <form onSubmit={handleSubmit}>
                <Typography variant='h6' className='form-heading'>ჩანაწერის დამატება</Typography>
                <ThemeProvider theme={theme}>
                    <TextField
                        label="სახელი"
                        variant="outlined"
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
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
                </ThemeProvider>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                }}>
                    <Button className='close-btn' type='submit' variant="contained">დაარეგისტრირე</Button>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        დახურვა
                    </Button>
                </div>
            </form>
        </div>
    )
}
