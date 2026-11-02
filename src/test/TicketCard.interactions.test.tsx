import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Status } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Login bug',
  description: 'Server returns 500 on bad credentials',
  priority: 'critical',
  status: 'open',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  assignee: 'Alice',
  tags: ['bug', 'auth'],
};

describe('TicketCard - click interactions', () => {
  it('Delete ボタンクリックで onDelete がチケット ID と共に呼ばれる', () => {
    const onDelete = vi.fn();
    const { unmount, container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={onDelete} />
    );
    try {
      fireEvent.click(within(container).getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledOnce();
      expect(onDelete).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('advance-status ボタンクリックで onStatusChange が次のステータスと共に呼ばれる', () => {
    const onStatusChange = vi.fn();
    const openTicket = { ...baseTicket, status: 'open' as Status };
    const { unmount, container } = render(
      <TicketCard ticket={openTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    try {
      fireEvent.click(within(container).getByTestId('advance-status-button'));
      expect(onStatusChange).toHaveBeenCalledOnce();
      expect(onStatusChange).toHaveBeenCalledWith(baseTicket.id, 'in_progress');
    } finally {
      unmount();
    }
  });

  it.each([
    ['open', 'in_progress'],
    ['in_progress', 'resolved'],
    ['resolved', 'closed'],
    ['closed', 'open'],
  ] as [Status, Status][])(
    'ステータス %s → advance で %s になる',
    (currentStatus, expectedNext) => {
      const onStatusChange = vi.fn();
      const ticket = { ...baseTicket, status: currentStatus };
      const { unmount, container } = render(
        <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
      );
      try {
        fireEvent.click(within(container).getByTestId('advance-status-button'));
        expect(onStatusChange).toHaveBeenCalledWith(ticket.id, expectedNext);
      } finally {
        unmount();
      }
    }
  );

  it('onSelect が渡された場合: タイトルクリックで onSelect がチケット ID と共に呼ばれる', () => {
    const onSelect = vi.fn();
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledOnce();
      expect(onSelect).toHaveBeenCalledWith(baseTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect が渡されていない場合: タイトルクリックでエラーが発生しない', () => {
    const { unmount, container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      expect(() => {
        fireEvent.click(within(container).getByTestId('ticket-title'));
      }).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('onSelect がある場合: タイトルの cursor は pointer', () => {
    const { unmount, container } = render(
      <TicketCard
        ticket={baseTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('pointer');
    } finally {
      unmount();
    }
  });

  it('onSelect がない場合: タイトルの cursor は default', () => {
    const { unmount, container } = render(
      <TicketCard ticket={baseTicket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
    );
    try {
      const title = within(container).getByTestId('ticket-title') as HTMLElement;
      expect(title.style.cursor).toBe('default');
    } finally {
      unmount();
    }
  });
});
