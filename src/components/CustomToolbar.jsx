import React from 'react';
import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

import './UsersList.css'

const CustomToolbar = () => {
    return (
        <GridToolbarContainer style={{ display: 'flex', justifyContent: 'center' }}>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
};

export default CustomToolbar;




