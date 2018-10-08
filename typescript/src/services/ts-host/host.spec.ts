import { Dgeni, Package } from 'dgeni';
import { AugmentedSymbol, TsParser } from '../TsParser';
import { Host } from './host';

const mockPackage = require('../../mocks/mockPackage');
const path = require('canonical-path');
import * as ts from 'typescript';

describe('Host', () => {
  const basePath = path.resolve(__dirname, '../../mocks/tsParser');

  let host: Host;
  let parser: TsParser;

  /**
   * Creates the Host instance through Dgeni dependency injection. Also allows passing a function
   * that will run in Dgeni's configuration lifecycle and allows modifying the host factory.
   */
  function setupTestDgeniInstance(configureFn?: (host: Host) => void) {
    const testPackage = mockPackage() as Package;

    if (configureFn) {
      testPackage.config((tsHost: Host) => configureFn(tsHost));
    }

    const dgeni = new Dgeni([testPackage]);
    const injector = dgeni.configureInjector();

    // Load factories from the Dgeni injector.
    host = injector.get('tsHost');
    parser = injector.get('tsParser');
  }

  describe('getContent()', () => {
    it("should read content of a declaration", () => {
      setupTestDgeniInstance(h => h.concatMultipleLeadingComments = true);

      const parseInfo = parser.parse(['multipleLeadingComments.ts'], basePath);
      const module = parseInfo.moduleSymbols[0];
      const declaration = module.exportArray[0].valueDeclaration!;

      expect(host.getContent(declaration))
        .toEqual('Not a license comment.\nThis is a test function');
    });

    it('should be able to disable leading comment concatenation', () => {
      setupTestDgeniInstance(h => h.concatMultipleLeadingComments = false);

      const parseInfo = parser.parse(['multipleLeadingComments.ts'], basePath);
      const module = parseInfo.moduleSymbols[0];
      const declaration = module.exportArray[0].valueDeclaration!;

      expect(host.getContent(declaration)).toEqual('This is a test function');
    });
  });

  describe('getTypeText()', () => {
    it('should return a textual representation of the type the declaration', () => {
      setupTestDgeniInstance();
      const parseInfo = parser.parse(['getDeclarationTypeText.test.ts'], basePath);
      const moduleExports = parseInfo.moduleSymbols[0].exportArray;
      const checker = parseInfo.typeChecker;

      expect(host.getTypeText(checker, getExport(moduleExports, 'testConst').valueDeclaration!)).toEqual('42');
      expect(host.getTypeText(checker, getExport(moduleExports, 'testVar').valueDeclaration!)).toEqual('number');

      const testFunction = getExport(moduleExports, 'testFunction').getDeclarations()![0] as ts.FunctionDeclaration;
      expect(host.getTypeText(checker, testFunction)).toEqual('number');
      expect(host.getTypeText(checker, testFunction.parameters[0])).toEqual('T[]');
      expect(host.getTypeText(checker, testFunction.typeParameters![0])).toEqual('T');

      const testClass = getExport(moduleExports, 'TestClass');
      expect(host.getTypeText(checker, getProp(testClass, 'prop1'))).toEqual('T[]');
      expect(host.getTypeText(checker, getProp(testClass, 'prop2'))).toEqual('OtherClass<T, T>');
      expect(host.getTypeText(checker, getProp(testClass, 'prop3'))).toEqual('OtherClass<T, string>');
      expect(host.getTypeText(checker, getProp(testClass, 'method'))).toEqual('T');

    });

    it('should not truncate type initializers', () => {
      setupTestDgeniInstance();
      const parseInfo = parser.parse(['getDeclarationTypeText.test.ts'], basePath);
      const checker = parseInfo.typeChecker;
      const module = parseInfo.moduleSymbols[0];
      const breakpointDecl = module.exportArray.find(e => e.name === 'Breakpoints')!.valueDeclaration !;
      const typeString = host.getTypeText(checker, breakpointDecl);
      expect(typeString).toEqual('{ XSmall: string; Small: string; Medium: string; Large: string; XLarge: string; Handset: string; Tablet: string; Web: string; HandsetPortrait: string; TabletPortrait: string; WebPortrait: string; HandsetLandscape: string; TabletLandscape: string; WebLandscape: string; }');
    });

    it('should return text representation of types', () => {
      setupTestDgeniInstance();
      const parseInfo = parser.parse(['getTypeText.test.ts'], basePath);
      const moduleExports = parseInfo.moduleSymbols[0].exportArray;
      const checker = parseInfo.typeChecker;

      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestType')))).toEqual('TestClass');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'testFunction')))).toEqual('string');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'testConst')))).toEqual('number');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'testLet')))).toEqual('TestClass');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestUnion')))).toEqual('TestClass | string');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestLiteral')))).toEqual('{\n    x: number;\n    y: string;\n}');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestGeneric1')))).toEqual('Array<string>');
      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestGeneric2')))).toEqual('Array<T>');
    });

    it('should remove comments from the rendered text', () => {
      setupTestDgeniInstance();
      const parseInfo = parser.parse(['getTypeText.test.ts'], basePath);
      const moduleExports = parseInfo.moduleSymbols[0].exportArray;
      const checker = parseInfo.typeChecker;

      expect(host.getTypeText(checker, getType(getExport(moduleExports, 'TestType2')))).toEqual([
        '{',
        '    a: number;',
        '    b: string;',
        '} & {',
        '    a: string;',
        '}',
      ].join('\n'));
    });
  });

  describe('getTypeParamatersText()', () => {
    it('should return text representation of types', () => {
      const parseInfo = parser.parse(['getTypeParametersText.test.ts'], basePath);
      const moduleExports = parseInfo.moduleSymbols[0].exportArray;
      const checker = parseInfo.typeChecker;

      const testFunction = moduleExports[0].getDeclarations()![0];
      expect(host.getTypeParametersText(checker, testFunction)).toEqual('<T, U, V>');

      const testClass = moduleExports[1];
      expect(host.getTypeParametersText(checker, testClass.getDeclarations()![0])).toEqual('<T>');
      expect(host.getTypeParametersText(checker, testClass.members!.get('method' as ts.__String)!.valueDeclaration!)).toEqual('<U>');
    });
  });
});

function getExport(moduleExports: AugmentedSymbol[], name: string) {
  return moduleExports.find(e => e.name === name)!;
}

function getProp(symbol: AugmentedSymbol, propName: string) {
  return symbol.members!.get(propName as ts.__String)!.valueDeclaration!;
}

function getType(symbol: ts.Symbol): ts.TypeNode {
  const decl: any = symbol.declarations![0];
  return decl.type;
}
