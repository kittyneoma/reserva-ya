import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * hook para obtener la lista publica de restaurantes activos
 */
export function useRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get('/api/restaurants')
      .then(res => setRestaurants(res.data.restaurants || []))
      .catch(() => setError('No se pudieron cargar los restaurantes'))
      .finally(() => setLoading(false))
  }, [])

  return { restaurants, loading, error }
}

/**
 * hook para obtener el detalle de un restaurante y su menu
 * @param {string|number} id - id del restaurante
 */
export function useRestaurantDetail(id) {
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      axios.get(`/api/restaurants/${id}`),
      axios.get(`/api/menu/restaurant/${id}`)
    ])
      .then(([resR, resM]) => {
        setRestaurant(resR.data.restaurant)
        setMenuItems(resM.data.menuItems || [])
      })
      .catch(() => setError('No se pudo cargar el restaurante'))
      .finally(() => setLoading(false))
  }, [id])

  return { restaurant, menuItems, loading, error }
}