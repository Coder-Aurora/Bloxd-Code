const DELAY_QUEUE = [];
let delay_counter = 1;

var async = {
    delay_execution: (ms, callback) => {
        const ID = ++delay_counter;
        const FIRE_AT = Date.now() + ms;

        DELAY_QUEUE.push({
            ID: ID,
            FIRE_AT: FIRE_AT,
            CALLBACK: callback
        });

        return ID;
    },

    cancel_execution: (callback_id) => {
        for (let idx = 0; idx <= DELAY_QUEUE.length - 1; ++idx) {
            if (DELAY_QUEUE[idx].ID === callback_id) {
                DELAY_QUEUE.splice(idx, 1);

                return true;
            }
        }

        return false;
    }
};

const process_queue = () => {
    const NOW = Date.now();

    for (let idx = DELAY_QUEUE.length - 1; idx >= 0; --idx) {
        const ITEM = DELAY_QUEUE[idx];

        if (NOW >= ITEM.FIRE_AT) {
            try {
                ITEM.CALLBACK();
            } catch (err) {
                console.log(`Caught error: ${err}`);
            }

            DELAY_QUEUE.splice(idx, 1);
        }
    }
};


tick = (ms) => {
    process_queue();
};
