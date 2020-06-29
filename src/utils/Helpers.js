import { STATES, ACTIONS, VENDORS, INTERACTION_TYPES } from '../Components/VideoPlayer/Constants.js';

export const isValidState = function (state) {
    return Object.values(STATES).indexOf(state) !== -1;
};

export const isValidVendor = function (vendor) {
    return typeof (VENDORS[vendor.toUpperCase()] !== 'undefined');
};

export const isValidAction = function (action) {
    return typeof (ACTIONS[action.toUpperCase()]) !== 'undefined';
}

export const isValidInteractionType = interactionType => {
    return typeof (INTERACTION_TYPES[interactionType.toUpperCase()]) !== 'undefined';
}