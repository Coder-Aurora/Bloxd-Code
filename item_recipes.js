const trophies = ['Wood Trophy', 'Stone Trophy', 'Iron Trophy', 'Diamond Trophy', 'Moonstone Trophy'];

const trophyRecipes = {
    'Wood Trophy': [
        {
            requires: [
                { items: ['Maple Wood Planks'], amt: 5 },
                { items: ['Iron Bar'], amt: 1 }
            ],
            produces: 5,
            station: 'Workbench',
        }
    ],

    'Stone Trophy': [
        {
            requires: [
                { items: ['Stone'], amt: 8 },
                { items: ['Iron Bar'], amt: 1 }
            ],
            produces: 1,
            station: 'Workbench'
        }
    ],

    'Iron Trophy': [
        {
            requires: [
                { items: ['Iron Bar'], amt: 5 }
            ],
            produces: 1,
            station: 'Workbench'
        }
    ],

    'Diamond Trophy': [
        {
            requires: [
                { items: ['Diamond'], amt: 5 },
                { items: ['Iron Bar'], amt: 1 }
            ],
            produces: 1,
            station: 'Workbench',
        }
    ],

    'Moonstone Trophy': [
        {
            requires: [
                { items: ['Moonstone'], amt: 5},
                { items: ['Iron Bar'], amt: 1 }
            ],
            produces: 1,
            station: 'Workbench'
        }
    ]
};


for (const trophyName of trophies) {
    const recipe = trophyRecipes[trophyName];
    api.editItemCraftingRecipes(playerId, trophyName, recipe);
}
