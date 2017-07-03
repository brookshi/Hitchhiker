import { createSelector } from 'reselect';
import { State } from '../../../state';
import { noEnvironment } from '../../../common/constants';

const getActiveKey = (state: State) => state.displayRecordsState.activeKey;

const getRecordState = (state: State) => state.displayRecordsState.recordStates;

const getActiveEnv = (state: State) => state.environmentState.activeEnv;

const getEnvs = (state: State) => state.environmentState.environments;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

export const getActiveRecord = createSelector(
    [getActiveKey, getRecordState],
    (activeKey, recordStates) => {
        const recordState = recordStates.find(r => r.record.id === activeKey);
        if (!recordState) {
            throw new Error('miss active record state');
        }
        return recordState.record;
    }
);

export const getActiveRecordProjectId = createSelector(
    [getActiveRecord, getCollections],
    (activeRecord, collections) => {
        return activeRecord.collectionId && collections[activeRecord.collectionId] ? collections[activeRecord.collectionId].projectId : '';
    }
);

export const getActiveEnvId = createSelector(
    [getActiveEnv, getActiveRecordProjectId],
    (activeEnv, activeRecordProjectId) => {
        return activeEnv[activeRecordProjectId] || noEnvironment;
    }
);

export const getProjectEnvs = createSelector(
    [getEnvs, getActiveRecordProjectId],
    (envs, activeRecordProjectId) => {
        return envs[activeRecordProjectId] || [];
    }
);