/**
 * Tests for TicketForm assignee input onChange handler (line 113).
 *
 * Existing PBT tests fill in title, description, priority, and tags but
 * never interact with the optional assignee field. This file covers that path.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  const q = within(result.container);
  return { ...result, q, onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('assignee input is rendered', () => {
    const { q, unmount } = renderForm();
    try {
      expect(q.getByTestId('assignee-input')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('assignee input starts empty', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      expect(input.value).toBe('');
    } finally {
      unmount();
    }
  });

  it('typing in assignee input updates its value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitted form data includes the trimmed assignee when provided', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Alice  ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitted form data has assignee undefined when assignee field is empty', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      // assignee left empty
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('submitted form data has assignee undefined when assignee field is only whitespace', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '   ' } });
      fireEvent.click(q.getByTestId('submit-button'));
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });

  it('assignee input can be updated multiple times', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
      fireEvent.change(input, { target: { value: 'Bob' } });
      expect(input.value).toBe('Bob');
    } finally {
      unmount();
    }
  });
});
