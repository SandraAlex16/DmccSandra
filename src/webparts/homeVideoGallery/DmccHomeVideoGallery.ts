export default class DmccHomeVideoGallery
{ public static _FirstSite:string = "/sites/DMCCDev";
    public static singleElementHtml:string= `
<div class="swiper-slide">
    <div class="video-swiper-wrapper">
        <a href="#VDOURL" class="w-100 float-start d-flex h-100">
        <img class="w-100 mh-100 thumbnail" src="#IMGSRC" />
        <img src="${this._FirstSite}/SiteAssets/images/icons/v2/play-icon.png" class="play-icon" />
        </a>
    </div>
</div>`;



public static noRecord:string= `<div class="col-12 px-4 upcoming-birthday">
<div class="w-100 d-flex align-items-center gp-border-primary py-4">
    <div class="ms-3 overflow-hidden">
        <p
            class="m-0 font-size-22 text-white fw-bold lh-base text-truncate">No Records</p>
    </div>
</div>
</div>`;
    
    public static html:string = `
<div class="col-12 col-lg-4 mb-4">
    <div class="col-box-wrapper w-100 float-start h-100 bg-white gp-shadow">
        <div class="col-box-title d-flex bg-white position-relative">
          <div class="col-box-icon sqbx-theme-6 d-flex flex-shrink-0 align-items-center justify-content-center">
            <img class="mw-px-60" src="${this._FirstSite}/SiteAssets/images/icons/v2/video-gallery.png" />
          </div>
          <div class="flex-grow-1 px-3 overflow-hidden d-flex justify-content-between align-items-center">
            <p class="text-truncate text-uppercase m-0 font-MyriadProBold">
              VIDEO GALLERY
            </p>
            <div class="d-flex align-items-center">
              <svg class="box-hide-icon mx-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18">
                <path
                  d="M12.81 4.36l-1.77 1.78a4 4 0 0 0-4.9 4.9l-2.76 2.75C2.06 12.79.96 11.49.2 10a11 11 0 0 1 12.6-5.64zm3.8 1.85c1.33 1 2.43 2.3 3.2 3.79a11 11 0 0 1-12.62 5.64l1.77-1.78a4 4 0 0 0 4.9-4.9l2.76-2.75zm-.25-3.99l1.42 1.42L3.64 17.78l-1.42-1.42L16.36 2.22z" />
              </svg>
              <div class="d-flex me-4 ms-2">
                <div class="swiper-prev-common video-gallery-prev"></div>
                <div class="swiper-next-common video-gallery-next"></div>
              </div>
              <a href="https://dmccdxb.sharepoint.com${this._FirstSite}/SitePages/VideoGallery.aspx" class="mx-2 cursor-pointer"><img class="readmore-arrow position-relative cursor-pointer"
                  src="${this._FirstSite}/SiteAssets/images/icons/readmore-arrow.png" /></a>
            </div>
          </div>
        </div>

        <div class="gallery-video-slider-wrapper w-100 float-start p-4">
          <div class="row h-100">
            <div class="col-12 h-100">
              <div class="swiper video-gallery-slider">
                <div id="divVideoGalAllElements" class="swiper-wrapper">
                  
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
</div>
                    `;

}