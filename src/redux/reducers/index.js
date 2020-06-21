import { combineReducers } from 'redux';
import videoPlayer from './videoPlayer';

const rootReducer = combineReducers({
  videoPlayer,
});

export default rootReducer;