import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'LinkdinUatWebPartStrings';
import { SPComponentLoader } from '@microsoft/sp-loader';

export interface ILinkdinUatWebPartProps {
  description: string;
  embedId: string;
  postsToShow: number;
  columnCount: number;
}

export default class LinkdinUatWebPart extends BaseClientSideWebPart<ILinkdinUatWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _uniqueContainerId: string = '';
  private _scriptLoadCheckInterval: number | null = null;
  private _scriptCheckAttempts: number = 0;
  private _maxCheckAttempts: number = 30; // 30 seconds max waiting time

  protected onInit(): Promise<void> {
    console.log(this._isDarkTheme + ': < current theme');
    console.log(this._environmentMessage + ': < current environmentMessage');
    // Generate unique container ID for this instance
    this._uniqueContainerId = `linkedin-container-${this.context.instanceId}`;
    
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    // Clear any existing intervals
    this.clearAllIntervals();
    
    // Get the embed ID from properties or use default
    const embedId = this.properties.embedId || '25551628';
    const postsToShow = this.properties.postsToShow || 3;
    const columnCount = this.properties.columnCount || 2;
    
    // Create container with the SociableKit LinkedIn widget
    this.domElement.innerHTML = `
      <div class="linkedin-webpart">
        <span style="font-size:20px;font-weight:600">LinkedIn</span>
        <div id="${this._uniqueContainerId}" style="margin-top: 12px;">
          <div class="sk-ww-linkedin-page-post" 
               data-embed-id="${embedId}" 
               data-ui="new" 
               data-posts-to-show="${postsToShow}"
               data-column-count="${columnCount}"
               data-show-stats-section="flex"
               style="width: 100%; height: auto;"></div>
          <div class="linkedin-loading">Loading LinkedIn posts...</div>
        </div>
        <style>
          .linkedin-webpart {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            width: 100%;
          }
          .linkedin-loading {
            padding: 20px;
            text-align: center;
            color: #666;
          }
          .linkedin-error {
            padding: 20px;
            text-align: center;
            color: #e74c3c;
          }
          .linkedin-retry-btn {
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #0078d4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .linkedin-retry-btn:hover {
            background-color: #106ebe;
          }
          .sk-posts-header {
            display: none !important;
          }
          .sk-posts-loadmore.sk-footer-button {
            display: none !important;
          }
          .sk_branding a {
            display: none !important;
          }
          .sk-posts-masonry {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 16px;
            position: static !important;
            height: auto !important;
          }
          .sk-post-item {
            position: static !important;
            width: 30% !important; /* adjust to fit 3 per row */
            flex: 0 0 auto !important;
            height: 525px !important;
          }
          .sk-post-item:nth-child(n+4) {
            display: none !important;
          }
        </style>
      </div>
    `;
    
    // Load the SociableKit script
    this.loadSociableKitScript();
    
    // Start checking if the widget is loaded
    this._scriptCheckAttempts = 0;
    this.checkWidgetLoaded();
  }

  private loadSociableKitScript(): void {
    console.log('Loading SociableKit script');
    
    // Remove any existing script to avoid conflicts
    const existingScript = document.querySelector('script[src="https://widgets.sociablekit.com/linkedin-page-posts/widget.js"]');
    if (existingScript) {
      console.log('Removing existing SociableKit script');
      existingScript.remove();
    }
    
    // Load the script
    SPComponentLoader.loadScript('https://widgets.sociablekit.com/linkedin-page-posts/widget.js')
      .then(() => {
        console.log('SociableKit script loaded successfully');
      })
      .catch((error) => {
        console.error('Failed to load SociableKit script:', error);
        this.showErrorMessage();
      });
  }
  
  private clearAllIntervals(): void {
    if (this._scriptLoadCheckInterval) {
      window.clearInterval(this._scriptLoadCheckInterval);
      this._scriptLoadCheckInterval = null;
    }
  }
  
  private checkWidgetLoaded(): void {
    // Clear any existing interval first
    if (this._scriptLoadCheckInterval) {
      window.clearInterval(this._scriptLoadCheckInterval);
    }
    
    // Set up an interval to check if the widget has loaded
    this._scriptLoadCheckInterval = window.setInterval(() => {
      this._scriptCheckAttempts++;
      
      // Check if the widget has loaded by looking for SociableKit elements
      const widgetLoaded = document.querySelector('.sk-posts-body') || 
                          document.querySelector('.sk-posts-header');
      
      if (widgetLoaded) {
        console.log('LinkedIn widget loaded successfully');
        // Widget is loaded, hide the loading message
        const loadingEl = this.domElement.querySelector('.linkedin-loading') as HTMLElement;
        if (loadingEl) {
          loadingEl.style.display = 'none';
        }
        
        // Clear the interval
        this.clearAllIntervals();
      }
      
      // Check if we've exceeded max attempts
      if (this._scriptCheckAttempts >= this._maxCheckAttempts) {
        console.error('LinkedIn widget failed to load within the time limit');
        this.showErrorMessage();
        this.clearAllIntervals();
      }
    }, 1000) as unknown as number;
  }
  
  private showErrorMessage(): void {
    const container = document.getElementById(this._uniqueContainerId);
    if (container) {
      container.innerHTML = `
        <div class="linkedin-error">
          Unable to load LinkedIn posts. The posts may not be available or there may be a connection issue.
          <br>
          <button class="linkedin-retry-btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = container.querySelector('.linkedin-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.render();
        });
      }
    }
  }

  protected onDispose(): void {
    // Clear any existing intervals
    this.clearAllIntervals();
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
                }),
                PropertyPaneTextField('embedId', {
                  label: 'LinkedIn Embed ID',
                  value: this.properties.embedId || '25551628'
                }),
                PropertyPaneSlider('postsToShow', {
                  label: 'Number of Posts to Show',
                  min: 1,
                  max: 10,
                  value: this.properties.postsToShow || 3,
                  showValue: true,
                  step: 1
                }),
                PropertyPaneSlider('columnCount', {
                  label: 'Number of Columns',
                  min: 1,
                  max: 3,
                  value: this.properties.columnCount || 2,
                  showValue: true,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}