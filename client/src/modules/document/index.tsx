import React from 'react';
import { connect, Dispatch, MapStateToPropsFactory } from 'react-redux';
import { State } from '../../state/index';
import { DtoCollection } from '../../../../api/interfaces/dto_collection';
import { getDisplayCollectionSelector } from '../collection/collection_tree/selector';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import HttpMethodIcon from '../../components/font_icon/http_method_icon';
import './style/index.less';

interface ApiDocumentStateProps {

    collections: DtoCollection[];

    records: _.Dictionary<_.Dictionary<DtoRecord>>;
}

interface ApiDocumentDispatchProps { }

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {

    private renderHeaders = (name: string, headers: DtoHeader[]) => {
        return (
            <div>
                <div className="document-header-name">{name}</div>
                {
                    headers.map(h => (
                        <div key={h.id}>
                            <div className="col-2 document-header-key">{h.key}</div>
                            <div className="col-2 document-header-value">{h.value}</div>
                            <div className="col-6 document-header-desc">{h.description}</div>
                        </div>
                    ))
                }
            </div>
        );
    }

    public render() {
        const records = _.sortBy(_.values(this.props.records[this.props.collections[0].id]), r => r.name);
        return (
            <div className="document-main">
                {
                    records.map(r => (
                        <div id={r.id} key={r.id} className="document-record">
                            <div className="document-record-name">
                                <span className="document-method-icon">
                                    <HttpMethodIcon fontSize={16} httpMethod={(r.method || 'GET').toUpperCase()} />
                                </span>
                                {r.name || ''}
                            </div>
                            <div className="document-record-url">{r.url || ''}</div>
                            <div className="document-record-desc">{r.description || ''}</div>
                            <div>{(this.renderHeaders('PARAMS', r.queryStrings || []))}</div>
                            <div>{(this.renderHeaders('HEADERS', r.headers || []))}</div>
                            <div>{r.body || ''}</div>
                        </div>
                    ))
                }
            </div>
        );
    }
}

const makeMapStateToProps: MapStateToPropsFactory<any, any> = (initialState: any, ownProps: any) => {
    const getCollections = getDisplayCollectionSelector();

    const mapStateToProps: (state: State) => ApiDocumentStateProps = state => {
        const { collectionsInfo } = state.collectionState;

        return {
            collections: getCollections(state),
            records: collectionsInfo.records,
        };
    };
    return mapStateToProps;
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(ApiDocument);