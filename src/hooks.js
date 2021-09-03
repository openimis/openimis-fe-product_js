import { useModulesManager, useGraphqlQuery } from "@openimis/fe-core";
import { useMemo } from "react";
import _ from "lodash";

export const GRAPHQL_PRODUCT_FRAGMENT = `
  fragment ProductFragment on ProductGQLType {
    id
    uuid
    name
    code
    location {id name uuid code parent {id name uuid code}}
    dateFrom
    dateTo 
    memberCount
    validityFrom
    validityTo
  } 
`;

export const useProducts = ({ filters }, config) => {
  const modulesManager = useModulesManager();
  const { isLoading, error, data } = useGraphqlQuery(
    `
  query (
    $first: Int, $last: Int, $before: String, $after: String, $code: String, $name: String, 
    $dateFrom: DateTime, $dateTo: DateTime, $location: String, $showHistory: Boolean
    ) {
    products (
      first: $first, last: $last, before: $before, after: $after, code_Icontains: $code, showHistory: $showHistory,
      name_Icontains: $name, dateFrom_Gte: $dateFrom, dateTo_Lte: $dateTo, location_Uuid: $location
      ) {
      edges {
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${modulesManager.getRef("product.hooks.useProducts.productFragment")}
  `,
    filters,
    config,
  );

  const products = useMemo(() => (data ? _.map(data.products?.edges, "node") : []), [data]);
  const pageInfo = useMemo(
    () => (data ? Object.assign({ totalCount: data.products?.totalCount }, data.products?.pageInfo) : {}),
    [data],
  );
  return { isLoading, error, data: { products, pageInfo } };
};
