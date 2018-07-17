import { createSelector } from 'reselect';
import { State } from '../../state';
import { noEnvironment } from '../../common/constants';

const getActiveKey = (state: State) => state.displayRecordsState.activeKey;

const getRecordStates = (state: State) => state.displayRecordsState.recordStates;

const getActiveEnv = (state: State) => state.environmentState.activeEnv;

const getEnvs = (state: State) => state.environmentState.environments;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

export const getActiveRecordStateSelector = () => {
    return createSelector(
        [getActiveKey, getRecordStates],
        (activeKey, recordStates) => {
            return recordStates[activeKey];
        }
    );
};

export const getActiveRecordSelector = () => {
    return createSelector(
        [getActiveKey, getActiveRecordStateSelector()],
        (activeKey, recordState) => {
            if (!recordState) {
                throw new Error('miss active record state');
            }
            return recordState.record;
        }
    );
};

export const getActiveRecordProjectIdSelector = () => {
    return createSelector(
        [getActiveRecordSelector(), getCollections],
        (activeRecord, collections) => {
            return activeRecord.collectionId && collections[activeRecord.collectionId] ? collections[activeRecord.collectionId].projectId : '';
        }
    );
};

export const getProjectEnvsSelector = () => {
    return createSelector(
        [getEnvs, getActiveRecordProjectIdSelector()],
        (envs, activeRecordProjectId) => {
            return envs[activeRecordProjectId] || [];
        }
    );
};

export const getActiveEnvIdSelector = () => {
    return createSelector(
        [getActiveEnv, getActiveRecordProjectIdSelector()],
        (activeEnv, activeRecordProjectId) => {
            return activeEnv[activeRecordProjectId] || noEnvironment;
        }
    );
};