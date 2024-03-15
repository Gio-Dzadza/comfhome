import React from 'react';
import { GridToolbar, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

import './UsersList.css' // Import the CSS file

const CustomToolbar = () => {
    return (
        <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
            <GridToolbar  
                // sx = {{
                //     '& button':{
                //         color: '#545454',
                //         '&:hover':{
                //             backgroundColor: '#ffeccf',
                //         }
                //     },
                // }}
            />
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
};

export default CustomToolbar;




