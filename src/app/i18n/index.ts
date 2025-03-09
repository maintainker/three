import appOption from "../appOption";
import { languages } from "../util/constance";

class I18n {
  #currentLang: null | string = null;
  #translations = null;
  static instance: I18n | null = null;
  constructor() {
    if (I18n.instance) {
      return I18n.instance;
    }
    I18n.instance = this;
  }
  #getStorageOption(): typeof appOption | null {
    const option = localStorage.getItem("appOption");
    console.log(option);
    return option ? JSON.parse(option) : null;
  }
  #setStorageOption(option: typeof appOption) {
    localStorage.setItem("appOption", JSON.stringify(option));
  }

  #initStorageOption() {
    let option = this.#getStorageOption();
    let bMustSave = true;

    if (option) {
      if (option.version === appOption.version) {
        option = appOption;
      } else if (option.lang !== this.getCurrentLang()) {
        this.#currentLang = appOption.lang;
      } else {
        bMustSave = false;
      }
    } else {
      option = appOption;
    }

    if (bMustSave) {
      this.#setStorageOption(option);
    }
  }

  getCurrentLang(): string {
    if (this.#currentLang) return this.#currentLang;
    const option = this.#getStorageOption();
    this.#currentLang = option
      ? option.lang
      : navigator.language || appOption.lang;
    return this.#currentLang;
  }

  async #fetchTranslation(currentLang: string) {
    const response = await fetch(
      languages[currentLang as keyof typeof languages]
    );
    if (!response.ok) {
      throw new Error("Failed to fetch load translations");
    }
    return await response.json();
  }

  async #loadTranslations() {
    try {
      this.#translations = await this.#fetchTranslation(
        this.#currentLang || appOption.lang
      );
    } catch (error) {
      console.error(error);
    }
  }

  getLangs = () => Object.keys(languages);
  getTanslations = () => this.#translations;

  async init() {
    this.#initStorageOption();
    this.getCurrentLang();
    await this.#loadTranslations(); // 서버에서 가져올 경우 가정
  }
}
let i18nInstance: I18n | null = null;

export async function getI18N() {
  if (!i18nInstance) {
    i18nInstance = new I18n();
    await i18nInstance.init();
    Object.freeze(i18nInstance);
    return i18nInstance;
  }
}
