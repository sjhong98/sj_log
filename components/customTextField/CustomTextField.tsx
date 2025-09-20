import { TextField, TextFieldProps } from "@mui/material"

const CustomTextField = ({ ...props }: TextFieldProps) => {
    return (
        <TextField
            fullWidth
            variant="outlined"
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#010101',
                    border: 'none',
                    '& fieldset': {
                        border: 'none',
                    },
                    '&:hover fieldset': {
                        border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                        border: 'none',
                    },
                },
                '& .MuiInputLabel-root': {
                    color: '#ccc',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ccc',
                },
                '& .MuiOutlinedInput-input': {
                    color: '#fff',
                },
            }}
            autoComplete="off"
            {...props}
        />
    )
}

export default CustomTextField