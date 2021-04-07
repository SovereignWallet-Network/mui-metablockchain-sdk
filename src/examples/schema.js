const { createVC, signVC, verifyVC } = require('../vc.js');
const { buildConnection } = require('../connection.js');
const { initKeyring } = require('../config');

const POSITIVE_TEST = "0x15733EA25E1C3A1A8F2330D1B64E80B765971A370653943DB57A2099EF0EDF1F";
const NEGATIVE_TEST = "0x15733EA25E1C3A1A8F2330D1B64E80B765971A370653943DB57A2099EF0EDF1Z";

async function doesSchemaExist(schemaHash) {
    let provider = await buildConnection('dev');
    let result = await (await provider.query.schema.sCHEMA(schemaHash)).toJSON();
    console.log(result);
  }

doesSchemaExist(NEGATIVE_TEST);
doesSchemaExist(POSITIVE_TEST);