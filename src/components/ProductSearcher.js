import React, { useState, useCallback } from "react";
import { useProducts } from "../hooks";
import { Searcher, useTranslations, useModulesManager } from "@openimis/fe-core";
import ProductFilters from "./ProductFilters";
import { Tooltip, IconButton } from "@material-ui/core";
import { Tab as TabIcon, Delete as DeleteIcon } from "@material-ui/icons";

const isRowDisabled = (_, row) => Boolean(row.validityTo);
const formatLocation = (location) => (location ? `${location.code} - ${location.name}` : null);

const ProductSearcher = (props) => {
  const { cacheFiltersKey, onDelete, canDelete, onDoubleClick } = props;
  const modulesManager = useModulesManager();
  const { formatMessage, formatDateFromISO, formatMessageWithValues } = useTranslations("product", modulesManager);
  const [filters, setFilters] = useState({});
  const [resetKey, setResetKey] = useState("");
  const { data, isLoading, error } = useProducts({ filters }, { skip: true, keepStale: true });
  const filtersToQueryParam = useCallback((state) => {
    const params = {
      first: state.pageSize,
      after: state.afterCursor,
      before: state.beforeCursor,
    };
    Object.entries(state.filters).forEach(([filterKey, filter]) => {
      console.log(filter);
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

  const itemFormatters = useCallback((filters) => {
    return [
      (p) => p.code,
      (p) => p.name,
      (p) => formatLocation(p.location?.parent ?? p.location),
      (p) => formatLocation(p.location?.parent ? p.location : null),
      (p) => formatDateFromISO(p.dateFrom),
      (p) => formatDateFromISO(p.dateTo),
      (p) => p.memberCount,

      (p) =>
        !filters.showHistory?.value ? (
          <>
            <Tooltip title={formatMessage("ProductSearcher.openNewTab")}>
              <IconButton onClick={() => onDoubleClick(p, true)}>
                <TabIcon />
              </IconButton>
            </Tooltip>
            {canDelete(p) && (
              <Tooltip title={formatMessage("ProductSearcher.deleteProductTooltip")}>
                <IconButton onClick={() => onDelete(p)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        ) : null,
    ];
  }, []);

  return (
    <>
      <Searcher
        reset={resetKey}
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

export default ProductSearcher;
