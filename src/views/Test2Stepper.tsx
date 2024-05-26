import { Box, Button, Card, CardContent, Checkbox, FormControlLabel } from '@mui/material'
import { Field, Form, Formik, FormikConfig, FormikValues } from 'formik'
import { CheckboxWithLabel, TextField } from 'formik-mui'
import React, { useState } from 'react'
import * as yup from 'yup'

export default function Test2Stepper() {
  return (
    <Card>
      <CardContent>
        <FormikStepper
          validationSchema={
            yup.object({
              money: yup.number().when('millionaire', ([millionaire], schema) => {
                return millionaire ? schema.required().min(1_000_000, 'Eres millonario debes poner millones') : schema.required()
              }),

            })
          }
          initialValues={{
            firstName: '',
            lastName: '',
            millionaire: false,
            money: 0,
            description: ''
          }}
          onSubmit={() => { }}
        >
          <Form autoComplete='off'>
            <div>
              <Field name='firstName' component={TextField} label='first name' />
              <Field name='lastName' component={TextField} label='last name' />
              <Field
                type='checkbox'
                name='millionaire'
                component={CheckboxWithLabel}
                Label={{ label: 'Millonarie' }}
              />
            </div>
            <div>
              <Field type='number' name='money' component={TextField} label='All Money' />
            </div>
            <div>
              <Field name='description' component={TextField} label='Description' />
            </div>
          </Form>
        </FormikStepper>
      </CardContent>
    </Card>
  )

}


interface Props extends FormikConfig<FormikValues> {
  children: React.ReactNode
}
export function FormikStepper({ children, ...props }: Props) {

  const childrenArray = React.Children.toArray(children) as React.ReactElement[]

  const [step, setStep] = useState(0);

  const currentChild = childrenArray[step]
  function isLastStep() {
    return step === childrenArray.length - 1
  }

  return (
    <Formik {...props} >
      <div>
        <Form autoComplete='off'>
          {currentChild}
          {step > 0 ? <Button onClick={() => setStep(s => s - 1)} >Back</Button> : null}
          <Button type='submit' >{isLastStep ? 'Submit' : 'Next'}</Button>
        </Form>
      </div>
    </Formik>
  )
}
