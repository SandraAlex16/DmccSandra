import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './WpEventListingWebPart.module.scss';

export interface IWpEventListingWebPartProps {
}

export default class WpEventListingWebPart extends BaseClientSideWebPart<IWpEventListingWebPartProps> {
  public render(): void {
    this.domElement.innerHTML = `<div class="${ styles.wpEventListing }"></div>`;
  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}
