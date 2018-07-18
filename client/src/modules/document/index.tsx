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
import { DocumentActiveRecordType, DocumentSelectedProjectChangedType, DocumentCollectionOpenKeysType, ScrollDocumentType, DocumentActiveEnvIdType } from '../../action/document';
import { actionCreator } from '../../action/index';
import { RecordCategory } from '../../common/record_category';
import { mainTpl } from './templates/default';
import { TemplateUtil } from '../../utils/template_util';
import EnvironmentSelect from '../../components/environment_select';
import { Button } from 'antd';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';
import { noEnvironment } from '../../common/constants';
import LocalesString from '../../locales/string';
import { StringUtil } from '../../utils/string_util';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;

    activeKey: string;

    openKeys: string[];

    selectedProject: string;

    scrollTop: number;

    changeByScroll: boolean;

    activeEnv: _.Dictionary<string>;

    environments: _.Dictionary<DtoEnvironment[]>;
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

    private recordName = (id: string, name?: string, method?: string) => {
        return (
            <div className="document-record-name">
                <span id={id} className="document-method-icon">
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

    private getSortedRecords = (collectionId: string | null, useForDownload: boolean = false) => {
        if (!collectionId || !this.props.records[collectionId]) {
            return [];
        }
        let sortRecords = _.chain(this.props.records[collectionId]).values<DtoRecord>().sortBy(['category', 'name']).value();
        let topLvRecords = sortRecords.filter(r => !r.pid);
        for (let i = topLvRecords.length - 1; i >= 0; i--) {
            if (topLvRecords[i].category === RecordCategory.folder) {
                let children = sortRecords.filter(r => r.pid === topLvRecords[i].id);
                if (useForDownload) {
                    topLvRecords[i].children = children;
                } else {
                    topLvRecords.splice(i + 1, 0, ...children);
                }
            }
        }
        return topLvRecords;
    }

    private applyEnvironmentVariable = (r: DtoRecord) => {
        const activeCollection = this.getActiveCollection();
        if (!activeCollection) {
            return r;
        }

        const env = this.props.environments[activeCollection.projectId].find(e => e.id === this.props.activeEnv[activeCollection.projectId]);
        const variables = {};
        ((env ? env.variables : []) || []).filter(v => v.isActive).forEach(v => { if (v.key) { variables[v.key] = v.value; } });
        const record = { ...r };

        record.url = StringUtil.applyTemplate(record.url, variables);
        record.body = StringUtil.applyTemplate(record.body, variables);
        record.test = StringUtil.applyTemplate(record.test, variables);
        record.prescript = StringUtil.applyTemplate(record.prescript, variables);

        record.headers = (r.headers || []).map(header => ({
            ...header,
            key: StringUtil.applyTemplate(header.key, variables),
            value: StringUtil.applyTemplate(header.value, variables)
        }));

        record.queryStrings = (r.queryStrings || []).map(queryString => ({
            ...queryString,
            key: StringUtil.applyTemplate(queryString.key, variables),
            value: StringUtil.applyTemplate(queryString.value, variables)
        }));

        record.formDatas = (r.formDatas || []).map(formData => ({
            ...formData,
            key: StringUtil.applyTemplate(formData.key, variables),
            value: StringUtil.applyTemplate(formData.value, variables)
        }));

        return record;
    }

    private download = () => {
        const eleLink = document.createElement('a');
        eleLink.download = 'document.html';
        eleLink.style.display = 'none';
        const doc = (document.getElementById('document-main') || { innerHTML: '' }).innerHTML;
        const activeCollection = this.getActiveCollection();

        if (!activeCollection) {
            return;
        }

        const data = { doc, collectionName: 'test', records: this.getSortedRecords(activeCollection.id, true) };
        const blob = new Blob([TemplateUtil.apply(mainTpl, data)]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    }

    private generateView() {
        const keys = this.getOpenKeys();
        const activeCollection = this.getActiveCollection();

        if (!activeCollection) {
            return null;
        }

        const { activeKey, selectedProject } = this.props;
        const sortRecords = this.getSortedRecords(activeCollection.id);

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

    private getOpenKeys = () => {
        const { openKeys, collections } = this.props;
        let keys = [...openKeys];
        if (!keys || keys.length === 0) {
            keys = collections.length > 0 ? [collections[0].id] : [];
        }
        return keys;
    }

    private getActiveCollection = () => {
        const { collections } = this.props;
        let keys = this.getOpenKeys();
        return collections.find(c => keys.indexOf(c.id) >= 0) || (collections.length > 0 ? collections[0] : null);
    }

    private generateDoc(sortRecords: DtoRecord[]) {

        const { activeEnv, environments } = this.props;
        const activeCollection = this.getActiveCollection();

        if (!activeCollection) {
            return null;
        }

        const activeProjectId = activeCollection.projectId;

        return (
            <PerfectScrollbar ref={ele => this.container = ele} onScrollY={this.onScrollY}>
                <div className="document-toolbar">
                    <span>{LocalesString.get('Project.Environments')}: </span>
                    <EnvironmentSelect
                        className="document-toolbar-env"
                        activeEnvId={activeEnv[activeProjectId] || noEnvironment}
                        activeRecordProjectId={activeCollection.projectId}
                        switchEnvType={DocumentActiveEnvIdType}
                        envs={environments[activeProjectId]}
                        onlyEnvSelect={true}
                    />
                    <Button
                        className="document-toolbar-btn"
                        onClick={() => this.download()}
                        icon="download"
                        type="primary"
                    >
                        {LocalesString.get('Common.Download')}
                    </Button>
                </div>
                <div id="document-main" className="document-main">
                    {
                        sortRecords.filter(r => r.category !== RecordCategory.folder).map(record => {
                            const r = this.applyEnvironmentVariable(record);
                            return (
                                <div key={r.id} className="document-record">
                                    {this.recordName(r.id, r.name, r.method)}
                                    {this.recordUrl(r.url)}
                                    {this.recordDesc(r.description)}
                                    {this.recordParams(r.queryStrings)}
                                    {this.recordHeaders(r.headers)}
                                    {this.recordBody(r.dataMode, r.body, r.formDatas)}
                                </div>
                            );
                        })
                    }
                </div>
            </PerfectScrollbar>
        );
    }

    public render() {
        return this.generateView();
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;
        const { documentActiveRecord, documentCollectionOpenKeys, documentSelectedProject, scrollTop, changeByScroll, activeEnv } = state.documentState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
            activeKey: documentActiveRecord,
            openKeys: documentCollectionOpenKeys,
            selectedProject: documentSelectedProject,
            scrollTop,
            changeByScroll,
            activeEnv,
            environments: state.environmentState.environments
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