
import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { DtoResHeader } from "../../../../api/interfaces/dto_res";
import { DtoHeader } from "../../../../api/interfaces/dto_header";
import { Input, Checkbox, Icon } from "antd";
import './style/index.less';

type Header = DtoHeader | DtoResHeader;

interface KeyValueComponentProps {
    headers?: Array<Header>;
}

interface KeyValueComponentState {
    headers: Array<Header>;
}

class KeyValueComponent extends React.Component<KeyValueComponentProps, KeyValueComponentState> {

    private DragHandle = SortableHandle(() => <span>☰</span>);

    private SortableItem = SortableElement(({ header, hIndex }) => {
        const visibility = { visibility: (hIndex === this.state.headers.length - 1 ? 'hidden' : 'visible') };
        return (
            <li className="keyvalue-item">
                <div style={visibility}>
                    <this.DragHandle />
                    <Checkbox key={`cb_${hIndex}`} defaultChecked={header.isActive} />
                </div>
                <Input name={`key_${hIndex}`} key={`key_${hIndex}`} onChange={this.onValueChange} placeholder="key">{header.key}</Input>
                <Input name={`value_${hIndex}`} key={`value_${hIndex}`} onChange={this.onValueChange} placeholder="value" >{header.value}</Input>
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
                { isActive: true }
            ],
        };
    }

    onSortEnd = (oldIndex, newIndex) => {
        const { headers } = this.state;

        this.setState({
            ...this.state,
            headers: arrayMove(headers, oldIndex, newIndex),
        });
    }

    onValueChange = (eventHandler) => {
        const { headers } = this.state;
        if ((eventHandler.target.name as string).endsWith(`_${headers.length - 1}`)) {
            if ((eventHandler.target.value as string).trim() !== '') {
                headers.push({ isActive: true });
                this.setState({ ...this.state, headers });
            }
        }
    }

    onDelItem = (index: number) => {
        const { headers } = this.state;
        this.setState({ ...this.state, headers: headers.splice(index, 1) });
    }

    public render() {
        const headers = this.state.headers;
        return (
            <this.SortableList headers={headers} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default KeyValueComponent;