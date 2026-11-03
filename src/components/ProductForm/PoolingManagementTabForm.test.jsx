/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, screen, userEvent,
} from '@openimis/fe-core/testing';
import PoolingManagementTabForm from './PoolingManagementTabForm';

// Only the fe-core exports this tab reaches; the barrel cannot load in a test.
// NumberInput is a plain number field handing back a number, or null once emptied.
vi.mock('@openimis/fe-core', async () => {
  const ReactActual = (await import('react')).default;
  return {
    combine: (...fns) => (C) => fns.reduce((acc, fn) => fn(acc), C),
    useModulesManager: () => ({}),
    useTranslations: () => ({ formatMessage: (id) => id }),
    FormattedMessage: ({ id }) => id,
    NumberInput: ({ label, value, onChange }) => ReactActual.createElement('input', {
      type: 'number',
      'aria-label': label,
      value: value ?? '',
      onChange: (e) => onChange(e.target.value === '' ? null : Number(e.target.value)),
    }),
  };
});
vi.mock('../SectionTitle', () => ({ default: () => null }));

const renderTab = (initial) => {
  const onEditedChanged = vi.fn();
  const Host = () => {
    const [edited, setEdited] = useState(initial);
    return (
      <PoolingManagementTabForm
        edited={edited}
        onEditedChanged={(next) => {
          onEditedChanged(next);
          setEdited(next);
        }}
      />
    );
  };
  renderWithProviders(<Host />);
  return onEditedChanged;
};

describe('PoolingManagementTabForm', () => {
  it('saves a start cycle typed into a new product (OP-3271)', async () => {
    const onEditedChanged = renderTab({ code: 'NEW' });
    const user = userEvent.setup();

    await user.type(screen.getAllByLabelText('CycleInput.date')[0], '1');
    expect(screen.getAllByLabelText('CycleInput.date')[0]).toHaveValue(1);
    await user.type(screen.getAllByLabelText('CycleInput.month')[0], '7');

    expect(onEditedChanged).toHaveBeenLastCalledWith(expect.objectContaining({ code: 'NEW', startCycle1: '01-07' }));
  });

  it('shows the start cycles of a saved product', () => {
    renderTab({ code: 'OLD', startCycle1: '15-03' });

    expect(screen.getAllByLabelText('CycleInput.date')[0]).toHaveValue(15);
    expect(screen.getAllByLabelText('CycleInput.month')[0]).toHaveValue(3);
  });
});
