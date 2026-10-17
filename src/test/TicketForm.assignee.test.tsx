/**
 * Unit tests for TicketForm assignee input.
 *
 * Targets uncovered line in TicketForm.tsx:
 *  - Line 113: onChange={e => setAssignee(e.target.value)} — never exercised by existing tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - assignee input', () => {
  it('assignee入力欄に文字を入力するとvalueが更新される', () => {
    const { unmount, container } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    try {
      const assigneeInput = within(container).getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('assigneeを入力してsubmitするとonSubmitにassigneeが渡される', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: 'Bob' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 'Bob' })
      );
    } finally {
      unmount();
    }
  });

  it('assigneeが空のままsubmitするとassigneeはundefinedになる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      // assignee is intentionally left empty
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: undefined })
      );
    } finally {
      unmount();
    }
  });

  it('assigneeに空白のみ入力してsubmitするとassigneeはundefinedになる', () => {
    const onSubmit = vi.fn();
    const { unmount, container } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    try {
      const q = within(container);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Test Title' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Test description' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: undefined })
      );
    } finally {
      unmount();
    }
  });
});
