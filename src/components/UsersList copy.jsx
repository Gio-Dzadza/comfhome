import React, { useEffect, useState } from 'react'
import Axios from 'axios';
import EditForm from './EditForm';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomToolbar from './CustomToolbar';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';

//image
import UserImg from '../assets/icons/user.png';

//style
import './UsersList.css'
import '../pages/ListsParentStyles.css';


export default function UsersList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:type} = useFetch('http://localhost:3001/api/get/type');
    const {data:departments} = useFetch('http://localhost:3001/api/depapi/get/deps');
    const {data:status} = useFetch('http://localhost:3001/api/get/status');

    //for user's data
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersList, setUsersList] = useState([]);

    //states for props
    const [types, setTypes] = useState([]);
    const [department, setDepartment] = useState([]);
    const [statuses, setStatuses] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();
    
    //mui
    const [fullNameFilter] = useState('');
    const [emailFilter] = useState('');
    const [departmentNames, setDepartmentNames] = useState([]);
    const [typesNames, setTypesNames] = useState([]);
    const [statusNames, setStatusNames] = useState([]);
    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);
    const [pgSize, setPgSize] = useState(5);

    
    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = usersList && usersList.map((user) => [
            user.firstname + ' ' + user.lastname,
            user.email,
            departments.result.find((depitem) => depitem.id === user.department_id)?.name || '',
            type.find((typeitem) => typeitem.id === user.type_id)?.type_name || '',
            status.find((statitem) => statitem.id === user.status_id)?.status_name || '',
            formatDate(user.created_at ? user.created_at : ''),
            user.changed_at ? formatDate(user.changed_at) : 'ცვლილება არ განხორციელებულა',
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სრული სახელი', 'Email', 'დეპარტამენტი', 'მომხმარებლის ტიპი', 'მომხმარებლის სტატუსი', 'შექმნილია', 'ცვლილება განხორციელდა'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/get',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userAccessToken, // Include the token in the headers
                    },
                }
                ).then((response)=>{
                    // console.log(response)
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setUsersList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from users");
        }
    };

    useEffect(()=>{
        const controller = new AbortController();
        if(updateList){
            const signal = { signal: controller.signal }
            fetchData(signal);
            setUpdateList(false);
        } else {
            fetchData();
        };
        return ()=>{
            controller.abort();
        }
    },[context, updateList, setUpdateList]);

    const handleDelete = async(id)=>{
        try {
            // Delete user from the API
            await Axios.delete(`http://localhost:3001/api/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }).then((response)=>{
                console.log(response);
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    // Update the UI
                    const updatedUsers = usersList && usersList.filter((user)=> user.id !== id);
                    setUsersList(updatedUsers);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setTypes(type);
        setDepartment(departments.result);
        setStatuses(status);
    };

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };
        const formattedDate = new Date(dateString).toLocaleString('en-GB', options);
        return formattedDate;
    };

    useEffect(()=>{
        const depName = departments && departments.result.map((depitem) => depitem.name);
        setDepartmentNames(depName);
        const statusName = status && status.map((statitem) => statitem.status_name);
        setStatusNames(statusName);
        const typeName = type && type.map((typeitem) => typeitem.type_Name);
        setTypesNames(typeName);
    },[departments, status, type]);
    
    const columns = [
        {
            field: 'image',
            headerName: 'ფოტო',
            flex: 1,
            headerClassName: 'column-headers',
            renderCell: (params) => (
                params.row.image ? (
                    <div className='user-image-container'>
                    <img
                        src={`http://localhost:3001/uploads/users/${params.row.id}/${encodeURIComponent(params.row.image.trim())}`}
                        alt="User Image"
                        className='user-image'
                    />
                    </div>
                ) : 
                <div className='user-image-container'>
                    <img
                        src={UserImg}
                        alt="User Image"
                        className='user-image'
                    />
                </div>
            ),
        }, 
        {
            field: 'LastName',
            headerName: 'სახელი გვარი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            renderCell: (params) => {
                const user = params.row;
                return (
                    <Link to={`/userProjects/${user.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        {params.row.firstname + ' ' + params.row.lastname}
                    </Link>
                );
            },
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: emailFilter, // Use the filter state for this column
        },
        {
            field: 'Department',
            headerName: 'დეპარტამენტი',
            flex: 1,
            headerClassName: 'column-headers',
            visible: true,
            type: 'singleSelect',
            valueOptions: departmentNames,
            filterValue: departmentNames,
            filterable: true,
            valueGetter: (params) => {
            const depName = departments && departments.result.find(
                (depitem) => depitem.id === params.row.department_id
            );
            return depName ? depName.name : '';
            },
        },
        {
            field: 'Type',
            headerName: 'ტიპი',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'singleSelect',
            valueOptions: typesNames,
            valueGetter: (params) => {
            const typeName = type && type.find(
                (typeitem) => typeitem.id === params.row.type_id
            );
            return typeName ? typeName.type_name : '';
            },
            visible: false,
        },
        {
            field: 'Status',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'singleSelect',
            valueOptions: statusNames,
            valueGetter: (params) => {
            const statusName = status && status.find(
                (statitem) => statitem.id === params.row.status_id
            );
            return statusName ? statusName.status_name : '';
            },
            visible: false,
        },
        {
            field: 'created_at',
            headerName: 'შექმნილია',
            flex: 1,
            headerClassName: 'column-headers',
            type: 'date',
            valueGetter: (params) => {
                return params.row.created_at ? new Date(params.row.created_at) : null;
            },
            valueFormatter: (params) => {
                const dateValue = params.value; // The value returned by the valueGetter
                if (dateValue) {
                    const day = dateValue.getDate().toString().padStart(2, '0');
                    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
                    const year = dateValue.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                return '';
            },
        },
        {
            field: 'changed_at',
            headerName: 'ცვლილება',
            flex: 1,
            headerClassName: 'column-headers',
            visible: false,
            type: 'date',
            valueGetter: (params) => {
                return params.row.changed_at !== 'სტატუსი არ შეცვლილა' && params.row.changed_at
                ? new Date(params.row.changed_at)
                : null;
            },
            valueFormatter: (params) => {
              const dateValue = params.value; // The value returned by the valueGetter
                if (dateValue instanceof Date) {
                    const day = dateValue.getDate().toString().padStart(2, '0');
                    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
                    const year = dateValue.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                return dateValue || 'სტატუსი არ შეცვლილა';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.5,
            headerClassName: 'column-headers',
            cellClassName: 'custom-cell',
            renderCell: (params) => (
                <div className='actions-container'>
                    <IconButton onClick={() => handleEdit(params.row)} color='blue' >
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color='blue' style={{ opacity: 0.3 }}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];
    

    const filteredRows = usersList && usersList.filter((user) => {
        const depName = departments && departments.result.find((depitem) => depitem.id === user.department_id)?.name;
        const typeName = type && type.find((typeitem) => typeitem.id === user.type_id)?.type_name;
        const statusName = status && status.find((statitem) => statitem.id === user.status_id)?.status_name;
        return (
            user.firstname.toLowerCase().includes(fullNameFilter.toLowerCase()) ||
            user.lastname.toLowerCase().includes(fullNameFilter.toLowerCase()) &&
            user.email.toLowerCase().includes(emailFilter.toLowerCase()) &&
            (depName && depName.toLowerCase().includes(departmentNames.toLowerCase())) &&    
            (typeName && typeName.toLowerCase().includes(typesNames.toLowerCase())) &&
            (statusName && statusName.toLowerCase().includes(statusNames.toLowerCase()))
        );
    });


return (
    <div className='list'>
        {isPending && <div>Loading users...</div>}
        {error && <div>{error}</div>}
        {
            selectedUser && (
                <div className={ selectedUser ? 'modal-window-show' : 'modal-window' }>
                    <EditForm 
                    user = {selectedUser} 
                    setUsersList={setUsersList}
                    setSelectedUser = {setSelectedUser}
                    type = {types}
                    status = {statuses}
                    department = {department}
                    setUpdateList = {setUpdateList}
                    />
                </div>
            )
        }
        {
            authenticated && (
                <div>
                    <h1>You are not permittied You need authentication</h1>
                </div>
            )
        }
        {!authenticated && (
            <>
                <DataGrid
                    sx={{
                        boxShadow: 2,
                        border: 2,
                        borderColor: '#d5d5d5',
                        '& .MuiDataGrid-cell:hover': {
                            color: '#fda41c',
                        },
                    }}
                    rows={filteredRows}
                    columns={columns}
                    autoHeight
                    rowsPerPageOptions = {[5,10,20]}
                    pageSize={pgSize}
                    onPageSizeChange={(newPageSize)=> setPgSize(newPageSize)}
                    pagination
                    localeText={{
                        toolbarDensity: 'რიგების ზომა',
                        toolbarDensityComfortable: 'კომფორტული',
                        toolbarDensityCompact: 'კომპაქტური',
                        toolbarDensityStandard: 'სტანდარტული',
                        
                        toolbarExport: 'ექსპორტი',
                        toolbarExportPrint: 'ამობეჭდვა',
                        toolbarExportCSV: 'CSV ფორმატი',

                        toolbarFilters: 'ფილტრები',
                        filterPanelOperator: 'ფილტრი',
                        filterPanelOperatorAnd: 'And',
                        filterPanelOperatorOr: 'Or',
                        filterPanelColumns: 'სვეტები',
                        filterPanelInputLabel: 'მიშვნელობა',
                        filterPanelInputPlaceholder: 'ჩაწერე',
                        filterOperatorContains: 'შეიცავს',
                        filterOperatorEquals: 'უდრის',
                        filterOperatorStartsWith: 'იწყება',
                        filterOperatorEndsWith: 'მთავრდება',
                        filterOperatorIsEmpty: 'ცარიელია',
                        filterOperatorIsNotEmpty: 'არ არის ცარიელი',
                        filterOperatorIsAnyOf: 'რომელიმეს შეიცავს',

                        toolbarColumns: 'სვეტები',
                        columnsPanelTextFieldLabel: 'სვეტის ძიება',
                        columnsPanelShowAllButton: 'აჩვენე ყველა',
                        columnsPanelHideAllButton: 'დამალე ყველა',
                        columnsPanelTextFieldPlaceholder: 'სვეტის სახელი',

                        toolbarQuickFilterPlaceholder: 'ძიება',

                        columnMenuLabel: 'Menu',
                        columnMenuShowColumns: 'აჩვენე სვეტი',
                        columnMenuManageColumns: 'სვეტების მართვა',
                        columnMenuFilter: 'ფილტრი',
                        columnMenuHideColumn: 'დამალე სვეტი',
                        columnMenuUnsort: 'Unsort',
                        columnMenuSortAsc: 'დაალაგე ზრდადობის მიხედვით',
                        columnMenuSortDesc: 'დაალაგე კლებადობის მიხედვით',
                    }}   
                    components={{
                        Toolbar:  CustomToolbar,
                    }}
                    onStateChange={(e) => {
                        setMuiFilteredUserCount(e.rowsMeta.positions.length)
                    }}
                    />
                <div className='counter-export'>
                    {filteredRows && <h5 className='user-counter'>მომხმარებლები: {muiFilteredUserCount}</h5>}
                    <Button onClick={exportToExcel} className='exportXLSX-btn'>
                        Excel
                    </Button>
                </div>
            </>
        )}
    </div>
)
}
