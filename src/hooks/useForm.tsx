import { useState } from "react"


import { DocTest } from "../types/doc.interface"


export const useForm = (initialForm:DocTest) =>{


  const [form, setForm] = useState<DocTest>(initialForm)
  const [errors, setErrors] = useState<DocTest>(initialForm)
  const [loading, setLoading] = useState<Boolean>(false)

  const [response, setResponse] = useState<any>(null)

  const handleChangeForm = (_e) => {};
  const handleBlurForm= (_e) =>{}
  const handleSubmitForm = (_e) =>{}

  return {
    form,
    errors,
    loading,
    response,
    handleChangeForm,
    handleBlurForm,
    handleSubmitForm
  }



}