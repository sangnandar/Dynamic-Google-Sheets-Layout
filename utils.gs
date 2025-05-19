/*******************************************************
 **       UTILITY AND HELPER CLASSES/FUNCTIONS        **
 *******************************************************/

class SheetLayout
{
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to wrap.
   */
  constructor(sheet)
  {
    this.sheet = sheet;
    this.sheetName = sheet.getName();
  }

  /**
   * Get the number of header rows configured for the sheet.
   * 
   * @returns {number} Number of header rows.
   */
  getHeaderRowCount()
  {
    const config = sheetConfig[this.sheetName];
    return config?.headerRows ?? 0; // default is 0
  }

  /**
   * Get the data configuration object for the sheet.
   * 
   * @returns {Object<string, { col: string, type: string }>} Variable-name definitions.
   */
  getDataConfig()
  {
    const config = sheetConfig[this.sheetName];
    return config?.variableNames ?? {};
  }

  /**
   * Get a map of variable-names to column-indexes.
   * 
   * @returns {Object<string, number>} Variable-name to column-index.
   */
  getDataMap()
  {
    const dataConfig = this.getDataConfig();
    return Object.fromEntries(
      Object.entries(dataConfig).map(
        ([key, { col }]) => [key, getColumnIndexFromLetter(col)]
      )
    );
  }
}

/**
 * Applicable for both single and multi-letters column (e.g., 'A', 'AA').
 * 
 * @param {string} columnLetter 
 * @returns {number}
 */
function getColumnIndexFromLetter(columnLetter)
{
  return columnLetter.toUpperCase()
    .split('') // Split into an array of characters
    .reduce((total, char) => 
      total * 26 + (char.charCodeAt(0) - 64) // Base-26 math
    , 0);
}

/**
 * Deep freezes an object, making it read-only (including nested objects).
 * 
 * @param {object} obj - The object to freeze.
 * @returns {object} The deeply frozen object.
 */
function readOnlyObject(obj)
{
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = obj[prop];
    if (typeof value === 'object' && value !== null) {
      readOnlyObject(value); // recursively freeze nested objects
    }
  });

  return Object.freeze(obj);
}
