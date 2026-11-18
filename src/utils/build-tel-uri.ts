// Twenty PHONES field: number and calling code are stored separately
// (e.g. primaryPhoneNumber "6 12 34 56 78", primaryPhoneCallingCode "+33").
export type TwentyPhones = {
  primaryPhoneNumber?: string | null;
  primaryPhoneCallingCode?: string | null;
  primaryPhoneCountryCode?: string | null;
};

const DEFAULT_CALLING_CODE = '+33';

// Returns an E.164-like number (+33612345678), or null when there is no usable number.
export const buildE164 = (phones: TwentyPhones | null | undefined): string | null => {
  const raw = phones?.primaryPhoneNumber?.trim();
  if (!raw) return null;

  // Already international: keep "+" and digits only
  if (raw.startsWith('+') || raw.startsWith('00')) {
    const digits = raw.replace(/\D/g, '').replace(/^00/, '');
    return digits.length >= 6 ? `+${digits}` : null;
  }

  const callingCode = (phones?.primaryPhoneCallingCode?.trim() || DEFAULT_CALLING_CODE).replace(
    /[^\d+]/g,
    '',
  );
  const national = raw.replace(/\D/g, '').replace(/^0+/, ''); // drop national trunk prefix "0"
  if (national.length < 4) return null;

  return `${callingCode.startsWith('+') ? callingCode : `+${callingCode}`}${national}`;
};

// Readable form for the notification text: +33 6 12 34 56 78
export const formatForDisplay = (e164: string): string => {
  const match = /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(e164);
  return match ? `+33 ${match.slice(1).join(' ')}` : e164;
};
