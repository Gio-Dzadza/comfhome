import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import NewsRegisterForm from "../../components/NewsRegisterForm";
import NewsList from "../../components/NewsList";
import { Button } from '@mui/material';
import '../ListsParentStyles.css'


export default function News() {
    const[url, setUrl] = useState('http://localhost:3001/api/newsapi/get/news');
    const[showRegForm, setShowRegForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);

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

    console.log(url);

return (
    <div className="data-grid-parent">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <>
                                <div className='grid-parent-add-btn-container'>
                                    <Button className='grid-parent-add-btn' onClick={showForm}>სიახლის დამატება</Button>
                                </div>
                            </>
                        )
                    }
                    { showRegForm && (
                        <div className={ showRegForm ? 'modal-window-show' : 'modal-window' }>
                            <NewsRegisterForm handleFormSubmit={handleFormSubmit} setShowRegForm={setShowRegForm} />
                        </div>
                    ) 
                    }
                    <NewsList updateList = {updateList} setUpdateList = {setUpdateList} />
                </>
            )
        }
    </div>
)
}
