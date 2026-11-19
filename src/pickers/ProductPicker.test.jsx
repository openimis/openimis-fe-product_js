/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@openimis/fe-core/testing';
import { useProductsQuery } from '../hooks';
import ProductPicker from './ProductPicker';

// A minimal stand-in for fe-core's Autocomplete: it asks for options when focused (as the
// real one does when it opens) and reports what is typed; the barrel cannot load in a test.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    Autocomplete: ({ options, getOptionLabel, onInputChange }) => ReactActual.createElement(
      'div',
      null,
      ReactActual.createElement('input', {
        'aria-label': 'Product',
        onFocus: () => onInputChange(),
        onChange: (e) => onInputChange(e.target.value),
      }),
      ReactActual.createElement(
        'ul',
        null,
        options.map((o) => ReactActual.createElement('li', { key: o.id }, getOptionLabel(o))),
      ),
    ),
    useModulesManager: () => ({}),
    useTranslations: () => ({ formatMessage: (id) => id, formatMessageWithValues: (id) => id }),
  };
});

// Answers like the backend: a variable that is not a DateTime fails the whole query.
const PRODUCT = { id: 'p79', code: 'BLBAS01', name: 'Baseline Basic Cover' };
const isDateTime = (v) => v === undefined || /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d$/.test(v);
vi.mock('../hooks', () => ({ useProductsQuery: vi.fn() }));
useProductsQuery.mockImplementation(({ filters }) => {
  const valid = isDateTime(filters.dateFrom) && isDateTime(filters.dateTo);
  const matches = valid && !!filters.search && PRODUCT.name.includes(filters.search);
  return {
    isLoading: false,
    error: valid ? null : 'Variable "$dateFrom" got invalid value',
    data: { products: matches ? [PRODUCT] : [] },
  };
});

const lastFilters = () => useProductsQuery.mock.calls.at(-1)[0].filters;

describe('ProductPicker', () => {
  it('never sends an invalid date when the enrolment date is not known yet', async () => {
    renderWithProviders(<ProductPicker enrollmentDate={null} locationId={0} onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Product'), 'Baseline Basic Cover');

    expect(lastFilters().search).toBe('Baseline Basic Cover');
    expect(isDateTime(lastFilters().dateFrom)).toBe(true);
    expect(isDateTime(lastFilters().dateTo)).toBe(true);
  });

  // The policy form renders the picker before the family is fetched, so a user (or a test)
  // can type while the enrolment date and the location are still unset.
  it('searches again with the typed text once the enrolment date and the location arrive', async () => {
    const { rerender } = renderWithProviders(
      <ProductPicker enrollmentDate={null} locationId={0} onChange={vi.fn()} />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Product'), 'Baseline Basic Cover');

    rerender(<ProductPicker enrollmentDate="2026-11-19" locationId={1} onChange={vi.fn()} />);

    expect(lastFilters()).toMatchObject({
      search: 'Baseline Basic Cover',
      location: 1,
      dateFrom: '2026-11-19T00:00:00',
      dateTo: '2026-11-19T00:00:00',
    });
    expect(await screen.findByText('BLBAS01 Baseline Basic Cover')).toBeInTheDocument();
  });

  // The query hook fetches whenever its variables change: unchanged variables mean no request.
  it('does not query before it is opened, even when its props change', () => {
    const { rerender } = renderWithProviders(
      <ProductPicker enrollmentDate={null} locationId={0} onChange={vi.fn()} />,
    );
    const firstFilters = lastFilters();

    rerender(<ProductPicker enrollmentDate="2026-11-19" locationId={1} onChange={vi.fn()} />);

    expect(lastFilters()).toEqual(firstFilters);
    expect(useProductsQuery.mock.calls.at(-1)[1]).toEqual({ skip: true });
  });
});
