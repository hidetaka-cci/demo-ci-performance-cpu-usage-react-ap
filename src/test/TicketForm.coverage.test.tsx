/**
 * Deterministic coverage tests for TicketForm.
 *
 * Covers the assignee input onChange handler (TicketForm.tsx line 113) and
 * verifies the form propagates the trimmed assignee through onSubmit. Also
 * exercises the empty-assignee branch where the submitted assignee is
 * undefined.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee field', () => {
  it('typing into the assignee input updates the displayed value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assignee = within(container).getByTestId('assignee-input') as HTMLInputElement;
      expect(assignee.value).toBe('');
      fireEvent.change(assignee, { target: { value: 'Dana' } });
      expect(assignee.value).toBe('Dana');
    } finally {
      unmount();
    }
  });

  it('submits the trimmed assignee value through onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'My title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'My description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Erin  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toMatchObject({
        title: 'My title',
        description: 'My description',
        priority: 'medium',
        assignee: 'Erin',
        tags: [],
      });
    } finally {
      unmount();
    }
  });

  it('submits with assignee undefined when the field is left blank or whitespace', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Another' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Another desc' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
