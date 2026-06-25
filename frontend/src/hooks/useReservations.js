import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * hook para obtener y gestionar las reservaciones del usuario autenticado
 * @param {string} filter - upcoming/past/all
 */
export function useReservations(filter = 'upcoming') {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filter === 'upcoming' ? '?upcoming=true' : filter === 'past' ? '?past=true' : ''
      const { data } = await axios.get(`/api/reservations/my/reservations${params}`)
      setReservations(data.reservations || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar reservaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  /**
   * cancela una reservacion por id
   * @param {number} id
   */
  const cancel = async (id) => {
    await axios.put(`/api/reservations/${id}/cancel`)
    await load()
  }

  return { reservations, loading, error, reload: load, cancel }
}