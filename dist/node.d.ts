import { Context } from '@xservice/server';
import { IHandleType } from '.';
export declare type TypeMethod = 'ROUTER' | 'GET' | 'POST' | 'PUT' | 'DELETE';
export declare const HttpMethods: Array<TypeMethod>;
export declare enum types {
    STATIC = 0,
    PARAM = 1,
    MATCH_ALL = 2,
    REGEX = 3,
    MULTI_PARAM = 4
}
export interface TypeHandler<T extends Context> {
    handler: IHandleType<T>;
    params: string[];
    paramsLength: number;
}
interface TypeHandlerMethods<T extends Context> {
    ROUTER?: TypeHandler<T>;
    GET?: TypeHandler<T>;
    POST?: TypeHandler<T>;
    PUT?: TypeHandler<T>;
    DELETE?: TypeHandler<T>;
}
interface NodeChildren<T extends Context> {
    [label: string]: Node<T>;
}
interface NodeArguments<T extends Context> {
    prefix?: string;
    children?: NodeChildren<T>;
    kind?: number;
    handlers?: TypeHandlerMethods<T>;
    regex?: RegExp | null;
}
export declare class Handlers<T extends Context> {
    ROUTER: TypeHandler<T> | null;
    GET: TypeHandler<T> | null;
    POST: TypeHandler<T> | null;
    PUT: TypeHandler<T> | null;
    DELETE: TypeHandler<T> | null;
    constructor(handlers?: TypeHandlerMethods<T>);
}
export default class Node<T extends Context> {
    prefix: string;
    label: string;
    children: NodeChildren<T>;
    numberOfChildren: number;
    kind: number;
    regex: RegExp | null;
    wildcardChild: Node<T> | null;
    parametricBrother: Node<T> | null;
    handlers: Handlers<T>;
    constructor(options?: NodeArguments<T>);
    readonly types: typeof types;
    getLabel(): string;
    addChild(node: Node<T>): Node<T>;
    reset(prefix: string): Node<T>;
    findByLabel(path: string): Node<T> | undefined;
    findChild(path: string, method: TypeMethod): Node<T> | null;
    setHandler(method: TypeMethod, handler: IHandleType<T>, params: string[]): void;
    getHandler(method: TypeMethod): TypeHandler<T>;
}
export {};
