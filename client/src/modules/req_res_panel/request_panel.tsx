import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import { DtoResRecord } from '../../../../api/interfaces/dto_res';
import { Form, Select, Input } from 'antd';
import { HttpMethod } from '../../common/http_method';

const FItem = Form.Item;
const Option = Select.Option;

interface RequestPanelStateProps {
    activeRecord: DtoRecord | DtoResRecord;
    form?: any;
}

interface RequestPanelState { }

class RequestPanel extends React.Component<RequestPanelStateProps, RequestPanelState> {

    static methods = (
        <Select defaultValue={HttpMethod.GET} style={{ width: 80 }}>
            {
                Reflect.getMetadataKeys(HttpMethod).map(k =>
                    <Option value={{ k }}>{{ k }}</Option>)
            }
        </Select>
    );

    public render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form>
                <FItem hasFeedback>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: true, message: 'Please input name!',
                            }],
                        })(<Input />)
                    }
                </FItem>
            </Form>
        );
    }
}

export default RequestPanel;