# openIMIS Frontend Product reference module
This repository holds the files of the openIMIS Frontend Product reference module.

> NOTE: This branch contains development version of this module based on Vite. Please use the `release/26.04` branch if you intend to fix issues via Pull Requests for the [current release](https://openimis.atlassian.net/wiki/spaces/OP/pages/4653678593/Sources+Release+2026-04) of openIMIS. The migration to vite is scheduled to conclude by end of June 2026.

It is dedicated to be deployed as a module of [openimis-fe_js](https://github.com/openimis/openimis-fe_js).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-product_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-product_js/alerts/)

## Menu Contributions

- `/admin/products`: List of all products
- `/admin/products/new`: Form to create a new product
- `/admin/products/:product_id`: Display the product in details

## Other Contributions

None (Administration module providing menu entries to proxied pages for products)

## Available Contribution Points

- `product.hooks.useProductsQuery.productFragment`: Change the fields fetched by the `useProductsQuery` hook
- `product.hooks.useProductQuery.productFragment`: Change the fields fetched by the `useProductQuery` hook

## Published Components

- `product.ProductPicker`: Picker that returns products matching the string entered by the user.
- `product.hooks.useProductsQuery`: Hook to get a filtered connection on products
- `product.hooks.useProductQuery`: Hook to get a product with all its fields
