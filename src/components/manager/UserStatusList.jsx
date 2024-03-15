import React, { useEffect, useState } from 'react';
import ListsEditForm from './ListsEditForm';
import { useListsDelete } from '../../hooks/useListsDelete';
import ListsRegisterForm from './ListsRegisterForm';
import { DataGrid } from '@mui/x-data-grid';
import '../../pages/manage/ListManager.css';
import {
    Button,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import theme from '../Theme';
import { ThemeProvider } from '@mui/material/styles';


export default function UserStatusList({ userStatusList, setUserStatusesUrl }) {
    const [tableName, setTableName] = useState(null);
    const [mainList, setMainList] = useState([]);
    const [showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);

    const {data:status, deleteItem} = useListsDelete(mainList, setMainList);

    useEffect(() => {
        if (formSubmitted) {
            setUserStatusesUrl('http://localhost:3001/api/adminapi/get/userStatuses?timestamp=' + Date.now());
            setFormSubmitted(false);
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(userStatusList){
            setTableName('user_status');
            setMainList(userStatusList);
        }
    },[userStatusList])
    
    const handleDelete = async (id) => {
        // Call the delete function from the custom hook
        await deleteItem(id, tableName, mainList, setMainList);
    };

    const handleEdit = (status) => {
        setSelectedItem(status);
    };

    const handleFormSubmit = () => {
        setFormSubmitted(true);
        setShowRegForm(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 100 },
        { field: 'User_Status_Name', headerName: 'სტატუსი', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <div>
                    <IconButton onClick={() => handleEdit(params.row)} color="warning">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

return (
    <div className='table'>
        <h2>მომხმარებლის სტატუსები</h2>
        {
            selectedItem &&
            <ListsEditForm
            selectedItem = {selectedItem} 
            setMainList={setMainList}
            setSelectedItem = {setSelectedItem}
            tableName = {tableName}
            />
        }
        {
            showRegForm && (
                <ListsRegisterForm handleFormSubmit = {handleFormSubmit} tableName = {tableName} setShowRegForm={setShowRegForm}/>
            )
        }
        <ThemeProvider theme={theme}>
            <Button style={{marginBottom: '10px'}} onClick={() => setShowRegForm(!showRegForm)} variant='contained'>დაამატე</Button>
        </ThemeProvider>
        <DataGrid
        rows={mainList}
        columns={columns}
        autoHeight
        pageSize={10}
        />
    </div>
)
}
