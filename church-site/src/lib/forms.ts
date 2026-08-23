import { CHURCH } from "./site";

/**
 * Form delivery.
 *
 * There is no backend in this project, so submissions take the route the
 * church already uses every day: a prefilled WhatsApp message to the church
 * line. Nothing is silently swallowed and no fake success is shown.
 *
 * To collect submissions on a server instead, set VITE_FORMS_ENDPOINT in
 * `.env` to a URL that accepts `POST` JSON — Formspree, Netlify Forms, a
 * Worker, anything. When it is set it takes over and WhatsApp is not opened.
 */
const ENDPOINT = import.meta.env.VITE_FORMS_ENDPOINT as string | undefined;

export type FormKind = "prayer" | "visit" | "connect" | "newsletter";

const LABEL: Record<FormKind, string> = {
  prayer: "Prayer request",
  visit: "First visit",
  connect: "Connect with the church",
  newsletter: "Newsletter sign-up",
};

function asMessage(kind: FormKind, data: Record<string, string>): string {
  const lines = Object.entries(data)
    .filter(([, v]) => v.trim() !== "")
    .map(([k, v]) => `${k[0].toUpperCase()}${k.slice(1)}: ${v}`);
  return [`${LABEL[kind]} — ${CHURCH.shortName}`, "", ...lines].join("\n");
}

export async function submitForm(kind: FormKind, data: Record<string, string>): Promise<void> {
  if (ENDPOINT) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...data }),
    });
    if (!res.ok) throw new Error(`Submission failed (${res.status})`);
    return;
  }

  const url = `https://wa.me/2348023398788?text=${encodeURIComponent(asMessage(kind, data))}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) throw new Error("popup-blocked");
}
