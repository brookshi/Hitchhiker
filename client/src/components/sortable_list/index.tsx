import React from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import './style/index.less';

interface SortableListComponentProps<T> {

    datas: Array<T>;

    buildListItem(data: T, dragHandler: any);

    onChanged(datas: T[]);
}

interface SortableListComponentState { }

interface SortableElementParam<T> {

    header: T;

    hIndex: number;
}

class SortableListComponent<T> extends React.Component<SortableListComponentProps<T>, SortableListComponentState> {

    private DragHandle = SortableHandle(() => <span className="keyvalue-dragicon">☰</span>);

    private SortableItem = SortableElement(({ hIndex, header }: SortableElementParam<T>) => {
        return this.props.buildListItem(header, <this.DragHandle />);
    });

    private SortableList = SortableContainer(({ datas }) => {
        return (
            <ul>
                {
                    datas.map((header, index) => (
                        <this.SortableItem
                            key={`item_${index}`}
                            index={index}
                            hIndex={index}
                            header={header}
                            disabled={index === this.props.datas.length - 1}
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
        let { datas, onChanged } = this.props;
        datas = arrayMove(datas, oldIndex, newIndex);
        onChanged(datas);
    }

    public render() {
        const datas = this.props.datas;
        return (
            <this.SortableList className="sortable-list" datas={datas} onSortEnd={this.onSortEnd} useDragHandle={true} />
        );
    }
}

export default SortableListComponent;