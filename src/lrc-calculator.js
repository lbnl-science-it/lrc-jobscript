/*

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

*/

const radios = [
    'partition'
];

const checkboxes = [
    'contiguous',
    'verbose',
    'killbad',
    'label',
    'quit',
    'requeue'
];

var slurm_script;

var srun_command;

function lrc_calc_onload() {

    const form = document.getElementById("form");
    const submitter = document.getElementById("submit");
    const formData = new FormData(form, submitter);

    const searchParams = new URLSearchParams(window.location.search);

    for ( [key, value] of formData.entries() ) {

        if((! (localStorage.getItem(key) === null)) || (searchParams.has(key))) {

            if(radios.includes(key)) {
                if(localStorage.getItem(key) || searchParams.get(key)) {
                    if(searchParams.get(key)) {
                        document.getElementById(searchParams.get(key)).checked = true;
                    } else {
                        document.getElementById(localStorage.getItem(key)).checked = true;
                    }
                }
            } else if(checkboxes.includes(key)) {
                if(localStorage.getItem(key) == 'on' || searchParams.get(key) == 'on') {
                    document.getElementById(key).checked = true;    
                } else {
                    document.getElementById(key).checked = false;
                }
            } else {
                if(searchParams.has(key)) {
                    document.getElementById(key).value = searchParams.get(key);
                } else {
                    document.getElementById(key).value = localStorage.getItem(key);
                }
            }
            //formData.set(key, localStorage.getItem(key));
        }

    }

    for (key of checkboxes) {
        if(localStorage.getItem(key) == 'on' || (searchParams.has(key) && searchParamrs.get(key) == 'on')) {
            document.getElementById(key).checked = true;    
        } else {
            document.getElementById(key).checked = false;
        }
    }

    lrc_calc_onchange();

}

// get form data

function lrc_calc_onchange() {

    const form = document.getElementById("form");
    const submitter = document.getElementById("submit");
    const formData = new FormData(form, submitter);

    if (formData.get('partition').includes('lr7') || formData.get('partition').includes('lr8')) {
        document.getElementById('cores_block').classList.remove('hidden');

        // split partition string on _

        var max_cores = parseInt(formData.get('partition').split('_')[1]);

        document.getElementById('n_cores').max = max_cores
        document.getElementById('n_cores').value = Math.min(max_cores, document.getElementById('n_cores').value);

    } else {
        if (! document.getElementById('cores_block').classList.contains("hidden")) {
            document.getElementById('cores_block').classList.add('hidden');
        }
    }

    if (formData.get('partition') == 'es1_v100' || formData.get('partition') == 'es1_a40' || formData.get('partition') == 'es0_2080ti' || formData.get('partition') == 'es1_h100') {
        document.getElementById('gpus_block').classList.remove('hidden');

        if (formData.get('partition') == 'es0_2080ti') {
            document.getElementById('n_gpus').max = 4;
            document.getElementById('n_gpus').value = Math.min(4, document.getElementById('n_gpus').value);
            document.getElementById('n_cores').value = document.getElementById('n_gpus').value * 2;
        }
        if (formData.get('partition') == 'es1_v100') {
            document.getElementById('n_gpus').max = 2;
            document.getElementById('n_gpus').value = Math.min(2, document.getElementById('n_gpus').value);
            document.getElementById('n_cores').value = document.getElementById('n_gpus').value * 4;
        }
        if (formData.get('partition') == 'es1_a40') {
            document.getElementById('n_gpus').max = 4;
            document.getElementById('n_gpus').value = Math.min(4, document.getElementById('n_gpus').value);
            document.getElementById('n_cores').value = document.getElementById('n_gpus').value * 16;
        }
        if (formData.get('partition') == 'es1_h100') {
          document.getElementById('n_gpus').max = 8;
          document.getElementById('n_gpus').value = Math.min(8, document.getElementById('n_gpus').value);
          document.getElementById('n_cores').value = document.getElementById('n_gpus').value * 14;
      }        

    } else {
        if (! document.getElementById('gpus_block').classList.contains("hidden")) {
            document.getElementById('gpus_block').classList.add('hidden');
        }
    }

    e = document.getElementById('qos');
    
    if(e.value == 'debug') {
        document.getElementById('n_nodes').max = 4;
    }
    else if(formData.get('partition').startsWith('lr_bigmem')) {
        document.getElementById('n_nodes').max = 2;
    } else if(formData.get('partition').startsWith('es1')) {
        document.getElementById('n_nodes').max = 20;
    } else if(formData.get('partition').startsWith('es0')) {
        document.getElementById('n_nodes').max = 15;
    } else {
        document.getElementById('n_nodes').max = 32;
    }
    document.getElementById('n_nodes').value = Math.min(document.getElementById('n_nodes').max, document.getElementById('n_nodes').value);

    /*
    if(e.value == 'condo') {
        document.getElementById('condo_block').classList.remove('hidden');
    } else {
        if (! document.getElementById('condo_block').classList.contains("hidden")) {
            document.getElementById('condo_block').classList.add('hidden');
        }
    }
    */

    // handle hours, seconds etc

    e = document.getElementById('qos');

    if(e.value != 'debug') {
        document.getElementById('hours_block').classList.remove('hidden');

        e = document.getElementById('hours');

        if(e.value == 72) {
            if (! document.getElementById('minutes_block').classList.contains("hidden")) {
                document.getElementById('minutes').value = 0;
                document.getElementById('seconds').value = 0;
                document.getElementById('minutes_block').classList.add('hidden');
            }
            if (! document.getElementById('seconds_block').classList.contains("hidden")) {
                document.getElementById('seconds_block').classList.add('hidden');
            }
        } else {
            document.getElementById('minutes_block').classList.remove('hidden');
            document.getElementById('seconds_block').classList.remove('hidden');
        }

    } else {
        if (! document.getElementById('hours_block').classList.contains("hidden")) {
            document.getElementById('hours_block').classList.add('hidden');
        }
    }

    lrc_calc_run();

}

// calculate

function lrc_calc_run() {

    var script = "#!/bin/bash\n#\n";

    const form = document.getElementById("form");
    const submitter = document.getElementById("submit");
    const formData = new FormData(form, submitter);

    var options = []
    var cmd_options = []
    var batch_options = []
    var env = []

    if(formData.get('account')) {
        options.push(`--account=${formData.get('account')}`);
    }

    var jobname = formData.get('jobname');
    if (jobname) {
        options.push(`--job-name=${jobname}`);
    }

    var email = formData.get('email');
    if (email) {
        options.push(`--mail-user=${email}`);
        options.push('--mail-type=ALL');
    }

    var n_cores = 0;
    n_cores = parseInt(formData.get('n_cores'));
    n_gpus = parseInt(formData.get('n_gpus'));
    n_nodes = parseInt(formData.get('n_nodes'));

    var partition = formData.get('partition');

    // parse out the number of cores and ram if partition is not lr_bigmem or es1
    if (partition != 'lr_bigmem' && ! partition.startsWith('es1') && ! partition.startsWith('es0')) {
        var partition_base = partition.split('_')[0];
        var partition_cores = partition.split('_')[1];
        var req_ram = parseInt(partition.split('_')[2]);

        options.push('--partition=' + partition_base);

        if (partition_base == 'lr7' || partition_base == 'lr8') {
            options.push(`--mincpus=${n_cores}`);
        } else {
            options.push('--mincpus=' + partition_cores);
            n_cores = parseInt(partition_cores);
        }

        // minimum memory with some buffer for reserved memory / unavailable 
        options.push('--mem=' + (req_ram - Math.ceil(req_ram/64) * 2) + 'G');
    } else {

        if(partition.startsWith('lr_bigmem')) {
            options.push(`--partition=lr_bigmem`);
            n_cores = 32;
        }
        else if(partition.startsWith('es1')) {
            options.push(`--partition=es1`);

            if(partition == 'es1_v100') {
                options.push(`--gres=gpu:V100:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*4}`);
                n_cores = n_gpus*4;
            } else if(partition == 'es1_a40') {
                options.push(`--gres=gpu:A40:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*16}`);
                n_cores = n_gpus*16;
            } else if(partition == 'es1_h100') {
                options.push(`--gres=gpu:H100:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*14}`);
                n_cores = n_gpus*14;
            }
        }
        else if(partition.startsWith('es0')) {
            options.push(`--partition=es0`);
            options.push(`--gres=gpu:${n_gpus}`);
            options.push(`--mincpus=${n_gpus*2}`);
            n_cores = n_gpus*2;
        } else {
            return; // partition not found or not specified, return here...
        }

    }

    if(n_nodes > 0) {
        options.push(`--nodes=${n_nodes}`);
    } else {
        return; // nodes must be positive
    }

    var contiguous = formData.get('contiguous');
    if(contiguous && n_nodes > 1) {
        options.push(`--contiguous`);
    }

    var qos = formData.get('qos');
    var prefix = '';
    if(partition.startsWith('lr')) {
        if(partition.startsWith('lr6') && qos == 'lowprio') {
            prefix = 'lr6';
        } else if(partition.startsWith('lr8') {
            prefix = 'lr8';
        } else {
            prefix = 'lr';
        }
    } else if(partition.startsWith('es1') || partition.startsWith('es0')) {
        prefix = 'es';
    }
    if(qos == 'normal') {
        options.push(`--qos=${prefix}_normal`);
    } else if(qos == 'debug') {
        options.push(`--qos=${prefix}_debug`);
    } else if(qos == 'lowprio') {
        options.push(`--qos=${prefix}_lowprio`);
    } else if(qos == 'other') {
        var qos_other = formData.get('qos_other');
        if(qos_other) {
            options.push(`--qos=${qos_other}`);
        } else {
            // condo is required
            return;
        }
    }

    // thread binding options
    var n_tasks = parseInt(formData.get('n_tasks'));
    if(n_tasks) {
        options.push(`--ntasks-per-node=${n_tasks}`);
    }

    var n_threads = parseInt(formData.get('n_threads'));
    if(n_threads) {
        env.push(`OMP_NUM_THREADS=${n_threads}`);
        env.push(`OMP_PLACES=threads`);
        options.push(`--cpus-per-task=${n_threads}`);
    }

    var binding = formData.get('binding');
    if(binding) {
        if(binding == 'spread') {
            env.push(`OMP_PROC_BIND=spread`);
        } else if(binding == 'close') {
            env.push(`OMP_PROC_BIND=close`);
        }
    }

    // job info

    // jobname is at the top
    // qos already dealt with

    var hours = parseInt(formData.get('hours'));
    var minutes = parseInt(formData.get('minutes'));
    var seconds = parseInt(formData.get('seconds'));

    if(qos == 'debug') {
        if(hours > 0) {
            hours = 0;
            minutes = 60;
            seconds = 0;
        }
        if(minutes==60) {
            hours = 1;
            minutes = 0;
            seconds = 0;
        }
    } else {
        if(hours == 72) {
            minutes=0;
            seconds=0;
        }
        if(minutes == 60) {
            minutes = 0;
            hours += 1;
        }
    }

    options.push(`--time=${hours}:${minutes}:${seconds}`);

    if(formData.get('requeue') && qos == 'lowprio') {
        batch_options.push('--requeue');
    }

    if(formData.get('contiguous') && n_nodes > 1) {
        options.push('--contiguous');
    }

    if(formData.get('label')) {
        cmd_options.push('--label');
    }

    if(formData.get('killbad')) {
        cmd_options.push('--kill-on-bad-exit');
    }
    batch_options.push('--kill-on-invalid-dep=yes');

    if(formData.get('quit')) {
        cmd_options.push('--quit-on-interrupt');
    }

    if(formData.get('verbose')) {
        options.push('--verbose');
    }

    var su_free = 0;
    var su_ratio = 1.0;
    
    if (partition.startsWith('lr4')) {
        n_cores = Math.min(Math.max(n_cores, 24), 24);  
        su_free=1;
        su_ratio=0.0;
    } else if(qos == 'lowprio') {
        su_free=1;
        su_ratio = 0.0;
    } else if(partition.startsWith('lr5')) {
        n_cores = Math.min(Math.max(n_cores, 20), 28);
        su_ratio = 0.5;
    } else if(partition.startsWith('lr6')) {
        n_cores = Math.min(Math.max(n_cores, 32), 40);
        su_ratio = 0.75;
    } else if(partition.startsWith('lr7')) {
        n_cores = Math.min(Math.max(n_cores, 1), 56);
        su_ratio = 1.0;
    } else if(partition.startsWith('lr8')) {
        n_cores = Math.min(Math.max(n_cores, 1), 128);
        su_ratio = 1.0;
    } else if(partition.startsWith('lr_bigmem')) {
        n_cores = Math.min(Math.max(n_cores, 32), 32);
        su_ratio = 1.5;
    } else if(partition.startsWith('cf1')) {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.4;
    } else if(partition.startsWith('cm1')) {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.75;
    } else if(partition.startsWith('ood_inter')) {
        su_ratio = 1.0;
        n_cores = 1;
    } else if(partition.startsWith('es1')) {
        su_ratio = 1.0;
    } else if(partition.startsWith('es0')) {
        su_ratio = 0.0;
        su_free=1;
    }

    e = document.getElementById("su_cost");
    if(su_free==1) {
        e.innerHTML = 'FREE';
    } else {
        var su_cost = Math.ceil(su_ratio*n_cores*n_nodes*(hours + (minutes/60.0) + (seconds/3600.0)));
        e.innerHTML = `${su_cost}`;
    }

    slurm_script = '';

    var j = 3;
    e = document.getElementById("batch_file");

    e.innerHTML = '<div class="btn m-2 absolute top-0 right-0" onclick="lrc_copy_slurm_script()">Copy</div>';

    e.innerHTML += `<pre data-prefix="1">#!/bin/bash</code></pre>\n`;
    slurm_script += "#!/bin/bash\n";

    e.innerHTML += `<pre data-prefix="2"><code></code></pre>\n`;
    slurm_script += "\n";

    for(i of options) {
        e.innerHTML += `<pre data-prefix="${j}"><code>#SBATCH ${i}</code></pre>`; 
        slurm_script += `#SBATCH ${i}\n`;
        j += 1;
    }
    for(i of batch_options) {
        e.innerHTML += `<pre data-prefix="${j}"><code>#SBATCH ${i}</code></pre>`; 
        slurm_script += `#SBATCH ${i}\n`;
        j += 1;
    }
    e.innerHTML += `<pre data-prefix="${j}"><code></code></pre>\n`;
    slurm_script += `\n`;
    j += 1;
    if (env.length > 0) {
        for (v of env) {
            e.innerHTML += `<pre data-prefix="${j}"><code>export ${v}</code></pre>\n`;
            slurm_script += `export ${v}\n`;
            j += 1;
        }
        e.innerHTML += `<pre data-prefix="${j}"><code></code></pre>\n`;
        slurm_script += '\n';
        j += 1;
    }

    commands = document.getElementById("commands").value;

    var cli = "";

    srun_command = "";

    if (commands) {

        var command_lines = commands.split(/\r?\n|\r|\n/g);

        for (line of command_lines) {
            e.innerHTML += `<pre data-prefix="${j}"><code>${line}</code></pre>\n`;
            slurm_script += `${line}\n`;
            j += 1;
        }

        e = document.getElementById("srun_command");
        e.innerHTML = '<div class="btn m-2 absolute top-0 right-0" onclick="lrc_copy_srun_command()">Copy</div>';;

        cli_prefix = '$';
        cli_block = '';
        cmd_indent = '';

        cmd_needs_shell = false;

        // non-empty command lines
        command_lines_nonempty = [];
        for (line of command_lines) {
            if (line && line.trim()) {
                command_lines_nonempty.push(line.trim().replace(/'/g, "\\'"));
            }
            line_trimmed = line.trim();
            if (line_trimmed.includes('|') || line_trimmed.includes('&') || line_trimmed.includes('>')) {
                cmd_needs_shell = true;
            }
        }
        if (command_lines_nonempty.length > 1) {
            cmd_needs_shell = true;
        }

        j = 0;
        if (options.length > 0) {
            for (opt of options) {
                if (j == 0) {
                    cli_block += `<pre data-prefix="${cli_prefix}"><code>${cmd_indent}srun ${opt}`;
                    srun_command += `${cmd_indent}srun ${opt}`;
                } else {
                    cli_block += ` \\</code></pre><pre data-prefix=""><code>    ${opt}`;
                    srun_command += ` \\\n    ${opt}`;
                }
                j += 1;
                cli_prefix = '';
            }
        }

        cmd_options_export = '--export=ALL';
        if (env.length > 0) {
            for (v of env) {
                cmd_options_export += ',';
                cmd_options_export += v;
                j += 1;
            }
            cmd_options.push(cmd_options_export);
        }

        if (cmd_options.length > 0) {
            for (opt of cmd_options) {
                if (j == 0) {
                    cli_block += `<pre data-prefix="${cli_prefix}"><code>${cmd_indent}srun ${opt}`;
                    srun_command += `${cmd_indent}srun ${opt}`;
                } else {
                    cli_block += ` \\</code></pre><pre data-prefix=""><code>    ${opt}`;
                    srun_command += ` \\\n    ${opt}`;
                }
                j += 1;
                cli_prefix = '';
            }
        }
        if (options.length > 0 || cmd_options > 0) {
            cli_block += ` \\</code></pre>`;
            srun_command += ` \\\n`;
        }

        j = 0;
        multi_line_cmd = false;
        for (line of command_lines_nonempty) {
            if (cmd_needs_shell) {
                if (j == 0) {
                    cli_block += `<pre data-prefix="${cli_prefix}"><code>    /bin/bash -c '${line}`;
                    srun_command += `    /bin/bash -c '${line}`;
                } else {
                    if (! multi_line_cmd) {
                        cli_block += ';';
                        srun_command += ';';
                    }
                    cli_block += `</code></pre><pre data-prefix=""><code>    ${line}`;
                    srun_command += `\n    ${line}`;
                }
            } else {
                if (j == 0) {
                    cli_block += `<pre data-prefix="${cli_prefix}"><code>    ${line}`;
                    srun_command += `    ${line}`;
                } else {
                    if (! multi_line_cmd) {
                        cli_block += ';';
                        srun_command += ';';
                    }
                    cli_block += `</code></pre><pre data-prefix=""><code>    ${line}`;
                    srun_command += `\n    ${line}`;
                }
            }
            if (line.trim().endsWith('\\')) {
                multi_line_cmd = true;
            } else {
                multi_line_cmd = false;
            }
            j += 1;
        }
        if (cmd_needs_shell) {
            cli_block += '\'';
            srun_command += '\'';
        }
        cli_block += `</code></pre>`;
        srun_command += '\n';

        e.innerHTML += cli_block;

    }

    localStorage.clear();
    for ( [key, value] of formData.entries()) {
        localStorage.setItem(key, value);
    }

    for (key of checkboxes) {
        if(document.getElementById(key).checked == true) {
            localStorage.setItem(key, 'on');
        } else {
            localStorage.setItem(key, 'off');
        }
    }

}

function lrc_copy_slurm_script() {

     // Copy the text inside the text field
    navigator.clipboard.writeText(slurm_script);

}

function lrc_copy_srun_command() {

    navigator.clipboard.writeText(srun_command);

}

