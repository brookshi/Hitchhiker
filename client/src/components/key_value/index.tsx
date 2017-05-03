
import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
//import { DtoResHeader } from "../../../../api/interfaces/dto_res";
import { DtoHeader } from "../../../../api/interfaces/dto_header";
import { Input, Checkbox, Icon } from "antd";
import './style/index.less';
import { StringUtil } from "../../utils/string_util";

type Header = DtoHeader;

const generateDefaultHeader: () => Header = () => ({
    id: StringUtil.generateUID(),
    isActive: true
});

interface KeyValueComponentProps {
    headers?: Array<Header>;
}

interface KeyValueComponentState {
    headers: Array<Header>;
}

interface SortableElementParam {
    header: Header;
    hIndex: number;
}

class KeyValueComponent extends React.Component<KeyValueComponentProps, KeyValueComponentState> {

    private DragHandle = SortableHandle(() => <span>☰</span>);

    private SortableItem = SortableElement(({ hIndex, header }: SortableElementParam) => {
        const visibility = { visibility: (hIndex === this.state.headers.length - 1 ? 'hidden' : 'visible') };
        return (
            <li className="keyvalue-item">
                <div style={visibility}>
                    <this.DragHandle />
                    <Checkbox key={`cb${header.id}`} defaultChecked={header.isActive} />
                </div>
                <Input key={`key${header.id}`} onChange={(e) => this.onValueChange('key', hIndex, e)} placeholder="key" value={header.key} />
                <Input key={`value${header.id}`} onChange={(e) => this.onValueChange('value', hIndex, e)} placeholder="value" value={header.value} />
                <Icon style={visibility} type="close" onClick={(event) => this.onDelItem(hIndex)} />
            </li>
        );
    });

    private SortableList = SortableContainer(({ headers }) => {
        return (
            <ul>
                {
                    headers.map((header, index) => <this.SortableItem key={`item_${index}`} index={index} hIndex={index} header={header} />)
                }
            </ul>
        );
    });

    constructor(props: KeyValueComponentProps) {
        super(props);
        this.state = {
            headers: [
                generateDefaultHeader()
            ],
        };
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        let { headers } = this.state;
        headers = arrayMove(headers, oldIndex, newIndex);
        this.setState({
            ...this.state,
            headers
        });
    }

    onValueChange = (type: 'key' | 'value', index: number, event) => {
        const { headers } = this.state;
        if (type === 'key') {
            headers[index].key = event.target.value;
        } else {
            headers[index].value = event.target.value;
        }
        if (index === headers.length - 1 && event.target.value !== '') {
            headers.push(generateDefaultHeader());
        }
        this.setState({ ...this.state, headers });
    }

    onDelItem = (index: number) => {
        const { headers } = this.state;
        headers.splice(index, 1);
        this.setState({ ...this.state, headers });
    }

    public render() {
        const headers = this.state.headers;
        return (
            <this.SortableList headers={headers} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default KeyValueComponent;