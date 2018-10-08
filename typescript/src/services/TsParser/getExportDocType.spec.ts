import { TsParser } from '.';
import { getExportDocType } from './getExportDocType';
const path = require('canonical-path');

describe('getExportDocType', () => {
  let parser: TsParser;
  let basePath: string;
  beforeEach(() => {
    parser = new TsParser(require('dgeni/lib/mocks/log')(false));
    basePath = path.resolve(__dirname, '../../mocks');
  });

  it('should return the accessibility of class members', () => {
    const parseInfo = parser.parse(['tsParser/getExportDocType.test.ts'], basePath);

    const moduleExports = parseInfo.moduleSymbols[0].exportArray;
    expect(getExportDocType(getExport('TestInterface'))).toEqual('interface');
    expect(getExportDocType(getExport('TestClass'))).toEqual('class');
    expect(getExportDocType(getExport('testFunction'))).toEqual('function');
    expect(getExportDocType(getExport('testEnum'))).toEqual('enum');
    expect(getExportDocType(getExport('testLet'))).toEqual('let');
    expect(getExportDocType(getExport('testConst'))).toEqual('const');
    expect(getExportDocType(getExport('TestType'))).toEqual('type-alias');

    function getExport(name: string) {
      return moduleExports.find(e => e.name === name)!;
    }
  });
});
