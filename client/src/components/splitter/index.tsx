import React from 'react';
import './style/index.less';
import { toolBarWidth, minLeftPanelWidth, maxLeftPanelWidth } from '../../common/constants';

interface SplitterProps {

    resizeCollectionPanel(width: number);
}

interface SplitterState { }

class Splitter extends React.Component<SplitterProps, SplitterState> {

    private onSplitterMove = (e) => {
        e.preventDefault();
        const width = Math.min(Math.max(e.clientX - toolBarWidth, minLeftPanelWidth), maxLeftPanelWidth);
        this.props.resizeCollectionPanel(width);
    }

    private onSplitterMouseDown = (e) => {
        if (e.button !== 0) {
            return;
        }
        document.addEventListener('mousemove', this.onSplitterMove);
        document.addEventListener('mouseup', this.onSplitterMouseUp);
        e.preventDefault();
    }

    private onSplitterMouseUp = (e) => {
        document.removeEventListener('mousemove', this.onSplitterMove);
        document.removeEventListener('mouseup', this.onSplitterMouseUp);
        e.preventDefault();
    }

    public render() {
        return (
            <div className="splitter" onMouseDown={this.onSplitterMouseDown} />
        );
    }
}

export default Splitter;