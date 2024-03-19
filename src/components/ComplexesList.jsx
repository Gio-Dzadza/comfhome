import React, { useEffect, useState } from 'react'
import Axios from 'axios';
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

//style
import './UsersList.css'
import '../pages/ListsParentStyles.css';


export default function ComplexesList({ updateList, setUpdateList, setComplex, setEditing }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:districtsList} = useFetch('http://localhost:3001/api/get/districts');
    const [districts, setDistricts] = useState('');
    const [complexes, setComplexes] = useState('');
    const [districtNames, setDistrictNames] = useState([]);
    const [companyFilter] = useState('');
    const [addressFilter] = useState('');


    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);
    const [pgSize, setPgSize] = useState(5);

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/get/complexes',
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
                        const notDeleted = response.data.result.filter(item => item.deleted_at == null);
                        setComplexes(notDeleted);
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

    // console.log(context)

    const handleDelete = async(id)=>{
        try {
            // Delete user from the API
            await Axios.delete(`http://localhost:3001/api/complexes/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }).then((response)=>{
                // console.log(response);
                // if(response.data.auth){
                //     console.log(id + ' ' + response.data);
                // } else{
                //     console.log(id + ' ' + response.data.message);
                //     setAuthenticated(true);
                // };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    // Update the UI
                    const updatedUsers = complexes && complexes.filter((item)=> item.id !== id);
                    setComplexes(updatedUsers);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (complexInfo) => {
        setComplex(complexInfo);
        setEditing(true);
    };

    // const formatDate = (dateString) => {
    //     const options = { 
    //         day: '2-digit',
    //         month: '2-digit',
    //         year: 'numeric',
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         second: '2-digit',
    //     };
    //     const formattedDate = new Date(dateString).toLocaleString('en-GB', options);
    //     return formattedDate;
    // };

    useEffect(()=>{
        const distName = districtsList && districtsList.result.map((distitem) => distitem.district_name);
        setDistrictNames(distName);
    },[districtsList]);
    
    const columns = [
        {
            field: 'address',
            headerName: 'Address',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            renderCell: (params) => {
                const user = params.row;
                return (
                    <Link to={`/userProjects/${user.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                        {params.row.address}
                    </Link>
                );
            },
        },
        {
            field: 'company',
            headerName: 'Company',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: companyFilter, // Use the filter state for this column
        },
        {
            field: 'district_id',
            headerName: 'District',
            flex: 1,
            headerClassName: 'column-headers',
            visible: true,
            type: 'singleSelect',
            // valueOptions: departmentNames,
            // filterValue: departmentNames,
            filterable: true,
            valueGetter: (params) => {
                // console.log(typeof(params.row.district_id))
            const districtName = districtsList && districtsList.result.find(
                (distitem) => distitem.id == params.row.district_id
            );
            return districtName ? districtName.district_name : '';
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
    

    // const filteredRows = complexes && complexes.filter((complex) => {
    //     const districtName = districtsList && districtsList.result.find((distitem) => distitem.id === complex.district_id)?.district_name;
    //     return (
    //         complex && complex.address.toLowerCase().includes(addressFilter.toLowerCase()) ||
    //         complex && complex.company.toLowerCase().includes(companyFilter.toLowerCase()) &&
    //         (districtName && districtName.toLowerCase().includes(districtNames.toLowerCase()))
    //     );
    // });


return (
    <div className='list'>
        {isPending && <div>Loading complexes...</div>}
        {error && <div>{error}</div>}
        {/* {
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
        } */}
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
                    rows={complexes}
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
                {/* <div className='counter-export'>
                    {filteredRows && <h5 className='user-counter'>მომხმარებლები: {muiFilteredUserCount}</h5>}
                    <Button onClick={exportToExcel} className='exportXLSX-btn'>
                        Excel
                    </Button>
                </div> */}
            </>
        )}
    </div>
)
}
