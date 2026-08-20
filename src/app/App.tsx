import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { LedgerProvider } from './providers/LedgerProvider'

function App() {
  return (
    <LedgerProvider>
      <RouterProvider router={router} />
    </LedgerProvider>
  )
}

export default App
