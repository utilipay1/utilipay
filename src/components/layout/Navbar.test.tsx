import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('should render navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
  });

  it('should render notification center', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });
});
