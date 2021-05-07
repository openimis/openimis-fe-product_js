import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchProducts } from "../actions";
import _debounce from "lodash/debounce";

class ProductPicker extends Component {

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-product", "cacheProducts", true);
        this.selectThreshold = props.modulesManager.getConf("fe-product", "ProductPicker.selectThreshold", 10);
    }

    componentDidMount() {
        if (this.cache && !this.props.products) {
            // prevent loading multiple times the cache when component is
            // several times on tha page
            setTimeout(
                () => {
                    !this.props.fetching && this.props.fetchProducts(this.props.modulesManager);
                },
                Math.floor(Math.random() * 300)
            );
        }
    }

    formatSuggestion = s => !!s ? `${s.code} ${s.name}` : '';

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-product", "productsMinCharLookup", 2) &&
        this.props.fetchProducts(this.props.modulesManager, str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-product", "debounceTime", 800)
    )

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, products, withLabel = true, label, withPlaceholder = false, placeholder, value, reset,
            readOnly = false, required = false,
            withNull = false, nullLabel = null,
            filter = null
        } = this.props;
        let items = products
        if (!!filter) {
            items = this.props.filter(items)
        }
        return <AutoSuggestion
            items={items}
            label={!!withLabel && (label || formatMessage(intl, "product", "Product"))}
            placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "product", "ProductPicker.placehoder") : null}
            getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "product", "product.ProductPicker.null")}
        />
    }
}

const mapStateToProps = state => ({
    products: state.product.products,
    fetching: state.product.fetchingProducts,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchProducts }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ProductPicker)));
