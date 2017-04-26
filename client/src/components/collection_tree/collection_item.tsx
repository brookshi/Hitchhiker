import React from 'react';
import { Icon } from 'antd';
import './style/index.less';

interface CollectionItemProps {
    name: string;
}

interface CollectionItemState { }

class CollectionItem extends React.Component<CollectionItemProps, CollectionItemState> {

    public render() {

        return (
            <span>
                <Icon className="c-icon" type="wallet" />
                <span>
                    {this.props.name}
                </span>
            </span>
        );
    }
}
 
export default CollectionItem;