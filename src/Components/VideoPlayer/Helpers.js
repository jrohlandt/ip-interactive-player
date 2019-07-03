import { STATES, ACTIONS, VENDORS } from './Constants.js';

export const isValidState = function(state) {
    return Object.values(STATES).indexOf(state) !== -1;
};

export const isValidVendor = function(vendor) {
    return typeof(VENDORS[vendor.toUpperCase()] !== 'undefined');
};

export const isValidAction = function(action) {
    return typeof(ACTIONS[action.toUpperCase()]) !== 'undefined';
}