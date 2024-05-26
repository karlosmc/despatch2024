import React, { useState } from 'react';
import { useFormik, FormikProps, FormikErrors, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { Box, Stepper, Step, StepLabel, Button, Grid, Typography } from '@mui/material';
import AccountDetails from './AccountDetails';
import PersonalInfo from './PersonalInfo';
import ReviewInfo from './ReviewInfo';

const steps = ['Account Details', 'Personal Info', 'Review and Submit'];


interface Person {
  firstName: string;
  lastName: string;
  phone: string;
  residence: string;
}

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  residence: string;
  obligado:string;
  indicadores:string[]
}


const initialValues: FormValues = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  residence: '',
  obligado:'',
  indicadores:[]

};

const validationSchemas = [
  Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
  }),
  Yup.object({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    phone: Yup.string().required('Phone is required'),
    residence: Yup.string().required('Residence is required'),
    obligado:Yup.number().typeError('Debe elegir una opción'),
    indicadores:Yup.array().min(1,'Debe elegir por lo menos 1 indicador'),
  }),
  Yup.object(),
];

const MultiStep = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLastStep = activeStep === steps.length - 1;

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchemas[activeStep],
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values, { setSubmitting }) => {
      if (isLastStep) {
        console.log('Form Submitted:', values);
      } else {
        setActiveStep((prev) => prev + 1);
      }
      setSubmitting(false);
    },
  });

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const formContent = (step: number) => {
    switch (step) {
      case 0:
        return <AccountDetails formik={formik} />;
      case 1:
        return <PersonalInfo formik={formik} />;
      case 2:
        return <ReviewInfo formik={formik} />;
      default:
        return <Typography variant="h6">Not Found</Typography>;
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <FormikProvider  value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {formContent(activeStep)}
            </Grid>
            {submitError && (
              <Grid item xs={12}>
                <Typography color="error">error{submitError}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                {isLastStep ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormikProvider>
    </Box>
  );
};

export default MultiStep;