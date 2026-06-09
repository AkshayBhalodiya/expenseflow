'use client';

import { useEffect } from 'react';

/** Auth pages always use light theme — avoids split blue/black on system dark mode */
export function AuthThemeScope({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    html.classList.remove('dark');
    html.classList.add('light');
    html.style.colorScheme = 'light';
    return () => {
      html.classList.remove('light');
      html.style.colorScheme = '';
      if (hadDark) html.classList.add('dark');
    };
  }, []);

  return <>{children}</>;
}
