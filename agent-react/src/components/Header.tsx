import type { AppConfig } from '@/app-config';

interface HeaderProps {
  appConfig: AppConfig;
}

export function Header({}: HeaderProps) {

  return (
    <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="scale-100 transition-transform duration-300 hover:scale-110"
      >
      </a>
    </header>
  );
}

