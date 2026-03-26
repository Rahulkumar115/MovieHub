import Footer from '@/components/layout/Footer'; // Or '@/components/Footer' depending on where you saved it!
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
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          {/* Main content expands to push the footer down */}
          <div className="flex-grow">
             {children}
          </div>
          <Footer /> {/* <-- ADD THE FOOTER HERE */}
        </AuthProvider>
      </body>
    </html>
  );
}