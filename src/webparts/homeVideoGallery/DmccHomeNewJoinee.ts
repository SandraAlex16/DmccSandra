export default class DmccHomeNewJoinee
{ public static _FirstSite:string = "/sites/DMCCDev";

public static Html:string= 
`
<div class="col-12 col-lg-4 mb-4 sortable-box">
    <div class="col-box-wrapper w-100 mh-px-408 float-start h-100 bg-white gp-shadow d-flex flex-column">
        <div class="col-box-title d-flex bg-white position-relative flex-shrink-0">
        <div class="col-box-icon sqbx-theme-5 d-flex flex-shrink-0 align-items-center justify-content-center">
            <img class="mw-px-60" src="//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/icons/v2/new-joinee.png" />
        </div>
        <div class="flex-grow-1 px-3 overflow-hidden d-flex justify-content-between align-items-center">
            <p class="text-truncate text-uppercase m-0 font-MyriadProBold">
            NEW JOINERS
            </p>
            <div class="d-flex align-items-center">
            <svg class="box-hide-icon mx-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18">
                <path
                d="M12.81 4.36l-1.77 1.78a4 4 0 0 0-4.9 4.9l-2.76 2.75C2.06 12.79.96 11.49.2 10a11 11 0 0 1 12.6-5.64zm3.8 1.85c1.33 1 2.43 2.3 3.2 3.79a11 11 0 0 1-12.62 5.64l1.77-1.78a4 4 0 0 0 4.9-4.9l2.76-2.75zm-.25-3.99l1.42 1.42L3.64 17.78l-1.42-1.42L16.36 2.22z" />
            </svg>
            <a href="https://dmccdxb.sharepoint.com${this._FirstSite}/SitePages/NewJoinees.aspx" class="mx-2 cursor-pointer"><img class="readmore-arrow position-relative cursor-pointer"
                src="//dmccdxb.sharepoint.com${this._FirstSite}/SiteAssets/images/icons/readmore-arrow.png" /></a>
            </div>
        </div>
        </div>
        <div class="w-100 float-start overflow-hidden py-1">
        <div class="w-100 h-100 float-start overflow-auto custom-scroll-view">
            <div class="row gx-0" id="homeNewJoinees">
            
            </div>
        </div>
        </div>
    </div>
</div>`;

public static newJoineeSingleElement = `
    <div class="col-12 px-4 new-joinee-row">
        <div class="w-100 d-flex align-items-center gp-border-primary py-3">
            <img class="bd-avatar border rounded-circle" src="#PROFILEIMAGE" />
            <div class="ms-3 overflow-hidden">
                <p class="m-0 font-size-22 font-MyriadProSemibold lh-base text-gray-dark text-truncate">
                #EMPNAME
                </p>
                <p title="#TITLE" class="m-0 pb-2px text-sm lh-sm text-truncate gp-text-dark font-MyriadProLight">
                #EMPPOSITION • #EMPDEPT
                </p>
                <div class="d-flex align-items-center mt-1">
                <a href="#REDIRECTLINK" class="float-start text-uppercase dmcc-text-secondary cursor-pointer text-decoration-none text-sm">Read
                    More</a>
                </div>
            </div>
        </div>
    </div>`;

}