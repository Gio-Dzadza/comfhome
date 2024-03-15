import React, { useEffect, useState } from 'react';
import '../pages/register/RegisterPageStyles.css';
import { BackBtnIcon } from "../assets/BackBtnIcon";
import { useFetch } from '../hooks/useFetch';
import { useAuthContext } from '../hooks/useAuthContext';
import Axios from 'axios';

export default function ComplexRegForm({setShowRegForm, handleFormSubmit, editing, setEditing, complex, setComplex}) {
    const {data:districts} = useFetch('http://localhost:3001/api/get/districts');
    const {data:servtoComplex} = useFetch('http://localhost:3001/api/get/servtocomplex');
    const {data:buildingServices} = useFetch('http://localhost:3001/api/get/builservices');

    const context = useAuthContext();
    const [address, setAddress] = useState("");
    const [company, setCompany] = useState("");
    const [district, setDistrict] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [services, setServices] = useState([]);
    const [serviceId, setServiceId] = useState([]);
    const [thingId, setThingId] = useState([]);

    useEffect(()=>{
        const unsub = ()=>{
            if(districts && districts.result){
                setDistrict(districts.result);
            };
        };
        unsub();
        return()=>{
            unsub();
        };
    },[districts, buildingServices]);

    useEffect(()=>{
        const unsub = ()=>{
            if(editing){
                if(complex){
                    if(servtoComplex && servtoComplex.result){
                        setAddress(complex.address);
                        setCompany(complex.company);
                        let selectedComplexDistrict;
                        if(complex.district_id !== ''){
                            selectedComplexDistrict = districts && districts.result.filter(item=> item.id == complex.district_id);
                            setDistrict(selectedComplexDistrict ? selectedComplexDistrict[0].district_name :'');
                            setDistrictId(selectedComplexDistrict ? selectedComplexDistrict[0].id :'');
                        };
                        const selectedComplexServices = servtoComplex && servtoComplex.result.filter(item => item.complex_id == complex.id);
                        const notSureServiceIds = selectedComplexServices.map(service => service.service_id);
                        if(notSureServiceIds[0] !== null){
                            setServiceId(prevIds => [...prevIds, ...notSureServiceIds]);
                        }
                        selectedComplexServices.forEach((service, index) => {
                            if(service.service_id !== null){
                                const selectedServices = buildingServices && buildingServices.result.filter(item=> item.id == service.service_id)
                                setServices(prevServices => [...prevServices, ...selectedServices]);
                                setThingId(prevThingId => {
                                    const updatedThingId = [...prevThingId];
                                    if (!updatedThingId[index]) {
                                        updatedThingId[index] = {};
                                    }
                                    updatedThingId[index][service.service_id] = service.thing_id;
                                    return updatedThingId;
                                });
                            }
                        });
                    }
                }
            };
        };
        unsub();
        return()=>{
            unsub();
        };
    },[editing, complex, buildingServices]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        var formData = new FormData();
        formData.append('address', address);
        formData.append('company', company);
        formData.append('districtId', districtId);
        formData.append('thingIds', JSON.stringify(thingId));
        for(var index = 0; index < serviceId.length; index++){
            const sid = serviceId[index];
            formData.append('serviceIds', sid)
        }
        handleFormSubmit(formData);
        try{
            const response = await Axios.post('http://localhost:3001/api/complexes/insert', formData, {
                headers: {
                    "x-access-token": context.userAccessToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
        if (response.status === 200) {
            handleFormSubmit(response.status); 
            setAddress('');
            setCompany(''); 
            setDistrict('');
            setDistrictId('');
            setServiceId([]);
            setThingId([]);
            setShowRegForm(false);
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    const handleEdit = async (event) => {
        event.preventDefault();
        var formData = new FormData();
        formData.append('address', address);
        formData.append('company', company);
        formData.append('districtId', districtId);
        formData.append('thingIds', JSON.stringify(thingId));
        for(var index = 0; index < serviceId.length; index++){
            const sid = serviceId[index];
            formData.append('serviceIds', sid)
        }
        handleFormSubmit(formData);
        try{
            const response = await Axios.put(`http://localhost:3001/api/updateComplex/${complex.id}`, formData, {
                headers: {
                    "x-access-token": context.userAccessToken,
                    'Content-Type': 'multipart/form-data',
                },
            });
        if (response.status === 200) {
            handleFormSubmit(response.status);
            setAddress('');
            setCompany(''); 
            setDistrict('');
            setDistrictId('');
            setServiceId([]);
            setThingId([]);
            setComplex('');
            setEditing(false);
        } else {
            const error = await response.data;
            alert('Failed to authenticate: ' + error);
        }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    const handleDistrict = (e)=>{
        setDistrict(e.target.value);
        const selectedDistrict = districts && districts.result.find((item) => item.district_name === e.target.value);
        setDistrictId(selectedDistrict ? selectedDistrict.id : '');
    };

    const handleService = (e) => {
        const selectedService = buildingServices && buildingServices.result.find((servitem) => servitem.service_name === e.target.value);
        setServices([...services, selectedService]);
        setServiceId([...serviceId, selectedService.id]);
    };

    const handleThingId = (index, itemId, thingIdValue) => {
        setThingId(prevThingId => {
            const updatedThingId = [...prevThingId];
            if (!updatedThingId[index]) {
                updatedThingId[index] = {};
            }
            updatedThingId[index][itemId] = thingIdValue;
            return updatedThingId;
        });
    };

    const removeService = (service, listItemIndex) => {
        const updatedServices = services.filter((serviceItem, index) => {
            if (serviceItem.id === service.id) {
                return index !== listItemIndex;
            }
            return true; 
        });
    
        setServices(updatedServices);
    
        const updatedServiceIds = updatedServices.map(serviceItem => serviceItem.id);
        setServiceId(updatedServiceIds);

        if (listItemIndex !== -1) {
            setThingId(prevThingId => {
                const updatedThingId = [...prevThingId];
                updatedThingId.splice(listItemIndex, 1);
                return updatedThingId;
            });
        }
    };
    
    return (
        <div className='complexRegisterWrapper'>
            <div onClick={()=>{setShowRegForm(false); setEditing(false)}} className='RegisterTitleWrapper'>
                <div>
                    <BackBtnIcon/>
                </div>
                <div>
                    {
                        editing ? (
                            <h2 className='RegisterTitle'>Update complex</h2>
                        ):(
                            <h2 className='RegisterTitle'>Registration</h2>
                        )
                    }
                </div>
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Address</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter Address"
                />
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>District</span>
                </div>
                <div className='district'>
                    <label>
                        <select className='selectBox' required onChange={(e)=> {handleDistrict(e)}} value={district}>
                            <option className='optionItem'></option>
                            { districts && districts.result.map(item =>(
                                <option className='optionItem' value={item.district_name} key={item.id}>{item.district_name}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Service</span>
                </div>
                <div className='district'>
                    <label>
                        <div className="proj-multi-select-dropdown-cont">
                            <div>
                                {services && services.map((serviceItem, index) => (
                                    <div key={index}>
                                        <span onClick={() => removeService(serviceItem, index)}>
                                            {`${serviceItem.service_name}`} &#10005;
                                        </span>
                                        <label>
                                            <span>ThingId: </span>
                                            <input
                                                type='text'
                                                value={thingId[index] && thingId[index][serviceItem && serviceItem.id] || ''}
                                                onChange={(e) => handleThingId(index, serviceItem.id, e.target.value)}
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <select className='selectBox' required onChange={(e)=> {handleService(e)}} value={district}>
                            <option className='optionItem'></option>
                            { buildingServices && buildingServices.result.map(item =>(
                                <option className='optionItem' value={item.service_name} key={item.id}>{item.service_name}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
            <div className='RegisterFormWrapper'>
                <div>
                    <span className='RegisterFormText'>Company</span>
                </div>
                <input
                    className='RegisterInputStyles'
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter company name"
                />
            </div>
            <div className='RegisterBtnContainer'>
                <button onClick={(e)=>{editing ? handleEdit(e) : handleSubmit(e)}} type="submit" className='RegisterBtn'>{editing ? "Update":"Register"}</button>
            </div>
        </div>
    )
}