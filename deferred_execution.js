const delayQueue = [];
const loopPool = [];
let delayCounter = 0;
let loopCounter = 0;

var async = {
    delayExecution: (ms, callback) => {
        const id = ++delayCounter;
        const fireAt = Date.now() + ms;

        delayQueue.push({
            id,
            fireAt,
            callback
        });

        return id;
    },

    cancelExecution: (callbackId) => {
        for (let index = 0; index < delayQueue.length; ++index) {
            if (delayQueue[index].id === callbackId) {
                delayQueue.splice(index, 1);
                return true;
            }
        }

        return false;
    },

    setIntervalLoop: (intervalMs, callback) => {
        const loopId = ++loopCounter;
        const runLoop = () => {
            const isExist = loopPool.some(item => item.loopId === loopId);
            if (!isExist) return;

            try {
                callback();
            } catch (err) {
                console.log(`Caught loop error: ${err}`);
            }

            const delayId = async.delayExecution(intervalMs, runLoop);
            const targetItem = loopPool.find(item => item.loopId === loopId);
            if (targetItem) targetItem.delayId = delayId;
        };

        loopPool.push({
            loopId,
            interval: intervalMs,
            callback,
            delayId: null
        });

        runLoop();

        return loopId;
    },

    clearIntervalLoop: (loopId) => {
        const targetIndex = loopPool.findIndex(item => item.loopId === loopId);
        if (targetIndex === -1) return false;

        const loopItem = loopPool[targetIndex];

        if (loopItem.delayId) {
            async.cancelExecution(loopItem.delayId);
        }

        loopPool.splice(targetIndex, 1);

        return true;
    }
};

const processQueue = () => {
    const now = Date.now();
    
    for (let index = delayQueue.length - 1; index >= 0; --index) {
        const item = delayQueue[index];
        if (now >= item.fireAt) {
            try {
                item.callback();
            } catch (err) {
                console.log(`Caught error: ${err}`);
            }
            delayQueue.splice(index, 1);
        }
    }
};

tick = (ms) => {
    processQueue();
};
