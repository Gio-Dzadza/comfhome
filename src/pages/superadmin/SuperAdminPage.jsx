import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Button } from '@mui/material';
import '../ListsParentStyles.css';
import ComplexRegForm from "../../components/ComplexRegForm";
import ComplexesList from "../../components/ComplexesList";

export default function SuperAdminPage() {
    const[url, setUrl] = useState('http://localhost:3001/api/get/complexes');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);
    const [editing, setEditing] = useState(false);
    const [complex, setComplex] = useState('');

    const context = useAuthContext();
    
    useEffect(() => {
        if (formSubmitted) {
          // Update the URL to trigger re-fetching of data in UsersList
            setUrl((prevUrl) => prevUrl + "?timestamp=" + Date.now());
            setFormSubmitted(false); // Reset formSubmitted
        };
    }, [formSubmitted]);

    // console.log(url)

    useEffect(()=>{
        if(context.user){
            if(context.user.user_type_id === 3){
                setPermission(true);
                setShowPage(true);
            }
        } else{
            setShowPage(false);
            setPermission(false);
        };
    },[context]);

    const showForm = ()=>{
        setShowRegForm(true);
    }

    const handleFormSubmit = (status) => {
        if(editing){
            if(status === 200){
                alert("Updated successfully");
            };
        }else{
            if(status === 200){
                alert("Registered successfully");
            };
        };
        setFormSubmitted(true);
        setUpdateList(true);
        setShowRegForm(false);
        setEditing(false)
    };

return (
    <div className="data-grid-parent">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <div className='grid-parent-add-btn-container'>
                                <Button className='grid-parent-add-btn' onClick={showForm}>Add Building</Button>
                            </div>
                        )
                    }
                    { showRegForm && (
                        <div className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <ComplexRegForm 
                                className='modal-content' 
                                setShowRegForm={setShowRegForm} 
                                handleFormSubmit={handleFormSubmit}
                                editing={editing}
                                setEditing={setEditing}
                                complex={complex}
                                setComplex={setComplex}
                            /> 
                        </div>
                    ) 
                    }
                    { editing && (
                        <div className={ editing ? 'modal-window-show' : 'modal-window' }>
                            <ComplexRegForm 
                                className='modal-content' 
                                setShowRegForm={setShowRegForm} 
                                handleFormSubmit={handleFormSubmit}
                                editing={editing}
                                setEditing={setEditing}
                                complex={complex}
                                setComplex={setComplex}
                            /> 
                        </div>
                    ) 
                    }
                    <ComplexesList 
                        updateList = {updateList} 
                        setUpdateList = {setUpdateList} 
                        setComplex={setComplex}
                        setEditing={setEditing}
                    />
                </>
            ) 
        }
    </div>
)
}

