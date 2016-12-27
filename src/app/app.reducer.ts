import { ActionReducer, Action } from '@ngrx/store';
import { INITIAL_STATE } from './app.state';
import { AppState } from './app.state';

export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';
export const RESET = 'RESET';

export function reducer(state = INITIAL_STATE, action: Action): AppState {
    switch (action.type) {
        case INCREMENT:
            return { counter: state.counter + 1 };

        case DECREMENT:
            return { counter: state.counter + 1 };

        case RESET:
            return { counter: 0 };

        default:
            return state;
    }
}
