import React from 'react';
import { connect } from 'react-redux';

interface ApiMockStateProps { }

interface ApiMockDispatchProps { }

type ApiMockProps = ApiMockStateProps & ApiMockDispatchProps;

interface ApiMockState { }

class ApiMock extends React.Component<ApiMockProps, ApiMockState> {
    public render() {
        return (
            <div className="taken-sentence">
                <div>I don’t know if we each have a destiny, or if we’re all just floating around accidental—like on a breeze.</div>
                <div>-- Forrest Gump</div>
            </div>
        );
    }
}

const mapStateToProps = (state: any): ApiMockStateProps => {
    return {
        // ...mapStateToProps
    };
};

const mapDispatchToProps = (): ApiMockDispatchProps => {
    return {
        // ...mapDispatchToProps
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ApiMock);