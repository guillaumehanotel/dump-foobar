import { ColumnConfig, ColumnType } from '../schemaBuilder';
export declare function Column(): Function;
export declare function Column(columnType: ColumnType): Function;
export declare function Column(config: ColumnConfig): Function;
export declare function Column(columnType: ColumnType, config: ColumnConfig): Function;
export default function Column(typeOrConfig?: ColumnType | ColumnConfig, config?: ColumnConfig): any;
