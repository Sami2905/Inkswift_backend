import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders illustration, title, and description', () => {
    render(
      <EmptyState
        illustration={<svg data-testid="svg-illustration" />}
        title="Test Title"
        description="Test description."
      />
    );
    expect(screen.getByTestId('svg-illustration')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description.')).toBeInTheDocument();
  });
}); 