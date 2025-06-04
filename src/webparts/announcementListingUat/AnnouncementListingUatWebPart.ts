import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './AnnouncementListingUatWebPart.module.scss';
import * as strings from 'AnnouncementListingUatWebPartStrings';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http'; 
import { SPComponentLoader } from '@microsoft/sp-loader';
import DmccAnnouncement from './DmccAnnouncement';

export interface IAnnouncementListingUatWebPartProps {
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

export default class AnnouncementListingUatWebPart extends BaseClientSideWebPart<IAnnouncementListingUatWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';


  private itemsToDisplay: number = 6;
  private items: any[] = [];
  private BtnLoadMoreAnnouncements: HTMLButtonElement;
  private BtnYearDDL: HTMLButtonElement;
  private BtnMonthDDL: HTMLButtonElement;
  private SearchTextInput: HTMLInputElement;
  public searchNewText: any;
  public filterCriteria: any = [];
  public listName = "Announcements";
  public baseUrl = ""
  public LetterTyped: any = '';
  public stringFilter: string = '';
  public today = new Date().toISOString().slice(0, 20) + "000Z";

  // private _FirstSite = "/sites/DMCC-Intranet-Prod";
  private _FirstSite = "/sites/DMCCDev";

  private dmccAnno = new DmccAnnouncement();



  private loadDistinctYears(): void {
    const endpointUrl: string = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Announcements')/items?$select=DMCCEndDate,DMCCStartDate&$orderby=DMCCEndDate asc`;

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

      options = options.reverse();
      let options2 = "";
      for (let val of options) {
        options2 = options2 + `<option class='dropdown-item' value='${val}'>${val}</option>`;
      }
      dropdown.innerHTML = `<div class="dropdown-menu year-dropdown-menu" aria-labelledby="year-dropdown">` + options2 + `</div>`;
      this.BtnYearDDL.value = new Date().getFullYear().toString();
    }



    this.BtnMonthDDL = this.domElement.querySelector("#month-dropdown") as HTMLButtonElement;
    this.BtnMonthDDL.value = "All";
    this.BtnMonthDDL.addEventListener("change", () => this.DDLChangeYearMonth());
    this.BtnLoadMoreAnnouncements = this.domElement.querySelector("#BtnLoadMoreAnnouncements") as HTMLButtonElement;
    this.BtnLoadMoreAnnouncements.addEventListener("click", () => this.loadMoreItems());

    var inputId = document.getElementById('searchAnnouncementsId');
    if (inputId) inputId.addEventListener("keyup", (event) => { this.SearchBoxMethod(event); });


    this.DDLChangeYearMonth();


  }



  private loadItems(): void {

    var filter: any;

    if (this.filterCriteria.length > 0 && this.stringFilter.length > 0) {
      filter = `$filter=${this.stringFilter} and ${this.filterCriteria.join(' and ')}`;
    }
    else if (this.filterCriteria.length > 0) {
      filter = `$filter=${this.filterCriteria.join(' and ')}`;
    }
    /* else if(this.stringFilter.length > 0){
       filter  =`$filter=${this.stringFilter}`
     }*/
    else {
      filter = '';
    }

    //    this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?${filter}&$top=${this.itemsToDisplay}&$orderby=DMCCStartDate desc`;
    this.baseUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.listName}')/items?${filter}&$top=${this.itemsToDisplay}&$orderby=DMCCStartDate desc`;
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


  //   const announcementList = this.domElement.querySelector("#AnnouncementListings");

  //   const tempElement = document.createElement('div');

  //   if (announcementList) {
  //     announcementList.innerHTML = ""; // Clear existing items

  //     let allElementsHtml: any = "";

  //     if (this.items.length < this.itemsToDisplay) {
  //       this.BtnLoadMoreAnnouncements.style.visibility = "hidden";
  //     }
  //     else if (this.items.length >= this.itemsToDisplay) {
  //       this.BtnLoadMoreAnnouncements.style.visibility = "visible";
  //       this.BtnLoadMoreAnnouncements.style.backgroundColor = "rgb(8, 0, 71)"
  //       //background-color: rgb(8, 0, 71);

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

  //       if (DMCCImage == undefined || DMCCImage == null) 
  //         {
  //           DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
  //         }
  //         else if(item.DMCCImage.match('serverRelativeUrl') == null){
  //           var Image = JSON.parse(item.DMCCImage).fileName;
  //           DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/Announcements/Attachments/${item.ID}/${Image}`;
  //         }
  //         else{
  //           DMCCImage = window.location.protocol + "//" + window.location.host + 
  //           (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //         }    

  //       let AnnouncementDate: Date;

  //       let singleElementHtml: any = this.dmccAnno.singleElementHtml;
  //       singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);


  //       AnnouncementDate = new Date(item.DMCCStartDate);
  //       const options = { month: 'long' } as const;
  //       let monthname = new Intl.DateTimeFormat('en-US', options).format(AnnouncementDate);
  //       let Month = monthname.toString().substring(0, 3);
  //       let Day = AnnouncementDate.toString().split(' ', 3)[2];
  //       var Year = AnnouncementDate.toString().split(' ', 4)[3];


  //       singleElementHtml = singleElementHtml.replace("#DAY", Day + "");
  //       singleElementHtml = singleElementHtml.replace("#MONTH", Month + "");
  //       singleElementHtml = singleElementHtml.replace("#YEAR", Year + "");
  //       singleElementHtml = singleElementHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
  //       singleElementHtml = singleElementHtml.replace("#IMGSRC", DMCCImage + "");
  //       singleElementHtml = singleElementHtml.replace("#AnnouncementID", item.ID)

  //       allElementsHtml += singleElementHtml;

  //     });

  //     if (items2.length <= 0) {
  //       let noitm = this.dmccAnno.NOsingleElementHtml;
  //       allElementsHtml = noitm;
  //     }
  //     announcementList.innerHTML = allElementsHtml;

  //   }
  // }
  private async renderItems(): Promise<void> {
    const announcementList = this.domElement.querySelector("#AnnouncementListings");
    const tempElement = document.createElement('div');
  
    if (announcementList) {
      announcementList.innerHTML = ""; // Clear existing items
  
      let allElementsHtml: string = "";
  
      if (this.items.length < this.itemsToDisplay) {
        this.BtnLoadMoreAnnouncements.style.visibility = "hidden";
      } else if (this.items.length >= this.itemsToDisplay) {
        this.BtnLoadMoreAnnouncements.style.visibility = "visible";
        this.BtnLoadMoreAnnouncements.style.backgroundColor = "rgb(8, 0, 71)";
      }
  
      let items2 = this.items;
  
      // Filter items based on search text
      if (this.searchNewText && this.searchNewText !== "") {
        items2 = this.items.filter((item) => {
          const searchText = this.searchNewText.toLocaleLowerCase();
          return (item.Title && item.Title.toLocaleLowerCase().includes(searchText)) ||
                 (item.DMCCShortDesc && item.DMCCShortDesc.toLocaleLowerCase().includes(searchText)) ||
                 (item.DMCCContents && item.DMCCContents.toLocaleLowerCase().includes(searchText)) ||
                 (item.DMCCDepartment && item.DMCCDepartment.toLocaleLowerCase().includes(searchText));
        });
      }
  
      // Process items and render HTML
      const promises = items2.map(async (item) => {
        let DMCCImage: any = item.DMCCImage;

        tempElement.innerHTML = item.DMCCShortDesc;
        item.DMCCShortDesc = (tempElement.textContent + "").substring(0, 81);

        if (DMCCImage == undefined || DMCCImage == null) 
          {
            DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
          }
          else if(item.DMCCImage.match('serverRelativeUrl') == null){
            var Image = JSON.parse(item.DMCCImage).fileName;
            DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/Announcements/Attachments/${item.ID}/${Image}`;
          }
          else{
            DMCCImage = window.location.protocol + "//" + window.location.host + 
            (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
          }    
  
        const AnnouncementDate: Date = new Date(item.DMCCStartDate);
        const options = { month: 'long' } as const;
        const monthname = new Intl.DateTimeFormat('en-US', options).format(AnnouncementDate);
        const Month = monthname.substring(0, 3);
        const Day = AnnouncementDate.getDate();
        const Year = AnnouncementDate.getFullYear();
  
        // Get like and comment counts asynchronously
        const likeCount = await this._getAnnoLikeCount(Number(item.ID));
        const commentCount = await this._getAnnoCommentCount(Number(item.ID));
  
        let singleElementHtml = this.dmccAnno.singleElementHtml;
        singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);
  
        singleElementHtml = singleElementHtml.replace("#DAY", Day.toString())
                                             .replace("#MONTH", Month)
                                             .replace("#YEAR", Year.toString())
                                             .replace("#CONTENTS", item.DMCCShortDesc)
                                             .replace("#IMGSRC", DMCCImage)
                                             .replace("#AnnouncementID", item.ID.toString())
                                             .replace(/#LIKEID/g, item.ID.toString())
                                             .replace("#LIKECOUNT", likeCount.toString())
                                             .replace(/#ITEMID/g, item.ID.toString())
                                             .replace("#CMCNT", commentCount.toString());
                                            
  
        allElementsHtml += singleElementHtml;
      });
  
      // Wait for all promises to resolve
      await Promise.all(promises);
  
      if (items2.length <= 0) {
        let noitm = this.dmccAnno.NOsingleElementHtml;
        allElementsHtml = noitm;
      }
  
      announcementList.innerHTML = allElementsHtml;
    }
    this._registerAnnoLikeHandlers();
  }
  
  private _registerAnnoLikeHandlers(): void {
    this.domElement.querySelectorAll('.like-icon').forEach(icon => {
      icon.addEventListener('click', async (event: any) => {
        const likeId = parseInt(event.target.getAttribute('data-like-id'));
        await this._handleAnnoLikeClick(likeId);
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
  
  private async _getLikedUsers(announcementId: number): Promise<{ name: string; pictureUrl: string }[]> {
    const response = await this.context.spHttpClient.get(
      `${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementLikes')/items?$filter=AnnoId/Id eq ${announcementId}&$expand=LikedBy&$select=LikedBy/Title,LikedBy/Id,LikedBy/EMail`,
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
  


  private async _handleAnnoLikeClick(announcementId: number): Promise<void> {
    const currentUser = await this._getCurrentUser();
    const existingLike = await this._getExistingAnnoLike(announcementId, currentUser.Id);
  
    if (!existingLike) {
      await this._addAnnoLike(announcementId, currentUser.Id);
    } else {
      await this._removeAnnoLike(existingLike.Id);
    }
  
    const updatedCount = await this._getAnnoLikeCount(announcementId);
    const countSpan = this.domElement.querySelector(`#like-count-${announcementId}`);
    if (countSpan) countSpan.textContent = `Like (${updatedCount})`;
  }

  private async _getAnnoCommentCount(announcementId: number): Promise<number> {
    try {
      const response = await this.context.spHttpClient.get(
        `${this._FirstSite}/_api/web/lists/getbytitle('AnnoComments')/items?$filter=AnnouncementId eq ${announcementId}&$select=Id`,
        SPHttpClient.configurations.v1
      );
      if (!response.ok) {
        console.error(`Failed to fetch comments for announcement ${announcementId}`);
        return 0;
      }
      const data = await response.json();
      return data.value?.length || 0;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0;
    }
  }
  
  private async _getExistingAnnoLike(announcementId: number, userId: number): Promise<any> {
    const res = await this.context.spHttpClient.get(
      `${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementLikes')/items?$filter=AnnoId eq ${announcementId} and LikedById eq ${userId}`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
    return json.value?.length > 0 ? json.value[0] : null;
  }

  private async _addAnnoLike(announcementId: number, userId: number): Promise<void> {
    try {
      const typeInfoRes = await this.context.spHttpClient.get(
        `${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementLikes')?$select=ListItemEntityTypeFullName`,
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
        `${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementLikes')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-type': 'application/json;odata=verbose',
            'odata-version': ''
          },
          body: JSON.stringify({
            '__metadata': { 'type': listItemType },
            'AnnoIdId': announcementId,  // Lookup field - must use <FieldName>Id
            'LikedById': userId          // Person field - use <FieldName>Id
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

  private async _getAnnoLikeCount(announcementId: number): Promise<number> {
    try {
      const endpoint = `${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementLikes')/items?$filter=AnnoId/Id eq ${announcementId}&$select=Id,AnnoId/Id&$expand=AnnoId`;
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
  
  private async _removeAnnoLike(likeId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}`; // Change if AnnouncementLikes is in a subsite
  
    try {
      const response = await this.context.spHttpClient.post(
        `${subsiteUrl}/_api/web/lists/getbytitle('AnnouncementLikes')/items(${likeId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-HTTP-Method': 'DELETE',
            'If-Match': '*'
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.AnnouncementLikesListItem' }
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

    //`${this._FirstSite}/SiteAssets/images/default.jpg`;
    console.log(`key=${event.key},code=${event.code}`);
    this.SearchTextInput = this.domElement.querySelector("#searchAnnouncementsId") as HTMLInputElement;
    this.stringFilter = ''

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
   
    //   this.domElement.innerHTML = dmccAnno.html

    let xhtml = this.dmccAnno.html;
    xhtml = xhtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);

    this.domElement.innerHTML = xhtml;//dmccAnno.html;


    this.BtnYearDDL = this.domElement.querySelector("#year-dropdown") as HTMLButtonElement;
    this.BtnYearDDL.value = new Date().getFullYear().toString()
    this.BtnYearDDL.addEventListener("change", () => this.DDLChangeYearMonth());


    this.loadDistinctYears();


    let divWrapper: any = document.querySelector('#divWrapper');
    setTimeout(() => {
      divWrapper?.removeAttribute("style");
    }, 1100);

    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
  }

  /////////////////////////////////////


  protected onInit(): Promise<void> {

    this._FirstSite = this.properties.firstSite || this._FirstSite;

    this.loadLibraries();

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });

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
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              throw new Error('Unknown host');
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
