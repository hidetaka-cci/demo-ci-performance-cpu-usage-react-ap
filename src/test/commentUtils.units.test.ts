/**
 * Unit tests for commentUtils
 *
 * The existing commentUtils.pbt.test.ts uses property-based checks with random
 * inputs. This file covers concrete edge cases and behaviors that the property
 * tests do not directly assert:
 *   - addComment on an empty array
 *   - getCommentsByTicket preserves original order (not just membership)
 *   - getCommentsByTicket with no matches returns []
 *   - sortCommentsByDate on 0-length and 1-length arrays
 *   - createComment id has the exact COMMENT-<n> format
 */

import { describe, it, expect } from 'vitest';
import {
  addComment,
  createComment,
  getCommentsByTicket,
  sortCommentsByDate,
} from '../utils/commentUtils';
import type { Comment } from '../types/ticket';

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'COMMENT-x',
  ticketId: 'TICKET-0001',
  author: 'alice',
  body: 'hello',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

describe('createComment - format', () => {
  it('produces an id matching /^COMMENT-\\d+$/', () => {
    const c = createComment('TICKET-0001', { author: 'a', body: 'b' });
    expect(c.id).toMatch(/^COMMENT-\d+$/);
  });

  it('trims leading/trailing whitespace from author and body', () => {
    const c = createComment('TICKET-0001', { author: '   alice  ', body: '\thello\n' });
    expect(c.author).toBe('alice');
    expect(c.body).toBe('hello');
  });

  it('preserves internal whitespace in author and body', () => {
    const c = createComment('TICKET-0001', { author: 'al ice', body: 'hello  world' });
    expect(c.author).toBe('al ice');
    expect(c.body).toBe('hello  world');
  });
});

describe('addComment - edge cases', () => {
  it('adds to an empty array to produce a single-element array', () => {
    const c = makeComment();
    const result = addComment([], c);
    expect(result).toEqual([c]);
  });

  it('returns a new array reference (does not reuse the input)', () => {
    const input: Comment[] = [makeComment({ id: 'COMMENT-1' })];
    const result = addComment(input, makeComment({ id: 'COMMENT-2' }));
    expect(result).not.toBe(input);
  });
});

describe('getCommentsByTicket - edge cases', () => {
  it('returns [] when no comments match', () => {
    const comments = [
      makeComment({ id: 'A', ticketId: 'TICKET-0001' }),
      makeComment({ id: 'B', ticketId: 'TICKET-0002' }),
    ];
    expect(getCommentsByTicket(comments, 'TICKET-9999')).toEqual([]);
  });

  it('returns [] when the input list is empty', () => {
    expect(getCommentsByTicket([], 'TICKET-0001')).toEqual([]);
  });

  it('preserves the original order of matching comments', () => {
    const c1 = makeComment({ id: 'C1', ticketId: 'TICKET-0001', createdAt: new Date('2024-03-01') });
    const c2 = makeComment({ id: 'C2', ticketId: 'TICKET-0002' });
    const c3 = makeComment({ id: 'C3', ticketId: 'TICKET-0001', createdAt: new Date('2024-01-01') });
    const c4 = makeComment({ id: 'C4', ticketId: 'TICKET-0001', createdAt: new Date('2024-02-01') });

    const result = getCommentsByTicket([c1, c2, c3, c4], 'TICKET-0001');

    // Filter preserves insertion order (not date-sorted).
    expect(result.map(c => c.id)).toEqual(['C1', 'C3', 'C4']);
  });
});

describe('sortCommentsByDate - small inputs', () => {
  it('returns [] for an empty array', () => {
    expect(sortCommentsByDate([])).toEqual([]);
  });

  it('returns a copy (not the same reference) for a single-element array', () => {
    const input = [makeComment({ id: 'only' })];
    const result = sortCommentsByDate(input);
    expect(result).not.toBe(input);
    expect(result).toEqual(input);
  });

  it('sorts already-descending input into ascending order by createdAt', () => {
    const newer = makeComment({ id: 'new', createdAt: new Date('2024-12-01') });
    const middle = makeComment({ id: 'mid', createdAt: new Date('2024-06-01') });
    const older = makeComment({ id: 'old', createdAt: new Date('2024-01-01') });

    const result = sortCommentsByDate([newer, middle, older]);

    expect(result.map(c => c.id)).toEqual(['old', 'mid', 'new']);
  });
});
