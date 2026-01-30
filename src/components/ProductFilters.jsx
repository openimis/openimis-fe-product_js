import React from "react";
import moment from "moment";

import { FormControlLabel, Grid, Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  combine,
  ControlledField,
  PublishedComponent,
  decodeId,
  TextInput,
  useTranslations,
  withModulesManager,
  useDebounceCb,
} from "@openimis/fe-core";

const StyledForm = styled('section')(({ theme }) => ({
  padding: "0 0 10px 0",
  width: "100%",
}));

const StyledItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

const ProductFilters = (props) => {
  const { filters, onChangeFilters, modulesManager } = props;
  const { formatMessage } = useTranslations("product", modulesManager);

  const onValueChange = (id, value) => {
    onChangeFilters([{ id, value }]);
  };

  const onChangeDebounce = useDebounceCb(onValueChange, modulesManager.getConf("fe-admin", "debounceTime", 200));

  return (
    <StyledForm>
      <Grid container>
        <ControlledField
          module="product"
          id="code"
          field={
            <Grid size={3} component={StyledItem}>
              <TextInput
                module="product"
                name="code"
                label="code"
                value={filters?.code?.value || ""}
                onChange={(value) => onChangeDebounce("code", value)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="name"
          field={
            <Grid size={3} component={StyledItem}>
              <TextInput
                module="product"
                name="name"
                label="name"
                value={filters?.name?.value || ""}
                onChange={(value) => onChangeDebounce("name", value)}
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="region"
          field={
            <Grid size={3} component={StyledItem}>
              <PublishedComponent
                pubRef="location.RegionPicker"
                value={filters.location?.value?.parent ?? filters.location?.value}
                withNull={true}
                onChange={(value) =>
                  onChangeFilters([{ id: "location", value: value, filter: value ? decodeId(value.id) : null }])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="district"
          field={
            <Grid size={3} component={StyledItem}>
              <PublishedComponent
                pubRef="location.DistrictPicker"
                value={filters.location?.value?.parent ? filters.location?.value : null}
                region={filters.location?.value?.parent ? filters.location?.value?.parent : filters.location?.value}
                key={filters.location?.value?.parent}
                withNull={true}
                onChange={(value) => {
                  if (!value) {
                    value = filters.location?.value?.parent;
                  }
                  onChangeFilters([{ id: "location", value: value, filter: value ? decodeId(value.id) : null }]);
                }}
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="product.dateFrom"
          field={
            <Grid size={3} component={StyledItem}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={filters?.dateFrom?.value}
                module="product"
                label="product.dateFrom"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "dateFrom",
                      value: d,
                      filter: d ? moment(d).format() : null,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="product.dateTo"
          field={
            <Grid size={3} component={StyledItem}>
              <PublishedComponent
                pubRef="core.DatePicker"
                value={filters?.dateTo?.value}
                module="product"
                label="product.dateTo"
                onChange={(d) =>
                  onChangeFilters([
                    {
                      id: "dateTo",
                      value: d,
                      filter: d ? moment(d).format() : null,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        <ControlledField
          module="product"
          id="showHistory"
          field={
            <Grid size={3} component={StyledItem}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={!!filters?.showHistory?.value}
                    onChange={() =>
                      onChangeFilters([
                        {
                          id: "showHistory",
                          value: !filters?.showHistory?.value,
                        },
                      ])
                    }
                  />
                }
                label={formatMessage("product.ProductFilters.showHistory")}
              />
            </Grid>
          }
        />
      </Grid>
    </StyledForm>
  );
};

const enhance = combine(withModulesManager);

export { StyledForm };
export default enhance(ProductFilters);
