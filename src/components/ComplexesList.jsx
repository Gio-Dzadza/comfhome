import React, { useEffect, useState } from 'react'
import Axios from 'axios';
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link } from 'react-router-dom';

//mui
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomToolbar from './CustomToolbar';

//style
import './UsersList.css'
import '../pages/ListsParentStyles.css';
//export
import * as XLSX from 'xlsx';


export default function ComplexesList({ updateList, setUpdateList, setComplex, setEditing, handleFormSubmit }) {
    //for error and pending
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const {data:districtsList} = useFetch('https://64.226.115.210/api/get/districts');
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
                'https://64.226.115.210/api/get/complexes',
                {
                    ...signal,
                    headers: {
                        "x-access-token": context.userAccessToken,
                    },
                }
                ).then((response)=>{
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

    const exportToExcel = () => {
            const dataToExport = complexes && complexes.map((complex) => [
                complex.id,
                complex.address,
                complex.company,
                districtsList && districtsList.result.find((distItem) => distItem.id === complex.district_id)?.district_name || '',
                formatDate(complex.created_at ? complex.created_at : ''),
                complex.changed_at ? formatDate(complex.changed_at) : 'სტატუსი არ შეცვლილა',
            ]);
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet([
                ['Id', 'მისამართი', 'კომპანია', 'უბანი', 'შექმნილია', 'ცვლილება'],
                ...dataToExport,
            ]);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Complexes');
            const excelBuffer = XLSX.write(workbook, { type: 'buffer' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'complexes.xlsx';
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        };

    const handleDelete = async(id)=>{
        handleFormSubmit(id);
        try {
            await Axios.delete(`https://64.226.115.210/api/complexes/delete/${id}`, {
                headers: {
                    "x-access-token": context.userAccessToken,
                },
            }).then((response)=>{
                if(response.data.deleted){
                    handleFormSubmit(response.status);
                    console.log(id + ' ' + response.data.message);
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
            filterValue: addressFilter,
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
            filterable: true, 
            filterValue: companyFilter, 
        },
        {
            field: 'district_id',
            headerName: 'District',
            flex: 1,
            headerClassName: 'column-headers',
            visible: true,
            type: 'singleSelect',
            filterable: true,
            valueGetter: (params) => {
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
                    <IconButton onClick={() => handleEdit(params.row)} color='blue' style={{ padding: 0 }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color='blue' style={{ padding: 0 }}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    const filteredRows = complexes && complexes.filter((complex) => {
        const districtName = districtsList && districtsList.result.find((disItem) => disItem.id === complex.district_id)?.district_name;
        return (
            complex.address.toLowerCase().includes(addressFilter.toLowerCase()) ||
            complex.company.toLowerCase().includes(companyFilter.toLowerCase()) &&
            (districtName && districtName.toLowerCase().includes(districtNames.toLowerCase()))
        );
    });

return (
    <div className='container col-lg-3'>
        {isPending && <div>Loading complexes...</div>}
        {error && <div>{error}</div>}
        {
            authenticated && (
                <div>
                    <h1>You are not permittied You need authentication</h1>
                </div>
            )
        }
        {!authenticated && (
            <>
                <div className='coplexList'>
                    <DataGrid
                        sx={{
                            // boxShadow: 2,
                            // border: 2,
                            // borderColor: '#d5d5d5',
                            '& .MuiDataGrid-cell:hover': {
                                color: 'green',
                            },
                            // '&, [class^=MuiDataGrid]': { border: 'none' }
                        }}
                        rows={complexes}
                        // rows={filteredRows}
                        columns={columns}
                        // autoHeight
                        rowsPerPageOptions = {[5,10,20]}
                        pageSize={pgSize}
                        onPageSizeChange={(newPageSize)=> setPgSize(newPageSize)}
                        // pagination
                        // hideFooterPagination
                        // hideFooterSelectedRowCount
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
                </div>
                <div className='container d-flex flex-column align-items-center listStat'>
                    {filteredRows && <h5 className='user-counter'>კორპუსები: {muiFilteredUserCount}</h5>}
                    <button onClick={exportToExcel} className='btn btn-secondary'>
                        Export in Excel
                    </button>
                </div>
            </>
        )}
    </div>
)
}
