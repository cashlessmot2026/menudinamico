import { Routes, Route } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="layout">
      <header className="topbar"><strong className="logo">Demo</strong></header>
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<h1>Demo</h1>} />
      </Routes>
    </Layout>
  )
}
