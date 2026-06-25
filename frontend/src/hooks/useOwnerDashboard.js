import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * hook para gestionar el panel del dueño del restaurante
 * obtiene los restaurantes del usuario y las reservaciones del restaurante seleccionado
 */
export function useOwnerDashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [selected, setSelected] = useState(null)
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')

  // carga los restaurantes del dueño
  useEffect(() => {
    axios.get('/api/restaurants/my/restaurants')
      .then(res => {
        const list = res.data.restaurants || []
        setRestaurants(list)
        if (list.length > 0) setSelected(list[0])
      })
      .finally(() => setLoading(false))
  }, [])

  // carga reservaciones y menu cuando cambia el restaurante o la fecha
  useEffect(() => {
    if (!selected) return
    const params = filterDate ? `?date=${filterDate}` : ''
    axios.get(`/api/reservations/restaurant/${selected.id}${params}`)
      .then(res => setReservations(res.data.reservations || []))
    axios.get(`/api/menu/restaurant/${selected.id}`)
      .then(res => setMenuItems(res.data.menuItems || []))
  }, [selected, filterDate])

  /**
   * actualiza el estado de una reservacion (confirmed / cancelled / completed)
   * @param {number} reservationId
   * @param {string} status
   */
  const updateStatus = async (reservationId, status) => {
    await axios.put(`/api/reservations/${reservationId}/status`, { status })
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status } : r))
  }

  /**
   * registra un nuevo restaurante para el dueño
   * @param {object} formData
   */
  const createRestaurant = async (formData) => {
    const { data } = await axios.post('/api/restaurants', formData)
    setRestaurants(prev => [...prev, data.restaurant])
    setSelected(data.restaurant)
    return data.restaurant
  }

  return {
    restaurants, selected, setSelected,
    reservations, menuItems,
    loading, filterDate, setFilterDate,
    updateStatus, createRestaurant
  }
}