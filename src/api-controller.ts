import { ApiEndpoint } from './api-endpoint';
import { ServerErrorMessages } from './api-server';
import { ControllerOptions } from './decorators/controller.decorator';
import { IHttpTypeParameters } from './decorators/http-types.decorator';
import { HttpContext } from './http-context';
import { MetadataKeys } from './metadata-keys';

interface IStringOnlyKeys {
  [key: string]: any;
}

export const ControllerKeys = {
  endpoints: '_endpoints',
  route: '_route'
}

export interface IApiController {
  [index: string]: any;
  _id: number;
  _endpoints: ApiEndpoint[],
  _route?: string;
}
