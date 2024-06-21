import { Box, Button } from '@mui/material';
import { FormikValues } from 'formik';



interface Props {
  hasPrevious?: boolean;
  onBackClick: (values: FormikValues) => void;
  isLastStep: boolean
}
const FormNavigation = (props: Props) => {
  return (
    <Box display='flex' mt={50} justifyContent='space-between' >
      {props.hasPrevious && (
        <Button type='button' variant='contained' onClick={props.onBackClick} >
          Back
        </Button>
      )}
      <Button type='submit' color='primary' variant='contained'>{props.isLastStep ? 'Submit' : 'Next'}</Button>
    </Box>
  )
}

export default FormNavigation 