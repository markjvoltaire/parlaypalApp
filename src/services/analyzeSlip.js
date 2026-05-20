import PARLAY_API_URL from "../config/parlayApi";
import { createParlayLogger } from "../utils/parlayLogger";

function createSSEParser(onEvent, log, stats) {
  let buffer = "";
  let eventType = "message";
  const flush = () => {
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const frame of parts) {
      const lines = frame.split("\n");
      eventType = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) eventType = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      onEvent(eventType, data);
    }
  };
  return (chunk) => {
    if (chunk) {
      stats.chunks += 1;
      stats.bytes += chunk.length;
      if (stats.chunks === 1) log("sse_stream_started");
    }
    buffer += chunk;
    flush();
  };
}

function buildFormData(imageUri, userId, log) {
  const formData = new FormData();
  let name = "slip.jpg";
  let type = "image/jpeg";
  const extMatch = imageUri
    .toLowerCase()
    .match(/\.(heic|heif|png|jpg|jpeg|webp)$/);
  if (extMatch) {
    const ext = extMatch[1];
    name = `slip.${ext}`;
    if (ext === "png") type = "image/png";
    else if (ext === "webp") type = "image/webp";
    else type = "image/jpeg";
  }
  formData.append("image", { uri: imageUri, name, type });
  formData.append("userId", userId);
  log("form_ready", { name, type, userId });
  return formData;
}

/**
 * POST slip image to /analyzePartial and stream SSE events.
 * @returns {{ abort: () => void, loggerId: string }}
 */
export function startSlipAnalysis({ imageUri, userId, onEvent }) {
  const { log, id, summarizeBet } = createParlayLogger("upload");
  const url = `${PARLAY_API_URL}/analyzePartial`;
  let closed = false;
  let eventsReceived = 0;

  log("analysis_start", { url, userId });

  const handleRawEvent = (type, dataStr) => {
    const isHeartbeat =
      type === "message" &&
      (!dataStr?.trim() || dataStr.trim().startsWith(": ping"));
    if (isHeartbeat) return;

    eventsReceived += 1;
    try {
      const payload = dataStr ? JSON.parse(dataStr) : {};
      log(`sse_event:${type}`, {
        eventNumber: eventsReceived,
        ...(type === "init"
          ? { total: payload.total, imageUrl: payload.imageUrl }
          : {}),
        ...(type === "bet"
          ? {
              leagueIndex: payload.leagueIndex,
              betIndex: payload.betIndex,
              league: payload.league,
              bet: summarizeBet(payload.bet),
            }
          : {}),
        ...(type === "status" ? { phase: payload.phase } : {}),
        ...(type === "error" ? { message: payload.message } : {}),
        ...(type === "final"
          ? {
              success: payload.success,
              legCount: (payload.slipInfo?.leagues || []).reduce(
                (n, lg) => n + (lg.parlay_bets?.length || 0),
                0,
              ),
            }
          : {}),
      });
      onEvent(type, payload);
    } catch (e) {
      log("sse_parse_error", { type, message: e?.message, rawLength: dataStr?.length });
      console.warn("[Parlay] SSE parse error:", e);
    }
  };

  const streamStats = { chunks: 0, bytes: 0 };
  const onChunk = createSSEParser(handleRawEvent, log, streamStats);
  const xhr = new XMLHttpRequest();
  let lastIndex = 0;

  xhr.onreadystatechange = () => {
    log("xhr_ready_state", { readyState: xhr.readyState, status: xhr.status });
  };

  xhr.onprogress = () => {
    const text = xhr.responseText || "";
    const next = text.slice(lastIndex);
    lastIndex = text.length;
    if (next) onChunk(next);
  };

  xhr.onload = () => {
    log("xhr_load", { status: xhr.status, responseLength: xhr.responseText?.length });
    if (xhr.status >= 400 && !closed) {
      closed = true;
      onEvent("error", {
        message: `Server returned ${xhr.status}`,
      });
    }
  };

  xhr.onerror = () => {
    log("xhr_error", { status: xhr.status });
    if (!closed) {
      closed = true;
      onEvent("connection_error", {});
    }
  };

  xhr.onabort = () => {
    log("xhr_aborted");
  };

  const formData = buildFormData(imageUri, userId, log);
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Accept", "text/event-stream");
  log("xhr_send");
  xhr.send(formData);

  return {
    loggerId: id,
    abort: () => {
      if (!closed) {
        closed = true;
        log("abort_requested");
        try {
          xhr.abort();
        } catch {}
      }
    },
    markClosed: () => {
      closed = true;
      log("stream_closed", { eventsReceived, ...streamStats });
    },
  };
}
