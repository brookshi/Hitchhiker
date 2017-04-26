import React from 'react';
import { Menu, Icon } from 'antd';
import { DtoResCollection } from '../../../../api/interfaces/dto_res';
import './style/index.less';

const SubMenu = Menu.SubMenu;

interface CollectionItemProps {
    collection: DtoResCollection;
    children?: {};
}

interface CollectionItemState { }

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {
    static defaultHeight: number = 30;

    public render() {
        let { collection } = this.props;

        return (
            <SubMenu
                className="collection-item"
                key={collection.id}
                title=
                {
                    <span>
                        <Icon className="c-icon" type="wallet" />
                        <span>
                            {collection.name}
                        </span>
                    </span>
                }
            >
                {this.props.children}
            </SubMenu>
        );
    }
}

export default CollectionItem;