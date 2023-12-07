
// calculate

function calculate_lrc_cost(partition, n_nodes, n_cores, n_gpus, gpu_type, qos, hours, minutes) {

    var su_free = 0;
    var su_ratio = 1.0;
    
    if (partition == 'lr3') {
        n_cores = Math.min(Math.max(n_cores, 16), 20);  // can be up to 28
        su_free=1;
        su_ratio=0.0;
    } else if(qos == 'lowprio' || qos == 'debug') {
        su_free=1;
        su_ratio = 0.0;
    } else if(partition == 'lr4') {
        // min cores
        n_cores = Math.max(n_cores, 24);
        su_ratio = 0.5;
        Math.max(n_cores, 24)
    } else if(partition == 'lr5') {
        n_cores = Math.min(Math.max(n_cores, 20), 28);
        su_ratio = 0.75;
    } else if(partition == 'lr6') {
        n_cores = Math.min(Math.max(n_cores, 32), 40);
        su_ratio = 1.0;
    } else if(partition == 'lr7') {
        n_cores = Math.min(Math.max(n_cores, 1), 56);
        su_ratio = 1.0;
    } else if(partition == 'lr_bigmem') {
        n_cores = Math.min(Math.max(n_cores, 32), 32);
        su_ratio = 1.5;
    } else if(partition == 'cf1') {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.4;
    } else if(partition == 'cm1') {
        n_cores = Math.min(Math.max(n_cores, 64), 64);
        su_ratio = 0.4;
    } else if(partition == 'ood_inter') {
        su_ratio = 1.0;
        n_cores = 1;
    } else if(partition == 'es1') {
        if(gpu_type == 'a40') {
            n_cores = Math.min(Math.min(n_cores, 16*n_gpus), 64);
        } else if(gpu_type == 'rtx2080' || gpu_type == 'v100') {
            n_cores = Math.min(Math.min(n_cores, 4*n_gpus), 8);
        } else {
            n_cores = Math.min(Math.max(n_cores, 4), 64);
        }
        su_ratio = 1.0;
    }

    return su_ratio

}

