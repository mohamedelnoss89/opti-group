'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (appId: string) => boolean;
  toggleFavorite: (appId: string) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
  loading: true,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/favorites?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setFavorites(data.favorites || []);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const isFavorite = useCallback(
    (appId: string) => favorites.includes(appId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (appId: string) => {
      if (!user) return;

      const wasFavorite = favorites.includes(appId);

      // Optimistic update
      if (wasFavorite) {
        setFavorites((prev) => prev.filter((id) => id !== appId));
      } else {
        setFavorites((prev) => [...prev, appId]);
      }

      try {
        if (wasFavorite) {
          const res = await fetch('/api/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, appId }),
          });
          if (!res.ok) {
            // Revert on error
            setFavorites((prev) => [...prev, appId]);
          }
        } else {
          const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, appId }),
          });
          if (!res.ok) {
            // Revert on error
            setFavorites((prev) => prev.filter((id) => id !== appId));
          }
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        // Revert on error
        if (wasFavorite) {
          setFavorites((prev) => [...prev, appId]);
        } else {
          setFavorites((prev) => prev.filter((id) => id !== appId));
        }
      }
    },
    [user, favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
