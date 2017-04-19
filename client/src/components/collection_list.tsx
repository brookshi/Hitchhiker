import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Tree } from 'antd';
import { DtoCollection } from "../../../api/interfaces/dto_collection";

const TreeNode = Tree.TreeNode;

interface CollectionListStateProps {
    collections: DtoCollection[];
}

interface CollectionListDispatchProps { }

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState { }

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {
    constructor(props: CollectionListProps) {
        super(props);
    }

    public render() {
        const loop = data => data.map((item) => {
            // if (item.children && item.children.length) {
            //     return <TreeNode key={item.id} title={item.name}>{loop(item.children)}</TreeNode>;
            // }
            return <TreeNode key={item.key} title={item.key} />;
        });
        return (
            loop(this.props.collections)
        );
    }
}

const mapStateToProps = (state: any): CollectionListStateProps => {
    return {
        collections: [...state.payload.collections]
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): CollectionListDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);