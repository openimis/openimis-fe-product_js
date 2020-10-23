import messages_en from "./translations/en.json";
import reducer from "./reducer";
import ProductPicker from "./pickers/ProductPicker";

const DEFAULT_CONFIG = {
  "translations": [{ key: 'en', messages: messages_en }],
  "reducers": [{ key: 'product', reducer }],
  "refs": [
    { key: "product.ProductPicker", ref: ProductPicker },
    { key: "product.ProductPicker.projection", ref: ["id", "code", "name", "location{id}"] },
    { key: "product.ProductPicker.sort", ref: 'product__code' },
  ],
}


export const ProductModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}
