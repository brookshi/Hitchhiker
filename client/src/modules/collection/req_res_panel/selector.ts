import { createSelector } from 'reselect';
import { State } from '../../../state';
import { noEnvironment, defaultBodyType } from '../../../common/constants';
import { reqResUIDefaultValue } from '../../../state/ui';
import { DtoCollection } from "../../../../../api/interfaces/dto_collection";
import { RecordCategory } from "../../../common/record_category";
import { TreeData } from 'antd/lib/tree-select/interface';
import * as _ from "lodash";

const getActiveKey = (state: State) => state.displayRecordsState.activeKey;

const getReqResUIState = (state: State) => state.uiState.reqResUIState;

const getRecordStates = (state: State) => state.displayRecordsState.recordStates;

const getActiveEnv = (state: State) => state.environmentState.activeEnv;

const getEnvs = (state: State) => state.environmentState.environments;

const getCollections = (state: State) => state.collectionState.collectionsInfo.collections;

const getCollectionsInfo = (state: State) => state.collectionState.collectionsInfo;

// export const getActiveRecordState = (state: State) => {
//     return getRecordStates(state).find(r => r.record.id === getActiveKey(state));
// };

// export const getActiveRecord = (activeKey, recordStates) => {
//     const recordState = getActiveRecordState(activeKey, recordStates);
//     if (!recordState) {
//         throw new Error('miss active record state');
//     }
//     return recordState.record;
// }

export const getActiveRecordStateSelector = () => {
    return createSelector(
        [getActiveKey, getRecordStates],
        (activeKey, recordStates) => {
            return recordStates.find(r => r.record.id === activeKey);
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

export const getActiveTabKeySelector = () => {
    return createSelector(
        [getActiveKey, getReqResUIState],
        (key, reqResUIState) => {
            return reqResUIState[key] ? reqResUIState[key].activeReqTab : reqResUIDefaultValue.activeReqTab;
        }
    );
};

export const getBodyTypeSelector = () => {
    return createSelector(
        [getActiveRecordSelector()],
        (record) => {
            return record.bodyType || defaultBodyType;
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