import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./routes/AppRouter', () => () => (
  <div data-testid="app-router">Tripnova</div>
));

test('renders app with auth provider', () => {
  render(<App />);
  expect(screen.getByTestId('app-router')).toBeInTheDocument();
  expect(screen.getByText('Tripnova')).toBeInTheDocument();
});
