const BAR_WIDTHS = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2];

export default function Barcode({ className, style }) {
  return (
    <div className={className} style={{ display: "flex", gap: "1.5px", alignItems: "center", ...style }}>
      {BAR_WIDTHS.map((w, i) => (
        <span key={i} style={{ display: "inline-block", width: `${w}px`, height: "100%", background: "var(--text)" }} />
      ))}
    </div>
  );
}
