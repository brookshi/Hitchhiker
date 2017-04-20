import React from 'react';
//import { DtoResCollection } from '../../../api/interfaces/dto_res';

interface ICollectionItemProps { }// extends DtoResCollection { }

interface ICollectionItemState { }

class CollectionItem extends React.Component<ICollectionItemProps, ICollectionItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default CollectionItem;