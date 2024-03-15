import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import DepartmentsList from "../../components/DepartmentsList";
import DepartmentRegisterForm from "../../components/DepartmentRegisterForm";
import { Button } from '@mui/material';
import '../ListsParentStyles.css'


export default function Departments() {
    const[url, setUrl] = useState('http://localhost:3001/api/depapi/get/deps');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);

    console.log(url)

    const context = useAuthContext();

    useEffect(() => {
        if (formSubmitted) {
          // Update the URL to trigger re-fetching of data 
            setUrl((prevUrl) => prevUrl + "?timestamp=" + Date.now());
            setFormSubmitted(false); // Reset formSubmitted
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(context.authIsReady){
            setShowPage(true);
            setPermission(true);
        } else{
            setShowPage(false);
            setPermission(false);
        };
    },[context]);

    const showForm = ()=>{
        setShowRegForm(true);
    }

    const handleFormSubmit = () => {
        setFormSubmitted(true);
        setUpdateList(true);
        setShowRegForm(false);
    };


return (
    <div className="data-grid-parent">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <div className='grid-parent-add-btn-container'>
                                <Button className='grid-parent-add-btn' onClick={showForm}>დეპარტამენტის დამატება</Button>
                            </div>
                        ) 
                    }
                    { showRegForm && (
                        <div  className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <DepartmentRegisterForm handleFormSubmit={handleFormSubmit} setShowRegForm={setShowRegForm} /> 
                        </div>
                    )
                    }
                    <DepartmentsList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            )
        }
    </div>
)
}
