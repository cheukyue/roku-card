import { html, LitElement, TemplateResult, customElement, property, CSSResult, css } from 'lit-element';
import { HomeAssistant, applyThemesOnElement, hasAction, handleAction } from 'custom-card-helpers';

import { RokuCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

const defaultRemoteAction = {
  action: 'call-service',
  service: 'remote.send_command',
};

const SOURCE_MY_TV_SUPER = 'MyTV Super';
const SOURCE_NOW_TV = 'NOW TV';
const SOURCE_TV = 'TV';

/* eslint no-console: 0 */
console.info(
  `%c ROKU-CARD \n%c Version ${CARD_VERSION} `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('roku-card')
export class RokuCard extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: RokuCardConfig;
  @property() public mediaEntity = 'input_select.media_source';

  public getCardSize(): number {
    return 7;
  }

  public setConfig(config: RokuCardConfig): void {
    //Object { type: "custom:roku-card", entity: "input_select.media_source", tv: true }
    console.log('Entity------:', config.entity);

    if (!config.entity && !config.remote) {
      console.log("Invalid configuration. If no entity provided, you'll need to provide a remote entity");
      return;
    }

    this._config = {
      theme: 'default',
      ...config,
    };
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];
    const tabObj = this.hass.states[this.mediaEntity];

    if (this._config.entity && !stateObj) {
      return html`
        <ha-card>
          <div class="warning">Entity Unavailable</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card .header="${this._config.name}">
        <div class="remote">
          <div class="header-tab row">
            ${stateObj.attributes.options.map(
              (source) => html`
                ${source === SOURCE_MY_TV_SUPER
                  ? this._renderTab(
                      source,
                      'mdi:video',
                      stateObj.state === SOURCE_MY_TV_SUPER ? 'on' : 'off',
                      'MyTV Super',
                    )
                  : ''}
                ${source === SOURCE_NOW_TV
                  ? this._renderTab(source, 'mdi:video', stateObj.state === SOURCE_NOW_TV ? 'on' : 'off', 'NOW TV')
                  : ''}
                ${source === SOURCE_TV
                  ? this._renderTab(source, 'mdi:television-classic', stateObj.state === SOURCE_TV ? 'on' : 'off', 'TV')
                  : ''}
              `,
            )}
          </div>
          ${tabObj.state === SOURCE_MY_TV_SUPER ? html`
            <div class="row">
            ${this._renderButton("tvb-home","mdi:home","Home")}
            ${this._renderButton("tvb-back","mdi:arrow-left","Back")}
            ${this._renderButton("tvb-menu","mdi:menu","Menu")} 
            ${this._renderButton("tvb-vod","mdi:window-restore","TV/VOD")} 
            </div>
            <div class="row">
              ${this._renderButton("tvb-up","mdi:chevron-up","Up")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-left","mdi:chevron-left","Left")}
              ${this._renderButton("tvb-select","mdi:checkbox-blank-circle","Select")}
              ${this._renderButton("tvb-right","mdi:chevron-right","Right")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-down","mdi:chevron-down","Down")} 
            </div>
            <div class="row">
              ${this._renderButton("tvb-play","mdi:play-pause","Play/Pause")}
              ${this._renderButton("tvb-stop","mdi:stop","Stop")}
              ${this._renderButton("tvb-reverse","mdi:rewind","Rewind")}
              ${this._renderButton("tvb-forward","mdi:fast-forward","Fast-Forward")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-red","mdi:checkbox-blank","Red","","red")}
              ${this._renderButton("tvb-yellow","mdi:checkbox-blank","Yellow","","yellow")}
              ${this._renderButton("tvb-blue","mdi:checkbox-blank","Blue","","blue")}
              ${this._renderButton("tvb-green","mdi:checkbox-blank","Green","","green")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-button-1","mdi:numeric-1-box-outline","1")}
              ${this._renderButton("tvb-button-2","mdi:numeric-2-box-outline","2")}
              ${this._renderButton("tvb-button-3","mdi:numeric-3-box-outline","3")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-button-4","mdi:numeric-4-box-outline","4")}
              ${this._renderButton("tvb-button-5","mdi:numeric-5-box-outline","5")}
              ${this._renderButton("tvb-button-6","mdi:numeric-6-box-outline","6")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-button-7","mdi:numeric-7-box-outline","7")}
              ${this._renderButton("tvb-button-8","mdi:numeric-8-box-outline","8")}
              ${this._renderButton("tvb-button-9","mdi:numeric-9-box-outline","9")}
            </div>
            <div class="row">
              ${this._renderButton("tvb-channel-down","mdi:chevron-down","Channel Down")}
              ${this._renderButton("tvb-button-0","mdi:numeric-0-box-outline","0")}
              ${this._renderButton("tvb-channel-up","mdi:chevron-up","Channel Up")}
            </div>
              `
            : ''}
          ${tabObj.state === SOURCE_NOW_TV
            ? html`
                <div class="row">
                  ${this._renderButton('now-play', 'mdi:play-pause', 'Play/Pause')}
                  ${this._renderButton('now-stop', 'mdi:stop', 'Stop')}
                  ${this._renderButton('now-reverse', 'mdi:rewind', 'Rewind')}
                  ${this._renderButton('now-forward', 'mdi:fast-forward', 'Fast-Forward')}
                </div>
                <div class="row">
                  ${this._renderButton('now-up', 'mdi:chevron-up', 'Up')}
                </div>
                <div class="row">
                  ${this._renderButton('now-left', 'mdi:chevron-left', 'Left')}
                  ${this._renderButton('now-select', 'mdi:checkbox-blank-circle', 'Select')}
                  ${this._renderButton('now-right', 'mdi:chevron-right', 'Right')}
                </div>
                <div class="row">
                  ${this._renderButton('now-down', 'mdi:chevron-down', 'Down')}
                </div>
                <div class="row">
                  ${this._renderButton('now-back', 'mdi:arrow-left', 'Back')}
                  ${this._renderButton('now-home', 'mdi:home', 'Home')}
                  ${this._renderButton('now-info', 'mdi:information-outline', 'Info')}
                </div>
                <div class="row">
                  ${this._renderButton('now-red', 'mdi:crop-landscape', 'Red', '', 'red')}
                  ${this._renderButton('now-yellow', 'mdi:crop-landscape', 'Yellow', '', 'yellow')}
                  ${this._renderButton('now-blue', 'mdi:crop-landscape', 'Blue', '', 'blue')}
                  ${this._renderButton('now-green', 'mdi:crop-landscape', 'Green', '', 'green')}
                </div>
              `
            : ''}
          ${tabObj.state === SOURCE_TV ? html`
            <div class="row">
            ${this._renderButton("tv-source","mdi:login-variant","Source")}
            ${this._renderButton("tv-epg","mdi:sign-text","EPG")}
            ${this._renderButton("tv-back","mdi:undo-variant","Back")} 
            ${this._renderButton("tv-exit","mdi:close","Exit")} 
          </div>
          <div class="row">
            ${this._renderButton("tv-home","mdi:home","Home")}
            ${this._renderButton("tv-settings","mdi:settings","Options")}
            ${this._renderButton("tv-audio","mdi:voice","Audio")} 
            ${this._renderButton("tv-subtitle","mdi:file-document-box","Subtitle")} 
          </div>
          <div class="row">
            ${this._renderButton("tv-netflix","mdi:netflix","Netflix")}
            ${this._renderButton("tv-up","mdi:chevron-up","Up")}
            ${this._renderButton("tv-youtube","mdi:youtube","YouTube")}
          </div>
          <div class="row">
            ${this._renderButton("tv-left","mdi:chevron-left","Left")}
            ${this._renderButton("tv-select","mdi:checkbox-blank-circle","Select")}
            ${this._renderButton("tv-right","mdi:chevron-right","Right")}
          </div>
          <div class="row">
            ${this._renderButton("tv-playstation","mdi:playstation","Playstation")}
            ${this._renderButton("tv-down","mdi:chevron-down","Down")} 
            ${this._renderButton("tv-browser","mdi:google-plus-box","Browser")}
          </div>

          <div class="row">
            ${this._renderButton("tv-play","mdi:play-pause","Play/Pause")}
            ${this._renderButton("tv-stop","mdi:stop","Stop")}
            ${this._renderButton("tv-rewind","mdi:rewind","Rewind")}
            ${this._renderButton("tv-forward","mdi:fast-forward","Fast-Forward")}
          </div>

          <div class="row">
            ${this._renderButton("tv-red","mdi:checkbox-blank","Red","","red")}
            ${this._renderButton("tv-yellow","mdi:checkbox-blank","Yellow","","yellow")}
            ${this._renderButton("tv-blue","mdi:checkbox-blank","Blue","","blue")}
            ${this._renderButton("tv-green","mdi:checkbox-blank","Green","","green")}
          </div>
          <div class="row">
          ${this._renderButton("tv-volume-down","mdi:volume-minus","Volume Down")}
          ${this._renderButton("tv-volume-up","mdi:volume-plus","Volume Up")}
          ${this._renderButton("tv-channel-down","mdi:chevron-down","Channel Down")}
          ${this._renderButton("tv-channel-up","mdi:chevron-up","Channel Up")}
        </div> `
            : ''}
        </div>
      </ha-card>
    `;
  }

  protected updated(changedProps): void {
    if (!this._config) {
      return;
    }

    if (this.hass) {
      const oldHass = changedProps.get('hass');
      if (!oldHass || oldHass.themes !== this.hass.themes) {
        applyThemesOnElement(this, this.hass.themes, this._config.theme);
      }
    }
  }

  static get styles(): CSSResult {
    return css`
      .header-tab {
        margin: 10px 0;
      }
      .remote {
        padding: 16px 0px 16px 0px;
      }
      img,
      iron-icon {
        padding-right: 5px;
      }
      ha-icon-button {
        width: 64px;
        height: 64px;
        cursor: pointer;
      }
      ha-button {
        cursor: pointer;
        font-size: var(--ha-card-header-font-size, 24px);
        font-weight: bold;
      }
      ha-icon-button.red {
        color: red;
      }
      ha-icon-button.yellow {
        color: yellow;
      }
      ha-icon-button.blue {
        color: blue;
      }
      ha-icon-button.green {
        color: green;
      }

      ha-icon-button.on,
      ha-button.on {
        color: var(--dark-primary-color);
      }
      ha-icon-button.off,
      ha-button.off {
        color: var(--primary-text-color: );
      }
      img {
        border-radius: 25px;
      }
      .row {
        display: flex;
        padding: 8px 36px 8px 36px;
        justify-content: space-evenly;
        align-items: center;
      }
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      .app {
        flex-grow: 3;
        font-size: 20px;
      }
    `;
  }

  private _renderImage(index: number): TemplateResult {
    return this._config && this._config.apps && this._config.apps.length > index
      ? html`
          <img
            src=${this._config.apps[index].image || ''}
            .app=${this._config.apps[index].app}
            .config=${this._config.apps[index]}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this._config.apps[index].hold_action),
              hasDoubleClick: hasAction(this._config.apps[index].double_tap_action),
            })}
          />
        `
      : html` <ha-icon-button></ha-icon-button> `;
  }

  private _renderButton(button: string, icon: string, title: string, text = '', className = ''): TemplateResult {
    if (this._config) {
      const config = this._config[button];
      return config && config.show === false
        ? html` <ha-icon-button></ha-icon-button> `
        : html`
            <div>
              <ha-icon-button
                .button=${button}
                class=${className}
                icon=${icon}
                title=${title}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                  hasHold: config && hasAction(config.hold_action),
                  hasDoubleClick: config && hasAction(config.double_tap_action),
                })}
              ></ha-icon-button
              >${text}
            </div>
          `;
    } else {
      return html``;
    }
  }

  private _renderTab(button: string, icon: string, className: string, text = ''): TemplateResult {
    if (this._config) {
      const config = this._config[button];
      return config && config.show === false
        ? html` <ha-button>${text}</ha-button> `
        : html`
            <ha-button
              .button=${button}
              class=${className}
              @action=${this._handleTabAction}
              .actionHandler=${actionHandler({
                hasHold: config && hasAction(config.hold_action),
                hasDoubleClick: config && hasAction(config.double_tap_action),
              })}
              >${icon ? html`<iron-icon icon="${icon}"></iron-icon>` : ''}${text}</ha-button
            >
          `;
    } else {
      return html``;
    }
  }

  private _handleAction(ev): void {
    if (this.hass && this._config && ev.detail.action) {
      const button = ev.currentTarget.button;
      const config = this._config[button] || ev.currentTarget.config;
      const app = ev.currentTarget.app;
      const remote = this._config.remote ? this._config.remote : 'remote.' + this._config.entity.split('.')[1];

      handleAction(
        this,
        this.hass,
        app
          ? {
              tap_action: {
                action: 'call-service',
                service: 'media_player.select_source',
                service_data: {
                  entity_id: this._config.entity,
                  source: app,
                },
              },
              ...config,
            }
          : {
              tap_action: {
                service_data: {
                  command: button,
                  entity_id: remote,
                },
                ...defaultRemoteAction,
              },
              ...config,
            },
        ev.detail.action,
      );
    }
  }

  private _handleTabAction(ev): void {
    if (this.hass && this._config && ev.detail.action) {
      const button = ev.currentTarget.button;

      /*****************************Hard codeed ***********************/
      //const entity = "input_select.media_source";
      const config = ev.currentTarget.config;

      handleAction(
        this,
        this.hass,
        {
          tap_action: {
            action: 'call-service',
            service: 'input_select.select_option',
            service_data: {
              entity_id: this.mediaEntity,
              option: button,
            },
          },
          ...config,
        },
        ev.detail.action,
      );
    }
  }
}
