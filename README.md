# Dgeni Packages

This repository contains a collection of Dgeni **Packages** that can be used by the Dgeni documentation
generator to create documentation from source code.


Out of the box there are the following packages:

* base - The minimal set of processors to get started with Dgeni
* git - Provides some git and version information
* jsdoc - Tag parsing and extracting
* nunjucks - The nunjucks template rendering engine. No longer in jsdoc - you must add this
  explicitly to your config or you will get
  `Error: No provider for "templateEngine"! (Resolving: templateEngine)`
* ngdoc - The angular.js specific tag-defs, processors and templates.  This loads the jsdoc and
  nunjucks packages for you.
* examples - Processors to support the runnable examples feature in the angular.js docs site.
* dgeni - Support for documenting Dgeni packages (**incomplete**)
* typescript - Tag parsing and extracting for TypeScript modules.

## `base` Package

### Processors

* `computeIdsProcessor` - Computes the `id` and `aliases` for documents using templates or helper
functions, on a per docType basis.
* `computePathsProcessor` - Computes the `path` and `outputPath` for documents using templates or helper
functions, on a per docType basis.
* `debugDumpProcessor` - dump the current state of the docs array to a file (disabled by default)
* `readFilesProcessor` - used to load up documents from files.  This processor can be configured to use a
set of **file readers**. There are file readers in the `jsdoc` and `ngdoc` packages.
* `renderDocsProcessor` - render the documents into a property (`doc.renderedContent`) using a
`templateEngine`, which must be provided separately - see `nunjucks` package.
* `unescapeCommentsProcessor` - unescape comment markers that would break the jsdoc comment style,
e.g. `*/`
* `writeFilesProcessor` - write the docs that have an `outputPath` to disk

### Services

* `aliasMap` - A map of ids/aliases to docs.  This is used for matching references to documents in
links and relations such as modules and object members.
* `createDocMessage` - a helper for creating nice messages about documents (useful in logging and
errors)
* `encodeDocBlock` - convert a block of code into HTML
* `templateFinder` - search folders using patterns to find a template that matches a given document.
* `trimIndentation` - "intelligently" trim whitespace indentation from the start of each line of a block
of text.
* `writeFile` - Write some contents to a file, ensuring the path to the file exists.


#### Template Finding

The template used to render a doc is computed by the `templateFinder`, which uses the first match
from a set of patterns in a set of folders, provided in the configuration. This allows a lot of control to provide
generic templates for most situations and specific templates for exceptional cases.

Here is an example of some standard template patterns:

```js
templateFinder.templatePatterns = [
  '${ doc.template }',
  '${doc.area}/${ doc.id }.${ doc.docType }.template.html',
  '${doc.area}/${ doc.id }.template.html',
  '${doc.area}/${ doc.docType }.template.html',
  '${ doc.id }.${ doc.docType }.template.html',
  '${ doc.id }.template.html',
  '${ doc.docType }.template.html'
]
```

## `git` Package

This package provides some git and version information to the `renderDocsPocessor` that is available
in the templates. This code as it is was made for the angular.js document generation, including some
custom logic for special versions. However, any of the services can be overridden with custom
behavior.

The git information is made available to templates via the `extraData.git` property. See the section
below to see an example usage.

### Services

* `decorateVersion` - all semvers are passed through this function so that additional data can before
added to them.
* `getPreviousVersions` - pulls versions from git tags of the repository.
* `gitData` - the additional information that is added to the extraData of `renderDocsPocessor`.
* `gitRepoInfo` - the owner and repo of the local git repository.
* `packageInfo` - the contents of the package.json.
* `versionInfo` - aggregated version and git information.

### Using `extraData.git`

An example as used in `git/templates/api/api.template.html`

```html+jinja
<a href='https://github.com/{$ git.info.owner $}/{$ git.info.repo $}/tree/{$ git.version.isSnapshot and 'master' or git.version.raw $}/{$ doc.fileInfo.projectRelativePath $}#L{$ doc.startingLine $}' class='view-source pull-right btn btn-primary'>
  <i class="glyphicon glyphicon-zoom-in">&nbsp;</i>View Source
</a>
```


## `nunjucks` Package

This package provides a nunjucks driven implementation of the `templateEngine` required by the
`base` package `renderDocsPocessor`. The "nunjucks" JavaScript template tool-kit to generates HTML
based on the data in each document. We have nunjucks templates, tags and filters that
can render links and text as markdown and will highlight code.

### Services

* `nunjucks-template-engine` - provide a `templateEngine` that uses the Nunjucks template library
to render the documents into text, such as HTML or JS, based on templates.

## `jsdoc` Package

### File Readers:

* `jsdoc` - can read documents from jsdoc style comments in source code files.

### Processors

* `codeNameProcessor` - infer the name of the document from the code following the document in the source
file.
* `extractTagsProcessor` - use a `tagExtractor` to extract information from the parsed tags.
* `inlineTagsProcessor` - Search the docs for inline tags that need to have content injected
* `parseTagsProcessor` - use a `tagParser` to parses the jsdoc tags in the document content.

### Tag Definitions

The `jsdoc` package contains definitions for a number of standard jsdoc tags including: `name`,
`memberof`, `param`, `property`, `returns`, `module`, `description`, `usage`,
`animations`, `constructor`, `class`, `classdesc`, `global`, `namespace`, `method`, `type`,
`kind`, `access`, `public`, `private` and `protected`.

### Services (Tag Transformations)

This package provides a number of **Transform** services that are used in **Tag Definitions** to transform
the value of the tag from the string in the tag description to something more meaningful in the doc.

* `extractAccessTransform` - extract an access level (e.g. public, protected, private) from tags
  You can configure this transform to register access tags and set the property where access info is written.
  * `extractAccessTransform.allowedTags.set('tagName', [propertValue])` - register a tag that can act as
    as an alias to set an access level. The propertyValue is optional and if not undefined will return this
    value from the transform that will be written to the property. (defaults to `public:undefined`,
    `private:undefined`, `protected:undefined`)
  * `extractAccessTransformImpl.allowedDocTypes.set('docType')` - register a docType that can contain access
    type tags (defaults to "property" and "method")
  * `extractAccessTransformImpl.accessProperty` - specify the property to which to write the access value
    (defaults to "access")
  * `extractAccessTransformImpl.accessTagName` - specify the name of the tag that can hold access values
    (defaults to "access")
* `extractNameTransform` - extract a name from a tag
* `extractTypeTransform` - extract a type from a tag
* `trimWhitespaceTransform` - trim whitespace from before and after the tag value
* `unknownTagTransform` - add an error to the tag if it is unknown
* `wholeTagTransform` - Use the whole tag as the value rather than using a tag property
* `codeNameService` - helper service for `codeNameProcessor`, registers code name matchers and performs
 actual matches against AST tree

### Templates

**This package does not provide any templates nor a `templateEngine` to render templates (use the
`nunjucks` package to add this).**

### Tag Definitions

This package provides a minimal implementation of tags from the JSDoc project. They extract the name
and type from the tag description accordingly but do not fully implement all the JSDoc tag functionality.

### Code Name Matchers
Matcher performs a search for a suitable code name at the given jsdoc code point (AST node).
`codeNameService` matches AST node name against matcher name and if suitable matcher is found, executes it.

Matcher name consists of `<AstNodeName>` and `NodeMatcher` substrings, i.e. `FunctionExpressionNodeMatcher`
then latter is stripped and matcher is used by the former part, i.e. `FunctionExpression`.

Matcher should accept single argument - node and return either string with name or literal `null`.

Matchers:
* `ArrayExpression`
* `ArrowFunctionExpression`
* `AssignmentExpression`
* `CallExpression`
* `ClassDeclaration`
* `ExportDefaultDeclaration`
* `ExpressionStatement`
* `FunctionDeclaration`
* `FunctionExpression`
* `Identifier`
* `Literal`
* `MemberExpression`
* `MethodDefinition`
* `NewExpression`
* `ObjectExpression`
* `Program`
* `Property`
* `ReturnStatement`
* `ThrowStatement`
* `VariableDeclaration`
* `VariableDeclarator`

## `ngdoc` Package

The `ngdoc` Package depends upon the `jsdoc` and `nunjucks` packages. It provides additional support for
non-API documents written in files with `.ngdoc` extension; it also computes additional properties specific
to Angular related code.

## File Readers

* `ngdoc` - can pull a single document from an ngdoc content file.

### Processors

* `filterNgdocsProcessor` -
For AngularJS we are only interested in documents that contain the @ngdoc tag.  This processor
removes docs that do not contain this tag.

* `generateComponentGroupsProcessor` -
Generate documents for each group of components (by type) within a module

* `memberDocsProcessor` - This processor connects docs that are members (properties, methods and events) to
their container docs, removing them from the main docs collection.

* `moduleDocsProcessor` - This processor computes properties for module docs such as `packageName` and
`packageFileName`; it adds modules to the `moduleMap` service and connects all the docs that are in a module
to the module doc in the `components` property

* `providerDocsProcessor` - This processor relates documents about angular services to their corresponding
provider document.


### Tag Definitions

This package modifies and adds new tag definitions on top of those provided by the `jsdoc` package:
`area`, `element`, `eventType`, `example`, `fullName`, `id`, `module`, `name`, `ngdoc`, `packageName`,
`parent`, `priority`, `restrict`, `scope` and `title`.


### Inline Tag Definitions

* `link` - Process inline link tags (of the form {@link some/uri Some Title}), replacing them with
HTML anchors


### Services

* `getAliases()` - Get a list of all the aliases that can be made from the provided doc
* `getDocFromAliases()` - Find a document from the `aliasMap` that matches the given alias
* `getLinkInfo()` - Get link information to a document that matches the given url
* `getTypeClass()` - Get a CSS class string for the given type string
* `moduleMap` - A collection of modules keyed on the module id

### Templates

This package provides a set of templates for generating an HTML file for each document: api,
directive, error, filter function, input, module, object, overview, provider, service, type and a
number to support rendering of the runnable examples.

You should be aware that because of the overlap in syntax between Nunjucks bindings and AngularJS
bindings, the ngdoc package changes the default Nunjucks binding tags:

```js
templateEngine.config.tags = {
  variableStart: '{$',
  variableEnd: '$}'
};
```

### Rendering Filters

* `code` - Render a span of text as code
* `link` - Render a HTML anchor link
* `typeClass` - Render a CSS class for a given type

### Rendering Tags

* `code` - Render a block of code


## `examples` Package

This package is a mix-in that provides functionality for working with examples in the docs.

Inside your docs you can markup inline-examples such as:

```
Some text before the example

<example name="example-name">
  <file name="index.html">
    <div>The main HTML for the example</div>
  </file>
  <file name="app.js">
    // Some JavaScript code to be included in the example
  </file>
</example>

Some text after the example
```


### Processors

* `generateExamplesProcessor` - Add new docs to the docs collection for each example in the `examples` service
that will be rendered as files that can be run in the browser, for example as live in-place demos of the
examples or for e2e testing. This processor must be configured with a collection of deployments that tell it
what versions of each example to generate. See the section of **Deployment Configuration** below.
* `parseExamplesProcessor` - Parse the `<example>` tags from the content and add them to the `examples` service
* `generateProtractorTestsProcessor` - Generate a protractor test files from the e2e tests in the examples. This processor
must be configured with a collection of deployments that tell versions of the protractor tests to generate. See the
section of **Deployment Configuration** below.

#### Deployment Configuration

The `generateExamplesProcessor` and `generateProtractorTestsProcessor` processors have a *required* property called `deployments`.
This property should be an array of deployment information objects telling the processor what files to generate.

For instance you might have a "debug" deployment that loads angular.js into the example, and also a "default" deployment that
loads angular.min.js into the example. Equally you might have deployments that use JQuery and some that only use Angular's
jqLite.

You can configure this in your package like so:

```js
.config(function(generateExamplesProcessor, generateProtractorTestsProcessor) {
  var deployments = [
    { name: 'debug', ... },
    { name: 'default', ... }
  ];

  generateExamplesProcessor.deployments = deployments;
  generateProtractorTestsProcessor.deployments = deployments;
});
```

A deployment can must have a `name` property and can also include an `examples` property that contains
information about paths and extra files to inject into runtime examples.
Further a protractor test is generated for each deployment and it uses the deployment name to find the
path to the associated example for that deployment.

```js
{
  name: 'default',
  examples: {
    commonFiles: {
      scripts: [ '../../../angular.js' ]
    },
    dependencyPath: '../../../'
  }
}
```

Here you can see we have a `default` deployment that injects the `angular.js` file into all examples,
plus any dependencies referenced in the example itself are made relative to the given `dependencyPath`.

### Inline Tag Definitions

* `runnableExample` - Inject the specified runnable example into the doc


### Services

* `exampleMap` - a hash map holding each example by id, which is a unique id generated from the name
of the example


## `typescript` Package

### File Readers:

* at the moment we are not using a filereader but the `readTypeScriptModules` processor to read our modules.

### Processors

* `readTypeScriptModules` - parse the `sourceFiles` with the help of the `tsParser` service and return a doc
for each exported member. You can either pass an array of strings or an array of objects with `include` and
`exclude` globbing patterns. A mix of both is possible as well.
The processor can be configured to export private
members (marked as `/** @internal */` as well as members starting with an underscore (`_`)) by setting the property
`hidePrivateMembers` to `false`.
Set `sortClassMembers` to `true` to sort instance and static members by name (defaults to order of appearence).
You can ignore special exports by adding strings or regexes to the `ignoreExportsMatching` property (defaults to
`___esModule`.

### Services

* `convertPrivateClassesToInterfaces` - pass this service a list of exported docs and if it represents a
class that is marked as `/** @internal */` the doc will be converted to represent an interface.
* `tsParser` - uses the typescript compiler and a host created by `createCompilerHost` to actually read
and compile the source files. The docs are created from the symbols read by the typescript program.
* `createCompilerHost` - creates a new compiler host which can, among other things, resolve file paths and
check if files exist
* `getContent` - retrieves the file contents and comments.

### Templates

**This package does not provide any templates nor a `templateEngine` to render templates (use the
`nunjucks` package to add this).**

### Tag Definitions
Please note that at the moment the `@param` documentation is ignored.
