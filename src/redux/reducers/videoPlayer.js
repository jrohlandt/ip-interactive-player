import { STATES } from '../../Components/VideoPlayer/Constants';
import { PLAYER_INIT, PLAYER_READY, UPDATE_PLAYBACK_STATE, UPDATE_CURRENT_TIME, UPDATE_DURATION, UPDATE_MUTE_STATE } from '../actionTypes';

const initialState = {
  autoplay: false,
  vendor: '',
  player: null,
  ready: false,
  playbackState: STATES.UNSTARTED,
  url: '',
  duration: 0,
  currentTime: 0,
  muted: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAYER_INIT:
      return {
        ...state,
        vendor: action.payload.vendor,
        autoplay: action.payload.autoplay,
        duration: 0,
        currentTime: 0,
      };
    case PLAYER_READY:
      return {
        ...state,
        ready: true,
        player: action.payload.player,
      };
    case UPDATE_PLAYBACK_STATE:
      return {
        ...state,
        playbackState: action.payload.playbackState,
      };
    case UPDATE_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload.currentTime,
      };
    case UPDATE_DURATION:
      return {
        ...state,
        duration: action.payload.duration,
      };
    case UPDATE_MUTE_STATE:
      return {
        ...state,
        muted: action.payload.muted,
      }
    default:
      return state;
  }
}

export default reducer;