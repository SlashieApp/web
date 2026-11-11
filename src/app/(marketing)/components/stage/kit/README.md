# Stageshow kit (vendored)

Part of the [Stageshow](https://github.com/benjitaylor/skills) kit by Benji
Taylor, version 1.1.1, MIT (see `LICENSE`). It draws the product scenes on the
marketing pages: the stage, the script and cursor, window and phone frames, and
the motion parts that carry a change from one place to another.

Only the files the scenes use are here (the kit's brand marks, app icons and
other parts are left out). Each part imports its own CSS; all kit CSS sits in
`@layer stageshow`, so a scene's own plain CSS always wins.

- Do not edit these files: restyle a part from the scene's CSS, with the look
  tokens (`--ss-accent`, `--ss-font`, ...) or a plain class.
- **Import the kit from `../index.ts`, never from here.** That module states
  the cascade layers' order first (`../layers.css`: Chakra's four layers, then
  `stageshow`), so the kit's styles sit above Chakra's reset layer. Imported
  directly, the kit's layer is named first and the reset zeroes its padding
  and borders (`../stageLayers.test.ts` guards this).
- To use another part, copy its file and the files it imports from the same
  kit version, and export it from `../index.ts`.
- `stage.css` ends with a few rules outside the layer, on purpose: the kit's
  guards against a host page's element rules, scoped to a stage.
- Biome skips this folder (`biome.json`); TypeScript still checks it.

The scenes themselves, with Slashie's look, are in
`../../ui/landing/stage/`.
