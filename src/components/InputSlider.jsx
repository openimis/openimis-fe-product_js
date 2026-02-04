import React from "react";
import { Typography, Slider, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import { combine, NumberInput } from "@openimis/fe-core";

const StyledRoot = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
  paddingBlock: 0,
}));

const StyledInput = styled('div')(({ theme }) => ({
  width: 50,
}));

const InputSlider = (props) => {
  const { value, label, required, className, onChange, readOnly } = props;

  const handleSlideChange = (event, newValue) => onChange(newValue);
  const handleInputChange = (newValue) => {
    onChange(newValue || 0);
  };

  const handleBlur = () => {
    if (value < 0) onChange(0);
    else if (value > 100) onChange(100);
  };

  return (
    <div className={className}>
      {label && (
        <Typography gutterBottom>
          {label}
          {required && "*"}
        </Typography>
      )}
      <Grid container alignItems="center" spacing={2} component={StyledRoot}>
        <Grid xs>
          <Slider disabled={readOnly} value={value ?? 0} onChange={handleSlideChange} />
        </Grid>
        <Grid component={StyledInput}>
          <NumberInput
            required={required}
            readOnly={readOnly}
            value={value ?? 0}
            max={100}
            onBlur={handleBlur}
            min={0}
            displayZero
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default InputSlider;
