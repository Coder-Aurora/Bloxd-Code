// ----- function tools -----
var txt = {
    local: (playerId, ...msg) => {
        api.sendMessage(playerId, [
            { icon: 'fa-solid fa-gear', style: { color: '#ff99cc' } },
            { str: ' [ ', style: { color: '#74b1ff' } },
            { str: 'AURORA_LOCAL_PRINT', style: { color: '#6c5ce7' } },
            { str: ' ] ', style: { color: '#74b1ff' } },
            { str: ': ', style: { color: '#4facfe' } },
            { str: msg.join(', '), style: { color: '#9d8cff' } },
        ]);
    },
    global: (...msg) => {
        api.broadcastMessage([
            { icon: 'fa-solid fa-user-astronaut', style: { color: '#ff99cc' } },
            { str: ' [ ', style: { color: '#74b1ff' } },
            { str: 'AURORA_GLOBAL', style: { color: '#b19cd9' } },
            { str: ' ]', style: { color: '#74b1ff' } },
            { str: ': ', style: { color: '#4facfe' } },
            { str: msg.join(', '), style: { color: '#9d8cff' } },
        ]);
    },
    local_warn: (playerId, ...msg) => {
        api.sendMessage(playerId, [
            { icon: 'fa-solid fa-triangle-exclamation', style: { color: '#ff99cc' } },
            { str: ' [ ', style: { color: '#74b1ff' } },
            { str: 'AURORA_LOCAL_WARNING', style: { color: '#ff6eb4' } },
            { str: ' ] ', style: { color: '#74b1ff' } },
            { str: ' : ', style: { color: '#4facfe' } },
            { str: msg.join(', '), style: { color: '#ed5f5f' } },
        ]);
    },
    global_warn: (...msg) => {
        api.broadcastMessage([
            { icon: 'fa-solid fa-user-unlock', style: { color: '#ff99cc' } },
            { str: ' [ ', style: { color: '#74b1ff' } },
            { str: 'AURORA_WARNING', style: { color: '#ff6eb4' } },
            { str: ' ] ', style: { color: '#74b1ff' } },
            { str: ' : ', style: { color: '#4facfe' } },
            { str: msg.join(', '), style: { color: '#ed5f5f' } },
        ]);
    },
};


// ----- definition -----
const allowedPlayers = ['Coder_Aurora'];

const chestPoses = [
    [-768, 26, 799],
    [-768, 26, 783],
    [-768, 26, 772],
    [-739, 26, 772],
    [-739, 26, 786],
    [-739, 31, 799],
    [-739, 41, 799]
];

const chestItems = ['Gold Coin', 'Apple', 'Book', 'Board'];

const canSendCmd = (playerId = null, playerName = null) => {
    if (playerId) {
        return allowedPlayers.includes(api.getEntityName(playerId));
    } else if (playerName) {
        return allowedPlayers.includes(playerName);
    }

    return false;
};

const randomNum = (maxSize, canBeZero = true) => {
    if (canBeZero) {
        return Math.abs(Math.round(Math.random() * maxSize));
    } else {
        let value;

        do {
            value = Math.abs(Math.round(Math.random() * maxSize));
        } while (value === 0);

        return value;
    }
};

const randomElement = (arr) => {
    if (arr.length !== 0) {
        return arr[randomNum(arr.length - 1)];
    }

    return false;
};

const isCanAddItems = (chestPos, maxItemSlot = 3) => {
    const freeItemSlots = api.getStandardChestFreeSlotCount(chestPos);

    if (36 - freeItemSlots > maxItemSlot) {
        return false;
    }

    return true;
};

const isCanRefresh = () => {
    if (api.getLobbyDbValue('chestRefresh') === 'open') {
        return true;
    }

    return false;
}

const generateNormalChestItem = (position, itemMaxNumber, particularItem = null, particularItemAttributes = null) => {
    const playerId = api.getPlayerId('Coder_Aurora') || randomElement(api.getPlayerIds());

    for (let i = 1; i <= randomNum(itemMaxNumber, false); ++i) {
        if (particularItem) {
            api.setStandardChestItemSlot(position, randomNum(35), particularItem,
                randomNum(itemMaxNumber), playerId, particularItemAttributes);
        } else {
            api.setStandardChestItemSlot(position, randomNum(35), randomElement(chestItems), randomNum(itemMaxNumber));
        }
    }
};


// ----- World Callbacks -----
onPlayerJoin = (playerId, fromReset) => {
    if (fromReset) {
        api.setLobbyDbValue('chestRefresh', 'close');
    }
}


onPlayerChat = (playerId, chatMessage, chnName) => {
    const trimmed = chatMessage.trim();
    const cmd = trimmed.split(/\s+/);
    const prefix = cmd[0][0];
    const command = cmd[0].slice(1);

    if (prefix === '#') {
        if (!canSendCmd(playerId)) return true;

        if (command === 'toggleRefresh') {
            if (api.getLobbyDbValue('chestRefresh') === 'close') {
                api.setLobbyDbValue('chestRefresh', 'open');
                txt.local(playerId, 'Chest refresh opened');
            } else {
                api.setLobbyDbValue('chestRefresh', 'close');
                txt.local(playerId, 'Chest refresh closed');
            }
        } else if (command === 'clearChestItems') {
            chestPoses.forEach(chestPos => {
                for (let i = 0; i <= 35; ++i) {
                    api.setStandardChestItemSlot(chestPos, i, 'Air');
                }
            });

            txt.local(playerId, `All the chest items have been cleared`);
        } else {
            txt.local_warn(playerId, 'Invalid command!');
        }

        return false;
    }
};


const delay = 20;     // seconds
let lastTickTime = api.now();

tick = (ms) => {
    if (api.now() - lastTickTime >= delay * 1000) {
        if (isCanRefresh()) {
            txt.global('Start chest refresh');

            chestPoses.forEach(chestPos => {
                if (isCanAddItems(chestPos)) {
                    const randomItem = randomElement(chestItems);
                    randomItem === 'Board'
                        ? generateNormalChestItem(chestPos, 2, randomItem, { customDisplayName: 'Key' })
                        : generateNormalChestItem(chestPos, 2);
                }
            });
        }

        lastTickTime = api.now();
    }
};
