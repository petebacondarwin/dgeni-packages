import * as ts from 'typescript';
import { Host } from '../services/ts-host/host';
import { nodeToString } from '../services/TsParser';
import { ContainerExportDoc } from './ContainerExportDoc';
import { ModuleDoc } from './ModuleDoc';

/**
 * Enum docs contain members and can have multiple declaration, which are merged,
 * but they cannot have decorators or type parameters
 */
export class EnumExportDoc extends ContainerExportDoc {
  docType = 'enum';
  additionalDeclarations: ts.Declaration[] = [];
  constructor(host: Host,
              moduleDoc: ModuleDoc,
              symbol: ts.Symbol,
              aliasSymbol?: ts.Symbol) {
    super(host, moduleDoc, symbol, symbol.valueDeclaration!, aliasSymbol);

    this.additionalDeclarations = symbol.getDeclarations()!.filter(declaration => declaration !== this.declaration);
    if (symbol.exports) {
      this.members = this.getMemberDocs(symbol.exports, true);
      this.members.forEach(member => {
        if (ts.isEnumMember(member.declaration) && member.declaration.initializer) {
          // For enums we are interested in the value of the property not its type
          member.type = nodeToString(member.declaration.initializer);
        } else {
          member.type = '';
        }
      });
    }
  }
}
