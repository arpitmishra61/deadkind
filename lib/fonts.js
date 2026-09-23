import { Antonio, Bebas_Neue, Permanent_Marker, Rajdhani, Share_Tech_Mono, Space_Grotesk } from "next/font/google";

// "Shop" skin fonts — shared by the (shop) and (static) route groups.
export const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// "Dashboard" skin fonts — home page only.
export const antonio = Antonio({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-dashboard-body",
  display: "swap",
});

export const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});
