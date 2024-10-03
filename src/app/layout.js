import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider >
        <div className="main-container">
          {children}
        </div>
        </MantineProvider>
      </body>
    </html>
  );
}
