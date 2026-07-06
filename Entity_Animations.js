// ----- zombie -----
const zombie = {
    loop: true,
    animationDurationMs: 800,
    nodeAnimations: {
        TorsoNode: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, 0] } },
                { timeFraction: 0.3, rotation: { point: [0.15, 0.15, 0.15] } },
                { timeFraction: 0.6, rotation: { point: [-0.15, -0.15, -0.15] } },
                { timeFraction: 1, rotation: { point: [0, 0, 0] } }
            ]
        },

        LegRightMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, 0] } },
                { timeFraction: 0.3, rotation: { point: [0.12, 0.12, 0.12] } },
                { timeFraction: 0.6, rotation: { point: [-0.12, -0.12, -0.12] } },
                { timeFraction: 1, rotation: { point: [0, 0, 0] } }
            ]
        },

        LegLeftMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, 0] } },
                { timeFraction: 0.3, rotation: { point: [-0.12, -0.12, -0.12] } },
                { timeFraction: 0.6, rotation: { point: [0.12, 0.12, 0.12] } },
                { timeFraction: 1, rotation: { point: [0, 0, 0] } }
            ]
        },

        ArmLeftMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [-1.57, 0, 0] } },
                { timeFraction: 1, rotation: { point: [-1.57, 0, 0] } }
            ]
        },

        ArmRightMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [-1.57, 0, 0] } },
                { timeFraction: 1, rotation: { point: [-1.57, 0, 0] } }
            ]
        }
    }
};

api.animateEntity(playerId, zombie, 0, 1);


// ----- take off -----
const rad = (degree) => {
    return degree * Math.PI / 180;
};

const take_off = {
    loop: true,
    animationDurationMs: 300,

    nodeAnimations: {
        TorsoNode: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, 0] } },
                { timeFraction: 0.25, rotation: { point: [0, rad(90), 0] } },
                { timeFraction: 0.5, rotation: { point: [0, rad(180), 0] } },
                { timeFraction: 0.75, rotation: { point: [0, rad(270), 0] } },
                { timeFraction: 1, rotation: { point: [0, rad(360), 0] } },
            ]
        },

        ArmLeftMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, rad(90)] } },
                { timeFraction: 1, rotation: { point: [0, 0, rad(90)] } },
            ]
        },

        ArmRightMesh: {
            timeline: [
                { timeFraction: 0, rotation: { point: [0, 0, -rad(90)] } },
                { timeFraction: 1, rotation: { point: [0, 0, -rad(90)] } },
            ]
        },
    }
};

api.animateEntity(playerId, take_off, 0, 1);
