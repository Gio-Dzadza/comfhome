import React, { useEffect, useState } from 'react'
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
import ProjEditForm from './ProjEditForm';


export default function ProjList({ updateList, setUpdateList }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:type} = useFetch('http://localhost:3001/api/projectapi/get/projecttypes');
    const {data:status} = useFetch('http://localhost:3001/api/projectapi/get/projectstat');
    const {data:dep} = useFetch('http://localhost:3001/api/projectapi/get/projdeps');

    const [permission, setPermission] = useState(false);

    //for project's data
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);

    //states for props
    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [deps, setDeps] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchByTitle, setSearchByTitle] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('');
    const [projectTypeFilter, setProjectTypeFilter] = useState('');


    //project info page
    const [projectToShow, setProjectToShow] = useState(null);

    //mui
    const [muiFilteredProjectCount, setMuiFilteredProjectCount] = useState(0);
    
    // Function to export data to Excel for users
    const exportToExcel = () => {
        // Convert the project data into an array of arrays
        const dataToExport = projectsList.map((project) => [
            project.title,
            project.project_description,
            project.started_at ? formatDate(project.started_at) : 'არ არის მითითებული',
            project.ended_at ? formatDate(project.ended_at) : 'არ არის მითითებული',
            type.find((typeitem) => typeitem.id === project.project_type_id)?.project_type_name || '',
            status.find((statitem) => statitem.id === project.project_status_id)?.project_status_name || '',
            dep.find((depitem) => depitem.id === project.department_id)?.name || '',
            formatDate(project.created_at ? project.created_at : ''),
            project.changed_at ? formatDate(project.changed_at) : 'ცვლილება არ განხორციელებულა',
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['პროექტის სახელი', 'აღწერა', 'დაიწყო', 'დასრულდა', 'ტიპი', 'სტატუსი', 'დეპარტამენტი', 'პროექტი შექმნილია', 'ცვლილება'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };

    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get('http://localhost:3001/api/projectapi/get/projects',
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
                        setProjectsList(response.data.result);
                        setAuthenticated(false);
                        setIsPending(false);
                        setError(null);
                    }
                });
            return response;
        } catch (error) {
            console.error('Error fetching list:', error);
            setIsPending(false);
            setError("Couldn't fetch the data from projects");
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
            // Delete project from the API
            const response = await Axios.delete(`http://localhost:3001/api/projectapi/projects/delete/${id}`, {
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
                    const updatedProjects = projectsList.filter((project)=> project.id !== id);
                    setProjectsList(updatedProjects);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };
    

    const handleEdit = (project) => {
        setSelectedProject(project);
        setTypes(type.result);
        setStatuses(status.result);
        setDeps(dep.result);
    };

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
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
            headerName: 'პროექტი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: searchByTitle, // Use the filter state for this column,
            renderCell: (params) => {
                const project = params.row;
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'project_description',
            headerName: 'აღწერა',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true, // Enable filtering for this column
            filterValue: searchByTitle, // Use the filter state for this column,
            renderCell: (params) => {
                return <div 
                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                            {params.value}
                        </div>;
            },
        },
        {
            field: 'started_at',
            headerName: 'დაწყების თარიღი',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const startedAt = params.row.started_at;
            return formatDate(startedAt || '');
            },
        },
        {
            field: 'ended_at',
            headerName: 'დასრულების თარიღი',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const endedAt = params.row.ended_at;
            return formatDate(endedAt || '');
            },
        },
        {
            field: 'project_type_id',
            headerName: 'ტიპი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: type && type.result.map((typeitem) => ({
                value: typeitem.id,
                label: typeitem.project_type_name,
            })),
            filterValue: projectTypeFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setProjectTypeFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const typeId = params.row.project_type_id;
                const typeName = type && type.result.find((typeitem) => typeitem.id === typeId)?.project_type_name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {typeName || ''}
                </div>
                );
            },
        },
        {
            field: 'project_status_id',
            headerName: 'სტატუსი',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            type: 'singleSelect',
            valueOptions: status && status.result.map((statitem) => ({
                value: statitem.id,
                label: statitem.project_status_name,
            })),
            filterValue: projectStatusFilter, // Use a state variable to manage the filter value
            onFilterChange: (event) => setProjectStatusFilter(event.target.value), // Update the filter value
            renderCell: (params) => {
                const statusId = params.row.project_status_id;
                const statusName = status && status.result.find((statitem) => statitem.id === statusId)?.project_status_name;
                return (
                <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {statusName || ''}
                </div>
                );
            },
        },
        {
            field: 'images',
            headerName: 'ფაილები',
            flex: 1,
            headerClassName: 'column-headers',
            cellClassName: 'docs-cell',
            renderCell: (params) => {
                const projectDocs = params.row.images || '';
            
                return (
                // <div style={{ height: '80px', overflow: 'auto', maxHeight: '80px'}}>
                <div style={{overflowY: 'auto', overflowX:'hidden', display:'block', flexDirection: 'column', alignItems: 'center', paddingLeft: '0px', width:'100%'}}>
                    {projectDocs ? (
                    <div>
                        <a href={`http://localhost:3001/api/proj/downloads/${params.row.id}`} download>Download Docs</a>
                        <ul style={{ margin: '0', listStyle: 'none',  paddingLeft: '0px' }}>
                        {projectDocs.split(',').map((doc, index) => {
                            const trimmedDoc = doc.trim();
                            return (
                            trimmedDoc !== '' && (
                                <li key={index} style={{display: 'flex', alignContent: 'flex-start'}}>
                                <a href={`http://localhost:3001/api/proj/downloads/${params.row.id}/${encodeURIComponent(trimmedDoc)}`} download>
                                    {trimmedDoc}
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
            headerName: 'ცვლილების თარიღი',
            flex: 1,
            headerClassName: 'column-headers',
            // You can add a valueGetter function to format the date
            valueGetter: (params) => {
            const specialistChangedAt = params.row.changed_at;
            if(specialistChangedAt){
                return formatDate(specialistChangedAt || '');
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
    

    const filteredProjects = projectsList && projectsList.filter((project) => {
        const projectTitleLowerCase = project.title.toLowerCase();
        const searchByTiTleLowerCase = searchByTitle.toLowerCase();
        
        return projectTitleLowerCase.includes(searchByTiTleLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading projects...</div>}
        {error && <div>{error}</div>}
        {
            selectedProject && (
                <div className={ selectedProject ? 'modal-window-show' : 'modal-window' }>
                    <ProjEditForm 
                    project = {selectedProject} 
                    setProjectsList={setProjectsList}
                    setSelectedProject = {setSelectedProject}
                    type = {types}
                    status = {statuses}
                    deps = {deps}
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
                            rows={filteredProjects}
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
                                setMuiFilteredProjectCount(e.rowsMeta.positions.length)
                            }}
                        />
                        </div>
                    <div className='counter-export'>
                        {filteredProjects && <h5 className='project-counter'>პროექტები: {muiFilteredProjectCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
