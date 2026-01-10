import { randomBytes } from 'crypto';

/**
 * Character sets for password generation
 */
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Password generation options
 */
export interface PasswordOptions {
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  excludeSimilar?: boolean; // Exclude similar characters (0, O, l, 1, I)
  excludeAmbiguous?: boolean; // Exclude ambiguous symbols
}

/**
 * Default password options
 */
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

/**
 * Similar characters that can be confusing
 */
const SIMILAR_CHARS = '0Ol1I';

/**
 * Ambiguous symbols
 */
const AMBIGUOUS_SYMBOLS = '{}[]()/\\\'"`~,;:.<>';

/**
 * Generates a cryptographically secure random password
 * @param options - Password generation options
 * @returns Generated password
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  if (!opts.length || opts.length < 4) {
    throw new Error('Password length must be at least 4 characters');
  }

  // Build character set
  let charset = '';

  if (opts.lowercase) {
    charset += LOWERCASE;
  }

  if (opts.uppercase) {
    charset += UPPERCASE;
  }

  if (opts.digits) {
    charset += DIGITS;
  }

  if (opts.symbols) {
    let symbols = SYMBOLS;
    if (opts.excludeAmbiguous) {
      symbols = symbols
        .split('')
        .filter((c) => !AMBIGUOUS_SYMBOLS.includes(c))
        .join('');
    }
    charset += symbols;
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be enabled');
  }

  // Exclude similar characters if requested
  if (opts.excludeSimilar) {
    charset = charset
      .split('')
      .filter((c) => !SIMILAR_CHARS.includes(c))
      .join('');
  }

  // Generate password
  const password: string[] = [];

  // Ensure at least one character from each selected type
  const required: string[] = [];

  if (opts.lowercase) {
    required.push(getRandomChar(LOWERCASE));
  }

  if (opts.uppercase) {
    required.push(getRandomChar(UPPERCASE));
  }

  if (opts.digits) {
    required.push(getRandomChar(DIGITS));
  }

  if (opts.symbols) {
    required.push(getRandomChar(SYMBOLS));
  }

  // Fill remaining length with random characters from charset
  const remainingLength = opts.length - required.length;

  for (let i = 0; i < remainingLength; i++) {
    password.push(getRandomChar(charset));
  }

  // Add required characters
  password.push(...required);

  // Shuffle the password
  return shuffleString(password.join(''));
}

/**
 * Gets a cryptographically secure random character from a string
 * @param str - String to pick from
 * @returns Random character
 */
function getRandomChar(str: string): string {
  const randomIndex = getSecureRandomInt(str.length);
  return str[randomIndex];
}

/**
 * Generates a cryptographically secure random integer
 * @param max - Maximum value (exclusive)
 * @returns Random integer between 0 and max-1
 */
function getSecureRandomInt(max: number): number {
  const randomBuffer = randomBytes(4);
  const randomInt = randomBuffer.readUInt32BE(0);
  return randomInt % max;
}

/**
 * Shuffles a string using Fisher-Yates algorithm with secure randomness
 * @param str - String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const arr = str.split('');

  for (let i = arr.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

/**
 * Checks password strength
 * @param password - Password to check
 * @returns Strength score (0-4)
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

/**
 * Generates a passphrase from a word list
 * @param wordCount - Number of words (default: 4)
 * @param separator - Separator between words (default: '-')
 * @returns Generated passphrase
 */
export function generatePassphrase(wordCount: number = 4, separator: string = '-'): string {
  // Simple word list for passphrases (in production, use a larger list)
  const words = [
    'correct',
    'horse',
    'battery',
    'staple',
    'apple',
    'banana',
    'cherry',
    'dragon',
    'elephant',
    'forest',
    'guitar',
    'harmony',
    'island',
    'jungle',
    'mountain',
    'ocean',
    'planet',
    'rainbow',
    'sunset',
    'thunder',
  ];

  const selectedWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    selectedWords.push(getRandomChar(words.join(',')).split(',').join(''));
  }

  return selectedWords.join(separator);
}
