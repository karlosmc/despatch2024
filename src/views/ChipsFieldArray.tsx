import React, { MouseEvent,  useEffect } from 'react';
import {  FieldProps } from 'formik';
import {  Box, Chip, FormControl, Tooltip } from '@mui/material';


import {  useAuxiliares } from '../context/AuxiliarProvider';






interface ChipsFieldPropsArray extends FieldProps {
  // options: indicadoresType[];

  // indicadores:indicadoresType[];
  // setIndicadores:React.Dispatch<SetStateAction<indicadoresType[]>>
  
}

const ChipsFieldArray: React.FC<ChipsFieldPropsArray> = ({ field, form }) => {

  

  const { name } = field;
  const { touched, errors, setFieldValue } = form;

  // console.log(field)

  const {indicadores,setIndicadores} = useAuxiliares();

  

  // useEffect(() => {

  //   console.log('indicadores',value)
  //   if(value.length>0){
      
  //     const filterIndicadores = indicadores.map((item:indicadoresType) => {
  //       return { ...item,selected:(item.id===value?true:false)}
  //     })
  //     setIndicadores(filterIndicadores)
  //     // setFirstOpen(true)
  //   }
  // }, [])

  // useEffect(() => {
  //   console.log('firsopen',firstOpen)
  //   if(!firstOpen){
  //     const filterIndicadores = indicadores.filter(item => item.selected).map(filtrados => filtrados.id)
  //     console.log(filterIndicadores)
  //     setFieldValue('indicadores', filterIndicadores)
  //   }
  // }, [indicadores])

  useEffect(() => {
    // console.log(indicadores)
      const filterIndicadores = indicadores.filter(item => item.selected).map(filtrados => filtrados.id)
      // console.log(filterIndicadores)
      // console.log('useefect',value)
      setFieldValue('indicadores', filterIndicadores)
    }
    
  , [indicadores])

  // console.log(errors)

  const fieldError = errors[name];
  // console.log(fieldError)
  const showError = touched[name] && Boolean(fieldError);

  // const errorMessage = typeof fieldError === 'string' ? fieldError : 'Invalid selection';



  const handleClickIndicator = (evt: MouseEvent<HTMLDivElement>) => {
    
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;

   

    setIndicadores((prevState) =>
      prevState.map((indi) =>
        indi.id === spanChip ? { ...indi, selected: !indi.selected } : indi
      )
    );
    
  }

    return (
      <FormControl error={showError} component="fieldset">
        <Box display='flex' justifyContent='center' flexDirection='row' alignContent='center'>
        {
              indicadores.map((indicador) => {
              return (
                <Tooltip title={indicador.name} key={indicador.id}>
                  <Chip
                    sx={{
                      height: "auto",
                      margin: 1,
                      py: 1,
                      width: 180,
                      "& .MuiChip-label": {
                        display: "block",
                        whiteSpace: "normal",
                        textAlign: "center",
                        fontWeight: "bold",
                      },
                      color: "white",
                    }}
                    id={indicador.id}
                    label={indicador.tooltip}
                    key={indicador.id}
                    color={indicador.selected ? "success" : "default"}
                    clickable={true}
                    onClick={handleClickIndicator}
                    icon={indicador.icon}
                  />
                </Tooltip>
              )
            })
            }
        </Box>

       
        {/* {showError && <FormHelperText>{errorMessage}</FormHelperText>} */}
      </FormControl>
    );
  
  }

  export default ChipsFieldArray
