/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, makeStore, renderWithProviders } from '@openimis/fe-core/testing';
import { ProductDetailsPage } from './ProductDetailsPage';

// Only the fe-core exports this page reaches; the barrel cannot load in a test.
vi.mock('@openimis/fe-core', () => ({
  combine: (...fns) => (C) => fns.reduce((acc, fn) => fn(acc), C),
  historyPush: vi.fn(),
  useModulesManager: () => ({}),
  useTranslations: () => ({ formatMessageWithValues: (id) => id }),
  withHistory: (C) => C,
}));

// A product as the backend returns it: optional fields still null, which
// toFormValues turns into the form's defaults (lumpSum 0, maxMembers 0, ...).
// Query results are hoisted constants: the page's effect depends on them, and a
// fresh object per render (unlike the real hooks) would re-run it forever.
const queries = vi.hoisted(() => ({
  product: {
    isLoading: false,
    refetch: () => {},
    data: {
      uuid: 'p-1',
      code: 'PRD1',
      name: 'Product 1',
      lumpSum: null,
      maxMembers: null,
      insurancePeriod: null,
      ageMinimal: null,
      ageMaximal: null,
      gracePeriodRenewal: null,
    },
  },
  rules: { isLoadingRules: false, dataRules: {} },
  mutation: { mutate: () => {} },
}));

vi.mock('../hooks', () => ({
  useProductQuery: () => queries.product,
  usePageDisplayRulesQuery: () => queries.rules,
  useProductCreateMutation: () => queries.mutation,
  useProductUpdateMutation: () => queries.mutation,
  useProductDuplicateMutation: () => queries.mutation,
}));

// Keep the real value mapping; only form validation is forced to pass, so the
// assertions measure the change detection alone.
vi.mock('../utils', async () => ({
  ...(await vi.importActual('../utils')),
  validateProductForm: () => true,
}));

let formProps;
vi.mock('../components/ProductForm/ProductForm', () => ({
  default: (props) => {
    formProps = props;
    return null;
  },
}));

const renderPage = () => renderWithProviders(
  <ProductDetailsPage
    match={{ params: { product_id: 'p-1' } }}
    history={{}}
    location={{ pathname: '/product/products/p-1' }}
  />,
  {
    store: makeStore({
      preloadedState: { core: { user: { i_user: { rights: [] } } } },
      reducers: { product: (state = { validationFields: {} }) => state },
    }),
  },
);

describe('ProductDetailsPage', () => {
  it('keeps Save disabled on a product opened without changes', () => {
    renderPage();

    expect(formProps.canSave()).toBe(false);
  });

  it('enables Save once a value is changed', () => {
    renderPage();

    act(() => formProps.onChange({ ...formProps.product, name: 'Product 1 renamed' }));

    expect(formProps.canSave()).toBe(true);
  });
});
