import React from 'react';
import { DtoCollection } from "../../../api/interfaces/dto_collection";

interface ICollectionItemProps extends DtoCollection { }

interface ICollectionItemState { }

class CollectionItem extends React.Component<ICollectionItemProps, ICollectionItemState> {
    public render() {
        return (
            <span>Body</span>
        );
    }
}

export default CollectionItem;