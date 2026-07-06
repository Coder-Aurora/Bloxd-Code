const applyOppsiteImpulse = (playerId, impulse = 5) => {
    if (playerId) {
        const facingInfo = api.getPlayerFacingInfo(playerId);
        const [dx, dy, dz] = facingInfo?.dir;
        const impulseVec = [
            -dx * impulse,
            3,
            -dz * impulse
        ];

        api.applyImpulse(playerId, ...impulseVec);

        return true;
    }

    return false;
};

const damage = (attacker, damager, damageDealt = 2) => {
    const health = api.getHealth(damager) - damageDealt;
    api.setHealth(damager, health, { lifeformId: attacker, withItem: api.getHeldItem(attacker)?.name }, false);
    applyOppsiteImpulse(playerId);
};

damage(api.getPlayerId('Coder_Aurora'), playerId);
