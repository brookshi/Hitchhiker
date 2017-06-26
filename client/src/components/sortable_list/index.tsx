import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import './style/index.less';

interface SortableListComponentProps<T> {

    items: Array<T>;

    buildListItem(item: T, dragHandler: any);

    onChanged(items: T[]);

    useDragHandler?: boolean;

    height?: number;
}

interface SortableListComponentState { }

class SortableListComponent<T> extends React.Component<SortableListComponentProps<T>, SortableListComponentState> {

    private DragHandle = SortableHandle(() => <span className="keyvalue-dragicon">☰</span>);

    private SortableItem = SortableElement(({ item }) => {
        return this.props.buildListItem(item, <this.DragHandle />);
    });

    private SortableList = SortableContainer(({ items }) => {
        return (
            <ul style={{ height: this.props.height || 200, overflowY: 'auto' }}>
                {
                    items.map((item, index) => (
                        <this.SortableItem
                            key={`item_${index}`}
                            index={index}
                            item={item}
                        />)
                    )
                }
            </ul>
        );
    });

    constructor(props: SortableListComponentProps<T>) {
        super(props);
    }

    private onSortEnd = ({ oldIndex, newIndex }) => {
        let { items, onChanged } = this.props;
        items = arrayMove(items, oldIndex, newIndex);
        onChanged(items);
    }

    public render() {
        return (
            <this.SortableList className="sortable-list" items={this.props.items} onSortEnd={this.onSortEnd} useDragHandle={this.props.useDragHandler} />
        );
    }
}

export default SortableListComponent;