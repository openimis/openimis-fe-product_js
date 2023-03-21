import React, { useState, useEffect } from "react";
import _ from "lodash";
import { useSelector } from "react-redux";
import { useTranslations, useModulesManager, NumberInput, ConstantBasedPicker } from "@openimis/fe-core";
import {
  Grid,
  Table,
  Typography,
  FormControlLabel,
  Checkbox,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import {
  CEILING_DISCRIMINATION,
  CEILING_TYPES,
  HEALTH_FACILITY_TYPE,
  CLAIM_TYPE
} from "../../constants";
import SectionTitle from "../SectionTitle";

const useStyles = makeStyles((theme) => ({
  item: theme.paper.item,
  tableHead: theme.table.header,
  tableTitle: theme.table.title,
  tableRow: theme.table.row,
}));

const isInitialSplit = (product) =>
  ["deductibleIp", "deductibleOp", "ceilingIp", "ceilingOp"].some((x) => product[x] > 0);

const DeductiblesCeilingsTabForm = (props) => {
  const { edited, onEditedChanged, className, readOnly } = props;
  const product = useSelector((state) => state.product.product ?? {});
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product", modulesManager);
  const [isSplit, _setSplit] = useState(isInitialSplit(edited));
  const classes = useStyles();
  const setSplit = (event) => {
    const isChecked = event.target.checked;
    onEditedChanged({
      ...edited,
      deductible: "",
      deductibleIp: "",
      deductibleOp: "",
      ceilingIp: "N/A",
      ceilingOp: "N/A",
      ceiling: "N/A",
      maxPolicyExtraMemberIp: "N/A",
      maxPolicyExtraMemberOp: "N/A",
      maxPolicyExtraMember: "N/A",
      maxCeilingPolicyIp: "N/A",
      maxCeilingPolicyOp: "N/A",
      maxCeilingPolicy: "N/A",
    });
    _setSplit(isChecked);
  };
  const handleInputChange = (fieldName) => (value) => {
    if (value === 0 && (fieldName.toLowerCase().includes("ceiling") || fieldName.includes("maxPolicyExtraMember") || fieldName.includes("maxAmount"))) {
      value = "0"
    }
    onEditedChanged({ ...edited, [fieldName]: value });
  };

  const handleCeilingBlur = (fieldName, event) => {
    let value = event.target.value;
    if (isNaN(value) || value === "") {
      value = null
      onEditedChanged({ ...edited, [fieldName]: value });
    }
  };

  useEffect(() => {
    if (!edited.ceilingType) {
      onEditedChanged({ ...edited, ceilingType: product?.ceilingType || "INSUREE" });
    }
  }, []);

  useEffect(() => { }, [isSplit]);
  return (
    <Grid container className={className}>
      <Grid item xs={6} className={classes.item}>
        <ConstantBasedPicker
          required
          withNull
          module="product"
          readOnly={readOnly}
          value={edited.ceilingInterpretation}
          onChange={(ceilingInterpretation) => onEditedChanged({ ...edited, ceilingInterpretation })}
          constants={CEILING_DISCRIMINATION}
          label="ceilingDiscrimination"
        />
      </Grid>
      <Grid item xs={12} className={classes.item}>
        <Typography>{formatMessage("DeductiblesCeilingsTabForm.ceilingDiscriminationExplanation")}</Typography>
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <ConstantBasedPicker
          withNull={false}
          module="product"
          readOnly={readOnly}
          value={edited?.ceilingType}
          onChange={(ceilingType) => onEditedChanged({ ...edited, ceilingType })}
          constants={CEILING_TYPES}
          label="ceilingType"
        />
      </Grid>
      <Grid item xs={4} className={classes.item}>
        <FormControlLabel
          label={formatMessage("DeductiblesCeilingsTabForm.splitCeilings")}
          control={<Checkbox checked={isSplit} onChange={setSplit} disabled={readOnly} />}
        />
      </Grid>
      <Grid item xs={6}>
        <SectionTitle label={"Deductibles"} />
      </Grid>
      <Grid item xs={6} className={classes.item} />
      <Grid item xs={6} className={classes.item}>
        <Table size="small">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableTitle}>
              <TableCell width="200" />
              {!isSplit && <TableCell>{formatMessage("DeductiblesCeilingsTabForm.all")}</TableCell>}
              {isSplit && edited.ceilingInterpretation === HEALTH_FACILITY_TYPE && (
                <>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.hospitals")}</TableCell>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.nonHospitals")}</TableCell>
                </>
              )}
              {isSplit && edited.ceilingInterpretation === CLAIM_TYPE && (
                <>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.inPatient")}</TableCell>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.outPatient")}</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableTitle}>{formatMessage(`ceilingType.${edited.ceilingType}`)}</TableCell>
              {isSplit ? (
                <>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={Number(edited.deductibleIp) !== 0 ? edited.deductibleIp : ""}
                      onChange={handleInputChange("deductibleIp")}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={Number(edited.deductibleOp) !== 0 ? edited.deductibleOp : ""}
                      onChange={handleInputChange("deductibleOp")}
                    />
                  </TableCell>
                </>
              ) : (
                <TableCell>
                  <NumberInput
                    min={0}
                    module="product"
                    readOnly={readOnly}
                    value={Number(edited.deductible) !== 0 ? edited.deductible : ""}
                    onChange={handleInputChange("deductible")}
                  />
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12}>
        <SectionTitle label={"Ceilings"} />
      </Grid>
      <Grid item xs={6} className={classes.item}>
        <Table size="small">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableTitle}>
              <TableCell width="200" />
              {!isSplit && <TableCell>{formatMessage("DeductiblesCeilingsTabForm.all")}</TableCell>}
              {isSplit && edited.ceilingInterpretation === HEALTH_FACILITY_TYPE && (
                <>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.hospitals")}</TableCell>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.nonHospitals")}</TableCell>
                </>
              )}
              {isSplit && edited.ceilingInterpretation === CLAIM_TYPE && (
                <>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.inPatient")}</TableCell>
                  <TableCell>{formatMessage("DeductiblesCeilingsTabForm.outPatient")}</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableTitle}>{formatMessage(`ceilingType.${edited.ceilingType}`)}</TableCell>
              {isSplit ? (
                <>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.ceilingIp ?? "N/A"}
                      onChange={handleInputChange("ceilingIp")}
                      onBlur={(event) => handleCeilingBlur("ceilingIp", event)}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.ceilingOp ?? "N/A"}
                      onChange={handleInputChange("ceilingOp")}
                      onBlur={(event) => handleCeilingBlur("ceilingOp", event)}
                    />
                  </TableCell>
                </>
              ) : (
                <TableCell>
                  <NumberInput
                    min={0}
                    module="product"
                    readOnly={readOnly}
                    value={edited?.ceiling ?? "N/A"}
                    onChange={handleInputChange("ceiling")}
                    onBlur={(event) => handleCeilingBlur("ceiling", event)}
                  />
                </TableCell>
              )}
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.extraMemberCeiling")}
              </TableCell>
              {isSplit ? (
                <>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.maxPolicyExtraMemberIp ?? "N/A"}
                      onChange={handleInputChange("maxPolicyExtraMemberIp")}
                      onBlur={(event) => handleCeilingBlur("maxPolicyExtraMemberIp", event)}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.maxPolicyExtraMemberOp ?? "N/A"}
                      onChange={handleInputChange("maxPolicyExtraMemberOp")}
                      onBlur={(event) => handleCeilingBlur("maxPolicyExtraMemberOp", event)}
                    />
                  </TableCell>
                </>
              ) : (
                <TableCell>
                  <NumberInput
                    min={0}
                    module="product"
                    readOnly={readOnly}
                    value={edited?.maxPolicyExtraMember ?? "N/A"}
                    onChange={handleInputChange("maxPolicyExtraMember")}
                    onBlur={(event) => handleCeilingBlur("maxPolicyExtraMember", event)}
                  />
                </TableCell>
              )}
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.maximumCeiling")}
              </TableCell>
              {isSplit ? (
                <>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.maxCeilingPolicyIp ?? "N/A"}
                      onChange={handleInputChange("maxCeilingPolicyIp")}
                      onBlur={(event) => handleCeilingBlur("maxCeilingPolicyIp", event)}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      min={0}
                      module="product"
                      readOnly={readOnly}
                      value={edited?.maxCeilingPolicyOp ?? "N/A"}
                      onChange={handleInputChange("maxCeilingPolicyOp")}
                      onBlur={(event) => handleCeilingBlur("maxCeilingPolicyOp", event)}
                    />
                  </TableCell>
                </>
              ) : (
                <TableCell>
                  <NumberInput
                    min={0}
                    module="product"
                    readOnly={readOnly}
                    value={edited?.maxCeilingPolicy ?? "N/A"}
                    onChange={handleInputChange("maxCeilingPolicy")}
                    onBlur={(event) => handleCeilingBlur("maxCeilingPolicy", event)}
                  />
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={6} className={classes.item}>
        <Table size="small">
          <TableHead className={classes.tableHead}>
            <TableRow className={classes.tableTitle}>
              <TableCell width="180"></TableCell>
              <TableCell>{formatMessage("DeductiblesCeilingsTabForm.MaxTable.number")}</TableCell>
              <TableCell>{formatMessage("DeductiblesCeilingsTabForm.MaxTable.ceiling")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.consultations")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoConsultation}
                  onChange={handleInputChange("maxNoConsultation")}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited?.maxAmountConsultation ?? "N/A"}
                  onChange={handleInputChange("maxAmountConsultation")}
                  onBlur={(event) => handleCeilingBlur("maxAmountConsultation", event)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.surgeries")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoSurgery}
                  onChange={handleInputChange("maxNoSurgery")}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited?.maxAmountSurgery ?? "N/A"}
                  onChange={handleInputChange("maxAmountSurgery")}
                  onBlur={(event) => handleCeilingBlur("maxAmountSurgery", event)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.deliveries")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoDelivery}
                  onChange={handleInputChange("maxNoDelivery")}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited?.maxAmountDelivery ?? "N/A"}
                  onChange={handleInputChange("maxAmountDelivery")}
                  onBlur={(event) => handleCeilingBlur("maxAmountDelivery", event)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.hopitalizations")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoHospitalization}
                  onChange={handleInputChange("maxNoHospitalization")}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited?.maxAmountHospitalization ?? "N/A"}
                  onChange={handleInputChange("maxAmountHospitalization")}
                  onBlur={(event) => handleCeilingBlur("maxAmountHospitalization", event)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.antenatal")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoAntenatal}
                  onChange={handleInputChange("maxNoAntenatal")}
                />
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited?.maxAmountAntenatal ?? "N/A"}
                  onChange={handleInputChange("maxAmountAntenatal")}
                  onBlur={(event) => handleCeilingBlur("maxAmountAntenatal", event)}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.tableTitle}>
                {formatMessage("DeductiblesCeilingsTabForm.MaxTable.visits")}
              </TableCell>
              <TableCell>
                <NumberInput
                  min={0}
                  module="product"
                  readOnly={readOnly}
                  value={edited.maxNoVisits}
                  onChange={handleInputChange("maxNoVisits")}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default DeductiblesCeilingsTabForm;
