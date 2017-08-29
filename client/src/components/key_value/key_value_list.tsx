import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { Input, Checkbox, Icon, AutoComplete } from 'antd';
import './style/index.less';
import { StringUtil } from '../../utils/string_util';
import { DtoHeader } from '../../../../api/interfaces/dto_header';
import { headerKeys, headerValues } from '../../common/constants';

const generateDefaultHeader: () => DtoHeader = () => ({

    id: StringUtil.generateUID(),

    isActive: true
});

interface KeyValueListComponentProps {

    headers: Array<DtoHeader>;

    onChanged: (headers: DtoHeader[]) => void;

    disableActive?: boolean;

    isAutoComplete?: boolean;
}

interface KeyValueListComponentState {

    headers: Array<DtoHeader>;
}

interface SortableElementParam {

    header: DtoHeader;

    hIndex: number;
}

class KeyValueListComponent extends React.Component<KeyValueListComponentProps, KeyValueListComponentState> {

    private DragHandle = SortableHandle(() => <span className="keyvalue-dragicon">☰</span>);

    private SortableItem = SortableElement(({ hIndex, header }: SortableElementParam) => {
        const visibility = { visibility: (hIndex === this.state.headers.length - 1 ? 'hidden' : 'visible') };
        return (
            <li className="keyvalue-item">
                <div style={visibility}>
                    <this.DragHandle />
                    <Checkbox
                        key={`cb${header.id}`}
                        style={this.props.disableActive ? { display: 'none' } : {}}
                        onChange={(e) => this.onValueChange('isActive', hIndex, e)}
                        defaultChecked={header.isActive}
                    />
                </div>
                {this.getInputControl(true, hIndex, header.key)}
                {this.getInputControl(false, hIndex, header.value)}

                <Icon style={visibility} type="close" onClick={(event) => this.onDelItem(hIndex)} />
            </li>
        );
    });

    private getInputControl = (isKey: boolean, hIndex: number, value?: string) => {
        const type = isKey ? 'key' : 'value';
        return this.props.isAutoComplete ? (
            <AutoComplete
                className="autoCompleteInput"
                dataSource={isKey ? headerKeys : headerValues}
                placeholder={type}
                onChange={(e) => this.onValueChange(type, hIndex, e)}
                value={value}
                filterOption={(inputValue, option) => (option as any).props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
            />
        ) : (
                <Input
                    spellCheck={false}
                    onChange={(e) => this.onValueChange(type, hIndex, e)}
                    placeholder={type}
                    value={value}
                />
            );
    }

    private SortableList = SortableContainer(({ headers }) => {
        return (
            <ul>
                {
                    headers.map((header, index) => (
                        <this.SortableItem
                            key={`item_${index}`}
                            index={index}
                            hIndex={index}
                            header={header}
                            disabled={index === this.state.headers.length - 1}
                        />)
                    )
                }
            </ul>
        );
    });

    constructor(props: KeyValueListComponentProps) {
        super(props);
        this.state = { headers: [generateDefaultHeader()] };
    }

    componentWillMount() {
        this.appendIfNeed(this.props);
    }

    componentWillReceiveProps(nextProps: KeyValueListComponentProps) {
        this.appendIfNeed(nextProps);
    }

    private getInitialHeaders(props: KeyValueListComponentProps): DtoHeader[] {
        let headers = [...props.headers];
        if (!headers || headers.length === 0) {
            headers = [generateDefaultHeader()];
        }
        return headers;
    }

    private appendIfNeed = (props: KeyValueListComponentProps) => {
        const headers = this.getInitialHeaders(props);
        const lastHeader = headers[headers.length - 1];
        if (lastHeader.key || lastHeader.value) {
            headers.push(generateDefaultHeader());
        }
        this.setState({ ...this.state, headers: headers });
    }

    private onSortEnd = ({ oldIndex, newIndex }) => {
        let { headers } = this.state;
        headers = arrayMove(headers, oldIndex, newIndex);
        this.onChanged(headers);
    }

    private onValueChange = (type: 'key' | 'value' | 'isActive', index: number, event) => {
        const { headers } = this.state;
        headers[index][type] = type === 'isActive' ? event.target.checked : (typeof event === 'string' ? event : event.target.value);
        this.onChanged(headers);
    }

    private onDelItem = (index: number) => {
        const { headers } = this.state;
        headers.splice(index, 1);
        this.onChanged(headers);
    }

    private onChanged(headers: DtoHeader[]) {
        const { onChanged } = this.props;
        if (onChanged) {
            onChanged(headers);
        }
    }

    public render() {
        const headers = this.state.headers;
        return (
            <this.SortableList className="sortable-list" headers={headers} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default KeyValueListComponent;