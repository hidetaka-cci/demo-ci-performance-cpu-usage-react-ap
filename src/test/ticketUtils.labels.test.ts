import { describe, it, expect } from 'vitest';
import { getPriorityLabel, getStatusLabel } from '../utils/ticketUtils';
import type { Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  it('returns "Low" for low priority', () => {
    expect(getPriorityLabel('low')).toBe('Low');
  });

  it('returns "Medium" for medium priority', () => {
    expect(getPriorityLabel('medium')).toBe('Medium');
  });

  it('returns "High" for high priority', () => {
    expect(getPriorityLabel('high')).toBe('High');
  });

  it('returns "Critical" for critical priority', () => {
    expect(getPriorityLabel('critical')).toBe('Critical');
  });

  it('covers all Priority values exhaustively', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    const labels = priorities.map(getPriorityLabel);
    expect(labels).toEqual(['Low', 'Medium', 'High', 'Critical']);
  });
});

describe('getStatusLabel', () => {
  it('returns "Open" for open status', () => {
    expect(getStatusLabel('open')).toBe('Open');
  });

  it('returns "In Progress" for in_progress status', () => {
    expect(getStatusLabel('in_progress')).toBe('In Progress');
  });

  it('returns "Resolved" for resolved status', () => {
    expect(getStatusLabel('resolved')).toBe('Resolved');
  });

  it('returns "Closed" for closed status', () => {
    expect(getStatusLabel('closed')).toBe('Closed');
  });

  it('covers all Status values exhaustively', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    const labels = statuses.map(getStatusLabel);
    expect(labels).toEqual(['Open', 'In Progress', 'Resolved', 'Closed']);
  });
});
