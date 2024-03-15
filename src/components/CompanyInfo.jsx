import React, { useCallback, useEffect, useState } from 'react'
import Axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import { useFetch } from '../hooks/useFetch';

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
import CompanyInfoEditForm from './CompanyInfoEditForm';


export default function CompanyInfo({ updateList, setUpdateList }) {
    const {data:compstats} = useFetch('http://localhost:3001/api/compinfo/get/compStats');
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    //for user's data

    const [selectedInfo, setSelectedInfo] = useState(null);
    const [infoList, setInfoList] = useState([]);

    const [compInfoStatuses, setCompInfoStatuses] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchTerm] = useState('');
    const [searchByName] = useState('');
    const [searchByDescription] = useState('');
    const [compStatusFilter, setCompStatusFilter] = useState('');

    //date pick
    const [createDateFilter] = useState({ start: null, end: null });
    const [changeDateFilter] = useState({ start: null, end: null });

    //mui
    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);


    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = infoList.map((info) => [
            info.name,
            info.about,
            (compstats && compstats.result.find((compstatItem) => compstatItem.id === info.status_id)?.name) || '',
            info.adress,
            info.phoneNumber,
            info.email,
            info.facebook,
            info.instagram,
            info.youtube,
            formatDate(info.created_at ? info.created_at : ''),
            formatDate(info.changed_at ? info.changed_at : ''),
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სათაური', 'შესახებ', 'გამოქვეყნების სტატუსი', 'მისამართი', 'ტელეფონის ნომერი', 'მეილი', 'facebook', 'instagram', 'youtube', 'შექმნილია', 'ცვლილება განხორციელდა'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Info');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'info.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };


    const fetchData = useCallback(async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/compinfo/get/comp',
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
                        setInfoList(response.data.result);
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
    },[context]) 
    
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
            await Axios.delete(`http://localhost:3001/api/compinfo/comp/delete/${id}`, {
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
                    const updatedInfos = infoList.filter((info)=> info.id !== id);
                    setInfoList(updatedInfos);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    

    const handleEdit = (info) => {
        setSelectedInfo(info)
        setCompInfoStatuses(compstats.result);
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
        if (infoList) {
            infoList && infoList.filter((info) => {
            // const depIdString = dep.ID_Number.toString();
    
            // Apply the main search filter
            const mainSearchFilter =
            searchTerm === "" ||
            info?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // depIdString.toLowerCase().includes(searchTerm.toLowerCase()) ||
            info?.about.toLowerCase().includes(searchTerm.toLowerCase());
    
            // Apply filters based on search terms in each column
            const fullNameFilterMatch = info?.name.toLowerCase().includes(searchByName.toLowerCase());
            const descriptionFilterMatch = info?.about.toLowerCase().includes(searchByDescription.toLowerCase());
            //date
            const createDateFilterMatch =
            (createDateFilter.start === null || new Date(info?.created_at) >= createDateFilter.start) &&
            (createDateFilter.end === null || new Date(info?.created_at) <= createDateFilter.end);
            //date
            const changeDateFilterMatch =
            (changeDateFilter.start === null || new Date(info?.changed_at) >= changeDateFilter.start) &&
            (changeDateFilter.end === null || new Date(info?.changed_at) <= changeDateFilter.end);
    
            // Combine main search filter and column filters with logical AND
            return (
                mainSearchFilter &&
                fullNameFilterMatch &&
                descriptionFilterMatch &&
                createDateFilterMatch &&
                changeDateFilterMatch
            );
        });
        }
    }, [infoList, 
        searchTerm, 
        searchByName, 
        searchByDescription, 
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
                            src={`http://localhost:3001/uploads/company/${params.row.id}/${encodeURIComponent(params.row.image.trim())}`}
                            alt = "pic"
                            className='dep-image'
                        />
                    </div>
                ) : 
                <div className='dep-image-container'>
                <img
                    src={DepImg}
                    alt="Dep pic"
                    className='dep-image'
                />
                </div>
            ),
        },
        { 
            field: 'name', 
            headerName: 'სათაური', 
            headerClassName: 'column-headers',
            flex: 1,
            filterable: true, // Enable filtering for this column
            filterValue: searchByName, // Use the filter state for this column, 
            renderCell: (params) => {
                const dep = params.row
                return dep.name
            },
        },
        { field: 'about', headerName: 'აღწერა', headerClassName: 'column-headers', flex: 1,},
        {
            field: 'status_id',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: compstats && compstats.result.map((compstatitem) => ({
                value: compstatitem.id,
                label: compstatitem.name,
            })),
            filterValue: compStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setCompStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const statusId = params.row.status_id;
                const statusName = compstats && compstats.result.find((compstatitem) => compstatitem.id === statusId)?.name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        { field: 'address', headerName: 'მისამართი', headerClassName: 'column-headers', flex: 1,},
        { field: 'phoneNumber', headerName: 'ნომერი', headerClassName: 'column-headers', flex: 1,},
        { field: 'email', headerName: 'Email', headerClassName: 'column-headers', flex: 1,},
        { field: 'facebook', headerName: 'Facebook', headerClassName: 'column-headers', flex: 1,},
        { field: 'instagram', headerName: 'Instagram', headerClassName: 'column-headers', flex: 1,},
        { field: 'youtube', headerName: 'Youtube', headerClassName: 'column-headers', flex: 1,},
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

    const filteredRows = infoList && infoList.filter((info) => {
        const depNameLowerCase = info?.name.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return depNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading info...</div>}
        {error && <div>{error}</div>}
        {
            selectedInfo && (
                <div className={ selectedInfo ? 'modal-window-show' : 'modal-window' }>
                    <CompanyInfoEditForm
                    info = {selectedInfo} 
                    setInfoList={setInfoList}
                    setSelectedInfo = {setSelectedInfo}
                    compInfoStatuses = {compInfoStatuses}
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
                        {filteredRows && <h5 className='client-counter'>ჩანაწერები: {muiFilteredUserCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
