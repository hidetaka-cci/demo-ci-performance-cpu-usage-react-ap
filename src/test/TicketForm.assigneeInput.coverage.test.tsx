/**
 * Coverage test for TicketForm.tsx L113:
 *   onChange={e => setAssignee(e.target.value)}
 *
 * The existing PBT suite submits forms without touching the assignee input,
 * so the setAssignee onChange handler stays uncovered. These tests exercise
 * the typing path and verify the typed value is forwarded on submit.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input coverage', () => {
  it('assignee フィールドへの入力が state に反映される', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(assigneeInput.value).toBe('');

      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assignee を入力して submit すると trim された値が onSubmit に渡る', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Add health check endpoint' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Expose /healthz for liveness probes.' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Dave  ' } });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.assignee).toBe('Dave');
      expect(payload.title).toBe('Add health check endpoint');
    } finally {
      unmount();
    }
  });

  it('assignee が空白のみの場合は onSubmit で undefined になる', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Rotate signing keys' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Quarterly key rotation.' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee を未入力のままでも submit が成功する', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);

      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Document API versioning' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Explain the deprecation policy.' } });

      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});
