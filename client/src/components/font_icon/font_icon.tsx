import React from 'react';
import './style/index.less';

interface FontIconProps {
    text: string;
    color: string;
}

interface FontIconState { }

class FontIcon extends React.Component<FontIconProps, FontIconState> {
    public render() {
        return (
            <span
                className="font-icon"
                style={{
                    color: this.props.color
                }}
            >
                {this.props.text}
            </span>
        );
    }
}

export default FontIcon;