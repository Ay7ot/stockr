'use client'

import { useEffect } from 'react'

export function TableAnimations() {
  useEffect(() => {
    const rows = document.querySelectorAll('tbody tr')
    rows.forEach((row, i) => {
      const htmlRow = row as HTMLElement
      htmlRow.style.opacity = '0'
      htmlRow.style.transform = 'translateY(8px)'
      htmlRow.style.transition = `opacity 0.25s ease ${i * 40 + 80}ms, transform 0.25s ease ${i * 40 + 80}ms`
      requestAnimationFrame(() => {
        htmlRow.style.opacity = '1'
        htmlRow.style.transform = 'translateY(0)'
      })
    })
  }, [])

  return null
}
