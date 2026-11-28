<div align="center">
    <img src="https://avatars.githubusercontent.com/u/359042996" height="200px">
    <h1>NemesisModsCore</h1>
    <p>Core shared components for nemesismods.com.</p>
</div>



| Item | Function |
|---|---|
| `workspace/` | `@nemesismods/workspace` manages the character list, arena list, linked GameCube disc, and recomp port folder that ImperfectLab, Lab Builder and Arena Lab share in the browser (IndexedDB, plus a `BroadcastChannel` to tell other tabs) |
| `site/` | Cloudflare Worker at `/`, and the router that sends `/lab/`, `/builder/` and `/arena/` to each tool's Worker |

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

The shell, Lab Builder and Arena Lab follow the theme picked in ImperfectLab (View > Theme): each has a `public/theme-init.js` that reads ImperfectLab's saved choice.


## Workspace

Any changes to what is stored **must** bump `SCHEMA_VERSION`. A tool built against an older version then asks for a reload instead of misreading the data.

Publish:

```sh
cd workspace && npm publish --access public
```

## Deploy

Deploy one Cloudflare Worker per tool, in the same Cloudflare account as this project's Worker.<br />
This project's Worker reaches them through service bindings, so they need no public address. Set each `service` in `site/wrangler.toml` to the tool's Worker name, deploy the tools first, then `cd site && npm run deploy`.