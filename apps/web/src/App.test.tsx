import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App foundation', () => {
  it('renders the Phase 0 foundation status', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /frontend foundation ready/i })).toBeInTheDocument();
    expect(screen.getByText(/React, strict TypeScript, and Vite/i)).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});
