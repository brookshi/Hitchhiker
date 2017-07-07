import React from 'react';
import { Form, Input } from 'antd';
import { DtoRecord } from '../../../../../api/interfaces/dto_record';
import { ValidateStatus, ValidateType } from '../../../common/custom_type';
import RequestUrlPanel from './request_url_panel';
import RequestOptionPanel from './request_option_panel';
import './style/index.less';

const FItem = Form.Item;

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

class RequestPanel extends React.Component<RequestPanelProps, RequestPanelState> {

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

    private onInputChanged = (value: string, type: string) => {
        let record = this.props.activeRecord;
        record[type] = value;

        let nameValidateStatus = this.state.nameValidateStatus;
        if (type === 'name') {
            if ((value as string).trim() === '') {
                nameValidateStatus = ValidateType.warning;
            } else if (this.state.nameValidateStatus) {
                nameValidateStatus = undefined;
            }
        }
        this.onRecordChanged({ ...record });
    }

    private onRecordChanged = (record: DtoRecord) => {
        this.props.onChanged(record);
    }

    private setReqPanel = (ele: any) => {
        this.reqPanel = ele;
    }

    public render() {

        const { nameValidateStatus } = this.state;
        const { activeRecord, style } = this.props;

        return (
            <div ref={this.setReqPanel}>
                <Form className="req-panel" style={style}>
                    <FItem
                        className="req-name"
                        style={{ marginBottom: 8 }}
                        hasFeedback={true}
                        validateStatus={nameValidateStatus}
                    >
                        <Input
                            placeholder="please enter name for this request"
                            spellCheck={false}
                            onChange={(e) => this.onInputChanged(e.currentTarget.value, 'name')}
                            value={activeRecord.name} />
                    </FItem>
                </Form>
                <RequestUrlPanel />
                <RequestOptionPanel />
            </div>
        );
    }
}