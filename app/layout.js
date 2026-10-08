import "./globals.css";

export const metadata = {
  title: "Dead'Kind — DK-2050",
  description: "Dead'Kind — streetwear for those who don't fit. Shop the DK-2050 collection. Limited drops. No trends. Just chaos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
