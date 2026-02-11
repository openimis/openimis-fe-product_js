import React, { useState, useCallback } from "react";
import { useProductsQuery } from "../hooks";
import { styled } from "@mui/material/styles";
import { Searcher, useTranslations, combine, useModulesManager, ConfirmDialog } from "@openimis/fe-core";
import ProductFilters from "./ProductFilters";
import { Tooltip, Button } from "@mui/material";
import { Tab as TabIcon, Delete as DeleteIcon } from "@mui/icons-material";
import FileCopyIcon from '@mui/icons-material/FileCopy';

const StyledHorizontalButtonContainer = styled('div')(({ theme }) => ({
  ...theme.buttonContainer?.horizontal ?? {},
}));

const isRowDisabled = (_, row) => Boolean(row.validityTo);
const formatLocation = (location) => (location ? `${location.code} - ${location.name}` : null);

const ProductSearcher = (props) => {
  const { cacheFiltersKey, onDelete, canDelete, onDoubleClick, onDuplicate, canDuplicate } = props;
  const modulesManager = useModulesManager();
  const { formatMessage, formatDateFromISO, formatMessageWithValues } = useTranslations("product", modulesManager);
  const [filters, setFilters] = useState({});
  const [productToDelete, setProductToDelete] = useState(null);
  const { data, isLoading, error, refetch } = useProductsQuery({ filters }, { skip: true, keepStale: true });
  const filtersToQueryParam = useCallback((state) => {
    let params = {};
    if (!state.beforeCursor && !state.afterCursor) {
      params = {first: state.pageSize};
    }
    if (state.afterCursor) {
      params = {
        after: state.afterCursor,
        first: state.pageSize,
      }
    }
    if (state.beforeCursor) {
      params = {
        before: state.beforeCursor,
        last: state.pageSize,
      }
    }
    Object.entries(state.filters).forEach(([filterKey, filter]) => {
      params[filterKey] = filter.filter ?? filter.value;
    });
    return params;
  }, []);

  const getHeaders = useCallback(
    () => [
      "product.code",
      "product.name",
      "product.region",
      "product.district",
      "product.dateFrom",
      "product.dateTo",
      "product.maxMembers",
      "",
    ],
    [],
  );
  const getAligns = useCallback(() => {
    const aligns = getHeaders().map(() => null);
    aligns.splice(-1, 1, "right");
    return aligns;
  }, []);

  const onDeleteConfirm = (isConfirmed) => {
    if (isConfirmed) {
      onDelete(productToDelete);
      refetch();
    }
    setProductToDelete(null);
  };

  const itemFormatters = useCallback((filters) => {
    return [
      (p) => p.code,
      (p) => p.name,
      (p) => formatLocation(p.location?.parent ?? p.location),
      (p) => formatLocation(p.location?.parent ? p.location : null),
      (p) => formatDateFromISO(p.dateFrom),
      (p) => formatDateFromISO(p.dateTo),
      (p) => p.maxMembers,

      (p) =>
        !filters.showHistory?.value ? (
          <StyledHorizontalButtonContainer>
            <Tooltip title={formatMessage("ProductSearcher.openNewTab")}>
              <Button startIcon={<TabIcon />} onClick={() => onDoubleClick(p, true)}>
                {formatMessage("ProductSearcher.openNewTabButton")}
              </Button>
            </Tooltip>
            {canDuplicate(p) && (
              <Tooltip title={formatMessage("ProductSearcher.duplicateProductTooltip")}>
                <Button startIcon={<FileCopyIcon />} onClick={() => onDuplicate(p, true)}>
                  {formatMessage("ProductSearcher.duplicateProductButton")}
                </Button>
              </Tooltip>
            )}
            {canDelete(p) && (
              <Tooltip title={formatMessage("ProductSearcher.deleteProductTooltip")}>
                <Button startIcon={<DeleteIcon />} onClick={() => setProductToDelete(p)}>
                  {formatMessage("ProductSearcher.deleteProductButton")}
                </Button>
              </Tooltip>
            )}
          </StyledHorizontalButtonContainer>
        ) : null,
    ];
  }, []);
  return (
    <>
      {productToDelete && (
        <ConfirmDialog
          confirm={{
            title: formatMessage("deleteProductDialog.title"),
            message: formatMessageWithValues("deleteProductDialog.message", { name: productToDelete.name }),
          }}
          onConfirm={onDeleteConfirm}
        />
      )}
      <Searcher
        module="product"
        tableTitle={formatMessageWithValues("ProductSearcher.tableTitle", { count: data?.pageInfo?.totalCount ?? 0 })}
        cacheFiltersKey={cacheFiltersKey}
        items={data.products}
        fetchingItems={isLoading}
        errorItems={error}
        itemsPageInfo={data.pageInfo}
        fetch={setFilters}
        onDelete={onDelete}
        canDelete={canDelete}
        onDoubleClick={onDoubleClick}
        FilterPane={ProductFilters}
        headers={getHeaders}
        aligns={getAligns}
        rowDisabled={isRowDisabled}
        rowIdentifier={(r) => r.uuid}
        filtersToQueryParams={filtersToQueryParam}
        itemFormatters={itemFormatters}
      />
    </>
  );
};

const enhance = combine();

export default enhance(ProductSearcher);
