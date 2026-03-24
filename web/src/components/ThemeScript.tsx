"use client";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
              if (!theme && supportDarkMode) theme = 'dark';
              if (theme === 'dark') document.documentElement.classList.add('dark');
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
