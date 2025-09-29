'use client'

import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize with the initial value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error)
    }
  }, [key])

  // Save to localStorage whenever value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }

        return valueToStore
      })
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue]
}

// Specialized version for Set to handle serialization
export function useLocalStorageSet<T>(key: string): [Set<T>, (value: Set<T> | ((prev: Set<T>) => Set<T>)) => void] {
  const [arrayValue, setArrayValue] = useLocalStorage<T[]>(key, [])

  const setValue = useCallback((value: Set<T> | ((prev: Set<T>) => Set<T>)) => {
    setArrayValue(prev => {
      const prevSet = new Set(prev)
      const newSet = value instanceof Function ? value(prevSet) : value
      return Array.from(newSet)
    })
  }, [setArrayValue])

  return [new Set(arrayValue), setValue]
}
