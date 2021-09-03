import messages_en from "./translations/en.json";
import reducer from "./reducer";
import ProductPicker from "./pickers/ProductPicker";

import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";
import { GRAPHQL_PRODUCT_FRAGMENT } from "./hooks";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: "product", reducer }],
  "core.Router": [
    { path: "admin/products", component: ProductsPage },
    { path: "admin/products/:product_id", component: ProductPage },
  ],
  "refs": [
    { key: "product.ProductPicker", ref: ProductPicker },
    { key: "product.ProductPicker.projection", ref: ["id", "code", "name", "location{id}"] },
    { key: "product.ProductPicker.sort", ref: "product__code" },

    // Routes
    { key: "product.productsList", ref: "admin/products" },
    { key: "product.productDetails", ref: "admin/products" },

    // Fragments
    { key: "product.hooks.useProducts.productFragment", ref: GRAPHQL_PRODUCT_FRAGMENT },
  ],
};

export const ProductModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
};
