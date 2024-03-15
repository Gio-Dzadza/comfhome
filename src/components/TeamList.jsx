import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import TeamEditForm from './TeamEditForm';
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
import UserImg from '../assets/icons/user.png';
import '../pages/ListsParentStyles.css';
import { useFetch } from '../hooks/useFetch';


export default function TeamList({ updateList, setUpdateList }) {
    const {data:dep} = useFetch('http://localhost:3001/api/teamapi/get/teamdeps');
    const {data:profession} = useFetch('http://localhost:3001/api/teamapi/get/professions');
    const {data:position} = useFetch('http://localhost:3001/api/teamapi/get/positions');
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const [deps, setDeps] = useState(''); 
    const [professions, setProfessions] = useState('');
    const [positions, setPositions] = useState('');

    //for user's data
    const [selectedMember, setSelectedMember] = useState(null);
    const [teamList, setTeamList] = useState([]);

    //for authentication
    const [authenticated, setAuthenticated] = useState(false);

    //for context
    const context = useAuthContext();

    //for search
    const [searchByName, setSearchByName] = useState('');

    //mui
    const [muiFilteredUserCount, setMuiFilteredUserCount] = useState(0);

    useEffect(()=>{
        if(dep && dep.result){
            setDeps(dep.result)
        }
        if(profession && profession.result){
            setProfessions(profession.result)
        }
        if(position && position.result){
            setPositions(position.result)
        }
    },[])


    // Function to export data to Excel
    const exportToExcel = () => {
    // Convert the user data into an array of arrays
        const dataToExport = teamList.map((member) => [
            member.member_fullname,
            member.job_description, 
            member.experience,
            member.work_from ? formatDateExperience(member.work_from) : 'არ არის მითითებული',
            (dep && dep.result.find((depitem) => depitem.id === member.department_id)?.name),
            (profession && profession.result.find((depitem) => depitem.id === member.profession_id)?.profession_name),
            (position && position.result.find((depitem) => depitem.id === member.position_id)?.position_name),
            formatDate(member.created_at ? member.created_at : ''),
            formatDate(member.changed_at ? member.changed_at : ''),
        ]);

        // Create a new workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['სახელი და გვარი', 'სამუშაო აღწერა', 'გამოცდილება', 'დასაქმებულია -დან', 'დეპარტამენტი', 'პროფესია', 'პოზიცია', 'შექმნილია', 'ცვლილება'],
            ...dataToExport,
        ]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Team');

        // Generate the Excel file
        const excelBuffer = XLSX.write(workbook, { type: 'buffer' });

        // Create a Blob from the buffer
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a download link and click it programmatically
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'team.xlsx';
        a.click();

        // Clean up the URL and remove the download link
        URL.revokeObjectURL(url);
        a.remove();
    };


    const fetchData = async (...signal) => {
        setIsPending(true);
        try {
            const response = await Axios.get(
                'http://localhost:3001/api/teamapi/get/team',
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
                        setTeamList(response.data.result);
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
            await Axios.delete(`http://localhost:3001/api/teamapi/team/delete/${id}`, {
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
                    const updatedTeam = teamList.filter((member)=> member.id !== id);
                    setTeamList(updatedTeam);
                    setAuthenticated(false);
                };
            });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    

    const handleEdit = (member) => {
        setSelectedMember(member);
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

    const formatDateExperience = (dateString) => {
        const options = { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        const formattedDate = new Date(dateString).toLocaleString('en-GB', options);
        return formattedDate;
    };

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
                            src={`http://localhost:3001/uploads/team/${params.row.id}/${encodeURIComponent(params.row.image.trim())}`}
                            alt="Member Image"
                            className='dep-image'
                        />
                    </div>
                ) : 
                <div className='dep-image-container'>
                <img
                    src={UserImg}
                    alt="Member Image"
                    className='dep-image'
                />
                </div>
            ),
        },
        { 
            field: 'member_fullname', 
            headerName: 'სახელი და გვარი', 
            headerClassName: 'column-headers',
            flex: 1,
            filterable: true, // Enable filtering for this column
            filterValue: searchByName, // Use the filter state for this column, 
            renderCell: (params) => {
                const dep = params.row
                return dep.name
            },
        },
        { field: 'job_description', headerName: 'სამუშაოს აღწერა', headerClassName: 'column-headers', flex: 1,},
        { field: 'experience', headerName: 'გამოცდილება', headerClassName: 'column-headers', flex: 1,},
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
            field: 'profession_id',
            headerName: 'პროფესია',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const profId = params.row.profession_id;
                const profIt = profession && profession.result.find((profitem) => profitem.id === profId);
                return profIt ? `${profIt.profession_name}` : '';
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
            field: 'position_id',
            headerName: 'პოზიცია',
            flex: 1,
            headerClassName: 'column-headers',
            filterable: true,
            valueGetter: (params) => {
                const posId = params.row.position_id;
                const posIt = position && position.result.find((positem) => positem.id === posId);
                return posIt ? `${posIt.position_name}` : '';
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
            field: 'work_from',
            headerName: 'დასაქმებულია -დან',
            flex: 1,
            headerClassName: 'column-headers',
            visible: false,
            type: 'date',
            valueGetter: (params) => {
                return params.row.work_from !== 'NaN' && params.row.work_from
                ? new Date(params.row.work_from)
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

    const filteredRows = teamList && teamList.filter((member) => {
        const serviceNameLowerCase = member.member_fullname.toLowerCase();
        const searchByNameLowerCase = searchByName.toLowerCase();
        
        return serviceNameLowerCase.includes(searchByNameLowerCase);
    });

return (
    <div className='list'>
        {isPending && <div>Loading members...</div>}
        {error && <div>{error}</div>}
        {
            selectedMember && (
                <div className={ selectedMember ? 'modal-window-show' : 'modal-window' }>
                    <TeamEditForm
                    member = {selectedMember} 
                    setTeamList={setTeamList}
                    setSelectedMember = {setSelectedMember}
                    deps = {deps}
                    professions = {professions}
                    positions ={positions}
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
                        {filteredRows && <h5 className='client-counter'>სერვისები: {muiFilteredUserCount}</h5>}
                        <Button onClick={exportToExcel} className='exportXLSX-btn'>Excel</Button>
                    </div>
                </>
            )
        }
    </div>
)
}
