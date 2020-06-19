import { Machine, assign } from 'xstate';
import { STATES } from './Constants';
import PlayerActions from './PlayerActions';

const Events = {
  INITIALIZE: {
    target: STATES.initialized,
    actions: assign({
      vendor: (cx, event) => event.vendor,
      autoplay: (cx, event) => event.autoplay,
      currentTime: 0,
      duration: 0,
    }),
  },
  MUTE: {
    target: '',
    actions: [
      'mute',
      assign({ muted: true }),
    ],
  },
  UNMUTE: {
    target: '',
    actions: [
      'unMute',
      assign({ muted: false }),
    ],
  },
  SEEK_TO: {
    target: '',
    actions: ['seekTo']
  }
};

const PlayerMachine = Machine({
  id: 'playermachine',
  context: {
    player: false,
    vendor: '',
    autoplay: false,
    duration: 0,
    currentTime: 0,
    muted: false,
  },
  initial: STATES.initializing,
  id: 'main',

  states: {
    on: { // is this ok in top level states????
      ERROR: {
        target: 'failure'
      }
    },
    [STATES.initializing]: { on: { INITIALIZE: Events.INITIALIZE } },
    [STATES.destroyed]: { on: { INITIALIZE: Events.INITIALIZE } },
    [STATES.initialized]: {
      on: {
        READY: {
          target: STATES.ready,
          actions: assign({
            player: (context, event) => event.player,
          }),
        },
        ERROR: {
          target: STATES.failure,
        },
      }
    },
    [STATES.ready]: {
      initial: 'unstarted',
      states: {
        [STATES.unstarted]: {
          on: {
            PLAY: {
              target: STATES.playing,
              actions: ['play']
            }
          }
        },
        [STATES.playing]: {
          on: {
            ON_TIME_UPDATE: {
              target: STATES.playing,
              actions: ['updateTime', 'syncMute']
            },
            PAUSE: {
              target: STATES.paused,
              actions: ['pause'],
            },
            MUTE: Events.MUTE,
            UNMUTE: Events.UNMUTE,
            SEEK_TO: Events.SEEK_TO,
          }
        },
        [STATES.paused]: {
          on: {
            PLAY: {
              target: STATES.playing,
              actions: ['play']
            },
            MUTE: Events.MUTE,
            UNMUTE: Events.UNMUTE,
            SEEK_TO: Events.SEEK_TO, // todo progress bar does not update when seeking in paused state.
            CHANGE_SOURCE: {
              target: STATES.playing,
              actions: ['changeSrc' /*, 'resetCurrentTimeAndDuration'*/, 'play']
            },
            DESTROY: {
              target: '#main.' + STATES.destroyed,
            }
          }
        },
        [STATES.ended]: {

        }
      }
    },
    [STATES.failure]: {
      type: 'final',
    },

  },

}, {
  actions: {
    play: (cx, e) => {
      // make sure player mute state is in sync with context before playing.
      PlayerActions[cx.vendor][cx.muted ? 'mute' : 'unMute'](cx.player);
      PlayerActions[cx.vendor].play(cx.player);
    },
    pause: (cx, e) => PlayerActions[cx.vendor].pause(cx.player),
    mute: (cx, e) => PlayerActions[cx.vendor].mute(cx.player),
    unMute: (cx, e) => PlayerActions[cx.vendor].unMute(cx.player),
    // syncMute makes sure that cx mute is in sync with player mute state.
    syncMute: assign({ muted: (cx, e) => PlayerActions[cx.vendor].isMuted(cx.player) }
    ),
    seekTo: (cx, e) => PlayerActions[cx.vendor].seekTo(cx.player, e.seconds),
    updateTime: assign({
      currentTime: cx => PlayerActions[cx.vendor].getCurrentTime(cx.player),
      duration: cx => PlayerActions[cx.vendor].getDuration(cx.player),
    }),
    changeSrc: (cx, e) => PlayerActions[cx.vendor].changeSrc(cx.player, e.src),
    destroy: (cx, e) => {
      PlayerActions[cx.vendor].destroy(cx.player);
    },
  }
});

export default PlayerMachine;