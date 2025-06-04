import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
// import { escape } from '@microsoft/sp-lodash-subset';

// import styles from './LinkdinUatWebPart.module.scss';
import * as strings from 'LinkdinUatWebPartStrings';

export interface ILinkdinUatWebPartProps {
  description: string;
}

export default class LinkdinUatWebPart extends BaseClientSideWebPart<ILinkdinUatWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private curDate: Date = new Date();
  // private _widgetLoaded: boolean = false;

  public render(): void {
    const containerId = 'sociablekit-container';
    this.domElement.innerHTML = `
    <div class="container container-gp px-3 px-lg-4 clearfix">
    <span style="font-size:20px;font-weight:600">LinkedIn Feed</span>
    <div id="${containerId}">
      
    </div>
    </div>
      <style>
        .sk-posts-header {
          display: none !important;
        }
        .sk-post-item {
          height: 500px !important;
        }
        .sk-posts-loadmore.sk-footer-button {
          display: none !important;
        }
        .sk_branding a{
          display: none !important;
        }
      .sk-posts-masonry {
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 16px; /* add space between posts */
          position: static !important;
          height: auto !important;
      }

      /* Force each post item to behave normally */
      .sk-post-item {
          position: static !important;
          width: 30% !important; /* or 32% to fit 3 neatly, adjust as needed */
          flex: 0 0 auto !important;
      }

      /* Hide all posts beyond the first three */
      .sk-post-item:nth-child(n+4) {
          display: none !important;
      }
      </style>
      <span class='d-none'>${this.curDate}</span>
    `;
    
    // Always load the script after rendering the container
    this.waitForLinkedInPost();
  }

  private waitForLinkedInPost(): void {
    const observer = new MutationObserver((mutations, obs) => {
      const postElement = document.querySelector('.sk-ww-linkedin-page-post');
      if (postElement) {
        console.log('LinkedIn Post HTML Loaded');
        const container = document.getElementById('sociablekit-container');
        if(container) { container.innerHTML = postElement.outerHTML;}
        obs.disconnect(); // Stop observing once found
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Optional: add a timeout to prevent infinite observation
    setTimeout(() => {
      observer.disconnect();
      console.warn('Timed out waiting for .sk-ww-linkedin-page-post to load.');
    }, 15000); // 15 seconds
  }

  protected onInit(): Promise<void> {
    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}