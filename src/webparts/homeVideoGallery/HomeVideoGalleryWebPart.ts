import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './HomeVideoGalleryWebPart.module.scss';
import * as strings from 'HomeVideoGalleryWebPartStrings';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import DmccHomeVideoGallery from './DmccHomeVideoGallery';
import DmccHomeNewJoinee from './DmccHomeNewJoinee';
import DmccHomeNewVacancies from './DmccHomeNewVacancies';
// import { SPComponentLoader } from '@microsoft/sp-loader';

export interface IHomeVideoGalleryWebPartProps {
  description: string;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  ID: any;
  VideoURL: {
    Url: string;
  }
  File: {
    ServerRelativeUrl: string;
  }
  ReadMoreLink: {
    Url: string;
  }
  EmployeeName: {
    Title: string;
  };
  Position: string;
  Department: string;
  EmployeeImage: any;
  Icon: any;
}

export default class HomeVideoGalleryWebPart extends BaseClientSideWebPart<IHomeVideoGalleryWebPartProps> {

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

  private async _renderListAsync(listName: string, apiUrl: string): Promise<any> {
    await this._getListData(apiUrl)
      .then((response) => {
        switch (listName) {
          case "VideoGallery": this._renderVideoGallery(response.value); break;
          case "NewJoinee": this._renderNewJoinee(response.value); break;
          case "NewVacancies": this._renderNewVacancies(response.value); break;
        }
      });
  }

  private _renderVideoGallery(items: ISPList[]): void {

    let allElementsHtml: string = "";

    items.forEach((item: ISPList) => {
      let singleElementHtml: string = DmccHomeVideoGallery.singleElementHtml;
      let imageSrc: any = item.File.ServerRelativeUrl;
      singleElementHtml = singleElementHtml.replace("#IMGSRC", imageSrc + "");
      singleElementHtml = singleElementHtml.replace("#VDOURL", item.VideoURL.Url + "");
      allElementsHtml += singleElementHtml;
    });

    if (allElementsHtml == "") { allElementsHtml = DmccHomeVideoGallery.noRecord; }

    const divVideoGalAllElements: Element | null = this.domElement.querySelector('#divVideoGalAllElements');
    if (divVideoGalAllElements != null) divVideoGalAllElements.innerHTML = allElementsHtml;
  }

  private _renderNewJoinee(items: ISPList[]): void {

    let allElementsHtml: string = "";

    items.forEach((item: ISPList) => {
      let singleElementHtml: string = DmccHomeNewJoinee.newJoineeSingleElement;
      let attachmentUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=s`;

      if(!(item.EmployeeImage === null)) {
        const pictureData = JSON.parse(item.EmployeeImage);
        const fileName = pictureData.fileName;
        attachmentUrl = `${this._FirstSite}/Lists/NewJoinees/Attachments/${item.ID}/${fileName}`;
      }
      
      singleElementHtml = singleElementHtml.replace("#PROFILEIMAGE", attachmentUrl + "");
      singleElementHtml = singleElementHtml.replace("#EMPNAME", item.EmployeeName.Title + "");
      singleElementHtml = singleElementHtml.replace("#EMPPOSITION", item.Position + "");
      singleElementHtml = singleElementHtml.replace("#EMPDEPT", item.Department + "");
      singleElementHtml = singleElementHtml.replace("#TITLE", item.Position +" • "+ item.Department + "");
      singleElementHtml = singleElementHtml.replace("#REDIRECTLINK", item.ReadMoreLink.Url + "");
      allElementsHtml += singleElementHtml;
    });

    if (allElementsHtml == "") { allElementsHtml = DmccHomeVideoGallery.noRecord; }

    const divVideoGalAllElements: Element | null = this.domElement.querySelector('#homeNewJoinees');
    if (divVideoGalAllElements != null) divVideoGalAllElements.innerHTML = allElementsHtml;
  }

  private _renderNewVacancies(items: ISPList[]): void {

    let allElementsHtml: string = "";

    items.forEach((item: ISPList) => {
      let singleElementHtml: string = DmccHomeNewVacancies.newVacanciesElement;
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

    if (allElementsHtml == "") { allElementsHtml = DmccHomeVideoGallery.noRecord; }

    const divVideoGalAllElements: Element | null = this.domElement.querySelector('#homeNewVacancies');
    if (divVideoGalAllElements != null) divVideoGalAllElements.innerHTML = allElementsHtml;

    // @ts-ignore
    var videoSwiper = new Swiper(".video-gallery-slider", {
      loop: false,
      spaceBetween: 10,
      slidesPerView: 1,
      grid: {
        rows: 1,
      },
      navigation: {
        nextEl: ".video-gallery-next",
        prevEl: ".video-gallery-prev",
      },
      breakpoints: {
      768: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        grid: {
          rows: 2,
        },
      }
    },
    });
  }

  public async render(): Promise<any> {

    this.domElement.innerHTML = 
      `
<div class="w-100 float-start">
  <div class="row">
    ${DmccHomeNewJoinee.Html}

    ${DmccHomeVideoGallery.html}
        
    ${DmccHomeNewVacancies.Html}
  </div>
</div>
 `;

    // VIDEO GALLERY
    let apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('VideoGallery')/items?$top=8&$select=*,File/ServerRelativeUrl&$expand=File&$filter=FSObjType%20eq%200&$orderby=Modified%20desc`;
    await this._renderListAsync("VideoGallery", apiUrl); 

    // NEW JOINEES
    apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('NewJoinees')/items?$top=3&$select=ID,EmployeeName/Title,Position,Department,ReadMoreLink,EmployeeImage&$expand=EmployeeName&$filter=IsActive eq 1&$orderby=Modified%20desc`;
    await this._renderListAsync("NewJoinee", apiUrl); 

    // NEW VACANCIES
    apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('NewVacancies')/items?$top=3&$select=ID,Position,Department,ReadMoreLink,Icon&$filter=IsActive eq 1&$orderby=Modified%20desc`;
    await this._renderListAsync("NewVacancies", apiUrl); 
  }

  protected onInit(): Promise<void> {
    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
    // this.loadLibraries();
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  // private loadLibraries(): void {
  //   var _FirstSite: string = "/sites/DMCCDev";
  //   //add script 
  //   SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${_FirstSite}/SiteAssets/js/swiper-bundle.min.js?v=` + new Date().getTime());

  // }

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
