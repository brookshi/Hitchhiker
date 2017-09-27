import { StressSetting } from './dto_stress_setting';
import * as WS from 'ws';

export interface StressRequest {

    id: string;

    socket: WS;

    setting: StressSetting;
}