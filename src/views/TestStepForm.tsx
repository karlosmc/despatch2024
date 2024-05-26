import { Button, TextField } from '@mui/material'
import { Formik } from 'formik'

import * as yup from 'yup'
import InputField from '../components/InputField'
import MultiStepForm, { FormStep } from './MultiStepForm'


const validationSchema = yup.object({

  name: yup.string().required('Se requiere el name'),
  email: yup.string().email().required('Debe ingresar un email')
});

const TestStepForm = () => {
  return (
    <div className='App'>
      <header className='App-header'>
        <MultiStepForm

          initialValues={{
            name: '',
            email: ''
          }}
          onSubmit={values => {
            alert(JSON.stringify(values, null, 2))
          }}
          validationSchema={validationSchema}
        >

          <FormStep stepName='Person' onSubmit={()=>console.log('Step1 Submit')}>
          <TextField
                fullWidth
                id='name'
                name='name'
                label='Name'
             
              />
              <TextField
                fullWidth
                id='email'
                name='email'
                label='Email'
              
              />
          </FormStep>
         
        </MultiStepForm>

      </header>

    </div>
  )
}

export default TestStepForm