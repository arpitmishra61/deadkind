import { antonio, permanentMarker, shareTechMono, spaceGrotesk } from "@/lib/fonts";
import "@/styles/dashboard-theme.css";

export default function DashboardLayout({ children }) {
  return (
    <div className={`${antonio.variable} ${spaceGrotesk.variable} ${shareTechMono.variable} ${permanentMarker.variable}`}>
      {children}
    </div>
  );
}
