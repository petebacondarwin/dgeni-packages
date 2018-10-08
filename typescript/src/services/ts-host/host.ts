import * as ts from 'typescript';
import {getContent, nodeToString} from '../TsParser';

/**
 * Host that will be used for TypeScript AST operations that should be configurable or shared
 * across multiple doc types.
 */
export class Host {

  /** Whether multiple leading comments for a TypeScript node should be concatenated. */
  concatMultipleLeadingComments: boolean = true;

  /* tslint:disable:no-bitwise
  /** The format to use when serializing a type to a string. */
  typeStringFormat: ts.TypeFormatFlags = ts.TypeFormatFlags.NoTruncation |
                                         ts.TypeFormatFlags.MultilineObjectLiterals |
                                         ts.TypeFormatFlags.UseFullyQualifiedType;

  getContent(declaration: ts.Declaration) {
    return getContent(declaration, this.concatMultipleLeadingComments);
  }

  getTypeText(checker: ts.TypeChecker, node: ts.Node): string {
    let typeString: string;
    if (node.parent && ts.isTypeAliasDeclaration(node.parent)) {
      typeString = nodeToString(node);
    } else if ((node as any).type && ts.isTypeNode((node as any).type)) {
      typeString = checker.typeToString(checker.getTypeFromTypeNode((node as any).type), node.parent, this.typeStringFormat);
    } else {
      typeString = checker.typeToString(checker.getTypeAtLocation(node), node.parent, this.typeStringFormat);
    }

    // Remove `import` namespacing.
    // This is caused by the `UseFullyQualifiedType` flag but we need that flag to ensure that we don't strip things like
    // `angular.IDirective`.
    return typeString.replace(/import\("[^"]+"\)\./g, '');
  }

  getTypeParameters(checker: ts.TypeChecker, declaration: ts.Declaration) {
    const typeParameters = (declaration as any).typeParameters as ts.TypeParameterDeclaration[]|undefined;
    return typeParameters && typeParameters.map(typeParameter => this.getTypeText(checker, typeParameter));
  }

  getTypeParametersText(checker: ts.TypeChecker, declaration: ts.Declaration) {
    const typeParameters = this.getTypeParameters(checker, declaration);
    return typeParameters ? `<${typeParameters.join(', ')}>` : '';
  }
}
