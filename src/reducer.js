import { parseData, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingProductPicker: false,
        fetchedProductPicker: false,
        errorProductPicker: null,
        products: null,        
    },
    action,
) {
    switch (action.type) {
        case 'PRODUCT_PRODUCT_PICKER_REQ':
            return {
                ...state,
                fetchingProductPicker: true,
                fetchedProductPicker: false,
                products: null,
                errorProductPicker: null,
            };
        case 'PRODUCT_PRODUCT_PICKER_RESP':
            return {
                ...state,
                fetchingProductPicker: false,
                fetchedProductPicker: true,
                products: parseData(action.payload.data.productsStr),
                errorProductPicker: formatGraphQLError(action.payload)
            };
        case 'PRODUCT_PRODUCT_PICKER_ERR':
            return {
                ...state,
                fetchingProductPicker: false,
                errorProductPicker: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
