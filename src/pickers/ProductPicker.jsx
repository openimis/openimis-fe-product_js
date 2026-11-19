import React, { useMemo, useState } from "react";
import moment from "moment";

import { TextField, Tooltip } from "@mui/material";

import { Autocomplete, useModulesManager, useTranslations } from "@openimis/fe-core";
import { DATE_FORMAT, EMPTY_STRING, PRODUCT_QUANTITY_LIMIT } from "../constants";
import { useProductsQuery } from "../hooks";

// The variables while the picker is closed and has never been opened: the query is skipped,
// and unchanged variables keep it from fetching when the props change.
const NOT_OPENED = {};

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
    enrollmentDate,
  } = props;

  const modulesManager = useModulesManager();
  // The search the user asked for: undefined until the picker is opened, null when it opens
  // with nothing typed. The query variables are derived from it and from the props, so a
  // location or enrolment date that arrives after the user typed (the policy form renders
  // before its family is fetched) searches again.
  const [search, setSearch] = useState();
  const filters = useMemo(() => {
    if (search === undefined) return NOT_OPENED;
    const date = moment(enrollmentDate);
    return {
      first: PRODUCT_QUANTITY_LIMIT,
      search: search ?? undefined,
      location: locationId,
      // No enrolment date (null) yet: no date filter rather than an invalid DateTime, which
      // the backend rejects, leaving the picker with no options.
      ...(date.isValid() && { dateFrom: date.format(DATE_FORMAT), dateTo: date.format(DATE_FORMAT) }),
    };
  }, [search, locationId, enrollmentDate]);
  const [currentString, setCurrentString] = useState(EMPTY_STRING);
  const { formatMessage, formatMessageWithValues } = useTranslations("product", modulesManager);
  const {
    isLoading,
    error,
    data: { products },
  } = useProductsQuery({ filters }, { skip: true });
  const shouldShowTooltip = products.length >= PRODUCT_QUANTITY_LIMIT && !value && !currentString;

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      error={error}
      readOnly={readOnly}
      options={products ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={(value) => onChange(value, value ? `${value.code} ${value.name}` : null)}
      setCurrentString={setCurrentString}
      filterOptions={filter}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={(typed) => setSearch(typed ?? null)}
      renderInput={(inputProps) => (
        <Tooltip
          title={
            shouldShowTooltip
              ? formatMessageWithValues("ProductPicker.aboveLimit", { limit: PRODUCT_QUANTITY_LIMIT })
              : EMPTY_STRING
          }
        >
          <TextField
            {...inputProps}
            required={required}
            label={(withLabel && (label || nullLabel)) || formatMessage("Product")}
            placeholder={(withPlaceholder && placeholder) || formatMessage("ProductPicker.placeholder")}
          />
        </Tooltip>
      )}
    />
  );
};

export default ProductPicker;
