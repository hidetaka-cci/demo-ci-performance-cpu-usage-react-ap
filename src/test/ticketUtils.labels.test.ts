/**
 * Unit tests for getPriorityLabel and getStatusLabel in ticketUtils.
 *
 * These helpers are called by multiple components but have no direct tests.
 * Testing them in isolation guards against accidental label renames.
 */

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

  it('returns a non-empty string for every valid priority', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(p => {
      const label = getPriorityLabel(p);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
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

  it('returns a non-empty string for every valid status', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    statuses.forEach(s => {
      const label = getStatusLabel(s);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
