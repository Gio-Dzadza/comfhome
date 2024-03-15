import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import ProjRegForm from "../../components/ProjRegForm";
import ProjList from "../../components/ProjList";
import { Button } from '@mui/material';
import '../ListsParentStyles.css'


export default function Project() {
    const[url, setUrl] = useState('http://localhost:3001/api/projectapi/get/projects');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);
    console.log(url);

    const context = useAuthContext();
    
    useEffect(() => {
        if (formSubmitted) {
          // Update the URL to trigger re-fetching of data in UsersList
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
        projects
        {/* {
            showPage && (
                <>
                    {
                        permission && (
                            <>
                                <div className='grid-parent-add-btn-container'>
                                    <Button className='grid-parent-add-btn' onClick={showForm}>პროექტის დამატება</Button>
                                </div>
                            </>
                        )
                    }
                    { showRegForm && (
                        <div className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <ProjRegForm handleFormSubmit={handleFormSubmit} setShowRegForm={setShowRegForm} />
                        </div>
                    ) 
                    }
                    <ProjList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            )
        } */}
    </div>
)
}
