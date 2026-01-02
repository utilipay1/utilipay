import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('should render', () => {
    render(<Home />);
    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();
  });
});
