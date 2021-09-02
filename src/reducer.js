import { parseData, formatServerError, formatGraphQLError } from "@openimis/fe-core";

function reducer(
  state = {
    fetchingProducts: false,
    fetchedProducts: false,
    errorProducts: null,
    products: null,
  },
  action,
) {
  switch (action.type) {
    case "PRODUCT_PRODUCT_PICKER_REQ":
      return {
        ...state,
        fetchingProducts: true,
        fetchedProducts: false,
        products: null,
        errorProducts: null,
      };
    case "PRODUCT_PRODUCT_PICKER_RESP":
      return {
        ...state,
        fetchingProducts: false,
        fetchedProducts: true,
        products: parseData(action.payload.data.productsStr),
        errorProducts: formatGraphQLError(action.payload),
      };
    case "PRODUCT_PRODUCT_PICKER_ERR":
      return {
        ...state,
        fetchingProducts: false,
        errorProducts: formatServerError(action.payload),
      };
    default:
      return state;
  }
}

export default reducer;
