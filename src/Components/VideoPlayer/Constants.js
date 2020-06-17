export const STATES = {
    initializing: 'initializing',
    initialized: 'initialized',
    failure: 'failure',
    ready: 'ready',
    unstarted: 'unstarted',
    ended: 'ended',
    playing: 'playing',
    paused: 'paused',
    buffering: 'buffering',
    cued: 'cued',
};

export const VENDORS = {
    'YOUTUBE': 'YOUTUBE',
    'VIMEO': 'VIMEO',
    // 'MP4': 'MP4',
    'HTML5': 'HTML5',
    'WISTIA': 'WISTIA',
};

export const ACTIONS = {
    PLAY: 'PLAY',
    PAUSE: 'PAUSE',
    STOP: 'STOP',
    MUTE: 'MUTE',
    UNMUTE: 'UNMUTE',
    SEEK_TO: 'SEEK_TO',
    CHANGE_SOURCE: 'CHANGE_SOURCE',
};

export const ON_PLAYER_STATE_CHANGE = 'ON_PLAYER_STATE_CHANGE';

export const ON_TIME_UPDATE = 'ON_TIME_UPDATE';
