import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './NewsListingUatWebPart.module.scss';
import * as strings from 'NewsListingUatWebPartStrings';

import dmccNews from './DmccNews';
import { SPComponentLoader } from '@microsoft/sp-loader';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface INewsListingUatWebPartProps {
  description: string;
  firstSite: string;
}

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

export default class NewsListingUatWebPart extends BaseClientSideWebPart<INewsListingUatWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  private itemsToDisplay: number = 6;
  private items: any[] = [];

  private BtnLoadMoreNews: HTMLButtonElement;
  private BtnYearDDL: HTMLButtonElement;
  private BtnMonthDDL: HTMLButtonElement;
  private SearchTextInput: HTMLInputElement;
  public filterCriteria: any = [];
  public searchNewText: any;
  //public listName = "News"; 
  public baseUrl = ""
  public LetterTyped: any = '';
  public stringFilter: string = '';
  public today = new Date().toISOString().slice(0, 20) + "000Z";
  //public StartAndEndDate =  `and (datetime'${this.today}' ge DMCCStartDate and datetime'${this.today}' le DMCCEndDate)`;

  // private _FirstSite = "/sites/DMCC-Intranet-Prod";
  private _FirstSite = "/sites/DMCCDev";
  private dmccNews = new dmccNews();


  private loadDistinctYears(): void {
    const endpointUrl: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('News')/items?$select=DMCCEndDate,DMCCStartDate&$orderby=DMCCEndDate asc`;

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


    let dropdown: any = this.domElement.querySelector('#year-dropdown');
    if (dropdown) {
      let options: any[] = [];
      years.forEach((value: string) => {
        // loop entries one by one
        options.push(value.toString());// = options + `<option class='dropdown-item' value='${value}'>${value}</option>`;
      })

     // options = options.reverse();
      let options2 = "";
      for (let val of options) {
        options2 = options2 + `<option class='dropdown-item' value='${val}'>${val}</option>`;
      }

      dropdown.innerHTML = `<div class="dropdown-menu year-dropdown-menu" aria-labelledby="year-dropdown">` + options2 + `</div>`;
        this.BtnYearDDL.value = new Date().getFullYear().toString();
    }


    this.BtnMonthDDL = this.domElement.querySelector("#month-dropdown") as HTMLButtonElement;
    // var currentMonth = new Date().toLocaleString('en-us',{month:'long', year:'numeric'}).toString().split(' ')[0];
    this.BtnMonthDDL.value = "All";
    if (this.BtnMonthDDL !== null) {
      this.BtnMonthDDL.addEventListener("change", () => this.DDLChangeYearMonth());
    }


    this.BtnLoadMoreNews = this.domElement.querySelector("#BtnLoadMoreNews") as HTMLButtonElement;
    if (this.BtnLoadMoreNews !== null) {
      this.BtnLoadMoreNews.addEventListener("click", () => this.loadMoreItems());
    }

    var inputId = document.getElementById('searchNewsId');
    if (inputId) inputId.addEventListener("keyup", (event) => {
      this.SearchBoxMethod(event);



    });

    //this.loadItems();
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

    console.log(filter);

    //const listName = "Site Pages";  
    //var today = new Date().toISOString().slice(0,20)+"000Z";
    //var MyFilterQuery = `filter=(IsActive eq 1) and (datetime'${today}' ge DMCCStartDate and datetime'${today}' le DMCCEndDate)`;
    //const endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listName}')/items?$top=${this.itemsToDisplay}&$orderby=Modified desc&$${MyFilterQuery}`;

    this.itemsToDisplay = this.itemsToDisplay != undefined ? this.itemsToDisplay : 6;
    this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('News')/Items?${filter}&$top=${this.itemsToDisplay}&$orderby=DMCCStartDate desc`;
    console.log(this.baseUrl);


    //this.context.spHttpClient.get(this.baseUrl, SPHttpClient.configurations.v1)
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
  //   const NewsList = this.domElement.querySelector("#NewsListings");

  //   const tempElement = document.createElement('div');

  //   if (NewsList) {
  //     NewsList.innerHTML = ""; // Clear existing items

  //     let allElementsHtml: any = "";

  //     if (this.items.length < this.itemsToDisplay) {
  //       this.BtnLoadMoreNews.style.visibility = "hidden";
  //     }
  //     else if (this.items.length >= this.itemsToDisplay) {
  //       this.BtnLoadMoreNews.style.visibility = "visible";
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

  //       let DMCCImage: any = item.DMCCImage;

  //       tempElement.innerHTML = item.DMCCShortDesc;
  //       item.DMCCShortDesc = (tempElement.textContent + "").substring(0, 81);

  //     /*  if (item.DMCCImage == null || DMCCImage.match('serverRelativeUrl":(.*),"id') == null) {
  //         DMCCImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
  //       }
  //       else {
  //         DMCCImage = window.location.protocol + "//" + window.location.host +
  //           (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //       }*/

  //   if (DMCCImage == undefined || DMCCImage == null) 
  //     {
  //       DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
  //     }
  //     else if(item.DMCCImage.match('serverRelativeUrl') == null){
  //       var Image = JSON.parse(item.DMCCImage). fileName;
  //       console.log(this.context.pageContext.web.absoluteUrl);
  //       DMCCImage = `${this.context.pageContext.web.absoluteUrl}/Lists/News/Attachments/${item.ID}/${Image}`;
  //     }
  //     else{
  //       DMCCImage = window.location.protocol + "//" + window.location.host + 
  //       (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //     }    

  //       let NewsDate: Date;

  //       let singleElementHtml = this.dmccNews.singleElementHtml;
  //       singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

  //       NewsDate = new Date(item.DMCCStartDate);
  //       const options = { month: 'long' } as const;
  //       let monthname = new Intl.DateTimeFormat('en-US', options).format(NewsDate);
  //       let Month = monthname.toString().substring(0, 3);
  //       let Day = NewsDate.toString().split(' ', 3)[2];
  //       var Year = NewsDate.toString().split(' ', 4)[3];


  //       singleElementHtml = singleElementHtml.replace("#DAY", Day + "");
  //       singleElementHtml = singleElementHtml.replace("#MONTH", Month + "");
  //       singleElementHtml = singleElementHtml.replace("#YEAR", Year + "");
  //       singleElementHtml = singleElementHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
  //       singleElementHtml = singleElementHtml.replace("#IMGSRC", DMCCImage + "");
  //       singleElementHtml = singleElementHtml.replace("#NewsID", item.ID)

  //       allElementsHtml += singleElementHtml;

  //     });
  //     NewsList.innerHTML = allElementsHtml;

  //   }
  //   this.domElement.style.visibility = 'visible';

  // }
  private async renderItems(): Promise<void> {
    const NewsList = this.domElement.querySelector("#NewsListings");
    const tempElement = document.createElement('div');
  
    if (!NewsList) return;
  
    NewsList.innerHTML = ""; // Clear existing items
  
    let allElementsHtml = "";
  
    // Show/hide Load More button
    this.BtnLoadMoreNews.style.visibility = 
      this.items.length >= this.itemsToDisplay ? "visible" : "hidden";
  
    let filteredItems = this.items;
  
    if (this.searchNewText && this.searchNewText.trim() !== "") {
      const searchLower = this.searchNewText.toLowerCase();
      filteredItems = this.items.filter(item =>
        (item.Title && item.Title.toLowerCase().includes(searchLower)) ||
        (item.DMCCShortDesc && item.DMCCShortDesc.toLowerCase().includes(searchLower)) ||
        (item.DMCCContents && item.DMCCContents.toLowerCase().includes(searchLower)) ||
        (item.DMCCDepartment && item.DMCCDepartment.toLowerCase().includes(searchLower))
      );
    }
  
    for (const item of filteredItems) {
      // Handle short description text content
      tempElement.innerHTML = item.DMCCShortDesc;
      item.DMCCShortDesc = (tempElement.textContent || "").substring(0, 81);
  
      let DMCCImage = item.DMCCImage;
  
      if (!DMCCImage) {
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;
      } else {
        try {
          const parsedImage = JSON.parse(DMCCImage);
          if (parsedImage.serverRelativeUrl) {
            DMCCImage = window.location.protocol + "//" + window.location.host + parsedImage.serverRelativeUrl;
          } else if (parsedImage.fileName) {
            DMCCImage = `${this.context.pageContext.web.absoluteUrl}/Lists/News/Attachments/${item.ID}/${parsedImage.fileName}`;
          }
        } catch (e) {
          // If it's not JSON-parsable, fall back to default
          DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;
        }
      }
  
      const NewsDate = new Date(item.DMCCStartDate);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(NewsDate);
      const Month = monthName.substring(0, 3);
      const Day = NewsDate.getDate().toString();
      const Year = NewsDate.getFullYear().toString();
  
      const likeCount = await this._getLikeCount(Number(item.ID));
      const commentCount = await this._getCommentCount(Number(item.ID));
  
      let singleElementHtml = this.dmccNews.singleElementHtml;
      singleElementHtml = singleElementHtml
        .replace(/_FirstSite/g, this._FirstSite)
        .replace("#DAY", Day)
        .replace("#MONTH", Month)
        .replace("#YEAR", Year)
        .replace("#CONTENTS", item.DMCCShortDesc)
        .replace("#IMGSRC", DMCCImage)
        .replace("#NewsID", item.ID.toString())
        .replace(/#LIKEID/g, item.ID.toString())
        .replace("#LIKECOUNT", likeCount.toString())
        .replace("#CMCNT", commentCount.toString())
        .replace("#commentsContainer", "#commentsContainer");

      allElementsHtml += singleElementHtml;
    }
  
    NewsList.innerHTML = allElementsHtml;
    this._registerLikeEvents();
    this.domElement.style.visibility = 'visible';
  }
  

  private _registerLikeEvents(): void {
    this.domElement.querySelectorAll('.like-icon').forEach(icon => {
      icon.addEventListener('click', async (event: any) => {
        const likeId = parseInt(event.target.getAttribute('data-like-id'));
        await this._handleLikeClick(likeId);
      });
    });
    this.domElement.querySelectorAll('.like-count').forEach(span => {
      span.addEventListener('click', async (event: MouseEvent) => {
        const newsId = parseInt((event.target as HTMLElement).id.replace('like-count-', ''));
        const users = await this._getNewsLikedUsers(newsId);
        this._showNewsLikeUserPopup(users, event);
      });
    });
  }
  private _showNewsLikeUserPopup(users: { name: string; pictureUrl: string }[], event: MouseEvent): void {
    // Remove any existing popup
    const oldPopup = document.getElementById("likeNewsUsersPopup");
    if (oldPopup) oldPopup.remove();
  
    // Create a new popup container
    const popup = document.createElement("div");
    popup.id = "likeNewsUsersPopup";
  
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
      if (!(e.target as HTMLElement).closest("#likeNewsUsersPopup")) {
        popup.remove();
        document.removeEventListener("click", hidePopup);
      }
    };
    setTimeout(() => document.addEventListener("click", hidePopup), 100);
  }
  
  private async _getNewsLikedUsers(newsId: number): Promise<{ name: string; pictureUrl: string }[]> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    const response = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsLikes')/items?$filter=NewsId/Id eq ${newsId}&$expand=LikedBy&$select=LikedBy/Title,LikedBy/Id,LikedBy/EMail`,
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
  private async _getCommentCount(newsId: number): Promise<number> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsComments')/items?$filter=NewsId eq ${newsId}&$select=Id`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
    return json.value.length;
  } 
  
  private async _handleLikeClick(newsId: number): Promise<void> {
    const currentUser = await this._getCurrentUser();
    const existingLike = await this._getExistingLike(newsId, currentUser.Id);
  
    if (!existingLike) {
      // If the user has not liked it yet, add the like
      await this._addLike(newsId, currentUser.Id);
      console.log("Like added");
    } else {
      // If the user has already liked, remove the like
      await this._removeLike(existingLike.Id);
      console.log("Like removed");
    }
  
    // Update the like count after adding/removing the like
    const updatedCount = await this._getLikeCount(newsId);
    const countSpan = this.domElement.querySelector(`#like-count-${newsId}`);
    // if (countSpan) countSpan.textContent = updatedCount.toString();
    if (countSpan) countSpan.textContent = `Like (${updatedCount})`;

  }
  
  private async _removeLike(likeId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    
    const requestBody = {
      '__metadata': { 'type': 'SP.Data.NewsLikesListItem' }
    };
  
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsLikes')/items(${likeId})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-HTTP-Method': 'DELETE',
          'If-Match': '*', // Use '*' to allow the delete action regardless of the version
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    console.log(`Like with ID ${likeId} removed.`);
  }
  
  
  
  private async _getCurrentUser(): Promise<any> {
    const res = await this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
      SPHttpClient.configurations.v1
    );
    return await res.json();
  }
  
  private async _getExistingLike(newsId: number, userId: number): Promise<any> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsLikes')/items?$filter=NewsId eq ${newsId} and LikedById eq ${userId}`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
    return json.value.length > 0 ? json.value[0] : null;
  }
  
  private async _addLike(newsId: number, userId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    const body = {
      '__metadata': { 'type': 'SP.Data.NewsLikesListItem' },
      'NewsId': newsId,
      'LikedById': userId
    };
  
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsLikes')/items`,
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
  
  private async _getLikeCount(newsId: number): Promise<number> {
    const subsiteUrl = `${this._FirstSite}/allnews`;
    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('NewsLikes')/items?$filter=NewsId eq ${newsId}&$select=Id`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
    return json.value.length;
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
      MonthNumber = '02'
      DayEnd = '28'
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
      MonthNumber = '05'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "june") {
      MonthNumber = '06'
      DayEnd = '30'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "july") {
      MonthNumber = '07'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "august") {
      MonthNumber = '08'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "september") {
      MonthNumber = '09'
      DayEnd = '30'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "october") {
      MonthNumber = '10'
      DayEnd = '31'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "november") {
      MonthNumber = '11'
      DayEnd = '30'
    }
    if (DDLSelectedMonth.toLocaleLowerCase() == "december") {
      MonthNumber = '12'
      DayEnd = '31'
    }
    var DDLSelectedYear = (<HTMLInputElement>document.getElementById("year-dropdown")).value;

   // DDLSelectedYear = (DDLSelectedYear.toString().length > 0) ? DDLSelectedYear : (new Date).getFullYear() + "";

    var monthstartString = `${DDLSelectedYear}-${MonthNumber}-01`
    var monthendString = `${DDLSelectedYear}-${MonthNumber}-${DayEnd}`

    if (DDLSelectedMonth.toLocaleLowerCase() == "all") {
      var monthstartString = `${DDLSelectedYear}-01-01`
      var monthendString = `${DDLSelectedYear}-12-31`
    }

    var Datefilter = `DMCCIsActive eq 1 and ((DMCCStartDate  ge '${monthstartString}') and (DMCCStartDate le '${monthendString}')) ` //and (DMCCEndDate ge '${this.today}')
    this.filterCriteria.push(`${Datefilter}`);
    console.log("Month :" + this.filterCriteria);

    this.itemsToDisplay = 6;
    this.loadItems();


  }



  private SearchBoxMethod(event: any): void {

    console.log(`key=${event.key},code=${event.code}`);
    this.SearchTextInput = this.domElement.querySelector("#searchNewsId") as HTMLInputElement;
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
    let xhtml = this.dmccNews.html;
    xhtml = xhtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);

    this.domElement.innerHTML = xhtml;

    this.domElement.style.visibility = "hidden";

    this.BtnYearDDL = this.domElement.querySelector("#year-dropdown") as HTMLButtonElement;
    this.BtnYearDDL.value = new Date().getFullYear().toString();
    this.BtnYearDDL.addEventListener("change", () => this.DDLChangeYearMonth());
   /* if (this.BtnYearDDL !== null) {
      this.BtnYearDDL.addEventListener("change", () => this.DDLChangeYearMonth());
    }*/

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
