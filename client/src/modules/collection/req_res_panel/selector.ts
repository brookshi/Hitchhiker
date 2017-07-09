import { createSelector } from 'reselect';
import { State } from '../../../state';
import { noEnvironment } from '../../../common/constants';
import { reqResUIDefaultValue } from '../../../state/ui';
import { DtoCollection } from '../../../../../api/interfaces/dto_collection';
import { RecordCategory } from '../../../common/record_category';
import { TreeData } from 'antd/lib/tree-select/interface';
import * as _ from 'lodash';

const getActiveKey = (state: State) => state.displayRecordsState.activeKey;

const getReqResUIState = (state: State) => state.uiState.reqResUIState;

const getRecordStates = (state: State) => state.displayRecordsState.recordStates;

const getActiveEnv = (state: State) => state.environmentState.activeEnv;

const getEnvs = (state: State) => state.environmentState.environments;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

const getCollectionsInfo = (state: State) => state.collectionState.collectionsInfo;

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

export const getActiveEnvIdSelector = () => {
    return createSelector(
        [getActiveEnv, getActiveRecordProjectIdSelector()],
        (activeEnv, activeRecordProjectId) => {
            return activeEnv[activeRecordProjectId] || noEnvironment;
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

export const getActiveReqResUIStateSelector = () => {
    return createSelector(
        [getActiveKey, getReqResUIState],
        (key, reqResUIState) => {
            return reqResUIState[key] || reqResUIDefaultValue;
        }
    );
};

export const getReqActiveTabKeySelector = () => {
    return createSelector(
        [getActiveReqResUIStateSelector()],
        (activeReqResUIState) => {
            return activeReqResUIState.activeReqTab || reqResUIDefaultValue.activeReqTab;
        }
    );
};

export const getResActiveTabKeySelector = () => {
    return createSelector(
        [getActiveReqResUIStateSelector()],
        (activeReqResUIState) => {
            return activeReqResUIState.activeResTab || reqResUIDefaultValue.activeResTab;
        }
    );
};

export const getHeadersEditModeSelector = () => {
    return createSelector(
        [getActiveReqResUIStateSelector()],
        (activeReqResUIState) => {
            return activeReqResUIState.headersEditMode || reqResUIDefaultValue.headersEditMode;
        }
    );
};

export const getResHeightSelector = () => {
    return createSelector(
        [getActiveReqResUIStateSelector()],
        (activeReqResUIState) => {
            return activeReqResUIState.resHeight || reqResUIDefaultValue.resHeight;
        }
    );
};

export const getIsResPanelMaximumSelector = () => {
    return createSelector(
        [getActiveReqResUIStateSelector()],
        (activeReqResUIState) => {
            return activeReqResUIState.isResPanelMaximum === undefined ? reqResUIDefaultValue.isResPanelMaximum : activeReqResUIState.isResPanelMaximum;
        }
    );
};

export const getCollectionTreeDataSelector = () => {
    return createSelector(
        [getCollectionsInfo],
        (collectionsInfo) => {
            const treeData = new Array<TreeData>();
            _.chain(collectionsInfo.collections).values<DtoCollection>().sortBy(c => c.name).value().forEach(c => {
                treeData.push({
                    key: c.id,
                    value: c.id,
                    label: c.name,
                    children: _.sortBy(_.values(collectionsInfo.records[c.id])
                        .filter(r => r.category === RecordCategory.folder)
                        .map(r => ({ key: `${c.id}::${r.id}`, value: `${c.id}::${r.id}`, label: r.name })), t => t.label)
                });
            });
            return treeData;
        }
    );
};