export default class DmccHomeUptownOffers
{
  public static _FirstSite:string = "/sites/DMCCDev";
     public static singleElementHtml :string =` 
<div class="col-12 px-4 special-offers">
                      <div class="w-100 d-flex align-items-center py-4 gp-border-primary">
                        <img class="bd-avatar border rounded-circle" src="#IMGSRC" />
                        <div class="ms-3 overflow-hidden">
                          <p class="m-0 font-size-22 font-MyriadProSemibold lh-base text-white text-truncate">
                          #TITLE
                          </p>
                          <p class="m-0 pb-2px text-sm lh-sm text-truncate text-white font-MyriadProLight">
                          #SHORTDESC
                          </p>
                          <div class="d-flex align-items-center mt-1">
                            <a href="#URL"
                              class="float-start text-uppercase dmcc-text-secondary cursor-pointer text-decoration-none text-sm">Read
                              More</a>
                          </div>
                        

                        </div>
                      </div>
                    </div>
`;
  public static noRecord :string =`<div class="col-12 px-4 special-offers">
                      <div class="w-100 d-flex align-items-center py-4 gp-border-primary"> 
                        <div class="ms-3 overflow-hidden">
                          <p class="m-0 font-size-22 font-MyriadProSemibold lh-base text-white text-truncate">
                          No more offers
                          </p> 
                        </div>
                      </div>
                    </div>`;
//dmcc-bg-primary offer-bg
    public static html: string =`
    <div style="#IsHidable" id="DmccHomeOffers" class="col-12 col-lg-4 mb-4 sortable-box allow-hide">
    <div class="col-box-wrapper w-100 mh-px-580 float-start h-100 dmcc-bg-primary gp-shadow d-flex flex-column">
      <div class="col-box-title d-flex dmcc-bg-primary position-relative flex-shrink-0">
        <div class="col-box-icon sqbx-theme-5 d-flex flex-shrink-0 align-items-center justify-content-center">
          <img class="mw-px-60" src="${this._FirstSite}/SiteAssets/images/icons/Offers.png" />
        </div>
        <div class="flex-grow-1 px-3 overflow-hidden d-flex justify-content-between align-items-center">
          <p class="text-truncate text-uppercase m-0 font-MyriadProBold text-white">
           UPTOWN OFFERS
          </p>
          <div class="d-flex align-items-center">
            <svg class="box-hide-icon hide-icon-white mx-1" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 18">
              <path
                d="M12.81 4.36l-1.77 1.78a4 4 0 0 0-4.9 4.9l-2.76 2.75C2.06 12.79.96 11.49.2 10a11 11 0 0 1 12.6-5.64zm3.8 1.85c1.33 1 2.43 2.3 3.2 3.79a11 11 0 0 1-12.62 5.64l1.77-1.78a4 4 0 0 0 4.9-4.9l2.76-2.75zm-.25-3.99l1.42 1.42L3.64 17.78l-1.42-1.42L16.36 2.22z" />
            </svg>
            <a href='${this._FirstSite}/SitePages/UPTOWNListing.aspx?env=WebView'
              class="mx-2 cursor-pointer"><img class="readmore-arrow position-relative cursor-pointer"
                src="${this._FirstSite}/SiteAssets/images/icons/readmore-arrow-white.png" /></a>
          </div>
        </div>
      </div>
      <div class="w-100 float-start overflow-hidden py-1">
        <div class="w-100 h-100 float-start overflow-auto custom-scroll-view">
          <div class="row gx-0"  id="divHomeUptownOffer" >
                
              </div>
              </div>
            </div>
          </div>
        </div>
    `;
}