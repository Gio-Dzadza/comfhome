import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import '../ListsParentStyles.css';
import UsersList from "../../components/UsersList";
import UserRegisterForm from "../../components/UserRegisterForm";

export default function AdminPage() {
    const[url, setUrl] = useState('https://admincomforthome.online/api/get');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [updateList, setUpdateList] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const [permission, setPermission] = useState(false);
    const [editing, setEditing] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [userId, setUserId] = useState('');
    const context = useAuthContext();
    
    useEffect(() => {
        if (formSubmitted) {
            setUrl((prevUrl) => prevUrl + "?timestamp=" + Date.now());
            setFormSubmitted(false); 
        };
    }, [formSubmitted]);

    useEffect(()=>{
        if(context.user){
            if(context.user.user_type_id === 1){
                setPermission(true);
                setShowPage(true);
            }
        } else{
            setShowPage(false);
            setPermission(false);
        };
    },[context]);

    const handleFormSubmit = () => {
        setFormSubmitted(true);
        setUpdateList(true);
    };

return (
    <div className="container">
        {
            showPage && (
                <>
                    {
                        permission && (
                            <UserRegisterForm 
                                handleFormSubmit={handleFormSubmit} 
                                editing={editing} 
                                setEditing={setEditing} 
                                userPhone={userPhone} 
                                setUserPhone={setUserPhone}
                                userId={userId}
                                setUserId={setUserId}
                            />
                        )
                    }
                    <UsersList 
                        updateList = {updateList} 
                        setUpdateList = {setUpdateList} 
                        setEditing={setEditing} 
                        setUserPhone={setUserPhone} 
                        setUserId={setUserId}
                    />
                </>
            ) 
        }
    </div>
)
}

