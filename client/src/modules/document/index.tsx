import React from 'react';
import { connect, Dispatch } from 'react-redux';

interface ApiDocumentStateProps { }

interface ApiDocumentDispatchProps { }

type ApiDocumentProps = ApiDocumentStateProps & ApiDocumentDispatchProps;

interface ApiDocumentState { }

class ApiDocument extends React.Component<ApiDocumentProps, ApiDocumentState> {
    public render() {
        return (
            <div className="taken-sentence">
                <div>Hope is a good thing and maybe the best of things. And no good thing ever dies.</div>
                <div>-- Shawshank Redemption</div>
            </div>
        );
    }
}

const mapStateToProps = (state: any): ApiDocumentStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>): ApiDocumentDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiDocument);