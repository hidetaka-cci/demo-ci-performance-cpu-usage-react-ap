/**
 * Coverage-targeted tests for TicketCard onSelect callback (line 79).
 *
 * The existing property-based tests do not exercise the ticket-title click
 * handler; these lightweight unit tests fill that gap for both the
 * "onSelect provided" and "onSelect omitted" branches.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket } from '../types/ticket';

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket title',
  description: 'Sample ticket description used only in coverage tests.',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date('2024-05-01'),
  assignee: 'Carol',
  tags: ['coverage'],
};

describe('TicketCard - onSelect callback coverage', () => {
  it('タイトルクリックで onSelect が ticket.id を引数に呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      fireEvent.click(titleEl);
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定でもタイトルクリックは例外を投げない', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title');
      expect(() => fireEvent.click(titleEl)).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定のときはタイトルの cursor が default', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(titleEl.style.cursor).toBe('default');
      expect(titleEl.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });

  it('onSelect 指定時はタイトルの cursor が pointer で下線が付く', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(titleEl.style.cursor).toBe('pointer');
      expect(titleEl.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });
});
