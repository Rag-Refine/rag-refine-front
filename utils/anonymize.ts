import "server-only";

export type RedactionSummary = {
  applied: Record<string, number>;
  missed: Record<string, number>;
  total: number;
};

export type AnonymizeResult = {
  bytes: ArrayBuffer;
  summary: RedactionSummary;
};

const ENGINE_URL = process.env.PDF_ENGINE_URL ?? "http://localhost:8888";
const ANONYMIZE_TIMEOUT_MS = 30_000;

/**
 * Send a PDF to the engine's /anonymize endpoint and return the sanitized
 * bytes alongside a per-type redaction summary. The caller is responsible
 * for dropping any reference to the original buffer once this resolves.
 */
export async function anonymizePdf(
  originalBytes: ArrayBuffer,
  fileName: string,
  fileType: string,
): Promise<AnonymizeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    ANONYMIZE_TIMEOUT_MS,
  );

  try {
    const form = new FormData();
    form.append("file", new Blob([originalBytes], { type: fileType }), fileName);

    const res = await fetch(`${ENGINE_URL}/anonymize`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(
        `Anonymizer returned ${res.status} ${res.statusText}`,
      );
    }

    const bytes = await res.arrayBuffer();
    const headerValue = res.headers.get("X-Redaction-Summary");
    const summary: RedactionSummary = headerValue
      ? safeParseSummary(headerValue)
      : { applied: {}, missed: {}, total: 0 };

    return { bytes, summary };
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeParseSummary(raw: string): RedactionSummary {
  try {
    const parsed = JSON.parse(raw) as Partial<RedactionSummary>;
    return {
      applied: parsed.applied ?? {},
      missed: parsed.missed ?? {},
      total: typeof parsed.total === "number" ? parsed.total : 0,
    };
  } catch {
    return { applied: {}, missed: {}, total: 0 };
  }
}
