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
    }

    componentDidMount() {
        if (this.cache && !this.props.products) {
            this.props.fetchProducts(this.props.modulesManager);
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
        const { intl, products, withLabel=true, label, withPlaceholder=false, placeholder, value, reset, readOnly = false } = this.props;
        return <AutoSuggestion
            items={products}
            label={!!withLabel && (label || formatMessage(intl, "product", "Product"))}
            placeholder={!!withPlaceholder ? placeholder || formatMessage(intl, "product", "ProductPicker.placehoder") : null}
            getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={value}
            reset={reset}
            readOnly={readOnly}
        />
    }
}

const mapStateToProps = state => ({
    products: state.product.products,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchProducts }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ProductPicker)));
