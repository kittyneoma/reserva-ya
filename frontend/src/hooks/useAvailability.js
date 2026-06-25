import { useState } from 'react'
import axios from 'axios'

/**
 * hook para verificar disponibilidad de mesas en un restaurante
 * @param {string|number} restaurantId
 */
export function useAvailability(restaurantId) {
  const [availability, setAvailability] = useState(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)

  /**
   * verifica disponibilidad para una fecha, hora y numero de personas
   * @param {string} date - formato YYYY-MM-DD
   * @param {string} time - formato HH:MM
   * @param {number} partySize
   */
  const check = async (date, time, partySize) => {
    if (!date || !time || !partySize) return
    setChecking(true)
    setError(null)
    try {
      const { data } = await axios.get(`/api/reservations/availability/${restaurantId}`, {
        params: { date, time, partySize }
      })
      setAvailability(data)
    } catch (err) {
      setError('No se pudo verificar disponibilidad')
      setAvailability(null)
    } finally {
      setChecking(false)
    }
  }

  return { availability, checking, error, check }
}