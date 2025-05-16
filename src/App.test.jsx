import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the components that App uses
vi.mock('./context/AppContext', () => ({
  AppProvider: ({ children }) => <div data-testid="app-provider">{children}</div>,
  useAppContext: () => ({
    selectedDate: new Date(),
    totalRevenue: 0,
    customers: [],
    loading: false,
  }),
}));

vi.mock('./pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('@mui/x-date-pickers', () => ({
  LocalizationProvider: ({ children }) => <div data-testid="localization-provider">{children}</div>,
}));

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: () => <div data-testid="route">Route</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('localization-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByTestId('route')).toBeInTheDocument();
  });
});
