const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (
  status: number,
  body: Record<string, unknown>,
) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const normalizeEmailList = (value: string) => {
  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

/**
 * Read SMTP response.
 */
const readSmtpReply = async (
  conn: Deno.TlsConn,
): Promise<string> => {
  const decoder = new TextDecoder();

  let buffer = "";
  let fullReply = "";

  while (true) {
    const chunk = new Uint8Array(4096);

    const result = await conn.read(chunk);

    if (result === null) {
      break;
    }

    buffer += decoder.decode(
      chunk.subarray(0, result),
      { stream: true },
    );

    const lines = buffer.split("\r\n");

    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line) {
        continue;
      }

      fullReply = fullReply
        ? `${fullReply}\r\n${line}`
        : line;

      // SMTP final response line:
      // 220 ...
      // 250 ...
      // 334 ...
      // 354 ...
      // 535 ...
      if (/^\d{3} /.test(line)) {
        return fullReply;
      }
    }
  }

  return fullReply;
};

/**
 * Send SMTP command.
 */
const sendSmtpCommand = async (
  conn: Deno.TlsConn,
  command: string,
): Promise<string> => {
  const encoder = new TextEncoder();

  await conn.write(
    encoder.encode(`${command}\r\n`),
  );

  return await readSmtpReply(conn);
};

/**
 * Send email using SMTP over implicit TLS.
 *
 * Gmail:
 * Host: smtp.gmail.com
 * Port: 465
 */
const sendSmtpEmail = async ({
  host,
  port,
  username,
  password,
  from,
  to,
  replyTo,
  subject,
  textBody,
  htmlBody,
}: {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  to: string[];
  replyTo: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}) => {
  if (port !== 465) {
    throw new Error(
      `SMTP port ${port} is not supported by this implementation. Use port 465.`,
    );
  }

  console.log(
    `Connecting to SMTP server: ${host}:${port}`,
  );

  let conn: Deno.TlsConn | null = null;

  try {
    conn = await Deno.connectTls({
      hostname: host,
      port,
    });

    console.log("SMTP TLS connection established.");

    // --------------------------------------------------
    // SMTP GREETING
    // --------------------------------------------------

    const greeting = await readSmtpReply(conn);

    console.log(
      "SMTP greeting:",
      greeting,
    );

    if (!greeting.startsWith("220")) {
      throw new Error(
        `SMTP greeting failed: ${greeting}`,
      );
    }

    // --------------------------------------------------
    // EHLO
    // --------------------------------------------------

    const ehloReply = await sendSmtpCommand(
      conn,
      "EHLO localhost",
    );

    console.log(
      "SMTP EHLO response:",
      ehloReply,
    );

    if (!ehloReply.startsWith("250")) {
      throw new Error(
        `EHLO failed: ${ehloReply}`,
      );
    }

    // --------------------------------------------------
    // AUTH LOGIN
    // --------------------------------------------------

    const authReply = await sendSmtpCommand(
      conn,
      "AUTH LOGIN",
    );

    console.log(
      "SMTP AUTH response:",
      authReply,
    );

    if (!authReply.startsWith("334")) {
      throw new Error(
        `SMTP AUTH LOGIN failed: ${authReply}`,
      );
    }

    // --------------------------------------------------
    // USERNAME
    // --------------------------------------------------

    const usernameReply = await sendSmtpCommand(
      conn,
      btoa(username),
    );

    console.log(
      "SMTP username response:",
      usernameReply,
    );

    if (!usernameReply.startsWith("334")) {
      throw new Error(
        `SMTP username rejected: ${usernameReply}`,
      );
    }

    // --------------------------------------------------
    // PASSWORD
    // --------------------------------------------------

    const passwordReply = await sendSmtpCommand(
      conn,
      btoa(password),
    );

    console.log(
      "SMTP password response:",
      passwordReply,
    );

    if (!passwordReply.startsWith("235")) {
      throw new Error(
        `SMTP authentication failed: ${passwordReply}`,
      );
    }

    console.log(
      "SMTP authentication successful.",
    );

    // --------------------------------------------------
    // MAIL FROM
    // --------------------------------------------------

    const mailFromReply = await sendSmtpCommand(
      conn,
      `MAIL FROM:<${from}>`,
    );

    console.log(
      "SMTP MAIL FROM response:",
      mailFromReply,
    );

    if (!mailFromReply.startsWith("250")) {
      throw new Error(
        `MAIL FROM failed: ${mailFromReply}`,
      );
    }

    // --------------------------------------------------
    // RECIPIENTS
    // --------------------------------------------------

    for (const recipient of to) {
      const recipientReply =
        await sendSmtpCommand(
          conn,
          `RCPT TO:<${recipient}>`,
        );

      console.log(
        `SMTP RCPT TO response for ${recipient}:`,
        recipientReply,
      );

      if (
        !recipientReply.startsWith("250") &&
        !recipientReply.startsWith("251")
      ) {
        throw new Error(
          `RCPT TO failed for ${recipient}: ${recipientReply}`,
        );
      }
    }

    // --------------------------------------------------
    // DATA
    // --------------------------------------------------

    const dataReply = await sendSmtpCommand(
      conn,
      "DATA",
    );

    console.log(
      "SMTP DATA response:",
      dataReply,
    );

    if (!dataReply.startsWith("354")) {
      throw new Error(
        `DATA command failed: ${dataReply}`,
      );
    }

    const boundary =
      `----=_PortfolioBoundary_${crypto.randomUUID()}`;

    const emailMessage = [
      `From: ${from}`,
      `To: ${to.join(", ")}`,
      `Reply-To: ${replyTo}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      textBody,
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      htmlBody,
      "",
      `--${boundary}--`,
      "",
      ".",
    ].join("\r\n");

    await conn.write(
      new TextEncoder().encode(
        `${emailMessage}\r\n`,
      ),
    );

    // --------------------------------------------------
    // MESSAGE RESPONSE
    // --------------------------------------------------

    const sendReply = await readSmtpReply(conn);

    console.log(
      "SMTP SEND response:",
      sendReply,
    );

    if (!sendReply.startsWith("250")) {
      throw new Error(
        `SMTP message rejected: ${sendReply}`,
      );
    }

    console.log(
      "SMTP email accepted successfully.",
    );

    // --------------------------------------------------
    // QUIT
    // --------------------------------------------------

    try {
      const quitReply =
        await sendSmtpCommand(
          conn,
          "QUIT",
        );

      console.log(
        "SMTP QUIT response:",
        quitReply,
      );
    } catch (quitError) {
      console.warn(
        "SMTP QUIT failed:",
        quitError instanceof Error
          ? quitError.message
          : String(quitError),
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "SMTP SEND ERROR:",
      errorMessage,
    );

    throw error;
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch {
        // Connection already closed.
      }
    }
  }
};

Deno.serve(async (request: Request) => {
  // ==================================================
  // CORS
  // ==================================================

  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // ==================================================
  // METHOD
  // ==================================================

  if (request.method !== "POST") {
    return jsonResponse(405, {
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    // ==================================================
    // REQUEST BODY
    // ==================================================

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, {
        success: false,
        message: "Invalid JSON request body.",
      });
    }

    // ==================================================
    // FORM DATA
    // ==================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim().slice(0, 200)
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().slice(0, 320)
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim().slice(0, 200)
        : "Portfolio inquiry";

    const message =
      typeof body.message === "string"
        ? body.message.trim().slice(0, 10000)
        : "";

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !name ||
      !isValidEmail(email) ||
      !message
    ) {
      return jsonResponse(400, {
        success: false,
        message:
          "A valid name, email, and message are required.",
      });
    }

    // ==================================================
    // SUPABASE SECRETS
    // ==================================================

    const smtpHost =
      Deno.env.get("SMTP_HOST")?.trim();

    const smtpPortRaw =
      Deno.env.get("SMTP_PORT")?.trim() || "465";

    const smtpUsername =
      Deno.env.get("SMTP_USERNAME")?.trim();

    const smtpPassword =
      Deno.env.get("SMTP_PASSWORD")?.trim();

    const smtpFrom =
      Deno.env.get("SMTP_FROM")?.trim();

    const contactEmailTo =
      Deno.env.get("CONTACT_EMAIL_TO")?.trim();

    const smtpPort = Number(
      smtpPortRaw,
    );

    // ==================================================
    // DEBUG CONFIGURATION
    //
    // IMPORTANT:
    // Never log the actual password.
    // ==================================================

    console.log(
      "SMTP configuration:",
      {
        host: smtpHost,
        port: smtpPort,
        username: smtpUsername,
        from: smtpFrom,
        contactEmailTo,
        hasPassword: Boolean(smtpPassword),
      },
    );

    // ==================================================
    // CONFIG VALIDATION
    // ==================================================

    if (
      !smtpHost ||
      !smtpUsername ||
      !smtpPassword ||
      !smtpFrom ||
      !contactEmailTo ||
      !Number.isInteger(smtpPort)
    ) {
      console.error(
        "SMTP configuration is incomplete.",
      );

      return jsonResponse(500, {
        success: false,
        message:
          "SMTP email notification is not configured.",
      });
    }

    if (smtpPort !== 465) {
      return jsonResponse(500, {
        success: false,
        message:
          "SMTP configuration requires port 465.",
      });
    }

    // ==================================================
    // RECIPIENTS
    // ==================================================

    const recipients =
      normalizeEmailList(
        contactEmailTo,
      );

    if (recipients.length === 0) {
      return jsonResponse(500, {
        success: false,
        message:
          "CONTACT_EMAIL_TO is not configured.",
      });
    }

    for (const recipient of recipients) {
      if (!isValidEmail(recipient)) {
        return jsonResponse(500, {
          success: false,
          message:
            `Invalid recipient email: ${recipient}`,
        });
      }
    }

    // ==================================================
    // EMAIL CONTENT
    // ==================================================

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(email);

    const safeSubject =
      escapeHtml(subject);

    const safeMessage =
      escapeHtml(message)
        .replaceAll(
          "\n",
          "<br>",
        );

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>New Portfolio Message</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6;">

  <h2>New Portfolio Message</h2>

  <p>
    <strong>Name:</strong>
    ${safeName}
  </p>

  <p>
    <strong>Email:</strong>
    ${safeEmail}
  </p>

  <p>
    <strong>Subject:</strong>
    ${safeSubject}
  </p>

  <hr />

  <p>
    <strong>Message:</strong>
  </p>

  <p>
    ${safeMessage}
  </p>

</body>
</html>
`;

    const textBody = [
      "New Portfolio Message",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    // ==================================================
    // SEND EMAIL
    // ==================================================

    await sendSmtpEmail({
      host: smtpHost,
      port: smtpPort,
      username: smtpUsername,
      password: smtpPassword,
      from: smtpFrom,
      to: recipients,
      replyTo: email,
      subject:
        `New portfolio message: ${subject}`,
      textBody,
      htmlBody,
    });

    console.log(
      "SMTP email notification sent successfully.",
    );

    return jsonResponse(200, {
      success: true,
      message:
        "Email notification sent successfully.",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    // IMPORTANT:
    // Password is never logged.
    console.error(
      "SMTP email notification failed:",
      errorMessage,
    );

    // Temporary detailed error for debugging.
    // Remove detailed error from production later.
    return jsonResponse(502, {
      success: false,
      message:
        `Email notification failed: ${errorMessage}`,
    });
  }
});