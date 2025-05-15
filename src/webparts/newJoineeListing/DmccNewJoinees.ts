export default class DmccNewJoinees
{ public static _FirstSite:string = "/sites/DMCCDev";



public static noRecord:string= `<div class="col-12 px-4 upcoming-birthday">
<div class="w-100 d-flex align-items-center gp-border-primary py-4">
    <div class="ms-3 overflow-hidden">
        <p
            class="m-0 font-size-22 text-white fw-bold lh-base text-truncate">No Records</p>
    </div>
</div>
</div>`;

public static newJoineeSingleElement = `
    <div class="col-md-6 col-lg-4 float-start event-list new-joinee-row">
        <div class="w-100 d-flex align-items-center gp-border-primary py-2">
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