export const STATES = {
    'UNSTARTED': -1,
    'ENDED': 0,
    'PLAYING': 1,
    'PAUSED': 2,
    'BUFFERING': 3,
    'CUED': 5,
};

export const VENDORS = {
    'YOUTUBE': 'YOUTUBE',
    'VIMEO': 'VIMEO',
    // 'MP4': 'MP4',
    'HTML5': 'HTML5',
    'WISTIA': 'WISTIA',
};

export const ACTIONS = {
    'PLAY': 'PLAY',
    'PAUSE': 'PAUSE',
    'STOP': 'STOP',
    'MUTE': 'MUTE',
    'UNMUTE': 'UNMUTE',
    'SEEK_TO': 'SEEK_TO',
};

export const ON_PLAYER_STATE_CHANGE = 'ON_PLAYER_STATE_CHANGE';

export const ON_TIME_UPDATE = 'ON_TIME_UPDATE';
