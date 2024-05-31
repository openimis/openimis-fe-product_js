import React from "react";
import { Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/styles";
import { combine, useTranslations, NumberInput, useModulesManager } from "@openimis/fe-core";
import SectionTitle from "../SectionTitle";

const ContributionTabForm = (props) => {
  const { edited, onEditedChanged, readOnly, classes } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product.ContributionTabForm", modulesManager);
  return (
    <Grid container>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="lumpSum"
          readOnly={readOnly}
          value={edited?.lumpSum ?? ""}
          decimal={true}
          onChange={(lumpSum) => onEditedChanged({ ...edited, lumpSum })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="premiumAdult"
          readOnly={readOnly}
          value={edited?.premiumAdult ?? ""}
          decimal={true}
          onChange={(premiumAdult) => onEditedChanged({ ...edited, premiumAdult })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="premiumChild"
          readOnly={readOnly}
          value={edited?.premiumChild ?? ""}
          decimal={true}
          onChange={(premiumChild) => onEditedChanged({ ...edited, premiumChild })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={1}
          label="maxInstallments"
          required
          readOnly={readOnly}
          value={edited?.maxInstallments ?? 1}
          onChange={(maxInstallments) => onEditedChanged({ ...edited, maxInstallments })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="registrationLumpSum"
          readOnly={readOnly}
          value={edited?.registrationLumpSum ?? ""}
          decimal={true}
          onChange={(registrationLumpSum) => onEditedChanged({ ...edited, registrationLumpSum })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="registrationFee"
          readOnly={readOnly}
          value={edited?.registrationFee ?? ""}
          decimal={true}
          onChange={(registrationFee) => onEditedChanged({ ...edited, registrationFee })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="generalAssemblyLumpSum"
          readOnly={readOnly}
          value={edited?.generalAssemblyLumpSum ?? ""}
          decimal={true}
          onChange={(generalAssemblyLumpSum) => onEditedChanged({ ...edited, generalAssemblyLumpSum })}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="generalAssemblyFee"
          readOnly={readOnly}
          value={edited?.generalAssemblyFee ?? ""}
          decimal={true}
          onChange={(generalAssemblyFee) => onEditedChanged({ ...edited, generalAssemblyFee })}
        />
      </Grid>
      <Grid item xs={12}>
        <SectionTitle label={formatMessage("discountsSectionTitle")} />
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3} className={classes.item}>
            <NumberInput
              module="product"
              min={0}
              label="renewalDiscountPeriod"
              readOnly={readOnly}
              value={edited?.renewalDiscountPeriod ?? ""}
              onChange={(renewalDiscountPeriod) => onEditedChanged({ ...edited, renewalDiscountPeriod })}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <NumberInput
              module="product"
              min={0}
              label="renewalDiscountPerc"
              readOnly={readOnly}
              value={edited?.renewalDiscountPerc ?? ""}
              onChange={(renewalDiscountPerc) => onEditedChanged({ ...edited, renewalDiscountPerc })}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={3} className={classes.item}>
            <NumberInput
              module="product"
              min={0}
              label="enrolmentDiscountPeriod"
              readOnly={readOnly}
              value={edited?.enrolmentDiscountPeriod ?? ""}
              onChange={(enrolmentDiscountPeriod) => onEditedChanged({ ...edited, enrolmentDiscountPeriod })}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <NumberInput
              module="product"
              min={0}
              label="enrolmentDiscountPerc"
              readOnly={readOnly}
              value={edited?.enrolmentDiscountPerc ?? ""}
              onChange={(enrolmentDiscountPerc) => onEditedChanged({ ...edited, enrolmentDiscountPerc })}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <SectionTitle label={formatMessage("graceSectionTitle")} />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="gracePeriodEnrolment"
          readOnly={readOnly}
          value={edited?.gracePeriodEnrolment ?? 0}
          onChange={(gracePeriodEnrolment) => onEditedChanged({ ...edited, gracePeriodEnrolment: Number(gracePeriodEnrolment) })}
          displayZero={true}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          label="gracePeriodRenewal"
          readOnly={readOnly}
          value={edited?.gracePeriodRenewal ?? 0}
          onChange={(gracePeriodRenewal) => onEditedChanged({ ...edited, gracePeriodRenewal: Number(gracePeriodRenewal) })}
          displayZero={true}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="product"
          min={0}
          required
          label="gracePeriodPayment"
          readOnly={readOnly}
          value={edited?.gracePeriodPayment ?? 0}
          onChange={(gracePeriodPayment) => onEditedChanged({ ...edited, gracePeriodPayment: Number(gracePeriodPayment) })}
          displayZero={true}
        />
      </Grid>
    </Grid>
  );
};

const styles = (theme) => ({
  item: theme.paper.item,
});

const enhance = combine(withTheme, withStyles(styles));

export default enhance(ContributionTabForm);
