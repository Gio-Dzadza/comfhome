import React, { useEffect, useState, useCallback } from 'react'
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';

//mui
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton } from '@mui/material';
import CustomToolbar from './CustomToolbar';

//style
import './ProjectsList.css'
import '../pages/ListsParentStyles.css';

//img
import Doc from '../assets/icons/doc.png'
import SocResEditForm from './SocResEditForm';


export default function SocRespList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:socresstat} = useFetch('http://localhost:3001/api/socresp/get/socrespStats');

    //for project's data
    const [selectedSocRes, setSelectedSocRes] = useState(null);
    const [socResList, setSocResList] = useState([]);

    //states for props
    const [socResStatuses, setSocResStatuses] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchByTitle] = useState('');
    const [searchByDescription] = useState('');
    const [socResStatusFilter, setSocResStatusFilter] = useState('');

    //mui
    const [muiFilteredSocRespCount, setMuiFilteredSocRespCount] = useState(0);

    // Function to export data to Excel
    const exportToExcel = () => {
        const dataToExport = socResList?.map((socresItem) => [
            socresItem.title || '',
            socresItem.description || '',
            (socresstat && socresstat.result.find((item) => item.id === socresItem.status_id)?.name) || '',
            formatDate(socresItem.created_at) || '',
            formatDate(socresItem.changed_at) || '',
        ]);
        

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სათაური', 'აღწერა', 'სტატუსი', 'შექმნილია', 'ცვლილება'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SocResp');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'socresp.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = useCallback( async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get('http://localhost:3001/api/socresp/get/socres',
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
                        setSocResList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
            return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from news");
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
            // Delete news from the API
            await Axios.delete(`http://localhost:3001/api/socresp/socr/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken, // Include the token in the headers
                },
            }).then((response)=>{
                // console.log(response);
                if(response.data.auth){
                    console.log(id + ' ' + response.data);
                } else{
                    console.log(id + ' ' + response.data.message);
                    setAuthenticated(true);
                };
                if(response.data.deleted){
                    console.log(id + ' ' + response.data.message);
                    // Update the UI
                    const updatedSocResps = socResList.filter((item)=> item.id !== id);
                    setSocResList(updatedSocResps);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };
    

    const handleEdit = (info) => {
        setSelectedSocRes(info);
        setSocResStatuses(socresstat.result);
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

    const columns = [
        {
            field: 'title',
            headerName: 'სათაური',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: searchByTitle, // Use the filter state for this column,
            renderCell: (params) => {
                // const news = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'description',
            headerName: 'აღწერა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: searchByDescription, // Use the filter state for this column,
            renderCell: (params) => {
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'status_id',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: socresstat && socresstat.result.map((socresstatitem) => ({
                value: socresstatitem.id,
                label: socresstatitem.name,
            })),
            filterValue: socResStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setSocResStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const statusId = params.row.status_id;
                const statusName = socresstat && socresstat.result.find((socrstatitem) => socrstatitem.id === statusId)?.name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        {
            field: 'image',
            headerName: 'ფოტო',
            headerClassName: 'column-headers', 
            flex: 1,
            renderCell: (params) => (
                params.row.image ? (
                    <div className='dep-image-container'>
                        <img
                            src={`http://localhost:3001/uploads/socresp/${params.row.id}/${encodeURIComponent(params.row.image.trim())}`}
                            alt="Pic"
                            className='dep-image'
                        />
                    </div>
                ) : 
                <div className='dep-image-container'>
                <img
                    src={Doc}
                    alt="Pic"
                    className='dep-image'
                />
                </div>
            ),
        },
        {
            field: 'created_at',
            headerName: 'შექმნილია',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const createdAt = params.row.created_at;
            return formatDate(createdAt || '');
            },
        },
        {
            field: 'changed_at',
            headerName: 'ცვლილება',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const newsChangedAt = params.row.changed_at;
            if(newsChangedAt){
                return formatDate(newsChangedAt || '');
            }
            return 'NaN';
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
    

    const filteredNews = socResList && socResList.filter((item) => {
        const newsNameLowerCase = item.title.toLowerCase();
        const searchByNameLowerCase = searchByTitle.toLowerCase();
        
        return newsNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading info...</div>}
        {error && <div>{error}</div>}
        {
            selectedSocRes && (
                <div className={ selectedSocRes ? 'modal-window-show' : 'modal-window' }>
                    <SocResEditForm
                    socres = {selectedSocRes} 
                    setSocResList={setSocResList}
                    setSelectedSocRes = {setSelectedSocRes}
                    socResStatuses = {socResStatuses}
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
            !authenticated &&(
                <>
                        <div style={{ height: '600px', width: '100%' }}>
                        <DataGrid
                            sx={{
                                boxShadow: 2,
                                border: 2,
                                borderColor: '#d5d5d5',
                                '& .MuiDataGrid-cell:hover': {
                                    color: '#d08513',
                                },
                            }}
                            // getRowClassName={getRowClassName}
                            rows={filteredNews}
                            columns={columns}
                            pageSize={10}
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
                                setMuiFilteredSocRespCount(e.rowsMeta.positions.length)
                            }}
                        />
                        </div>
                    <div className='counter-export'>
                        {filteredNews && <h5 className='project-counter'>ჩანაწერები: {muiFilteredSocRespCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
