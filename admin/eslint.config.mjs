// ioBroker eslint template configuration file for js and ts files
// Please note that esm or react based modules need additional modules loaded.
import config, { reactConfig } from '@iobroker/eslint-config';

export default [
    ...config,
    ...reactConfig,

    {
        // specify files to exclude from linting here
        ignores: ['admin/src/types/GenericApp.d.ts', 'admin/src/types/app.d.ts'],
    },

    {
        // you may disable some 'jsdoc' warnings - but using jsdoc is highly recommended
        // as this improves maintainability. jsdoc warnings will not block build process.
        rules: {
            'jsdoc/require-jsdoc': 'off',
            'import/extensions': ['error', 'never', { ts: 'never', tsx: 'never', json: 'always', 'd.ts': 'always' }],
        },
    },
];
