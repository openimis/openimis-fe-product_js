/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, makeStore, renderWithProviders } from '@openimis/fe-core/testing';
import DeductiblesCeilingsTabForm from './DeductiblesCeilingsTabForm';
import { GRAPHQL_USE_PRODUCT_PRODUCT_FRAGMENT } from '../../hooks';

// Only the fe-core exports this tab reaches; the barrel cannot load in a test.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    useModulesManager: () => ({}),
    useTranslations: () => ({ formatMessage: (id) => id }),
    useGraphqlQuery: () => ({}),
    useGraphqlMutation: () => ({}),
    NumberInput: ({ label, value }) => ReactActual.createElement('input', { 'aria-label': label, value: value ?? '', readOnly: true }),
    ConstantBasedPicker: ({ label, value }) => ReactActual.createElement('span', { 'aria-label': label }, value ?? ''),
    GRID_RESPONSIVE_HALF: 6,
    GRID_RESPONSIVE_STANDARD: 4,
    GRID_RESPONSIVE_FULL: 12,
  };
});
vi.mock('../SectionTitle', () => ({ default: () => null }));

// state.product.product is what fetchProduct fills: {} while the request runs.
const productReducer = (state = { product: {} }, action) => (
  action.type === 'PRODUCT_FETCH_PRODUCT_RESP' ? { ...state, product: action.product } : state
);

const renderTab = (edited) => {
  const onEditedChanged = vi.fn();
  const store = makeStore({ reducers: { product: productReducer } });
  const view = renderWithProviders(
    <DeductiblesCeilingsTabForm edited={edited} onEditedChanged={onEditedChanged} />,
    { store },
  );
  return { onEditedChanged, store, view };
};

describe('DeductiblesCeilingsTabForm ceiling type (OP-3272)', () => {
  it('loads the ceiling type with the product', () => {
    expect(GRAPHQL_USE_PRODUCT_PRODUCT_FRAGMENT).toMatch(/\bceilingType\b/);
  });

  it('keeps a saved product\'s ceiling type when the tab opens before fetchProduct returns', () => {
    const edited = { uuid: 'p-1', code: 'DED' };
    const { onEditedChanged, store } = renderTab(edited);

    expect(onEditedChanged).not.toHaveBeenCalledWith(expect.objectContaining({ ceilingType: 'INSUREE' }));

    act(() => store.dispatch({ type: 'PRODUCT_FETCH_PRODUCT_RESP', product: { ceilingType: 'TREATMENT' } }));

    expect(onEditedChanged).toHaveBeenLastCalledWith(expect.objectContaining({ uuid: 'p-1', ceilingType: 'TREATMENT' }));
    expect(onEditedChanged).not.toHaveBeenCalledWith(expect.objectContaining({ ceilingType: 'INSUREE' }));
  });

  it('leaves a ceiling type loaded with the product alone', () => {
    const { onEditedChanged } = renderTab({ uuid: 'p-1', ceilingType: 'TREATMENT' });

    expect(onEditedChanged).not.toHaveBeenCalled();
  });

  it('defaults a new product to Insuree', () => {
    const { onEditedChanged } = renderTab({ code: 'NEW' });

    expect(onEditedChanged).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'NEW', ceilingType: 'INSUREE' }));
  });
});
