import {useContext} from 'react'
import AuxiliarContext from '../context/AuxiliarProvider'



const useAuxiliares = () =>{
  return useContext(AuxiliarContext)
}
export default useAuxiliares