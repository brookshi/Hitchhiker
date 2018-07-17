import { DocumentState, documentDefaultValue } from '../state/document';
import { DocumentActiveRecordType, DocumentCollectionOpenKeysType, DocumentSelectedProjectChangedType, ScrollDocumentType, DocumentActiveEnvIdType } from '../action/document';

export function documentState(state: DocumentState = documentDefaultValue, action: any): DocumentState {
    switch (action.type) {
        case DocumentActiveRecordType: {
            return { ...state, documentActiveRecord: action.value.id, changeByScroll: false };
        }
        case DocumentCollectionOpenKeysType: {
            return { ...state, documentCollectionOpenKeys: action.value };
        }
        case DocumentSelectedProjectChangedType: {
            return { ...state, documentSelectedProject: action.value };
        }
        case ScrollDocumentType: {
            return { ...state, scrollTop: action.value, changeByScroll: true };
        }
        case DocumentActiveEnvIdType: {
            const { projectId, envId } = action.value;
            return { ...state, activeEnv: { ...state.activeEnv, [projectId]: envId } };
        }
        default:
            return state;
    }
}