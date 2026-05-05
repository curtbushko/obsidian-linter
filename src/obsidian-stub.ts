/**
 * Stub/shim for Obsidian API when running in CLI mode
 * Provides minimal implementations needed for the linter to work outside of Obsidian
 */

import moment from 'moment';

// Export moment for compatibility
export {moment};

// Stub for getLanguage - returns default English
export function getLanguage(): string {
  return 'en';
}

// Stub for App class - not used in CLI
export class App {}

// Stub for TFile - CLI uses a mock object instead
export class TFile {
  basename!: string;
  path!: string;
  stat!: {
    ctime: number;
    mtime: number;
  };
}

// UI Component stubs
export class Setting {
  constructor(containerEl: HTMLElement) {}
  setName(name: string): this {
    return this;
  }
  setDesc(desc: string): this {
    return this;
  }
  addToggle(cb: (toggle: any) => void): this {
    return this;
  }
  addText(cb: (text: any) => void): this {
    return this;
  }
  addDropdown(cb: (dropdown: any) => void): this {
    return this;
  }
}

export class Modal {}
export class Scope {}
export class ToggleComponent {}
export class ExtraButtonComponent {}
export interface ISuggestOwner<T> {}

// Other Obsidian exports that might be referenced but aren't used in CLI
export class Plugin {}
export class Editor {}
export class EventRef {}
export class MarkdownView {}
export class Menu {}
export class Notice {}
export class TAbstractFile {}
export class TFolder {}
export class MarkdownFileInfo {}
export class EditorSelection {}
export class EditorChange {}
export class Debouncer<T extends any[]> {}

export function addIcon(id: string, svg: string): void {}
export function htmlToMarkdown(html: string): string {
  return html;
}
export function normalizePath(path: string): string {
  return path;
}
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
