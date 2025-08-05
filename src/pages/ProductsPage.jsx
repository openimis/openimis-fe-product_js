import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Fab } from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

import {
  combine,
  withTooltip,
  useTranslations,
  withHistory,
  historyPush,
  useModulesManager,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { RIGHT_PRODUCT_DELETE, RIGHT_PRODUCT_ADD, RIGHT_PRODUCT_DUPLICATE} from "../constants";
import { useProductDeleteMutation } from "../hooks";
import ProductSearcher from "../components/ProductSearcher";

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page,
}));

const StyledFab = styled('div')(({ theme }) => ({
  ...theme.fab,
}));

const ProductsPage = (props) => {
  const { history } = props;
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const rights = useSelector((state) => state.core.user?.i_user?.rights ?? []);
  const module = useSelector((state) => state.core?.savedPagination?.module);
  const { formatMessage } = useTranslations("product");
  const { formatMessageWithValues } = useTranslations("product", modulesManager);
  const deleteMutation = useProductDeleteMutation();

  useEffect(() => {
    const moduleName = "product";
    if (module !== moduleName) dispatch(clearCurrentPaginationPage());
  }, [module]);

  const onDelete = async (product) => {
    await deleteMutation.mutate({
      uuids: [product.uuid],
      clientMutationLabel: formatMessageWithValues("deleteMutation.label", { name: product.name }),
    });
  };

  const canDelete = (product) => rights.includes(RIGHT_PRODUCT_DELETE) && !product.validityTo;
  const canDuplicate = (product) => rights.includes(RIGHT_PRODUCT_DUPLICATE) && !product.validityTo;
  const onDoubleClick = (product, newTab = false) => {
    historyPush(modulesManager, history, "product.productDetails", [product.uuid], newTab);
  };
  const onDuplicate = (product, newTab = false) => {
    historyPush(modulesManager, history, "product.duplicateProduct", [product.uuid], newTab);
  };

  return (
    <StyledPage>
      <ProductSearcher
        onDelete={onDelete}
        canDelete={canDelete}
        onDoubleClick={onDoubleClick}
        canDuplicate={canDuplicate}
        onDuplicate={onDuplicate}
      />
      {rights.includes(RIGHT_PRODUCT_ADD) &&
        withTooltip(
          <StyledFab>
            <Fab color="primary" onClick={() => historyPush(modulesManager, history, "product.newProduct")}>
              <AddIcon />
            </Fab>
          </StyledFab>,
          formatMessage("ProductsPage.addNewProduct"),
        )}
    </StyledPage>
  );
};

const enhance = combine(withHistory);

export default enhance(ProductsPage);
