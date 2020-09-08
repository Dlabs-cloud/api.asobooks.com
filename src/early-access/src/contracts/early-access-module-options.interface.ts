import { EarlyAccessRepository } from './early-access-repository.interface';

export interface EarlyAccessModuleOptions {
  /**
   * Is early access enabled? when early access is enabled, the early access will work for all routes
   */
  enabled: boolean;


  /**
   * This is the url to use to access the early access page
   */
  url?: string;

  /**
   * This is the url to access your login page
   */
  loginUrl?: string;

  /**
   * Twitter handle without the @. This will be added to the share message included with the subscription message.
   */
  twitterHandle?: string;

  /**
   * The early access view directory that loads all assets access, HTML, CSS, IMages ets
   */
  viewDir?: string;

  /**
   * This is the index directory to the view. That is the view that will be seen on landing
   */
  index?: string;

  /**
   * The message that will show on twitter when share.
   */
  twiterShareMessage?: string;

  repository?: any;


}