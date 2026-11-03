/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, screen, userEvent, waitFor, within,
} from '@openimis/fe-core/testing';
import DataGrid from './DataGrid';

// Only the fe-core exports DataGrid reaches; the barrel cannot load in a test.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    ErrorBoundary: ({ children }) => children,
    GetIconComponent: (name) => function Icon() {
      return ReactActual.createElement('span', null, name);
    },
    useModulesManager: () => ({}),
    useTranslations: () => ({ formatMessage: (id) => id }),
  };
});

const columns = [
  {
    field: 'limitNoAdult', headerName: 'Adults', type: 'number', editable: true, width: 100,
  },
];
const rows = [{ id: 1, limitNoAdult: 2 }];

const renderGrid = (props = {}) => renderWithProviders(
  <div style={{ height: 300, width: 600 }}>
    <DataGrid columns={columns} rows={rows} onChange={vi.fn()} {...props} />
  </div>,
);

describe('DataGrid', () => {
  it('passes an edited line to onChange when its Save button is clicked', async () => {
    const onChange = vi.fn();
    renderGrid({ onChange });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'edit' }));
    const row = screen.getAllByRole('row').find((r) => within(r).queryByRole('spinbutton'));
    const input = within(row).getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const savedRows = onChange.mock.calls.at(-1)[0];
    expect(savedRows).toHaveLength(1);
    expect(Number(savedRows[0].limitNoAdult)).toBe(5);
  });

  it('removes a line through onChange when its Delete button is clicked', async () => {
    const onChange = vi.fn();
    renderGrid({ onChange });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'delete' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
