# lrc-jobscript

Jobscript generator for the Lawrencium CPU and Einsteinium GPU clusters at
Berkeley Lab. Pick a partition, resources, account, QoS and time limit, and it
writes the Slurm batch script and the matching `srun` command for an
interactive session, and estimates the Service Units (SUs) the job will use.

Open the [Jobscript Generator](https://lbnl-science-it.github.io/lrc-jobscript/).
It is also part of the ScienceIT documentation at
[scienceit-docs.lbl.gov](https://scienceit-docs.lbl.gov/hpc/jobscript-generator/).

## Layout

The generator is plain JavaScript and CSS with no build step or dependencies.

| File | Used by | Purpose |
| --- | --- | --- |
| `javascripts/jobscript-generator.js` | both | The generator, including the partition, QoS and SU data |
| `stylesheets/jobscript-generator.css` | both | Generator styles, written for Material for MkDocs |
| `stylesheets/standalone.css` | standalone | The Material styles the generator relies on, plus the page header and footer |
| `index.html` | standalone | The standalone page |
| `assets/` | standalone | Logo and favicon |
| `sync-docs.sh` | docs | Copies the two shared files into a scienceit-docs checkout |
| `.nojekyll` | standalone | Tells GitHub Pages to publish the files as they are |

The previous calculator is still published at
[src/lrc-calculator.html](https://lbnl-science-it.github.io/lrc-jobscript/src/lrc-calculator.html).
It is built with Tailwind CSS and DaisyUI (`src/`, `dist/output.css`,
`package.json`, `tailwind.config.js`, `tailwind-start.sh`) and is separate
from the new generator.

The script mounts into `<div id="jsg" class="jsg">`. Inside MkDocs it detects
Material's `document$` and re-mounts on each instant-navigation page change;
Material also handles the copy buttons. Outside MkDocs it mounts on page load
and handles the copy buttons itself.

Links from the generator to the cluster pages are relative to the docs'
`hpc/` section (`../systems/lawrencium/` from `hpc/jobscript-generator/`).
On any other page, set `data-docs-base` on the mount element to the absolute
URL of that section, as `index.html` does:

```html
<div id="jsg" class="jsg" data-docs-base="https://scienceit-docs.lbl.gov/hpc/"></div>
```

## Running it locally

Serve the repository root with any static file server and open it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening `index.html` directly from disk also works, though browsers may block
the copy buttons on `file://` pages.

## Embedding in scienceit-docs

The docs page is `docs/hpc/jobscript-generator.md` in scienceit-docs:

```markdown
---
hide:
  - toc
---

# Jobscript Generator

Introductory text...

<div id="jsg" class="jsg">
<noscript>
<p>The jobscript generator needs JavaScript. See <a href="../running/script-examples/">Example Scripts</a> for job scripts you can copy.</p>
</noscript>
</div>
```

and `mkdocs.yml` loads the shared files:

```yaml
nav:
  - High Performance Computing:
      - Jobscript Generator: hpc/jobscript-generator.md

extra_css:
  - stylesheets/extra.css
  - stylesheets/jobscript-generator.css

extra_javascript:
  - javascripts/jobscript-generator.js
```

After changing the generator here, copy it into the docs and commit it there:

```bash
./sync-docs.sh /path/to/scienceit-docs
```

The explanatory text on the standalone page (`index.html`) follows the docs
page. When one changes, update the other.

## Updating partitions, QoS and SU ratios

All cluster data is at the top of `javascripts/jobscript-generator.js`:
`PARTITIONS` (node types, cores, memory, GPUs, SU ratios and QoS names) and
`QOS_LIMITS` (wall-time and node limits). It follows the CPU and GPU cluster
pages, the Recharge Model and the QoS table in the FAQ in scienceit-docs.

## Deployment

Pushes to `main` are merged into the `deploy` branch, which GitHub Pages serves
(see `.github/workflows/deploy.yml`).

## License

Copyright (c) 2023, The Regents of the University of California, 
through Lawrence Berkeley National Laboratory (subject to receipt of any 
required approvals from the U.S. Dept. of Energy).  All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
