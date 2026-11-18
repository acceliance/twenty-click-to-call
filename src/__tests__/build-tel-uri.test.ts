import { describe, expect, it } from 'vitest';

import { buildE164, formatForDisplay } from 'src/utils/build-tel-uri';

describe('buildE164', () => {
  it('combines calling code and national number, dropping the trunk 0', () => {
    expect(
      buildE164({ primaryPhoneNumber: '06 12 34 56 78', primaryPhoneCallingCode: '+33' }),
    ).toBe('+33612345678');
  });

  it('keeps a number already stored in international form', () => {
    expect(buildE164({ primaryPhoneNumber: '+32 470 12 34 56' })).toBe('+32470123456');
    expect(buildE164({ primaryPhoneNumber: '0041 79 123 45 67' })).toBe('+41791234567');
  });

  it('defaults to +33 when no calling code is stored', () => {
    expect(buildE164({ primaryPhoneNumber: '612345678' })).toBe('+33612345678');
  });

  it('returns null without a usable number', () => {
    expect(buildE164(null)).toBeNull();
    expect(buildE164({ primaryPhoneNumber: '' })).toBeNull();
    expect(buildE164({ primaryPhoneNumber: '12' })).toBeNull();
  });
});

describe('formatForDisplay', () => {
  it('groups French numbers by pairs', () => {
    expect(formatForDisplay('+33612345678')).toBe('+33 6 12 34 56 78');
  });

  it('leaves other numbers unchanged', () => {
    expect(formatForDisplay('+32470123456')).toBe('+32470123456');
  });
});
