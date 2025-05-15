export default class DmccjsSpecialOffers
{

 
  //side html  
    // public static _FirstSite: string ="/sites/DMCC-Intranet-Prod";
    public static _FirstSite: string ="/sites/DMCCDev";

    public static AllAttachmentsHtml:string=`
    <a href="#" onclick="window.open('#ATTACHMENTURL');return false;">
    <span class="font-MyriadProBold">#ATTACHMENTTITLE</span>
    </a></br>
    `;

    public static SpecialOffersHtml:string=` 
 


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
        <p class="text-lg gp-text-dark pt-3 m-0 lh-base text-decoration-none">
          #CONTENTS</p>
        <div class="d-flex align-items-center mt-4">
          <a href="${this._FirstSite}/SitePages/Special-Offers-details.aspx?env=WebView&SpecialOfferID=#SpecialOfferID"
            class="d-flex align-items-center gap-1 font-MyriadProSemibold gp-text-dark pt-1 cursor-pointer text-decoration-none">Read
            More
            <img src="${this._FirstSite}/SiteAssets/images/icons/arrow-right-line.png" /></a>
        </div>
      </div>
    </div>
  </div>
  
    `;
 
    public static html:string = `  
    
    <!--<link href="/sites/dmcc-intranet-prod/SiteAssets/css/bootstrap.min.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css.map" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.scss" rel="stylesheet" />  
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/swiper-bundle.min.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/jquery-ui.css" rel="stylesheet" />-->

  <div class="main-wrapper min-h-screen-container">
  <div class="container container-gp px-3 px-lg-4 clearfix">
    <div class="w-100 float-start pt-4">
      <div class="row">
        <div class="col-12 mb-4">
          <div id="divWrapper" style="display:none;" class="col-box-wrapper w-100 float-start bg-white gp-shadow">
            <div class="col-box-title d-flex bg-white position-relative">
              <div class="col-box-icon sqbx-theme-2 d-flex flex-shrink-0 align-items-center justify-content-center">
                <img class="mw-px-60" src="${this._FirstSite}/SiteAssets/images/icons/Offers.png" />
              </div>
              <div class="flex-grow-1 px-3 overflow-hidden d-flex justify-content-between align-items-center">
                <p class="text-truncate text-uppercase m-0 font-MyriadProBold">
               OFFER DETAILS
                </p>
                <div class="float-start pe-2">
                  <a target="_blank" href="${this._FirstSite}/SitePages/Special-Offers.aspx?env=WebView"
                    class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-sm mt-3 mb-2 text-decoration-none font-MyriadProBold text-white">View
                    All Special Offers</a>     
                 <!-- <a target="_blank" href="${this._FirstSite}/SitePages/Bayzat-Offers.aspx?env=WebView"
                    class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-sm mt-3 mb-2 text-decoration-none font-MyriadProBold text-white" style="margin-left: 25px !important;">View
                    All Bayzat Offers</a>   -->                   
                </div>
              </div>
            </div>
            <div class="w-100 float-start px-4 pt-4">
              <div class="row gx-xxl-5">
                <div class="col-50 col-lg-4 col-xl-3">
                  <img class="w-100 mb-4" id="imgSRC" src="${this._FirstSite}/SiteAssets/images/slider/news-1.png" /> 
                </div>
                <div class="col-12 col-lg-8 col-xl-6">
                  <div class="w-100 float-start mb-3 mt-2">
                    <h4 id="h4Title" class="w-100 float-start mb-3 font-size-32 font-MyriadProSemibold"></h4>
           <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">
                        <div class="text-sm d-flex flex-wrap align-items-center">
                          <span class="pe-1">Shop Name :</span>
                          <span id="spanshopName" class="font-MyriadProBold"></span>
                        </div>
                        <div class="text-sm d-flex flex-wrap align-items-center">
                          <span class="pe-1">Discount code :</span>
                          <span id="spanDiscountcode" class="font-MyriadProBold"></span>
                        </div>       
                     </div>
            <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">
                      <div class="text-sm d-flex flex-wrap align-items-center" id="LocationhtmlID">
                      <span class="pe-1">Location :</span>
                      <span id="spanLocation" class="font-MyriadProBold"></span>
                      </div>         
                      <div class="text-sm d-flex flex-wrap align-items-center">
                      <span class="pe-1">Start Date :</span>
                      <span id="spanStartDate" class="font-MyriadProBold"></span>
                      </div>  
                   </div>
                   <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">   
                      <div class="text-sm d-flex flex-wrap align-items-center">
                      <span class="pe-1">Expiry Date :</span>
                      <span id="spanExpiryDate" class="font-MyriadProBold"></span>
                      </div> 
                      <div class="text-sm d-flex flex-wrap align-items-center">
                      <span class="pe-1">Published Date:</span>
                      <span id="spanDate" class="font-MyriadProBold"></span>
                     </div>   
                    </div>

                    <div class="w-100 float-start mb-3 d-flex justify-content-between flex-wrap">                       
                      <div class="text-sm d-flex flex-wrap align-items-center">
                        <span class="pe-1">Published By:</span>
                        <span id="spanAuthorDept"  class="font-MyriadProBold"></span>
                      </div>
                    </div>

                   
                  </div>
               </div>
                <div class="col-12 col-lg-8 col-xl-9">
                  <div class="w-100 float-start mb-3 mt-2">
                    <div class="w-100 float-start d-flex flex-column">
                      <!--<img class="w-100 mb-4" id="imgSRC" src="${this._FirstSite}/SiteAssets/images/slider/news-1.png" /> -->                                                              
                      <p id="pContents" class="text-lg gp-text-dark lh-base mb-3">
                       
                      </p>                   
                                       
                      <p class="text-lg gp-text-dark lh-base mb-3">
                      Attachments:
                     </p> 
                      <div class="text-sm d-flex flex-wrap align-items-center">                               
                      <span class="pe-1" id="allAttachments"></span>                        
                      </div>
                  
<!-- Comment section HTML start -->
                    <div class="w-100 float-start d-flex align-items-center font-MyriadProRegular gap-3 mb-4">
                         <div class="d-flex align-items-center gap-2">
                          <img class="flex-shrink-0 cursor-pointer like-icon" src="_FirstSite/SiteAssets/images/icons/like-icon.png" alt="Like" title="Like" data-like-id="#LIKEID"/>
                          <p class="text-base m-0 text-dark like-count cursor-pointer" id="like-count-#LIKEID">Like (#LIKECOUNT)</p>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                          <img class="flex-shrink-0 cursor-pointer" src="_FirstSite/SiteAssets/images/icons/comment-icon.png" 
                          alt="Comment" title="Comment" data-cmt-id="#CMTID"/>
                          <p class="text-base m-0"  id="Cmt-count-#CMTID" >Comment(#CMCNT)</p>
                        </div>
                    </div>
                    <div class="comment-sec-wrapper w-100 float-start mb-4">
                      <div class="w-100 float-start d-flex align-items-center comment-ip-wrapper gap-2">
                        <img class="flex-shrink-0 comment-sec-avatar" src="#PROFILEIMG"/>
                        <div class="w-100 float-start px-12 py-12 d-flex flex-column form-group-bg">
                          <label for="subject" class="mb-1 font-MyriadProSemibold text-xs text-black">Add your comments</label>
                          <textarea class="form-control dmcc-form-input text-base text-black" id="desc" placeholder="Write your comment...."></textarea>
                        </div>
                      </div>
                      <div class="w-100 float-start d-flex justify-content-end mt-2">
                        <button type="button" class="dmcc-btn news-details-btn align-self-center float-start px-3 py-1 text-sm font-MyriadProBold cursor-pointer" id="add-comment-btn">
                          Send
                        </button>
                      </div>
                       <div class="comment-list-wrapper custom-scroll-view w-100 float-start d-flex flex-column mt-3" id="commentsContainer">
                        

                      </div>
                    </div>
                    <!-- Comment section HTML end -->

                    </div>
                  </div>
      
                </div>
                <div id="DMCCSideSpecialOffers" class="col-12 d-none d-lg-flex flex-column col-lg-4 col-xl-3 news-right-box-wrapper custom-scroll-view">                 
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  <div id="likeUsersPopup" class="like-users-popup" style="display: none;"></div>
                    `;
}