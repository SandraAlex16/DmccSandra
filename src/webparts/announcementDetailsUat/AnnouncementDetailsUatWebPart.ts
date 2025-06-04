import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './AnnouncementDetailsUatWebPart.module.scss';
import * as strings from 'AnnouncementDetailsUatWebPartStrings';

import { SPComponentLoader } from '@microsoft/sp-loader';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import DmccAnnouncement from './DmccAnnouncement';

export interface IAnnouncementDetailsUatWebPartProps {
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

  DMCCAnnouncementIsMandatory:any;

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

export default class AnnouncementDetailsUatWebPart extends BaseClientSideWebPart<IAnnouncementDetailsUatWebPartProps> {

  // private _FirstSite = "/sites/DMCC-intranet-prod";
  private _FirstSite = "/sites/DMCCDev";

  private dmccAnno = new DmccAnnouncement();

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private btnAnnoAcknowledged: HTMLButtonElement;
 

  public today = new Date().toISOString().slice(0, 20) + "000Z";

  private _getListData(): Promise<ISPLists> { //get 1 lists from sharepoint = Web.Lists
    //var ID = localStorage.getItem("AnnouncementID");
    // Get the query string parameters from the URL
      const queryStringParams: any = this.getQueryStringParameters();

      // Access specific query string parameters
      var ID: string = queryStringParams['AnnouncementID'];

      if (ID == null || ID == "0") ID = "3";
      var PageReference: string = queryStringParams['RedirectFrom'];

      const regex1 = new RegExp("#ShowNoticeBoard", 'g'); //hide if not found in URL
      if (PageReference == null){        
        this.domElement.innerHTML = this.domElement.innerHTML.replace(regex1, "display: none!important;");
       }
      else{
        this.domElement.innerHTML = this.domElement.innerHTML.replace(regex1, "");
      }

     
      console.log("AnnouncementID::::" + ID);
      return this.context.spHttpClient.get(`//dmccdxb.sharepoint.com${this._FirstSite}/_api/web/lists/GetByTitle('Announcements')/items?$select=*,Author/Title,Author/EMail&$expand=Author/Id&$orderby=Modified%20desc&$filter=ID eq ${ID}`, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => {
          return response.json();
        })
        .catch(() => { });
    }


  private getQueryStringParameters(): any {
    const queryStringParams: any = {};
   // const queryString =  `https://dmccdxb.sharepoint.com/sites/DMCc-intranet-prod/SitePages/Announcement-Detail-Page.aspx?env=WebView&AnnouncementID=2&RedirectFrom=NoticeBoard`;
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
    return this.context.spHttpClient.get(`//dmccdxb.sharepoint.com${this._FirstSite}/_api/web/lists/GetByTitle('Announcements')/items?$orderby=Modified%20desc&$filter=(DMCCIsActive eq 1) and (datetime'${this.today}' ge DMCCStartDate and datetime'${this.today}' le DMCCEndDate)&$Top=2`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  //Render the announcements details
  // private _renderList(items: ISPList[]): void { //single detail

  //   items.forEach((item: ISPList) => {

  //     let AnnouncementDate: Date;
  //     AnnouncementDate = new Date(item.Modified);
  //     const options = { month: 'long' } as const;
  //     let monthname = new Intl.DateTimeFormat('en-US', options).format(AnnouncementDate);
  //     let Month = monthname.toString().substring(0, 3);
  //     let Day = AnnouncementDate.toString().split(' ', 3)[2];
  //     var Year = AnnouncementDate.toString().split(' ', 4)[3];
      


  //     let DMCCImage: any = item.DMCCImage;

  //     if (DMCCImage == undefined || DMCCImage == null) 
  //       {
  //         DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
  //       }
  //   else if(item.DMCCImage.match('serverRelativeUrl') == null){
  //         var Image = JSON.parse(item.DMCCImage).fileName;
  //         DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/Announcements/Attachments/${item.ID}/${Image}`;
  //       }
  //     else if (item.DMCCImage !== null) {
  //       DMCCImage = window.location.protocol + "//" + window.location.host +
  //         (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  //     }

  //     const spanDate: Element | null = this.domElement.querySelector('#spanDate');
  //     if (spanDate !== null) spanDate.innerHTML = Day + " " + Month + " " + Year;

  //     const imgSRC: Element | null = this.domElement.querySelector('#imgSRC');
  //     if (imgSRC !== null) imgSRC.setAttribute("src", DMCCImage);

  //     const pContents: Element | null = this.domElement.querySelector('#pContents');
  //     if (pContents !== null) pContents.innerHTML = item.DMCCContents;

  //     const h4Title: Element | null = this.domElement.querySelector('#h4Title');
  //     if (h4Title !== null) h4Title.innerHTML = item.Title;

  //     var dept = ', '+item.DMCCDepartment;
  //     if(item.DMCCDepartment == null){
  //       dept = "";
  //     }
  //     const spanAuthorDept: Element | null = this.domElement.querySelector('#spanAuthorDept');
  //     if (spanAuthorDept !== null) spanAuthorDept.innerHTML = item.Author.Title + dept;


  //     //if mandatory then
  //     if (item.DMCCAnnouncementIsMandatory != "true" && item.DMCCAnnouncementIsMandatory != "1" && item.DMCCAnnouncementIsMandatory != "yes" && item.DMCCAnnouncementIsMandatory != "Yes") {
  //       this.btnAnnoAcknowledged = this.domElement.querySelector("#btnAnnoAcknowledged") as HTMLButtonElement;
  //       this.btnAnnoAcknowledged.setAttribute("style", "display:none;");// = true; // disable button
  //       //this.btnAnnoAcknowledged.textContent = "Acknowledge";
  //     }
  //   });
  //   //console.log("detailHTML::::"+detailAnnoHtml);
  //   //const DMCCAnnoucementDetails:Element | null = this.domElement.querySelector('#DMCCAnnoucementDetails');
  //   //if(DMCCAnnoucementDetails!==null) DMCCAnnoucementDetails.innerHTML = detailAnnoHtml;
  
  // }
  private async _renderList(items: ISPList[]): Promise<void> { // single detail

    for (const item of items) {
  
      let AnnouncementDate: Date;
      AnnouncementDate = new Date(item.Modified);
      const options = { month: 'long' } as const;
      let monthname = new Intl.DateTimeFormat('en-US', options).format(AnnouncementDate);
      let Month = monthname.toString().substring(0, 3);
      let Day = AnnouncementDate.toString().split(' ', 3)[2];
      var Year = AnnouncementDate.toString().split(' ', 4)[3];
  
      const currentUser = await this._getCurrentUser();
      const userEmail = currentUser.Email;
      const profileImageUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${userEmail}`;
  
      let likeCount = 0, commentCount = 0;
      try {
        likeCount = await this._getAnnoLikeCount(Number(item.ID));
      } catch (e) {
        console.warn("Error getting like count:", e);
      }
  
      try {
        commentCount = await this._getAnnoCommentCount(Number(item.ID));
      } catch (e) {
        console.warn("Error getting comment count:", e);
      }
  
      let DMCCImage: any = item.DMCCImage;
  
      if (DMCCImage == undefined || DMCCImage == null) {
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;
      }
      else if (item.DMCCImage.match('serverRelativeUrl') == null) {
        var Image = JSON.parse(item.DMCCImage).fileName;
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/Lists/Announcements/Attachments/${item.ID}/${Image}`;
      }
      else if (item.DMCCImage !== null) {
        DMCCImage = window.location.protocol + "//" + window.location.host +
          (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
      }
  
      const spanDate: Element | null = this.domElement.querySelector('#spanDate');
      if (spanDate !== null) spanDate.innerHTML = Day + " " + Month + " " + Year;
  
      const imgSRC: Element | null = this.domElement.querySelector('#imgSRC');
      if (imgSRC !== null) imgSRC.setAttribute("src", DMCCImage);
  
      const pContents: Element | null = this.domElement.querySelector('#pContents');
      if (pContents !== null) pContents.innerHTML = item.DMCCContents;
  
      const h4Title: Element | null = this.domElement.querySelector('#h4Title');
      if (h4Title !== null) h4Title.innerHTML = item.Title;
  
      var dept = ', ' + item.DMCCDepartment;
      if (item.DMCCDepartment == null) {
        dept = "";
      }
      const spanAuthorDept: Element | null = this.domElement.querySelector('#spanAuthorDept');
      if (spanAuthorDept !== null) spanAuthorDept.innerHTML = item.Author.Title + dept;
  
      const likeIcon = this.domElement.querySelector('img[data-like-id="#LIKEID"]');
      if (likeIcon) likeIcon.setAttribute('data-like-id', item.ID.toString());
  
      const likeSpan = this.domElement.querySelector('[id^="like-count-"]');
      if (likeSpan) {
        likeSpan.id = `like-count-${item.ID}`;
        likeSpan.textContent = `Like (${likeCount})`;
      }
  
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
  
      const profileImg = this.domElement.querySelector('img#profile-img, img[src="#PROFILEIMG"]');
      if (profileImg) profileImg.setAttribute("src", profileImageUrl);
  
      if (item.DMCCAnnouncementIsMandatory != "true" && item.DMCCAnnouncementIsMandatory != "1" && item.DMCCAnnouncementIsMandatory != "yes" && item.DMCCAnnouncementIsMandatory != "Yes") {
        this.btnAnnoAcknowledged = this.domElement.querySelector("#btnAnnoAcknowledged") as HTMLButtonElement;
        this.btnAnnoAcknowledged.setAttribute("style", "display:none;");
      }
      this._registerAnnoLikeHandlers();
    this._registerCommentEvents(Number(item.ID));
      await this._loadEventComments(Number(item.ID));
    }
  
    
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
  private _registerCommentEvents(announcementId: number): void {
    const input = this.domElement.querySelector('#desc') as HTMLInputElement;
    const button = this.domElement.querySelector('#add-comment-btn') as HTMLButtonElement;
  
    if (!input || !button) return;
  
    button.addEventListener('click', async () => {
      const commentText = input.value.trim();
      if (commentText === '') return;
  
      await this._saveEventComment(announcementId, commentText);
      input.value = '';
      await this._loadEventComments(announcementId);
    });
  }
  
  private async _saveEventComment(announcementId: number, commentText: string): Promise<void> {
    const subsiteUrl = `${this._FirstSite}`;
    const currentUser = await this._getCurrentUser();
  
    const body = {
      '__metadata': { 'type': 'SP.Data.AnnoCommentsListItem' },
      'AnnouncementIdId': announcementId, // ✅ FIXED: Correct internal name
      'UserIdId': currentUser.Id,
      'Comments': commentText
    };
  
    const response = await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('AnnoComments')/items`,
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
  
  private async _loadEventComments(announcementId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}`;
    const currentUser = await this._getCurrentUser();
    const isAdmin = await this._checkIfUserIsAdmin(); 

  
    const res = await this.context.spHttpClient.get(
      `${subsiteUrl}/_api/web/lists/getbytitle('AnnoComments')/items?$filter=AnnouncementId eq ${announcementId}&$orderby=Created desc&$top=10&$select=Id,Comments,Created,UserId/Id,UserId/Title,UserId/EMail&$expand=UserId`,
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
  
    this._registerDeleteEventCommentEvents(announcementId);
  
    const countSpan = this.domElement.querySelector(`#Cmt-count-${announcementId}`);
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
      const adminGroupName = 'Global Contributors – HR'; // Exact match with en-dash character
  
      // Log current user details for debugging
      console.log("Current user:", userInfo);
      console.log("User groups:", groups.map(g => g.Title)); // Log the group titles for clarity
  
      // Check if user belongs to the 'Global Contributors – HR' group
      const isAdmin = groups.some(g => g.Title === adminGroupName);
  
      console.log("Is user in 'Global Contributors – HR' group?", isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error checking user group:', error);
      return false;
    }
  }
  private _registerDeleteEventCommentEvents(announcementId: number): void {
    const buttons = this.domElement.querySelectorAll('.delete-comment');
    buttons.forEach(button => {
      button.addEventListener('click', async (event: any) => {
        const commentId = parseInt(event.target.getAttribute('data-comment-id'));
        const confirmDelete = confirm('Are you sure you want to delete this comment?');
        if (confirmDelete) {
          await this._deleteEventComment(commentId);
          await this._loadEventComments(announcementId);
        }
      });
    });
  }
  
  private async _deleteEventComment(commentId: number): Promise<void> {
    const subsiteUrl = `${this._FirstSite}`;
  
    await this.context.spHttpClient.post(
      `${subsiteUrl}/_api/web/lists/getbytitle('AnnoComments')/items(${commentId})`,
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

    let singleElementHtml: string = this.dmccAnno.singleElementHtml;
    singleElementHtml = singleElementHtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);

    const tempElement = document.createElement('div');

    items.forEach((item: ISPList) => {


      let DMCCImage: any = item.DMCCImage;
      tempElement.innerHTML = item.DMCCShortDesc;
      let tempDesc: any = tempElement.textContent;
      item.DMCCShortDesc = (tempDesc + "").substring(0, 81);

    
      if(item.DMCCImage !== null) {
        DMCCImage = window.location.protocol + "//" + window.location.host +
          (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
      }


      let AnnouncementDate: Date;
      AnnouncementDate = new Date(item.Modified);
      const options = { month: 'long' } as const;
      let monthname = new Intl.DateTimeFormat('en-US', options).format(AnnouncementDate);
      let Month = monthname.toString().substring(0, 3);
      let Day = AnnouncementDate.toString().split(' ', 3)[2];
      var Year = AnnouncementDate.toString().split(' ', 4)[3];


      singleElementHtml = singleElementHtml.replace("#DAY", Day + "");
      singleElementHtml = singleElementHtml.replace("#MONTH", Month + "");
      singleElementHtml = singleElementHtml.replace("#YEAR", Year + "");
      singleElementHtml = singleElementHtml.replace("#CONTENTS", item.DMCCShortDesc + "");
      singleElementHtml = singleElementHtml.replace("#IMGSRC", DMCCImage + "");
      singleElementHtml = singleElementHtml.replace("#AnnouncementID", item.ID)

      allElementsHtml += singleElementHtml;

    });
    const DMCCSideAnnoucements: Element | null = this.domElement.querySelector('#DMCCSideAnnoucements');
    if (DMCCSideAnnoucements !== null) DMCCSideAnnoucements.innerHTML = allElementsHtml;

  }
  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    console.info(this._FirstSite);

    try {
      let xhtml = this.dmccAnno.html;
      xhtml = xhtml.replace(new RegExp("_FirstSite", 'g'), this._FirstSite);

      this.domElement.innerHTML = xhtml;//dmccAnno.html;


      this.btnAnnoAcknowledged = this.domElement.querySelector("#btnAnnoAcknowledged") as HTMLButtonElement;
      this.btnAnnoAcknowledged.addEventListener("click", this.createListItemAnnoAcknowledged.bind(this));


      this._renderListAsync(); //call api
      this._renderAnnoListAsync();

      console.log(this._isDarkTheme + ': < current theme');
      console.log(this._environmentMessage + ': < current environmentMessage');

      this.IfAcknowledged(); //check if acknowledged or not
    } catch { }


    let divWrapper: any = document.querySelector('#divWrapper');
    setTimeout(() => {
      divWrapper?.removeAttribute("style");
    }, 1500);


  }

  private IfAcknowledged(): void {

    const queryStringParams: any = this.getQueryStringParameters();

    // Access specific query string parameters
    var AnnouncementID: string = queryStringParams['AnnouncementID'];
    const currentUserId = this.context.pageContext.legacyPageContext.userId;

    //bydefault enabl btooon
    this.btnAnnoAcknowledged.disabled = false; // disable button
    this.btnAnnoAcknowledged.textContent = "Acknowledge";

    this.context.spHttpClient.get(`//dmccdxb.sharepoint.com${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementAcknowledgements')/items?$filter=DMCCAnnouncementLookup/Id eq ${AnnouncementID} and AuthorId eq ${currentUserId}`,
      SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          return response.json().then((data) => {
            //disable btoon
            const items = data.value;
            console.log(items);
            if (items.length > 0)
              if (items[0].Title != "") {
                this.btnAnnoAcknowledged.disabled = true; // disable button
                this.btnAnnoAcknowledged.textContent = "Acknowledged";
              }
          });
        }
        else {
          //enabl btooon
          this.btnAnnoAcknowledged.disabled = false; // disable button
          this.btnAnnoAcknowledged.textContent = "Acknowledge";
        }
      });
  }
  private createListItemAnnoAcknowledged(): void {

    // Get the query string parameters from the URL
    const queryStringParams: any = this.getQueryStringParameters();

    // Access specific query string parameters
    var AnnouncementID: string = queryStringParams['AnnouncementID'];

    const lookupItemId = AnnouncementID; // Replace with the ID of the announcement item you want to lookup

    const itemData: string = JSON.stringify({
      "Title": "Acknowledged by " + this.context.pageContext.user.loginName,
      "DMCCAnnouncementLookupId": Number(lookupItemId)
    });

    this.context.spHttpClient.post(`//dmccdxb.sharepoint.com${this._FirstSite}/_api/web/lists/getbytitle('AnnouncementAcknowledgements')/items`,
      SPHttpClient.configurations.v1, {
      body: itemData,
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      }
    }).then((response: SPHttpClientResponse) => {
      if (response.status === 201) {
        // Item created successfully
        console.log('Item created successfully:AnnouncementAcknowledgements');
        this.btnAnnoAcknowledged.disabled = true; // disable button
        this.btnAnnoAcknowledged.textContent
          = "Acknowledged";
      } else {
        // Error handling
        console.log('Error creating item:', response.statusText);
        this.btnAnnoAcknowledged.disabled = false; // disable button
        this.btnAnnoAcknowledged.textContent = "Acknowledge";
      }
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

  protected onInit(): Promise<void> {

    // Fetch the property pane value and assign it to the global variable
    //  this.context.propertyPane.whenAvailable(() => {
    this._FirstSite = this.properties.firstSite || this._FirstSite;
    //});

    this.loadLibraries();

    //this.context.propertyPane.refresh();

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
