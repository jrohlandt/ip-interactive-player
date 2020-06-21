import { PLAYER_INIT, PLAYER_READY, UPDATE_PLAYBACK_STATE, UPDATE_CURRENT_TIME, UPDATE_DURATION, UPDATE_MUTE_STATE } from './actionTypes';


export const playerInit = (vendor, autoplay) => {
  return {
    type: PLAYER_INIT,
    payload: { vendor, autoplay },
  };
};

export const playerReady = (player) => {
  return {
    type: PLAYER_READY,
    payload: { player }
  }
};

export const updatePlaybackState = (playbackState) => {
  return {
    type: UPDATE_PLAYBACK_STATE,
    payload: { playbackState }
  };
};

export const updateCurrentTime = (currentTime) => {
  return {
    type: UPDATE_CURRENT_TIME,
    payload: { currentTime }
  };
};

export const updateDuration = (duration) => {
  return {
    type: UPDATE_DURATION,
    payload: { duration }
  };
};

export const updateMuteState = (muted) => {
  return {
    type: UPDATE_MUTE_STATE,
    payload: { muted }
  };
};