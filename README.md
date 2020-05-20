# openIMIS Frontend Product reference module
This repository holds the files of the openIMIS Frontend Product reference module.
It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-product_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-product_js/alerts/)

## Main Menu Contributions
None

## Other Contributions
None (Administration module providing menu entries to proxied pages for products)

## Available Contribution Points
None

## Published Components
* `product.ProductPicker`, auto-suggestion picker that either (`cacheProducts` configuration) cache the prodiucts or debounce search based on user input (GraphQL: `productsStr`)


## Dispatched Redux Actions
* `PRODUCT_PRODUCT_PICKER_{REQ|RESP|ERR}`: loading products picker (either cache or ad hoc query)

## Other Modules Listened Redux Actions
None

## Configurations Options
* `cacheProducts`: wherever products picker caches the products or not
* `debounceTime`: if products picker is not configured to cache products, debounce time (ms) after which search is triggered
* `productsMinCharLookup`: if products picker is not configured to cache products, minimum number of characters before trigring the search. Default: 2
* `ProductPicker.selectThreshold`: product picker suggestions count threshold under which the AutoSuggestion switch to a SelectInut (drop down list), default: 10