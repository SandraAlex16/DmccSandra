import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './SpecialOffersListingUatWebPart.module.scss';
import * as strings from 'SpecialOffersListingUatWebPartStrings';

import { SPComponentLoader } from '@microsoft/sp-loader';

export interface ISpecialOffersListingUatWebPartProps {
  description: string;
  firstSite: string;
}

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import dmccSpecialOffers from './DmccSpecialOffersListing';

export interface ISPLists {
  value: ISPList[];
}
export interface ISPList {
  DMCCDiscountCode: any;
  DMCCShopName: any;
  DMCCLocation: any;
  Title: string,
  DMCCStartDate: string,
  DMCCEndDate: string;
  DMCCContents: string;
  DMCCShortDesc: string;
  BayzatOfferImageLink: any;
  OfferName: any;
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

export default class SpecialOffersListingUatWebPart extends BaseClientSideWebPart<ISpecialOffersListingUatWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private itemsToDisplay: number = 6;
  private items: any[] = [];
  // private BtnYearDDL: HTMLButtonElement;
  // private BtnMonthDDL: HTMLButtonElement;
  private SearchTextInput: HTMLInputElement;
  public filterCriteria: any = [];

  public searchNewText: any;

  public listName = "SpecialOffers";
  public baseUrl = ""
  public LetterTyped: any = '';
  public stringFilter: string = '';
  private BtnLoadMoreSpecialOffers: HTMLButtonElement;
  public today = new Date().toISOString().slice(0, 20) + "000Z";
  public selectedTab: any = "Special Offer";
  //  private _FirstSite = "/sites/DMCC-Intranet-Prod";
 private _FirstSite = "/sites/DMCCDev";
  private countsMap: Map<number, { likeCount: number; commentCount: number }> = new Map();
  private dmccSpecialOffers = new dmccSpecialOffers();
  allItems: any[] = [];


  private loadDistinctYears(): void {
    const endpointUrl: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('SpecialOffers')/items?$select=DMCCEndDate,DMCCStartDate&$orderby=DMCCEndDate asc`;

    this.context.spHttpClient.get(endpointUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log('Failed to load data from SharePoint. Error: ' + response.statusText);
        }
      })
      .then((data: any) => {
        if (data && data.value) {
          const years: number[] = this.getDistinctYears(data.value);
          this.populateDropdown(years);
        }
      });
  }

  private getDistinctYears(items: any[]): any {
    const yearsSet: Set<number> = new Set();

    for (const item of items) {
      if (item.DMCCEndDate) {
        const year: number = new Date(item.DMCCEndDate).getFullYear();
        yearsSet.add(year);
      }
      if (item.DMCCStartDate) {
        const year: number = new Date(item.DMCCStartDate).getFullYear();
        yearsSet.add(year);
      }
    }

    return yearsSet;
  }

  private populateDropdown(years: any): void {

    // let dropdown: any = this.domElement.querySelector('#year-dropdown');
    // if (dropdown) {
    //   let options: any = [];
    //   years.forEach((value: number) => {
    //     // loop entries one by one
    //     options.push(value);// = options + `<option class='dropdown-item' value='${value}'>${value}</option>`;
    //   })
    //   options = options.reverse();
    //   let options2 = "";
    //   for (let val of options) {
    //     options2 = options2 + `<option class='dropdown-item' value='${val}'>${val}</option>`;
    //   }
    //   dropdown.innerHTML = `<div class="dropdown-menu year-dropdown-menu" aria-labelledby="year-dropdown">` + options2 + `</div>`;
    //   this.BtnYearDDL.value = new Date().getFullYear().toString();
    // }


    // this.BtnMonthDDL = this.domElement.querySelector("#month-dropdown") as HTMLButtonElement;

    // //var currentMonth = new Date().toLocaleString('en-us',{month:'long', year:'numeric'}).toString().split(' ')[0];
    // this.BtnMonthDDL.value = "All";
    // if (this.BtnMonthDDL !== null) {
    //   this.BtnMonthDDL.addEventListener("change", () => this.DDLChangeYearMonth());
    // }

    this.BtnLoadMoreSpecialOffers = this.domElement.querySelector("#BtnLoadMoreSpecialOffers") as HTMLButtonElement;
    if (this.BtnLoadMoreSpecialOffers !== null) {
      this.BtnLoadMoreSpecialOffers.addEventListener("click", () => this.loadMoreItems());
    }

    var inputId = document.getElementById('searchSpecialOffersId');
    if (inputId) inputId.addEventListener("keyup", (event) => {
      this.SearchBoxMethod(event)

    });

    // this.loadItems();
    this.DDLChangeYearMonth();
  }
      private DDLChangeYearMonth(): void {

    this.filterCriteria = [];
    // var DDLSelectedMonth = (<HTMLInputElement>document.getElementById("month-dropdown")).value.toLowerCase();
    // var MonthNumber: any;
    // var DayEnd: any;
    // if (DDLSelectedMonth.toLocaleLowerCase() == "january") {
    //   MonthNumber = '01'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "february") {
    //   MonthNumber = '02'
    //   DayEnd = '28'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "march") {
    //   MonthNumber = '03'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "april") {
    //   MonthNumber = '04'
    //   DayEnd = '30'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "may") {
    //   MonthNumber = '05'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "june") {
    //   MonthNumber = '06'
    //   DayEnd = '30'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "july") {
    //   MonthNumber = '07'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "august") {
    //   MonthNumber = '08'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "september") {
    //   MonthNumber = '09'
    //   DayEnd = '30'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "october") {
    //   MonthNumber = '10'
    //   DayEnd = '31'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "november") {
    //   MonthNumber = '11'
    //   DayEnd = '30'
    // }
    // if (DDLSelectedMonth.toLocaleLowerCase() == "december") {
    //   MonthNumber = '12'
    //   DayEnd = '31'
    // }
    // var DDLSelectedYear = (<HTMLInputElement>document.getElementById("")).value;

    // var monthstartString = `${DDLSelectedYear}-${MonthNumber}-01`
    // var monthendString = `${DDLSelectedYear}-${MonthNumber}-${DayEnd}`
    // if (DDLSelectedMonth.toLocaleLowerCase() == "all") {
    //   var monthstartString = `${DDLSelectedYear}-01-01`
    //   var monthendString = `${DDLSelectedYear}-12-31`
    // }

    var Datefilter = `OfferName eq '${this.selectedTab}' and DMCCIsActive eq 1  ` //and (DMCCEndDate ge '${this.today}')
    this.filterCriteria.push(`${Datefilter}`);
    console.log("Month :" + this.filterCriteria);

    this.itemsToDisplay = 6;
    this.loadItems();
  }

 private loadItems(): void {


    var filter;

    if (this.filterCriteria.length > 0 && this.stringFilter.length > 0) {
      filter = `$filter=${this.stringFilter} and ${this.filterCriteria.join(' and ')}`;
    }
    else
    if (this.filterCriteria.length > 0) {
      filter = `$filter=${this.filterCriteria.join(' and ')}`;
    }
    /*else if(this.stringFilter.length > 0){
      filter  =`$filter=${this.stringFilter}`
    }*/
    else {
      filter = '';
    }

    if (filter == `$filter=`) filter = ``;
    let topCount = (this.searchNewText && this.searchNewText !== "") ? 5000 : this.itemsToDisplay;
     this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?${filter}&$top=${topCount}&$orderby=DMCCStartDate desc`;


    // this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?${filter}&$top=${this.itemsToDisplay}&$orderby=DMCCStartDate desc`;
    console.log(this.baseUrl);

    /*const listName = "SpecialOffers";  
    const endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items?$top=${this.itemsToDisplay}&$orderby=Created desc`;*/

    this.context.spHttpClient.get(this.baseUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
      })
      .then(async (data) => {
        this.items = data.value;
        await this.fetchCounts();
        this.renderItems();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private loadMoreItems(): void {
    this.itemsToDisplay += 6; // Increase the number of items to display
    this.loadItems();
  }


  private SearchBoxMethod(event: any): void {

        console.log(`key=${event.key},code=${event.code}`);
        this.SearchTextInput = this.domElement.querySelector("#searchSpecialOffersId") as HTMLInputElement;
        this.stringFilter = '';
  
        if (!this.SearchTextInput.value) {

          if (this.SearchTextInput.value.length > 0) this.searchNewText = this.SearchTextInput.value;
          else { this.searchNewText = ""; this.stringFilter = ""; }
        }
        else {

          this.searchNewText = this.SearchTextInput.value;
          this.stringFilter = "";//`substringof('${this.SearchTextInput.value}',Title)`

        }

        this.DDLChangeYearMonth();

  }



private async fetchCounts(): Promise<void> {
  this.countsMap = new Map<number, { likeCount: number; commentCount: number }>();

  await Promise.all(this.items.map(async (item) => {
    const likeCount = await this._getLikeCount(Number(item.ID));
    const commentCount = await this._getCommentCount(Number(item.ID));
    this.countsMap.set(item.ID, { likeCount, commentCount });
  }));
}


 private renderItems(): void {
    const SpecialOfferList = this.domElement.querySelector("#SpecialOfferListings");

    const tempElement = document.createElement('div');

    if (SpecialOfferList) {
      SpecialOfferList.innerHTML = ""; // Clear existing items


      if (this.items.length < this.itemsToDisplay) {
        this.BtnLoadMoreSpecialOffers.style.visibility = "hidden";
      }
      else if (this.items.length >= this.itemsToDisplay) {
        this.BtnLoadMoreSpecialOffers.style.visibility = "visible";
      }


      let items2 = this.items;
      if (this.searchNewText && this.searchNewText != "") {
        items2 = [];
        for (var x = 0; x < this.items.length; x++) {

          let item = this.items[x];
          if ((item.Title != null && item.Title.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCShortDesc != null && item.DMCCShortDesc.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCContents != null && item.DMCCContents.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCDepartment != null && item.DMCCDepartment.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCLocation != null && item.DMCCLocation.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCShopName != null && item.DMCCShopName.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
            (item.DMCCDiscountCode != null && item.DMCCDiscountCode.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1)) {
            items2.push(item);
          }
        }
        
      } else { items2 = this.items; }

    if (items2.length >= this.itemsToDisplay) {
        this.BtnLoadMoreSpecialOffers.style.visibility = "visible";
      } else {
        this.BtnLoadMoreSpecialOffers.style.visibility = "hidden";
      }

  // Only display up to itemsToDisplay
  const itemsToRender = items2.slice(0, this.itemsToDisplay);


    let allElementsHtml: any = "";

      itemsToRender.forEach((item) => {
        let DMCCImage: any = item.DMCCImage;

        tempElement.innerHTML = item.DMCCShortDesc;
        item.DMCCShortDesc = (tempElement.textContent + "").substring(0, 81);

        /*if(item.DMCCImage !== null){ DMCCImage = window.location.protocol + "//" + window.location.host + 
        (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
        }*/

        if(item.OfferName == 'Bayzat Offer'){
          if(item.BayzatOfferImageLink == null){
            DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
          }
          else{
            DMCCImage = item.BayzatOfferImageLink;
          }         
        }
        else if (DMCCImage == undefined || DMCCImage == null) 
          {
            DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
          }
        else if(item.DMCCImage.match('serverRelativeUrl') == null){
        var Image = JSON.parse(item.DMCCImage).fileName;
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/SpecialOffers/Attachments/${item.ID}/${Image}`;
        }
        else{
          DMCCImage = window.location.protocol + "//" + window.location.host + 
          (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
        }


     /*   if (item.DMCCImage == null || DMCCImage.match('serverRelativeUrl":(.*),"id') == null) {
          DMCCImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
        }
        else {
          DMCCImage = window.location.protocol + "//" + window.location.host +
            (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
        }*/



        let SpecialOfferDate: Date;

        let SpecialOffersListingHtml = this.dmccSpecialOffers.SpecialOffersListingHtml;
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

        SpecialOfferDate = new Date(item.DMCCStartDate);
        const options = { month: 'long' } as const;
        let monthname = new Intl.DateTimeFormat('en-US', options).format(SpecialOfferDate);
        let Month = monthname.toString().substring(0, 3);
        let Day = SpecialOfferDate.toString().split(' ', 3)[2];
        var Year = SpecialOfferDate.toString().split(' ', 4)[3];
   
 const counts = this.countsMap.get(item.ID);
const likeCount = counts ? counts.likeCount : 0;
const commentCount = counts ? counts.commentCount : 0;


        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#DAY", Day + "");
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#MONTH", Month + "");
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#YEAR", Year + "");
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#IMGSRC", DMCCImage + "");
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#SpecialOfferID", item.ID)
        SpecialOffersListingHtml = SpecialOffersListingHtml.replace(/#LIKEID/g, item.ID.toString())
         SpecialOffersListingHtml = SpecialOffersListingHtml .replace("#LIKECOUNT", likeCount.toString())
          SpecialOffersListingHtml = SpecialOffersListingHtml .replace(/#ITEMID/g, item.ID.toString())
         SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#CMCNT", commentCount.toString());

        allElementsHtml += SpecialOffersListingHtml;

      });
      SpecialOfferList.innerHTML = allElementsHtml;
this._registerAnnoLikeHandlers();
    }
  }

  // private renderItems(): void {
  //   const SpecialOfferList = this.domElement.querySelector("#SpecialOfferListings");

  //   const tempElement = document.createElement('div');

  //   if (SpecialOfferList) {
  //     SpecialOfferList.innerHTML = ""; // Clear existing items


  //     if (this.items.length < this.itemsToDisplay) {
  //       this.BtnLoadMoreSpecialOffers.style.visibility = "hidden";
  //     }
  //     else if (this.items.length >= this.itemsToDisplay) {
  //       this.BtnLoadMoreSpecialOffers.style.visibility = "visible";
  //     }


  //     let items2 = this.items;
  //     if (this.searchNewText && this.searchNewText != "") {
  //       items2 = [];
  //       for (var x = 0; x < this.items.length; x++) {

  //         let item = this.items[x];
  //         if ((item.Title != null && item.Title.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCShortDesc != null && item.DMCCShortDesc.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCContents != null && item.DMCCContents.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCDepartment != null && item.DMCCDepartment.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCLocation != null && item.DMCCLocation.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCShopName != null && item.DMCCShopName.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCDiscountCode != null && item.DMCCDiscountCode.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1)) {
  //           items2.push(item);
  //         }
  //       }
  //     } else { items2 = this.items; }


  //     let allElementsHtml: any = "";

  //     items2.forEach((item) => {
  //       let DMCCImage: any = item.DMCCImage;

  //       tempElement.innerHTML = item.DMCCShortDesc;
  //       item.DMCCShortDesc = (tempElement.textContent + "").substring(0, 81);

  //       /*if(item.DMCCImage !== null){ DMCCImage = window.location.protocol + "//" + window.location.host + 
  //       (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //       }*/

  //       if(item.OfferName == 'Bayzat Offer'){
  //         if(item.BayzatOfferImageLink == null){
  //           DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
  //         }
  //         else{
  //           DMCCImage = item.BayzatOfferImageLink;
  //         }         
  //       }
  //       else if (DMCCImage == undefined || DMCCImage == null) 
  //         {
  //           DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
  //         }
  //       else if(item.DMCCImage.match('serverRelativeUrl') == null){
  //       var Image = JSON.parse(item.DMCCImage).fileName;
  //       DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/SpecialOffers/Attachments/${item.ID}/${Image}`;
  //       }
  //       else{
  //         DMCCImage = window.location.protocol + "//" + window.location.host + 
  //         (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //       }


  //    /*   if (item.DMCCImage == null || DMCCImage.match('serverRelativeUrl":(.*),"id') == null) {
  //         DMCCImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
  //       }
  //       else {
  //         DMCCImage = window.location.protocol + "//" + window.location.host +
  //           (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //       }*/



  //       let SpecialOfferDate: Date;

  //       let SpecialOffersListingHtml = this.dmccSpecialOffers.SpecialOffersListingHtml;
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

  //       SpecialOfferDate = new Date(item.DMCCStartDate);
  //       const options = { month: 'long' } as const;
  //       let monthname = new Intl.DateTimeFormat('en-US', options).format(SpecialOfferDate);
  //       let Month = monthname.toString().substring(0, 3);
  //       let Day = SpecialOfferDate.toString().split(' ', 3)[2];
  //       var Year = SpecialOfferDate.toString().split(' ', 4)[3];

  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#DAY", Day + "");
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#MONTH", Month + "");
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#YEAR", Year + "");
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#IMGSRC", DMCCImage + "");
  //       SpecialOffersListingHtml = SpecialOffersListingHtml.replace("#SpecialOfferID", item.ID)

  //       allElementsHtml += SpecialOffersListingHtml;

  //     });
  //     SpecialOfferList.innerHTML = allElementsHtml;

  //   }
  // }
  
  
  private _registerAnnoLikeHandlers(): void {
    this.domElement.querySelectorAll('.like-icon').forEach(icon => {
      icon.addEventListener('click', async (event: any) => {
        const likeId = parseInt(event.target.getAttribute('data-like-id'));
        await this._handleLikeClick(likeId);
      });
    });
    this.domElement.querySelectorAll('.like-count').forEach(span => {
      span.addEventListener('click', async (event: MouseEvent) => {
        const announcementId = parseInt((event.target as HTMLElement).id.replace('like-count-', ''));
        const users = await this._getLikedUsers(announcementId);
        this._showLikeUserPopup(users, event);
      });
    });
    
  }
  private _showLikeUserPopup(users: { name: string; pictureUrl: string }[], event: MouseEvent): void {
      // Remove any existing popup
 const oldPopup = document.getElementById("likeUsersPopup");
 if (oldPopup) oldPopup.remove();

 // Create a new popup container
 const popup = document.createElement("div");
 popup.id = "likeUsersPopup";

 // Inline styles (no external CSS)
 popup.setAttribute("style", `
   position: absolute;
   top: ${event.pageY + 10}px;
   left: ${event.pageX}px;
   background: white;
   border: 1px solid #ccc;
   border-radius: 8px;
   padding: 8px;
   box-shadow: 0 2px 6px rgba(0,0,0,0.2);
   z-index: 10000;
 `);

 // If no users liked, show a message
 if (users.length === 0) {
   const noUsersDiv = document.createElement("div");
   noUsersDiv.setAttribute("style", `
     font-size: 13px;
     color: #333;
     padding: 8px;
     text-align: center;
   `);
   noUsersDiv.textContent = "No users liked this post.";
   popup.appendChild(noUsersDiv);
 } else {
   // List the users who liked the post
   users.forEach(user => {
     const userDiv = document.createElement("div");
     userDiv.setAttribute("style", `
       display: flex;
       align-items: center;
       margin-bottom: 6px;
     `);

     const img = document.createElement("img");
     img.src = user.pictureUrl;
     img.alt = user.name;
     img.setAttribute("style", `
       width: 28px;
       height: 28px;
       border-radius: 50%;
       margin-right: 8px;
     `);

     const span = document.createElement("span");
     span.textContent = user.name;
     span.setAttribute("style", "font-size: 13px; color: #333;");

     userDiv.appendChild(img);
     userDiv.appendChild(span);
     popup.appendChild(userDiv);
   });
 }

 document.body.appendChild(popup);

 // Hide popup if clicked outside
 const hidePopup = (e: MouseEvent) => {
   if (!(e.target as HTMLElement).closest("#likeUsersPopup")) {
     popup.remove();
     document.removeEventListener("click", hidePopup);
   }
 };
 setTimeout(() => document.addEventListener("click", hidePopup), 100);
  }
  
  private async _getLikedUsers(offerId: number): Promise<{ name: string; pictureUrl: string }[]> {
    const response = await this.context.spHttpClient.get(
      `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')/items?$filter=Offer/Id eq ${offerId}&$expand=LikedBy&$select=LikedBy/Title,LikedBy/EMail`,
      SPHttpClient.configurations.v1
    );
  
    const data: { value: { LikedBy: { Title: string; EMail: string } }[] } = await response.json();
  
    return data.value.map(item => {
      const name = item.LikedBy?.Title ?? 'Unknown';
      const email = item.LikedBy?.EMail ?? '';
      const pictureUrl = email
        ? `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${email}`
        : `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=s`;
  
      return { name, pictureUrl };
    });
  }
  
  private async _handleLikeClick(offerId: number): Promise<void> {
    const currentUser = await this._getCurrentUser();
    const existingLike = await this._getExistingLike(offerId, currentUser.Id);
  
    if (!existingLike) {
      await this._addLike(offerId, currentUser.Id);
    } else {
      await this._removeLike(existingLike.Id);
    }
  
    const updatedCount = await this._getLikeCount(offerId);
    const countSpan = this.domElement.querySelector(`#like-count-${offerId}`);
    if (countSpan) countSpan.textContent = `Like (${updatedCount})`;
  }
  
  private async _getCommentCount(offerId: number): Promise<number> {
    try {
      const response = await this.context.spHttpClient.get(
        `${this._FirstSite}/_api/web/lists/getbytitle('SpecialofferComments')/items?$filter=OfferId/Id eq ${offerId}&$select=Id`,
        SPHttpClient.configurations.v1
      );
      if (!response.ok) {
        console.error(`Failed to fetch comments for offer ${offerId}`);
        return 0;
      }
      const data = await response.json();
      return data.value?.length || 0;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0;
    }
  }
  
  private async _getExistingLike(offerId: number, userId: number): Promise<any> {
    const res = await this.context.spHttpClient.get(
      `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')/items?$filter=Offer/Id eq ${offerId} and LikedById eq ${userId}&$select=Id,Offer/Id&$expand=Offer`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
    return json.value?.length > 0 ? json.value[0] : null;
  }
  
  
  private async _addLike(offerId: number, userId: number): Promise<void> {
    try {
      const typeInfoRes = await this.context.spHttpClient.get(
        `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')?$select=ListItemEntityTypeFullName`,
        SPHttpClient.configurations.v1
      );
  
      if (!typeInfoRes.ok) {
        const errorText = await typeInfoRes.text();
        console.error('Failed to fetch list entity type:', errorText);
        return;
      }
  
      const typeInfo = await typeInfoRes.json();
      const listItemType = typeInfo.ListItemEntityTypeFullName;
  
      const postResponse = await this.context.spHttpClient.post(
        `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-type': 'application/json;odata=verbose',
            'odata-version': ''
          },
          body: JSON.stringify({
            '__metadata': { 'type': listItemType },
            'OfferId': offerId,     // Lookup field
            'LikedById': userId     // Person field
          })
        }
      );
  
      if (!postResponse.ok) {
        const errorText = await postResponse.text();
        console.error('Failed to add like:', errorText);
      }
    } catch (error) {
      console.error('Error while adding like:', error);
    }
  }
  
  private async _getLikeCount(offerId: number): Promise<number> {
    try {
      const endpoint = `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')/items?$filter=Offer/Id eq ${offerId}&$select=Id,Offer/Id&$expand=Offer`;
      const response = await this.context.spHttpClient.get(endpoint, SPHttpClient.configurations.v1);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch likes: ${errorText}`);
        return 0;
      }
  
      const data = await response.json();
      return data.value?.length || 0;
    } catch (error) {
      console.error('Error fetching like count:', error);
      return 0;
    }
  }
  
  
  private async _removeLike(likeId: number): Promise<void> {
    try {
      const response = await this.context.spHttpClient.post(
        `${this._FirstSite}/_api/web/lists/getbytitle('SpecialOffersLikes')/items(${likeId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-HTTP-Method': 'DELETE',
            'If-Match': '*'
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.SpecialOffersLikesListItem' }
          })
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to remove like:', errorText);
      }
    } catch (error) {
      console.error('Error while removing like:', error);
    }
  }
  
  private async _getCurrentUser(): Promise<any> {
    const res = await this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
      SPHttpClient.configurations.v1
    );
    return await res.json();
  }

  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    let xhtml = this.dmccSpecialOffers.html;
    xhtml = xhtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

    this.domElement.innerHTML = xhtml;
    var bayzatOfferTab : HTMLButtonElement;
    var specialOfferTab : HTMLButtonElement;
    /*
    //year logic 
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    
    }*/


    // this.BtnYearDDL = this.domElement.querySelector("#year-dropdown") as HTMLButtonElement;
    // this.BtnYearDDL.value = new Date().getFullYear().toString();
    // if (this.BtnYearDDL !== null) {
    //   this.BtnYearDDL.addEventListener("change", () => this.DDLChangeYearMonth());
    // }

    bayzatOfferTab = this.domElement.querySelector("#bayzatOfferTab") as HTMLButtonElement;
    if (bayzatOfferTab !== null) {
      bayzatOfferTab.addEventListener("click", () => 
       { 
        this.selectedTab = 'Bayzat Offer';
        this.DDLChangeYearMonth();
       }
      )
    }
    specialOfferTab = this.domElement.querySelector("#specialOfferTab") as HTMLButtonElement;
    if (specialOfferTab !== null) {
      specialOfferTab.addEventListener("click", () => 
        {
          this.selectedTab = 'Special Offer';
          this.DDLChangeYearMonth();
         }
      );
    }


    this.loadDistinctYears();




    let divWrapper: any = document.querySelector('#divWrapper');
    setTimeout(() => {
      divWrapper?.removeAttribute("style");
    }, 1500);

    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
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
      return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/custom.js?v=` + new Date().getTime());
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
