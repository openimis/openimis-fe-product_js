import React, { useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import { Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  combine,
  NumberInput,
  PublishedComponent,
  TextInput,
  useModulesManager,
  useTranslations,
  ValidatedTextInput,
  withModulesManager,
} from "@openimis/fe-core";
import {
  clearProduct,
  fetchProduct,
  productCodeSetValid,
  productCodeValidationCheck,
  productCodeValidationClear,
} from "../../actions";
import SectionTitle from "../SectionTitle";

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const MainPanelForm = (props) => {
  const {
    autoFocus,
    edited,
    onEditedChanged,
    readOnly,
    isProductCodeValid,
    isProductCodeValidating,
    productCodeValidationError,
    isDuplicate,
  } = props;

  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product.FormMainPanel", modulesManager);

  useEffect(() => {
    if (edited?.id) dispatch(fetchProduct(modulesManager, { "productId": edited.id }));
    return () => dispatch(clearProduct());
  }, [edited?.id]);

  const shouldValidate = (inputValue) => {
    const { savedProductCode } = props;
    if ((!!edited.id && inputValue === savedProductCode) || (!savedProductCode && !!edited.id)) return false;
    return true;
  };

  return (
    <Grid container direction="row">
      <Grid size={3} component={StyledItem}>
        <ValidatedTextInput
          itemQueryIdentifier="productCode"
          action={productCodeValidationCheck}
          autoFocus={autoFocus}
          clearAction={productCodeValidationClear}
          setValidAction={productCodeSetValid}
          shouldValidate={shouldValidate}
          codeTakenLabel="product.alreadyTaken"
          readOnly={readOnly}
          isValid={isProductCodeValid}
          isValidating={isProductCodeValidating}
          validationError={productCodeValidationError}
          label="product.code"
          module="product"
          onChange={(code) => onEditedChanged({ ...edited, code })}
          required={true}
          value={edited?.code ?? ""}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module="product"
          required
          label="name"
          readOnly={readOnly}
          value={edited?.name ?? ""}
          onChange={(name) => onEditedChanged({ ...edited, name })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="location.RegionPicker"
          value={edited.location?.parent ?? edited.location}
          readOnly={readOnly}
          withNull={false}
          onChange={(location) => onEditedChanged({ ...edited, location })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          region={edited.location?.parent || edited.location}
          value={edited.location?.parent ? edited.location : null}
          pubRef="location.DistrictPicker"
          withNull={false}
          readOnly={readOnly}
          onChange={(location) => onEditedChanged({ ...edited, location: location || edited.location?.parent })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          module="product"
          required
          min={0}
          label="maxMembers"
          readOnly={readOnly}
          value={edited?.maxMembers ?? ""}
          onChange={(maxMembers) => onEditedChanged({ ...edited, maxMembers })}
          allowDecimals={false}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          module="product"
          min={0}
          label="memberTreshold"
          readOnly={readOnly}
          value={edited?.threshold ?? ""}
          onChange={(threshold) => onEditedChanged({ ...edited, threshold })}
          allowDecimals={false}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          min={0}
          module="product"
          required
          label="insurancePeriod"
          readOnly={readOnly}
          value={edited?.insurancePeriod ?? ""}
          onChange={(insurancePeriod) => onEditedChanged({ ...edited, insurancePeriod })}
          allowDecimals={false}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          min={0}
          module="product"
          label="administrationPeriod"
          readOnly={readOnly}
          value={edited?.administrationPeriod ?? ""}
          onChange={(administrationPeriod) => onEditedChanged({ ...edited, administrationPeriod })}
          allowDecimals={false}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          min={0}
          module="product"
          label="recurrence"
          readOnly={readOnly}
          value={edited?.recurrence ?? ""}
          onChange={(recurrence) => onEditedChanged({ ...edited, recurrence })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          min={0}
          module="product"
          label="ageMinimal"
          readOnly={readOnly}
          value={edited?.ageMinimal ?? ""}
          onChange={(ageMinimal) => onEditedChanged({ ...edited, ageMinimal  })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <NumberInput
          min={0}
          module="product"
          label="ageMaximal"
          readOnly={readOnly}
          value={edited?.ageMaximal ?? ""}
          onChange={(ageMaximal) => onEditedChanged({ ...edited, ageMaximal })}
        />
      </Grid>
      <Grid size={12}>
        <SectionTitle label={formatMessage("validitySectionTitle")} />
      </Grid>
      <Grid size={4} component={StyledItem}>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={edited?.dateFrom}
          required
          module="product"
          label="dateFrom"
          disablePast={!edited?.uuid}
          readOnly={(Boolean(edited?.uuid) && !isDuplicate) || readOnly}
          onChange={(dateFrom) => onEditedChanged({ ...edited, dateFrom })}
          // NOTE: maxDate cannot be passed if endDate does not exist.
          // Passing any other falsy value will block months manipulation.
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(edited.dateTo ? { maxDate: edited.dateTo } : null)}
        />
      </Grid>
      <Grid size={4} component={StyledItem}>
        <PublishedComponent
          pubRef="core.DatePicker"
          value={edited?.dateTo}
          required
          module="product"
          label="dateTo"
          disablePast={!!edited?.uuid}
          readOnly={readOnly}
          onChange={(dateTo) => onEditedChanged({ ...edited, dateTo })}
          // NOTE: minDate cannot be passed if startDate does not exist.
          // Passing any other falsy value will block months manipulation.
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...(edited.dateFrom ? { minDate: edited.dateFrom } : null)}
        />
      </Grid>
      <Grid size={4} component={StyledItem}>
        <PublishedComponent
          pubRef="product.ProductPicker"
          value={edited?.conversionProduct}
          filter={(items) => items?.filter((i) => i.id !== edited?.id)}
          readOnly={readOnly}
          onChange={(conversionProduct) => onEditedChanged({ ...edited, conversionProduct })}
        />
      </Grid>
      <Grid size={12}>
        <SectionTitle label={formatMessage("accountingSectionTitle")} />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module="product"
          label="remunerationCode"
          readOnly={readOnly}
          value={edited?.accCodeRemuneration ?? ""}
          onChange={(accCodeRemuneration) => onEditedChanged({ ...edited, accCodeRemuneration })}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module="product"
          label="contributionCode"
          readOnly={readOnly}
          value={edited?.accCodePremiums ?? ""}
          onChange={(accCodePremiums) => onEditedChanged({ ...edited, accCodePremiums })}
        />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (store) => ({
  isProductCodeValid: store.product.validationFields?.productCode?.isValid,
  isProductCodeValidating: store.product.validationFields?.productCode?.isValidating,
  productCodeValidationError: store.product.validationFields?.productCode?.validationError,
  savedProductCode: store.product?.product?.code,
});

const enhance = combine(withModulesManager, connect(mapStateToProps));

export { StyledItem };
export default enhance(MainPanelForm);
