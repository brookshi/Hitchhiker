import * as React from 'react';
import LoInput from '../../locales/input';
import { Form } from 'antd';
import { ValidateStatus, ValidateType } from '../../misc/custom_type';
import './style/index.less';

const FItem = Form.Item;

interface ValidatedNameProps {

    onNameChanged(name: string);

    name: string;
}

interface ValidatedNameState {

    nameValidateStatus?: ValidateStatus;
}

export default class ValidatedName extends React.Component<ValidatedNameProps, ValidatedNameState> {

    constructor(props: ValidatedNameProps) {
        super(props);
        this.state = {};
    }

    public componentWillReceiveProps(nextProps: ValidatedNameProps) {
        this.setState({
            ...this.state,
            nameValidateStatus: nextProps.name.trim() === '' ? ValidateType.warning : undefined
        });
    }

    public render() {
        return (
            <Form className="validated-name-form">
                <FItem
                    className="validated-name"
                    hasFeedback={true}
                    validateStatus={this.state.nameValidateStatus}
                >
                    <LoInput
                        placeholderId="Collection.EnterNameForRequest"
                        spellCheck={false}
                        onChange={(e) => this.props.onNameChanged(e.currentTarget.value)}
                        value={this.props.name}
                    />
                </FItem>
            </Form>
        );
    }
}