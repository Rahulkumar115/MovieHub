import AuthProvider from "@/components/layout/AuthProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar"; // <-- Import it here

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovieHub",
  description: "Book movie tickets instantly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} pt-16 bg-gray-950`}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}