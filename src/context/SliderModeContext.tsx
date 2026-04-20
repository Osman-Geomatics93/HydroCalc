import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SliderModeContextValue {
  sliderMode: boolean;
  toggleSliderMode: () => void;
}

const SliderModeContext = createContext<SliderModeContextValue>({
  sliderMode: false,
  toggleSliderMode: () => {},
});

export function SliderModeProvider({ children }: { children: React.ReactNode }) {
  const [sliderMode, setSliderMode] = useLocalStorage('hydro-slider-mode', false);

  const toggleSliderMode = () => setSliderMode((prev) => !prev);

  return (
    <SliderModeContext.Provider value={{ sliderMode, toggleSliderMode }}>
      {children}
    </SliderModeContext.Provider>
  );
}

export function useSliderMode() {
  return useContext(SliderModeContext);
}
