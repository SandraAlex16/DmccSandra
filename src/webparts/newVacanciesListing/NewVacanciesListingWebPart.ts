import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './NewVacanciesListingWebPart.module.scss';
import * as strings from 'NewVacanciesListingWebPartStrings';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import DmccNewVacancies from './DmccNewVacancies';

export interface INewVacanciesListingWebPartProps {
  description: string;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  ID: any;
  ReadMoreLink: {
    Url: string;
  }
  Position: string;
  Department: string;
  Icon: any;
}

export default class NewVacanciesListingWebPart extends BaseClientSideWebPart<INewVacanciesListingWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private _FirstSite = "/sites/DMCCDev";

  private async _getListData(apiUrl: string): Promise<ISPLists> {
    //apiUrl=this.context.pageContext.web.absoluteUrl + "/_api/web/lists/GetByTitle('UpcomingBirthdays')/Items?$top=3&$orderby=Modified%20desc";

    return this.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private async _renderListAsync(apiUrl: string): Promise<any> {
    await this._getListData(apiUrl)
      .then((response) => {
          this._renderNewVacancies(response.value);
      });
  }

  private _renderNewVacancies(items: ISPList[]): void {

    let allElementsHtml: string = "";

    items.forEach((item: ISPList) => {
      let singleElementHtml: string = DmccNewVacancies.newVacanciesElement;
      let attachmentUrl = `${this._FirstSite}/SiteAssets/Images/New-vacancy.png`;
      if(!(item.Icon === null)) {
        const pictureData = JSON.parse(item.Icon);
        const fileName = pictureData.fileName;
        attachmentUrl = `${this._FirstSite}/Lists/NewVacancies/Attachments/${item.ID}/${fileName}`;
      }

      singleElementHtml = singleElementHtml.replace("#IMAGEURL", attachmentUrl + "");
      singleElementHtml = singleElementHtml.replace("#POSITION", item.Position + "");
      singleElementHtml = singleElementHtml.replace("#DEPARTMENT", item.Department + "");
      singleElementHtml = singleElementHtml.replace("#REDIRECTLINK", item.ReadMoreLink.Url + "");
      allElementsHtml += singleElementHtml;
    });

    if (allElementsHtml == "") { allElementsHtml = DmccNewVacancies.noRecord; }

    const divVideoGalAllElements: Element | null = this.domElement.querySelector('#homeNewVacancies');
    if (divVideoGalAllElements != null) divVideoGalAllElements.innerHTML = allElementsHtml;
  }

  public async render(): Promise<void> {
    this.domElement.innerHTML = `
  <div class="main-wrapper dev-wrapper min-h-screen-container">
    <div class="container container-gp px-3 px-lg-4 clearfix">
      <div class="w-100 float-start pt-4">
        <div class="row">
          <div class="col-12 mb-4">
            <div class="col-box-wrapper w-100 float-start bg-white gp-shadow d-flex flex-column">
              <div class="col-box-title d-flex bg-white position-relative flex-shrink-0">
                <div class="col-box-icon sqbx-theme-5 d-flex flex-shrink-0 align-items-center justify-content-center">
                  <img class="mw-px-60" src="//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/icons/v2/new-vac.png" />
                </div>
                <div class="flex-grow-1 px-3 overflow-hidden d-flex justify-content-between align-items-center">
                  <p class="text-truncate text-uppercase m-0 font-MyriadProBold">
                    New Vacancies
                  </p>
                </div>
              </div>
              <div id="homeNewVacancies" class="row gap-0 px-4 py-4 gy-4">
                
              </div>
              <!--<div class="w-100 float-start mb-4 mt-4 px-4 d-flex justify-content-center">
                <button class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-lg text-white" type="button">
                  Load More
                </button>
              </div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `;

  let apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('NewVacancies')/items?$select=ID,Position,Department,ReadMoreLink,Icon&$filter=IsActive eq 1&$orderby=Modified%20desc`;
  await this._renderListAsync( apiUrl); 
  }

  protected onInit(): Promise<void> {
    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
