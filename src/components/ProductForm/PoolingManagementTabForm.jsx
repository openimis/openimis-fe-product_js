import React, { useState, useEffect } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { combine, useTranslations, useModulesManager, FormattedMessage, NumberInput } from "@openimis/fe-core";
import SectionTitle from "../SectionTitle";

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const StyledSectionHeader = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
  paddingBottom: 0,
}));

const StyledSectionTitle = styled('div')(({ theme }) => ({
  ...theme.typography?.title ?? {},
}));

const StyledTable = styled('div')(({ theme }) => ({
  tableLayout: "fixed",
}));

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledTableHeader = styled('div')(({ theme }) => ({
  ...theme.table?.header ?? {},
}));

const parseCycle = (cycle) => {
  const [date, month] = cycle?.split("-") ?? [];
  return { date: parseInt(date, 10), month: parseInt(month, 10), untouched: true };
};

const CycleInput = React.memo((props) => {
  const { className, module, label, value, required, readOnly, onChange } = props;
  const [currentValue, setCurrentValue] = useState(parseCycle(value));

  useEffect(() => {
    setCurrentValue(parseCycle(value));
  }, [value]);

  useEffect(() => {
    if (currentValue.date && currentValue.month) {
      onChange(
        `${Number(currentValue.date).toString().padStart(2, "0")}-${Number(currentValue.month)
          .toString()
          .padStart(2, "0")}`,
      );
    } else if (!currentValue.date && value) {
      onChange(null);
    }
  }, [currentValue]);

  const { date } = currentValue;
  return (
    <Box className={className}>
      <Typography>
        <FormattedMessage module={module} id={label} />
      </Typography>
      <Grid container direction="row" spacing={1}>
        <Grid xs>
          <NumberInput
            min={1}
            max={31}
            module="product"
            label="CycleInput.date"
            value={date ?? undefined}
            required={required}
            readOnly={readOnly}
            onChange={(date) => setCurrentValue({ date })}
          />
        </Grid>
        <Grid xs>
          <NumberInput
            module="product"
            label="CycleInput.month"
            min={1}
            max={12}
            value={currentValue.month}
            required={required || Boolean(currentValue.date)}
            readOnly={readOnly}
            onChange={(month) => setCurrentValue({ ...currentValue, month })}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

const PoolingManagementTabForm = (props) => {
  const { edited, onEditedChanged, readOnly } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product.PoolingManagementTabForm", modulesManager);

  return (
    <Grid container>
      <Grid size={12}>
        <SectionTitle label={formatMessage("startCyclesSectionTitle")} />
      </Grid>
      <Grid container size={12}>
        <Grid size={2} component={StyledItem}>
          <CycleInput
            readOnly={readOnly}
            module="product"
            label="startCycle1"
            value={edited.startCycle1}
            onChange={(startCycle1) => onEditedChanged({ ...edited, startCycle1 })}
          />
        </Grid>
        <Grid size={2} component={StyledItem}>
          <CycleInput
            readOnly={readOnly}
            module="product"
            label="startCycle2"
            value={edited.startCycle2}
            onChange={(startCycle2) => onEditedChanged({ ...edited, startCycle2 })}
          />
        </Grid>
        <Grid size={2} component={StyledItem}>
          <CycleInput
            readOnly={readOnly}
            module="product"
            label="startCycle3"
            value={edited.startCycle3}
            onChange={(startCycle3) => onEditedChanged({ ...edited, startCycle3 })}
          />
        </Grid>
        <Grid size={2} component={StyledItem}>
          <CycleInput
            readOnly={readOnly}
            module="product"
            label="startCycle4"
            value={edited.startCycle4}
            onChange={(startCycle4) => onEditedChanged({ ...edited, startCycle4 })}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PoolingManagementTabForm;
