import fs from 'fs';
import path from 'path';

describe('Typography', () => {
  const globalsCssPath = path.join(process.cwd(), 'src/app/globals.css');
  let cssContent: string;

  beforeAll(() => {
    cssContent = fs.readFileSync(globalsCssPath, 'utf-8');
  });

  it('should define base heading styles', () => {
    // We want to ensure headings have some default modern styling
    // e.g. h1 { @apply ... }
    expect(cssContent).toMatch(/h1\s*\{/);
  });
});
