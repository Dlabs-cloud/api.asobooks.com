import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Configuration } from './configuration';
import { AxiosResponseException } from '@dlabs/payment/exception';
import { IllegalArgumentException } from '../../../../src/exception/illegal-argument.exception';


export class Httpclient {
  protected configuration: Configuration | undefined;
  protected axiosInstance: AxiosInstance;

  request = () => {
    return this.axiosInstance;
  };

  constructor(configuration?: Configuration, protected basePath?: string, protected customAxios?: AxiosInstance) {
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath || this.basePath;
    }
    if (customAxios) {
      this.axiosInstance = this.customAxios;
    } else {
      this.axiosInstance = axios.create({
        baseURL: this.basePath,
        headers: {
          Authorization: `Bearer ${this.configuration.apiKey}`,
        },
      });
    }

    this._initializeResponseInterceptor();
  }


  private _initializeResponseInterceptor = () => {
    this.axiosInstance.interceptors.response.use(this._handleResponse, this._handleError);
  };


  private _handleResponse = ({ data }: AxiosResponse) => data;


  private _handleError = (error: any) => {
    if (error && error.response && error.response.status >= 400 && error.response.status <= 499) {
      throw new AxiosResponseException(error.response.status, error.response.data);
    }
    throw new Error(error);
  };
}