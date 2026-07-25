import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../api/getErrorMessage'

type AsyncState<T> = {
  data: T | null
  error: string | null
  loading: boolean
}

/**
 * Load async data with AbortSignal and manual refetch.
 * Pass a stable fetcher or include changing inputs in `deps`.
 */
export function useAsyncResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: true,
  })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback((signal: AbortSignal) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    return fetcherRef
      .current(signal)
      .then((data) => {
        if (!signal.aborted) setState({ data, error: null, loading: false })
      })
      .catch((err: unknown) => {
        if (signal.aborted) return
        setState({ data: null, error: getErrorMessage(err), loading: false })
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void run(controller.signal)
    return () => controller.abort()
    // Caller-controlled dependency list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const refetch = useCallback(() => {
    const controller = new AbortController()
    void run(controller.signal)
  }, [run])

  return { ...state, refetch }
}
