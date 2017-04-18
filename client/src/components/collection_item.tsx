import React from 'react';
import { Collection } from '../../../api/models/collection';

interface ICollectionItemProps extends Collection { }

interface ICollectionItemState { }

class CollectionItem extends React.Component<ICollectionItemProps, ICollectionItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default CollectionItem;