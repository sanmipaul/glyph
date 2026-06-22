import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.style.width).toBe('20px');
  });

  it('renders with custom size', () => {
    const { container } = render(<Spinner size={32} />);
    const svg = container.querySelector('svg');
    expect(svg?.style.width).toBe('32px');
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" description="Try adding some items." />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Try adding some items.')).toBeTruthy();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState title="Empty" description="desc" action={<button>Click me</button>} />
    );
    expect(screen.getByText('Click me')).toBeTruthy();
  });
});

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Staked" value="42" />);
    expect(screen.getByText('Total Staked')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders sub text when provided', () => {
    render(<StatCard label="APR" value="5%" sub="per annum" />);
    expect(screen.getByText('per annum')).toBeTruthy();
  });
});

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="My Page" />);
    expect(screen.getByText('My Page')).toBeTruthy();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Title" description="A description" />);
    expect(screen.getByText('A description')).toBeTruthy();
  });

  it('renders action when provided', () => {
    render(<PageHeader title="Title" action={<button>Action</button>} />);
    expect(screen.getByText('Action')).toBeTruthy();
  });
});
