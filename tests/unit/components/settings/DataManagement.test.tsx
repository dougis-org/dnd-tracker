import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataManagement from '@/components/settings/DataManagement';

describe('DataManagement', () => {
  it('should render data management section', () => {
    render(<DataManagement />);

    expect(screen.getByText(/data management/i)).toBeInTheDocument();
  });

  it('should display export button', () => {
    render(<DataManagement />);

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('should show confirmation message when export button is clicked', () => {
    render(<DataManagement />);

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    expect(
      screen.getByText(/export functionality coming soon/i)
    ).toBeInTheDocument();
  });

  it('should display description about data export', () => {
    render(<DataManagement />);

    expect(
      screen.getByText(/download a copy of your data/i)
    ).toBeInTheDocument();
  });
});
