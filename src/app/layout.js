import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "Freelancer Hub - Find Top Talent",
  description: "Connect with skilled freelancers for your next project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
