/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, screen, userEvent, waitFor, within,
} from '@openimis/fe-core/testing';
import GenericItemsTabForm from './GenericItemsTabForm';

// Only the fe-core exports this tab reaches; the barrel cannot load in a test.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    combine: (...fns) => (C) => fns.reduce((acc, fn) => fn(acc), C),
    ErrorBoundary: ({ children }) => children,
    GetIconComponent: (name) => function Icon() {
      return ReactActual.createElement('span', null, name);
    },
    useModulesManager: () => ({}),
    useTranslations: () => ({ formatMessage: (id) => id }),
  };
});
vi.mock('../../hooks', () => ({
  usePageDisplayRulesQuery: () => ({ isLoadingRules: false, dataRules: {} }),
}));
vi.mock('./ProductItemsDialog', () => ({ default: () => null }));

const FIXED = 'FIXED_AMOUNT';
const CO_INSURANCE = 'CO_INSURANCE';
const row = {
  id: 1,
  priceOrigin: 'PRICELIST',
  limitationType: FIXED,
  limitationTypeR: FIXED,
  limitationTypeE: FIXED,
  limitAdult: 10,
  limitChild: 10,
  limitAdultR: 10,
  limitChildR: 10,
  limitAdultE: 10,
  limitChildE: 10,
};
// The default limit a type gets: 100 (%) for co-insurance, 0 for a fixed amount.
const getLimitValueSwitch = (type) => (type === CO_INSURANCE ? 100 : 0);

describe('GenericItemsTabForm', () => {
  it('resets the limits governed by a limitation type when that type changes', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <div style={{ height: 400, width: 2400 }}>
        <GenericItemsTabForm
          rows={[row]}
          itemColumns={[]}
          onChange={onChange}
          onAdd={vi.fn()}
          getLimitValueSwitch={getLimitValueSwitch}
          addButtonLabel="Add"
        />
      </div>,
    );
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'edit' }));
    // Edit cells in column order: price origin, limitation type, R, E.
    const editRow = screen.getAllByRole('row').find((r) => within(r).queryAllByRole('combobox').length);
    const [, limitationType] = within(editRow).getAllByRole('combobox');
    await user.click(limitationType);
    await user.click(await screen.findByRole('option', { name: `ItemsOrServicesGrid.limitTypes.${CO_INSURANCE}` }));
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const [saved] = onChange.mock.calls.at(-1)[0];
    expect(saved.limitationType).toBe(CO_INSURANCE);
    expect(Number(saved.limitAdult)).toBe(100);
    expect(Number(saved.limitChild)).toBe(100);
    // Limits governed by the unchanged types keep their values.
    expect(Number(saved.limitAdultR)).toBe(10);
    expect(Number(saved.limitAdultE)).toBe(10);
  });
});
