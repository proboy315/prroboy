# Exact Portrait Setup

## Asset Status

The requested maroon portrait and reference layout are visible in the conversation. The sandbox only contained the earlier generated `hero.jpg`, not the actual supplied portrait. Public owner repositories were also checked; the available photos differed from the supplied image. None is used as a replacement.

The old generated image is preserved under `archive/previous-generated-hero.jpg`, outside the public website.

## Browser Preview

Use **Select portrait** in the hero or drop the image onto that area. The image must be JPG, PNG, WebP or AVIF and smaller than 15 MB. The picker validates that it can be decoded, preserves its natural ratio, and stores it locally in IndexedDB. Refresh restores it when no published photo is configured.

No third-party service receives the file. A local preview does not change the deployed project or its search metadata. The small **Publish this image** link explains this in the interface.

## Publish

Save the original supplied photo as a local file, then:

```sh
node scripts/set-portrait.mjs path/to/your-original-photo.jpg
node scripts/gen-seo.mjs
npm run build
```

The importer checks the file signature, copies the original bytes without retouching or generation, and updates these fields in `src/data/info.json`:

- `profileImage`: the deployed image URL.
- `seo.ogImage`: the same image for sharing.
- `portrait.width` and `portrait.height`: intrinsic sizing hints. PNG values are read from its header; JPEG/WebP display always uses the image's natural ratio.
- `portrait.alt`: edit this to describe the actual supplied photograph.

Only one source is rendered. There is no independent `srcset` that can keep displaying an older image.

## Styling

`src/styles/hero.css` controls the image plane. `.hero-portrait` has no border, radius, background or card shadow. The image is contained proportionally, and a narrow CSS mask fades only its outer edges. `.portrait-shadow` adds a subtle crimson drop shadow. The original center and face are not changed.

The original photo itself includes glass shapes and red accents. Those pixels remain part of the supplied image; this implementation does not generate a new face or erase the source artwork.

## Verification

The interface can be tested with a labeled synthetic image fixture for sizing, selection and refresh persistence. A passing fixture test does not mean the unavailable original portrait has been visually verified. Check the actual photo after importing it, at desktop and mobile sizes, before publishing.

## OG image behaviour
`og:image` uses the same priority as the hero: explicit `seo.ogImage` → published `profileImage` → `public/og-image.jpg` brand card. Once you publish the portrait via `node scripts/set-portrait.mjs`, share cards automatically show your photo with `portrait.alt` as the image alt text. The portrait picker, change and publish controls are hidden whenever a published portrait exists.
