import { useState, useEffect } from 'react'

export function useTheme() {
  const [fieldMode, setFieldMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fieldMode') === 'true'
    setFieldMode(saved)
    if (saved) document.documentElement.classList.add('field-mode')
  }, [])

  function toggle() {
    const next = !fieldMode
    setFieldMode(next)
    localStorage.setItem('fieldMode', String(next))
    document.documentElement.classList.toggle('field-mode', next)
  }

  return { fieldMode, toggle }
}
