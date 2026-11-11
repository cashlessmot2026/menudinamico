import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'

test('la landing muestra el nombre del negocio', () => {
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
  expect(screen.getAllByText(/Demo/).length).toBeGreaterThan(0)
})
