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

    static textMapping: { [key: string]: string } = {
        DELETE: 'DEL'
    };

    get method() {
        return HttpMethodIcon.textMapping[this.props.httpMethod] || this.props.httpMethod;
    }

    public render() {
        return (
            <FontIcon color={this.color()} text={this.method} />
        );
    }

    private color: () => string = () => {
        const color = HttpMethodIcon.colorMapping[this.props.httpMethod];
        return color || HttpMethodIcon.defaultColor;
    }
}

export default HttpMethodIcon;