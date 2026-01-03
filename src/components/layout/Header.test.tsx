import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { View } from '@/lib/types';

describe('Header', () => {
  const mockOnViewChange = jest.fn();

  it('should render brand name', () => {
    render(<Header currentView="dashboard" onViewChange={mockOnViewChange} />);
    expect(screen.getByText('UtiliPay')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(<Header currentView="dashboard" onViewChange={mockOnViewChange} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Bills')).toBeInTheDocument();
  });

  it('should highlight the active view', () => {
    const { rerender } = render(<Header currentView="dashboard" onViewChange={mockOnViewChange} />);
    
    // Check Dashboard is active (implementation detail: maybe check class or aria-current)
    // For now, let's assume we use a specific class 'text-primary' or similar for active
    // Or we can check if it's disabled or has a specific style. 
    // Let's use a simpler check: look for a specific class or aria-current="page"
    const dashboardBtn = screen.getByText('Dashboard');
    expect(dashboardBtn).toHaveAttribute('aria-current', 'page');
    
    rerender(<Header currentView="properties" onViewChange={mockOnViewChange} />);
    const propertiesBtn = screen.getByText('Properties');
    expect(propertiesBtn).toHaveAttribute('aria-current', 'page');
    expect(dashboardBtn).not.toHaveAttribute('aria-current');
  });

  it('should call onViewChange when a nav item is clicked', () => {
    render(<Header currentView="dashboard" onViewChange={mockOnViewChange} />);
    
    fireEvent.click(screen.getByText('Properties'));
    expect(mockOnViewChange).toHaveBeenCalledWith('properties');
    
    fireEvent.click(screen.getByText('Bills'));
    expect(mockOnViewChange).toHaveBeenCalledWith('bills');
  });
});
