import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Button } from '@mui/material';
import '../ListsParentStyles.css'
import ProfessionsList from "../../components/ProfessionsList";
import ProfessionsRegisterForm from "../../components/ProfessionsRegisterForm";


export default function Professions() {
    const[url, setUrl] = useState('http://localhost:3001/api/profapi/get/professions');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);

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
            if(context.user.User_Type_id === 1){
                setPermission(true);
            } else if(context.user.User_Type_id === 4){
                setPermission(true);
            } else{
                setPermission(false);
            };
        } else{
            setShowPage(false);
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
                                <Button className='grid-parent-add-btn' onClick={showForm}>პროფესიის დამატება</Button>
                            </div>
                        ) 
                    }
                    { showRegForm && (
                        <div  className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <ProfessionsRegisterForm handleFormSubmit={handleFormSubmit} setShowRegForm={setShowRegForm} /> 
                        </div>
                    )
                    }
                    <ProfessionsList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            )
        }
    </div>
)
}
