import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Akash Agrawal | Full-Stack Software Engineer",
  description: "Full-Stack Software Engineer · AI/ML · Systems at Scale",
  keywords: [
    "Akash Agrawal",
    "Software Engineer",
    "Full-Stack Developer",
    "AI/ML",
    "Machine Learning",
    "Arizona State University",
    "Next.js",
    "React",
    "Python",
  ],
  authors: [{ name: "Akash Agrawal" }],
  creator: "Akash Agrawal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://github.com/sky021",
    title: "Akash Agrawal | Full-Stack Software Engineer",
    description: "Full-Stack Software Engineer · AI/ML · Systems at Scale",
    siteName: "Akash Agrawal Portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
