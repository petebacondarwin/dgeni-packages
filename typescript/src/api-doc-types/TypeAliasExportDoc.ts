import { Declaration, Symbol, SyntaxKind, TypeAliasDeclaration } from 'typescript';
import { Host } from '../services/ts-host/host';
import { ModuleDoc } from './ModuleDoc';
import { ParameterizedExportDoc } from './ParameterizedExportDoc';

export class TypeAliasExportDoc extends ParameterizedExportDoc {
  docType = 'type-alias';
  typeDefinition = this.host.getTypeText(this.typeChecker, (this.declaration as TypeAliasDeclaration).type);

  constructor(host: Host,
              moduleDoc: ModuleDoc,
              exportSymbol: Symbol,
              aliasSymbol?: Symbol) {

    super(host, moduleDoc, exportSymbol, getTypeAliasDeclaration(exportSymbol.getDeclarations()!),
        aliasSymbol);
  }
}

function getTypeAliasDeclaration(declarations: Declaration[]) {
  return declarations.find(declaration => declaration.kind === SyntaxKind.TypeAliasDeclaration)!;
}
