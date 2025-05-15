import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './NewsDetailsUatWebPart.module.scss';
import * as strings from 'NewsDetailsUatWebPartStrings';

import { SPComponentLoader } from '@microsoft/sp-loader';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http'; 
import dmccNews from './DmccNews';

export interface INewsDetailsUatWebPartProps {
  description: string;
  firstSite:string;
}

export interface ISPLists 
{
  value: ISPList[];
}
export interface ISPList 
{
  Title:string,
  DMCCStartDate:string,
  DMCCEndDate : string;
  DMCCContents : string;  
  DMCCShortDesc : string;  
  Author : 
  {
    EMail : string;
    Title: string;
  }
  Modified:string;
  ID:string;
    
  DMCCImage:any;   
  URL : {
    Url : string;
  }  
  DMCCDepartment:string;
}

export default class NewsDetailsUatWebPart extends BaseClientSideWebPart<INewsDetailsUatWebPartProps> {
 
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  // public _FirstSite = "/sites/DMCC-Intranet-Prod";
  public _FirstSite = "/sites/DMCCDev";
  //private btnNewsAcknowledged: HTMLButtonElement;

  public today = new Date().toISOString().slice(0,20)+"000Z";
  public queryStringParams: any = this.getQueryStringParameters();
  private _getListData(): Promise<ISPLists> { //get 1 lists from sharepoint = Web.Lists
  
// Get the query string parameters from the URL


// Access specific query string parameters
var ID: string = this.queryStringParams['NewsID'];
 

    if(ID==null || ID == "0") ID="1";
    console.log("NewsID::::"+ID);
    return this.context.spHttpClient.get(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('News')/items?$select=*,Author/Title,Author/EMail&$expand=Author/Id&$filter=ID eq ${ID}`, SPHttpClient.configurations.v1)
  .then((response: SPHttpClientResponse) => {
    return response.json();
  })
  .catch(() => {});
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

  private _getNewsListData(): Promise<ISPLists>
  {     
    var ID: string = this.queryStringParams['NewsID'];
    if(ID==null || ID == "0") ID="1";
    var endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('News')/items?$orderby=DMCCStartDate desc&$filter=(DMCCIsActive eq 1) and ID ne ${ID} and (datetime'${this.today}' ge DMCCStartDate and datetime'${this.today}' le DMCCEndDate)&$Top=2`
   // const endpointUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/GetByTitle('News')/items?$orderby=Modified%20desc&$filter=(DMCCIsActive eq 1) and (datetime'${this.today}' ge DMCCStartDate and datetime'${this.today}' le DMCCEndDate)&$Top=2`
   return this.context.spHttpClient.get(endpointUrl, SPHttpClient.configurations.v1)
    .then((response: SPHttpClientResponse) => 
       {
       return response.json();
       });
   }

   //Render the Newss details
//    private _renderList(items: ISPList[]): void { //single detail
 
//     items.forEach((item: ISPList) => {
        
//     let NewsDate : Date; 
//       NewsDate = new Date(item.DMCCStartDate);							
//       const options = { month: 'long'} as const;
//       let monthname = new Intl.DateTimeFormat('en-US', options).format(NewsDate); 
//       let Month = monthname.toString().substring(0,3);
//       let Day = NewsDate.toString().split(' ',3)[2];         
//       var Year = NewsDate.toString().split(' ',4)[3];      
//       var Time = NewsDate.toLocaleTimeString();


//     let DMCCImage:any=item.DMCCImage; 
      
//     if (DMCCImage == undefined || DMCCImage == null) 
//       {
//         DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
//       }
//       else if(item.DMCCImage.match('serverRelativeUrl') == null){
//         var Image = JSON.parse(item.DMCCImage).fileName;
//         DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/allnews/Lists/News/Attachments/${item.ID}/${Image}`;
//       }
//       else{
//         DMCCImage = window.location.protocol + "//" + window.location.host + 
//         (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
//       }
  
//    /* if(item.DMCCImage == null || DMCCImage.match('serverRelativeUrl":(.*),"id') == null){
//       DMCCImage = `${this._FirstSite}/SiteAssets/images/default.jpg`
//     }
//     else
//     { 
//       DMCCImage = window.location.protocol + "//" + window.location.host + 
//       (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
//       }*/
    
//       const spanDate:Element | null = this.domElement.querySelector('#spanDate');
//       if(spanDate!==null) spanDate.innerHTML = Day + " " + Month + " " + Year + " " +Time;

//       const imgSRC:Element | null = this.domElement.querySelector('#imgSRC');
//       if(imgSRC!==null) imgSRC.setAttribute("src", DMCCImage) ;
      
//       const pContents:Element | null = this.domElement.querySelector('#pContents');
//       if(pContents!==null) pContents.innerHTML= item.DMCCContents ;
            
//       const h4Title:Element | null = this.domElement.querySelector('#h4Title');
//       if(h4Title!==null) h4Title.innerHTML= item.Title ;
      
//       const spanAuthorDept:Element | null = this.domElement.querySelector('#spanAuthorDept');
//       if(spanAuthorDept!==null) spanAuthorDept.innerHTML = item.Author.Title + ", " + item.DMCCDepartment;
       
      
       
//   });
 
// }
private async _renderList(items: ISPList[]): Promise<void> {
  if (!items || items.length === 0) {
    console.warn("No items to display");
    return;
  }

  const item = items[0]; // Displaying only one news item
  const NewsDate = new Date(item.DMCCStartDate);

  const monthname = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(NewsDate);
  const Month = monthname.substring(0, 3);
  const Day = NewsDate.toString().split(' ', 3)[2];
  const Year = NewsDate.getFullYear().toString();
  const Time = NewsDate.toLocaleTimeString();

  // Safely get like and comment count
  let likeCount = 0, commentCount = 0;
  try {
    likeCount = await this._getLikeCount(Number(item.ID));
  } catch (e) {
    console.warn("Error getting like count:", e);
  }

  try {
    commentCount = await this._getCommentCount(Number(item.ID));
  } catch (e) {
    console.warn("Error getting comment count:", e);
  }

  // Determine the image URL
  let DMCCImage: any = item.DMCCImage;

  if (DMCCImage == undefined || DMCCImage == null) {
    DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;
  } else if (item.DMCCImage.match('serverRelativeUrl') == null) {
    var Image = JSON.parse(item.DMCCImage).fileName;
    DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/allnews/Lists/News/Attachments/${item.ID}/${Image}`;
  } else {
    DMCCImage = window.location.protocol + "//" + window.location.host +
      (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
  }

  // Get current user's profile image
  const currentUser = await this._getCurrentUser();
  const userEmail = currentUser.Email;
  const profileImageUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${userEmail}`;

  // Update the elements with the dynamic content
  const spanDate = this.domElement.querySelector('#spanDate');
  if (spanDate) spanDate.innerHTML = `${Day} ${Month} ${Year} ${Time}`;

  const imgSRC = this.domElement.querySelector('#imgSRC');
  if (imgSRC) imgSRC.setAttribute("src", DMCCImage);

  const pContents = this.domElement.querySelector('#pContents');
  if (pContents) pContents.innerHTML = item.DMCCContents ?? '';

  const h4Title = this.domElement.querySelector('#h4Title');
  if (h4Title) h4Title.innerHTML = item.Title ?? '';

  const spanAuthorDept = this.domElement.querySelector('#spanAuthorDept');
  if (spanAuthorDept) {
    const authorName = item.Author?.Title ?? 'Unknown Author';
    const department = item.DMCCDepartment ?? '';
    spanAuthorDept.innerHTML = `${authorName}, ${department}`;
  }


  // LIKE Icon - replace data-like-id
const likeIcon = this.domElement.querySelector('img[data-like-id="#LIKEID"]');
if (likeIcon) {
  likeIcon.setAttribute('data-like-id', item.ID.toString());
  console.log("Updated likeIcon data-like-id:", item.ID.toString());
}

// LIKE Count - select by partial match
const likeSpan = this.domElement.querySelector('[id^="like-count-"]');
if (likeSpan) {
  likeSpan.id = `like-count-${item.ID}`;
  likeSpan.textContent = `Like (${likeCount})`;
  console.log("Updated likeSpan:", likeSpan.id, likeSpan.textContent);
} else {
  console.warn("likeSpan not found with placeholder ID");
}


// COMMENT Icon - replace data-cmt-id
const commentIcon = this.domElement.querySelector('img[data-cmt-id="#CMTID"]');
if (commentIcon) {
  commentIcon.setAttribute('data-cmt-id', item.ID.toString());
  console.log("Updated commentIcon data-cmt-id:", item.ID.toString());
}

// COMMENT Count - select by partial match
const commentSpan = this.domElement.querySelector('[id^="Cmt-count-"]');
if (commentSpan) {
  commentSpan.id = `Cmt-count-${item.ID}`;
  commentSpan.textContent = `Comment (${commentCount})`;
  console.log("Updated commentSpan:", commentSpan.id, commentSpan.textContent);
} else {
  console.warn("commentSpan not found with placeholder ID");
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

// Replace profile image
const profileImg = this.domElement.querySelector('img#profile-img, img[src="#PROFILEIMG"]');
if (profileImg) {
  profileImg.setAttribute("src", profileImageUrl);
}

  // Register Like and Comment events
  this._registerLikeEvents();
  this._registerCommentEvents(Number(item.ID));
  await this._loadComments(Number(item.ID));
}




// private async _renderList(items: ISPList[]): Promise<void> {
//   if (!items || items.length === 0) {
//     console.warn("No items to display");
//     return;
//   }

//   const item = items[0]; // Displaying only one news item
//   const NewsDate = new Date(item.DMCCStartDate);

//   const monthname = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(NewsDate);
//   const Month = monthname.substring(0, 3);
//   const Day = NewsDate.toString().split(' ', 3)[2];
//   const Year = NewsDate.getFullYear().toString();
//   const Time = NewsDate.toLocaleTimeString();

//   // Safely get like and comment count
//   let likeCount = 0, commentCount = 0;
//   try {
//     likeCount = await this._getLikeCount(Number(item.ID));
//   } catch (e) {
//     console.warn("Error getting like count:", e);
//   }

//   try {
//     commentCount = await this._getCommentCount(Number(item.ID));
//   } catch (e) {
//     console.warn("Error getting comment count:", e);
//   }

//   // Determine the image URL
//   let DMCCImage:any=item.DMCCImage; 
      
//     if (DMCCImage == undefined || DMCCImage == null) 
//       {
//         DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
//       }
//       else if(item.DMCCImage.match('serverRelativeUrl') == null){
//         var Image = JSON.parse(item.DMCCImage).fileName;
//         DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/allnews/Lists/News/Attachments/${item.ID}/${Image}`;
//       }
//       else{
//         DMCCImage = window.location.protocol + "//" + window.location.host + 
//         (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
//       }
  
//         // Update Like & Comment placeholders
//         const currentUser = await this._getCurrentUser();
//         const userEmail = currentUser.Email;
//         const profileImageUrl = `${this.context.pageContext.site.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${userEmail}`;
      
//         // Replace #PROFILEIMG with the current user's profile image URL
//         let updatedHtml = dmccNews.html
//           .replace(/#PROFILEIMG/g, profileImageUrl)  // Replacing the profile image
//           .replace(/#LIKEID/g, item.ID.toString())
//           .replace(/#CMTID/g, item.ID.toString())
//           .replace(/#LIKECOUNT/g, likeCount.toString())
//           .replace(/#CMCNT/g, commentCount.toString());

// this.domElement.innerHTML = updatedHtml;
//   // Populate the DOM
//   const spanDate = this.domElement.querySelector('#spanDate');
//   if (spanDate) spanDate.innerHTML = `${Day} ${Month} ${Year} ${Time}`;

//   const imgSRC = this.domElement.querySelector('#imgSRC');
//   if (imgSRC) imgSRC.setAttribute("src", DMCCImage);

//   const pContents = this.domElement.querySelector('#pContents');
//   if (pContents) pContents.innerHTML = item.DMCCContents ?? '';

//   const h4Title = this.domElement.querySelector('#h4Title');
//   if (h4Title) h4Title.innerHTML = item.Title ?? '';

//   const spanAuthorDept = this.domElement.querySelector('#spanAuthorDept');
//   if (spanAuthorDept) {
//     const authorName = item.Author?.Title ?? 'Unknown Author';
//     const department = item.DMCCDepartment ?? '';
//     spanAuthorDept.innerHTML = `${authorName}, ${department}`;
//   }

//   // Update Like & Comment placeholders
  

//   this._registerLikeEvents();
//   this._registerCommentEvents(Number(item.ID));
//   await this._loadComments(Number(item.ID));
// }

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

private _registerCommentEvents(newsId: number): void {
  const input = this.domElement.querySelector('#desc') as HTMLInputElement;
  const button = this.domElement.querySelector('#add-comment-btn') as HTMLButtonElement;

  if (!input || !button) return;

  button.addEventListener('click', async () => {
    const commentText = input.value.trim();
    if (commentText === '') return;

    await this._saveComment(newsId, commentText);
    input.value = '';
    await this._loadComments(newsId);
  });
}

private async _saveComment(newsId: number, commentText: string): Promise<void> {
  const subsiteUrl = `${this._FirstSite}/allnews`;
  const currentUser = await this._getCurrentUser();

  const body = {
    '__metadata': { 'type': 'SP.Data.NewsCommentsListItem' },
    'NewsIdId': newsId,
    'UserIdId': currentUser.Id,
    'Comments': commentText
  };

  await this.context.spHttpClient.post(
    `${subsiteUrl}/_api/web/lists/getbytitle('NewsComments')/items`,
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
private async _loadComments(newsId: number): Promise<void> {
  const subsiteUrl = `${this._FirstSite}/allnews`;

  const currentUser = await this._getCurrentUser();
  const isAdmin = await this._checkIfUserIsAdmin(); 

  const res = await this.context.spHttpClient.get(
    `${subsiteUrl}/_api/web/lists/getbytitle('NewsComments')/items?$filter=NewsId/Id eq ${newsId}&$orderby=Created desc&$top=10&$select=Id,Comments,Created,UserId/Id,UserId/Title,UserId/EMail&$expand=UserId`,
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

  // Register delete event listeners
  this._registerDeleteCommentEvents(newsId);

  // Update comment count
  const countSpan = this.domElement.querySelector(`#Cmt-count-${newsId}`);
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
private _registerDeleteCommentEvents(newsId: number): void {
  const buttons = this.domElement.querySelectorAll('.delete-comment');
  buttons.forEach(button => {
    button.addEventListener('click', async (event: any) => {
      const commentId = parseInt(event.target.getAttribute('data-comment-id'));
      const confirmDelete = confirm('Are you sure you want to delete this comment?');
      if (confirmDelete) {
        await this._deleteComment(commentId);
        await this._loadComments(newsId); // Refresh comments
      }
    });
  });
}
private async _deleteComment(commentId: number): Promise<void> {
  const subsiteUrl = `${this._FirstSite}/allnews`;

  await this.context.spHttpClient.post(
    `${subsiteUrl}/_api/web/lists/getbytitle('NewsComments')/items(${commentId})`,
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

  console.log(`Comment with ID ${commentId} deleted.`);
}




  private _renderAnnoListAsync(): void
    {
      this._getNewsListData() 
        .then((response) => { 
          this._renderNewsList(response.value); 
        }); 
    } 
    private _renderListAsync(): void {
      this._getListData()
        .then((response) => {
          this._renderList(response.value);
        })
        .catch(() => {});
    }
  private _renderNewsList(items: ISPList[]): void 
   {
    let allElementsHtml:string="";
    let singleElementHtml:string=dmccNews.singleElementHtml;
      
    const tempElement =document.createElement('div');

    items.forEach((item: ISPList) => {


    let DMCCImage:any=item.DMCCImage;
      tempElement.innerHTML = item.DMCCShortDesc;
            let tempDesc:any =  tempElement.textContent;
            item.DMCCShortDesc =(tempDesc+"").substring(0,81);

    if (DMCCImage == undefined || DMCCImage == null) 
      {
        DMCCImage =  `//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/default.jpg`;      
      }
      else if(item.DMCCImage.match('serverRelativeUrl') == null){
        var Image = JSON.parse(item.DMCCImage).fileName;
        DMCCImage = `//dmccdxb.sharepoint.com${this._FirstSite}/allnews/Lists/News/Attachments/${item.ID}/${Image}`;
      }
      else{
        DMCCImage = window.location.protocol + "//" + window.location.host + 
        (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
      }
            
   /*   if(item.DMCCImage == null || DMCCImage.match('serverRelativeUrl":(.*),"id') == null){
        DMCCImage =  `${this._FirstSite}/SiteAssets/images/default.jpg`
      }
      else
      { 
       DMCCImage = window.location.protocol + "//" + window.location.host + 
      (DMCCImage.match('serverRelativeUrl":(.*),"id')[1].split('"', 2)[1]);
      }*/

      
    let NewsDate : Date; 
      NewsDate = new Date(item.DMCCStartDate);							
      const options = { month: 'long'} as const;
      let monthname = new Intl.DateTimeFormat('en-US', options).format(NewsDate); 
      let Month = monthname.toString().substring(0,3);
      let Day = NewsDate.toString().split(' ',3)[2];         
      var Year = NewsDate.toString().split(' ',4)[3];


       singleElementHtml = dmccNews.singleElementHtml.replace("#DAY",    Day+"");
       singleElementHtml = singleElementHtml.replace("#MONTH",    Month+"");
       singleElementHtml =singleElementHtml.replace("#YEAR",    Year+"");
      singleElementHtml = singleElementHtml.replace("#CONTENTS",    item.DMCCShortDesc+"");
      singleElementHtml = singleElementHtml.replace("#IMGSRC",   DMCCImage+"");
      singleElementHtml = singleElementHtml.replace("#NewsID",item.ID)  

      singleElementHtml= singleElementHtml.replace(new RegExp("_FirstSite", "g"), this._FirstSite);
      allElementsHtml +=  singleElementHtml;
       
    });
    const DMCCSideNews:Element | null = this.domElement.querySelector('#DMCCSideNews');
    if(DMCCSideNews!==null) DMCCSideNews.innerHTML = allElementsHtml;
     
  }
  public render(): void {
    const workbenchContent = document.getElementById('workbenchPageContent'); 

    if (workbenchContent) { 
  
      workbenchContent.style.maxWidth = 'none'; 
  
    } 
    try {

    this.domElement.innerHTML = dmccNews.html;  
    this.domElement.innerHTML= this.domElement.innerHTML.replace(new RegExp("_FirstSite", "g"), this._FirstSite);
    this.domElement.style.visibility = "hidden";
    



    this.domElement.style.visibility = 'visible';
    this._renderAnnoListAsync(); 
    this._renderListAsync(); //call api
   


      SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/jquery-3.6.0.js`, {
        globalExportsName: 'jQuery'
      }).catch((error) => {
        console.log("jQuery loader error occurred");
      }).then(() => {
        return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/bootstrap.bundle.min.js`);
      }).then(() => {
        return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/jquery-ui.js`);
      }).then(() => {
        return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/js/swiper-bundle.min.js?v= + new Date().getTime()`);
        //}).then(() => {
        // return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${_FirstSite}/SiteAssets/js/index.bundle.min.js?v=  + new Date().getTime()`);//lightbox
      }).then(() => {
        //    return SPComponentLoader.loadScript(`//dmccdxb.sharepoint.com${_FirstSite}/SiteAssets/js/custom.js?v= + new Date().getTime());
        const scriptTag = document.createElement('script');
        scriptTag.id = 'customfileid'
        //scriptTag.src = //dmccdxb.sharepoint.com${_FirstSite}/SiteAssets/js/custom.js?v= + new Date().getTime();
        document.body.appendChild(scriptTag);
      }).then(() => {
        document.getElementById('divloader')?.setAttribute('style', 'display:none;');
      });

     
    } catch (error : any) {
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

   protected onInit(): Promise<void> {
    this._FirstSite = this.properties.firstSite || this._FirstSite;
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Web Part Settings" //strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Custom Settings",//strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('firstSite', {
                  label: 'Main Site', //strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
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
}
