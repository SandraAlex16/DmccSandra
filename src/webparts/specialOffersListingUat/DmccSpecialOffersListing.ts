export default class DmccSpecialOffersListing
{
  //side html
    public   SpecialOffersListingHtml:string=` 
 
    <div class="col-md-4 float-start">
    <div class="w-100 h-100 float-start d-flex flex-column align-items-start border">
      <div class="w-100 float-start position-relative">
        <div
          class="date-box-news position-absolute text-white top-0 start-0 d-flex flex-column align-items-center justify-content-center">
          <p class="m-0 p-0 font-MyriadProBold">#DAY</p>
          <span class="text-sm font-MyriadProSemibold">#MONTH #YEAR</span>
        </div>
        <img class="w-100 max-h-260 object-cover-center news-img-list" src="#IMGSRC" />
      </div>
      <div class="w-100 float-start p-3">
        <p class="text-lg gp-text-dark float-start m-0 lh-base text-decoration-none">
          #CONTENTS</p>
        <div class="d-flex w-100 float-start align-items-center mt-4">
        <a href="_FirstSite/SitePages/Special-Offers-details.aspx?env=WebView&SpecialOfferID=#SpecialOfferID"
            class="d-flex align-items-center gap-1 font-MyriadProSemibold gp-text-dark pt-1 cursor-pointer text-decoration-none">Read
            More
            <img src="_FirstSite/SiteAssets/images/icons/arrow-right-line.png" /></a>
             <div class="d-flex align-items-center" style="margin-left: 40px;">

                <img class="mw-px-18 me-1 cursor-pointer spclOffer-like-icon" src="_FirstSite/SiteAssets/images/icons/like-icon.png" 
                     alt="Like" title="Like" data-like-id="#LIKEID" />
              <span class="text-sm spclOffer-like-count cursor-pointer" id="spclOffer-like-count-#LIKEID">Like (#LIKECOUNT)</span>
                
      <a href="_FirstSite/SitePages/Special-Offers-details.aspx?SpecialOfferID=#LIKEID#scrollToComments"  class="d-flex align-items-center text-decoration-none ms-3">
            <img class="mw-px-18 me-1 cursor-pointer" src="_FirstSite/SiteAssets/images/icons/comment-icon.png" 
                alt="Comment" title="Comment" />
            <span class="text-sm" style="color: black;">Comment (#CMCNT)</span>
          </a>
            </div>
        </div>
      </div>
    </div>
  </div>
    <div id="likeUsersPopup" class="like-users-popup" style="display: none;"></div>


    `;
 
    public   html:string = `
  <link href="/sites/dmcc-intranet-prod/SiteAssets/css/bootstrap.min.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.css.map" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/custom.scss" rel="stylesheet" />  
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/swiper-bundle.min.css" rel="stylesheet" />
    <link href="/sites/dmcc-intranet-prod/SiteAssets/css/jquery-ui.css" rel="stylesheet" />


  <div class="main-wrapper min-h-screen-container">
  <div class="container container-gp px-3 px-lg-4 clearfix">
    <div class="w-100 float-start pt-4">
      <div class="row">
        <div class="col-12 mb-4">
          <div id='divWrapper' style='display:none;' class="col-box-wrapper w-100 float-start bg-white gp-shadow d-flex flex-column">
            <div class="col-box-title col-box-title-details d-flex flex-column flex-md-row bg-white position-relative">
               <div class="d-flex align-items-center gap-3">
                <div class="col-box-icon sqbx-theme-2 d-flex flex-shrink-0 align-items-center justify-content-center">
                  <img class="mw-px-60" src="_FirstSite/SiteAssets/images/icons/Offers.png" />
                </div>                
                 <div class="d-flex d-md-none">
                    <p data-tab="offer-tab-1" class="offer-tab-1 offer-tab-title active-tab-title border-bottom border-end px-3 d-flex align-items-center">
                      <span>Special Offers</span>
                    </p>
                    <p data-tab="offer-tab-2" class="offer-tab-2 offer-tab-title px-3 border-bottom border-end d-flex align-items-center">
                      <span>BAYZAT OFFERS</span>
                    </p>
                  </div>
               </div>
                <div class="flex-grow-1 d-flex justify-content-between">
                  <div class="d-none d-md-flex">
                    <p id="specialOfferTab" data-tab="offer-tab-1" class="offer-tab-1 offer-tab-title active-tab-title border-bottom border-end px-3 d-flex align-items-center">
                      <span>Special Offers</span>
                    </p>
                    <p id="bayzatOfferTab" data-tab="offer-tab-2" class="offer-tab-2 offer-tab-title px-3 border-bottom border-end d-flex align-items-center">
                      <span>BAYZAT OFFERS</span>
                    </p>
                  </div>

                <div class="flex-shrink-0 d-flex align-items-center gap-2 details-filter-wrapper mt-3 mt-md-0"> 
                  <div class="float-start filter-search-input">
                    <input id="searchSpecialOffersId" class="form-control form-control gp-input gp-input-search gp-input-search-inside"
                      type="text" placeholder="Search Offers" aria-label="Search" />
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
			  
            <div class="row gap-0 px-4 py-4 gy-4" id="SpecialOfferListings"></div>			  
            <div class="w-100 float-start mb-4 px-4 d-flex justify-content-center">
              <button class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-lg text-white" id="BtnLoadMoreSpecialOffers" type="button">
                Load More
              </button>
              <input type="hidden" id="LastLoadedSpecialOfferID"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

