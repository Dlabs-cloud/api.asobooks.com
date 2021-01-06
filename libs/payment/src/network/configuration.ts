export interface ConfigurationParameter {
  apiKey?: string | Promise<string>;
  basePath?: string;
}

export class Configuration {
  apiKey?: string | Promise<string>;
  basePath?: string;

  constructor(param: ConfigurationParameter = {}) {
    this.apiKey = param.apiKey;
    this.basePath = param.basePath;
  }
}