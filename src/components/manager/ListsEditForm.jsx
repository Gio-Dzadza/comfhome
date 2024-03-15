import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import {
    TextField,
    Button,
    Typography,
} from '@mui/material';
import theme from '../Theme';
import { ThemeProvider } from '@mui/material/styles';

export default function ListsEditForm({ selectedItem, setMainList, tableName, setSelectedItem, setFormSubmitted }) {
    const [itemName, setItemName] = useState('');
    const [secondKeyItem, setSecondKeyItem] = useState('');

    const context = useAuthContext();

    useEffect(() => {
        const keys = Object.keys(selectedItem);
        if (keys.length >= 2) {
            const secondKey = keys[1];
            const secondKeyValue = selectedItem[secondKey]; // Get the value using the key
            setItemName(secondKeyValue); // Set the value into the state
            setSecondKeyItem(secondKey);
        }
    }, [selectedItem]);

    const updateItem= async (id, e)=>{
        e.preventDefault();
        try{
            await Axios.put(`http://localhost:3001/api/adminapi/lists/update/${id}`,
            {
                name: itemName,
                tableName
            },
            {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            }
            );
            setMainList(prevList =>
                prevList.map(item => {
                    if (item.id === id) {
                    return {...item, 
                        secondKeyItem
                    };}
                    return item;
                })
            );
            setSelectedItem(null);
            setFormSubmitted(true);
        } catch(error){
            console.error('Error updating item:', error);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        setSelectedItem(null);
    };

    return (
        <div style={{
            marginBottom: '10px'
        }}>
            <form>
                <Typography className='form-heading' variant='h6'>ჩანაწერის ცვლილება</Typography>
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
                    <Button className='close-btn' type='submit' onClick={(e)=>{updateItem(selectedItem.id, e)}} variant="contained">განაახლე</Button>
                    <Button className='close-btn' onClick={(e)=> handleClose(e)} variant="contained" color="primary">
                        დახურვა
                    </Button>
                </div>
            </form>
        </div>
    )
}
