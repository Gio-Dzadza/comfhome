import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Button } from '@mui/material';
import '../ListsParentStyles.css'
import PartnerRegisterForm from "../../components/PartnerRegisterForm";
import PartnersList from "../../components/PartnersList";


export default function Partners() {
    const[url, setUrl] = useState('http://localhost:3001/api/partners/get/partners');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);

    console.log(url)

    const context = useAuthContext();

    useEffect(() => {
        if (formSubmitted) {
            setUrl((prevUrl) => prevUrl + "?timestamp=" + Date.now());
            setFormSubmitted(false); 
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
                                <Button className='grid-parent-add-btn' onClick={showForm}>პარტნიორის დამატება</Button>
                            </div>
                        ) 
                    }
                    { showRegForm && (
                        <div  className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <PartnerRegisterForm handleFormSubmit={handleFormSubmit} setShowRegForm={setShowRegForm} /> 
                        </div>
                    )
                    }
                    <PartnersList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            )
        }
    </div>
)
}
