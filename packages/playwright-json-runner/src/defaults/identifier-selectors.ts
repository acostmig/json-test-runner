
//xpaths used to find locators (input to be replaced with the identifier property of json)

const identifierSelectors: string[] = [
    "//button[contains(@class, 'dropdown') and @id='{input}' and following-sibling::ul[.//button]]/..",
    "//button[@id='{input}']",
    "//*[@id='{input}']",
    "//label[text()='{input}']/following-sibling::input[@type='radio']",
    "//label[text()='{input}']/following-sibling::input[@type='checkbox']",
    "//button[normalize-space(text())='{input}']",
    "//button[.//*[normalize-space(text())='{input}']]",
    "//a[.//*[normalize-space(text())='{input}']]",
    "//a[normalize-space(text())='{input}']",
    "//button[@data-id='{input}']",
    "//*[@aria-label='{input}']",
    "//label[normalize-space(text())='{input}']/following-sibling::input",
    "//*[@name='{input}']",
    "//*[@title='{input}']",
];

 export default identifierSelectors;