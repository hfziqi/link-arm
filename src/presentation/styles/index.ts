export * from './theme';
export * from './utils';
export * from './CodeStyles';
export * from './base';
export * from './chat';
export * from './models';
export * from './layout';
export * from './knowledge-base';
export * from './auth';

import { BaseStyleGenerator } from './base';
import { ChatStyleGenerator } from './chat';
import { ModelsStyleGenerator } from './models';
import { LayoutStyleGenerator } from './layout';
import { KnowledgeBaseStyleGenerator } from './knowledge-base';
import { AuthStyleGenerator } from './auth';

export class ComponentStyleGenerator {
  private base: BaseStyleGenerator;
  private chat: ChatStyleGenerator;
  private models: ModelsStyleGenerator;
  private layout: LayoutStyleGenerator;
  private knowledgeBase: KnowledgeBaseStyleGenerator;
  private auth: AuthStyleGenerator;

  constructor() {
    this.base = new BaseStyleGenerator();
    this.chat = new ChatStyleGenerator();
    this.models = new ModelsStyleGenerator();
    this.layout = new LayoutStyleGenerator();
    this.knowledgeBase = new KnowledgeBaseStyleGenerator();
    this.auth = new AuthStyleGenerator();
  }

  createButtonStyles() {
    return this.base.createButtonStyles();
  }

  createInputStyles() {
    return this.base.createInputStyles();
  }

  createModalStyles() {
    return this.base.createModalStyles();
  }

  createIconButtonStyles() {
    return this.base.createIconButtonStyles();
  }

  createIconButtonCursorStyles(disabled: boolean = false) {
    return this.base.createIconButtonCursorStyles(disabled);
  }

  createAvatarStyles() {
    return this.base.createAvatarStyles();
  }

  createNewModelFormStyles() {
    return this.base.createNewModelFormStyles();
  }

  createInteractiveButtonBase() {
    return this.base.createInteractiveButtonBase();
  }

  createCursorStyles() {
    return this.base.createCursorStyles();
  }

  createGlobalAnimationStyles() {
    return this.base.createGlobalAnimationStyles();
  }

  createGlobalResetStyle() {
    return this.base.createGlobalResetStyle();
  }

  createBodyStyle() {
    return this.base.createBodyStyle();
  }

  createScrollbarStyles() {
    return this.base.createScrollbarStyles();
  }

  createScrollableContainer() {
    return this.base.createScrollableContainer();
  }

  createGlobalStyles() {
    return this.base.createGlobalStyles();
  }

  createChatInputStyles() {
    return this.chat.createChatInputStyles();
  }

  createNewChatButtonStyles() {
    return this.chat.createNewChatButtonStyles();
  }

  createChatListStyles() {
    return this.chat.createChatListStyles();
  }

  createMessageListStyles() {
    return this.chat.createMessageListStyles();
  }

  createMessageStyles() {
    return this.chat.createMessageStyles();
  }

  createMessageBubbleStyles() {
    return this.chat.createMessageBubbleStyles();
  }

  createMessageActionsStyles() {
    return this.chat.createMessageActionsStyles();
  }

  createMessageAttachmentCardStyles() {
    return this.chat.createMessageAttachmentCardStyles();
  }

  createChatItemStyles() {
    return this.chat.createChatItemStyles();
  }

  createMarkdownStyles() {
    return this.chat.createMarkdownStyles();
  }

  createModelGridStyles() {
    return this.models.createModelGridStyles();
  }

  createModelContainerStyles() {
    return this.models.createModelContainerStyles();
  }

  createModelItemStyles() {
    return this.models.createModelItemStyles();
  }

  createNewModelsStyles() {
    return this.models.createNewModelsStyles();
  }

  createAppStyles() {
    return this.layout.createAppStyles();
  }

  createSidebarStyles() {
    return this.layout.createSidebarStyles();
  }

  createChatAreaStyles() {
    return this.layout.createChatAreaStyles();
  }

  createToolbarStyles() {
    return this.layout.createToolbarStyles();
  }

  createWindowControlStyles() {
    return this.layout.createWindowControlStyles();
  }

  createDocumentItemStyles() {
    return this.knowledgeBase.createDocumentItemStyles();
  }

  

  createFormStyles() {
    return this.auth.createFormStyles();
  }


}

export const componentStyles = new ComponentStyleGenerator();
