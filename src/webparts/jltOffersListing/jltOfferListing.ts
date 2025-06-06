export default class DmccjltOffersListing
{
  //side html
    public   jltOffersListingHtml:string=` 
 
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
        <a href="#URL"
            class="d-flex align-items-center gap-1 font-MyriadProSemibold gp-text-dark pt-1 cursor-pointer text-decoration-none">Read
            More
            <img src="_FirstSite/SiteAssets/images/icons/arrow-right-line.png" /></a>
           
        </div>
      </div>
    </div>
  </div>



    `;
 
    public   html:string = `
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
          <div id='divWrapper' style='display:none;' class="col-box-wrapper w-100 float-start bg-white gp-shadow d-flex flex-column">
            <div class="col-box-title col-box-title-details d-flex flex-column flex-md-row bg-white position-relative">
               <div class="d-flex align-items-center">
                <div class="col-box-icon sqbx-theme-2 d-flex flex-shrink-0 align-items-center justify-content-center">
                  <img class="mw-px-60" src="_FirstSite/SiteAssets/images/icons/Offers.png" />  
                </div>                
              <p class="text-truncate text-uppercase m-3 font-MyriadProBold">
              JLT OFFERS
                </p>
               </div>
                <div class="flex-grow-1 pe-3 d-flex justify-content-end">
                

                <div class="flex-shrink-0 d-flex align-items-center gap-2 details-filter-wrapper mt-3 mt-md-0"> 
                  <div class="float-start filter-search-input">
                    <input id="searchSpecialOffersId" class="form-control form-control gp-input gp-input-search gp-input-search-inside"
                      type="text" placeholder="Search Offers" aria-label="Search" />
                  </div>
             
                </div>
              </div>
            </div>
			  
            <div class="row gap-0 px-4 py-4 gy-4" id="jltOfferListings"></div>			  
            <div class="w-100 float-start mb-4 px-4 d-flex justify-content-center">
              <button class="dmcc-btn float-start px-4 py-2 dmcc-bg-primary text-lg text-white" id="BtnLoadMoreJltOffers" style="background-color: rgb(8, 0, 71);" type="button">
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
public NOsingleElementHtml: string = `  
      
    <div class="col-md-4 float-start">
        <div class="w-100 h-100 float-start d-flex flex-column align-items-start ">
           No record found!
        </div>
      </div>
    `;
}

