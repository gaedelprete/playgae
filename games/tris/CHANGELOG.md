# Changelog

## 0.2.0
- 5 difficulty levels: a win raises the level, a loss lowers it, a draw keeps it. Level 5 never blunders.
- Progress (level, best level, win streak) saved through `storage`.
- First-run tutorial (reopen with the "?" button).
- Music and sound effects (ogg), mute button saved in settings; sound pauses during interstitials.
- Core: `platform.isAudioEnabled` is read at startup and combined with the game's own mute.
- Known issue: audio files are ffmpeg-generated placeholders and must be replaced with produced audio before release.

## 0.1.0
- Initial scaffold from the template.
- Tic-tac-toe vs minimax AI (25% mistake chance), saved stats, IT/EN.
