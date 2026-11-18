/**
 * Unit tests for TicketForm - covers the assignee input onChange handler (line 113)
 * and title length validation (> 200 chars) not exercised by the PBT suite.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

function renderForm() {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  const result = render(<TicketForm onSubmit={onSubmit} onCancel={onCancel} />);
  return { ...result, q: within(result.container), onSubmit, onCancel };
}

describe('TicketForm - assignee input', () => {
  it('changing the assignee input updates the displayed value', () => {
    const { q, unmount } = renderForm();
    try {
      const input = q.getByTestId('assignee-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Alice' } });
      expect(input.value).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('submitting with an assignee passes the trimmed assignee to onSubmit', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      fireEvent.change(q.getByTestId('assignee-input'), { target: { value: '  Bob  ' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBe('Bob');
    } finally {
      unmount();
    }
  });

  it('submitting with an empty assignee passes undefined to onSubmit', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      fireEvent.change(q.getByTestId('title-input'), { target: { value: 'Fix login bug' } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Steps to reproduce...' } });
      // Leave assignee empty
      fireEvent.click(q.getByTestId('submit-button'));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit.mock.calls[0][0].assignee).toBeUndefined();
    } finally {
      unmount();
    }
  });
});

describe('TicketForm - title length validation', () => {
  it('title longer than 200 characters shows an error and prevents submit', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const longTitle = 'A'.repeat(201);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: longTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.getByTestId('title-error')).toBeInTheDocument();
      expect(q.getByTestId('title-error').textContent).toMatch(/200/);
      expect(onSubmit).not.toHaveBeenCalled();
    } finally {
      unmount();
    }
  });

  it('title of exactly 200 characters is valid and submits', () => {
    const { q, onSubmit, unmount } = renderForm();
    try {
      const exactTitle = 'A'.repeat(200);
      fireEvent.change(q.getByTestId('title-input'), { target: { value: exactTitle } });
      fireEvent.change(q.getByTestId('description-input'), { target: { value: 'Valid description' } });
      fireEvent.click(q.getByTestId('submit-button'));

      expect(q.queryByTestId('title-error')).not.toBeInTheDocument();
      expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      unmount();
    }
  });
});
