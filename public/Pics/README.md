# Drop Anjali's photos here 📸

Put the photographs in **this folder** (`public/Pics/`) using these exact base
names. The site automatically tries `.webp`, `.jpg`, `.jpeg` and `.png`, so any
of those formats work — you do **not** need to rename extensions.

| File          | Used as                                  |
| ------------- | ---------------------------------------- |
| `Main1.*`     | Hero portrait + finale centrepiece       |
| `slider1.*`   | First memory + filmstrip + orbit         |
| `slider2.*`   | Filmstrip + orbit                        |
| `slider3.*`   | Orbit + traits                           |
| `slider4.*`   | Orbit + memory wall                      |
| `slider5.*`   | Letter clip + finale (optional, 6th pic) |

Example: `public/Pics/Main1.jpg`, `public/Pics/slider1.jpg`, …

**Tips**
- 4 to 6 photos is the sweet spot. With fewer, the orbit reuses what's there.
- Portraits (taller than wide) look best for `Main1`.
- For the fastest load, export as **WebP** (~1200px on the long edge).
- Until you add a file, a designed paper-cut placeholder shows in its place —
  nothing ever appears broken.

You can change which file maps where (and all captions/dates) in
`src/data/birthdayConfig.ts` — no animation code to touch.
