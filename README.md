# 📊 Dynamic Google Sheets Layout

## 🧭 Overview

This project provides a maintainable way to reference spreadsheet columns by name using configuration objects and a utility class, preventing bugs when columns are reordered.

📋 Consider this Sheets layout:

[layout image without Sales Rep]

You want to do something like this:

```js
const rowIndex = 3;
const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0]; // get row's data

const orderDate = new Date(rowData[2]); // Order Date
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

if (orderDate < oneMonthAgo) {
  const message = `Pay attention to order ${rowData[1]} at row ${rowIndex}.`;
  sendNotification(message); // send notification to slack/telegram/email/etc
}
```

🛠️ Later, due to a business requirement, you insert a new column `Sales Rep` right after `Order ID`.

[layout image with Sales Rep]

💥 Suddenly... your code breaks:

```js
const orderDate = new Date(rowData[2]); // is now Sales Rep
```

## 🧩 Solution

This solution implements:

### 🔧 Configuration Object

  ```js
  const sheetConfig = readOnlyObject({
    [sheetName_Orders]: {
      headerRows: 1,
      variableNames: {
        orderStatus           : { col: 'A',  type: 'string' },
        orderId               : { col: 'B',  type: 'string' }, // unique ID
        orderDate             : { col: 'C',  type: 'date'   },
        clientName            : { col: 'D',  type: 'string' },
        product               : { col: 'E',  type: 'string' },
        qty                   : { col: 'F',  type: 'number' },
        price                 : { col: 'G',  type: 'number' },
        total                 : { col: 'H',  type: 'number' }
      }
    }
  });
  ```

### 🧱 `SheetLayout` Class

  ```js
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
  ```


## 🛠️ Implementation

The code

```js
const sheetLayout = new SheetLayout(sheet);
const dataMap = sheetLayout.getDataMap();

const rowIndex = 3;
const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0]; // get row's data

const orderDate = new Date(rowData[dataMap.orderDate]); // Order Date
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

if (orderDate < oneMonthAgo) {
  const message = `Pay attention to order ${rowData[dataMap.orderId]} at row ${rowIndex}.`;
  sendNotification(message); // send notification to slack/telegram/email/etc
}
```

🎯 Need to add Sales Rep after Order ID? Just update the config:

  ```js
  const sheetConfig = readOnlyObject({
    [sheetName_Orders]: {
      headerRows: 1,
      variableNames: {
        orderStatus           : { col: 'A',  type: 'string' },
        orderId               : { col: 'B',  type: 'string' }, // unique ID
        salesRep              : { col: 'C',  type: 'string' },
        orderDate             : { col: 'D',  type: 'date'   },
        clientName            : { col: 'E',  type: 'string' },
        product               : { col: 'F',  type: 'string' },
        qty                   : { col: 'G',  type: 'number' },
        price                 : { col: 'H',  type: 'number' },
        total                 : { col: 'I',  type: 'number' }
      }
    }
  });
  ```

And you're done. ✅ No code refactoring needed.

## 💡 Another Use Case

The `SheetLayout` class goes beyond just mapping columns—it helps you write safer, cleaner Apps Script code.

### 🧮 Detect if the sheet has data (excluding headers)

Instead of hardcoding the number of header rows, you can use getHeaderRowCount()—which respects the configuration you've already defined:

```js
const sheetLayout = new SheetLayout(sheet);
const headerRowCount = sheetLayout.getHeaderRowCount();

if (sheet.getLastRow() === headerRowCount) return; // sheet contains no data
const data = sheet.getDataRange().getValues().slice(headerRowCount); // exclude header
```

This avoids magic numbers and makes your logic resilient to layout changes. Just update the config—no need to touch the code that reads the data.

### ✍️ Write to a specific cell using column names

No more brittle column indexes:

```js
const sheetLayout = new SheetLayout(sheet);
const dataConfig = sheetLayout.getDataConfig();

sheet.getRange(`${dataConfig.clientName.col}${rowIndex}`).setValue('Alice Johnson');
```

Readable, robust, and ready for layout updates.

## ✅ Benefits

- 🔄 No need to refactor code when columns are added or reordered.
- 🧠 Human-readable configuration.
- 🗂 Centralized layout definitions.
- ✨ Clean separation of logic from structure.
