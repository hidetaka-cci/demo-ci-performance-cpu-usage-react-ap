/**
 * Unit Tests for TicketForm - additional validation and inputs
 *
 * The existing PBT tests do not cover:
 * 1. The title-too-long validation branch (title.trim().length > 200)
 * 2. The assignee input onChange handler
 *
 * These targeted unit tests fill those gaps.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm - title length validation', () => {
  it('title exactly 200 characters is accepted', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(200) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });

  it('title longer than 200 characters shows the length error message', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'a'.repeat(201) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      const errorEl = q.getByTestId('title-error');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl.textContent).toBe('Title must be 200 characters or less');
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title exactly 201 characters triggers the length error', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'x'.repeat(201) } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Some description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error').textContent).toContain('200 characters');
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - assignee input', () => {
  it('changing the assignee input updates the displayed value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      expect(assigneeInput.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting with an assignee passes the trimmed value to onSubmit', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug report' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 'Bob' })
      );
    } finally {
      unmount();
    }
  });

  it('submitting with blank assignee omits the assignee field', () => {
    const onSubmit = vi.fn();
    const { container, unmount } = render(
      <TicketForm onSubmit={onSubmit} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Bug report' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      const submitted = onSubmit.mock.calls[0][0];
      expect(submitted.assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('changing assignee multiple times reflects the latest value', () => {
    const { container, unmount } = render(
      <TicketForm onSubmit={vi.fn()} onCancel={vi.fn()} />
    );
    const q = within(container);
    try {
      const assigneeInput = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(assigneeInput, { target: { value: 'Alice' } });
      fireEvent.change(assigneeInput, { target: { value: 'Bob' } });
      fireEvent.change(assigneeInput, { target: { value: 'Charlie' } });
      expect(assigneeInput.value).toBe('Charlie');
    } finally {
      unmount();
    }
  });
});
