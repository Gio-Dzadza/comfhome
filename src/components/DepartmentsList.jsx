import React, { useCallback, useEffect, useState } from 'react'
import Axios from 'axios';
import DepartmentEditForm from './DepartmentEditForm';
import { useAuthContext } from '../hooks/useAuthContext';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomToolbar from './CustomToolbar';

//styles
import './DepList.css'
import DepImg from '../assets/icons/pentagon.png';
import '../pages/ListsParentStyles.css';


export default function DepartmentsList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    //for user's data
    const [selectedDep, setSelectedDep] = useState(null);
    const [departmentsList, setDepartmentsList] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchTerm] = useState('');
    const [searchByName] = useState('');
    const [searchByDescription] = useState('');
    const [searchByTitle] = useState('');

    //date pick
    const [createDateFilter] = useState({ start: null, end: null });
    const [changeDateFilter] = useState({ start: null, end: null });

    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);


    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = departmentsList.map((dep) => [
            dep.name,
            dep.description, dep.title,
            formatDate(dep.created_at ? dep.created_at : ''),
            formatDate(dep.changed_at ? dep.changed_at : ''),
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['დეპარტამენტი', 'აღწერა', 'სათაური', 'შექმნილია', 'ცვლილება განხორციელდა'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Deps');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deps.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };


    const fetchData = useCallback(async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/depapi/get/deps',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userAccessToken, // Include the token in the headers
                    },
                }
                ).then((response)=>{
                    if(!response.data.auth){
                        setAuthenticated(true);
                    } else{
                        setDepartmentsList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
                return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from deps");
        }
    },[context]);
    
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
    },[context, updateList, setUpdateList, fetchData]);

    const handleDelete = async(id)=>{
        try {
            // Delete user from the API
            await Axios.delete(`http://localhost:3001/api/depapi/deps/delete/${id}`, {
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
                    const updatedDeps = departmentsList.filter((dep)=> dep.id !== id);
                    setDepartmentsList(updatedDeps);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting dep:', error);
        }
    };
    

    const handleEdit = (dep) => {
        setSelectedDep(dep);
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
    


    useEffect(() => {
        if (departmentsList) {
        departmentsList.filter((dep) => {
    
            // Apply the main search filter
            const mainSearchFilter =
            searchTerm === "" ||
            dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.title.toLowerCase().includes(searchTerm.toLowerCase());
    
            // Apply filters based on search terms in each column
            const fullNameFilterMatch = dep.name.toLowerCase().includes(searchByName.toLowerCase());
            const descriptionFilterMatch = dep.description.toLowerCase().includes(searchByDescription.toLowerCase());
            const titleFilterMatch = dep.title.toLowerCase().includes(searchByTitle.toLowerCase());
            //date
            const createDateFilterMatch =
            (createDateFilter.start === null || new Date(dep.created_at) >= createDateFilter.start) &&
            (createDateFilter.end === null || new Date(dep.created_at) <= createDateFilter.end);
            //date
            const changeDateFilterMatch =
            (changeDateFilter.start === null || new Date(dep.changed_at) >= changeDateFilter.start) &&
            (changeDateFilter.end === null || new Date(dep.changed_at) <= changeDateFilter.end);
    
            // Combine main search filter and column filters with logical AND
            return (
                mainSearchFilter &&
                fullNameFilterMatch &&
                descriptionFilterMatch &&
                titleFilterMatch &&
                createDateFilterMatch &&
                changeDateFilterMatch
            );
        });
        }
    }, [departmentsList, 
        searchTerm, 
        searchByName, 
        searchByDescription, 
        searchByTitle,
        createDateFilter,
        changeDateFilter 
    ]);
    

    // Define columns for the DataGrid
    const columns = [
        {
            field: 'image',
            headerName: 'ფოტო',
            headerClassName: 'column-headers', 
            flex: 1,
            renderCell: (params) => (
                params.row.image ? (
                    <div className='dep-image-container'>
                        <img
                            src={`http://localhost:3001/uploads/departments/${params.row.id}/${encodeURIComponent(params.row.image.trim())}`}
                            alt="pic"
                            className='dep-image'
                        />
                    </div>
                ) : 
                <div className='dep-image-container'>
                <img
                    src={DepImg}
                    alt="pic"
                    className='dep-image'
                />
                </div>
            ),
        },
        { 
            field: 'name', 
            headerName: 'დეპარტამენტი', 
            headerClassName: 'column-headers',
            flex: 1,
            filterable: true, // Enable filtering for this column
            filterValue: searchByName, // Use the filter state for this column, 
            renderCell: (params) => {
                const dep = params.row
                return dep.name
            },
        },
        { field: 'description', headerName: 'აღწერა', headerClassName: 'column-headers', flex: 1,},
        { field: 'title', headerName: 'სათაური', headerClassName: 'column-headers', flex: 1, },
        { field: 'created_at', headerName: 'შექმნილია', headerClassName: 'column-headers', flex: 1, valueGetter: (params) => formatDate(params.row.created_at ? params.row.created_at : '') },
        {
            field: 'changed_at',
            headerName: 'ცვლილება',
            flex: 1,
            headerClassName: 'column-headers',
            visible: false,
            type: 'date',
            valueGetter: (params) => {
                return params.row.changed_at !== 'NaN' && params.row.changed_at
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
                return dateValue || 'NaN';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            headerClassName: 'column-headers', 
            flex: 1,
            renderCell: (params) => (
                <div className='actions-container'>
                    <IconButton className='dep-action-btns' onClick={() => handleEdit(params.row)} color="warning">
                        <EditIcon />
                    </IconButton>
                    <IconButton className='dep-action-btns' onClick={() => handleDelete(params.row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const filteredRows = departmentsList && departmentsList.filter((dep) => {
        const depNameLowerCase = dep.name.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return depNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading deps...</div>}
        {error && <div>{error}</div>}
        {
            selectedDep && (
                <div className={ selectedDep ? 'modal-window-show' : 'modal-window' }>
                    <DepartmentEditForm
                    dep = {selectedDep} 
                    setDepartmentsList={setDepartmentsList}
                    setSelectedDep = {setSelectedDep}
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
        {
            !authenticated && (
                <>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        pageSize={10}
                        autoHeight
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
                        sx={{
                            boxShadow: 2,
                            border: 2,
                            borderColor: '#d5d5d5',
                            '& .MuiDataGrid-cell:hover': {
                                color: '#fda41c',
                            },
                        }}
                    />
                    <div className='counter-export'>
                        {filteredRows && <h5 className='client-counter'>დეპარტამენტები: {muiFilteredUserCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
