import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import { State } from '../../state/index';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { getDisplayCollectionSelector } from '../../components/collection_tree/selector';
import CollectionList from '../../components/collection_tree';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import HttpMethodIcon from '../../components/font_icon/http_method_icon';
import HighlightCode from '../../components/highlight_code';
import SiderLayout from '../../components/sider_layout';
import './style/index.less';
import { DataMode } from '../../common/custom_type';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DocumentActiveRecordType, DocumentSelectedProjectChangedType, DocumentCollectionOpenKeysType, ScrollDocumentType } from '../../action/document';
import { actionCreator } from '../../action/index';
import { RecordCategory } from '../../common/record_category';
import { mainTpl } from './templates/main';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;

    activeKey: string;

    openKeys: string[];

    selectedProject: string;

    scrollTop: number;

    changeByScroll: boolean;
}

interface ApiDocumentDispatchProps {

    onScroll(y: number);
}

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {

    container: any;

    private renderHeaders = (name: string, headers: DtoHeader[]) => {
        return (
            <div className="document-block">
                <div className="document-header-name">{name}</div>
                {
                    headers.filter(h => h.isActive).map(h => (
                        <div key={h.id} className="document-header-row">
                            <div className="col-2 document-header-key">{h.key}</div>
                            <div className="col-2 document-header-value">{h.value}</div>
                            <div className="col-6 document-header-desc">{h.description}</div>
                        </div>
                    ))
                }
            </div>
        );
    }

    private recordName = (name?: string, method?: string) => {
        return (
            <div className="document-record-name">
                <span className="document-method-icon">
                    <HttpMethodIcon fontSize={16} httpMethod={(method || 'GET').toUpperCase()} />
                </span>
                {name || ''}
            </div>
        );
    }

    private recordUrl = (url?: string) => <div className="document-record-url">{url || ''}</div>;

    private recordDesc = (description?: string) => <div className="document-record-desc">{description || ''}</div>;

    private recordParams = (queryStrings?: DtoHeader[]) => queryStrings && queryStrings.length > 0 ? <div>{(this.renderHeaders('PARAMS', queryStrings || []))}</div> : '';

    private recordHeaders = (headers?: DtoHeader[]) => headers && headers.length > 0 ? <div>{(this.renderHeaders('HEADERS', headers || []))}</div> : '';

    private recordBody = (dataMode?: DataMode, body?: string, formData?: DtoHeader[]) => {
        if (dataMode === DataMode.urlencoded) {
            return formData && formData.length > 0 ? <div>{(this.renderHeaders('FORM DATA', formData || []))}</div> : '';
        } else {
            return body ? (
                <div className="document-block">
                    <div className="document-header-name">BODY</div>
                    <div className="document-code">{<HighlightCode code={body || ''} />}</div>
                </div>
            ) : '';
        }
    }

    public componentDidUpdate(prevProps: ApiDocumentProps, prevState: ApiDocumentState) {
        if (!this.props.changeByScroll) {
            location.hash = this.props.activeKey;
        }
    }

    public componentDidMount() {
        if (this.container && this.container._container) {
            this.container._container.scrollTop = this.props.scrollTop;
        }
    }

    private onScrollY = ref => {
        this.props.onScroll(ref.scrollTop);
    }

    private getSortedRecords = (collectionId: string | null) => {
        if (!collectionId || !this.props.records[collectionId]) {
            return [];
        }
        let sortRecords = _.chain(this.props.records[collectionId]).values<DtoRecord>().sortBy(['category', 'name']).value();
        let topLvRecords = sortRecords.filter(r => !r.pid);
        for (let i = topLvRecords.length - 1; i >= 0; i--) {
            if (topLvRecords[i].category === RecordCategory.folder) {
                let children = sortRecords.filter(r => r.pid === topLvRecords[i].id);
                topLvRecords.splice(i, 1, ...children);
            }
        }
        return topLvRecords;
    }

    private download = () => {
        var eleLink = document.createElement('a');
        eleLink.download = 'document.html';
        eleLink.style.display = 'none';

        var blob = new Blob([mainTpl.replace('{{body}}', (document.getElementById('document-main') || { innerHTML: '' }).innerHTML)]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    }

    private generageView() {
        const { activeKey, selectedProject, openKeys, collections } = this.props;
        let keys = [...openKeys];
        if (!keys || keys.length === 0) {
            keys = collections.length > 0 ? [collections[0].id] : [];
        }
        let collectionIds = keys.filter(k => collections.find(c => c.id === k));
        let collectionId = collectionIds.length > 0 ? collectionIds[0] : (collections.length > 0 ? collections[0].id : null);
        let sortRecords = this.getSortedRecords(collectionId);

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
                content={this.generateDoc(sortRecords)}
            />
        );
    }

    private generateDoc(sortRecords: DtoRecord[]) {
        return (
            <PerfectScrollbar ref={ele => this.container = ele} onScrollY={this.onScrollY}>
                <div className=""><button onClick={() => this.download()} >download</button></div>
                <div id="document-main" className="document-main">
                    {
                        sortRecords.map(r => (
                            <div id={r.id} key={r.id} className="document-record">
                                {this.recordName(r.name, r.method)}
                                {this.recordUrl(r.url)}
                                {this.recordDesc(r.description)}
                                {this.recordParams(r.queryStrings)}
                                {this.recordHeaders(r.headers)}
                                {this.recordBody(r.dataMode, r.body, r.formDatas)}
                            </div>
                        ))
                    }
                </div>
            </PerfectScrollbar>
        );
    }

    public render() {
        return this.generageView();
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;
        const { documentActiveRecord, documentCollectionOpenKeys, documentSelectedProject, scrollTop, changeByScroll } = state.documentState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
            activeKey: documentActiveRecord,
            openKeys: documentCollectionOpenKeys,
            selectedProject: documentSelectedProject,
            scrollTop,
            changeByScroll
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {
        onScroll: (scrollTop) => dispatch(actionCreator(ScrollDocumentType, scrollTop))
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(ApiDocument);