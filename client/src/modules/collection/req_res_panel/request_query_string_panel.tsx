import React from 'react';
import { connect, Dispatch } from 'react-redux';
import KeyValueList from '../../../components/key_value';
import { KeyValueEditType } from '../../../common/custom_type';
import { DtoQueryString } from '../../../../../api/interfaces/dto_variable';
import * as _ from 'lodash';
import { DtoHeader } from '../../../../../api/interfaces/dto_header';
import { UpdateDisplayRecordPropertyType } from '../../../action/record';
import { actionCreator } from '../../../action/index';
import { getActiveRecordSelector } from './selector';
import { StringUtil } from '../../../utils/string_util';

interface RequestQueryStringPanelStateProps {

    url: string;

    queryStrings: DtoQueryString[];
}

interface RequestQueryStringPanelDispatchProps {

    changeRecord(value: { [key: string]: any });
}

type RequestQueryStringPanelProps = RequestQueryStringPanelStateProps & RequestQueryStringPanelDispatchProps;

interface RequestQueryStringPanelState { }

class RequestQueryStringPanel extends React.Component<RequestQueryStringPanelProps, RequestQueryStringPanelState> {

    shouldComponentUpdate(nextProps: RequestQueryStringPanelStateProps, nextState: RequestQueryStringPanelState) {
        const { url, queryStrings } = this.props;
        return url !== nextProps.url || !_.isEqual(queryStrings, nextProps.queryStrings);
    }

    private onValueChanged = (data: DtoHeader[]) => {
        data.forEach((v, i) => v.sort = i);
        this.props.changeRecord({ queryStrings: data, url: StringUtil.stringifyUrl(this.props.url, data) });
    }

    public render() {

        let { queryStrings, url } = this.props;
        if ((!queryStrings || queryStrings.length === 0) && url.includes('?')) {
            queryStrings = StringUtil.parseUrl(url).querys.map((q, i) => ({ ...q, sort: i, isActive: true, id: StringUtil.generateUID() }));
        }

        return (
            <KeyValueList
                mode={KeyValueEditType.keyValueEdit}
                onHeadersChanged={this.onValueChanged}
                isAutoComplete={false}
                headers={_.sortBy(_.cloneDeep(queryStrings) || [], 'sort')}
                showFav={false}
            />
        );
    }
}

const mapStateToProps = (state: any): RequestQueryStringPanelStateProps => {
    const record = getActiveRecordSelector()(state);
    return {
        url: record.url || '',
        queryStrings: record.queryStrings || []
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): RequestQueryStringPanelDispatchProps => {
    return {
        changeRecord: (value) => dispatch(actionCreator(UpdateDisplayRecordPropertyType, value)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RequestQueryStringPanel);