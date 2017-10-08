import React from 'react';
import { WorkerStatus } from '../../common/stress_type';
import { primaryColor } from '../../style/theme';
import './style/index.less';

interface IndicatorProps {

    status: WorkerStatus;

    name: string;
}

interface IndicatorState { }

class Indicator extends React.Component<IndicatorProps, IndicatorState> {

    private getColorByStatus = () => {
        switch (this.props.status) {
            case WorkerStatus.idle:
            case WorkerStatus.finish:
                return '#3fb0f0';
            default:
                return primaryColor;
        }
    }

    public render() {
        const { status, name } = this.props;
        const color = this.getColorByStatus();
        const style = { background: color };
        return (
            <span>
                <span className={`${status === WorkerStatus.working ? 'indicator-blink' : ''} indicator-round`} style={style} />
                <span className="indicator-name"> {name}</span>
            </span>
        );
    }
}

export default Indicator;