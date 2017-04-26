import React from 'react';
import FontIcon from './font_icon';

export type HttpMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;

interface HttpMethodIconProps {
    httpMethod: HttpMethodType;
}

interface HttpMethodIconState { }

class HttpMethodIcon extends React.Component<HttpMethodIconProps, HttpMethodIconState> {
    static defaultColor: string = '#34515e';

    static colorMapping: { [key: string]: string } = {
        GET: '#00e676',
        POST: '#00b0ff',
        PUT: '#651fff',
        DELETE: '#ff1744',
        PATCH: '#fbc02d'
    };

    public render() {
        return (
            <FontIcon color={this.color()} text={this.props.httpMethod} />
        );
    }

    private color: () => string = () => {
        const color = HttpMethodIcon.colorMapping[this.props.httpMethod];
        return color || HttpMethodIcon.defaultColor;
    }
}

export default HttpMethodIcon;