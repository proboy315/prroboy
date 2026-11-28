# Exact Portrait Setup

## Asset Status

The default published portrait is `public/images/shahan-ali-portrait.jpg`. The homepage has 480w, 800w and 1200w AVIF/WebP candidates, a JPEG fallback, and a single matching responsive preload in the production build.

## Browser Preview

Use **Select portrait** in the hero or drop the image onto that area. The image must be JPG, PNG, WebP or AVIF and smaller than 15 MB. The picker validates that it can be decoded, preserves its natural ratio, and stores it locally in IndexedDB. Refresh restores it when no published photo is configured.

No third-party service receives the file. A local preview does not change the deployed project or its search metadata. The small **Publish this image** link explains this in the interface.

## Publish

Save the original supplied photo as a local file, then:

```sh
node scripts/set-portrait.mjs path/to/your-original-photo.jpg
npm run build
```

The importer requires ImageMagick `identify`. It checks the file signature, copies the original bytes to a content-specific filename and updates these fields in `src/data/info.json`:

- `profileImage`: the deployed image URL.
- `portrait.width` and `portrait.height`: the source image dimensions.
- `portrait.alt`: edit this to describe the actual supplied photograph.

Only the built-in portrait URL uses the existing responsive variants. A replacement with a distinct URL will not load the old portrait. Keep the social card separate.

## Styling

`src/styles/hero.css` controls the image plane. `.hero-portrait` has no border, radius, background or card shadow. The image is contained proportionally, and a narrow CSS mask fades only its outer edges. `.portrait-shadow` adds a subtle crimson drop shadow. The original center and face are not changed.

The original photo itself includes glass shapes and red accents. Those pixels remain part of the supplied image; this implementation does not generate a new face or erase the source artwork.

## Verification

The interface can be tested with a labeled synthetic image fixture for sizing, selection and refresh persistence. A passing fixture test does not mean the unavailable original portrait has been visually verified. Check the actual photo after importing it, at desktop and mobile sizes, before publishing.

## OG image behaviour
The production Open Graph and Twitter card is `https://proboy.vercel.app/images/og-shahan-ali.jpg`. Replacing the hero portrait does not update the card. Verify the remote card independently before approving a release. Local asset verification is recorded in `docs/LAUNCH-VERIFICATION.md`.
