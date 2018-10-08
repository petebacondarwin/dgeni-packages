import {Dgeni, DocCollection} from 'dgeni';
import {Injector} from 'dgeni/lib/Injector';
import {ClassExportDoc} from '../api-doc-types/ClassExportDoc';
import {ReadTypeScriptModules} from '../processors/readTypeScriptModules';
import {convertPrivateClassesToInterfaces} from './convertPrivateClassesToInterfaces';
const mockPackage = require('../mocks/mockPackage');
const path = require('canonical-path');

describe('convertPrivateClassesToInterfaces', () => {
  let dgeni: Dgeni;
  let injector: Injector;
  let processor: ReadTypeScriptModules;
  let docs: DocCollection;
  let someClass: ClassExportDoc;

  beforeEach(() => {
    docs = [];
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('readTypeScriptModules');
    processor.basePath = path.resolve(__dirname, '../mocks/convertPrivateClassesToInterfaces');
    processor.sourceFiles = ['index.ts'];
    processor.$process(docs);
    someClass = docs.find(d => d.name === 'SomeClass')!;
  });

  it('should convert private class docs to interface docs', () => {
    (someClass.constructorDoc as any).internal = true;
    convertPrivateClassesToInterfaces(docs, false);
    expect(someClass.docType).toEqual('interface');
  });

  it('should not touch non-private class docs', () => {
    (someClass.constructorDoc as any).internal = false;
    convertPrivateClassesToInterfaces(docs, false);
    expect(someClass.docType).toEqual('class');
  });

  it('should convert the heritage since interfaces use `extends` not `implements`', () => {
    (someClass.constructorDoc as any).internal = true;
    const implementsClauses = someClass.implementsClauses;
    expect(someClass.extendsClauses).toEqual([]);
    convertPrivateClassesToInterfaces(docs, false);
    expect(someClass.extendsClauses).toEqual(implementsClauses);
    expect(someClass.implementsClauses).toEqual([]);
  });

  it('should add new injectable reference types, if specified, to the passed in collection', () => {
    (someClass.constructorDoc as any).internal = true;
    convertPrivateClassesToInterfaces(docs, true);
    const extraConst = docs.find(d => d.docType === 'const');
    expect(extraConst.docType).toEqual('const');
    expect(extraConst.id).toEqual('index/SomeClass');
    expect(extraConst.name).toEqual('SomeClass');
    expect(extraConst.type).toEqual('InjectableReference');
  });
});
