import React, { useEffect, useState, useCallback } from 'react'
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';

//datepicker
import 'react-datepicker/dist/react-datepicker.css';

//export
import * as XLSX from 'xlsx';
import NewsEditForm from './NewsEditForm';

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


export default function NewsList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:dep} = useFetch('http://localhost:3001/api/newsapi/get/newsdeps');
    const {data:newsstat} = useFetch('http://localhost:3001/api/newsapi/get/newstat');

    const [permission, setPermission] = useState(false);

    //for project's data
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsList, setNewsList] = useState([]);

    //states for props
    const [deps, setDeps] = useState([]);
    const [newsStatuses, setNewsStatuses] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchByTitle] = useState('');
    const [searchByDescription] = useState('');
    const [newsStatusFilter, setNewsStatusFilter] = useState('');

    //mui
    const [muiFilteredNewsCount, setMuiFilteredNewsCount] = useState(0);

    // Function to export data to Excel
    const exportToExcel = () => {
        const dataToExport = newsList?.map((news) => [
            news.title || '',
            news.news_description || '',
            (newsstat && newsstat.result.find((newsstatitem) => newsstatitem.id === news.news_status_id)?.news_status_name) || '',
            (dep && dep.result.find((depitem) => depitem.id === news.department_id)?.name) || '',
            formatDate(news.created_at) || '',
            formatDate(news.changed_at) || '',
        ]);
        

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სათაური', 'აღწერა', 'სტატუსი', 'დეპარტამენტი', 'შექმნილია', 'ცვლილება'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'News');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'news.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = useCallback( async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get('http://localhost:3001/api/newsapi/get/news',
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
                        setNewsList(response.data.result);
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
            await Axios.delete(`http://localhost:3001/api/newsapi/news/delete/${id}`, {
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
                    const updatedNews = newsList.filter((news)=> news.id !== id);
                    setNewsList(updatedNews);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };
    

    const handleEdit = (news) => {
        setSelectedNews(news);
        setDeps(dep.result);
        setNewsStatuses(newsstat.result);
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
        if( context.user && context.user.User_Type_id === 1 ){
            setPermission(true);
        } else if(context.user && context.user.User_Type_id === 4){
            setPermission(true);
        } else{
            setPermission(false);
        };
    },[context]);

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
            field: 'news_description',
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
            field: 'news_status_id',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: newsstat && newsstat.result.map((newsstatitem) => ({
                value: newsstatitem.id,
                label: newsstatitem.news_status_name,
            })),
            filterValue: newsStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setNewsStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const statusId = params.row.news_status_id;
                const statusName = newsstat && newsstat.result.find((newsstatitem) => newsstatitem.id === statusId)?.news_status_name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        {
            field: 'department_id',
            headerName: 'დეპარტამენტი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const depId = params.row.department_id;
                const depit = dep && dep.result.find((depitem) => depitem.id === depId);
                return depit ? `${depit.name}` : '';
            },
            renderCell: (params) => {
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {params.value}
                </div>
                );
            },
        },
        {
            field: 'images',
            headerName: 'კოლაჟი',
            flex: 1,
            headerClassName: 'column-headers',
            cellClassName: 'docs-cell',
            renderCell: (params) => {
                const newsImages = params.row.images || '';
            
                return (
                <div style={{overflowY: 'auto', overflowX:'hidden', display:'block', flexDirection: 'column', alignItems: 'center', paddingLeft: '0px', width:'100%'}}>
                    {newsImages ? (
                    <div>
                        <a href={`http://localhost:3001/api/news/downloads/${params.row.id}`} download>გადმოწერე კოლაჟი</a>
                        <ul style={{ margin: '0', listStyle: 'none',  paddingLeft: '0px' }}>
                        {newsImages.split(',').map((news, index) => {
                            const trimmedNews = news.trim();
                            return (
                                trimmedNews !== '' && (
                                <li key={index} style={{display: 'flex', alignContent: 'flex-start'}}>
                                <a href={`http://localhost:3001/api/news/downloads/${params.row.id}/${encodeURIComponent(trimmedNews)}`} download>
                                    {trimmedNews}
                                </a>
                                </li>
                            )
                            );
                        })}
                        </ul>
                    </div>
                    ) : (
                        <div >
                            <img src={Doc} alt='doc' />
                        </div>
                    )}
                </div>
                );
            },
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
                    {
                        permission && (
                            <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                </div>
            ),
        },
    ];
    

    const filteredNews = newsList && newsList.filter((news) => {
        const newsNameLowerCase = news.title.toLowerCase();
        const searchByNameLowerCase = searchByTitle.toLowerCase();
        
        return newsNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading news...</div>}
        {error && <div>{error}</div>}
        {
            selectedNews && (
                <div className={ selectedNews ? 'modal-window-show' : 'modal-window' }>
                    <NewsEditForm
                    news = {selectedNews} 
                    setNewsList={setNewsList}
                    setSelectedNews = {setSelectedNews}
                    deps = {deps}
                    newsStatuses = {newsStatuses}
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
                                setMuiFilteredNewsCount(e.rowsMeta.positions.length)
                            }}
                        />
                        </div>
                    <div className='counter-export'>
                        {filteredNews && <h5 className='project-counter'>სიახლე: {muiFilteredNewsCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
