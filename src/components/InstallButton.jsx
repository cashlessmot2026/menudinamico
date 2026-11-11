import { useEffect, useState } from 'react'

export default function InstallButton() {
  const [evento, setEvento] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setEvento(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!evento) return null
  return (
    <button
      className="btn"
      onClick={async () => {
        evento.prompt()
        await evento.userChoice
        setEvento(null)
      }}
    >
      Instalar app
    </button>
  )
}
