import React from 'react';
import FontIcon from './font_icon';
import { HttpMethodType } from '../../misc/http_method';

interface HttpMethodIconProps {

    httpMethod: HttpMethodType;

    needTextMapping?: boolean;

    fontSize?: number;
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
        DELETE: 'DEL',
        OPTIONS: 'OPT',
        CONNECT: 'CONN'
    };

    get method() {
        const { httpMethod, needTextMapping } = this.props;
        if (!needTextMapping) {
            return httpMethod;
        }
        return HttpMethodIcon.textMapping[httpMethod] || httpMethod;
    }

    public render() {
        return (
            <FontIcon size={this.props.fontSize} color={this.color()} text={this.method} />
        );
    }

    private color: () => string = () => {
        const color = HttpMethodIcon.colorMapping[this.props.httpMethod];
        return color || HttpMethodIcon.defaultColor;
    }
}

export default HttpMethodIcon;