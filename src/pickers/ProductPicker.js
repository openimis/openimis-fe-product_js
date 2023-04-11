import React, { useState } from "react";
import { TextField } from "@material-ui/core";
import { Autocomplete, useModulesManager, useTranslations } from "@openimis/fe-core";
import { useProductsQuery } from "../hooks";

const ProductPicker = (props) => {
  const {
    multiple,
    required,
    label,
    nullLabel,
    withLabel = false,
    placeholder,
    withPlaceholder = false,
    readOnly,
    value,
    onChange,
    filter,
    filterSelectedOptions,
    locationId,
  } = props;

  const modulesManager = useModulesManager();
  const [filters, setFilters] = useState({ location: locationId });
  const { formatMessage } = useTranslations("product", modulesManager);
  const { isLoading, error, data } = useProductsQuery({ filters }, { skip: true });

  const onOpen = () => {
    setFilters({ first: 15, location: locationId });
  };

  return (
    <Autocomplete
      multiple={multiple}
      error={error}
      readOnly={readOnly}
      options={data.products ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={(value) => onChange(value, value ? `${value.code} ${value.name}` : null)}
      onOpen={onOpen}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(search) => setFilters({ first: 15, search, location: locationId })}
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          required={required}
          label={withLabel && (label || nullLabel)}
          placeholder={withPlaceholder && (placeholder || formatMessage("Search..."))}
        />
      )}
    />
  );
};

export default ProductPicker;
