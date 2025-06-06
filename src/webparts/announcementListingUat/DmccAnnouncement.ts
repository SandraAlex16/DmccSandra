export default class DmccAnnouncement {

    public NOsingleElementHtml: string = `  
      
    <div class="col-md-4 float-start">
        <div class="w-100 h-100 float-start d-flex flex-column align-items-start border">
           No record found!
        </div>
      </div>
    `;
  
    //side html
    public singleElementHtml: string = ` 
   
      
  <div class="col-md-4 float-start">
                  <div class="w-100 h-100 float-start d-flex flex-column gap-3 pb-2 justify-content-between border">
                    <div class="w-100 d-flex flex-column">
                      <div class="w-100 float-start position-relative">
                        <div
                          class="date-box-news position-absolute text-white top-0 start-0 d-flex flex-column align-items-center justify-content-center">
                          <p class="m-0 p-0 font-MyriadProBold">#DAY</p>
                          <span class="text-sm font-MyriadProSemibold">#MONTH #YEAR</span>
                        </div>
                        <img class="w-100 max-h-260 object-cover-center news-img-list" src="#IMGSRC" />
                      </div>
                      <div class="w-100 float-start p-3 d-flex flex-column gap-2">
                        <a class="dmcc-text-dark font-MyriadProSemibold font-size-22 float-start m-0 lh-sm text-decoration-none">
                        #CONTENTS</a>
                        
                      </div>
                    </div>
                    <div class="w-100 d-flex flex-wrap gap-2 flex-shrink-0 justify-content-between align-items-center px-3">
                      <div class="d-flex float-start align-items-center">
                        <a href="_FirstSite/SitePages/Announcement-Detail-Page.aspx?env=Embedded&AnnouncementID=#AnnouncementID"
                          class="d-flex align-items-center gap-1 text-base dmcc-text-dark pt-1 cursor-pointer text-decoration-none">Read
                          More
                          <img class="mw-px-18" src="_FirstSite/SiteAssets/images/icons/arrow-right-line.png" /></a>
                      </div>
                      <div class="float-start d-flex align-items-center font-MyriadProRegular gap-2 flex-shrink-0">
                          <div class="d-flex align-items-center gap-1 like-info">
                            <img class="flex-shrink-0 cursor-pointer like-icon" src="_FirstSite/SiteAssets/images/icons/like-icon-grey.png" data-like-id="#LIKEID">
                            <p class="text-base m-0 like-count cursor-pointer" id="like-count-#LIKEID">Like (#LIKECOUNT)</p>
                          </div>
                          <a href="_FirstSite/SitePages/Announcement-Detail-Page.aspx?AnnouncementID=#LIKEID#scrollToComments" class="d-flex align-items-center gap-1 comment-link-btn">
                              <img class="flex-shrink-0 cursor-pointer" src="_FirstSite/SiteAssets/images/icons/comment-icon-grey.png">
                              <p class="text-base m-0">Comment (#CMCNT)</p>
                            </a>
                      </div>
                    </div>
                  </div>
    </div>
          <div id="likeUsersPopup" class="like-users-popup" style="display: none;"></div> `;
  
    public html: string = `	 
  
   <!-- <link href="/sites/dmcc-intranet-prod/SiteAssets/css/bootstrap.min.css" rel="stylesheet" />
      <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css" rel="stylesheet" />
      <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css.map" rel="stylesheet" />
      <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.scss" rel="stylesheet" />  
      <link href="/sites/dmcc-intranet-prod/SiteAssets/css/swiper-bundle.min.css" rel="stylesheet" />
      <link href="/sites/dmcc-intranet-prod/SiteAssets/css/jquery-ui.css" rel="stylesheet" />-->
  
  
      <div class="main-wrapper min-h-screen-container">
      <div class="container container-gp px-3 px-lg-4 clearfix">
        <div class="w-100 float-start pt-4">
          <divclass="row">
            <div class="col-12 mb-4">
              <div style='display:none;' id='divWrapper'  class="col-box-wrapper w-100 float-start bg-white gp-shadow d-flex flex-column">
              <div class="col-box-title col-box-title-details d-flex flex-column flex-md-row bg-white position-relative">
              <div class="d-flex align-items-center gap-3">
                <div class="col-box-icon sqbx-theme-2 d-flex flex-shrink-0 align-items-center justify-content-center">
                  <img class="mw-px-60" src="_FirstSite/SiteAssets/images/icons/NewsFeed.png" />
                </div>
                 <p class="text-truncate text-uppercase m-0 font-MyriadProBold d-md-none">
                    ANNOUNCEMENTS
                  </p>
                 </div>  
                 <div class="flex-grow-1 ps-3 pe-3 d-flex justify-content-between align-items-center">
                 <p class="text-truncate text-uppercase m-0 font-MyriadProBold d-none d-md-block">
                    ANNOUNCEMENTS
                 </p>
                       <div class="flex-shrink-0 d-flex align-items-center gap-2 details-filter-wrapper mt-3 mt-md-0">
                         <div class="float-start filter-search-input">             
                          <input id="searchAnnouncementsId" class="form-control form-control gp-input gp-input-search gp-input-search-inside"
                            type="text" placeholder="Search Announcements" aria-label="Search" />
                        </div>
                      <div class="dropdown dmcc-dropdown">
                      <select type="button" id="month-dropdown" class="dropdown-toggle dmcc-form-select" data-bs-toggle="dropdown" aria-expanded="false">                  
                      <div class="dropdown-menu month-dropdown-menu" aria-labelledby="month-dropdown">                
                        <option class="dropdown-item">All</option>
                        <option class="dropdown-item">January</option>
                        <option class="dropdown-item">February</option>
                        <option class="dropdown-item">March</option>
                        <option class="dropdown-item">April</option>
                        <option class="dropdown-item">May</option>
                        <option class="dropdown-item">June</option>
                        <option class="dropdown-item">July</option>
                        <option class="dropdown-item">August</option>
                        <option class="dropdown-item">September</option>
                        <option class="dropdown-item">October</option>
                        <option class="dropdown-item">November</option>
                        <option class="dropdown-item">December</option>      
                      </div>
                                             
                      </select>               
                    </div>
  
                    <div class="dropdown dmcc-dropdown">
                      <select type="button" class="dropdown-toggle dmcc-form-select" type="button" id="year-dropdown" data-bs-toggle="dropdown"
                      aria-expanded="false">                            
                    </select>                   
                    </div>  
                   </div>
                  </div>
                </div>
  
                <div class="row gap-0 px-4 py-4 gy-4" id="AnnouncementListings">
                
                </div>			  
                <div class="w-100 float-start mb-4 px-4 d-flex justify-content-center">
                  <button class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-lg text-white" id="BtnLoadMoreAnnouncements" type="button">
                    Load More
                  </button>
                  <input type="hidden" id="LastLoadedAnnouncementID"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> `;
  }