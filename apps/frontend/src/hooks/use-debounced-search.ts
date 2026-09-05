"use client"

import * as React from "react"

export function useDebouncedSearch(delay = 300) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, delay)
    return () => clearTimeout(timer)
  }, [search, delay])

  return { search, debouncedSearch, setSearch }
}
