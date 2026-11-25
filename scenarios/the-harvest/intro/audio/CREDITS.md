# Intro audio credits

Voices and sound effects generated with [ElevenLabs](https://elevenlabs.io) (free plan: attribution required,
non-commercial use only; a paid ElevenLabs plan is needed before any commercial release).

| File(s) | Source |
|---|---|
| `narr_01..07.mp3` | ElevenLabs text-to-speech, voice "Silas – Weathered Villain" ([elevenlabs.io](https://elevenlabs.io)) |
| `radio_01..04.mp3` | ElevenLabs text-to-speech, voice "Emily E. – Operator / Public Announcement" ([elevenlabs.io](https://elevenlabs.io)) |
| `sfx_breath_loop.mp3`, `sfx_tool.mp3`, `sfx_swell.mp3`, `sfx_taken.mp3` | ElevenLabs sound effects ([elevenlabs.io](https://elevenlabs.io)) |
| `v2/c1`–`c4.mp3` (Relay Control, Emily voice), `v2/n1.mp3`, `p1`, `p3`–`p6.mp3` (the pilot, Silas voice) | ElevenLabs text to speech ([elevenlabs.io](https://elevenlabs.io)), lines for the new intro (not wired in yet) |
| `v2/breath_loop.mp3` (looped), `v2/panel.mp3`, `v2/stars_out.mp3`, `v2/harvest.mp3`, `v2/scan.mp3`, `v2/pod.mp3`, `v2/heartbeat.mp3`, `v2/glass.mp3` | ElevenLabs sound effects ([elevenlabs.io](https://elevenlabs.io)), for the new intro (not wired in yet) |
| `bed_stargazer.mp3` | "Stargazer" remix of Tim Kahn's freesound #702910 by Timbre (https://freesound.org/s/703557/), CC BY-NC 4.0; looped and level-matched |
| `music_dread.mp3`, `sting_dread.mp3`, `music_intro.mp3` (currently unused), `sfx_heartbeat_fast.mp3`, `sfx_scan.mp3`, `sfx_underwater.mp3`, `sfx_glass_crack.mp3` | Procedural stand-ins synthesised for this project (`scripts/make_intro_placeholders.py`), Creative Commons 0 |

`source/` holds the untouched originals; the files here are loudness-mastered from them by `scripts/master_intro_audio.py`.
