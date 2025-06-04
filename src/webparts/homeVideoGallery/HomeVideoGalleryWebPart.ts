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
import DmccHomeJLTOffers from './DmccHomeJLTOffer';
import DmccHomeUptownOffers from './DmccHomeUPTOWNOffers '

export interface IHomeVideoGalleryWebPartProps {
  description: string;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  LinkUrl: any;

  ID: any;
   Image: any;
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
  ShortDescription: string;
   Title: string;
   VideoThumbnail: any;
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
    console.log("Calling _renderListAsync for list:", listName);
    await this._getListData(apiUrl)
      .then((response) => {
        switch (listName) {
   
          case "VideoGallery": this._renderVideoGallery(response.value); break;
          case "NewJoinee": this._renderNewJoinee(response.value); break;
          case "NewVacancies": this._renderNewVacancies(response.value); break;
          case "JLTOffers":this._renderJLTOfferList(response.value); break;
           case "UPTOWNOffers": this._renderUpTownOfferList(response.value); break;   
         

          
        }
      });
  }

 private _renderVideoGallery(items: ISPList[]): void {
 
    let allElementsHtml: string = "";
 
    items.forEach((item: ISPList) => {
      // console.log(item);
      let singleElementHtml: string = DmccHomeVideoGallery.singleElementHtml;
      let imageSrc: any = '';
      if(!(item.VideoThumbnail === null)) {
        const pictureData = JSON.parse(item.VideoThumbnail);
        const fileName = pictureData.fileName;
        imageSrc = `${this._FirstSite}/Lists/Video Gallery/Attachments/${item.ID}/${fileName}`;
      }
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
console.log("vedio gallery")
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

 private _renderJLTOfferList(items: ISPList[]): void {

    let allElementsHtml: string = "";
   items.forEach((item: ISPList) => {
  let singleElementHtml: string = DmccHomeJLTOffers.singleElementHtml; // move this INSIDE the loop

   let DMCCImage:any=item.Image; 
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;

        if (item.Image) {
          try {
            const imageObj = JSON.parse(item.Image);
            
            if (imageObj?.serverRelativeUrl) {
              DMCCImage = `${window.location.protocol}//${window.location.host}${imageObj.serverRelativeUrl}`;
            } else if (imageObj?.fileName) {
              DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/JLTOffers/Attachments/${item.ID}/${imageObj.fileName}`;
            }
          } catch (error) {
            console.warn(`Could not parse Image for item ID ${item.ID}`, error);
          }
        }


  singleElementHtml = singleElementHtml.replace("#TITLE", item.Title + "");
  singleElementHtml = singleElementHtml.replace("#IMGSRC", DMCCImage + "");
  singleElementHtml = singleElementHtml.replace("#SHORTDESC", item.ShortDescription + "");
  singleElementHtml = singleElementHtml.replace("#URL",item.LinkUrl?.Url?? "#");

  allElementsHtml += singleElementHtml;
});


    if (allElementsHtml == "") { allElementsHtml = DmccHomeJLTOffers.noRecord; }

    const divHomeSpecialOffer: Element | null = this.domElement.querySelector('#divHomeSpecialOffer');
    if (divHomeSpecialOffer !== null) divHomeSpecialOffer.innerHTML = allElementsHtml;

  }
  private _renderUpTownOfferList(items: ISPList[]): void {
 
    let allElementsHtml: string = "";

   items.forEach((item: ISPList) => {
  let singleElementHtml: string = DmccHomeUptownOffers.singleElementHtml;
 
   let DMCCImage:any=item.Image; 
       DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;

          if (item.Image) {
            try {
              const imageObj = JSON.parse(item.Image);

              if (imageObj?.serverRelativeUrl) {
                DMCCImage = `${window.location.protocol}//${window.location.host}${imageObj.serverRelativeUrl}`;
              } else if (imageObj?.fileName) {
                DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/UPTOWNOffers/Attachments/${item.ID}/${imageObj.fileName}`;
              }
            } catch (error) {
              console.warn(`Could not parse Image for item ID ${item.ID}`, error);
            }
          }


  singleElementHtml = singleElementHtml.replace("#TITLE", item.Title + "");
  singleElementHtml = singleElementHtml.replace("#IMGSRC", DMCCImage + "");
  singleElementHtml = singleElementHtml.replace("#SHORTDESC", item.ShortDescription + "");
  singleElementHtml = singleElementHtml.replace("#URL",item.LinkUrl?.Url?? "#");

  allElementsHtml += singleElementHtml;
});

    if (allElementsHtml == "") { allElementsHtml = DmccHomeUptownOffers.noRecord; }

    const divHomeUptownOffer: Element | null = this.domElement.querySelector('#divHomeUptownOffer');
    if (divHomeUptownOffer !== null) divHomeUptownOffer.innerHTML = allElementsHtml;

  }




  public async render(): Promise<any> {
 const workbenchContent = document.getElementById('workbenchPageContent'); 

      if (workbenchContent) { 
    
        workbenchContent.style.maxWidth = 'none'; 
    
      }
    this.domElement.innerHTML = 
      `
<div class="w-100 float-start">
  <div class="row">
    ${DmccHomeNewJoinee.Html}

    ${DmccHomeVideoGallery.html}
        
    ${DmccHomeNewVacancies.Html}
     ${DmccHomeJLTOffers.html}
     ${DmccHomeUptownOffers.html}
  </div>
</div>
 `;
const isoToday = new Date().toISOString().split('T')[0] + 'T00:00:00Z';


    // VIDEO GALLERY
    let apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Video Gallery')/items?$top=8&$select=*&$orderby=Modified%20desc`;
    await this._renderListAsync("VideoGallery", apiUrl);

//  JLT OFFERS
    apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('JLTOffers')/items?$top=3&$filter=IsActive eq 1 and EndDate ge datetime'${isoToday}'&$orderby=Modified%20desc&$select=ID,Title,Image,ShortDescription,LinkUrl`;
    await this._renderListAsync("JLTOffers", apiUrl);
// UPTOWN OFFERS
    apiUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('UPTOWNOffers')/items?$top=3&$filter=IsActive eq 1 and EndDate ge datetime'${isoToday}'&$orderby=Modified%20desc&$select=ID,Title,Image,ShortDescription,LinkUrl`;
    await this._renderListAsync("UPTOWNOffers", apiUrl);

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
