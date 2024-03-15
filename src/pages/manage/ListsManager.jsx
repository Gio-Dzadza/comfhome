import React, { useEffect, useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import ProjectStatusList from '../../components/manager/ProjectStatusList';
import CurrencyList from '../../components/manager/CurrencyList';
import ProjectTypeList from '../../components/manager/ProjectTypeList';
import ServiceList from '../../components/manager/ServiceList';
import PayStatusList from '../../components/manager/PayStatusList';
import ServiceStatusList from '../../components/manager/ServiceStatusList';
import SpecialtyList from '../../components/manager/SpecialtyList';
import UserStatusList from '../../components/manager/UserStatusList';
import UserTypeList from '../../components/manager/UserTypeList';
import { useAuthContext } from "../../hooks/useAuthContext";
import './ListManager.css';
import Axios from 'axios';
import {
    Container,
} from '@mui/material';
import theme from '../../components/Theme';
import { ThemeProvider } from '@mui/material/styles';


export default function ListsManager() {

    const [projectStatusUrl, setProjectStatusUrl] = useState('http://localhost:3001/api/adminapi/get/projectStatuses');
    const [currenciesUrl, setCurrenciesUrl] = useState('http://localhost:3001/api/adminapi/get/Currency');
    const [projectTypesUrl, setProjectTypesUrl] = useState('http://localhost:3001/api/adminapi/get/projectTypes');
    const [servicesUrl, setServicesUrl] = useState('http://localhost:3001/api/adminapi/get/services');
    const [payStatusesUrl, setPayStatusesUrl] = useState('http://localhost:3001/api/adminapi/get/payStatuses');
    const [serviceStatusesUrl, setServiceStatusesUrl] = useState('http://localhost:3001/api/adminapi/get/serviceStatuses');
    const [specialtiesUrl, setSpecialtiesUrl] = useState('http://localhost:3001/api/adminapi/get/specialties');
    const [userStatusesUrl, setUserStatusesUrl] = useState('http://localhost:3001/api/adminapi/get/userStatuses');
    const [userTypesUrl, setUserTypesUrl] = useState('http://localhost:3001/api/adminapi/get/userTypes');

    const {data:projectStatuses} = useFetch(projectStatusUrl);
    const {data:currencies} = useFetch(currenciesUrl);
    const {data:projectTypes} = useFetch(projectTypesUrl);
    const {data:services} = useFetch(servicesUrl);
    const {data:payStatuses} = useFetch(payStatusesUrl);
    const {data:serviceStatuses} = useFetch(serviceStatusesUrl);
    const {data:specialties} = useFetch(specialtiesUrl);
    const {data:userStatuses} = useFetch(userStatusesUrl);
    const {data:userTypes} = useFetch(userTypesUrl);
    const {data:adminUsers} = useFetch('http://localhost:3001/api/getAdmins');
    const {data:showHideRecs} = useFetch('http://localhost:3001/api/getShowHideRecs');
    const userIdsArray = showHideRecs?.result.flatMap(item => item.userIds.split(',').map(Number));
    const Ids = userIdsArray || [];

    const [projectStatusList, setProjectStatusList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [projectTypeList, setProjectTypeList] = useState([]);
    const [serviceList, setServiceList] = useState([]);
    const [payStatusList, setPayStatusList] = useState([]);
    const [serviceStatusList, setServiceStatusList] = useState([]);
    const [specialtyList, setSpecialtyList] = useState([]);
    const [userStatusList, setUserStatusList] = useState([]);
    const [userTypeList, setUserTypeList] = useState([]);

    const [adminUsersList, setAdminUsersList] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);

    const [showPage, setShowPage] = useState(false);

    const [showFinancialInfoBtn, setShowFinancialInfoBtn] = useState(false);
    const [showHideRecordId, setShowHideRecordId] = useState('');

    const context = useAuthContext();

    useEffect(()=>{
        const unsub = ()=>{
            if(projectStatuses && projectStatuses){
                setProjectStatusList(projectStatuses)
            };
            if(currencies && currencies){
                setCurrencyList(currencies)
            };
            if(projectTypes && projectTypes){
                setProjectTypeList(projectTypes)
            };
            if(services && services){
                setServiceList(services)
            };
            if(payStatuses && payStatuses){
                setPayStatusList(payStatuses)
            };
            if(serviceStatuses && serviceStatuses){
                setServiceStatusList(serviceStatuses)
            };
            if(specialties && specialties){
                setSpecialtyList(specialties)
            };
            if(userStatuses && userStatuses){
                setUserStatusList(userStatuses)
            };
            if(userTypes && userTypes){
                setUserTypeList(userTypes)
            };
        };
        unsub();
        
        return()=>{
            unsub();
        }
    },[userTypes, userStatuses, specialties, serviceStatuses, payStatuses, services, projectTypes, currencies, projectStatuses]);

    useEffect(()=>{
        if(context.authIsReady){
            if(context.user.User_Type_id === 1){
                setShowPage(true);
            } else if(context.user.User_Type_id === 4){
                setShowPage(true);
                setShowFinancialInfoBtn(true);
                if(adminUsers && adminUsers){
                    setAdminUsersList(adminUsers.result);
                };
            } else{
                setShowPage(false);
            }
        } else{
            setShowPage(false);
        };
    },[context]);

    useEffect(()=>{
        if(adminUsers && adminUsers){
            setAdminUsersList(adminUsers.result);
        };
        setShowHideRecordId(1);
        if (adminUsers && adminUsers.result.length > 0) {
            const filteredUsers = adminUsers.result.filter(user => Ids.includes(user.id));
            setSelectedUsers(filteredUsers);
        }
        setUsers(Ids)
    },[adminUsers]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedMode = {
            showHideRecordId,
            users
        };

        try{
            const response = await Axios.post('http://localhost:3001/api/permapi/updateShowHide', updatedMode, {
                headers: {
                    "x-access-token": context.userToken, // Include the token in the headers
                },
            });
        if (response.status === 200) {
            const data = await response.data;
            console.log(response.data);
            setSelectedUsers([]);
            setUsers([]);
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error changing financial display mode:', error);
        }
    }

    const handleUser = (e)=>{
        
        const selectedUser = adminUsersList.find((user) => user.FirstName + ' ' + user.LastName === e.target.value);

        if (selectedUser && !users.includes(selectedUser.id)) {
            setUsers([...users, selectedUser.id]);
            setSelectedUsers([...selectedUsers, selectedUser]);
        }
    };

    const removeUser = (user) => {
        setSelectedUsers(selectedUsers.filter((selectedUser) => selectedUser.id !== user.id));
        setUsers(users.filter((userId) => userId !== user.id));
    };

    return (
        <div className='lists-container'>
            <Container className='forms-container-mui' maxWidth='false' minWidth='false'>
                <ThemeProvider theme={theme}>
                    {
                    showPage ? (
                            <>
                                {
                                    showFinancialInfoBtn && (
                                        <div>
                                            <form onSubmit={handleSubmit}>
                                                <label>
                                                    <span>Hide Financial Info </span>
                                                </label>
                                                <br/>
                                                <label>
                                                    <span>თანამშრომლები: </span>
                                                    <div className="multi-select-dropdown">
                                                        <div className="selected-users">
                                                            {selectedUsers.map((user) => (
                                                                <span key={user.id} onClick={() => removeUser(user)}>
                                                                    {`${user.FirstName} ${user.LastName}`} &#10005;
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <select name='users' onChange={(e)=> {handleUser(e)}} value={users} multiple>
                                                        <option disabled>აირჩიეთ სპეციალისტები</option>
                                                        { adminUsersList && adminUsersList.map(user =>(
                                                            <option value={user.FirstName + ' ' + user.LastName} key={user.id}>{`${user.FirstName} ${user.LastName}`}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <button type='submit'>შენახვა</button>
                                            </form>
                                        </div>
                                    )
                                }
                                <div className='manage-form proj-status-form'><ProjectStatusList projectStatusList={projectStatusList} setProjectStatusUrl = {setProjectStatusUrl} /></div>
                                <div className='manage-form currency-form'><CurrencyList currencyList={currencyList} setCurrenciesUrl = {setCurrenciesUrl}/></div>
                                <div className='manage-form proj-type-form'><ProjectTypeList projectTypeList={projectTypeList} setProjectTypesUrl = {setProjectTypesUrl}/></div>
                                <div className='manage-form service-form'><ServiceList serviceList={serviceList} setServicesUrl = {setServicesUrl} /></div>
                                <div className='manage-form pay-status-form'><PayStatusList payStatusList={payStatusList} setPayStatusesUrl = {setPayStatusesUrl}/></div>
                                <div className='manage-form service-status-form'><ServiceStatusList serviceStatusList={serviceStatusList} setServiceStatusesUrl = {setServiceStatusesUrl}/></div>
                                <div className='manage-form specialty-form'><SpecialtyList specialtyList={specialtyList} setSpecialtiesUrl = {setSpecialtiesUrl}/></div>
                                <div className='manage-form user-status-form'><UserStatusList userStatusList={userStatusList} setUserStatusesUrl = {setUserStatusesUrl}/></div>
                                <div className='manage-form user-type-form'><UserTypeList userTypeList={userTypeList} setUserTypesUrl = {setUserTypesUrl}/></div>
                            </>
                        ) :                 
                        <div>
                            <h1>You are not permittied You need authentication</h1>
                        </div>
                    }
                </ThemeProvider>
            </Container>
        </div>
    )
}
