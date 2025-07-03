import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

jest.mock('../components/EmptyState', () => ({
  __esModule: true,
  default: ({ title }) => <div data-testid="empty-state">{title}</div>,
}));

describe('DashboardPage', () => {
  it('shows EmptyState when documents list is empty', () => {
    // Mock useState to return empty documents
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], jest.fn()]);
    render(<DashboardPage />);
    expect(screen.getByTestId('empty-state')).toHaveTextContent('No Documents Yet');
  });

  it('shows loading state', () => {
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], jest.fn()]) // documents
      .mockImplementationOnce(() => [1, jest.fn()]) // page
      .mockImplementationOnce(() => [0, jest.fn()]) // total
      .mockImplementationOnce(() => [10, jest.fn()]) // limit
      .mockImplementationOnce(() => [true, jest.fn()]) // loading
      .mockImplementationOnce(() => ['', jest.fn()]); // error
    render(<DashboardPage />);
    expect(screen.getByText(/Loading documents/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [[], jest.fn()]) // documents
      .mockImplementationOnce(() => [1, jest.fn()]) // page
      .mockImplementationOnce(() => [0, jest.fn()]) // total
      .mockImplementationOnce(() => [10, jest.fn()]) // limit
      .mockImplementationOnce(() => [false, jest.fn()]) // loading
      .mockImplementationOnce(() => ['Failed to load documents.', jest.fn()]); // error
    render(<DashboardPage />);
    expect(screen.getByText(/Failed to load documents/i)).toBeInTheDocument();
  });
}); 