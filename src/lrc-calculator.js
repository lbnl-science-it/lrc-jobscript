
function lrc_set_partition(id) {

    var selected = document.querySelector('input[name="partition"]:checked');

    document.getElementById(id).checked=true; 

}

// get form data

function lrc_calc_onchange() {

    const form = document.getElementById("form");
    const submitter = document.getElementById("submit");
    const formData = new FormData(form, submitter);

    if (formData.get('partition') == 'lr7_32' || formData.get('partition') == 'lr7_40') {
        document.getElementById('cores_block').classList.remove('hidden');

        if (formData.get('partition') == 'lr7_32') {
            document.getElementById('n_cores').max = 32
            document.getElementById('n_cores').value = Math.min(32, document.getElementById('n_cores').value);
        }
        else if (formData.get('partition') == 'lr7_40') {
            document.getElementById('n_cores').max = 40
            document.getElementById('n_cores').value = Math.min(40, document.getElementById('n_cores').value);
        }

    } else {
        if (! document.getElementById('cores_block').classList.contains("hidden")) {
            document.getElementById('cores_block').classList.add('hidden');
        }
    }

    if (formData.get('partition') == 'es1_v100' || formData.get('partition') == 'es1_a40' || formData.get('partition') == 'es1_2080ti') {
        document.getElementById('gpus_block').classList.remove('hidden');

        if (formData.get('partition') == 'es1_2080ti') {
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
    var modules = []

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

    var partition = formData.get('partition')
    if(partition) {
        if(partition.startsWith('lr3')) {
            options.push(`--partition=lr3`);

            if(partition == 'lr3_16') {
                n_cores = 16;
                options.push('--mincpus=16');
            } else if(partition == 'lr3_20') {
                n_cores = 20;
                options.push('--mincpus=20');
            }

        }
        else if(partition.startsWith('lr4')) {
            n_cores = 24;
            options.push(`--partition=lr4`);
        }
        else if(partition.startsWith('lr5')) {
            options.push(`--partition=lr5`);
            if(partition == 'lr5_20') {
                n_cores = 20;
                options.push('--mincpus=20');
            } else if(partition == 'lr5_28') {
                n_cores = 28;
                options.push('--mincpus=28');
            }
        }
        else if(partition.startsWith('lr6')) {
            options.push(`--partition=lr6`);
            if(partition == 'lr6_32') {
                n_cores = 32;
                options.push('--mincpus=32');
            } else if(partition == 'lr6_40') {
                n_cores = 40;
                options.push('--mincpus=40');
            }
        }
        else if(partition.startsWith('lr7')) {
            options.push(`--partition=lr7`);
            if (partition == 'lr7_32') {
                options.push('--mem=96GB');
            } else if(partition == 'lr7_40') {
                options.push('--mem=128GB');
            }
            options.push(`--mincpus=${n_cores}`);
        }
        else if(partition.startsWith('lr_bigmem')) {
            options.push(`--partition=lr7`);
            n_cores = 32;
        }
        else if(partition.startsWith('es1')) {
            options.push(`--partition=es1`);

            if(partition == 'es1_v100') {
                options.push(`--gres=gpu:V100:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*4}`);
                n_cores = n_gpus*4;
            } else if(partition == 'es1_2080ti') {
                options.push(`--gres=gpu:GRTX2080TI:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*2}`);
                n_cores = n_gpus*2;
            } else if(partition == 'es1_a40') {
                options.push(`--gres=gpu:A40:${n_gpus}`);
                options.push(`--mincpus=${n_gpus*16}`);
                n_cores = n_gpus*16;
            }
        } else {
            return;
        }
        
    } else { // partition is required
        return;
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
        prefix = 'lr';
    } else if(partition.startsWith('es1')) {
        prefix = 'es';
    }
    if(qos == 'normal') {
        options.push(`--qos=${prefix}_normal`);
    } else if(qos == 'debug') {
        options.push(`--qos=${prefix}_debug`);
    } else if(qos == 'lowprio') {
        options.push(`--qos=${prefix}_lowprio`);
    } else if(qos == 'condo') {
        var condo = formData.get('condo');
        if(condo) {
            options.push(`--qos=condo_${condo}`);
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

    modules = formData.get('modules').split(/\s+/);

    var hours = parseInt(formData.get('hours'));
    var minutes = parseInt(formData.get('minutes'));
    var seconds = parseInt(formData.get('seconds'));

    if(qos == 'debug') {
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
        options.push('-v');
    }

    var su_free = 0;
    var su_ratio = 1.0;
    
    if (partition.startsWith('lr3')) {
        n_cores = Math.min(Math.max(n_cores, 16), 20);  // can be up to 28
        su_free=1;
        su_ratio=0.0;
    } else if(qos == 'lowprio' || qos == 'debug') {
        su_free=1;
        su_ratio = 0.0;
    } else if(partition.startsWith('lr4')) {
        // min cores
        n_cores = Math.max(n_cores, 24);
        su_ratio = 0.5;
        Math.max(n_cores, 24)
    } else if(partition.startsWith('lr5')) {
        n_cores = Math.min(Math.max(n_cores, 20), 28);
        su_ratio = 0.75;
    } else if(partition.startsWith('lr6')) {
        n_cores = Math.min(Math.max(n_cores, 32), 40);
        su_ratio = 1.0;
    } else if(partition.startsWith('lr7')) {
        n_cores = Math.min(Math.max(n_cores, 1), 56);
        su_ratio = 1.0;
    } else if(partition.startsWith('lr_bigmem')) {
        n_cores = Math.min(Math.max(n_cores, 32), 32);
        su_ratio = 1.5;
    } else if(partition.startsWith('cf1')) {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.4;
    } else if(partition.startsWith('cm1')) {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.4;
    } else if(partition.startsWith('ood_inter')) {
        su_ratio = 1.0;
        n_cores = 1;
    } else if(partition.startsWith('es1')) {
        su_ratio = 1.0;
    }

    e = document.getElementById("su_cost");
    if(su_free==1) {
        e.innerHTML = 'FREE';
    } else {
        var su_cost = su_ratio*n_cores*n_nodes*(hours + (minutes/60.0) + (seconds/3600.0));
        console.log(su_cost);
        e.innerHTML = `${su_cost}`;
    }

    var j = 3;
    e = document.getElementById("batch_file");
    e.innerHTML = `<pre data-prefix="1">#!/bin/bash</code></pre>\n`;
    e.innerHTML += `<pre data-prefix="2"><code>#</code></pre>\n`;
    for(i of options) {
        e.innerHTML += `<pre data-prefix="${j}"><code>#SBATCH ${i}</code></pre>`; 
        j += 1;
    }
    for(i of batch_options) {
        e.innerHTML += `<pre data-prefix="${j}"><code>#SBATCH ${i}</code></pre>`; 
        j += 1;
    }
    e.innerHTML += `<pre data-prefix="${j}"><code></code></pre>\n`;
    j += 1;
    e.innerHTML += `<pre data-prefix="${j}"><code>module load ...</code></pre>\n`;
    j += 1;
    e.innerHTML += `<pre data-prefix="${j}"><code></code></pre>\n`;
    j += 1;
    e.innerHTML += `<pre data-prefix="${j}"><code>cmd</code></pre>\n`;


}
