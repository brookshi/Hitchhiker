import React, { SyntheticEvent } from 'react';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import { KeyValuePair } from '../../common/key_value_pair';
import { Input } from 'antd';
import { StringUtil } from '../../utils/string_util';
import KeyValueList from './key_value_list';
import { KeyValueEditMode, KeyValueEditType } from '../../common/custom_type';

interface KeyValueComponentProps {

    headers?: DtoHeader[];

    mode: KeyValueEditMode;

    onHeadersChanged(headers: DtoHeader[]);
}

interface KeyValueComponentState { }

class KeyValueComponent extends React.Component<KeyValueComponentProps, KeyValueComponentState> {

    private onHeadersChanged = (data: SyntheticEvent<any> | DtoHeader[]) => {
        let rst = data as DtoHeader[];
        if (!(data instanceof Array)) {
            rst = StringUtil.stringToKeyValues(data.currentTarget.value) as DtoHeader[];
        } else {
            rst = rst.filter(header => header.key || header.value);
        }
        this.props.onHeadersChanged(rst);
    }

    public render() {
        const headers = this.props.headers as KeyValuePair[];
        return this.props.mode === KeyValueEditType.bulkEdit ?
            (
                <Input
                    className="req-header"
                    type="textarea"
                    spellCheck={false}
                    value={StringUtil.headersToString(headers)} onChange={(e) => this.onHeadersChanged(e)}
                />
            ) :
            (
                <KeyValueList
                    headers={this.props.headers as DtoHeader[]}
                    onChanged={this.onHeadersChanged}
                />
            );
    }
}

export default KeyValueComponent;