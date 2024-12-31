const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'DASHBOARD_UI',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

