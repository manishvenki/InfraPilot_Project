import { render, screen } from '@testing-library/react';
import App from './App';

test('renders InfraPilot suite header', () => {
  render(<App />);
  const titleElement = screen.getByText(/InfraPilot/i);
  expect(titleElement).toBeInTheDocument();
});
