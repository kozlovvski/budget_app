// Boundary rules from architecture §5.1 and §4.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      // Type-only cycles are erased at build time; TanStack's routeTree.gen.ts has one by design.
      from: {},
      to: { circular: true, viaOnly: { dependencyTypesNot: ['type-only'] } },
    },
    {
      name: 'domain-framework-free',
      comment:
        'The domain imports no framework, ORM or queue code, and nothing from its own application/ or infrastructure/.',
      severity: 'error',
      from: { path: '^apps/api/src/modules/([^/]+)/domain/' },
      to: {
        path: [
          '(^|node_modules/)(@nestjs/|@mikro-orm/|bullmq(/|$))',
          '^apps/api/src/modules/$1/(application|infrastructure)/',
        ],
      },
    },
    {
      name: 'application-not-infrastructure',
      comment: 'Dependency rule: application/ depends on ports, never on infrastructure/.',
      severity: 'error',
      from: { path: '^apps/api/src/.*/application/' },
      to: { path: '^apps/api/src/.*/infrastructure/' },
    },
    {
      name: 'no-other-module-infrastructure',
      comment:
        "A module never reaches into another module's infrastructure/, so it can't touch that module's tables.",
      severity: 'error',
      from: { path: '^apps/api/src/modules/([^/]+)/' },
      to: {
        path: '^apps/api/src/modules/[^/]+/infrastructure/',
        pathNot: '^apps/api/src/modules/$1/',
      },
    },
    {
      name: 'web-not-api',
      comment: 'The web app talks to the api only through @budget/api-client.',
      severity: 'error',
      from: { path: '^apps/web/' },
      to: { path: '^apps/api/' },
    },
  ],
  options: {
    exclude: { path: '(^|/)(dist|\\.output)/' },
    doNotFollow: { path: 'node_modules' },
    // Type-only imports count too: a domain file importing a Nest type is still coupled to Nest.
    tsPreCompilationDeps: true,
    // shortcut: depcruise takes one tsconfig and only apps/web defines paths (@/*); give it a root tsconfig with every workspace's paths once another workspace adds aliases.
    tsConfig: { fileName: require('node:path').join(__dirname, 'apps/web/tsconfig.json') },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
    },
  },
};
