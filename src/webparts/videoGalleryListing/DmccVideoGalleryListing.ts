export default class DmccVideoGalleryListing
{ public static _FirstSite:string = "/sites/DMCCDev";



public static noRecord:string= `<div class="col-12 px-4 upcoming-birthday">
<div class="w-100 d-flex align-items-center gp-border-primary py-4">
    <div class="ms-3 overflow-hidden">
        <p
            class="m-0 font-size-22 text-white fw-bold lh-base text-truncate">No Records</p>
    </div>
</div>
</div>`;

public static galleryElement = `
                <div class="gallery-list col-md-4 col-xl-3 float-start">
                  <div class="w-100 h-100 float-start d-flex flex-column align-items-start border">
                    <div class="w-100 h-100 float-start">
                      <a href="#VDOURL" class="w-100 float-start d-flex h-100 position-relative gallery-listing-video">
                        <img class="w-100 max-h-260 object-cover-center" src="#IMGSRC" />
                        <img src="${this._FirstSite}/SiteAssets/images/icons/v2/play-icon.png" class="play-icon" />
                      </a>
                    </div>
                    <div class="w-100 float-start p-3">
                          <p class="text-lg gp-text-dark float-start m-0 lh-base text-decoration-none">
                            #VDOTITLE
                          </p>
                        </div>
                  </div>
                  
                </div>`
}