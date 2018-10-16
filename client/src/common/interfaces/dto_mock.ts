import { MockMode } from '../enum/mock_mode';
import { DtoBaseItem } from './dto_record';

export interface DtoMock extends DtoBaseItem {

    mode: MockMode;

    res?: string;
}