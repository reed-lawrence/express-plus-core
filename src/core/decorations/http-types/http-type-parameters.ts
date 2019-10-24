import { HttpEndpointOptions } from '../../http-endpoint-options';
import { HttpPostOptions } from './http-post';
import { HttpRequestType } from './http-request-type.enum';

export interface IHttpTypeParameters {
  type: HttpRequestType;
  options?: HttpEndpointOptions | HttpPostOptions;
}
