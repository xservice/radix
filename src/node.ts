import { Context } from '@xservice/server';
import { IHandleType } from '.';
export type TypeMethod = 'ROUTER' | 'GET' | 'POST' | 'PUT' | 'DELETE';
export const HttpMethods: Array<TypeMethod> = ['ROUTER', 'GET', 'POST', 'PUT', 'DELETE'];

export enum types {
  STATIC,
  PARAM,
  MATCH_ALL,
  REGEX,
  // It's used for a parameter, that is followed by another parameter in the same part
  MULTI_PARAM
}

export interface TypeHandler<T extends Context> {
  handler: IHandleType<T>,
  params: string[],
  paramsLength: number
}

interface TypeHandlerMethods<T extends Context> {
  ROUTER?: TypeHandler<T>,
  GET?: TypeHandler<T>,
  POST?: TypeHandler<T>,
  PUT?: TypeHandler<T>,
  DELETE?: TypeHandler<T>
}

interface NodeChildren<T extends Context> {
  [label: string]: Node<T>,
}

interface NodeArguments<T extends Context> {
  prefix?: string,
  children?: NodeChildren<T>,
  kind?: number,
  handlers?: TypeHandlerMethods<T>,
  regex?: RegExp | null,
}

export class Handlers<T extends Context> {

  public ROUTER: TypeHandler<T> | null = null;
  public GET: TypeHandler<T> | null = null;
  public POST: TypeHandler<T> | null = null;
  public PUT: TypeHandler<T> | null = null;
  public DELETE: TypeHandler<T> | null = null;

  constructor(handlers?: TypeHandlerMethods<T>) {
    handlers = handlers || {};
    for (let i = 0; i < HttpMethods.length; i++) {
      const m: TypeMethod = HttpMethods[i];
      this[m] = (handlers[m] as TypeHandler<T>) || null;
    }
  }
};

export default class Node<T extends Context> {
  public prefix: string;
  public label: string;
  public children: NodeChildren<T>;
  public numberOfChildren: number;
  public kind: number;
  public regex: RegExp | null;
  public wildcardChild: Node<T> | null;
  public parametricBrother: Node<T> | null;
  public handlers: Handlers<T>;

  constructor(options: NodeArguments<T> = {}) {
    this.prefix = options.prefix || '/';
    this.label = this.prefix[0];
    this.children = options.children || {};
    this.numberOfChildren = Object.keys(this.children).length;
    this.kind = options.kind || this.types.STATIC;
    this.handlers = new Handlers<T>(options.handlers);
    this.regex = options.regex || null;
    this.wildcardChild = null;
    this.parametricBrother = null;
  }

  get types() {
    return types;
  }

  getLabel() {
    return this.prefix[0];
  }

  addChild(node: Node<T>): Node<T> {
    let label: string = '';

    switch (node.kind) {
      case this.types.STATIC: label = node.getLabel(); break;
      case this.types.PARAM:
      case this.types.REGEX:
      case this.types.MULTI_PARAM: label = ':'; break;
      case this.types.MATCH_ALL: this.wildcardChild = node; label = '*'; break;
      default: throw new Error(`Unknown node kind: ${node.kind}`);
    }

    if (this.children[label] !== undefined) {
      throw new Error(`There is already a child with label '${label}'`);
    }

    this.children[label] = node;
    this.numberOfChildren = Object.keys(this.children).length;

    const labels: Array<string> = Object.keys(this.children);
    let parametricBrother: Node<T> | null = this.parametricBrother;
    for (let i = 0; i < labels.length; i++) {
      const child: Node<T> = this.children[labels[i]];
      if (child.label === ':') {
        parametricBrother = child;
        break;
      }
    }

    const iterate = (node: Node<T> | null | undefined) => {
      if (!node) return;
      if (node.kind !== this.types.STATIC) return;
      if (node !== this) {
        node.parametricBrother = parametricBrother || node.parametricBrother;
      }
      const labels: Array<string> = Object.keys(node.children);
      for (let i = 0; i < labels.length; i++) {
        iterate(node.children[labels[i]]);
      }
    }

    iterate(this);

    return this;
  }

  reset(prefix: string): Node<T> {
    this.prefix = prefix;
    this.children = {};
    this.kind = this.types.STATIC;
    this.handlers = new Handlers();
    this.numberOfChildren = 0;
    this.regex = null;
    this.wildcardChild = null;
    return this;
  }

  findByLabel(path: string): Node<T> | undefined {
    return this.children[path[0]];
  }

  findChild(path: string, method: TypeMethod): Node<T> | null {
    let child = this.findByLabel(path);
    if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) {
      if (path.slice(0, child.prefix.length) === child.prefix) return child;
    }
    child = this.children[':'] || this.children['*']
    if (child !== undefined && (child.numberOfChildren > 0 || child.handlers[method] !== null)) return child;
    return null;
  }

  setHandler(method: TypeMethod, handler: IHandleType<T>, params: string[]) {
    if (!handler) return;
    if (this.handlers[method] === undefined) throw new Error(`There is already an handler with method '${method}'`);
    this.handlers[method] = {
      handler: handler,
      params: params,
      paramsLength: params.length
    }
  }

  getHandler(method: TypeMethod) {
    return this.handlers[method];
  }
}