import { combineReducers } from 'redux';
import { root as displayRecordsState, collectionState } from './collection';
import { State } from '../state';
import { UpdateTabChangedType } from '../action/record';
import * as _ from 'lodash';
import { uiState } from './ui';
import { userState } from './user';
import { teamState } from './team';
import { environmentState } from './environment';
import { FetchLocalDataSuccessType } from "../action/local_data";
import { localDataState } from "./local_data";
import { syncDefaultValue } from "../state/ui";

export const reduceReducers = (...reducers) => {
    return (state, action) =>
        reducers.reduce(
            (p, r) => r(p, action),
            state
        );
};

export function rootReducer(state: State, action: any): State {
    const intermediateState = combineReducers<State>({
        localDataState,
        collectionState,
        displayRecordsState,
        uiState,
        userState,
        teamState,
        environmentState
    })(state, action);

    const finalState = root(intermediateState, action);

    return finalState;
};

function root(state: State, action: any): State {
    switch (action.type) {
        case UpdateTabChangedType: {
            const record = action.value;
            const cid = record.collectionId;
            let isChanged = true;
            if (cid) {
                isChanged = !_.isEqual(state.collectionState.collectionsInfo.records[record.collectionId][record.id], record);
            }
            const recordState = state.displayRecordsState.recordStates;
            const index = recordState.findIndex(r => r.record.id === action.value.id);
            recordState[index].record = { ...action.value };
            recordState[index].isChanged = isChanged;
            return { ...state, displayRecordsState: { ...state.displayRecordsState, recordStates: [...recordState] } };
        }
        case FetchLocalDataSuccessType: {
            const { displayRecordsState, uiState, collectionState, teamState, environmentState } = action.value;
            return {
                ...state,
                displayRecordsState,
                uiState: { ...uiState, syncState: syncDefaultValue },
                collectionState: {
                    ...state.collectionState,
                    selectedTeam: collectionState.selectedTeam,
                    openKeys: collectionState.openKeys
                },
                teamState: {
                    ...state.teamState,
                    activeTeam: teamState.activeTeam
                },
                environmentState: {
                    ...state.environmentState,
                    activeEnv: environmentState.activeEnv
                }
            };
        }
        default: return state;
    }
}