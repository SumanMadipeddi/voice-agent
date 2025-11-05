import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './components/app/theme-toggle';
import { cn, getAppConfig, getStyles } from './lib/utils';
import type { AppConfig } from './app-config';
import { Header } from './components/Header';
import { App as AppComponent } from './components/app/app';
import { APP_CONFIG_DEFAULTS } from './app-config';

export function App() {
  const [appConfig, setAppConfig] = useState<AppConfig>(APP_CONFIG_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppConfig().then((config) => {
      setAppConfig(config);
      setLoading(false);
      
      // Apply dynamic styles
      const styles = getStyles(config);
      if (styles) {
        const styleElement = document.createElement('style');
        styleElement.id = 'app-dynamic-styles';
        // Remove old style if exists
        const oldStyle = document.getElementById('app-dynamic-styles');
        if (oldStyle) oldStyle.remove();
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
      }
      
      // Update document title and meta
      document.title = config.pageTitle;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', config.pageDescription);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid h-svh place-content-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme-mode">
      <div className={cn('scroll-smooth font-sans antialiased')}>
        <Header appConfig={appConfig} />
        <AppComponent appConfig={appConfig} />
        <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
          <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
        </div>
      </div>
    </ThemeProvider>
  );
}

