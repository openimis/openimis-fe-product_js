import { Grid } from "@material-ui/core";
import { PublishedComponent, useModulesManager, useTranslations } from "@openimis/fe-core";
import React from "react";

const ProductDerivedOperationalIndicators = (props) => {
  const { values, setValues } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product", modulesManager);

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <PublishedComponent
          pubRef="core.YearPicker"
          onChange={(year) =>
            setValues({
                ...values,
                year,
          })}
          min={2010}
          max={2040}
          required
          withNull={false}
          value={values.year}
          label={formatMessage("ProductDerivedOperationalIndicators.year")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(region) =>
            setValues({
                ...values,
                region,
                district:null
          })}
          required
          value={values.region}
          locationLevel={0}
          label={formatMessage("ProductDerivedOperationalIndicators.region")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.LocationPicker"
          onChange={(district) =>
            setValues({
                ...values,
                district,
          })}
          value={values.district}
          parentLocation={values.region}
          locationLevel={1}
          label={formatMessage("ProductDerivedOperationalIndicators.district")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="product.ProductPicker"
          onChange={(product) => setValues({ ...values, product })}
          module="product"
          value={values.product}
          label={formatMessage("ProductDerivedOperationalIndicators.product")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="location.HealthFacilityPicker"
          onChange={(hf) => setValues({ ...values, hf, })}
          region={values.region}
          district={values.district}
          value={values.hf}
          label={formatMessage("ProductDerivedOperationalIndicators.hf")}
        />
      </Grid>
      <Grid item>
        <PublishedComponent
          pubRef="core.MonthPicker"
          onChange={(month) =>
            setValues({
                ...values,
                month,
          })}
          withNull
          value={values.month}
        />
      </Grid>
    </Grid>
  );
};

export default ProductDerivedOperationalIndicators;
