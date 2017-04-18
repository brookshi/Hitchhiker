import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

interface CollectionListStateProps { }

interface CollectionListDispatchProps { }

type CollectionListProps = CollectionListStateProps & CollectionListDispatchProps;

interface CollectionListState { }

class CollectionList extends React.Component<CollectionListProps, CollectionListState> {
    constructor(props: CollectionListProps) {
        super(props);

    }

    public render() {
        return (
            <span>Body</span>
        );
    }
}

const mapStateToProps = (state: any): CollectionListStateProps => {
    return {
        // ...mapStateToProps
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