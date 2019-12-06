import { graphql, formatPageQuery } from "@openimis/fe-core";

export function fetchProducts(mm, str) {
  let payload = formatPageQuery("productsStr",
    !!str && str.length && [`str:"${str}"`],
    mm.getRef("product.ProductPicker.projection")
  );
  return graphql(payload, 'PRODUCT_PRODUCT_PICKER');
}