import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<string[]>('hydro-favorites', []);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, [setFavorites]);

  const isFavorite = useCallback(
    (path: string) => favorites.includes(path),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
