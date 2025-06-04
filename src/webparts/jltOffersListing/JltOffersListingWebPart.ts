import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import { SPComponentLoader } from '@microsoft/sp-loader';
import * as strings from 'JltOffersListingWebPartStrings';

export interface IJltOffersListingWebPartProps {
  description: string;
firstSite: string;
}

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import dmccjltOffers from './jltOfferListing';
export interface ISPLists {
  value: ISPList[];
}
export interface ISPList {
  Title: string,
  DMCCStartDate: string,
  DMCCEndDate: string;
  DMCCContents: string;
  DMCCShortDesc: string;
  Author:
  {
    EMail: string;
    Title: string;
  }
  Modified: string;
  ID: string;

  DMCCImage: any;
  URL: {
    Url: string;
  }
  DMCCDepartment: string;
}

export default class JltOffersListingWebPart extends BaseClientSideWebPart<IJltOffersListingWebPartProps> {


  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private itemsToDisplay: number = 6;
  private items: any[] = [];
 
  private SearchTextInput: HTMLInputElement;
  public filterCriteria: any = [];

  public searchNewText: any;

  public listName = "JLTOffers";
  public baseUrl = ""
  public LetterTyped: any = '';
  public stringFilter: string = '';
  private BtnLoadMoreJltOffers: HTMLButtonElement;
  public today = new Date().toISOString().slice(0, 20) + "000Z";
  
  // private _FirstSite = "/sites/DMCC-Intranet-Prod";
  private _FirstSite = "/sites/DMCCDev";

  private dmccjltOffers = new dmccjltOffers();

  private loadItems(): void {
    var filter;

    if (this.filterCriteria.length > 0 && this.stringFilter.length > 0) {
      filter = `$filter=${this.stringFilter} and ${this.filterCriteria.join(' and ')}`;
    }
    else
    if (this.filterCriteria.length > 0) {
      filter = `$filter=${this.filterCriteria.join(' and ')}`;
    }
  
    else {
      filter = '';
    }

    if (filter == `$filter=`) filter = ``;

    this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?&$orderby=StartDate desc`;
    console.log(this.baseUrl);


    this.context.spHttpClient.get(this.baseUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log("Fetched Items:", data.value);
        this.items = data.value;
        this.renderItems();
        data.value.forEach((item: any) => {
         
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private loadMoreItems(): void {
    this.itemsToDisplay += 6; 
    this.renderItems(); 
  }

  private DDLChangeYearMonth(): void {

    this.itemsToDisplay = 6;
    this.loadItems();
  }

private SearchBoxMethod(event: any): void {
    console.log(`key=${event.key}, code=${event.code}`);
    this.SearchTextInput = this.domElement.querySelector("#searchSpecialOffersId") as HTMLInputElement;
    this.stringFilter = '';

    if (this.SearchTextInput.value) {
      this.searchNewText = this.SearchTextInput.value;
    } else {
      this.searchNewText = "";
      this.stringFilter = "";
    }

    this.DDLChangeYearMonth();
  }

  private renderItems(): void {
    const jltOfferList = this.domElement.querySelector("#jltOfferListings");
    const tempElement = document.createElement('div');

    if (jltOfferList) {
      jltOfferList.innerHTML = ""; // Clear existing items

      if (this.items.length < this.itemsToDisplay) {
        this.BtnLoadMoreJltOffers.style.visibility = "hidden";
      } else if (this.items.length >= this.itemsToDisplay) {
        this.BtnLoadMoreJltOffers.style.visibility = "visible";
      }

      let filteredItems = this.items;
      

      if (this.searchNewText && this.searchNewText.trim() !== "") {
        const searchText = this.searchNewText.toLowerCase();
        filteredItems = this.items.filter(item => 
          (item.Title && item.Title.toLowerCase().includes(searchText)) || 
          (item.ShortDescription && item.ShortDescription.toLowerCase().includes(searchText))
        );
      }

      // Only display up to itemsToDisplay number of items
      const displayItems = filteredItems.slice(0, this.itemsToDisplay);
      
      // Update load more button visibility based on filtered results
      if (filteredItems.length <= this.itemsToDisplay) {
        this.BtnLoadMoreJltOffers.style.visibility = "hidden";
      } else {
        this.BtnLoadMoreJltOffers.style.visibility = "visible";
      }

      let allElementsHtml: any = "";

      displayItems.forEach((item) => {
        let DMCCImage: any = item.Image;

        tempElement.innerHTML = item.ShortDescription;
        item.ShortDescription = (tempElement.textContent + "").substring(0, 81);

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

        let SpecialOfferDate: Date;

        let jltOffersListingHtml = this.dmccjltOffers.jltOffersListingHtml;
        jltOffersListingHtml = jltOffersListingHtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

        SpecialOfferDate = new Date(item.StartDate);
        const options = { month: 'long' } as const;
        let monthname = new Intl.DateTimeFormat('en-US', options).format(SpecialOfferDate);
        let Month = monthname.toString().substring(0, 3);
        let Day = SpecialOfferDate.toString().split(' ', 3)[2];
        var Year = SpecialOfferDate.toString().split(' ', 4)[3];

        jltOffersListingHtml = jltOffersListingHtml.replace("#DAY", Day + "");
        jltOffersListingHtml = jltOffersListingHtml.replace("#MONTH", Month + "");
        jltOffersListingHtml = jltOffersListingHtml.replace("#YEAR", Year + "");
        jltOffersListingHtml = jltOffersListingHtml.replace("#CONTENTS", item.ShortDescription + "");
        jltOffersListingHtml = jltOffersListingHtml.replace("#IMGSRC", DMCCImage + "");
        jltOffersListingHtml = jltOffersListingHtml.replace("#jltOfferID", item.ID);
        jltOffersListingHtml = jltOffersListingHtml.replace("#URL", item.LinkUrl?.Url ?? "#");

        allElementsHtml += jltOffersListingHtml;
      });
      
      jltOfferList.innerHTML = allElementsHtml;
    }
  }


  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    let xhtml = this.dmccjltOffers.html;
    xhtml = xhtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

    this.domElement.innerHTML = xhtml;
  
   
    

    var inputId = document.getElementById('searchSpecialOffersId');
    if (inputId) inputId.addEventListener("keyup", (event) => {
      this.SearchBoxMethod(event)

    });

    this.BtnLoadMoreJltOffers = this.domElement.querySelector("#BtnLoadMoreJltOffers") as HTMLButtonElement;
    if (this.BtnLoadMoreJltOffers !== null) {
      this.BtnLoadMoreJltOffers.addEventListener("click", () => this.loadMoreItems());
    }
   
    let divWrapper: any = document.querySelector('#divWrapper');
    setTimeout(() => {
      divWrapper?.removeAttribute("style");
    }, 1500);

    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
    this.loadItems();
  }

  private loadLibraries(): void {

    //add script    
    SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/jquery-3.6.0.js`, {
      globalExportsName: 'jQuery'
    }).catch((error) => {
      console.log("jQuery loader error occurred");
    }).then(() => {
      return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/bootstrap.bundle.min.js`);
    }).then(() => {
      return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/jquery-ui.js`);
    }).then(() => {
      return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/swiper-bundle.min.js?v=` + new Date().getTime());
    }).then(() => {
      return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/offer.js?v=` + new Date().getTime());
    });

  }
  protected onInit(): Promise<void> {

    this._FirstSite = this.properties.firstSite || this._FirstSite;

    this.loadLibraries();


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

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (propertyPath === 'firstSite' && newValue) {
      // Update the custom property value
      this._FirstSite = newValue;
      // Trigger a re-render
      this.render();
    }
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Web Part Settings"
          },
          groups: [
            {
              groupName: "Custom Settings",
              groupFields: [
                PropertyPaneTextField('firstSite', {
                  label: 'Main Site',
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
