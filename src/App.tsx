import { RouterProvider } from 'react-router-dom';
import { UnitProvider } from './context/UnitContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SliderModeProvider } from './context/SliderModeContext';
import { I18nProvider } from './context/I18nContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { router } from './router';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnitProvider>
          <ToastProvider>
            <SliderModeProvider>
              <I18nProvider>
                <RouterProvider router={router} />
              </I18nProvider>
            </SliderModeProvider>
          </ToastProvider>
        </UnitProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
