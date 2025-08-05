import React from "react";
import clsx from "clsx";

import { styled } from "@mui/material/styles";
import ReplayIcon from "@mui/icons-material/Replay";

import { Form, ProgressOrError, combine, ErrorBoundary } from "@openimis/fe-core";
import MainPanelForm from "./MainPanelForm";
import TabsForm from "./TabsForm";

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page,
}));

const StyledLocked = styled('div')(({ theme }) => ({
  ...theme.page.locked,
}));

const ProductForm = (props) => {
  const { readOnly, onBack, onSave, product, canSave, onReset, onChange, autoFocus, isDuplicate, error } =
    props;

  return (
    <StyledPage className={clsx(readOnly && StyledLocked)}>
      <ErrorBoundary>
        <ProgressOrError error={error} />
        <Form
          module="product"
          title={product?.uuid ? "product.ProductForm.title" : "product.ProductForm.emptyTitle"}
          titleParams={{ label: product.name ?? "" }}
          readOnly={readOnly}
          canSave={canSave}
          onEditedChanged={onChange}
          edited={product}
          isDuplicate={isDuplicate}
          edited_id={product.uuid}
          HeadPanel={MainPanelForm}
          Panels={[TabsForm]}
          save={onSave}
          autoFocus={autoFocus}
          back={onBack}
          openDirty={onSave}
          actions={[
            {
              doIt: onReset,
              icon: <ReplayIcon />,
              onlyIfDirty: !readOnly,
            },
          ]}
        />
      </ErrorBoundary>
    </StyledPage>
  );
};

export default ProductForm;
