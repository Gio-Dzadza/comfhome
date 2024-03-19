import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
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
        console.log(status)
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
    <div className="container">
        {
            showPage && (
                <>
                    {
                        permission && !editing && !showRegForm && (
                            <div className='container col-lg-3 d-flex justify-content-center addBtnWrapper'>
                                <button className='addBtn' onClick={showForm}>Add Building</button>
                            </div>
                        )
                    }
                    { showRegForm && (
                        <div className="container">
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
                        <div className="container">
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
                    {
                        !showRegForm && !editing && (
                            <ComplexesList 
                                updateList = {updateList} 
                                setUpdateList = {setUpdateList} 
                                setComplex={setComplex}
                                setEditing={setEditing}
                                handleFormSubmit={handleFormSubmit}
                            />
                        )
                    }
                </>
            ) 
        }
    </div>
)
}

