function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function baseLayout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Dead'Kind</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',Courier,monospace;color:#e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #222;border-top:3px solid #c45486;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
            <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:6px;color:#ffffff;text-transform:uppercase;">DEAD'KIND</p>
            <p style="margin:4px 0 0;font-size:10px;letter-spacing:4px;color:#c45486;text-transform:uppercase;">DK-2050 Collection</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #1a1a1a;text-align:center;">
            <p style="margin:0;font-size:11px;color:#444;letter-spacing:2px;text-transform:uppercase;">
              Dead'Kind Streetwear &nbsp;·&nbsp; DK-2050
            </p>
            <p style="margin:8px 0 0;font-size:10px;color:#333;">
              This is an automated email — please do not reply directly.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function itemsTable(items) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#ccc;">
        <span style="color:#fff;">${item.name}</span>
        <span style="color:#666;font-size:11px;margin-left:8px;">× ${item.qty}</span>
        ${item.colour ? `<br/><span style="color:#555;font-size:11px;">Colour: ${item.colour}</span>` : ""}
        ${item.size ? `&nbsp;&nbsp;<span style="color:#555;font-size:11px;">Size: ${item.size}</span>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#ccc;text-align:right;white-space:nowrap;">
        ${formatCurrency(item.price * item.qty)}
      </td>
    </tr>`).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function pricingRows(pricing) {
  const subtotal = pricing?.subtotal ?? pricing?.total;
  const shipping = pricing?.shipping ?? 0;
  const total = pricing?.total ?? subtotal;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      ${subtotal != null ? `<tr>
        <td style="padding:4px 0;font-size:12px;color:#666;">Subtotal</td>
        <td style="padding:4px 0;font-size:12px;color:#666;text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:4px 0;font-size:12px;color:#666;">Shipping</td>
        <td style="padding:4px 0;font-size:12px;color:#666;text-align:right;">${shipping === 0 ? "Free" : formatCurrency(shipping)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 4px;font-size:15px;font-weight:700;color:#fff;border-top:1px solid #222;">Total Paid</td>
        <td style="padding:12px 0 4px;font-size:15px;font-weight:700;color:#c45486;text-align:right;border-top:1px solid #222;">${formatCurrency(total)}</td>
      </tr>
    </table>`;
}

const RETURN_EMAIL = "contact@deadkind.in";

function returnInstructions(orderId) {
  const subject = `Return request - ${orderId}`;
  return `
    <div style="margin-top:28px;padding:18px;background:#0a0a0a;border:1px solid #1a1a1a;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#c45486;text-transform:uppercase;">Returns</p>
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#fff;letter-spacing:1px;text-transform:uppercase;">
        To return, mail us first at
        <a href="mailto:${RETURN_EMAIL}?subject=${encodeURIComponent(subject)}" style="color:#c45486;text-decoration:none;">${RETURN_EMAIL}</a>
      </p>
      <p style="margin:0 0 16px;font-size:13px;color:#999;line-height:1.7;">
        Use the subject "${subject}". All communication regarding your return will happen in that same mail chain, so please mention the reason for the return and any other details in your first mail.
      </p>
      <p style="margin:0;font-size:12px;color:#ccc;line-height:1.9;letter-spacing:1px;text-transform:uppercase;">
        <span style="color:#c45486;">//</span> Returns accepted within 6 days of delivery<br/>
        <span style="color:#c45486;">//</span> Items must be unworn &amp; in original packaging
      </p>
    </div>`;
}

const STATUS_META = {
  confirmed: {
    label: "ORDER CONFIRMED",
    accent: "#c45486",
    icon: "✓",
    message: "Your order has been confirmed and is being prepared for dispatch.",
  },
  shipped: {
    label: "ORDER SHIPPED",
    accent: "#4e8ac4",
    icon: "→",
    message: "Your order is on its way! Keep an eye out for the delivery.",
  },
  delivered: {
    label: "ORDER DELIVERED",
    accent: "#4ec47a",
    icon: "✓✓",
    message: "Your order has been delivered. We hope you love it!",
  },
};

export function orderConfirmationEmail(order) {
  const name = order.customer?.fullName || order.customer?.firstName || "Customer";
  const orderId = order.orderId || "—";
  const items = order.items || [];
  const shipping = order.shipping || {};

  const content = `
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;color:#c45486;text-transform:uppercase;">Order Confirmed</p>
    <h1 style="margin:0 0 24px;font-size:22px;color:#fff;font-weight:700;">Thank you, ${name}!</h1>

    <p style="margin:0 0 24px;font-size:13px;color:#999;line-height:1.7;">
      We've received your order and it's being prepared. You'll get another email when it ships.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px;background:#0a0a0a;border-left:3px solid #c45486;">
          <p style="margin:0;font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;">Order ID</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#fff;letter-spacing:2px;">${orderId}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:#c45486;text-transform:uppercase;">Items Ordered</p>
    ${itemsTable(items)}
    ${pricingRows(order.pricing)}

    <div style="margin-top:28px;padding:18px;background:#0a0a0a;border:1px solid #1a1a1a;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#c45486;text-transform:uppercase;">Delivery Address</p>
      <p style="margin:0;font-size:13px;color:#ccc;line-height:1.8;">
        ${shipping.name || name}<br/>
        ${[shipping.address, shipping.city, shipping.state, shipping.pincode].filter(Boolean).join(", ")}<br/>
        ${shipping.phone ? `Phone: ${shipping.phone}` : ""}
      </p>
    </div>
  `;

  return {
    subject: `Order Confirmed — ${orderId} | Dead'Kind`,
    html: baseLayout(content),
  };
}

export function orderStatusEmail(order, newStatus) {
  const meta = STATUS_META[newStatus];
  if (!meta) return null;

  const name = order.customer?.fullName || order.customer?.firstName || "Customer";
  const orderId = order.orderId || "—";
  const items = order.items || [];

  const content = `
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;color:${meta.accent};text-transform:uppercase;">${meta.label}</p>
    <h1 style="margin:0 0 20px;font-size:22px;color:#fff;font-weight:700;">Hey ${name},</h1>

    <p style="margin:0 0 24px;font-size:13px;color:#999;line-height:1.7;">${meta.message}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:14px 18px;background:#0a0a0a;border-left:3px solid ${meta.accent};">
          <p style="margin:0;font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;">Order ID</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#fff;letter-spacing:2px;">${orderId}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:11px;letter-spacing:2px;color:${meta.accent};text-transform:uppercase;">Items</p>
    ${itemsTable(items)}
    ${newStatus === "confirmed" ? returnInstructions(orderId) : ""}
  `;

  return {
    subject: `${meta.label.charAt(0) + meta.label.slice(1).toLowerCase().replace("order ", "Order ")} — ${orderId} | Dead'Kind`,
    html: baseLayout(content),
  };
}
