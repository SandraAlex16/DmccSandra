import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './EventListingUatWebPart.module.scss';
import * as strings from 'EventListingUatWebPartStrings';

import { SPComponentLoader } from '@microsoft/sp-loader';



export interface IEventListingUatWebPartProps {
  description: string;
  firstSite: string;
}


import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import dmccUE from './DmccUpcomingEvents'
//import { Properties } from '@fluentui/react';


export interface ISPLists {
  value: ISPList[];
}
export interface ISPList {
  Title: string,
  DMCCStartDate: string,
  DMCCEndDate: string;
  DMCCContents: string;
  DMCCShortDesc: string;

  EndDate: string;
  BannerUrl: {
    Url: string;
  }
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


export default class EventListingUatWebPart extends BaseClientSideWebPart<IEventListingUatWebPartProps> {


  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private _FirstSite = "/sites/DMCCDev";
  private DmccUpcomingEvents = new dmccUE();

  private itemsToDisplay: number = 6;
  private items: any[] = [];
  private BtnLoadMoreUpcomingEvents: HTMLButtonElement;
  private BtnYearDDL: HTMLButtonElement;
  private BtnMonthDDL: HTMLButtonElement;
  private SearchTextInput: HTMLInputElement;
  public filterCriteria: any = [];

  public searchNewText: any;

  public listName = "Events";
  public baseUrl = ""
  public LetterTyped: any = '';
  public stringFilter: string = '';
  public today = new Date().toISOString().slice(0, 20) + "000Z";




  private loadDistinctYears(): void {
    const endpointUrl: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Events')/items?$select=ID,fRecurrence,EventDate,EndDate&$orderby=EndDate asc`;

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
    const today = new Date();
    const futureDateformat = today.setFullYear(today.getFullYear() + 15);
    const futureDate = new Date(futureDateformat).toISOString()

    console.log(futureDate);

    for (const item of items) {
      if (item.EndDate && item.EndDate < futureDate) {
        const year: number = new Date(item.EndDate).getFullYear();
        yearsSet.add(year);
      }
      if (item.StartDate) {
        const year: number = new Date(item.StartDate).getFullYear();
        yearsSet.add(year);
      }
    }
    return yearsSet;
  }

  private populateDropdown(years: any): void {
    let dropdown: any = this.domElement.querySelector('#year-dropdown');
    if (dropdown) {
      let options: any[] = [];
      years.forEach((value: string) => {
        // loop entries one by one
        options.push(value.toString());// = options + `<option class='dropdown-item' value='${value}'>${value}</option>`;
      })

      options = options.reverse();
      let options2 = "";
      for (let val of options) {
        options2 = options2 + `<option class='dropdown-item' value='${val}'>${val}</option>`;
      }
      dropdown.innerHTML = `<div class="dropdown-menu year-dropdown-menu" aria-labelledby="year-dropdown">` + options2 + `</div>`;
      this.BtnYearDDL.value = new Date().getFullYear().toString();
    }


    this.BtnMonthDDL = this.domElement.querySelector("#month-dropdown") as HTMLButtonElement;
    //this.BtnMonthDDL.setAttribute('value', new Date().toLocaleString('en-us',{month:'long', year:'numeric'}).toString().split(' ')[0]);    
    //var currentMonth = new Date().toLocaleString('en-us',{month:'long', year:'numeric'}).toString().split(' ')[0];
    //this.BtnMonthDDL.value = "All";

    // Array of month names
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    var currentDate = new Date();

    // Get the full name of the current month
    var currentMonthFullName = monthNames[currentDate.getMonth()];



    this.BtnMonthDDL.value = currentMonthFullName;
    this.BtnMonthDDL.addEventListener("change", () => this.DDLChangeYearMonth());

    this.BtnLoadMoreUpcomingEvents = this.domElement.querySelector("#BtnLoadMoreUpcomingEvents") as HTMLButtonElement;
    this.BtnLoadMoreUpcomingEvents.addEventListener("click", () => this.loadMoreItems());

    var inputId = document.getElementById('searchUpcomingEventsId');
    if (inputId !== null) {
      inputId.addEventListener("keyup", (event) => { this.SearchBoxMethod(event); });
    }

    // this.loadItems();
    this.DDLChangeYearMonth();


  }


  private loadItems(): void {

    var filter;

    if (this.filterCriteria.length > 0) {
      filter = `$filter=${this.filterCriteria.join(' and ')}`;
    }
    else {
      filter = '';
    }

    this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?${filter}&$top=${this.itemsToDisplay}&$orderby=EventDate desc`;
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
        this.items = data.value;
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



  // private renderItems(): void {
  //   const UpcomingEventsList = this.domElement.querySelector("#UpcomingEventsListings");

  //   const tempElement = document.createElement('div');

  //   if (UpcomingEventsList) {
  //     UpcomingEventsList.innerHTML = ""; // Clear existing items

  //     let allElementsHtml: any = "";

  //     if (this.items.length < this.itemsToDisplay) {
  //       this.BtnLoadMoreUpcomingEvents.style.visibility = "hidden";
  //     }
  //     else if (this.items.length >= this.itemsToDisplay) {
  //       this.BtnLoadMoreUpcomingEvents.style.visibility = "visible";
  //     }



  //     let items2 = this.items;
  //     if (this.searchNewText && this.searchNewText != "") {
  //       items2 = [];
  //       for (var x = 0; x < this.items.length; x++) {

  //         let item = this.items[x];
  //         if ((item.Title != null && item.Title.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCShortDesc != null && item.DMCCShortDesc.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCContents != null && item.DMCCContents.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1) ||
  //           (item.DMCCDepartment != null && item.DMCCDepartment.toLocaleLowerCase().indexOf(this.searchNewText.toLocaleLowerCase()) > -1)) {
  //           items2.push(item);
  //         }
  //       }
  //     } else { items2 = this.items; }


  //     items2.forEach((item) => {
  //       //let DMCCImage:any=item.DMCCImage;

  //       tempElement.innerHTML = item.DMCCShortDesc;
  //       item.DMCCShortDesc = (tempElement.textContent + "").substring(0, 81);

  //       /* if(item.DMCCImage !== null){ DMCCImage = window.location.protocol + "//" + window.location.host + 
  //        (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //        }*/

  //       let UpcomingEventsDate: Date;

  //       let singleElementHtml: any = this.DmccUpcomingEvents.singleElementHtml;
  //       singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);


  //       //const web = new Web(this.context.pageContext.web.absoluteUrl);
  //       // this.getPublishingPage(this.listName,item.Id);

  //       UpcomingEventsDate = new Date(item.EventDate);
  //       const options = { month: 'long' } as const;
  //       let monthname = new Intl.DateTimeFormat('en-US', options).format(UpcomingEventsDate);
  //       let Month = monthname.toString().substring(0, 3);
  //       let Day = UpcomingEventsDate.toString().split(' ', 3)[2];
  //       var Year = UpcomingEventsDate.toString().split(' ', 4)[3];

  //       var EventImage
  //       if (item.BannerUrl !== null) {
  //         EventImage = item.BannerUrl.Url
  //       }
  //       else {
  //         EventImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
  //       }

  //       singleElementHtml = singleElementHtml.replace("#DAY", Day + "");
  //       singleElementHtml = singleElementHtml.replace("#MONTH", Month + "");
  //       singleElementHtml = singleElementHtml.replace("#YEAR", Year + "");
  //       // singleElementHtml = singleElementHtml.replace("#CONTENTS",    item.DMCCShortDesc+"");
  //       singleElementHtml = singleElementHtml.replace("#TITLE", item.Title + "");

  //       let loction = item.Location; loction = loction != null ? loction : "Not Found";

  //       singleElementHtml = singleElementHtml.replace("#LOCATION", loction + "");
  //       singleElementHtml = singleElementHtml.replace("#IMGSRC", EventImage + "");

  //       singleElementHtml = singleElementHtml.replace(new RegExp("#UpcomingEventsID", 'g'), item.ID);

  //       //singleElementHtml = singleElementHtml.replace("#UpcomingEventsID", item.ID)

  //       allElementsHtml += singleElementHtml;

  //     });
  //     UpcomingEventsList.innerHTML = allElementsHtml;

  //   }
  // }
  private async renderItems(): Promise<void>
  {
    const UpcomingEventsList = this.domElement.querySelector("#UpcomingEventsListings");
    const tempElement = document.createElement('div');
  
    if (UpcomingEventsList) {
      UpcomingEventsList.innerHTML = ""; // Clear existing items
  
      let allElementsHtml: string = "";
  
      if (this.items.length < this.itemsToDisplay) {
        this.BtnLoadMoreUpcomingEvents.style.visibility = "hidden";
      } else if (this.items.length >= this.itemsToDisplay) {
        this.BtnLoadMoreUpcomingEvents.style.visibility = "visible";
      }
  
      let items2 = this.items;
  
      if (this.searchNewText && this.searchNewText !== "") {
        items2 = [];
  
        for (let x = 0; x < this.items.length; x++) {
          let item = this.items[x];
          if (
            (item.Title && item.Title.toLowerCase().includes(this.searchNewText.toLowerCase())) ||
            (item.DMCCShortDesc && item.DMCCShortDesc.toLowerCase().includes(this.searchNewText.toLowerCase())) ||
            (item.DMCCContents && item.DMCCContents.toLowerCase().includes(this.searchNewText.toLowerCase())) ||
            (item.DMCCDepartment && item.DMCCDepartment.toLowerCase().includes(this.searchNewText.toLowerCase()))
          ) {
            items2.push(item);
          }
        }
      }
  
      items2.forEach(async (item) => {
        tempElement.innerHTML = item.DMCCShortDesc || "";
        item.DMCCShortDesc = (tempElement.textContent || "").substring(0, 81);
  
        let singleElementHtml: string = this.DmccUpcomingEvents.singleElementHtml;
        singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);
  
        let UpcomingEventsDate = new Date(item.EventDate);
        const options = { month: 'long' } as const;
        let monthname = new Intl.DateTimeFormat('en-US', options).format(UpcomingEventsDate);
        let Month = monthname.substring(0, 3);
        let Day = UpcomingEventsDate.getDate().toString();
        let Year = UpcomingEventsDate.getFullYear().toString();
  
        const likeCount = await this._getEventLikeCount(Number(item.ID));
        const commentCount = await this._getEventCommentCount(Number(item.ID));
  
        let EventImage: string;
        if (item.BannerUrl !== null && item.BannerUrl.Url) {
          EventImage = item.BannerUrl.Url;
        } else {
          EventImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
        }
  
        singleElementHtml = singleElementHtml.replace("#DAY", Day);
        singleElementHtml = singleElementHtml.replace("#MONTH", Month);
        singleElementHtml = singleElementHtml.replace("#YEAR", Year);
        singleElementHtml = singleElementHtml.replace("#TITLE", item.Title || "");
        let loction = item.Location || "Not Found";
        singleElementHtml = singleElementHtml.replace("#LOCATION", loction);
        singleElementHtml = singleElementHtml.replace("#IMGSRC", EventImage);
        singleElementHtml = singleElementHtml.replace(new RegExp("#UpcomingEventsID", 'g'), item.ID.toString());
        singleElementHtml = singleElementHtml.replace("#LIKECOUNT", likeCount.toString());
        singleElementHtml = singleElementHtml.replace("#CMCNT", commentCount.toString());
        singleElementHtml = singleElementHtml.replace(new RegExp("#LIKEID", 'g'), item.ID.toString());
        singleElementHtml = singleElementHtml.replace(new RegExp("#scrollToComments", 'g'), '#commentsContainer');

        allElementsHtml += singleElementHtml;
  
        // After all items processed, update DOM and register events
        if (item === items2[items2.length - 1]) {
          UpcomingEventsList.innerHTML = allElementsHtml;
          this._registerEventLikeHandlers();
        }
      });
    }
  }
  
  
  private _registerEventLikeHandlers(): void {
    this.domElement.querySelectorAll('.like-icon').forEach(icon => {
      icon.addEventListener('click', async (event: any) => {
        const likeId = parseInt(event.target.getAttribute('data-like-id'));
        await this._handleEventLikeClick(likeId);
      });
    });
    this.domElement.querySelectorAll('.like-count').forEach(span => {
      span.addEventListener('click', async (event: MouseEvent) => {
        const eventId = parseInt((event.target as HTMLElement).id.replace('like-count-', ''));
        const users = await this._getEventLikedUsers(eventId);
        this._showEventLikeUserPopup(users, event);
      });
    });
  }
  private _showEventLikeUserPopup(users: { name: string; pictureUrl: string }[], event: MouseEvent): void {
    // Remove any existing popup
 const oldPopup = document.getElementById("likeEventUsersPopup");
 if (oldPopup) oldPopup.remove();

 // Create a new popup container
 const popup = document.createElement("div");
 popup.id = "likeEventUsersPopup";

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
   if (!(e.target as HTMLElement).closest("#likeEventUsersPopup")) {
     popup.remove();
     document.removeEventListener("click", hidePopup);
   }
 };
 setTimeout(() => document.addEventListener("click", hidePopup), 100);
 }
  
  private async _getEventLikedUsers(eventId: number): Promise<{ name: string; pictureUrl: string }[]> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const response = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsLikes')/items?$filter=Events/Id eq ${eventId}&$expand=LikedBy&$select=LikedBy/Title,LikedBy/Id,LikedBy/EMail`,
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
  private async _handleEventLikeClick(eventId: number): Promise<void> {
    const currentUser = await this._getCurrentUser();
    const existingLike = await this._getExistingEventLike(eventId, currentUser.Id);
  
    if (!existingLike) {
      await this._addEventLike(eventId, currentUser.Id);
    } else {
      await this._removeEventLike(existingLike.Id);
    }
  
    const updatedCount = await this._getEventLikeCount(eventId);
    const countSpan = this.domElement.querySelector(`#like-count-${eventId}`);
    if (countSpan) countSpan.textContent = `Like (${updatedCount})`;
  }
private async _getEventLikeCount(eventId: number): Promise<number> {
  try {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const endpoint = `${subsiteUrl}/_api/web/lists/getbytitle('EventsLikes')/items?$filter=Events/Id eq ${eventId}&$select=Id`;

    const response = await this.context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch likes for event ${eventId}:`, errorText);
      return 0;
    }

    const data = await response.json();
    return data.value ? data.value.length : 0;
  } catch (error) {
    console.error('Error fetching like count:', error);
    return 0;
  }
}
private async _getCurrentUser(): Promise<any> {
  const res = await this.context.spHttpClient.get(
    `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
    SPHttpClient.configurations.v1
  );
  return await res.json();
}
  
  

    private async _getEventCommentCount(eventId: number): Promise<number> {
      const subsiteUrl = `${this._FirstSite}/allevents`;
      const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsComments')/items?$filter=EventId eq ${eventId}&$select=Id`,
      SPHttpClient.configurations.v1
    );

    const json = await res.json();
    return json.value.length;
       
  }
  
  private async _getExistingEventLike(eventId: number, userId: number): Promise<any> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsLikes')/items?$filter=Events/Id eq ${eventId} and LikedById eq ${userId}`,
      SPHttpClient.configurations.v1
    );
  
    if (!res.ok) {
      console.error("Failed to fetch existing like:", await res.text());
      return null;
    }
  
    const json = await res.json();
    return json.value?.length > 0 ? json.value[0] : null;
  }
  
  
  
  private async _addEventLike(eventId: number, userId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const body = {
      '__metadata': { 'type': 'SP.Data.EventsLikesListItem' },
      'EventsId': eventId,      // ← Use the internal name of the lookup column + "Id"
      'LikedById': userId
    };
  
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsLikes')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-type': 'application/json;odata=verbose',
          'odata-version': ''
        },
        body: JSON.stringify(body)
      }
    );
  }
  
  
  private async _removeEventLike(likeId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsLikes')/items(${likeId})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'If-Match': '*',
        },
        body: JSON.stringify({ '__metadata': { 'type': 'SP.Data.EventsLikesListItem' } })
      }
    );
  }

  private isLeapYear(year: number): boolean {
    // If the year is divisible by 4
    // and not divisible by 100
    // or if it's divisible by 400
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private hasFeb29(): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Check if the current year is a leap year
    if (this.isLeapYear(currentYear)) {
      // Check if it's February 29th today
      // if (currentDate.getMonth() === 1 && currentDate.getDate() === 29) {
      return true;
      //  }
    }
    return false;
  }

  private DDLChangeYearMonth(): void {

    this.filterCriteria = [];
    var DDLSelectedMonth = (<HTMLInputElement>document.getElementById("month-dropdown")).value.toLowerCase();


    var MonthNumber: any;
    var DayEnd: any;
    if (DDLSelectedMonth.toLocaleLowerCase() == "january") {
      MonthNumber = '01'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "february") {
      MonthNumber = '02';
      DayEnd = this.hasFeb29() ? '29' : '28';

    }

    if (DDLSelectedMonth.toLocaleLowerCase() == "march") {
      MonthNumber = '03'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "april") {
      MonthNumber = '04'
      DayEnd = '30'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "may") {
      MonthNumber = '05';
      DayEnd = '31';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "june") {
      MonthNumber = '06';
      DayEnd = '30';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "july") {
      MonthNumber = '07';
      DayEnd = '31';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "august") {
      MonthNumber = '08';
      DayEnd = '31';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "september") {
      MonthNumber = '09';
      DayEnd = '30';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "october") {
      MonthNumber = '10';
      DayEnd = '31';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "november") {
      MonthNumber = '11';
      DayEnd = '30';
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "december") {
      MonthNumber = '12';
      DayEnd = '31';
    }
    var DDLSelectedYear = (<HTMLInputElement>document.getElementById("year-dropdown")).value;



    var monthstartString = `${DDLSelectedYear}-${MonthNumber}-01`;
    var monthendString = `${DDLSelectedYear}-${MonthNumber}-${DayEnd}`;
    //var Datefilter=`(datetime'${monthstartString}' ge Modified) and (datetime'${monthendString}' le Modified)`
    if (DDLSelectedMonth.toLocaleLowerCase() == "all") {
      var monthstartString = `${DDLSelectedYear}-01-01`;
      var monthendString = `${DDLSelectedYear}-12-31`;
    }

    //var Datefilter = `DMCCIsActive eq 1 and  (  (EventDate ge '${monthstartString}T00:00:00Z' and EventDate le '${monthendString}T23:59:59Z') or (EndDate ge '${monthstartString}T00:00:00Z' and EndDate le '${monthendString}T23:59:59Z')  ) `; //and (EndDate ge '${this.today}')
    var Datefilter = `DMCCIsActive eq 1 and  (  (EventDate ge '${monthstartString}T00:00:00Z' and EventDate le '${monthendString}T23:59:59Z') or (EndDate ge '${monthstartString}T00:00:00Z' and EndDate le '${monthendString}T23:59:59Z') or ( fRecurrence eq 1 and (EventDate le '${monthstartString}T00:00:00Z' and EndDate ge '${monthstartString}T00:00:00Z')) ) `; //and (EndDate ge '${this.today}')
    var De = Datefilter;//+ EndDatefilter;
    //var De = Datefilter + EndDatefilter;

    this.filterCriteria.push(`${De}`);
    //console.log("Month :" + this.filterCriteria);

    this.itemsToDisplay = 6;
    this.loadItems();


  }


  private SearchBoxMethod(event: any): void {

    console.log(`key=${event.key},code=${event.code}`);
    this.SearchTextInput = this.domElement.querySelector("#searchUpcomingEventsId") as HTMLInputElement;
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

  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    let dmccUEhtml = this.DmccUpcomingEvents.html;
    dmccUEhtml = dmccUEhtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);

    this.domElement.innerHTML = dmccUEhtml;


    this.BtnYearDDL = this.domElement.querySelector("#year-dropdown") as HTMLButtonElement;
    this.BtnYearDDL.value = new Date().getFullYear().toString();
    this.BtnYearDDL.addEventListener("change", () => this.DDLChangeYearMonth());

    this.loadDistinctYears();

    let divWrapper: any = document.querySelector('#divWrapper');
    setTimeout(() => {
      divWrapper?.removeAttribute("style");
    }, 1400);



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
