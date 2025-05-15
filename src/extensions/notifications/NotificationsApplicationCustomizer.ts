import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import * as strings from 'NotificationsApplicationCustomizerStrings';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const LOG_SOURCE: string = 'NotificationsApplicationCustomizer';

export interface INotificationsApplicationCustomizerProperties {
  testMessage: string;
}

export interface ISPLists {
  NotificationMessage: string;
  DetailsPage: {
    Url: string;
  };
  ReadBy: any;
  Id: number; // Added Id property to the interface
}

export default class NotificationsApplicationCustomizer
  extends BaseApplicationCustomizer<INotificationsApplicationCustomizerProperties> {

    private _lastNotificationId: number | null = null;

  public onInit(): Promise<void> {
    alert(99)
    // Remove debug alert
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    const apiUrl = `https://dmccdxb.sharepoint.com/sites/DMCCDev/_api/web/lists/GetByTitle('Notifications')/items?$top=1&$orderby=Modified desc&$select=Id,NotificationMessage,DetailsPage,ReadBy/Id&$expand=ReadBy`;

    this._renderListAsync(apiUrl);

    setInterval(() => {
    this._renderListAsync(apiUrl);
  }, 2000);

    return Promise.resolve();
  }

  private async _getListData(apiUrl: string): Promise<ISPLists[]> {
    const response = await this.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
    const json = await response.json();
    return json.value;
  }

private async _renderListAsync(apiUrl: string): Promise<void> {
  try {
    const items = await this._getListData(apiUrl);
    if (items && items.length > 0) {
      const item = items[0];

      if (item.Id === this._lastNotificationId) {
        // Already shown, skip rendering
        return;
      }

      const currentUserId = this.context.pageContext.legacyPageContext.userId;
      const existingUserIds: number[] = (item.ReadBy || []).map((user: any) => user.Id);

      if (existingUserIds.indexOf(currentUserId) === -1) {
        this._renderNotification(item);
        this._lastNotificationId = item.Id; // Update last shown ID
      }
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}


  private _renderNotification(item: ISPLists): void {
    const currentUserId = this.context.pageContext.legacyPageContext.userId;
    const existingUserIds: number[] = (item.ReadBy || [])
      .map((user: any) => user.Id);
    
    if (existingUserIds.indexOf(currentUserId) !== -1) {
      console.log('User has already read this notification');
      return;
    }

    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = `
      <div class="notifcation-wrapper">
        <div class="notification-container d-flex flex-column flex-sm-row align-items-start align-items-sm-end gap-3">
          <div class="flex-grow-1 overflow-hidden notification-txt text-xxl">
            ${item.NotificationMessage}
          </div>
          <a href="#" class="notification-readmore flex-shrink-0 mt-sm-4">READ MORE</a>
          <div class="notification-close d-flex align-items-center justify-content-center" style="cursor: pointer;">
            <img src="https://dmccdxb.sharepoint.com/sites/DMCCDev/SiteAssets/images/icons/v2/close-white-icon.png" alt="Close"/>
          </div>
        </div>
      </div>
    `;

    const readMoreLink = wrapper.querySelector('.notification-readmore');
    readMoreLink?.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent default navigation
      
      try {
        console.log('Updating ReadBy field for item ID:', item.Id);
        await this._updateReadByField(item.Id);
        console.log('ReadBy field updated successfully');
        
        const detailsUrl = item.DetailsPage?.Url || '#';
        window.location.href = detailsUrl; // Navigate after update is complete
      } catch (error) {
        console.error('Error during ReadMore click:', error);
        // Fallback navigation in case of error
        const detailsUrl = item.DetailsPage?.Url || '#';
        window.location.href = detailsUrl;
      }
    });

    const closeBtn = wrapper.querySelector('.notification-close');
    closeBtn?.addEventListener('click', async () => {
      try {
        await this._updateReadByField(item.Id);
        wrapper.remove();
      } catch (error) {
        console.error('Error during notification close:', error);
        wrapper.remove(); // Still remove the notification on error
      }
    });

    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(wrapper, body.firstChild);
    } else {
      body.appendChild(wrapper);
    }
    
    setTimeout(function(){
      // @ts-ignore
      $(".notifcation-wrapper").show();
    }, 2000);
  }

  private async _updateReadByField(itemId: number): Promise<void> {
    try {
      if (!itemId || isNaN(itemId)) {
        console.error('Invalid item ID provided:', itemId);
        return;
      }

      const userId = await this._getCurrentUserId();
      console.log('Current user ID:', userId);

      const webUrl = 'https://dmccdxb.sharepoint.com/sites/DMCCDev';
      const listTitle = 'Notifications';

      const currentItemData = await this._fetchCurrentItemData(webUrl, listTitle, itemId);
      console.log('Current item data:', currentItemData);

      // Extract existing user IDs from the ReadBy field
      const existingUserIds: number[] = (currentItemData.ReadBy || [])
        .map((user: any) => user.Id);

      if (existingUserIds.indexOf(userId) !== -1) {
        console.log('User has already read this notification');
        return;
      }

      existingUserIds.push(userId);
      console.log('Updated ReadBy IDs:', existingUserIds);

      // Fixed: The correct property name is 'ReadById' and not 'ReadById'
      const updateBody = {
        '__metadata': { 'type': 'SP.Data.NotificationsListItem' },
        'ReadById': {
          'results': existingUserIds
        }
      };

      await this._performListItemUpdate(webUrl, listTitle, itemId, updateBody);

    } catch (error) {
      console.error('Error in _updateReadByField:', error);
      this._logDetailedError(error);
      throw error; // Re-throw to allow handling in calling functions
    }
  }

  private async _fetchCurrentItemData(
    webUrl: string,
    listTitle: string,
    itemId: number
  ): Promise<any> {
    try {
      const response = await this.context.spHttpClient.get(
        `${webUrl}/_api/web/lists/GetByTitle('${listTitle}')/items(${itemId})?$select=Id,ReadBy/Id&$expand=ReadBy`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Item data fetch failed with status ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Item data fetch error:', error);
      throw error;
    }
  }

  private async _performListItemUpdate(
    webUrl: string,
    listTitle: string,
    itemId: number,
    updateBody: any
  ): Promise<void> {
    try {
      console.log('Sending update request for item ID:', itemId, 'with body:', JSON.stringify(updateBody));
      
      const response: SPHttpClientResponse = await this.context.spHttpClient.post(
        `${webUrl}/_api/web/lists/GetByTitle('${listTitle}')/items(${itemId})`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'If-Match': '*',
            'odata-version': ''
          },
          body: JSON.stringify(updateBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed with status ${response.status}: ${errorText}`);
      }

      console.log('Notification read status updated successfully');
    } catch (error) {
      console.error('Update request error:', error);
      this._logDetailedError(error);
      throw error;
    }
  }

  private _logDetailedError(error: any): void {
    console.error('Detailed Error Breakdown:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      additionalInfo: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText
      } : null
    });
  }

  private async _getCurrentUserId(): Promise<number> {
    try {
      const response = await this.context.spHttpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch current user with status ${response.status}`);
      }

      const user = await response.json();

      if (!user.Id) {
        throw new Error('User ID not found in response');
      }

      return user.Id;
    } catch (error) {
      console.error('Current user fetch error:', error);
      throw error;
    }
  }
}