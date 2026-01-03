import fs from 'fs';
import path from 'path';

describe('Theme Configuration', () => {
  const globalsCssPath = path.join(process.cwd(), 'src/app/globals.css');
  let cssContent: string;

  beforeAll(() => {
    cssContent = fs.readFileSync(globalsCssPath, 'utf-8');
  });

  it('should define urgency color variables', () => {
    expect(cssContent).toContain('--color-urgency-high');
    expect(cssContent).toContain('--color-urgency-medium');
  });

  it('should update dark mode background to charcoal', () => {
    // Looking for the .dark block and then the background variable
    // This is a simple regex check.
    // We expect something like: --background: oklch(0.2 0 0); or similar for charcoal
    // We can also just check if the file contains the specific line if we are strict
    expect(cssContent).toContain('--background: oklch(0.2 0 0);'); 
  });

  it('should use soft white for dark mode text', () => {
     expect(cssContent).toContain('--foreground: oklch(0.9 0 0);');
  });
});
