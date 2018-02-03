import React from 'react';
import { DtoAssert } from '../../../../api/interfaces/dto_assert';
import { Select, Input } from 'antd';
import { AssertType, AssertTypeFuncMapping } from './assert_funcs';
import { allEnvironment, noEnvironment } from '../../common/constants';
import { DtoEnvironment } from '../../../../api/interfaces/dto_environment';

const Option = Select.Option;

interface AssertItemProps {

    type: AssertType;

    assertInfo: DtoAssert;

    envs: DtoEnvironment[];

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

    private generateEnvSelect = () => {
        const { assertInfo, envs } = this.props;
        return (
            <Select value={assertInfo.env || 'All'} onChange={func => this.onPropertyChanged('env', func.toString())}>
                <Option key={allEnvironment} value={allEnvironment}>{allEnvironment}</Option>
                <Option key={noEnvironment} value={noEnvironment}>{noEnvironment}</Option>
                {
                    envs.map(e => (
                        <Option key={e.id} value={e.id}>{e.name}</Option>
                    ))
                }
            </Select>
        );
    }

    private onPropertyChanged = (key: string, value: string) => {
        const { assertInfo, onAssertInfoChanged } = this.props;
        onAssertInfoChanged({ ...assertInfo, [key]: value });
    }

    public render() {

        const { assertInfo, type } = this.props;
        const needValue = type !== 'boolean';

        return (
            <span className="assert-item">
                <span className="assert-item-env">{this.generateEnvSelect()}</span>
                <span className="assert-item-func">{this.generateFunctionSelect()}</span>
                {needValue ? <span className="assert-item-value"><Input placeholder="Value" defaultValue={assertInfo.value} value={assertInfo.value} onChange={e => this.onPropertyChanged('value', e.currentTarget.value)} /></span> : ''}
                <span className="assert-item-symbol"> assert </span>
                <span className="assert-item-name"><Input placeholder="statement" defaultValue={assertInfo.name} value={assertInfo.name} onChange={e => this.onPropertyChanged('name', e.currentTarget.value)} /></span>
            </span>
        );
    }
}

export default AssertItem;