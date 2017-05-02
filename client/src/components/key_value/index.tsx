
import React from 'react';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';
import { DtoResHeader } from "../../../../api/interfaces/dto_res";
import { DtoHeader } from "../../../../api/interfaces/dto_header";
import { Input, Checkbox } from "antd";

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
        return (
            <li>
                <this.DragHandle />
                <Checkbox key={`cb_${hIndex}`} checked={header.isActive} />
                <Input key={`key_${hIndex}`} value={header.key} placeholder="key" />
                <Input id={`value_${hIndex}`} key={`value_${hIndex}`} onChange={this.onValueChange} value={header.value} placeholder="value" />
            </li>
        );
    })

    private SortableList = SortableContainer(({ headers }) => {
        return (
            <ul>
                {
                    headers.map((header, index) => <this.SortableItem key={`item_${index}`} index={index} hIndex={index} header={header} />)
                }
            </ul>
        );
    });

    constructor(props) {
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

    onKeyChange = (eventHandler) => {
        const { headers } = this.state;
        if ((eventHandler.target.id as string).endsWith(`_${headers.length - 1}`)) {

            if ((eventHandler.target.value as string).trim() !== '') {
                headers.push({ isActive: true });
                this.setState({ ...this.state, headers });
            }
        }
    }
    onValueChange = (eventHandler) => {
        const { headers } = this.state;
        if ((eventHandler.target.id as string).endsWith(`_${headers.length - 1}`)) {

            if ((eventHandler.target.value as string).trim() !== '') {
                headers.push({ isActive: true });
                this.setState({ ...this.state, headers });
            }
        }
    }

    public render() {
        const headers = this.state.headers;
        return (
            <this.SortableList headers={headers} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default KeyValueComponent;