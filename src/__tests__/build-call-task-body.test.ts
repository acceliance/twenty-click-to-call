import { describe, expect, it } from 'vitest';

import { buildCallTaskBody } from 'src/utils/build-call-task-body';

describe('buildCallTaskBody', () => {
  it('prefills the body with "<number> : "', () => {
    const body = buildCallTaskBody('+33661977375', 'block-id');

    expect(body.markdown).toBe('+33661977375 : ');
    expect(JSON.parse(body.blocknote)).toEqual([
      expect.objectContaining({
        id: 'block-id',
        type: 'paragraph',
        content: [{ type: 'text', text: '+33661977375 : ', styles: {} }],
      }),
    ]);
  });
});
