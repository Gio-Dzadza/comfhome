import React, { useEffect, useState } from 'react'
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';

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
import ProfessionsEditForm from './ProfessionsEditForm';


export default function ProfessionsList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const {data:departments} = useFetch('http://localhost:3001/api/profapi/get/deps');

    //for profession's data
    const [selectedProfession, setSelectedProfession] = useState(null);
    const [professionsList, setProfessionsList] = useState([]);

    //states for props
    const [department, setDepartment] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();
    
    //mui
    const [fullNameFilter, setFullNameFilter] = useState('');
    const [departmentNames, setDepartmentNames] = useState([]);
    const [muiFilteredProfessionCount, setMuiFilteredProfessionCount] = useState(0);
    const [pgSize, setPgSize] = useState(5);

    
    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = professionsList && professionsList.map((profession) => [
            profession.profession_name,
            departments.result.find((depitem) => depitem.id === profession.department_id)?.name || '',
            formatDate(profession.created_at ? profession.created_at : ''),
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['პროფესია', 'დეპარტამენტი', 'შექმნილია'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Professions');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'professions.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/profapi/get/professions',
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
                        setProfessionsList(response.data.result);
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
            await Axios.delete(`http://localhost:3001/api/profapi/prof/delete/${id}`, {
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
                    const updatedProfessions = professionsList && professionsList.filter((profession)=> profession.id !== id);
                    setProfessionsList(updatedProfessions);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEdit = (profession) => {
        setSelectedProfession(profession);
        setDepartment(departments.result);
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
    },[departments]);
    
    const columns = [
        {
            field: 'profession_name',
            headerName: 'პროფესია',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            renderCell: (params) => {
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }} 
                        >
                            {params.value}
                        </div>;
            },
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
    

    const filteredRows = professionsList && professionsList.filter((profession) => {
        const depName = departments && departments.result.find((depitem) => depitem.id === profession.department_id)?.name;
        return (
            profession.profession_name.toLowerCase().includes(fullNameFilter.toLowerCase()) ||
            (depName && depName.toLowerCase().includes(departmentNames.toLowerCase()))
        );
    });

return (
    <div className='list'>
        {isPending && <div>Loading professions...</div>}
        {error && <div>{error}</div>}
        {
            selectedProfession && (
                <div className={ selectedProfession ? 'modal-window-show' : 'modal-window' }>
                    <ProfessionsEditForm 
                    profession = {selectedProfession} 
                    setProfessionsList={setProfessionsList}
                    setSelectedProfession = {setSelectedProfession}
                    deps = {department}
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
                        setMuiFilteredProfessionCount(e.rowsMeta.positions.length)
                    }}
                    />
                <div className='counter-export'>
                    {filteredRows && <h5 className='user-counter'>პროფესიები: {muiFilteredProfessionCount}</h5>}
                    <Button onClick={exportToExcel} className='exportXLSX-btn'>
                        Excel
                    </Button>
                </div>
            </>
        )}
    </div>
)
}
