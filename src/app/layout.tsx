import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  Righteous,
  Creepster, 
  Orbitron,
  Dancing_Script,
  Bungee,
  Monoton,
  Audiowide,
  Black_Ops_One
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fuentes para cada estilo de música
const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: "400"
});

const creepster = Creepster({
  variable: "--font-creepster", 
  subsets: ["latin"],
  weight: "400"
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"]
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "600", "700"]
});

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400"
});

const monoton = Monoton({
  variable: "--font-monoton",
  subsets: ["latin"],
  weight: "400"
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: "400"
});

const blackOpsOne = Black_Ops_One({
  variable: "--font-black-ops",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Meeting Starting Soon",
  description: "Dynamic meeting starting soon pages with synchronized audio and video",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png?v=2" />
        <link rel="apple-touch-icon" href="/favicon.png?v=2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${righteous.variable} ${creepster.variable} ${orbitron.variable} ${dancingScript.variable} ${bungee.variable} ${monoton.variable} ${audiowide.variable} ${blackOpsOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
