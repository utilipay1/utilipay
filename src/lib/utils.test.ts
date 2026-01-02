import { cn } from './utils';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
    expect(cn('p-4', 'p-8')).toBe('p-8'); // tailwind-merge should resolve conflict
  });
});
