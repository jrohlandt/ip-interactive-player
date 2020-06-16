import { Machine, assign, send } from 'xstate';
import { STATES } from './Constants';
import PlayerActions from './PlayerActions';

const muteEvents = {
  MUTE: {
    target: '',
    actions: ['mute'],
  },
  UNMUTE: {
    target: '',
    actions: ['unMute'],
  }
};

const PlayerMachine = Machine({
  id: 'playermachine',
  initial: STATES.initializing,
  context: {
    player: false,
    vendor: '',
    autoplay: false,
    duration: 0,
    currentTime: 0,
    muted: false,
  },
  states: {
    on: { // is this ok in top level states????
      ERROR: {
        target: 'failure'
      }
    },
    // initial: 'initializing',
    [STATES.initializing]: {
      on: {
        INITIALIZE: {
          target: STATES.initialized,
          actions: assign({
            vendor: (context, event) => event.vendor,
            autoplay: (context, event) => event.autoplay,
          }),
        },

      }
    },
    [STATES.initialized]: {
      on: {
        READY: {
          target: `${STATES.ready}.${STATES.unstarted}`,
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
      states: {
        // initial: 'unstarted',
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
              actions: ['updateTime']
            },
            PAUSE: {
              target: STATES.paused,
              actions: ['pause'],
            },
            MUTE: {
              target: '',
              actions: ['mute'],
            },
            UNMUTE: {
              target: '',
              actions: ['unMute'],
            },

          }
        },
        [STATES.paused]: {
          on: {
            PLAY: {
              target: STATES.playing,
              actions: ['play']
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
    play: (context, event) => {
      console.log('playiddd')
      PlayerActions[context.vendor].play(context.player);
    },
    pause: (context, event) => {
      PlayerActions[context.vendor].pause(context.player);
    },
    mute: (context, event) => {
      PlayerActions[context.vendor].mute(context.player);
      assign({ muted: (context, event) => PlayerActions[context.vendor].isMuted(context.player) });
    },
    unMute: (context, event) => {
      PlayerActions[context.vendor].unMute(context.player);
      assign({ muted: (context, event) => PlayerActions[context.vendor].isMuted(context.player) });
    },
    isMuted: (context, event) => {
      PlayerActions[context.vendor].isMuted(context.player);
    },
    seekTo: (context, event) => {
      PlayerActions[context.vendor].seekTo(context.player);
    },
    updateTime: assign({
      currentTime: context => PlayerActions[context.vendor].getCurrentTime(context.player),
      duration: context => PlayerActions[context.vendor].getDuration(context.player),
    }),
    changeSrc: (context, event) => {
      PlayerActions[context.vendor].changeSrc(context.player);
    },
    destroy: (context, event) => {
      PlayerActions[context.vendor].destroy(context.player);
    },
  }
});

export default PlayerMachine;