import { Declaration, Symbol } from 'typescript';
import { Host } from '../services/ts-host/host';
import { ExportDoc } from './ExportDoc';
import { ModuleDoc } from './ModuleDoc';

export abstract class ParameterizedExportDoc extends ExportDoc {
  typeParameters = this.host.getTypeParametersText(this.typeChecker, this.declaration);

  constructor(host: Host,
              moduleDoc: ModuleDoc,
              symbol: Symbol,
              declaration: Declaration,
              aliasSymbol?: Symbol) {

    super(host, moduleDoc, symbol, declaration, aliasSymbol);
  }
}
