import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from "next";
import '@mantine/core/styles.css';
import "./globals.css";



export const metadata: Metadata = {
  title: "U❤️S",
  description: "Private music player app",
};


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}