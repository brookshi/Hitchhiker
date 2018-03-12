import React from 'react';
import { injectIntl } from 'react-intl';
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';

interface LoInputProps extends InputProps {

    intl: any;

    placeholderId: string;
}

interface LoInputState { }

class LoInput extends React.Component<LoInputProps, LoInputState> {
    public render() {
        const { intl, placeholderId } = this.props;
        return (
            <Input {...this.props} placeholder={intl.formatMessage({ id: placeholderId })} />
        );
    }
}

export default injectIntl(LoInput);