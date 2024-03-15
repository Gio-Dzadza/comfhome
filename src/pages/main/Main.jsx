import React from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useState } from 'react';
import { useEffect } from 'react';
import SuperAdminPage from '../superadmin/SuperAdminPage';
import AdminPage from '../admin/AdminPage';

export default function Main() {
  const [superAdmin, setSuperAdmin] = useState(false);
  const context = useAuthContext();

  useEffect(()=>{
    const unsub = ()=>{
      if(context && context.user.user_type_id === 3){
        setSuperAdmin(true);
      }
    };
    unsub();
    return ()=>{
      unsub();
    };
  },[context])

  return (
    <>
      {
        superAdmin ? (
          <SuperAdminPage />
        ):(
          <AdminPage />
        )
      }
    </>
  )
}
