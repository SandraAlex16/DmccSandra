export default class DmccUpcomingEvents
{
  //side html

  public   singleElementHtml:string=` 

  <div class="w-100 mb-4 float-start mt-2">
    <div class="w-100 float-start d-flex flex-column align-items-start border">
      <div class="w-100 float-start position-relative">
        <div
          class="date-box-news position-absolute text-white top-0 start-0 d-flex flex-column align-items-center justify-content-center">
          <p class="m-0 p-0 font-MyriadProBold">#DAY</p>
          <span class="text-sm font-MyriadProSemibold">#MONTH #YEAR</span>
        </div>
        <img class="w-100" src="#IMGSRC" />
      </div>
      <div class="w-100 float-start p-3">
        <a class="text-lg gp-text-dark pt-3 m-0 lh-base text-decoration-none">
          #CONTENTS
          </br>
          Location : #LOCATION
          </a>

        <div class="d-flex align-items-center mt-4">
          <a href="_FirstSite/allevents/SitePages/Upcoming-Event-Details.aspx?env=Embedded&UpcomingEventsID=#UpcomingEventsID"
            class="d-flex align-items-center gap-1 font-MyriadProSemibold gp-text-dark pt-1 cursor-pointer text-decoration-none">Read
            More
            <img src="_FirstSite/SiteAssets/images/icons/arrow-right-line.png" /></a>
        </div>
      </div>
    </div>
  </div>
  `;
 
    public   html:string = `   
     <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <link href="_FirstSite/SiteAssets/css/bootstrap.min.css" rel="stylesheet" />
    <link href="_FirstSite/SiteAssets/css/layout.css" rel="stylesheet" />
    <link href="_FirstSite/SiteAssets/css/custom.css" rel="stylesheet" />

    <div class="main-wrapper min-h-screen-container">
    <div class="container container-gp px-3 px-lg-4 clearfix">
      <div class="w-100 float-start pt-4">
        <div class="row">
          <div class="col-12 mb-4">
            <div id='divWrapper' style='display:none;' class="col-box-wrapper w-100 float-start bg-white gp-shadow">
            
        <div class="col-box-title col-box-title-links d-flex flex-column flex-md-row bg-white position-relative">
            <div class="d-flex align-items-center gap-3">
                <div class="col-box-icon sqbx-theme-2 d-flex flex-shrink-0 align-items-center justify-content-center">
                  <img class="mw-px-60" src="_FirstSite/SiteAssets/images/icons/Events.png" />
                </div>					
                <p class="text-truncate text-uppercase m-0 font-MyriadProBold d-md-none">
                  EVENT DETAILS
                </p>
             </div>
             <div class="flex-grow-1 ps-3 pe-3 d-flex justify-content-center justify-content-md-between align-items-center">
                <p class="text-truncate text-uppercase m-0 font-MyriadProBold d-none d-md-block">
                EVENT DETAILS
                </p>
                <div class="flex-shrink-0 d-flex gap-2 top-title-links-wrapper mt-3 mb-2 mb-md-0 mt-md-0">
                <a href="_FirstSite/allevents/?env=Embedded"
                  class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-sm  text-decoration-none font-MyriadProBold text-white text-nowrap">View All
                </a>                                
                <a href="https://outlook.office.com/calendar/view/month?env=Embedded"
                  class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-sm  text-decoration-none font-MyriadProBold text-white text-nowrap">View Calendar
                </a>
             </div>
          </div>
        </div>
        <div class="w-100 float-start px-4 pt-4">
          <div class="row gx-xxl-5">
            <div class="col-12 col-lg-8 col-xl-9">
              <div class="w-100 float-start mb-3 mt-2">
                <h4 id="h4Title" class="w-100 float-start mb-3 font-size-32 font-MyriadProSemibold"></h4>
              


                      <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">
                      <div class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">Published Date:</span>
                        <span id="spanDate" class="font-MyriadProBold"></span>
                      </div>
                      <div class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">Published By:</span>
                        <span id="spanAuthorDept" class="font-MyriadProBold"></span>
                      </div>               
                    </div>					  
                    <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">                        
                      <div class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">Start Date:</span>
                        <span id="spanStartDate" class="font-MyriadProBold"></span>
                      </div>
                      <div id="endDateSection" class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">End Date:</span>
                        <span id="spanEndDate" class="font-MyriadProBold"></span>
                      </div>					   
                    </div>
                   <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">  
                      <div class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">Location:</span>
                        <span id="spanLocation" class="font-MyriadProBold"></span> 
                       </div>
                   </div>



                    </div>
                  </div>
                  <div class="col-12 col-lg-8 col-xl-9">
                    <div class="w-100 float-start mb-3 mt-2">
                      <div class="w-100 float-start d-flex flex-column">
                        <img class="w-100 mb-4" id="imgSRC" src="" />
                        <span class="pe-1">Details:</span>                                        
                        <p id="pContents" class="text-lg gp-text-dark lh-base mb-3">
                         
                        </p>
         
             <div class="w-100 float-start d-flex align-items-center font-MyriadProRegular gap-3 mb-4">
                        <div class="d-flex align-items-center gap-2">
                          <img class="flex-shrink-0 cursor-pointer like-icon" src="_FirstSite/SiteAssets/images/icons/like-icon-grey.png"  data-like-id="#LIKEID"/>
                          <p class="text-base m-0 like-count cursor-pointer" id="like-count-#LIKEID">Like (#LIKECOUNT)</p>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <img class="flex-shrink-0 cursor-pointer" src="_FirstSite/SiteAssets/images/icons/comment-icon-grey.png"/>
                          <p class="text-base m-0" id="Cmt-count-#CMTID">Comment (#CMCNT)</p>
                        </div>
                    </div>
                    <div class="comment-sec-wrapper w-100 float-start mb-4">
                      <div class="w-100 float-start d-flex align-items-center comment-ip-wrapper gap-2">
                        <img class="flex-shrink-0 comment-sec-avatar" src="#PROFILEIMG"/>
                        <div class="w-100 float-start px-12 py-12 d-flex flex-column form-group-bg position-relative">
                          <label for="subject" class="mb-1 font-MyriadProSemibold text-xs text-black">Add your comments</label>
                          <textarea class="form-control dmcc-form-input text-base text-black" id="desc" placeholder="Write your comment...."></textarea>
                          <button type="button" class="dmcc-btn news-details-btn align-self-center float-start px-3 py-1 text-sm font-MyriadProBold cursor-pointer" id="add-comment-btn">
                           Send
                          </button>
                        </div>
                      </div>
                      <div class="comment-list-wrapper custom-scroll-view w-100 float-start d-flex flex-column mt-3" id="commentsContainer">

                      </div>
                    </div>
                    <!-- Comment section HTML end -->
                        
                      </div>
                    </div>

                  </div>
                  <div id="DMCCSideEvents" class="col-12 d-none d-lg-flex flex-column col-lg-4 col-xl-3 news-right-box-wrapper custom-scroll-view">                 
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    <div id="likeEventUsersPopup" class="like-event-users-popup" style="display: none;"></div>


                    `;

}