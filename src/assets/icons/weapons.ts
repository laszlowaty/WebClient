export enum WeaponType {
    SWORD = 'sword',
    MACE = 'mace',
    DAGGER = 'dagger',
    AXE = 'axe',
    SPEAR = 'spear',
    FLAIL = 'flail',
    WHIP = 'whip',
    POLEARN = 'polearm',
    STAFF = 'staff',
    SHORT_SWORD = 'short-sword',
    CLAWS = 'claws',
}

export type WeaponIcon = {
    icon: string,
}

export type WeaponIcons = Record<WeaponType, WeaponIcon>;

const weaponIcons: WeaponIcons = {
    sword: {
        icon: 'sword.svg'
    },
    mace: {
        icon: "mace.svg"
    },
    dagger: {
        icon: "dagger.svg"
    },
    axe: {
        icon: "axe.svg"
    },
    spear: {
        icon: ""
    },
    flail: {
        icon: "flail.svg"
    },
    whip: {
        icon: "whip.svg"
    },
    polearm: {
        icon: ""
    },
    staff: {
        icon: ""
    },
    "short-sword": {
        icon: "short-sword.svg"
    },
    claws: {
        icon: ""
    }
}