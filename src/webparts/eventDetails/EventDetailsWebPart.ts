import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './EventDetailsWebPart.module.scss';

import { SPComponentLoader } from '@microsoft/sp-loader';
// import { SPPermission } from '@microsoft/sp-page-context';
import * as strings from 'EventDetailsWebPartStrings';

export interface IEventDetailsWebPartProps {
  firstSite: string;
}

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import DmccUpcomingEvents from './DmccUpcomingEvents';


export interface ISPLists {
  value: ISPList[];
}
export interface ISPList {

  Title: string,

  DMCCEndDate: string;
  DMCCContents: string;
  DMCCShortDesc: string;
  DMCCEmployee: any;
  EventDate: any;
  EndDate: any;
  Location: any;
  BannerUrl: {
    Url: any;
  };
  Author:
  {
    EMail: string;
    Title: string;
  };
  Modified: string;
  ID: string;
  fRecurrence: boolean;
  PublishingPageImage: any;
  URL: {
    Url: string;
  }
  DMCCDepartment: string;
}

export default class EventDetailsWebPart extends BaseClientSideWebPart<IEventDetailsWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _FirstSite: string = "/sites/DMCCDev";

  private DmccUpcomingEvents = new DmccUpcomingEvents();

  public today = new Date().toISOString().slice(0, 20) + "000Z";

  public queryStringParams: any = this.getQueryStringParameters();

  private _getListData(): Promise<ISPLists> { //get 1 lists from sharepoint = Web.Lists
    //var ID = localStorage.getItem("AnnouncementID");
    // Get the query string parameters from the URL


    // Access specific query string parameters
    var ID: string = this.queryStringParams['UpcomingEventsID'];

    if (ID == null || ID == "0") ID = "1";
    console.log("UpcomingEventsID::::" + ID);
    return this.context.spHttpClient.get(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Events')/items?$select=*,Author/Title,Author/EMail&$expand=Author/Id&$filter=ID eq ${ID}`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      })
      .catch(() => { });
  }



  public getQueryStringParameters(): any {
    const queryStringParams: any = {};
    const queryString = window.location.search;

    if (queryString) {
      const params = new URLSearchParams(queryString);
      params.forEach((value, key) => {
        queryStringParams[key] = value;
      });
    }

    return queryStringParams;
  }

  private _getAnnoListData(): Promise<ISPLists> {
    //Top 2 items
    var ID: string = this.queryStringParams['UpcomingEventsID'];
    if (ID == null || ID == "0") ID = "1";
    var endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Events')/items?$orderby=EventDate desc&$filter=(DMCCIsActive eq 1) and ID ne ${ID} and (datetime'${this.today}' le EndDate)&$Top=2`
    //var endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Events')/items?$orderby=EventDate desc&$filter=(DMCCIsActive eq 1) and ID ne ${ID} and (datetime'${this.today}' ge EventDate and datetime'${this.today}' le EndDate)&$Top=2`
    //var endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('Events')/items?$select=*&$orderby=EventDate%20desc&$filter=(DMCCIsActive eq 1)&$Top=2`;
    console.log(endpointUrl);
    return this.context.spHttpClient.get(endpointUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  //Render the details
  private async _renderList(items: ISPList[]): Promise<void> { // single detail
    for (const item of items) {
      const UpcomingEventsDate = new Date(item.EndDate);
      const options = { month: 'long' } as const;
      const monthname = new Intl.DateTimeFormat('en-US', options).format(UpcomingEventsDate);
      const Month = monthname.substring(0, 3);
      const Day = UpcomingEventsDate.toString().split(' ', 3)[2];
      const Year = UpcomingEventsDate.toString().split(' ', 4)[3];
  
      const currentUser = await this._getCurrentUser();
      const userEmail = currentUser.Email;
      const profileImageUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${userEmail}`;
  
      let likeCount = 0, commentCount = 0;
      try {
        likeCount = await this._getEventLikeCount(Number(item.ID));
      } catch (e) {
        console.warn("Error getting like count:", e);
      }
  
      try {
        commentCount = await this._getEventCommentCount(Number(item.ID));
      } catch (e) {
        console.warn("Error getting comment count:", e);
      }
  
      const EventImage = item.BannerUrl?.Url ?? `${this._FirstSite}/SiteAssets/images/default.jpg`;
  
      const spanDate = this.domElement.querySelector('#spanDate');
      if (spanDate) spanDate.innerHTML = `${Day} ${Month} ${Year}`;
  
      const imgSRC = this.domElement.querySelector('#imgSRC');
      if (imgSRC) imgSRC.setAttribute("src", EventImage);
  
      const pContents = this.domElement.querySelector('#pContents');
      if (pContents) pContents.innerHTML = item.DMCCContents;
  
      const h4Title = this.domElement.querySelector('#h4Title');
      if (h4Title) h4Title.innerHTML = item.Title;
  
      const spanAuthorDept = this.domElement.querySelector('#spanAuthorDept');
      if (spanAuthorDept) spanAuthorDept.innerHTML = `${item.Author.Title}, ${item.DMCCDepartment}`;
  
      const spanStartDate = this.domElement.querySelector('#spanStartDate');
      if (spanStartDate) spanStartDate.innerHTML = new Date(item.EventDate).toString().slice(0, 24);
  
      const spanEndDate = this.domElement.querySelector('#spanEndDate');
      if (spanEndDate) spanEndDate.innerHTML = new Date(item.EndDate).toString().slice(0, 24);
  
      const spanLocation = this.domElement.querySelector('#spanLocation');
      if (spanLocation) spanLocation.innerHTML = item.Location ?? "N/A";
  
      if (item.fRecurrence === true) {
        const endDateSection = this.domElement.querySelector('#endDateSection');
        if (endDateSection) endDateSection.setAttribute('style', 'display: none !important;');
      }
  
      // Like icon
      const likeIcon = this.domElement.querySelector('img[data-like-id="#LIKEID"]');
      if (likeIcon) likeIcon.setAttribute('data-like-id', item.ID.toString());
  
      const likeSpan = this.domElement.querySelector('[id^="like-count-"]');
      if (likeSpan) {
        likeSpan.id = `like-count-${item.ID}`;
        likeSpan.textContent = `Like (${likeCount})`;
      }
  
      // Comment icon
      const commentIcon = this.domElement.querySelector('img[data-cmt-id="#CMTID"]');
      if (commentIcon) commentIcon.setAttribute('data-cmt-id', item.ID.toString());
  
      const commentSpan = this.domElement.querySelector('[id^="Cmt-count-"]');
      if (commentSpan) {
        commentSpan.id = `Cmt-count-${item.ID}`;
        commentSpan.textContent = `Comment (${commentCount})`;
      }
      const scrollToComment = () => {
        const commentSection = this.domElement.querySelector('#commentsContainer');
        if (commentSection) {
          commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      
      // Add event listeners for the comment icon and count
      const commentIconElement = this.domElement.querySelector(`img[data-cmt-id="${item.ID}"]`);
      const commentTextElement = this.domElement.querySelector(`#Cmt-count-${item.ID}`);
      
      if (commentIconElement) {
        commentIconElement.addEventListener('click', scrollToComment);
      }
      
      if (commentTextElement) {
        commentTextElement.addEventListener('click', scrollToComment);
      }
      // Profile image
      const profileImg = this.domElement.querySelector('img#profile-img, img[src="#PROFILEIMG"]');
      if (profileImg) profileImg.setAttribute("src", profileImageUrl);
  
      // Register event handlers
      this._registerEventLikeHandlers();
      this._registerCommentEvents(Number(item.ID));
      await this._loadEventComments(Number(item.ID));
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
    try {
      const subsiteUrl = `${this._FirstSite}/allevents`;
      const response = await fetch(`${subsiteUrl}/_api/web/lists/getbytitle('EventsComments')/items?$filter=EventId eq ${eventId}&$select=Id`);
      if (!response.ok) {
        console.error(`Failed to fetch comments for event ${eventId}:`, response);
        return 0; // Return 0 if the request fails
      }
      const data = await response.json();
      return data.value ? data.value.length : 0;
    } catch (error) {
      console.error('Error fetching comment count:', error);
      return 0; // Return 0 in case of error
    }
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
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-HTTP-Method': 'DELETE',
          'If-Match': '*',
        },
        body: JSON.stringify({ '__metadata': { 'type': 'SP.Data.EventsLikesListItem' } })
      }
    );
  }

  private _registerCommentEvents(eventId: number): void {
    const input = this.domElement.querySelector('#desc') as HTMLInputElement;
    const button = this.domElement.querySelector('#add-comment-btn') as HTMLButtonElement;
  
    if (!input || !button) return;
  
    button.addEventListener('click', async () => {
      const commentText = input.value.trim();
      if (commentText === '') return;
  
      await this._saveEventComment(eventId, commentText);
      input.value = '';
      await this._loadEventComments(eventId);
    });
  }
  
  private async _saveEventComment(eventId: number, commentText: string): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const currentUser = await this._getCurrentUser();
  
    const body = {
      '__metadata': { 'type': 'SP.Data.EventsCommentsListItem' },
      'EventIdId': eventId,
      'UserIdId': currentUser.Id,
      'Comments': commentText
    };
  
    const response = await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsComments')/items`,
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
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to add event comment: ${errorText}`);
    }
  }
  
  private async _loadEventComments(eventId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
    const currentUser = await this._getCurrentUser();
    const isAdmin = await this._checkIfUserIsAdmin(); // New method

    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsComments')/items?$filter=EventId eq ${eventId}&$orderby=Created desc&$top=10&$select=Id,Comments,Created,UserId/Id,UserId/Title,UserId/EMail&$expand=UserId`,
      SPHttpClient.configurations.v1
    );
    const json = await res.json();
  
    const commentsHtml = json.value.map((item: any) => {
      const userName = item.UserId?.Title ?? 'Unknown';
      const email = item.UserId?.EMail ?? '';
      const userPhoto = email
        ? `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${email}`
        : `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=s`;
  
      const isOwner = item.UserId?.Id === currentUser.Id;
      const createdDate = new Date(item.Created);

      const formattedDate = createdDate.toLocaleDateString(); 
      const formattedTime = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
        return `
          
            <div class="comment-list w-100 float-start d-flex align-items-center gap-3 py-2" data-comment-id="${item.Id}">
             <img class="flex-shrink-0 comment-list-avatar" src="${userPhoto}"/>
             <div class="flex-grow-1 overflow-hidden dmcc-text-dark">
             <p>${userName}</p>
              <p>${item.Comments}</p>
               <div class="d-flex align-items-center gap-2 mt-1">
              <div class="d-flex align-items-center comment-date">
              <img class="me-1" src="${this._FirstSite}/SiteAssets/images/icons/date-icon.png">
              <span class="m-0 dmcc-text-dark text-xs">
              ${formattedDate}
               </span>
               </div>
              <div class="d-flex align-items-center comment-time">
              <img class="me-1" src="${this._FirstSite}/SiteAssets/images/icons/time-icon.png">
              <span class="m-0 dmcc-text-dark text-xs">
              ${formattedTime}
               </span>
               </div>
                </div>
               </div>
               ${(isOwner || isAdmin) ? `
               <button type="button" class="comment-list-remove">
             <img src="${this._FirstSite}/SiteAssets/images/icons/v2/close-new.png" class="flex-shrink-0 cursor-pointer delete-comment" data-comment-id="${item.Id}"/>
              </button> ` : ''}
          </div>`;
      }).join('');
    const container = this.domElement.querySelector('#commentsContainer');
    if (container) container.innerHTML = commentsHtml;
  
    this._registerDeleteEventCommentEvents(eventId); // Re-register delete buttons
  
    const countSpan = this.domElement.querySelector(`#Cmt-count-${eventId}`);
    if (countSpan) countSpan.textContent = `Comment (${json.value.length})`;
  }
  private async _checkIfUserIsAdmin(): Promise<boolean> {
    const siteUrl = this.context.pageContext.site.absoluteUrl;
  
    try {
      const res = await this.context.spHttpClient.get(
        `${siteUrl}/_api/web/currentuser/?$expand=Groups`,
        SPHttpClient.configurations.v1
      );
      const userInfo = await res.json();
  
      const groups: any[] = userInfo.Groups || [];
      const adminGroupName = 'Global Contributors – HR'; 
  
      // Log current user details for debugging
      console.log("Current user:", userInfo);
      console.log("User groups:", groups.map(g => g.Title)); 
  
      // Check if user belongs to the 'Global Contributors – HR' group
      const isAdmin = groups.some(g => g.Title === adminGroupName);
  
      console.log("Is user in 'Global Contributors – HR' group?", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking user group:', error);
      return false;
    }
  }
  
  private _registerDeleteEventCommentEvents(eventId: number): void {
    const buttons = this.domElement.querySelectorAll('.delete-comment');
    buttons.forEach(button => {
      button.addEventListener('click', async (event: any) => {
        const commentId = parseInt(event.target.getAttribute('data-comment-id'));
        const confirmDelete = confirm('Are you sure you want to delete this comment?');
        if (confirmDelete) {
          await this._deleteEventComment(commentId);
          await this._loadEventComments(eventId); // Reload after delete
        }
      });
    });
  }
  
  private async _deleteEventComment(commentId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}/allevents`;
  
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('EventsComments')/items(${commentId})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-HTTP-Method': 'DELETE',
          'If-Match': '*'
        }
      }
    );
  
    console.log(`Event comment with ID ${commentId} deleted.`);
  }
 

  
   
  
  private _renderAnnoListAsync(): void {
    this._getAnnoListData()
      .then((response) => {
        this._renderAnnoList(response.value);
      });
  }
  private _renderListAsync(): void {

    this._getListData()
      .then((response) => {
        this._renderList(response.value);
      })
      .catch(() => { });
  }
  private _renderAnnoList(items: ISPList[]): void {
    let allElementsHtml: string = "";


    const tempElement = document.createElement('div');

    items.forEach((item: ISPList) => {

      let singleElementHtml: string = this.DmccUpcomingEvents.singleElementHtml;
      singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);

      //Render top 2 items

      //let PublishingPageImage:any=item.PublishingPageImage;
      tempElement.innerHTML = item.DMCCShortDesc;
      let tempDesc: any = tempElement.textContent;
      item.DMCCShortDesc = (tempDesc + "").substring(0, 81);



      /* if(item.PublishingPageImage !== null){ PublishingPageImage = window.location.protocol + "//" + window.location.host + 
       (PublishingPageImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
       }*/


      let UpcomingEventsDate: Date;
      UpcomingEventsDate = new Date(item.EventDate);
      const options = { month: 'long' } as const;
      let monthname = new Intl.DateTimeFormat('en-US', options).format(UpcomingEventsDate);
      let Month = monthname.toString().substring(0, 3);
      let Day = UpcomingEventsDate.toString().split(' ', 3)[2];
      var Year = UpcomingEventsDate.toString().split(' ', 4)[3];


      /*let BannerUrl:any=item.BannerUrl; 

      if(item.BannerUrl !== null){ BannerUrl = window.location.protocol + "//" + window.location.host + 
      (BannerUrl.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
      }*/
      var EventImage
      if (item.BannerUrl !== null) {
        EventImage = item.BannerUrl.Url
      }
      else {
        EventImage = `${this._FirstSite}/SiteAssets/images/default.jpg`;
      }

      singleElementHtml = singleElementHtml.replace("#DAY", Day + "");
      singleElementHtml = singleElementHtml.replace("#MONTH", Month + "");
      singleElementHtml = singleElementHtml.replace("#YEAR", Year + "");
      singleElementHtml = singleElementHtml.replace("#LOCATION", (item.Location == null ? "N/A" : item.Location) + "");
      singleElementHtml = singleElementHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
      singleElementHtml = singleElementHtml.replace("#IMGSRC", EventImage + "");
      singleElementHtml = singleElementHtml.replace("#UpcomingEventsID", item.ID);



      allElementsHtml += singleElementHtml;

    });
    const DMCCSideAnnoucements: Element | null = this.domElement.querySelector('#DMCCSideEvents');
    if (DMCCSideAnnoucements !== null) DMCCSideAnnoucements.innerHTML = allElementsHtml;



  }
  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    try {

      let xhtml: string = this.DmccUpcomingEvents.html;
      xhtml = xhtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);


      this.domElement.innerHTML = xhtml;

      this._renderListAsync(); //call api

      this._renderAnnoListAsync();

    }
    catch (error) {
      console.log(error);
    }
    finally {
      let divWrapper: any = document.querySelector('#divWrapper');
      setTimeout(() => {
        divWrapper?.removeAttribute("style");
      }, 1500);
    }

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
