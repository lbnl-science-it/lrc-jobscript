/*
 * Slurm jobscript generator for Lawrencium.
 *
 * Mounts into <div id="jsg" class="jsg">. The same file runs embedded in the
 * scienceit-docs MkDocs site (hpc/jobscript-generator.md) and on the
 * standalone page (index.html in the lrc-jobscript repository). Outside
 * MkDocs, set data-docs-base on the mount element to the absolute URL of the
 * docs' hpc/ section so the links to the cluster pages resolve.
 *
 * The partition data below follows hpc/systems/lawrencium.md,
 * hpc/systems/einsteinium.md, the Recharge Model in hpc/index.md and the
 * QoS limits in hpc/faqs.md. Update it here when partitions, QoS names or
 * SU ratios change.
 */
(function () {
  "use strict";

  const LR_QOS = { normal: "lr_normal", debug: "lr_debug", lowprio: "lr_lowprio" };
  const ES_QOS = { normal: "es_normal", debug: "es_debug", lowprio: "es_lowprio" };

  // ratio: SUs per core-hour (null when not yet published); mem in GB.
  const PARTITIONS = [
    {
      id: "lr8", kind: "cpu", ratio: 1.0, exclusive: false, nodes: 20, cpu: "AMD EPYC 9534",
      types: [{ cores: 128, mem: 768 }],
      qos: { normal: "lr8_normal", debug: "lr8_debug", lowprio: "lr8_lowprio" },
    },
    {
      id: "lr7", kind: "cpu", ratio: 1.0, exclusive: false, nodes: 132, cpu: "Intel Xeon Gold 6330",
      types: [{ cores: 56, mem: 256 }, { cores: 56, mem: 512 }],
      qos: LR_QOS,
    },
    {
      id: "lr6", kind: "cpu", ratio: 0.75, exclusive: true, nodes: 388,
      cpu: "Intel Xeon Gold 6130, 5218 or 6230",
      types: [{ cores: 32, mem: 96 }, { cores: 32, mem: 192 }, { cores: 40, mem: 192 }],
      qos: { normal: "lr_normal", debug: "lr_debug", lowprio: "lr6_lowprio" },
    },
    {
      id: "lr5", kind: "cpu", ratio: 0.5, exclusive: true, nodes: 192,
      cpu: "Intel Xeon E5-2680v4 or E5-2640v4",
      types: [
        { cores: 28, mem: 64, feature: "lr5_c28" },
        { cores: 20, mem: 128, feature: "lr5_c20" },
      ],
      qos: LR_QOS,
    },
    {
      id: "lr4", kind: "cpu", ratio: 0, exclusive: true, nodes: 148, cpu: "Intel Xeon E5-2670v3",
      types: [{ cores: 24, mem: 64 }],
      qos: LR_QOS,
    },
    {
      id: "lr_bigmem", kind: "cpu", ratio: 1.5, exclusive: true, nodes: 2, cpu: "Intel Xeon Gold 5218",
      types: [{ cores: 32, mem: 1536 }],
      qos: { normal: "lr_normal" },
    },
    {
      id: "cm1", kind: "cpu", ratio: 0.75, exclusive: false, nodes: 14, cpu: "AMD EPYC 7401",
      types: [{ cores: 48, mem: 256 }],
      qos: { normal: "cm1_normal", debug: "cm1_debug" },
    },
    // es3 is left out until its SU ratio and QoS are set. To list it, restore:
    // {
    //   id: "es3", kind: "gpu", ratio: null, cpu: "AMD EPYC 9754",
    //   gpus: [{ gres: "RTX6000", name: "RTX PRO 6000 Blackwell", mem: 96, perNode: 4, cpusPerGpu: 32, nodes: 8 }],
    //   qos: {},
    //   note: "QoS values for es3 have not been configured for all users yet. Enter the QoS you were given, and see the GPU cluster page for updates.",
    // },
    {
      id: "es2", kind: "gpu", ratio: 2.0, cpu: "Intel Xeon Platinum 8480+ or 8570",
      gpus: [
        { gres: "H100", name: "H100", mem: 80, perNode: 8, cpusPerGpu: 14, nodes: 4 },
        { gres: "H200", name: "H200", mem: 141, perNode: 8, cpusPerGpu: 14, nodes: 3, memPerCpu: "18400M" },
        { gres: "", name: "Any (H100 or H200)", perNode: 8, cpusPerGpu: 14, nodes: 7 },
      ],
      qos: { normal: "es2_normal", debug: "es_debug", lowprio: "es_lowprio" },
    },
    {
      id: "es1", kind: "gpu", ratio: 1.0, cpu: "AMD EPYC 7742/7713 or Intel Xeon E5-2623",
      gpus: [
        { gres: "A40", name: "A40", mem: 48, perNode: 4, cpusPerGpu: 16, nodes: 30 },
        { gres: "A100", name: "A100", mem: 80, perNode: 4, cpusPerGpu: 16, nodes: 1 },
        { gres: "GRTX8000", name: "GRTX8000", mem: 48, perNode: 4, cpusPerGpu: 16, nodes: 1 },
        { gres: "V100", name: "V100", mem: 32, perNode: 2, cpusPerGpu: 4, nodes: 15 },
      ],
      qos: ES_QOS,
    },
    {
      id: "es0", kind: "gpu", ratio: 0, cpu: "Intel Xeon Silver 4212",
      gpus: [{ gres: "", name: "RTX 2080 Ti", mem: 11, perNode: 4, cpusPerGpu: 2, nodes: 12 }],
      qos: ES_QOS,
    },
  ];

  // MaxWall (hours) and MaxTRES node limits, from `sacctmgr show qos` in hpc/faqs.md.
  const QOS_LIMITS = {
    lr_normal: { hours: 72 },
    lr_debug: { hours: 3, nodes: 4 },
    lr8_normal: { hours: 72 },
    lr8_debug: { hours: 3, nodes: 4 },
    cm1_normal: { hours: 72, nodes: 64 },
    cm1_debug: { hours: 1, nodes: 4 },
    es_normal: { hours: 72, nodes: 64 },
    es_debug: { hours: 3, nodes: 4 },
    es2_normal: { hours: 72 },
  };

  const QOS_KINDS = [
    { kind: "normal", label: "Normal" },
    { kind: "debug", label: "Debug" },
    { kind: "lowprio", label: "Low priority" },
    { kind: "other", label: "Condo / other" },
  ];

  const SU_PRICE = 0.01;
  const PCA_ALLOWANCE = 500000;
  const STORAGE_KEY = "lrc-jobscript-generator";

  // Material for MkDocs exposes document$; without it, the page is standalone.
  const IN_MKDOCS = !!(window.document$ && typeof window.document$.subscribe === "function");

  const DEFAULTS = {
    partition: "lr7",
    gpu_type: "",
    feature: "",
    nodes: "1",
    tasks: "1",
    cpus: "", // blank: 1 on shared nodes, and no --cpus-per-task when whole nodes are allocated
    gpus: "1",
    gpu_layout: "per-gpu",
    mem: "",
    exclusive: false,
    account: "",
    qos: "normal",
    qos_other: "",
    hours: "1",
    minutes: "0",
    requeue: true,
    jobname: "myjob",
    output: "%x-%j.out",
    separate_err: false,
    email: "",
    mail_type: "END,FAIL",
    omp: true,
    commands: "",
    cmd_edited: false,
  };

  const BOOLEAN_FIELDS = ["exclusive", "requeue", "separate_err", "omp", "cmd_edited"];

  // ---------------------------------------------------------------- helpers

  const byId = (id) => PARTITIONS.find((p) => p.id === id) || PARTITIONS[1];

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const int = (v, fallback) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

  const unique = (arr) => Array.from(new Set(arr));

  const fmtMem = (gb) => (gb >= 1024 ? `${+(gb / 1024).toFixed(1)} TB` : `${gb} GB`);

  const fmtNum = (n) =>
    n >= 100 ? Math.round(n).toLocaleString("en-US") : (+n.toFixed(n < 10 ? 2 : 1)).toLocaleString("en-US");

  const fmtRange = (lo, hi, f, sep = " – ") => (Math.abs(hi - lo) < 1e-9 ? f(lo) : `${f(lo)}${sep}${f(hi)}`);

  const fmtRatio = (r) => r.toFixed(2).replace(/(\.\d)0$/, "$1");

  const fmtHours = (h) => `${+h.toFixed(2)} h`;

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const pad = (n) => String(n).padStart(2, "0");

  function fmtTime(hours, minutes) {
    const days = Math.floor(hours / 24);
    const hh = `${pad(hours % 24)}:${pad(minutes)}:00`;
    return days ? `${days}-${hh}` : hh;
  }

  function gpuTypeOf(p, state) {
    return p.gpus.find((g) => g.gres + "|" + g.name === state.gpu_type) || p.gpus[0];
  }

  function gpuKey(g) {
    return g.gres + "|" + g.name;
  }

  // Usable memory is slightly less than the installed memory.
  const usableMem = (gb) => gb - Math.ceil(gb / 64) * 2;

  function rateLabel(p) {
    if (p.ratio === null) return "Not yet published";
    if (p.ratio === 0) return "Free";
    if (p.kind === "cpu") return fmtRatio(p.ratio);
    const perGpu = unique(p.gpus.map((g) => p.ratio * g.cpusPerGpu)).sort((a, b) => a - b);
    return perGpu.length > 1 ? `${perGpu[0]}–${perGpu[perGpu.length - 1]}` : String(perGpu[0]);
  }

  // ---------------------------------------------------------------- markup

  function partitionRows(kind) {
    return PARTITIONS.filter((p) => p.kind === kind)
      .map((p) => {
        const rate = rateLabel(p);
        const rateClass = p.ratio === 0 ? " jsg-rate--free" : p.ratio === null ? " jsg-rate--na" : "";
        let cells;
        if (kind === "cpu") {
          const cores = unique(p.types.map((t) => t.cores)).join(", ");
          const mem = unique(p.types.map((t) => t.mem)).map(fmtMem).join(", ");
          cells = `<span>${cores}</span><span>${mem}</span>`;
        } else {
          const named = p.gpus.filter((g) => g.mem);
          const perNode = unique(named.map((g) => g.perNode)).join(" or ");
          cells = `<span>${named.map((g) => esc(g.name)).join(", ")}</span><span>${perNode}</span>`;
        }
        return `<label class="jsg-ptable__row">
            <input type="radio" name="partition" value="${p.id}">
            <span class="jsg-ptable__name"><span class="jsg-mono">${p.id}</span>${
              kind === "cpu" ? `<span class="jsg-tag">${p.exclusive ? "exclusive" : "shared"}</span>` : ""
            }</span>${cells}
            <span class="jsg-rate${rateClass}">${rate}</span>
          </label>`;
      })
      .join("");
  }

  const TEMPLATE = `
  <div class="jsg__layout">
    <form class="jsg__form" autocomplete="off" novalidate>

      <section class="jsg-step" aria-labelledby="jsg-step-1">
        <h2 class="jsg-step__title" id="jsg-step-1"><span class="jsg-step__n">1</span>Partition</h2>
        <div class="jsg-scroll">
          <div class="jsg-ptable jsg-ptable--cpu" role="radiogroup" aria-label="Lawrencium CPU partitions">
            <div class="jsg-ptable__caption">Lawrencium CPU cluster</div>
            <div class="jsg-ptable__head" aria-hidden="true">
              <span></span><span>Partition</span><span>Cores/node</span><span>Memory/node</span><span>SU per core-hour</span>
            </div>
            ${partitionRows("cpu")}
          </div>
          <div class="jsg-ptable jsg-ptable--gpu" role="radiogroup" aria-label="Einsteinium GPU partitions">
            <div class="jsg-ptable__caption">Einsteinium GPU cluster</div>
            <div class="jsg-ptable__head" aria-hidden="true">
              <span></span><span>Partition</span><span>GPU types</span><span>GPUs/node</span><span>SU per GPU-hour</span>
            </div>
            ${partitionRows("gpu")}
          </div>
        </div>
        <p class="jsg-hint" data-ref="partition-info"></p>
      </section>

      <section class="jsg-step" aria-labelledby="jsg-step-2">
        <h2 class="jsg-step__title" id="jsg-step-2"><span class="jsg-step__n">2</span>Resources</h2>
        <div class="jsg-grid">
          <div class="jsg-field" data-show="gpu">
            <label for="jsg-gpu_type">GPU type</label>
            <select id="jsg-gpu_type" name="gpu_type"></select>
          </div>
          <div class="jsg-field" data-show="feature">
            <label for="jsg-feature">Node type</label>
            <select id="jsg-feature" name="feature"></select>
          </div>
          <div class="jsg-field">
            <label for="jsg-nodes">Nodes</label>
            <input id="jsg-nodes" name="nodes" type="number" min="1" step="1" inputmode="numeric">
          </div>
          <div class="jsg-field" data-show="cpu">
            <label for="jsg-tasks">Tasks per node</label>
            <input id="jsg-tasks" name="tasks" type="number" min="1" step="1" inputmode="numeric">
          </div>
          <div class="jsg-field" data-show="cpu">
            <label for="jsg-cpus">CPUs per task <span class="jsg-optional" data-show="cpus-optional">optional</span></label>
            <input id="jsg-cpus" name="cpus" type="number" min="1" step="1" inputmode="numeric">
          </div>
          <div class="jsg-field" data-show="gpu">
            <label for="jsg-gpus">GPUs per node</label>
            <input id="jsg-gpus" name="gpus" type="number" min="1" step="1" inputmode="numeric">
          </div>
          <div class="jsg-field" data-show="gpu">
            <label for="jsg-gpu_layout">Tasks</label>
            <select id="jsg-gpu_layout" name="gpu_layout">
              <option value="per-gpu">One task per GPU</option>
              <option value="single">One task for all GPUs</option>
            </select>
          </div>
          <div class="jsg-field" data-show="mem">
            <label for="jsg-mem">Memory per node <span class="jsg-optional">GB, optional</span></label>
            <input id="jsg-mem" name="mem" type="number" min="1" step="1" inputmode="numeric" placeholder="Default">
          </div>
        </div>
        <p class="jsg-derived" data-ref="resources-summary"></p>
        <label class="jsg-check" data-show="shared-cpu">
          <input type="checkbox" name="exclusive">
          <span>Request whole nodes, with all their memory (<code>--exclusive</code> and <code>--mem=0</code>). All cores on each node are charged.</span>
        </label>
      </section>

      <section class="jsg-step" aria-labelledby="jsg-step-3">
        <h2 class="jsg-step__title" id="jsg-step-3"><span class="jsg-step__n">3</span>Account, QoS and time</h2>
        <div class="jsg-field">
          <label for="jsg-account">Project account</label>
          <input id="jsg-account" name="account" type="text" spellcheck="false" placeholder="e.g. pc_myproject, ac_myproject or lr_mycondo">
          <p class="jsg-hint">List the accounts and QoS you can use with <code>sacctmgr show association -p user=$USER</code>.</p>
        </div>
        <fieldset class="jsg-fieldset">
          <legend>Quality of Service (QoS)</legend>
          <div class="jsg-segmented" data-ref="qos-options"></div>
          <p class="jsg-hint" data-ref="qos-info"></p>
        </fieldset>
        <div class="jsg-field" data-show="qos-other">
          <label for="jsg-qos_other">QoS name</label>
          <input id="jsg-qos_other" name="qos_other" type="text" spellcheck="false" placeholder="e.g. condo_mygroup">
        </div>
        <fieldset class="jsg-fieldset">
          <legend>Time limit</legend>
          <div class="jsg-time">
            <div class="jsg-field jsg-field--inline">
              <input id="jsg-hours" name="hours" type="number" min="0" step="1" inputmode="numeric" aria-label="Hours">
              <label for="jsg-hours">hours</label>
            </div>
            <div class="jsg-field jsg-field--inline">
              <input id="jsg-minutes" name="minutes" type="number" min="0" max="59" step="1" inputmode="numeric" aria-label="Minutes">
              <label for="jsg-minutes">minutes</label>
            </div>
            <div class="jsg-presets" aria-label="Common time limits">
              <button type="button" data-time="0:30">30 min</button>
              <button type="button" data-time="1:0">1 h</button>
              <button type="button" data-time="4:0">4 h</button>
              <button type="button" data-time="12:0">12 h</button>
              <button type="button" data-time="24:0">24 h</button>
              <button type="button" data-time="72:0">72 h</button>
            </div>
          </div>
        </fieldset>
        <label class="jsg-check" data-show="lowprio">
          <input type="checkbox" name="requeue">
          <span>Requeue the job if it is preempted (<code>--requeue</code>)</span>
        </label>
      </section>

      <section class="jsg-step" aria-labelledby="jsg-step-4">
        <h2 class="jsg-step__title" id="jsg-step-4"><span class="jsg-step__n">4</span>Job options</h2>
        <div class="jsg-grid">
          <div class="jsg-field">
            <label for="jsg-jobname">Job name</label>
            <input id="jsg-jobname" name="jobname" type="text" spellcheck="false">
          </div>
          <div class="jsg-field">
            <label for="jsg-output">Output file</label>
            <input id="jsg-output" name="output" type="text" spellcheck="false">
          </div>
          <div class="jsg-field">
            <label for="jsg-email">Email notifications <span class="jsg-optional">optional</span></label>
            <input id="jsg-email" name="email" type="email" spellcheck="false" placeholder="you@lbl.gov">
          </div>
          <div class="jsg-field" data-show="email">
            <label for="jsg-mail_type">Email me when</label>
            <select id="jsg-mail_type" name="mail_type">
              <option value="END,FAIL">The job ends or fails</option>
              <option value="BEGIN,END,FAIL">It starts, ends or fails</option>
              <option value="FAIL">It fails</option>
              <option value="ALL">Any state change</option>
            </select>
          </div>
        </div>
        <p class="jsg-hint"><code>%x</code> is replaced by the job name and <code>%j</code> by the job ID.</p>
        <label class="jsg-check">
          <input type="checkbox" name="separate_err">
          <span>Write errors to a separate file (<code>--error</code>)</span>
        </label>
      </section>

      <section class="jsg-step" aria-labelledby="jsg-step-5">
        <h2 class="jsg-step__title" id="jsg-step-5"><span class="jsg-step__n">5</span>Commands</h2>
        <label class="jsg-check" data-show="omp">
          <input type="checkbox" name="omp">
          <span>Set <code>OMP_NUM_THREADS</code> to the CPUs per task</span>
        </label>
        <div class="jsg-field">
          <label for="jsg-commands">Commands to run</label>
          <textarea id="jsg-commands" name="commands" rows="7" spellcheck="false"></textarea>
          <p class="jsg-hint">Example commands are filled in until you edit them. Find software with <code>module avail</code>.</p>
        </div>
      </section>
    </form>

    <aside class="jsg__out" aria-label="Generated job script">
      <div class="jsg-su">
        <div class="jsg-su__label">Estimated usage</div>
        <div class="jsg-su__value" data-ref="su-value" aria-live="polite"></div>
        <div class="jsg-su__formula" data-ref="su-formula"></div>
        <div class="jsg-su__cost" data-ref="su-cost"></div>
      </div>
      <ul class="jsg-notes" data-ref="notes"></ul>

      <div class="jsg-tabs" role="tablist">
        <button type="button" role="tab" id="jsg-tab-batch" aria-controls="jsg-panel-batch" aria-selected="true" data-tab="batch">Batch script</button>
        <button type="button" role="tab" id="jsg-tab-interactive" aria-controls="jsg-panel-interactive" aria-selected="false" tabindex="-1" data-tab="interactive">Interactive session</button>
      </div>
      <div class="jsg-panel" role="tabpanel" id="jsg-panel-batch" aria-labelledby="jsg-tab-batch">
        <div class="jsg-filebar">
          <code data-ref="filename"></code>
          <button type="button" class="jsg-link" data-action="download">Download</button>
        </div>
        <div class="language-bash highlight no-copy"><pre id="jsg-script"><button type="button" class="md-clipboard md-icon" title="Copy to clipboard" data-clipboard-target="#jsg-script > code"></button><code></code></pre></div>
        <p class="jsg-hint" data-ref="submit-hint"></p>
      </div>
      <div class="jsg-panel" role="tabpanel" id="jsg-panel-interactive" aria-labelledby="jsg-tab-interactive" hidden>
        <p class="jsg-hint">Run this on a login node to get a shell on a compute node with the same resources. Type <code>exit</code> when you are done so the time stops being charged.</p>
        <div class="language-bash highlight no-copy"><pre id="jsg-srun"><button type="button" class="md-clipboard md-icon" title="Copy to clipboard" data-clipboard-target="#jsg-srun > code"></button><code></code></pre></div>
      </div>

      <div class="jsg-actions">
        <button type="button" class="md-button" data-action="share">Copy link to this setup</button>
        <button type="button" class="jsg-link" data-action="reset">Start over</button>
      </div>
    </aside>
  </div>`;

  // ---------------------------------------------------------------- state

  function loadState() {
    const state = Object.assign({}, DEFAULTS);
    const params = new URLSearchParams(window.location.search);
    let saved = null;
    if ([...params.keys()].some((k) => k in DEFAULTS)) {
      saved = {};
      params.forEach((v, k) => {
        if (k in DEFAULTS) saved[k] = BOOLEAN_FIELDS.includes(k) ? v === "1" : v;
      });
      // A shared link carries only non-default values, so unset booleans are defaults.
    } else {
      try {
        saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      } catch (e) {
        saved = null;
      }
    }
    if (saved && typeof saved === "object") {
      Object.keys(DEFAULTS).forEach((k) => {
        if (k in saved) state[k] = BOOLEAN_FIELDS.includes(k) ? !!saved[k] : String(saved[k]);
      });
    }
    if (!PARTITIONS.some((p) => p.id === state.partition)) state.partition = DEFAULTS.partition;
    return state;
  }

  function saveState(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable: the form still works */
    }
  }

  function shareUrl(state) {
    const params = new URLSearchParams();
    Object.keys(DEFAULTS).forEach((k) => {
      if (k === "commands" && !state.cmd_edited) return;
      if (state[k] === DEFAULTS[k]) return;
      params.set(k, BOOLEAN_FIELDS.includes(k) ? (state[k] ? "1" : "0") : state[k]);
    });
    const url = new URL(window.location.href);
    url.search = params.toString();
    url.hash = "";
    return url.toString();
  }

  // ---------------------------------------------------------------- model

  // Turn raw form state into the job description used for the script and estimate.
  function describe(state) {
    const p = byId(state.partition);
    const job = {
      p,
      nodes: Math.max(1, int(state.nodes, 1)),
      hours: Math.max(0, int(state.hours, 0)),
      minutes: clamp(int(state.minutes, 0), 0, 59),
      qosKind: state.qos,
    };

    if (job.qosKind !== "other" && !p.qos[job.qosKind]) job.qosKind = p.qos.normal ? "normal" : "other";
    job.qosName = job.qosKind === "other" ? state.qos_other.trim() : p.qos[job.qosKind];
    job.walltime = job.hours + job.minutes / 60;

    if (p.kind === "cpu") {
      job.tasks = Math.max(1, int(state.tasks, 1));
      job.cpus = Math.max(1, int(state.cpus, 1));
      job.cpusSet = state.cpus.trim() !== "";
      job.coresReq = job.tasks * job.cpus;
      job.feature = p.types.some((t) => t.feature === state.feature) ? state.feature : "";
      job.exclusive = p.exclusive || (!p.exclusive && state.exclusive);
      job.requestExclusive = !p.exclusive && state.exclusive;
      // Whole nodes come with all their memory (--mem=0), so a memory request does not apply.
      job.mem = job.requestExclusive || state.mem.trim() === "" ? null : Math.max(1, int(state.mem, 1));
      // On whole nodes, CPUs per task is left to Slurm unless the user sets it.
      job.omitCpus = job.exclusive && !job.cpusSet;

      const pool = p.types.filter((t) => !job.feature || t.feature === job.feature);
      job.fits = pool.filter((t) => t.cores >= job.coresReq && (job.mem === null || job.mem <= usableMem(t.mem)));
      const basis = job.fits.length ? job.fits : pool;
      if (job.exclusive) {
        job.coresLo = Math.min(...basis.map((t) => t.cores));
        job.coresHi = Math.max(...basis.map((t) => t.cores));
      } else {
        job.coresLo = job.coresHi = job.coresReq;
      }
      job.maxNodes = p.nodes;
    } else {
      const g = gpuTypeOf(p, state);
      job.gpu = g;
      job.gpus = clamp(Math.max(1, int(state.gpus, 1)), 1, g.perNode);
      job.gpusRaw = Math.max(1, int(state.gpus, 1));
      const totalCpus = job.gpus * g.cpusPerGpu;
      if (state.gpu_layout === "single") {
        job.tasks = 1;
        job.cpus = totalCpus;
      } else {
        job.tasks = job.gpus;
        job.cpus = g.cpusPerGpu;
      }
      job.coresReq = job.coresLo = job.coresHi = totalCpus;
      job.maxNodes = g.nodes;
    }

    const f = job.nodes * job.walltime;
    job.suLo = p.ratio === null ? null : p.ratio * job.coresLo * f;
    job.suHi = p.ratio === null ? null : p.ratio * job.coresHi * f;
    return job;
  }

  function validate(state, job) {
    const { p } = job;
    const notes = [];
    const add = (level, html) => notes.push({ level, html });
    const limits = QOS_LIMITS[job.qosName];

    if (!state.account.trim()) {
      add("info", "Replace <code>account_name</code> with your project account.");
    }
    if (job.qosKind === "other" && !job.qosName) {
      add("error", "Enter the name of the QoS to use, for example <code>condo_mygroup</code>.");
    }
    if (/^lr_/.test(state.account.trim()) && job.qosKind !== "other" && job.qosKind !== "lowprio") {
      add("warn", "Condo accounts (<code>lr_*</code>) are normally used with your condo QoS, for example <code>condo_mygroup</code>. Choose <strong>Condo / other</strong> to enter it.");
    }

    if (job.walltime <= 0) {
      add("error", "Set a time limit greater than zero.");
    } else if (limits && job.walltime > limits.hours) {
      add("error", `<code>${esc(job.qosName)}</code> allows at most ${plural(limits.hours, "hour")}. Shorten the time limit.`);
    } else if (!limits && job.walltime > 72) {
      add("warn", "Most QoS allow at most 72 hours. Check your limit with <code>sacctmgr show qos</code>.");
    }

    if (job.nodes > job.maxNodes) {
      const what = p.kind === "gpu" && p.gpus.length > 1 ? `${p.id} has ${job.maxNodes} ${esc(job.gpu.name)} nodes` : `${p.id} has ${job.maxNodes} nodes`;
      add("error", `${what}. Request ${job.maxNodes} or fewer.`);
    } else if (limits && limits.nodes && job.nodes > limits.nodes) {
      add("error", `<code>${esc(job.qosName)}</code> allows at most ${limits.nodes} nodes per job.`);
    }

    if (p.kind === "cpu") {
      const maxCores = Math.max(...p.types.map((t) => t.cores));
      const maxMem = Math.max(...p.types.map((t) => usableMem(t.mem)));
      if (job.coresReq > maxCores) {
        add("error", `${job.tasks} tasks × ${job.cpus} CPUs is ${job.coresReq} cores per node, but ${p.id} nodes have at most ${maxCores}.`);
      } else if (job.mem !== null && job.mem > maxMem) {
        add("error", `${p.id} nodes have at most about ${maxMem} GB of usable memory.`);
      } else if (!job.fits.length) {
        add("error", "No node type in this partition has enough cores and memory for this request.");
      }
      if (job.exclusive && job.coresReq < job.coresLo) {
        const cores = fmtRange(job.coresLo, job.coresHi, String, "–");
        add("info", `${p.exclusive ? `${p.id} nodes are allocated whole` : "With <code>--exclusive</code>, nodes are allocated whole"}, so all ${cores} cores on each node are charged${job.omitCpus ? "" : `, though the job uses ${job.coresReq}`}.`);
      } else if (job.exclusive && job.coresLo !== job.coresHi) {
        add("info", `${p.id} has nodes with ${fmtRange(job.coresLo, job.coresHi, String, " and ")} cores. The charge depends on which node type the job gets.`);
      }
    } else {
      if (job.gpusRaw > job.gpu.perNode) {
        add("error", `${esc(job.gpu.name)} nodes have ${job.gpu.perNode} GPUs. Request ${job.gpu.perNode} or fewer per node.`);
      }
      if (p.note) add("warn", esc(p.note));
    }
    return notes;
  }

  // ---------------------------------------------------------------- output

  function sbatchOptions(state, job) {
    const { p } = job;
    const opts = [
      ["job-name", state.jobname.trim() || "myjob"],
      ["account", state.account.trim() || "account_name"],
      ["partition", p.id],
      ["qos", job.qosName || "qos_name"],
    ];
    if (job.feature) opts.push(["constraint", job.feature]);
    opts.push(["nodes", job.nodes], ["ntasks-per-node", job.tasks]);
    if (!job.omitCpus) opts.push(["cpus-per-task", job.cpus]);
    if (p.kind === "gpu") {
      opts.push(["gres", job.gpu.gres ? `gpu:${job.gpu.gres}:${job.gpus}` : `gpu:${job.gpus}`]);
      if (job.gpu.memPerCpu) opts.push(["mem-per-cpu", job.gpu.memPerCpu]);
    } else if (job.mem !== null) {
      opts.push(["mem", `${job.mem}G`]);
    }
    if (job.requestExclusive) opts.push(["exclusive"], ["mem", "0"]);
    opts.push(["time", fmtTime(job.hours, job.minutes)]);
    return opts;
  }

  function batchScript(state, job) {
    const lines = ["#!/bin/bash"];
    const add = (k, v) => lines.push(v === undefined ? `#SBATCH --${k}` : `#SBATCH --${k}=${v}`);

    sbatchOptions(state, job).forEach(([k, v]) => add(k, v));
    const output = state.output.trim();
    if (output) {
      add("output", output);
      if (state.separate_err) add("error", /\.out$/.test(output) ? output.replace(/\.out$/, ".err") : `${output}.err`);
    }
    if (state.email.trim()) {
      add("mail-user", state.email.trim());
      add("mail-type", state.mail_type);
    }
    if (job.qosKind === "lowprio" && state.requeue) add("requeue");

    lines.push("");
    if (job.p.kind === "cpu" && job.cpus > 1 && state.omp) {
      lines.push("export OMP_NUM_THREADS=$SLURM_CPUS_PER_TASK", "");
    }
    const commands = state.commands.replace(/\s+$/, "");
    lines.push(...(commands ? commands.split(/\r?\n/) : ["# Add your commands here"]));
    return lines.join("\n") + "\n";
  }

  function srunCommand(state, job) {
    const opts = sbatchOptions(state, job)
      .filter(([k]) => k !== "job-name")
      .map(([k, v]) => (v === undefined ? `--${k}` : `--${k}=${v}`));
    opts.push("--pty bash");
    return "srun " + opts.join(" \\\n    ") + "\n";
  }

  function defaultCommands(job) {
    if (job.p.kind === "gpu") return "module load ml/pytorch\npython train.py";
    if (job.nodes * job.tasks > 1) return "module load gcc openmpi\nmpirun ./my_program";
    return "./my_program";
  }

  // Light-weight bash highlighting using the Pygments classes the theme already styles.
  function highlight(text) {
    return text
      .split("\n")
      .map((line) => {
        if (/^#!/.test(line)) return `<span class="ch">${esc(line)}</span>`;
        if (/^\s*#/.test(line)) return `<span class="c1">${esc(line)}</span>`;
        let out = "";
        const re = /("(?:[^"\\]|\\.)*"|'[^']*'|\$\{?\w+\}?|^export\b|\b[A-Z_][A-Z0-9_]*(?==))/g;
        let last = 0;
        let m;
        while ((m = re.exec(line))) {
          out += esc(line.slice(last, m.index));
          const tok = m[0];
          const cls = tok[0] === '"' ? "s2" : tok[0] === "'" ? "s1" : tok[0] === "$" || /^[A-Z_]/.test(tok) ? "nv" : "nb";
          out += `<span class="${cls}">${esc(tok)}</span>`;
          last = m.index + tok.length;
        }
        return out + esc(line.slice(last));
      })
      .join("\n");
  }

  function setCode(pre, text) {
    const code = pre.querySelector("code");
    code.innerHTML = highlight(text.replace(/\n$/, ""));
    code.setAttribute("data-copy", text);
  }

  // ---------------------------------------------------------------- app

  function mount(root) {
    root.innerHTML = TEMPLATE;
    const form = root.querySelector("form");
    const ref = (name) => root.querySelector(`[data-ref="${name}"]`);
    const field = (name) => form.elements.namedItem(name);
    // Relative to hpc/jobscript-generator/ in the docs site.
    const docsBase = (root.dataset.docsBase || "../").replace(/\/?$/, "/");
    let state = loadState();
    let lastPartition = null;
    let lastGpuType = null;

    const radios = (name) => Array.from(form.querySelectorAll(`input[type="radio"][name="${name}"]`));

    function checkRadio(name, value) {
      radios(name).forEach((r) => {
        r.checked = r.value === value;
      });
    }

    // qos, gpu_type and feature are set by syncPartitionControls, which owns their options.
    function writeForm() {
      Object.keys(DEFAULTS).forEach((k) => {
        const el = field(k);
        if (!el || ["qos", "gpu_type", "feature", "cmd_edited"].includes(k)) return;
        if (radios(k).length) {
          checkRadio(k, state[k]);
        } else if (el.type === "checkbox") {
          el.checked = !!state[k];
        } else {
          el.value = state[k];
        }
      });
    }

    function readForm() {
      Object.keys(DEFAULTS).forEach((k) => {
        const el = field(k);
        if (!el || k === "cmd_edited") return;
        if (radios(k).length) {
          const on = radios(k).find((r) => r.checked);
          if (on) state[k] = on.value;
        } else if (el.type === "checkbox") {
          state[k] = el.checked;
        } else {
          state[k] = el.value;
        }
      });
    }

    function show(key, visible) {
      root.querySelectorAll(`[data-show="${key}"]`).forEach((el) => {
        el.hidden = !visible;
      });
    }

    // Rebuild the controls whose options depend on the partition.
    function syncPartitionControls(p) {
      if (p.kind === "gpu") {
        const sel = field("gpu_type");
        sel.innerHTML = p.gpus
          .map((g) => {
            const detail = g.mem ? ` · ${g.mem} GB, ${g.perNode} per node` : "";
            return `<option value="${esc(gpuKey(g))}">${esc(g.name)}${detail}</option>`;
          })
          .join("");
        sel.value = p.gpus.some((g) => gpuKey(g) === state.gpu_type) ? state.gpu_type : gpuKey(p.gpus[0]);
        state.gpu_type = sel.value;
      }
      const featured = p.kind === "cpu" && p.types.some((t) => t.feature);
      if (featured) {
        const sel = field("feature");
        sel.innerHTML =
          `<option value="">Any</option>` +
          p.types
            .filter((t) => t.feature)
            .map((t) => `<option value="${t.feature}">${t.feature} · ${t.cores} cores, ${fmtMem(t.mem)}</option>`)
            .join("");
        sel.value = p.types.some((t) => t.feature === state.feature) ? state.feature : "";
        state.feature = sel.value;
      }

      const box = ref("qos-options");
      box.innerHTML = QOS_KINDS.filter((q) => q.kind === "other" || p.qos[q.kind])
        .map(
          (q) => `<label class="jsg-segmented__opt">
              <input type="radio" name="qos" value="${q.kind}">
              <span>${q.label}${q.kind === "other" ? "" : `<small>${p.qos[q.kind]}</small>`}</span>
            </label>`
        )
        .join("");
      if (state.qos !== "other" && !p.qos[state.qos]) state.qos = p.qos.normal ? "normal" : "other";
      checkRadio("qos", state.qos);
    }

    function update() {
      const p = byId(state.partition);
      if (p.id !== lastPartition) {
        syncPartitionControls(p);
        lastPartition = p.id;
      }
      if (p.kind === "gpu" && state.gpu_type !== lastGpuType) {
        const perNode = gpuTypeOf(p, state).perNode;
        if (int(state.gpus, 1) > perNode) state.gpus = field("gpus").value = String(perNode);
        lastGpuType = state.gpu_type;
      }
      const job = describe(state);

      // Visibility of conditional fields.
      show("cpu", p.kind === "cpu");
      show("gpu", p.kind === "gpu");
      show("feature", p.kind === "cpu" && p.types.some((t) => t.feature));
      show("shared-cpu", p.kind === "cpu" && !p.exclusive);
      show("mem", p.kind === "cpu" && !job.requestExclusive);
      show("qos-other", job.qosKind === "other");
      show("lowprio", job.qosKind === "lowprio");
      show("email", !!state.email.trim());
      show("omp", p.kind === "cpu" && job.cpus > 1);
      show("cpus-optional", p.kind === "cpu" && job.exclusive);
      field("cpus").placeholder = p.kind === "cpu" && job.exclusive ? "Not set" : "1";

      // Input limits for the spinners.
      field("nodes").max = job.maxNodes;
      if (p.kind === "cpu") {
        const maxCores = Math.max(...p.types.map((t) => t.cores));
        field("tasks").max = maxCores;
        field("cpus").max = maxCores;
      } else {
        field("gpus").max = job.gpu.perNode;
      }

      // Commands follow the job shape until the user edits them.
      if (!state.cmd_edited) {
        state.commands = defaultCommands(job);
        field("commands").value = state.commands;
      }

      // Partition and resource summaries.
      if (p.kind === "cpu") {
        ref("partition-info").innerHTML = `<strong>${p.id}</strong>: ${p.nodes} nodes with ${esc(p.cpu)}. ${
          p.exclusive ? "Nodes are allocated whole to one job." : "Nodes are shared between jobs."
        } See the <a href="${esc(docsBase)}systems/lawrencium/">CPU cluster</a> page.`;
        ref("resources-summary").innerHTML = job.omitCpus
          ? `${plural(job.tasks, "task")} per node, with all <strong>${fmtRange(job.coresLo, job.coresHi, String, "–")} cores of each node</strong> available. Set CPUs per task to add <code>--cpus-per-task</code>.`
          : `${plural(job.tasks, "task")} × ${plural(job.cpus, "CPU")} = <strong>${plural(
              job.coresReq,
              "core"
            )} per node</strong>${job.nodes > 1 ? `, ${job.coresReq * job.nodes} cores in total` : ""}.`;
      } else {
        const nodes = p.gpus.reduce((n, g) => n + (g.mem ? g.nodes : 0), 0);
        ref("partition-info").innerHTML = `<strong>${p.id}</strong>: ${nodes} GPU nodes with ${esc(p.cpu)} CPUs. See the <a href="${esc(docsBase)}systems/einsteinium/">GPU cluster</a> page.`;
        ref("resources-summary").innerHTML = `${plural(job.gpus, "GPU")} × ${job.gpu.cpusPerGpu} CPU cores per GPU = <strong>${
          job.coresReq
        } cores per node</strong>, set for you: the scheduler requires ${job.gpu.cpusPerGpu} cores for each ${esc(
          job.gpu.mem ? job.gpu.name : p.id
        )} GPU.`;
      }

      const limits = QOS_LIMITS[job.qosName];
      const qosInfo = {
        normal: "For production jobs.",
        debug: "For short test runs.",
        lowprio: "Runs on idle nodes at no charge, but can be preempted by higher-priority jobs.",
        other: "Use your condo QoS together with your condo account (<code>lr_*</code>), or any QoS listed for your account.",
      }[job.qosKind];
      const limitText = limits
        ? ` Up to ${plural(limits.hours, "hour")}${limits.nodes ? ` and ${limits.nodes} nodes` : ""} per job.`
        : "";
      ref("qos-info").innerHTML = qosInfo + limitText;

      renderEstimate(state, job);

      const notes = validate(state, job);
      ref("notes").innerHTML = notes.map((n) => `<li class="jsg-note jsg-note--${n.level}">${n.html}</li>`).join("");

      const script = batchScript(state, job);
      setCode(root.querySelector("#jsg-script"), script);
      setCode(root.querySelector("#jsg-srun"), srunCommand(state, job));
      const filename = `${(state.jobname.trim() || "myjob").replace(/[^\w.-]+/g, "_")}.sh`;
      ref("filename").textContent = filename;
      ref("submit-hint").innerHTML = `Save as <code>${esc(filename)}</code> and submit with <code>sbatch ${esc(
        filename
      )}</code>. Check on it with <code>squeue -u $USER</code>.`;
      root._script = { filename, text: script };

      saveState(state);
    }

    function renderEstimate(state, job) {
      const { p } = job;
      const value = ref("su-value");
      const formula = ref("su-formula");
      const cost = ref("su-cost");

      if (p.ratio === null) {
        value.textContent = "Rate not yet published";
        formula.textContent = `${job.coresReq * job.nodes} cores × ${fmtHours(job.walltime)} = ${fmtNum(
          job.coresReq * job.nodes * job.walltime
        )} core-hours`;
        cost.textContent = `The SU ratio for ${p.id} will be listed in the Recharge Model once it is set.`;
        return;
      }

      value.textContent = `${fmtRange(job.suLo, job.suHi, fmtNum)} SU`;
      const rate = `${fmtRatio(p.ratio)} SU/core-hour`;
      const tail = `${plural(job.nodes, "node")} × ${fmtHours(job.walltime)}`;
      formula.textContent =
        p.kind === "gpu"
          ? `${rate} × ${plural(job.gpus, "GPU")} × ${job.gpu.cpusPerGpu} cores × ${tail}` +
            (p.ratio ? ` (${fmtNum(p.ratio * job.gpu.cpusPerGpu)} SU per GPU-hour)` : "")
          : `${rate} × ${fmtRange(job.coresLo, job.coresHi, String, "–")} cores × ${tail}`;

      const account = state.account.trim();
      const dollars = (su) => `$${su.toFixed(2)}`;
      const dollarRange = fmtRange(job.suLo * SU_PRICE, job.suHi * SU_PRICE, dollars);
      let text;
      if (p.ratio === 0) {
        text = `${p.id} is not charged.`;
      } else if (job.qosKind === "lowprio") {
        text = "Low-priority jobs are not charged.";
      } else if (/^ac_/.test(account)) {
        text = `Recharge account: about ${dollarRange} at $0.01 per SU, billed as LRCCPU.`;
      } else if (/^pc_/.test(account)) {
        const pct = (job.suHi / PCA_ALLOWANCE) * 100;
        text = `PCA account: no charge. Uses ${pct < 0.01 ? "under 0.01" : +pct.toFixed(2)}% of the ${PCA_ALLOWANCE.toLocaleString(
          "en-US"
        )} SU annual allowance.`;
      } else if (/^lr_/.test(account)) {
        text = "Condo account: no charge when running within your condo contribution.";
      } else {
        text = `About ${dollarRange} under a recharge (ac_*) account. PCA (pc_*) and condo (lr_*) accounts are not charged.`;
      }
      cost.textContent = text;
    }

    // Clamp numbers once the user leaves a field, not while typing.
    function normalize(name) {
      const p = byId(state.partition);
      const el = field(name);
      if (!el || el.type !== "number" || el.value === "") return;
      let n = Math.max(int(el.min, 0), int(el.value, int(DEFAULTS[name], 0)));
      if (name === "minutes") n = clamp(n, 0, 59);
      if (name === "gpus" && p.kind === "gpu") n = Math.min(n, gpuTypeOf(p, state).perNode);
      el.value = String(n);
      state[name] = el.value;
    }

    // A shared link's query no longer matches once the form is edited.
    function clearQuery() {
      if (!window.location.search) return;
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState(window.history.state, "", url.toString());
    }

    form.addEventListener("input", (e) => {
      clearQuery();
      if (e.target.name === "commands") state.cmd_edited = true;
      readForm();
      update();
    });
    form.addEventListener("change", (e) => {
      normalize(e.target.name);
      if (e.target.name === "hours" && !e.target.value) e.target.value = state.hours = "0";
      if (e.target.name === "minutes" && !e.target.value) e.target.value = state.minutes = "0";
      readForm();
      update();
    });
    form.addEventListener("submit", (e) => e.preventDefault());

    root.querySelectorAll("[data-time]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const [h, m] = btn.dataset.time.split(":");
        clearQuery();
        state.hours = field("hours").value = h;
        state.minutes = field("minutes").value = m;
        update();
      })
    );

    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    function selectTab(tab) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        root.querySelector(`#${t.getAttribute("aria-controls")}`).hidden = !on;
      });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(next);
        next.focus();
      });
    });

    root.querySelector('[data-action="download"]').addEventListener("click", () => {
      const blob = new Blob([root._script.text], { type: "text/x-shellscript" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = root._script.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });

    const shareBtn = root.querySelector('[data-action="share"]');
    shareBtn.addEventListener("click", () => {
      const url = shareUrl(state);
      window.history.replaceState(window.history.state, "", url);
      const done = (msg) => {
        shareBtn.textContent = msg;
        setTimeout(() => (shareBtn.textContent = "Copy link to this setup"), 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          () => done("Link copied"),
          () => done("Link is in the address bar")
        );
      } else {
        done("Link is in the address bar");
      }
    });

    // Material handles .md-clipboard buttons itself; the standalone page needs its own handler.
    if (!IN_MKDOCS) {
      root.querySelectorAll(".md-clipboard").forEach((btn) =>
        btn.addEventListener("click", () => {
          const code = root.querySelector(btn.dataset.clipboardTarget);
          const flash = (cls) => {
            btn.classList.add(cls);
            setTimeout(() => btn.classList.remove(cls), 1500);
          };
          if (!code || !navigator.clipboard || !navigator.clipboard.writeText) return flash("jsg-copy-failed");
          navigator.clipboard.writeText(code.getAttribute("data-copy").trimEnd()).then(
            () => flash("jsg-copied"),
            () => flash("jsg-copy-failed")
          );
        })
      );
    }

    root.querySelector('[data-action="reset"]').addEventListener("click", () => {
      state = Object.assign({}, DEFAULTS);
      lastPartition = lastGpuType = null;
      clearQuery();
      writeForm();
      update();
    });

    writeForm();
    update();
  }

  function init() {
    const root = document.getElementById("jsg");
    if (root && !root.dataset.mounted) {
      root.dataset.mounted = "1";
      mount(root);
    }
  }

  // Material's instant navigation swaps pages without a reload; document$ fires on each one.
  if (IN_MKDOCS) {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
