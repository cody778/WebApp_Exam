import { useEffect, useState } from 'react'

/**
 * Short message at the bottom of the screen that hides itself.
 * @param {string} [initial] Message to show right away, such as one passed through navigation.
 * @returns {{ notice: import('react').ReactNode, show: (message: string) => void }}
 */
export function useNotice(initial = '') {
  const [message, setMessage] = useState(initial)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [message])

  const notice = message ? (
    <p
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] m-0 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-center text-sm leading-[1.4] text-on-brand shadow-[0_8px_24px_rgba(30,30,30,0.25)]"
    >
      {message}
    </p>
  ) : null

  return { notice, show: setMessage }
}
