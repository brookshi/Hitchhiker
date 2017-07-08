import React from 'react';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { ValidateStatus } from '../../../common/custom_type';
import RequestUrlPanel from './request_url_panel';
import RequestOptionPanel from './request_option_panel';
import RequestNamePanel from './request_name_panel';
import './style/index.less';

interface RequestPanelStateProps {

    activeRecord: DtoRecord;

    style?: any;

    onChanged(record: DtoRecord);

    onResize(height: number);
}

interface RequestPanelDispatchProps {

    changeRecord(value: { [key: string]: any });
}

type RequestPanelProps = RequestPanelStateProps & RequestPanelDispatchProps;

interface RequestPanelState {

    nameValidateStatus?: ValidateStatus;
}

export default class RequestPanel extends React.Component<RequestPanelProps, RequestPanelState> {

    private reqPanel: any;

    public componentDidMount() {
        this.onResize();
    }

    public componentDidUpdate(prevProps: RequestPanelProps, prevState: RequestPanelState) {
        this.onResize();
    }

    private onResize() {
        if (!this.reqPanel || !this.reqPanel.clientHeight) {
            return;
        }
        this.props.onResize(this.reqPanel.clientHeight);
    }

    private setReqPanel = (ele: any) => {
        this.reqPanel = ele;
    }

    public render() {

        const { style } = this.props;

        return (
            <div ref={this.setReqPanel} style={style}>
                <RequestNamePanel />
                <RequestUrlPanel />
                <RequestOptionPanel />
            </div>
        );
    }
}