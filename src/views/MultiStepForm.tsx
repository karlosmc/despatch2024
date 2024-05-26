import { Form, Formik, FormikConfig, FormikHelpers, FormikValues } from 'formik'
import React, { useState } from 'react'
import FormNavigation from './FormNavigation'


interface Props extends FormikConfig<FormikValues>{
  children : React.ReactNode
}
const MultiStepForm = ({children, initialValues,onSubmit}:Props) => {
  
  const [stepNumber, setStepNumber] = useState<number>(0)

  const steps = React.Children.toArray(children) as React.ReactElement[];

  const [snapShot, setSnapShot] = useState(initialValues);


  const step = steps[stepNumber] ;

  const totalSteps = steps.length;

  const isLastStep = stepNumber === totalSteps -1;


  const next = (values:FormikValues)=>{
    setSnapShot(values);
    setStepNumber(stepNumber+1);
  }

  const previous= (values:FormikValues)=>{
    setSnapShot(values);
    setStepNumber(stepNumber-1);
  }

  const handleSubmit= async(values:FormikValues,actions:FormikHelpers<FormikValues>) =>{
    if(step.props.onSubmit){
      await step.props.onSubmit(values)
    }
    if(isLastStep){
      return onSubmit(values,actions)
    }else{
      actions.setTouched({});
      next(values)
    }
  }

  return <div>
    <Formik 
      initialValues={{}} 
      onSubmit={handleSubmit} 
      validationSchema={step.props.validationSchema}
    >
      {(formik) => (
          <Form>
            {step}
            <FormNavigation 
              isLastStep={isLastStep}
              hasPrevious={stepNumber >0}
              onBackClick={()=>previous(formik.values)}
            />
          </Form>
      )
      }
    </Formik>
  </div>
}

export default MultiStepForm

export const FormStep = ({stepName = '', children}:any) => children;