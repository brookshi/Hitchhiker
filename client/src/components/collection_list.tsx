import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
//import { Tree } from 'antd';
import { DtoResCollection } from "../../../api/interfaces/dto_res";
import { fetchCollection } from "../actions/collections";

//const TreeNode = Tree.TreeNode;

interface CollectionListStateProps {
    collections: DtoResCollection[];
}

interface CollectionListDispatchProps {
    refresh: Function;
}

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState { }

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {
    refresh: Function;

    constructor(props: CollectionListProps) {
        super(props);
        this.refresh = props.refresh;
    }

    public componentWillMount() {
        this.refresh();
    }


    public render() {
        // const loop = data => data.map((item) => {
        //     // if (item.children && item.children.length) {
        //     //     return <TreeNode key={item.id} title={item.name}>{loop(item.children)}</TreeNode>;
        //     // }
        //     return <TreeNode key={item.id} title={item.name} />;
        // });
        return (
            //!!this.props.collections ? loop(this.props.collections) :
            <body>no data</body>
        );
    }
}

const mapStateToProps = (state: any): CollectionListStateProps => {
    return {
        collections: []
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): CollectionListDispatchProps => {
    return {
        refresh: () => dispatch(fetchCollection())
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(CollectionList);