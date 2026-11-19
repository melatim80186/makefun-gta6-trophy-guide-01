# Leonida Legends — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/melatim80186/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/melatim80186/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, single-page tracker and guide for every trophy in Grand Theft Auto VI.
All 55 trophies — official names, descriptions, and grades — with an own-words
guide for each one, a checklist that saves in your browser, a 5-stage roadmap
to the platinum, a flag on the one missable trophy, a spoiler setting that hides
story details until you have earned them, filters by kind and grade, and
export/import so your progress survives a new machine. No account, no network,
no tracking: open it and play.

## What's inside

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — with official
  names, descriptions, and grades, plus a guide in our own words for each one
  and the sources it cites. 28 of them are hidden on PSN, so the spoiler
  setting matters.
- **The one missable trophy** (Positive Mental Attitude — Lucia's balcony
  meditation in Chapter 1) is flagged on its card and called out on the
  roadmap, so you do it before Chapter 1 closes.
- **Honest where launch day is uncertain:** a few unlock methods are still
  unconfirmed, and the guide says so instead of inventing one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. (Use `node serve.ts --port 8123` if port 8080
is taken.) Everything runs from local files — `app/index.html`, `app/style.css`,
`app/app.js`, and `app/data/trophies.json`.

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).
