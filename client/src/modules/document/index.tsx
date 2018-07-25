import React from 'react';
import { connect, Dispatch } from 'react-redux';
import { State } from '../../state/index';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { getDocumentDisplayCollectionSelector } from '../../components/collection_tree/selector';
import CollectionList from '../../components/collection_tree';
import SiderLayout from '../../components/sider_layout';
import './style/index.less';
import { DocumentActiveRecordType, DocumentSelectedProjectChangedType, DocumentCollectionOpenKeysType } from '../../action/document';
import DocumentContent from './document_content';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

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

const mapStateToProps = (state: State): ApiDocumentStateProps => {
    const { documentActiveRecord, documentCollectionOpenKeys, documentSelectedProject, changeByScroll } = state.documentState;

    return {
        collections: getDocumentDisplayCollectionSelector()(state),
        activeKey: documentActiveRecord,
        openKeys: documentCollectionOpenKeys,
        selectedProject: documentSelectedProject,
        changeByScroll,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiDocument);