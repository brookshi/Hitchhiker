import React from 'react';
import './style/index.less';

interface FontIconProps {
    text: string;

    color: string;

    size?: number;
}

interface FontIconState { }

class FontIcon extends React.Component<FontIconProps, FontIconState> {
    public render() {
        return (
            <span
                className="font-icon"
                style={{
                    color: this.props.color,
                    fontSize: this.props.size || 12
                }}
            >
                {this.props.text}
            </span>
        );
    }
}

export default FontIcon;