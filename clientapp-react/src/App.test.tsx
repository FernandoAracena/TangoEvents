import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';

test('renders App layout and child route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<div>Test</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText('Test')).toBeInTheDocument();
});
