import { HttpEndpointOptions } from "../../api-endpoint";
import { HttpRequestType } from './http-request-type.enum';
import { HttpPostOptions } from "./http-post";

export interface IHttpTypeParameters<T> {
  type: HttpRequestType;
  options?: HttpEndpointOptions | HttpPostOptions<T>;
}