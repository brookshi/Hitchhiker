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
import './style/index.less';
import { DataMode } from '../../common/custom_type';
import { Layout } from 'antd';
import Splitter from '../../components/splitter';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { actionCreator } from '../../action/index';
import { ResizeLeftPanelType, UpdateLeftPanelType } from '../../action/ui';

const { Content, Sider } = Layout;

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;

    collapsed: boolean;

    leftPanelWidth: number;

    activeModule: string;
}

interface ApiDocumentDispatchProps {

    resizeLeftPanel(width: number);

    updateLeftPanelStatus(collapsed: boolean, activeModule: string);
}

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {

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

    private onCollapse = (collapsed) => {
        this.props.updateLeftPanelStatus(collapsed, collapsed ? '' : this.props.activeModule);
    }

    public render() {
        const { collapsed, leftPanelWidth } = this.props;
        const records = _.sortBy(_.values(this.props.records[this.props.collections[0].id]), r => r.name);

        return (
            <Layout className="main-panel">
                <Sider
                    className="main-sider"
                    style={{ minWidth: collapsed ? 0 : leftPanelWidth }}
                    collapsible={true}
                    collapsedWidth="0.1"
                    collapsed={collapsed}
                    onCollapse={this.onCollapse}
                >
                    <CollectionList />
                </Sider>
                <Splitter resizeCollectionPanel={this.props.resizeLeftPanel} />
                <Content style={{ marginTop: 4 }}>
                    <PerfectScrollbar>
                        <div className="document-main">
                            {
                                records.map(r => (
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
                </Content>
            </Layout>
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;
        const { leftPanelWidth, collapsed, activeModule } = state.uiState.appUIState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
            leftPanelWidth,
            collapsed,
            activeModule
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {
        resizeLeftPanel: (width) => dispatch(actionCreator(ResizeLeftPanelType, width)),
        updateLeftPanelStatus: (collapsed, activeModule) => dispatch(actionCreator(UpdateLeftPanelType, { collapsed, activeModule }))
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(ApiDocument);