// ===== declaration & initialization =====
// msg
var txt = {
    global: function (...global_msg) {
        api.broadcastMessage([
            { icon: "fa-solid fa-user-astronaut", style: { color: "#ff99cc" } },
            { str: " [ ", style: { color: "#74b1ff" } },
            { str: "AURORA_GLOBAL", style: { color: "#b19cd9" } },
            { str: " ]", style: { color: "#74b1ff" } },
            { str: ": ", style: { color: "#4facfe" } },
            { str: global_msg.join(", ") || '', style: { color: "#9d8cff" } }
        ]);
    },

    // Send a styled private message to a single player
    local: function (playerId, ...local_msg) {
        api.sendMessage(playerId, [
            { icon: "fa-solid fa-gear", style: { color: "#ff99cc" } },
            { str: " [ ", style: { color: "#74b1ff" } },
            { str: "AURORA_LOCAL_PRINT", style: { color: "#6c5ce7" } },
            { str: " ] ", style: { color: "#74b1ff" } },
            { str: ": ", style: { color: "#4facfe" } },
            { str: local_msg.join(", ") || '', style: { color: "#9d8cff" } }
        ]);
    },

    // Send a styled warning to a single player
    local_warn: function (playerId, ...local_warn_msg) {
        api.sendMessage(playerId, [
            { icon: "fa-solid fa-triangle-exclamation", style: { color: "#ff99cc" } },
            { str: " [ ", style: { color: "#74b1ff" } },
            { str: "AURORA_LOCAL_WEARING", style: { color: "#ff6eb4" } },
            { str: " ] ", style: { color: "#74b1ff" } },
            { str: " : ", style: { color: "#4facfe" } },
            { str: local_warn_msg.join(", ") || '', style: { color: "red" } }
        ]);
    },

    // Broadcast a styled warning to all players
    global_warn: function (...global_warn_msg) {
        api.broadcastMessage([
            { icon: "fa-solid fa-user-unlock", style: { color: "#ff99cc" } },
            { str: " [ ", style: { color: "#74b1ff" } },
            { str: "AURORA_WEARING", style: { color: "#ff6eb4" } },
            { str: " ] ", style: { color: "#74b1ff" } },
            { str: " : ", style: { color: "#4facfe" } },
            { str: global_warn_msg.join(", ") || '', style: { color: "red" } }
        ]);
    },
};

// builder helper
var builderHelper = {
    // line
    line: function (pos1, pos2, blockType = 'White Wool') {
        const [x1, y1, z1] = pos1;
        const [x2, y2, z2] = pos2;
        const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        const maxStep = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
        if (maxStep === 0) {
            api.setBlock(Math.round(x1), Math.round(y1), Math.round(z1), blockType);
            return;
        }
        for (let i = 0; i <= maxStep; i++) {
            const t = i / maxStep;
            const curX = Math.round(x1 + dx * t);
            const curY = Math.round(y1 + dy * t);
            const curZ = Math.round(z1 + dz * t);
            api.setBlock(curX, curY, curZ, blockType);
        }
    },

    // thickness controls how many blocks around the exact radius are accepted
    circle: function (cx, cy, cz, radius, block = 'White Wool', thickness = 0.6) {
        const minX = Math.floor(cx - radius);
        const maxX = Math.floor(cx + radius);
        const minZ = Math.floor(cz - radius);
        const maxZ = Math.floor(cz + radius);
        for (let x = minX; x <= maxX; x++) {
            for (let z = minZ; z <= maxZ; z++) {
                const dx = x - cx;
                const dz = z - cz;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (Math.abs(dist - radius) <= thickness) api.setBlock(x, cy, z, block);
            }
        }
    },
};


// List of player names that are allowed to fuck Donald Trump
const allowedPlayers = [];

// Store per-player state, indexed by player name
const playerInfo = {};

// initialize the builder information
const createBuilderInfo = () => ({
    // Two corner positions for region-based operations
    pos1: [null, null, null],
    pos2: [null, null, null],
    // Lock flag used for large operations to avoid accidental repeats
    largeRangeLock: false,
});

// check if a position array contains three finite numeric coordinates
const isPositionSet = (pos) => Array.isArray(pos) && pos.every((c) => Number.isFinite(c));

// Get the builderInfo for a player name (create if missing). Returns null when not allowed.
const getOrCreateBuilder = (playerId) => {
    const pName = api.getEntityName(playerId);
    if (!allowedPlayers.includes(pName)) return null;
    if (!playerInfo[pName]) playerInfo[pName] = { builderInfo: createBuilderInfo() };
    return playerInfo[pName].builderInfo;
};

// Compute inclusive integer bounds for two positions. Useful for iterating over a cuboid.
const getBounds = (pos1, pos2) => ({
    start: [Math.min(pos1[0], pos2[0]), Math.min(pos1[1], pos2[1]), Math.min(pos1[2], pos2[2])],
    end: [Math.max(pos1[0], pos2[0]), Math.max(pos1[1], pos2[1]), Math.max(pos1[2], pos2[2])],
});

// Check if a player is in lobby
const isInLobby = (targetPlayerId = null, entityName = null) => {
    if (targetPlayerId) {
        return api.getPlayerIds().includes(targetPlayerId);
    } else if (entityName) {
        const playerNames = api.getPlayerIds().map(playerId => api.getEntityName(playerId));
        return playerNames.includes(entityName);
    }
};

// Check if a player can send command
const canSendCmd = (targetPlayerId = null, entityName = null) => {
    const onlineAlloweds = [];
    for (const pName of allowedPlayers) {
        if (isInLobby(null, pName)) {
            onlineAlloweds.push(pName);
        }
    }

    if (targetPlayerId) {
        const onlineAllowedsIds = onlineAlloweds.map(name => api.getPlayerId(name));
        return onlineAllowedsIds.includes(targetPlayerId);
    }
    else if (entityName) {
        return onlineAlloweds.includes(entityName);
    }
    else {
        txt.local_warn(playerId, 'Plz enter name or id');
    }
};


// ===== world callbacks =====
onPlayerJoin = (playerId, fromReset) => {
    const pName = api.getEntityName(playerId);
    // settings for all players
    api.setClientOptions(playerId, {
        flySpeedMultiplier: 2,
    });

    // settings for allowedPlayers
    if (canSendCmd(null, pName)) {
        playerInfo[pName] = { builderInfo: createBuilderInfo() };

        // shop initialization
        api.configureShopCategory("builder_helper", {
            autoSelectCategory: false,
            customTitle: "Builder Helper",
            sortPriority: 10,
            redDot: false
        });

        // set blocks under feet
        api.createShopItemForPlayer(playerId, "builder_helper", "Set Block", {
            image: "fa-solid fa-cubes",
            imageColour: "#cef3ff",
            canBuy: true,
            cost: 0,
            buyButtonText: "Set",
            description: "Put a block under ur feet",
            userInput: {
                type: "text",
                initialValue: "Grass Block",
                wordCharsOnly: false
            }
        });
    }
    // settings for normal players
    else {
        api.setClientOptions(playerId, {
            canChange: false,
            cantChangeError: [{ str: `You don't have access!🪿`, style: { colour: '#fff380' } }],
            useInventory: false,
        });
    }
};


onPlayerBoughtShopItem = (playerId, categoryKey, itemKey, item, userInput) => {
    if (categoryKey === "builder_helper") {
        if (itemKety === 'Set Block') {
            const [px, py, pz] = api.getPosition(playerId);

            if (api.getBlock(px, py - 1, pz) !== 'Air') {
                txt.local_warn(playerId, "There's already a block under ur feet!");
                return;
            }

            try {
                api.setBlock(px, py - 1, pz, String(userInput));
                txt.local(playerId, `Succeessfully generated block at [${px}, ${py - 1}, ${pz}]`);
            } catch (err) {
                txt.local_warn(playerId, "Invalid block name!!");
            }
        }
    }
};


onPlayerChat = (playerId, chatMessage, chn) => {
    const pName = api.getEntityName(playerId);

    // cmd
    const trimmed = chatMessage.trim();
    const cmd = trimmed.split(' ');
    const type = cmd[0].slice(1).toLowerCase();
    const builder = getOrCreateBuilder(playerId);

    // starts with '#' (builder cmd)
    if (cmd[0].startsWith('#')) {
        if (!canSendCmd(null, pName)) return true;

        if (type === 'pos1' || type === 'pos2') {
            if (cmd.length !== 2) {
                txt.local_warn(playerId, 'Invalid command!');
                return;
            }

            const block = cmd[1].split('_').join(' ');
            const [x, y, z] = api.getPosition(playerId);

            builder[type] = [x, y - 1, z];
            txt.local(playerId, `Successfully set ${type} at [${x}, ${y - 1}, ${z}]`);
        }
        else if (type === 'line') {
            if (!isPositionSet(builder.pos1) || !isPositionSet(builder.pos2)) {
                txt.local_warn(playerId, 'Please set both pos1 and pos2 first.');
                return;
            } else if (cmd.length !== 2) {
                txt.local_warn(playerId, 'Invalid command!');
                return;
            }

            const block = cmd[1].split('_').join(' ');
            // gen line
            builderHelper.line(builder.pos1, builder.pos2, block);
            txt.local(playerId, 'Successfully gen line');
        }
        else if (type === 'replace') {
            builder.largeRangeLock = true;

            // Ensure both corners are set and the command has correct arguments
            if (!isPositionSet(builder.pos1) || !isPositionSet(builder.pos2)) {
                txt.local_warn(playerId, 'Please set both pos1 and pos2 first.');
                return;
            }
            if (cmd.length !== 3) {
                txt.local_warn(playerId, 'Invalid command!');
                return;
            }

            const fromBlock = cmd[1].split('_').join(' ');
            const toBlock = cmd[2].split('_').join(' ');
            const pos = getBounds(builder.pos1, builder.pos2);

            // Iterate the inclusive bounds and replace blocks.
            for (let x = pos.start[0]; x <= pos.end[0]; ++x) {
                for (let y = pos.start[1]; y <= pos.end[1]; ++y) {
                    for (let z = pos.start[2]; z <= pos.end[2]; ++z) {
                        if (fromBlock === toBlock) continue;
                        api.setBlock(x, y, z, toBlock);
                    }
                }
                txt.local(playerId, `${x / pos.end * 100}% have been finished`);
            }
            txt.local(playerId, 'Successfully replaced block!');
            builder.largeRangeLock = false;
        }
        else {
            txt.local_warn(playerId, 'Invalid command!');
            return false;
        }
        return false;
    }
    // starts with '$' (cmd for managing)
    else if (cmd[0].startsWith('$')) {
        if (!canSendCmd(null, pName)) return true;

        if (type === 'kick') {
            const targetPlayerName = cmd[1];

            if (!targetPlayerName || !isInLobby(null, targetPlayerName)) {
                txt.local_warn(playerId, `Invalid player name: ${targetPlayerName} | Player is not in lobby. Please check your command.`);
                return;
            }
            // Kick the target player
            api.kickPlayer(api.getPlayerId(targetPlayerName), 'You were kicked by yourself😒😒');
        }
        return false;
    }
    // starts with '@' (send msg to target player)
    else if (cmd[0].startsWith('@')) {
        const targetPlayerName = cmd[0].slice(1);
        const msg = cmd[1];

        if (!targetPlayerName || !isInLobby(null, targetPlayerName)) {
            txt.local_warn(playerId, `Invalid player name: ${targetPlayerName} | Player is not in lobby. Please check your command.`);
            return;
        }

        const canSee = [playerId, api.getPlayerId(targetPlayerName)];
        canSee.forEach(pId => {
            api.sendMessage(pId, [
                { icon: 'fa-solid fa-arrows', style: { colour: '#a6e6ff' } },
                { str: `[`, style: { colour: '#a8bccc' } },
                { str: `${api.getEntityName(playerId)} sent a message to you:\n`, style: { colour: '#c8d6ed' } },
                { str: `]`, style: { colour: '#a8bccc' } },
                { str: `${msg || ''}`, style: { colour: '#66ccf2' } },
            ]);
        });
    }

    return true;
};  // return boolean | void | ChatTags | OnPlayerChatObjectResponse


let lastTickTime = api.now();
const delay = 2;  // seconds

tick = (ms) => {
    if (api.now() - lastTickTime < delay * 1000) return;

    lastTickTime = api.now();
};


onPlayerLeave = (playerId, isShuttingDown) => {
    const pName = api.getEntityName(playerId);
    const keys = ['builderInfo'];

    if (canSendCmd(playerId)) {
        keys.forEach(key => {
            delete playerInfo[pName]?.key;
        });
    }
};


onPlayerClick = (playerId, wasAlt, x, y, z, block, targetEId) => {
    const item = api.getHeldItem(playerId);
    const builder = getOrCreateBuilder(playerId);

    if (canSendCmd(playerId) && item !== null && item.name === "Moonstone Axe" && block !== "Air") {
        if (!wasAlt) {
            builder.pos1 = [x, y, z];
            txt.local(playerId, `Successfully set pos1 at [${x}, ${y}, ${z}]`);
        } else if (wasAlt) {
            builder.pos2 = [x, y, z];
            txt.local(playerId, `Successfully set pos2 at [${x}, ${y}, ${z}]`);
        }
    }
};


onBlockStand = (playerId, x, y, z, block) => {
    var impulse = 5;
    const vectors = [[0, 0, -impulse], [-impulse, 0, 0], [0, 0, impulse], [impulse, 0, 0]];
    const blockIds = [253, 254, 255, 256];
    const blockId = api.getBlockId(x, y, z);

    if (blockIds.includes(blockId)) {
        api.applyImpulse(playerId, vectors[blockId - 253][0], vectors[blockId - 253][1], vectors[blockId - 253][2]);
    }
};
