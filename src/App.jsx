import { Routes, Route } from 'react-router-dom'
import Landing    from './pages/Landing'
import Dashboard  from './pages/Dashboard'
import SubmitWork from './pages/SubmitWork'
import Score      from './pages/Score'

/* =====================================================
   POD — Root Router
   All route declarations live here.
   ===================================================== */
function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />}    />
      <Route path="/dashboard" element={<Dashboard />}  />
      <Route path="/submit"    element={<SubmitWork />} />
      <Route path="/score"     element={<Score />}      />
    </Routes>
  )
}

export default App
