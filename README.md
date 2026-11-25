<div align="center">
    <img src="https://avatars.githubusercontent.com/u/359042996" height="200px">
    <h1>NemesisModsCore</h1>
    <p>Core shared components for nemesismods.com.</p>
</div>



| Item | Function |
|---|---|
| `workspace/` | `@nemesismods/workspace` manages the character list, arena list, linked GameCube disc, and recomp port folder that ImperfectLab, Lab Builder and Arena Lab share in the browser (IndexedDB, plus a `BroadcastChannel` to tell other tabs) |
| `site/` | Cloudflare Worker at `/`, and the router that sends `/lab/`, `/builder/` and `/arena/` to each tool's Cloudflare Pages project |

The tools themselves are stored in separate repos in the [NemesisMods org](https://github.com/NemesisMods).

## Dev Commands

```sh
npm install
npm run lint && npm test && npm run build
```

### Run All

```sh
cd site && npm run dev:suite
```

This assumes you have the other tools beside this repo (`../ImperfectLab` relative to `NemesisModTools`, and `../LabBuilder`, `../ArenaLab`), or set `LAB_DIR`, `BUILDER_DIR` or `ARENA_DIR` to override. Runs at http://localhost:5180.


## Workspace

Any changes to what is stored **must** bump `SCHEMA_VERSION`. A tool built against an older version then asks for a reload instead of misreading the data.

Publish:

```sh
cd workspace && npm publish --access public
```

## Deploy

Deploy as one Cloudflare Pages/Workers project per tool.<br />
In this project's worker, set `LAB_ORIGIN`, `BUILDER_ORIGIN` and `ARENA_ORIGIN` in `site/wrangler.toml` to the tools' deployed addresses, then `cd site && npm run deploy`.