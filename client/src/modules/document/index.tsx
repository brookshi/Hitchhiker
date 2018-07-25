import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import { State } from '../../state/index';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { getDisplayCollectionSelector } from '../../components/collection_tree/selector';
import CollectionList from '../../components/collection_tree';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import SiderLayout from '../../components/sider_layout';
import './style/index.less';
import { DocumentActiveRecordType, DocumentSelectedProjectChangedType, DocumentCollectionOpenKeysType } from '../../action/document';
import DocumentContent from './document_content';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;

    activeKey: string;

    openKeys: string[];

    selectedProject: string;

    changeByScroll: boolean;
}

interface ApiDocumentDispatchProps { }

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {

    public componentDidUpdate(prevProps: ApiDocumentProps, prevState: ApiDocumentState) {
        if (!this.props.changeByScroll) {
            location.hash = this.props.activeKey;
        }
    }

    private generateView() {
        const keys = this.getOpenKeys();
        const { activeKey, selectedProject } = this.props;

        return (
            <SiderLayout
                sider={
                    <CollectionList
                        readOnly={true}
                        activeKey={activeKey}
                        openKeys={keys}
                        selectedProject={selectedProject}
                        onlyOneOpenKey={true}
                        activeRecordType={DocumentActiveRecordType}
                        collectionOpenKeysType={DocumentCollectionOpenKeysType}
                        selectedProjectChangedType={DocumentSelectedProjectChangedType}
                    />
                }
                content={<DocumentContent />}
            />
        );
    }

    private getOpenKeys = () => {
        const { openKeys, collections } = this.props;
        let keys = [...openKeys];
        if (!keys || keys.length === 0) {
            keys = collections.length > 0 ? [collections[0].id] : [];
        }
        return keys;
    }

    public render() {
        return this.generateView();
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;
        const { documentActiveRecord, documentCollectionOpenKeys, documentSelectedProject, changeByScroll } = state.documentState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
            activeKey: documentActiveRecord,
            openKeys: documentCollectionOpenKeys,
            selectedProject: documentSelectedProject,
            changeByScroll,
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {};
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(ApiDocument);