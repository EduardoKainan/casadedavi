import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <Header />
              <div className="page-content">
                <div className="page-inner">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
