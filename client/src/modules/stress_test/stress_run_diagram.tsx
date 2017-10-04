import React from 'react';
import { DtoRecord } from '../../../../api/interfaces/dto_record';
import * as _ from 'lodash';
import * as ReactDOM from 'react-dom';
import './style/index.less';
import { StressRunResult } from '../../../../api/interfaces/dto_stress_setting';

interface StressConsoleProps {

    runState?: StressRunResult;

    records: _.Dictionary<DtoRecord>;

    envNames: _.Dictionary<string>;
}

interface StressConsoleState { }

class StressRunDiagram extends React.Component<StressConsoleProps, StressConsoleState> {

    private consoleLastView: HTMLDivElement;

    public componentDidUpdate(prevProps: StressConsoleProps, prevState: StressConsoleState) {
        this.scrollToBottom();
    }

    private scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.consoleLastView);
        node.scrollIntoView({ behavior: 'smooth' });
    }

    public render() {
        const style = { display: this.props.runState ? '' : 'none' };
        return (
            <div style={style} className="schedule-console">
                <div className="schedule-console-content">
                    {
                        JSON.stringify(this.props.runState)
                    }
                    <div style={{ float: 'left', clear: 'both' }} ref={ele => this.consoleLastView = ele} />
                </div>
            </div>
        );
    }
}

export default StressRunDiagram;