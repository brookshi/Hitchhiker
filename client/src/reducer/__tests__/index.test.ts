import { QuitProjectType, DisbandProjectType } from '../../action/project';
import { defaultState } from '../../state/index';
import { multipleStateReducer } from '../index';
import { actionCreator } from '../../action/index';
import { RecordCategory } from '../../common/record_category';
import * as _ from 'lodash';
import { UpdateDisplayRecordPropertyType, UpdateDisplayRecordType } from '../../action/record';
import { HttpMethod } from '../../common/http_method';
import { FetchLocalDataSuccessType } from '../../action/local_data';
import { KeyValueEditType } from '../../common/custom_type';
import { syncDefaultValue } from '../../state/ui';
import { ParameterType } from '../../common/parameter_type';
import { allParameter } from '../../common/constants';
import { ConflictType } from '../../common/conflict_type';

const defaultRecordState = { name: '', isRequesting: false, isChanged: false, record: {}, parameter: allParameter, conflictType: ConflictType.none };
const c1 = { id: 'cid_123', name: 'c1', commonPreScript: '', projectId: 'pid_123', description: '' };
const c2 = { id: 'cid_456', name: 'c2', commonPreScript: '', projectId: 'pid_123', description: '' };
const c3 = { id: 'cid_789', name: 'c3', commonPreScript: '', projectId: 'pid_789', description: '' };
const r1 = { id: 'rid_123', collectionId: 'cid_123', category: RecordCategory.record, parameterType: ParameterType.ManyToMany, name: 'r1', headers: [] };
const r2 = { id: 'rid_456', collectionId: 'cid_456', category: RecordCategory.record, parameterType: ParameterType.ManyToMany, name: 'r2' };
const r3 = { id: 'rid_789', collectionId: 'cid_789', category: RecordCategory.record, parameterType: ParameterType.ManyToMany, name: 'r3' };

test('quit/disband project', () => {

    let oldState = {
        ...defaultState, collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_123']: c1, ['cid_456']: c2, ['cid_789']: c3 },
                records: {
                    ['cid_123']: { ['rid_123']: r1 },
                    ['cid_456']: { ['rid_456']: r2 },
                    ['cid_789']: { ['rid_789']: r3 }
                }
            }
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...defaultRecordState, record: r1 },
                ['rid_456']: { ...defaultRecordState, record: r2 },
                ['rid_789']: { ...defaultRecordState, record: r3 },
            },
            recordsOrder: ['rid_123', 'rid_456', 'rid_789'],
            activeKey: 'rid_123'
        }
    };

    let state = multipleStateReducer(oldState, actionCreator(QuitProjectType, { id: 'pid_123' }));

    let expectState = {
        ...defaultState, collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_789']: c3 },
                records: {
                    ['cid_789']: { ['rid_789']: r3 }
                }
            }
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_789']: { ...defaultRecordState, record: r3 },
            },
            recordsOrder: ['rid_789'],
            activeKey: 'rid_789'
        }
    };

    expect(state).toEqual(expectState);
    expect(state).toEqual(multipleStateReducer(oldState, actionCreator(DisbandProjectType, { id: 'pid_123' })));

    state = multipleStateReducer(expectState, actionCreator(QuitProjectType, { id: 'pid_789' }));
    expect(state.collectionState).toEqual({ ...defaultState.collectionState, collectionsInfo: { collections: {}, records: {} } });
    expect(state.displayRecordsState.activeKey).toContain('@new');
    expect(_.keys(state.displayRecordsState.recordStates).length).toEqual(1);
    expect(state.displayRecordsState.recordsOrder.length).toEqual(1);
    expect(_.keys(state.displayRecordsState.recordStates)[0]).toContain('@new');
    expect(state.displayRecordsState.recordsOrder[0]).toContain('@new');
});

test('update display record property', () => {

    let oldState = {
        ...defaultState, collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_123']: c1 },
                records: {
                    ['cid_123']: { ['rid_123']: r1 },
                }
            }
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...defaultRecordState, record: r1 }
            },
            recordsOrder: ['rid_123'],
            activeKey: 'rid_123'
        }
    };

    let state = multipleStateReducer(oldState, { type: UpdateDisplayRecordPropertyType, value: { name: '333' } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: { ...r1, name: '333' }, isChanged: true }
            }
        }
    });

    state = multipleStateReducer(oldState, { type: UpdateDisplayRecordPropertyType, value: { url: 'url1' } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: { ...r1, url: 'url1' }, isChanged: true }
            }
        }
    });

    state = multipleStateReducer(oldState, { type: UpdateDisplayRecordPropertyType, value: { headers: [{ id: 'header1', key: 'k1', value: 'v1', isActive: true }] } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: { ...r1, headers: [{ id: 'header1', key: 'k1', value: 'v1', isActive: true }] }, isChanged: true }
            }
        }
    });

    state = multipleStateReducer(state, { type: UpdateDisplayRecordPropertyType, value: { headers: [] } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: r1, isChanged: false }
            }
        }
    });

    state = multipleStateReducer(state, { type: UpdateDisplayRecordPropertyType, value: { parameterType: ParameterType.OneToOne } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: { ...r1, parameterType: ParameterType.OneToOne }, isChanged: true }
            }
        }
    });
});

test('update display record', () => {

    let oldState = {
        ...defaultState, collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_123']: c1 },
                records: {
                    ['cid_123']: { ['rid_123']: r1 },
                }
            }
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...defaultRecordState, record: r1 }
            },
            recordsOrder: ['rid_123'],
            activeKey: 'rid_123'
        }
    };

    let state = multipleStateReducer(oldState, { type: UpdateDisplayRecordType, value: { ...r1, name: '333', url: 'url1', method: HttpMethod.GET, body: 'body', headers: [], test: 'test' } });

    expect(state).toEqual({
        ...oldState, displayRecordsState: {
            ...oldState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...oldState.displayRecordsState.recordStates['rid_123'], record: { ...r1, name: '333', url: 'url1', method: HttpMethod.GET, body: 'body', headers: [], test: 'test' }, isChanged: true }
            }
        }
    });
});

test('fetch local data success', () => {

    let oldState = {
        ...defaultState, collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_123']: c1, ['cid_456']: c2 },
                records: {
                    ['cid_123']: { ['rid_123']: r1 },
                    ['cid_456']: { ['rid_456']: r2 }
                }
            }
        }
    };

    expect(multipleStateReducer(oldState, { type: FetchLocalDataSuccessType })).toEqual(oldState);

    let localData = {
        ...defaultState,
        collectionState: {
            openKeys: ['cid_456'],
            selectedProject: 'pid_123'
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...defaultRecordState, isChanged: true, name: 'rr1', record: { ...r1, name: 'rrr1' } },
                ['rid_456']: { ...defaultRecordState, name: 'rrr2', isChanged: false, record: { ...r2, name: 'rrr2' } },
                ['rid_789']: { ...defaultRecordState, record: r3 },
            },
            recordsOrder: ['rid_456', 'rid_789', 'rid_123'],
            activeKey: 'rid_789'
        },
        uiState: {
            appUIState: {
                activeModule: 'project',
                leftPanelWidth: 600,
                collapsed: true
            },
            reqResUIState: {
                isResPanelMaximum: true,
                resHeight: 800,
                activeResTab: 'cookie',
                activeReqTab: 'body',
                headersEditMode: KeyValueEditType.bulkEdit
            },
            syncState: {
                syncCount: 2,
                message: 'syncing',
                syncItems: []
            }
        },
        projectState: { activeProject: 'pid_123' },
        environmentState: { activeEnv: 'eid_123' },
        scheduleState: { activeSchedule: 'sid_123' }
    };

    let expectState = {
        ...defaultState,
        collectionState: {
            ...defaultState.collectionState, collectionsInfo: {
                collections: { ['cid_123']: c1, ['cid_456']: c2 },
                records: {
                    ['cid_123']: { ['rid_123']: r1 },
                    ['cid_456']: { ['rid_456']: r2 }
                }
            },
            openKeys: ['cid_456'],
            selectedProject: 'pid_123'
        },
        displayRecordsState: {
            ...defaultState.displayRecordsState,
            recordStates: {
                ['rid_123']: { ...defaultRecordState, name: 'r1', isChanged: true, record: { ...r1, name: 'rrr1' }, parameterStatus: {} },
                ['rid_456']: { ...defaultRecordState, name: 'r2', record: r2, parameterStatus: {} },
                ['rid_789']: { ...defaultRecordState, record: r3, parameterStatus: {} },
            },
            recordsOrder: ['rid_456', 'rid_789', 'rid_123'],
            activeKey: 'rid_789'
        },
        uiState: {
            appUIState: {
                activeModule: 'project',
                leftPanelWidth: 600,
                collapsed: true
            },
            reqResUIState: {
                isResPanelMaximum: true,
                resHeight: 800,
                activeResTab: 'cookie',
                activeReqTab: 'body',
                headersEditMode: KeyValueEditType.bulkEdit
            },
            syncState: syncDefaultValue
        },
        projectState: { ...defaultState.projectState, activeProject: 'pid_123' },
        environmentState: { ...defaultState.environmentState, activeEnv: 'eid_123' },
        scheduleState: { ...defaultState.scheduleState, activeSchedule: 'sid_123' }
    };

    expect(multipleStateReducer(oldState, { type: FetchLocalDataSuccessType, value: localData })).toEqual(expectState);
});