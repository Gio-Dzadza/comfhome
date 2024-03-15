import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3bb09e', 
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: '#3bb09e', 
                },
            },
        },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        color: '#3bb09e', 
                    },
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3bb09e', 
                        },
                    },
                },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#3bb09e',
                    borderColor: '#3bb09e', 
                    fontFamily: 'FiraGO, sans-serif', 
                    color: '#ffff',
                    '&:hover': {
                        backgroundColor: '#3bb09e', 
                        borderColor: '#3bb09e',
                    },
                }
            }
        },
    },
});

export default theme;