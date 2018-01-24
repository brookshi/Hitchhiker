import React from 'react';
import { DtoAssert } from '../../../../api/interfaces/dto_assert';
import { Select, Input } from 'antd';
import { AssertType, AssertTypeFuncMapping } from './assert_funcs';

const Option = Select.Option;

interface AssertItemProps {

    type: AssertType;

    assertInfo: DtoAssert;

    onAssertInfoChanged(assertInfo: DtoAssert);
}

interface AssertItemState { }

class AssertItem extends React.Component<AssertItemProps, AssertItemState> {

    private generateFunctionSelect = () => {
        const { type, assertInfo } = this.props;
        return (
            <Select defaultValue={assertInfo.function} value={assertInfo.function} onChange={func => this.onPropertyChanged('function', func.toString())}>
                {
                    AssertTypeFuncMapping[type].map(k =>
                        <Option key={k} value={k}>{k}</Option>)
                }
            </Select>
        );
    }

    private onPropertyChanged = (key: string, value: string) => {
        const { assertInfo, onAssertInfoChanged } = this.props;
        onAssertInfoChanged({ ...assertInfo, [key]: value });
    }

    public render() {

        const { assertInfo } = this.props;

        return (
            <div>
                <span className="assert-item-func">{this.generateFunctionSelect()}</span>
                <span className="assert-item-value"><Input placeholder="Value" defaultValue={assertInfo.value} value={assertInfo.value} onChange={e => this.onPropertyChanged('value', e.currentTarget.value)} /></span>
                <span className="assert-item-symbol"> assert </span>
                <span className="assert-item-name"><Input placeholder="statement" defaultValue={assertInfo.name} value={assertInfo.name} onChange={e => this.onPropertyChanged('name', e.currentTarget.value)} /></span>
            </div>
        );
    }
}

export default AssertItem;