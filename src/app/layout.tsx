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
  title: "FRONT-LINE - Meeting Starting Soon",
  description: "Dynamic meeting starting soon pages with synchronized audio and video - Divide & Conquer",
  metadataBase: new URL('https://frontie-meetings.vercel.app'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "FRONT-LINE - Meeting Starting Soon",
    description: "Dynamic meeting starting soon pages with synchronized audio and video - Divide & Conquer",
    url: 'https://frontie-meetings.vercel.app',
    siteName: 'FRONT-LINE',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'FRONT-LINE - Divide & Conquer',
      }
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FRONT-LINE - Meeting Starting Soon",
    description: "Dynamic meeting starting soon pages with synchronized audio and video - Divide & Conquer",
    images: ['/favicon.png'],
    creator: '@frontline',
    site: '@frontline',
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
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image" content="https://frontie-meetings.vercel.app/favicon.png" />
        <meta name="twitter:image:alt" content="FRONT-LINE - Divide & Conquer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${righteous.variable} ${creepster.variable} ${orbitron.variable} ${dancingScript.variable} ${bungee.variable} ${monoton.variable} ${audiowide.variable} ${blackOpsOne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
