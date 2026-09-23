import "./globals.css";

export const metadata = {
  title: "DeadKind — DK-2050",
  description: "DeadKind streetwear — DK-2050 collection.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
