export type LocalPortrait = { file: Blob; width: number; height: number };

const DATABASE = "proboy-portrait-preview";
const STORE = "portrait";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readLocalPortrait(): Promise<LocalPortrait | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readonly");
    const request = transaction.objectStore(STORE).get("current");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function saveLocalPortrait(portrait: LocalPortrait): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(portrait, "current");
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

export async function validatePortrait(file: File): Promise<LocalPortrait> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP or AVIF image.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 15 MB.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Empty image.");
    return { file, width: image.naturalWidth, height: image.naturalHeight };
  } catch {
    throw new Error("This image could not be opened. Try a JPG or PNG export.");
  } finally {
    URL.revokeObjectURL(url);
  }
}