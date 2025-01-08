export const isInIframe = window.self !== window.top;

export function hideHeaderInIframe() {
  if (isInIframe) {
    document.getElementById("header")?.remove();
  }
}
