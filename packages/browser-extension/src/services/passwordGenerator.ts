/**
 * Password Generator Service
 * Generates secure random passwords with configurable options
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSymbols?: number;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Ambiguous characters that can be confused
const AMBIGUOUS = 'il1Lo0O';

class PasswordGeneratorService {
  /**
   * Generate a random password based on options
   */
  generatePassword(options: Partial<PasswordGeneratorOptions> = {}): string {
    const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

    // Validate options
    this.validateOptions(opts);

    // Build character pool
    const pool = this.buildCharacterPool(opts);

    if (pool.length === 0) {
      throw new Error('At least one character type must be selected');
    }

    // Generate password ensuring minimum requirements
    let password = this.generateWithRequirements(pool, opts);

    return password;
  }

  /**
   * Generate a memorable passphrase (diceware-style)
   */
  generatePassphrase(wordCount: number = 4, separator: string = '-'): string {
    const words = [
      'correct', 'horse', 'battery', 'staple', 'mountain', 'river', 'ocean',
      'forest', 'desert', 'island', 'valley', 'canyon', 'meadow', 'prairie',
      'tundra', 'glacier', 'volcano', 'crater', 'summit', 'ridge', 'cliff',
      'boulder', 'pebble', 'crystal', 'diamond', 'emerald', 'sapphire', 'ruby',
      'amber', 'pearl', 'coral', 'ivory', 'silver', 'golden', 'bronze',
      'copper', 'iron', 'steel', 'marble', 'granite', 'sandstone', 'limestone',
      'obsidian', 'quartz', 'jasper', 'onyx', 'opal', 'topaz', 'garnet',
      'amethyst', 'turquoise', 'jade', 'azure', 'crimson', 'scarlet', 'violet',
      'indigo', 'magenta', 'cyan', 'teal', 'navy', 'royal', 'imperial',
      'noble', 'grand', 'supreme', 'ultimate', 'prime', 'alpha', 'omega',
      'nexus', 'apex', 'zenith', 'nadir', 'vortex', 'aurora', 'nebula',
      'cosmos', 'stellar', 'lunar', 'solar', 'comet', 'meteor', 'asteroid',
      'planet', 'galaxy', 'universe', 'quantum', 'photon', 'neutron', 'proton',
      'electron', 'atom', 'molecule', 'particle', 'wave', 'field', 'force',
      'energy', 'power', 'velocity', 'momentum', 'gravity', 'orbit', 'eclipse',
    ];

    const selectedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = this.getRandomInt(0, words.length - 1);
      selectedWords.push(words[randomIndex]);
    }

    return selectedWords.join(separator);
  }

  /**
   * Calculate password strength (0-100)
   */
  calculateStrength(password: string): {
    score: number;
    feedback: string;
    crackTime: string;
  } {
    let score = 0;
    const length = password.length;

    // Length score (0-40 points)
    if (length >= 16) score += 40;
    else if (length >= 12) score += 30;
    else if (length >= 8) score += 20;
    else score += 10;

    // Complexity score (0-40 points)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    const complexity = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    score += complexity * 10;

    // Diversity score (0-20 points)
    const uniqueChars = new Set(password).size;
    const diversity = uniqueChars / length;
    score += Math.floor(diversity * 20);

    // Clamp score to 0-100
    score = Math.min(100, Math.max(0, score));

    // Provide feedback
    let feedback = '';
    if (score >= 80) feedback = 'Very Strong';
    else if (score >= 60) feedback = 'Strong';
    else if (score >= 40) feedback = 'Medium';
    else if (score >= 20) feedback = 'Weak';
    else feedback = 'Very Weak';

    // Estimate crack time
    const crackTime = this.estimateCrackTime(password);

    return { score, feedback, crackTime };
  }

  /**
   * Validate password against requirements
   */
  validatePassword(password: string, options: Partial<PasswordGeneratorOptions> = {}): {
    valid: boolean;
    errors: string[];
  } {
    const opts = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
    const errors: string[] = [];

    if (password.length < opts.length) {
      errors.push(`Password must be at least ${opts.length} characters long`);
    }

    if (opts.includeUppercase && opts.minUppercase) {
      const upperCount = (password.match(/[A-Z]/g) || []).length;
      if (upperCount < opts.minUppercase) {
        errors.push(`Password must contain at least ${opts.minUppercase} uppercase letter(s)`);
      }
    }

    if (opts.includeLowercase && opts.minLowercase) {
      const lowerCount = (password.match(/[a-z]/g) || []).length;
      if (lowerCount < opts.minLowercase) {
        errors.push(`Password must contain at least ${opts.minLowercase} lowercase letter(s)`);
      }
    }

    if (opts.includeNumbers && opts.minNumbers) {
      const numberCount = (password.match(/[0-9]/g) || []).length;
      if (numberCount < opts.minNumbers) {
        errors.push(`Password must contain at least ${opts.minNumbers} number(s)`);
      }
    }

    if (opts.includeSymbols && opts.minSymbols) {
      const symbolCount = (password.match(/[^a-zA-Z0-9]/g) || []).length;
      if (symbolCount < opts.minSymbols) {
        errors.push(`Password must contain at least ${opts.minSymbols} symbol(s)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods

  private validateOptions(opts: PasswordGeneratorOptions): void {
    if (opts.length < 4) {
      throw new Error('Password length must be at least 4 characters');
    }

    if (opts.length > 128) {
      throw new Error('Password length cannot exceed 128 characters');
    }

    const totalMinimum =
      (opts.minUppercase || 0) +
      (opts.minLowercase || 0) +
      (opts.minNumbers || 0) +
      (opts.minSymbols || 0);

    if (totalMinimum > opts.length) {
      throw new Error('Minimum requirements exceed password length');
    }
  }

  private buildCharacterPool(opts: PasswordGeneratorOptions): string {
    let pool = '';

    if (opts.includeLowercase) pool += LOWERCASE;
    if (opts.includeUppercase) pool += UPPERCASE;
    if (opts.includeNumbers) pool += NUMBERS;
    if (opts.includeSymbols) pool += SYMBOLS;

    // Remove ambiguous characters if requested
    if (opts.excludeAmbiguous) {
      pool = pool
        .split('')
        .filter((char) => !AMBIGUOUS.includes(char))
        .join('');
    }

    return pool;
  }

  private generateWithRequirements(
    pool: string,
    opts: PasswordGeneratorOptions
  ): string {
    const password: string[] = [];

    // First, add minimum required characters
    if (opts.includeUppercase && opts.minUppercase) {
      for (let i = 0; i < opts.minUppercase; i++) {
        password.push(this.getRandomChar(UPPERCASE, opts.excludeAmbiguous));
      }
    }

    if (opts.includeLowercase && opts.minLowercase) {
      for (let i = 0; i < opts.minLowercase; i++) {
        password.push(this.getRandomChar(LOWERCASE, opts.excludeAmbiguous));
      }
    }

    if (opts.includeNumbers && opts.minNumbers) {
      for (let i = 0; i < opts.minNumbers; i++) {
        password.push(this.getRandomChar(NUMBERS, opts.excludeAmbiguous));
      }
    }

    if (opts.includeSymbols && opts.minSymbols) {
      for (let i = 0; i < opts.minSymbols; i++) {
        password.push(this.getRandomChar(SYMBOLS, opts.excludeAmbiguous));
      }
    }

    // Fill the rest with random characters from pool
    while (password.length < opts.length) {
      password.push(this.getRandomChar(pool, false));
    }

    // Shuffle the password array
    this.shuffleArray(password);

    return password.join('');
  }

  private getRandomChar(charset: string, excludeAmbiguous: boolean): string {
    let pool = charset;
    if (excludeAmbiguous) {
      pool = charset
        .split('')
        .filter((char) => !AMBIGUOUS.includes(char))
        .join('');
    }

    const randomIndex = this.getRandomInt(0, pool.length - 1);
    return pool[randomIndex];
  }

  private getRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const randomBytes = new Uint8Array(bytesNeeded);

    let randomValue;
    do {
      crypto.getRandomValues(randomBytes);
      randomValue = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        randomValue = randomValue * 256 + randomBytes[i];
      }
    } while (randomValue >= maxValue - (maxValue % range));

    return min + (randomValue % range);
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.getRandomInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private estimateCrackTime(password: string): string {
    const length = password.length;
    let charsetSize = 0;

    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    // Calculate entropy
    const entropy = length * Math.log2(charsetSize);

    // Assume 1 billion guesses per second (modern GPU)
    const guessesPerSecond = 1e9;
    const possibleCombinations = Math.pow(2, entropy);
    const secondsToCrack = possibleCombinations / guessesPerSecond / 2; // Average case

    if (secondsToCrack < 1) return 'Instant';
    if (secondsToCrack < 60) return `${Math.ceil(secondsToCrack)} seconds`;
    if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 2592000) return `${Math.ceil(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 2592000)} months`;
    if (secondsToCrack < 3153600000) return `${Math.ceil(secondsToCrack / 31536000)} years`;
    return 'Centuries';
  }
}

export const passwordGenerator = new PasswordGeneratorService();
