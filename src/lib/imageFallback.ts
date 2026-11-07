// Images that fail during the initial HTML parse never fire React's onError handler,
// because the error happens before the app attaches its listeners. This replays the
// error event after hydration so the existing fallbacks (branded placeholders, portrait
// monogram, certificate text) still work when an asset file is missing.
export function replayBrokenImageErrors(root: ParentNode = document) {
  const images = Array.from(root.querySelectorAll("img"));
  for (const image of images) {
    if (!image.complete || image.naturalWidth !== 0) continue;
    if (image.dataset.brokenReplayed === "true") continue;
    image.dataset.brokenReplayed = "true";
    image.dispatchEvent(new Event("error"));
  }
}
