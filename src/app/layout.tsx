// // src/app/layout.tsx

// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { cn } from "@/lib/utils"; // <-- ADD THIS LINE

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "45-Day Fitness Challenge",
//   description: "Begin your transformation in just 45 days.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={cn(
//           "min-h-screen bg-background font-sans antialiased",
//           inter.className
//         )}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/auth/AuthProvider"; // ✅ IMPORT THE PROVIDER
import { Toaster } from "@/components/ui/toaster"; // Add Toaster for notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "45-Day Fitness Challenge",
  description: "Begin your transformation in just 45 days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        {/* ✅ WRAP YOUR APP IN THE AUTH PROVIDER */}
        <AuthProvider>
          {children}
          <Toaster /> {/* Toaster for showing notifications */}
        </AuthProvider>
      </body>
    </html>
  );
}