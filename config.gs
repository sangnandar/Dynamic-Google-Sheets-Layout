/*******************************************************
 **        GLOBAL VARIABLES AND CONFIGURATIONS        **
 *******************************************************/

const DEBUG = true; // set to false for production

var ui; // return null if called from script editor
try {
  ui = SpreadsheetApp.getUi();
} catch (e) {
  Logger.log('You are using script editor.');
}
const ss = SpreadsheetApp.getActiveSpreadsheet();

// === START: Configuration for Sheets ===

// Sheet: 'Orders'
const sheetName_Orders = DEBUG
  ? 'Orders_dev' // for development & debugging
  : 'Orders'; // for production

// Sheet: <add more sheets...>

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

  // <add more sheets...>
});

// === END: Configuration for Sheets ===
