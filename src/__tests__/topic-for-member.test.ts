import { describe, expect, it } from 'vitest';

import { topicSuffixFor } from 'src/utils/topic-for-member';

describe('topicSuffixFor', () => {
  it('uses the email local part, ntfy-safe', () => {
    expect(topicSuffixFor({ userEmail: 'jane.doe@example.com' }, 'id')).toBe('jane-doe');
    expect(topicSuffixFor({ userEmail: 'Élodie.Martin+crm@example.com' }, 'id')).toBe('elodie-martin-crm');
  });

  it('falls back to the workspace member id', () => {
    expect(topicSuffixFor(undefined, 'dc39f918')).toBe('dc39f918');
    expect(topicSuffixFor({ userEmail: null }, 'dc39f918')).toBe('dc39f918');
  });
});
