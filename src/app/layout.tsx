// file: src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Auto.mk",
  description: "Marketplace for North Macedonia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mk">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
