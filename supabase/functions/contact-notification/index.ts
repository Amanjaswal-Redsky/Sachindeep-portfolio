const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { success: false, message: "Method not allowed." });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "Portfolio inquiry";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 10000) : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !emailPattern.test(email) || !message) {
      return jsonResponse(400, { success: false, message: "A valid name, email, and message are required." });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const recipient = Deno.env.get("CONTACT_EMAIL_TO");
    const sender = Deno.env.get("CONTACT_EMAIL_FROM");

    if (!apiKey || !recipient || !sender) {
      return jsonResponse(500, { success: false, message: "Contact email notification is not configured." });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: email,
        subject: `New portfolio message: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        html: `<h3>New portfolio message</h3><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
      }),
    });

    if (!emailResponse.ok) {
      return jsonResponse(502, { success: false, message: "Email provider could not deliver the notification." });
    }

    return jsonResponse(200, { success: true });
  } catch {
    return jsonResponse(500, { success: false, message: "Contact email notification failed." });
  }
});
