# Recovery notes — 2026 sphere edition

## Recovered sources

| New runtime file | Recovered source | Conversion |
| --- | --- | --- |
| `assets/panorama.jpg` | `McNicoll_Mattercraft/Panorama2f_auto_x2.jpg` | 7680 × 3840 to 4096 × 2048 JPEG, original image content retained |
| `assets/audio/music-a.mp3` | `OneDrive_1_22-11-2026/1_Musique_A_fond.wav` | MP3 VBR quality 4 |
| `assets/audio/music-b.mp3` | `OneDrive_1_22-11-2026/2_MusiqueB.wav` | MP3 VBR quality 4 |
| `assets/audio/water.mp3` | `OneDrive_1_22-11-2026/3_Eau.wav` | MP3 VBR quality 4 |
| `assets/audio/birds.mp3` | `OneDrive_1_22-11-2026/4_Oiseaux.wav` | MP3 VBR quality 4 |
| `assets/audio/wind.mp3` | `OneDrive_1_22-11-2026/5_Vent.wav` | MP3 VBR quality 4 |

The supplied WAV exports are stereo, 44.1 kHz, approximately 202 seconds each. The original files remain in the author’s source folder. Only web derivatives are included here. No private environment file, local Git configuration or unrelated material from the backup is published.

This is a reconstruction using recovered materials from related versions. The current spherical panorama is not asserted to be identical to the missing 10240 × 2702 image referenced by the 2024 horizontal viewer. The new audio exports are not asserted to be byte-identical to the old Glitch MP3s.

## History preservation

The reconstruction descends from the existing main commit, `895b05862c8c344ef7911c4c33034ee53da7612b`. No prior commit date is changed. The original application files and README are copied into `docs/legacy-2024/` for inspection; those files retain their obsolete Glitch URLs and are not used by the current app.

The recovered 2023 archive includes an A-Frame sphere prototype and a hummingbird model reference. The Mattercraft folder includes `index.ts`, `Scene.zcomp`, related assets and a dependency manifest. These informed the recovery assessment; the reconstruction runs independently of those platforms and dependencies.

## Verification

- JavaScript syntax checked with Node.
- Circular audio mix checked across 720 headings: finite gains, unit total power, correct dominant zone at every anchor and continuous wrap at 0° / 360°.
- The self-contained local preview was opened in desktop Chrome: the recovered painting rendered in the sphere, the start screen loaded and the browser reported audio playback after entering the experience.
- The local HTML preview bundles the same source code and converted media. The hosted version uses relative file paths.

No claim is made that audio was audited by listening on every platform. Touch controls, small-screen CSS, fullscreen fallback and explicit playback error messages are implemented, but physical phone and Safari testing remain outstanding. The image already includes painted stretching near its top and bottom; the projection does not reconstruct missing geometry or remove those source-image artifacts.
