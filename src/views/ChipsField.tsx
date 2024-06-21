import React from 'react';
import {  FieldProps } from 'formik';
import { Box, Chip, FormControl, FormHelperText } from '@mui/material';


interface ChipOption {
  label: string;
  value: number;
}

interface ChipsFieldProps extends FieldProps {
  options: ChipOption[];
}

const ChipsField: React.FC<ChipsFieldProps> = ({ field, form, options }) => {

  const { name } = field;
  const { touched, errors, setFieldValue } = form;

  const handleChipClick = (value: number) => {
    setFieldValue(field.name, value);
  };

  // console.log(errors)

  const fieldError = errors[name];
  // console.log(fieldError)
  const showError = touched[name] && Boolean(fieldError);

  const errorMessage = typeof fieldError === 'string' ? fieldError : 'Invalid selection';



  return (
    <FormControl error={showError} component="fieldset">
    <Box display="flex" flexWrap="wrap" gap={1}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          onClick={() => handleChipClick(option.value)}
          color={field.value === option.value ? 'primary' : 'default'}
          clickable
        />
      ))}
    </Box>
    {showError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default ChipsField
