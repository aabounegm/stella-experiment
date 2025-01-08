export const isInIframe = window.self !== window.top;

export function hideHeaderInIframe() {
  if (!isInIframe) return;

  document.getElementById("header")?.remove();

  const wrapper = document.getElementById("wrapper");
  if (wrapper) {
    wrapper.style.height = "100vh"; // account for the removed header
  }
}
